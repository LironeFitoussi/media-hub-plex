import axios from "axios";
import fs from "fs";
import path from "path";
import DownloadModel from "../models/download.model.js";
import { searchMovie } from "./tmdb.service.js";

const ONEFICHIER_API_KEY = process.env.ONEFICHIER_API_KEY;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "./downloads";

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

interface OneFichierTokenResponse {
    status: string;
    url: string;
    filename?: string;
}

/**
 * Gets a temporary download token from 1fichier API
 */
async function getDownloadToken(fileUrl: string): Promise<OneFichierTokenResponse> {
    if (!ONEFICHIER_API_KEY) {
        throw new Error("ONEFICHIER_API_KEY is not configured");
    }

    const response = await axios.post<OneFichierTokenResponse>(
        "https://api.1fichier.com/v1/download/get_token.cgi",
        { url: fileUrl },
        {
            headers: {
                Authorization: `Bearer ${ONEFICHIER_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (response.data.status !== "OK") {
        throw new Error(`1fichier API error: ${response.data.status}`);
    }

    return response.data;
}

/**
 * Extracts filename from Content-Disposition header or URL
 */
function extractFilenameFromHeaders(headers: any, url: string): string | null {
    // Try Content-Disposition header first
    const contentDisposition = headers["content-disposition"];
    if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
            return match[1].replace(/['"]/g, "");
        }
    }

    // Try to extract from URL
    try {
        const urlPath = new URL(url).pathname;
        const urlFilename = urlPath.split("/").pop();
        if (urlFilename && urlFilename.length > 0) {
            return decodeURIComponent(urlFilename);
        }
    } catch (e) {
        // Invalid URL, ignore
    }

    return null;
}

/**
 * Downloads a file and tracks progress in the database
 */
async function downloadFile(downloadId: string, downloadUrl: string, suggestedFileName: string): Promise<void> {
    let filePath: string | undefined;
    
    try {
        const response = await axios.get(downloadUrl, {
            responseType: "stream",
            timeout: 0, // No timeout for large files
        });

        // Try to get the actual filename from response headers
        const actualFileName = extractFilenameFromHeaders(response.headers, downloadUrl) || suggestedFileName;
        
        // Sanitize filename
        const sanitizedFileName = actualFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        
        filePath = path.join(DOWNLOAD_DIR, sanitizedFileName);
        const fileStream = fs.createWriteStream(filePath);

        // Search for movie metadata on TMDB
        console.log(`🎬 Searching TMDB for movie metadata...`);
        const movieMetadata = await searchMovie(sanitizedFileName);

        // Update filename and movie metadata in database
        await DownloadModel.findByIdAndUpdate(downloadId, {
            fileName: sanitizedFileName,
            movieMetadata: movieMetadata || undefined,
        });

        const totalBytes = parseInt(response.headers["content-length"] || "0", 10);
        let downloadedBytes = 0;
        let lastUpdateProgress = 0;

        response.data.on("data", async (chunk: Buffer) => {
            downloadedBytes += chunk.length;

            // Update progress every 5% to avoid too many DB writes
            if (totalBytes > 0) {
                const currentProgress = Math.round((downloadedBytes / totalBytes) * 100);
                if (currentProgress >= lastUpdateProgress + 5 || currentProgress === 100) {
                    lastUpdateProgress = currentProgress;
                    await DownloadModel.findByIdAndUpdate(downloadId, {
                        progress: currentProgress,
                    });
                }
            }
        });

        response.data.pipe(fileStream);

        // Wait for stream to finish
        await new Promise<void>((resolve, reject) => {
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
            response.data.on("error", reject);
        });

        // Mark as done
        await DownloadModel.findByIdAndUpdate(downloadId, {
            status: "DONE",
            progress: 100,
            filePath: filePath,
        });

        console.log(`✅ Download completed: ${sanitizedFileName}`);
    } catch (error) {
        // Clean up partial file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        throw error;
    }
}

/**
 * Starts the entire download process asynchronously
 * This function doesn't need to be awaited - it runs in the background
 */
export async function startDownload(downloadId: string): Promise<void> {
    try {
        const download = await DownloadModel.findById(downloadId);
        if (!download) {
            throw new Error("Download not found");
        }

        // Update status to RUNNING
        download.status = "RUNNING";
        await download.save();

        console.log(`🔄 Starting download: ${download.url}`);

        // Step 1: Get download token from 1fichier
        const tokenResponse = await getDownloadToken(download.url);
        const actualDownloadUrl = tokenResponse.url;

        // Get suggested filename from API response
        const suggestedFileName = tokenResponse.filename || "unknown_file";

        // Step 2: Download the file (will auto-detect actual filename from headers)
        await downloadFile(downloadId, actualDownloadUrl, suggestedFileName);
    } catch (error) {
        console.error(`❌ Download failed:`, error);

        // Update status to ERROR
        await DownloadModel.findByIdAndUpdate(downloadId, {
            status: "ERROR",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}


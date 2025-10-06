import axios from "axios";
import fs from "fs";
import path from "path";
import DownloadModel from "../models/download.model.js";
import { searchMovie } from "./tmdb.service.js";
import { io } from "../server.js";
import { getDiskSpaceInfo } from "../utils/diskSpace.js";

const ONEFICHIER_API_KEY = process.env.ONEFICHIER_API_KEY;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "e:/Movies";

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

    // Clean URL by removing extra parameters (like &af=xxxx)
    // 1fichier API only needs the base URL with the file ID
    const cleanUrl = fileUrl.split('&')[0];
    
    console.log(`🔗 Original URL: ${fileUrl}`);
    console.log(`🔗 Clean URL: ${cleanUrl}`);

    const response = await axios.post<OneFichierTokenResponse>(
        "https://api.1fichier.com/v1/download/get_token.cgi",
        { url: cleanUrl },
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

        // Update filename in database immediately
        await DownloadModel.findByIdAndUpdate(downloadId, {
            fileName: sanitizedFileName,
        });

        const totalBytes = parseInt(response.headers["content-length"] || "0", 10);
        let downloadedBytes = 0;
        let lastDbUpdateProgress = 0;
        let lastSocketEmitProgress = -1;
        let tmdbSearchTriggered = false;

        response.data.on("data", async (chunk: Buffer) => {
            downloadedBytes += chunk.length;

            // Trigger TMDB search after we've downloaded at least 1MB or 5% of the file
            // This ensures the download is stable and the filename is correct
            if (!tmdbSearchTriggered && (downloadedBytes > 1024 * 1024 || (totalBytes > 0 && downloadedBytes / totalBytes > 0.05))) {
                tmdbSearchTriggered = true;
                console.log(`🎬 Download stable, starting TMDB search for: ${sanitizedFileName}`);
                
                // Search for movie metadata on TMDB asynchronously (don't block download)
                searchMovie(sanitizedFileName)
                    .then((movieMetadata) => {
                        if (movieMetadata) {
                            return DownloadModel.findByIdAndUpdate(downloadId, {
                                movieMetadata: movieMetadata,
                            }).then(() => {
                                console.log(`✅ TMDB metadata found: ${movieMetadata.title} (${movieMetadata.year})`);
                                // Emit metadata update via Socket.io
                                io.emit("downloadMetadataUpdate", {
                                    downloadId,
                                    movieMetadata,
                                });
                            });
                        } else {
                            console.log(`⚠️ No TMDB match found for: ${sanitizedFileName}`);
                        }
                    })
                    .catch((error) => {
                        console.error(`❌ TMDB search/update failed:`, error);
                    });
            }

            // Update progress in real-time via Socket.io
            if (totalBytes > 0) {
                const currentProgress = Math.round((downloadedBytes / totalBytes) * 100);
                
                // Emit real-time progress every 1% to all connected clients
                if (currentProgress > lastSocketEmitProgress) {
                    lastSocketEmitProgress = currentProgress;
                    io.emit("downloadProgress", {
                        downloadId,
                        progress: currentProgress,
                        downloadedBytes,
                        totalBytes,
                    });
                }
                
                // Update DB every 5% to avoid too many DB writes
                if (currentProgress >= lastDbUpdateProgress + 5 || currentProgress === 100) {
                    lastDbUpdateProgress = currentProgress;
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
        const completedDownload = await DownloadModel.findByIdAndUpdate(
            downloadId, 
            {
                status: "DONE",
                progress: 100,
                filePath: filePath,
            },
            { new: true }
        );

        console.log(`✅ Download completed: ${sanitizedFileName}`);
        
        // Emit completion event via Socket.io
        io.emit("downloadComplete", {
            downloadId,
            download: completedDownload,
        });
        
        // Update disk space info after download completes
        const diskInfo = await getDiskSpaceInfo();
        io.emit("diskSpace", diskInfo);
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
        
        // Emit download started event via Socket.io
        io.emit("downloadStarted", {
            downloadId,
            download,
        });

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
        const errorDownload = await DownloadModel.findByIdAndUpdate(
            downloadId,
            {
                status: "ERROR",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { new: true }
        );
        
        // Emit error event via Socket.io
        io.emit("downloadError", {
            downloadId,
            download: errorDownload,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}


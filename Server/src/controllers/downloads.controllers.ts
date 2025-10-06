import type { Request, Response } from "express";
import DownloadModel from "../models/download.model.js";
import { createDownloadSchema } from "../zod/downloads.zod.js";
import { startDownload } from "../services/download.service.js";
import { AppError } from "../utils/errorHandler.js";
import { getDiskSpaceInfo } from "../utils/diskSpace.js";

/**
 * POST /api/downloads
 * Creates a new download job and starts it asynchronously
 */
export async function createDownload(req: Request, res: Response) {
    // Validate input
    const validatedData = createDownloadSchema.parse(req.body);

    // Create download record
    const download = await DownloadModel.create({
        url: validatedData.url,
        fileName: "pending...",
        status: "PENDING",
        progress: 0,
    });

    // Start download asynchronously (don't await)
    startDownload(download._id.toString()).catch((error) => {
        console.error("Background download error:", error);
    });

    // Return immediately with 202 Accepted
    return res.status(202).json({
        success: true,
        message: "Download started",
        data: download,
    });
}

/**
 * GET /api/downloads
 * Returns all downloads ordered by most recent first
 */
export async function getAllDownloads(req: Request, res: Response) {
    const downloads = await DownloadModel.find()
        .sort({ createdAt: -1 })
        .limit(100); // Limit to last 100 downloads

    return res.status(200).json({
        success: true,
        data: downloads,
    });
}

/**
 * GET /api/downloads/:id
 * Returns a single download by ID
 */
export async function getDownloadById(req: Request, res: Response) {
    const { id } = req.params;
    const download = await DownloadModel.findById(id);

    if (!download) {
        throw new AppError("Download not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: download,
    });
}

/**
 * DELETE /api/downloads/:id
 * Deletes a download record (does not delete the file)
 */
export async function deleteDownload(req: Request, res: Response) {
    const { id } = req.params;
    const download = await DownloadModel.findByIdAndDelete(id);

    if (!download) {
        throw new AppError("Download not found", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Download deleted",
    });
}

/**
 * GET /api/downloads/disk-space
 * Returns disk space information for the downloads directory
 */
export async function getDiskSpace(req: Request, res: Response) {
    const diskInfo = await getDiskSpaceInfo();

    return res.status(200).json({
        success: true,
        data: diskInfo,
    });
}


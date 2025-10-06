import { Document } from "mongoose";
import type { MovieMetadata } from "./tmdb.d.ts";

export type DownloadStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR";

export interface IDownload {
    url: string;
    fileName: string;
    status: DownloadStatus;
    progress: number;
    filePath?: string;
    error?: string;
    movieMetadata?: MovieMetadata;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDownloadDoc extends IDownload, Document {}


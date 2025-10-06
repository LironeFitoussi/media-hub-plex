import type { MovieMetadata } from "./tmdb";

export type DownloadStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR";

export interface IDownload {
    _id: string;
    url: string;
    fileName: string;
    status: DownloadStatus;
    progress: number;
    filePath?: string;
    error?: string;
    movieMetadata?: MovieMetadata;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDownloadPayload {
    url: string;
}


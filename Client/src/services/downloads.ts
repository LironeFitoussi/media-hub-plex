import api from "./api";
import type { IDownload, CreateDownloadPayload } from "@/types";
import type { DiskSpaceInfo } from "@/types/diskSpace";

export const getDownloads = async (): Promise<IDownload[]> => {
    const { data } = await api.get("/downloads");
    return data.data;
};

export const getDownloadById = async (id: string): Promise<IDownload> => {
    const { data } = await api.get(`/downloads/${id}`);
    return data.data;
};

export const createDownload = async (payload: CreateDownloadPayload): Promise<IDownload> => {
    const { data } = await api.post("/downloads", payload);
    return data.data;
};

export const deleteDownload = async (id: string): Promise<void> => {
    await api.delete(`/downloads/${id}`);
};

export const getDiskSpace = async (): Promise<DiskSpaceInfo> => {
    const { data } = await api.get("/downloads/disk-space");
    return data.data;
};


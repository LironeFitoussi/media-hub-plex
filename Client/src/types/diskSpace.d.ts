export interface DiskSpaceInfo {
    totalSpace: number; // in bytes
    freeSpace: number; // in bytes
    usedSpace: number; // in bytes
    downloadsDirSize: number; // in bytes
    percentUsed: number;
    percentFree: number;
    driveName: string; // e.g., "E:\\"
}


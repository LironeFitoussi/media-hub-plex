import checkDiskSpace from "check-disk-space";
import fs from "fs";
import path from "path";

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "./downloads";
// Disk drive to monitor (default: E: drive on Windows)
const DISK_DRIVE = process.env.DISK_DRIVE || "E:\\";

export interface DiskSpaceInfo {
    totalSpace: number; // in bytes
    freeSpace: number; // in bytes
    usedSpace: number; // in bytes
    downloadsDirSize: number; // in bytes
    percentUsed: number;
    percentFree: number;
    driveName: string; // e.g., "E:\\"
}

/**
 * Gets the total size of a directory
 */
function getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    if (!fs.existsSync(dirPath)) {
        return 0;
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath);
        } else {
            totalSize += stats.size;
        }
    }

    return totalSize;
}

/**
 * Gets disk space information for the specified drive
 */
export async function getDiskSpaceInfo(): Promise<DiskSpaceInfo> {
    try {
        // Get the absolute path of the download directory
        const downloadPath = path.resolve(DOWNLOAD_DIR);
        
        // Get disk space for the specified drive (E: by default)
        const diskSpace = await checkDiskSpace(DISK_DRIVE);
        
        // Get the size of the downloads directory
        const downloadsDirSize = getDirectorySize(downloadPath);
        
        const totalSpace = diskSpace.size;
        const freeSpace = diskSpace.free;
        const usedSpace = totalSpace - freeSpace;
        
        console.log(`💾 Checking disk space for drive: ${DISK_DRIVE}`);
        
        return {
            totalSpace,
            freeSpace,
            usedSpace,
            downloadsDirSize,
            percentUsed: (usedSpace / totalSpace) * 100,
            percentFree: (freeSpace / totalSpace) * 100,
            driveName: DISK_DRIVE,
        };
    } catch (error) {
        console.error(`Error getting disk space info for ${DISK_DRIVE}:`, error);
        // Return default values on error
        return {
            totalSpace: 0,
            freeSpace: 0,
            usedSpace: 0,
            downloadsDirSize: 0,
            percentUsed: 0,
            percentFree: 0,
            driveName: DISK_DRIVE,
        };
    }
}

/**
 * Formats bytes to human-readable format (GB, MB, etc.)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}


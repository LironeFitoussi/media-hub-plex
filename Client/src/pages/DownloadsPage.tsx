import { useEffect, useState } from "react";
import type { IDownload } from "@/types";
import type { DiskSpaceInfo } from "@/types/diskSpace";
import { getDownloads, createDownload, deleteDownload, getDiskSpace } from "@/services/downloads";
import type { MovieMetadata } from "@/types/tmdb";
import { getSocket } from "@/services/socket";
import { getPosterUrl } from "@/utils/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  FiTrash2, 
  FiDownload, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiPause,
  FiLink,
  FiCalendar,
  FiFolder,
  FiFilm,
  FiHardDrive,
  FiDatabase
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";

// Helper function to format bytes
const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<IDownload[]>([]);
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diskSpace, setDiskSpace] = useState<DiskSpaceInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket.io and fetch initial data
  useEffect(() => {
    const socket = getSocket();

    // Check initial connection status
    setIsConnected(socket.connected);

    // Define event handlers
    const handleConnect = () => {
      console.log("✅ Socket.io connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket.io disconnected");
      setIsConnected(false);
    };

    const handleDiskSpace = (data: DiskSpaceInfo) => {
      console.log("💾 Disk space update:", data);
      setDiskSpace(data);
    };

    const handleDownloadProgress = (data: { downloadId: string; progress: number; downloadedBytes: number; totalBytes: number }) => {
      console.log("📊 Progress update:", data);
      setDownloads((prev) =>
        prev.map((download) =>
          download._id === data.downloadId
            ? { ...download, progress: data.progress }
            : download
        )
      );
    };

    const handleDownloadStarted = (data: { downloadId: string; download: IDownload }) => {
      console.log("🚀 Download started:", data);
      fetchDownloads(); // Refresh the list
    };

    const handleDownloadComplete = (data: { downloadId: string; download: IDownload }) => {
      console.log("✅ Download complete:", data);
      setDownloads((prev) =>
        prev.map((download) =>
          download._id === data.downloadId ? data.download : download
        )
      );
    };

    const handleDownloadError = (data: { downloadId: string; download: IDownload; error: string }) => {
      console.log("❌ Download error:", data);
      setDownloads((prev) =>
        prev.map((download) =>
          download._id === data.downloadId ? data.download : download
        )
      );
    };

    const handleMetadataUpdate = (data: { downloadId: string; movieMetadata: MovieMetadata }) => {
      console.log("🎬 Metadata update:", data);
      setDownloads((prev) =>
        prev.map((download) =>
          download._id === data.downloadId
            ? { ...download, movieMetadata: data.movieMetadata }
            : download
        )
      );
    };

    // Set up Socket.io event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("diskSpace", handleDiskSpace);
    socket.on("downloadProgress", handleDownloadProgress);
    socket.on("downloadStarted", handleDownloadStarted);
    socket.on("downloadComplete", handleDownloadComplete);
    socket.on("downloadError", handleDownloadError);
    socket.on("downloadMetadataUpdate", handleMetadataUpdate);

    // Fetch initial data
    fetchDownloads();
    fetchDiskSpace();

    // Cleanup: remove only this component's listeners (but keep socket connected)
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("diskSpace", handleDiskSpace);
      socket.off("downloadProgress", handleDownloadProgress);
      socket.off("downloadStarted", handleDownloadStarted);
      socket.off("downloadComplete", handleDownloadComplete);
      socket.off("downloadError", handleDownloadError);
      socket.off("downloadMetadataUpdate", handleMetadataUpdate);
    };
  }, []);

  const fetchDownloads = async () => {
    try {
      const data = await getDownloads();
      setDownloads(data);
    } catch (err) {
      console.error("Failed to fetch downloads:", err);
    }
  };

  const fetchDiskSpace = async () => {
    try {
      const data = await getDiskSpace();
      setDiskSpace(data);
    } catch (err) {
      console.error("Failed to fetch disk space:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    if (!url.includes("1fichier.com")) {
      setError("URL must be a 1fichier.com link");
      return;
    }

    setIsSubmitting(true);

    try {
      await createDownload({ url });
      setUrl("");
      // Immediately fetch to show the new download
      await fetchDownloads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start download");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDownload(id);
      await fetchDownloads();
    } catch (err) {
      console.error("Failed to delete download:", err);
    }
  };

  const getStatusBadgeVariant = (status: IDownload["status"]) => {
    switch (status) {
      case "DONE":
        return "default";
      case "RUNNING":
        return "secondary";
      case "ERROR":
        return "destructive";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: IDownload["status"]) => {
    switch (status) {
      case "DONE":
        return <FiCheckCircle className="inline" />;
      case "RUNNING":
        return <FiDownload className="inline animate-pulse" />;
      case "ERROR":
        return <FiXCircle className="inline" />;
      case "PENDING":
        return <FiPause className="inline" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">1fichier Downloads</h1>
              <p className="text-gray-600">
                Submit 1fichier links to download files asynchronously
              </p>
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Disk Space Info */}
        {diskSpace && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiHardDrive className="text-3xl" />
                <h2 className="text-2xl font-bold">Storage Overview</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-semibold">Drive {diskSpace.driveName}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiDatabase className="text-xl" />
                  <p className="text-sm font-medium opacity-90">Total Space</p>
                </div>
                <p className="text-2xl font-bold">{formatBytes(diskSpace.totalSpace)}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="text-xl" />
                  <p className="text-sm font-medium opacity-90">Available</p>
                </div>
                <p className="text-2xl font-bold">{formatBytes(diskSpace.freeSpace)}</p>
                <p className="text-xs opacity-75 mt-1">{diskSpace.percentFree.toFixed(1)}% free</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiFilm className="text-xl" />
                  <p className="text-sm font-medium opacity-90">Downloads</p>
                </div>
                <p className="text-2xl font-bold">{formatBytes(diskSpace.downloadsDirSize)}</p>
                <p className="text-xs opacity-75 mt-1">{downloads.length} file{downloads.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Disk Usage Progress Bar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-semibold">Disk Usage</span>
                <span className="font-bold">{diskSpace.percentUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    diskSpace.percentUsed > 90 ? 'bg-red-400' : 
                    diskSpace.percentUsed > 75 ? 'bg-yellow-400' : 
                    'bg-green-400'
                  }`}
                  style={{ width: `${diskSpace.percentUsed}%` }}
                />
              </div>
              <p className="text-xs opacity-75 mt-2">
                {formatBytes(diskSpace.usedSpace)} used of {formatBytes(diskSpace.totalSpace)}
              </p>
            </div>
          </div>
        )}

        {/* Download Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                1fichier URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://1fichier.com/?xxxxxxxxxx"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Starting Download..." : "Start Download"}
            </Button>
          </form>
        </div>

        {/* Downloads List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Downloads</h2>

          {downloads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No downloads yet. Submit a 1fichier link to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {downloads.map((download) => (
                <Card
                  key={download._id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row min-h-0">
                    {/* Movie Poster */}
                    <div className="relative lg:w-52 w-full h-72 lg:h-auto flex-shrink-0">
                      {download.movieMetadata?.posterPath ? (
                        <>
                          <img
                            src={getPosterUrl(download.movieMetadata.posterPath, "w342") || ""}
                            alt={download.movieMetadata.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Rating Badge */}
                          {download.movieMetadata.voteAverage > 0 && (
                            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1">
                              <AiFillStar className="text-base" />
                              {download.movieMetadata.voteAverage.toFixed(1)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                          <FiFilm className="text-7xl text-gray-400 opacity-40" />
                        </div>
                      )}
                      
                      {/* Status Badge on Poster */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge 
                          variant={getStatusBadgeVariant(download.status)}
                          className="w-full justify-center py-1.5 text-xs font-semibold"
                        >
                          {getStatusIcon(download.status)} {download.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Header */}
                      <div className="p-4 lg:p-6 border-b">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-1 leading-tight break-words">
                              {download.movieMetadata?.title || download.fileName}
                            </h3>
                            {download.movieMetadata?.year && (
                              <p className="text-sm lg:text-base text-gray-500 font-medium">
                                {download.movieMetadata.year}
                              </p>
                            )}
                            
                            {/* Genres */}
                            {download.movieMetadata?.genres && download.movieMetadata.genres.length > 0 && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {download.movieMetadata.genres.slice(0, 4).map((genre) => (
                                  <span
                                    key={genre}
                                    className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(download._id)}
                            className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300 whitespace-nowrap"
                          >
                            <FiTrash2 className="text-base" />
                          </Button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 lg:p-6 flex-1 overflow-hidden">
                        {/* Overview */}
                        {download.movieMetadata?.overview && (
                          <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                            {download.movieMetadata.overview}
                          </p>
                        )}

                        {/* Runtime */}
                        {download.movieMetadata?.runtime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <FiClock className="flex-shrink-0" />
                            <span className="font-semibold">Runtime:</span>
                            <span>{download.movieMetadata.runtime} min</span>
                          </div>
                        )}

                        {/* Filename (if no metadata) */}
                        {!download.movieMetadata && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3 overflow-hidden">
                            <p className="text-xs lg:text-sm text-gray-700 font-mono break-all">
                              {download.fileName}
                            </p>
                          </div>
                        )}

                        {/* Original URL */}
                        <div className="text-xs text-gray-400 mb-4 overflow-hidden">
                          <div className="flex items-start gap-1.5">
                            <FiLink className="flex-shrink-0 mt-0.5" />
                            <span className="break-all leading-relaxed">{download.url}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {download.status === "RUNNING" && (
                          <div className="bg-blue-50 p-3 lg:p-4 rounded-lg border border-blue-200 overflow-hidden">
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span className="font-semibold text-blue-900">Downloading...</span>
                              <span className="font-bold text-blue-900 text-base lg:text-lg">{download.progress}%</span>
                            </div>
                            <div className="w-full overflow-hidden">
                              <Progress value={download.progress} className="h-2.5 w-full" />
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {download.status === "ERROR" && download.error && (
                          <div className="bg-red-50 p-3 lg:p-4 rounded-lg border border-red-200 overflow-hidden">
                            <p className="text-sm text-red-700 font-medium break-words flex items-start gap-2">
                              <FiXCircle className="flex-shrink-0 mt-0.5" />
                              <span>{download.error}</span>
                            </p>
                          </div>
                        )}

                        {/* Success Message */}
                        {download.status === "DONE" && (
                          <div className="bg-green-50 p-3 lg:p-4 rounded-lg border border-green-200 overflow-hidden">
                            <p className="text-sm text-green-700 font-semibold mb-1 flex items-center gap-2">
                              <FiCheckCircle className="flex-shrink-0" />
                              Download completed successfully
                            </p>
                            {download.filePath && (
                              <p className="text-xs text-gray-600 break-all font-mono leading-relaxed flex items-start gap-1.5">
                                <FiFolder className="flex-shrink-0 mt-0.5" />
                                <span>{download.filePath}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 lg:px-6 py-3 bg-gray-50 border-t overflow-hidden">
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                          <FiCalendar className="flex-shrink-0" />
                          Added {new Date(download.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


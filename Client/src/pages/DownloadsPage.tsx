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
  FiHardDrive
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">1fichier Downloads</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Submit 1fichier links to download files asynchronously
              </p>
            </div>
            {/* Connection Status */}
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Download Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                1fichier URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://1fichier.com/?xxxxxxxxxx"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                className="w-full text-sm sm:text-base"
              />
            </div>

            {error && (
              <div className="text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 sm:p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full text-sm sm:text-base">
              {isSubmitting ? "Starting Download..." : "Start Download"}
            </Button>
          </form>
        </div>

        {/* Downloads List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Downloads</h2>

          {downloads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-gray-500">No downloads yet. Submit a 1fichier link to get started!</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {downloads.map((download) => (
                <Card
                  key={download._id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row min-h-0">
                    {/* Movie Poster */}
                    <div className="relative md:w-48 lg:w-52 w-full h-64 sm:h-72 md:h-auto flex-shrink-0">
                      {download.movieMetadata?.posterPath ? (
                        <>
                          <img
                            src={getPosterUrl(download.movieMetadata.posterPath, "w342") || ""}
                            alt={download.movieMetadata.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Rating Badge */}
                          {download.movieMetadata.voteAverage > 0 && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-yellow-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
                              <AiFillStar className="text-sm sm:text-base" />
                              {download.movieMetadata.voteAverage.toFixed(1)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                          <FiFilm className="text-5xl sm:text-7xl text-gray-400 opacity-40" />
                        </div>
                      )}
                      
                      {/* Status Badge on Poster */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                        <Badge 
                          variant={getStatusBadgeVariant(download.status)}
                          className="w-full justify-center py-1 sm:py-1.5 text-xs font-semibold"
                        >
                          {getStatusIcon(download.status)} {download.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Header */}
                      <div className="p-3 sm:p-4 lg:p-6 border-b">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1 leading-tight break-words">
                              {download.movieMetadata?.title || download.fileName}
                            </h3>
                            {download.movieMetadata?.year && (
                              <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">
                                {download.movieMetadata.year}
                              </p>
                            )}
                            
                            {/* Genres */}
                            {download.movieMetadata?.genres && download.movieMetadata.genres.length > 0 && (
                              <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                                {download.movieMetadata.genres.slice(0, 4).map((genre) => (
                                  <span
                                    key={genre}
                                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
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
                            className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300 whitespace-nowrap h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
                          >
                            <FiTrash2 className="text-sm sm:text-base" />
                          </Button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-3 sm:p-4 lg:p-6 flex-1 overflow-hidden">
                        {/* Overview */}
                        {download.movieMetadata?.overview && (
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                            {download.movieMetadata.overview}
                          </p>
                        )}

                        {/* Runtime */}
                        {download.movieMetadata?.runtime && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <FiClock className="flex-shrink-0" />
                            <span className="font-semibold">Runtime:</span>
                            <span>{download.movieMetadata.runtime} min</span>
                          </div>
                        )}

                        {/* Filename (if no metadata) */}
                        {!download.movieMetadata && (
                          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 overflow-hidden">
                            <p className="text-xs sm:text-sm text-gray-700 font-mono break-all">
                              {download.fileName}
                            </p>
                          </div>
                        )}

                        {/* Original URL */}
                        <div className="text-xs text-gray-400 mb-3 sm:mb-4 overflow-hidden">
                          <div className="flex items-start gap-1 sm:gap-1.5">
                            <FiLink className="flex-shrink-0 mt-0.5" />
                            <span className="break-all leading-relaxed">{download.url}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {download.status === "RUNNING" && (
                          <div className="bg-blue-50 p-2.5 sm:p-3 lg:p-4 rounded-lg border border-blue-200 overflow-hidden">
                            <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                              <span className="font-semibold text-blue-900">Downloading...</span>
                              <span className="font-bold text-blue-900 text-sm sm:text-base lg:text-lg">{download.progress}%</span>
                            </div>
                            <div className="w-full overflow-hidden">
                              <Progress value={download.progress} className="h-2 sm:h-2.5 w-full" />
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {download.status === "ERROR" && download.error && (
                          <div className="bg-red-50 p-2.5 sm:p-3 lg:p-4 rounded-lg border border-red-200 overflow-hidden">
                            <p className="text-xs sm:text-sm text-red-700 font-medium break-words flex items-start gap-1.5 sm:gap-2">
                              <FiXCircle className="flex-shrink-0 mt-0.5" />
                              <span>{download.error}</span>
                            </p>
                          </div>
                        )}

                        {/* Success Message */}
                        {download.status === "DONE" && (
                          <div className="bg-green-50 p-2.5 sm:p-3 lg:p-4 rounded-lg border border-green-200 overflow-hidden">
                            <p className="text-xs sm:text-sm text-green-700 font-semibold mb-1 flex items-center gap-1.5 sm:gap-2">
                              <FiCheckCircle className="flex-shrink-0" />
                              Download completed successfully
                            </p>
                            {download.filePath && (
                              <p className="text-xs text-gray-600 break-all font-mono leading-relaxed flex items-start gap-1 sm:gap-1.5">
                                <FiFolder className="flex-shrink-0 mt-0.5" />
                                <span>{download.filePath}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gray-50 border-t overflow-hidden">
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 sm:gap-1.5">
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

        {/* Disk Space Info - Minimalistic Bottom Section */}
        {diskSpace && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiHardDrive className="text-gray-600 text-lg" />
                  <h3 className="text-sm font-semibold text-gray-700">Storage ({diskSpace.driveName})</h3>
                </div>
                <span className="text-xs text-gray-500">{downloads.length} download{downloads.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-gray-600">
                    {formatBytes(diskSpace.usedSpace)} used
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {diskSpace.percentUsed.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatBytes(diskSpace.freeSpace)} free
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      diskSpace.percentUsed > 90 ? 'bg-red-500' : 
                      diskSpace.percentUsed > 75 ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    }`}
                    style={{ width: `${diskSpace.percentUsed}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{formatBytes(diskSpace.totalSpace)}</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Downloads</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{formatBytes(diskSpace.downloadsDirSize)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{formatBytes(diskSpace.freeSpace)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


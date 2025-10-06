import { useEffect, useState } from "react";
import type { IDownload } from "@/types";
import { getDownloads, createDownload, deleteDownload } from "@/services/downloads";
import { getPosterUrl } from "@/utils/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<IDownload[]>([]);
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch downloads initially and then poll every 5 seconds
  useEffect(() => {
    fetchDownloads();
    const interval = setInterval(fetchDownloads, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDownloads = async () => {
    try {
      const data = await getDownloads();
      setDownloads(data);
    } catch (err) {
      console.error("Failed to fetch downloads:", err);
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
        return "✅";
      case "RUNNING":
        return "⏳";
      case "ERROR":
        return "❌";
      case "PENDING":
        return "⏸️";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">1fichier Downloads</h1>
          <p className="text-gray-600">
            Submit 1fichier links to download files asynchronously
          </p>
        </div>

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
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    {download.movieMetadata?.posterPath ? (
                      <div className="relative w-full md:w-48 h-64 md:h-72 flex-shrink-0">
                        <img
                          src={getPosterUrl(download.movieMetadata.posterPath, "w342") || ""}
                          alt={download.movieMetadata.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Rating Badge */}
                        {download.movieMetadata.voteAverage > 0 && (
                          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                            ⭐ {download.movieMetadata.voteAverage.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full md:w-48 h-64 md:h-72 flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-6xl text-gray-400">🎬</div>
                      </div>
                    )}

                    {/* Content */}
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {download.movieMetadata?.title || download.fileName}
                            </h3>
                            {download.movieMetadata?.year && (
                              <span className="text-gray-500 text-lg">
                                ({download.movieMetadata.year})
                              </span>
                            )}
                            <Badge variant={getStatusBadgeVariant(download.status)}>
                              {getStatusIcon(download.status)} {download.status}
                            </Badge>
                          </div>

                          {/* Genres */}
                          {download.movieMetadata?.genres && download.movieMetadata.genres.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                              {download.movieMetadata.genres.map((genre) => (
                                <span
                                  key={genre}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Overview */}
                          {download.movieMetadata?.overview && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                              {download.movieMetadata.overview}
                            </p>
                          )}

                          {/* Runtime */}
                          {download.movieMetadata?.runtime && (
                            <p className="text-sm text-gray-500 mb-2">
                              ⏱️ Runtime: {download.movieMetadata.runtime} minutes
                            </p>
                          )}

                          {/* Filename (if no metadata) */}
                          {!download.movieMetadata && (
                            <p className="text-sm text-gray-500 mb-2">
                              📄 {download.fileName}
                            </p>
                          )}

                          {/* Original URL */}
                          <p className="text-xs text-gray-400 truncate mb-3">
                            🔗 {download.url}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(download._id)}
                          className="ml-4"
                        >
                          Delete
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      {download.status === "RUNNING" && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span className="font-medium">Downloading...</span>
                            <span className="font-semibold">{download.progress}%</span>
                          </div>
                          <Progress value={download.progress} className="h-3" />
                        </div>
                      )}

                      {/* Error Message */}
                      {download.status === "ERROR" && download.error && (
                        <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                          ❌ {download.error}
                        </div>
                      )}

                      {/* Success Message */}
                      {download.status === "DONE" && (
                        <div className="mb-3 text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
                          ✅ Download completed successfully
                          {download.filePath && (
                            <div className="text-xs mt-1 text-gray-600">
                              📁 {download.filePath}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-xs text-gray-400">
                        📅 Added: {new Date(download.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
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


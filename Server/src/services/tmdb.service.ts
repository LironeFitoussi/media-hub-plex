import axios from "axios";
import type { TMDBSearchResponse, TMDBMovieDetails, MovieMetadata } from "../types/tmdb.d.ts";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
    console.warn("⚠️ TMDB_API_KEY is not configured. Movie metadata will not be fetched.");
}

/**
 * Cleans and parses filename to extract movie title and year
 * Examples:
 * - "Movie.Name.2023.1080p.BluRay.x264.mkv" -> { title: "Movie Name", year: 2023 }
 * - "The_Movie_Name_(2023)_[1080p].mp4" -> { title: "The Movie Name", year: 2023 }
 */
function parseFileName(fileName: string): { title: string; year: number | null } {
    // Remove file extension
    let cleaned = fileName.replace(/\.(mkv|mp4|avi|mov|wmv|flv|webm)$/i, "");

    // Extract year if present (4 digits between 1900-2099)
    const yearMatch = cleaned.match(/[\(\[\.]?(19\d{2}|20\d{2})[\)\]\.]?/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

    // Remove year from title
    if (yearMatch) {
        cleaned = cleaned.replace(yearMatch[0], "");
    }

    // Remove common quality/format indicators
    cleaned = cleaned.replace(/\b(1080p|720p|480p|2160p|4K|BluRay|BRRip|WEBRip|WEB-DL|HDRip|DVDRip|x264|x265|HEVC|AAC|DTS|DD5\.1|HDTV)\b/gi, "");

    // Remove brackets and their contents
    cleaned = cleaned.replace(/\[.*?\]/g, "");
    cleaned = cleaned.replace(/\(.*?\)/g, "");

    // Replace dots, underscores, and dashes with spaces
    cleaned = cleaned.replace(/[\._\-]+/g, " ");

    // Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return { title: cleaned, year };
}

/**
 * Searches TMDB for a movie by title and optional year
 */
export async function searchMovie(fileName: string): Promise<MovieMetadata | null> {
    if (!TMDB_API_KEY) {
        return null;
    }

    try {
        const { title, year } = parseFileName(fileName);
        
        console.log(`🔍 Searching TMDB for: "${title}"${year ? ` (${year})` : ""}`);

        // Search for the movie
        const searchUrl = `${TMDB_BASE_URL}/search/movie`;
        const searchResponse = await axios.get<TMDBSearchResponse>(searchUrl, {
            params: {
                api_key: TMDB_API_KEY,
                query: title,
                year: year || undefined,
                include_adult: false,
            },
        });

        if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
            console.log(`❌ No TMDB results found for: "${title}"`);
            return null;
        }

        // Get the first (most relevant) result
        const movie = searchResponse.data.results[0];

        // Fetch detailed movie information
        const detailsUrl = `${TMDB_BASE_URL}/movie/${movie.id}`;
        const detailsResponse = await axios.get<TMDBMovieDetails>(detailsUrl, {
            params: {
                api_key: TMDB_API_KEY,
            },
        });

        const details = detailsResponse.data;

        // Extract year from release date
        const releaseYear = details.release_date 
            ? parseInt(details.release_date.split("-")[0], 10) 
            : null;

        const metadata: MovieMetadata = {
            tmdbId: details.id,
            title: details.title,
            originalTitle: details.original_title,
            overview: details.overview,
            posterPath: details.poster_path,
            backdropPath: details.backdrop_path,
            releaseDate: details.release_date,
            voteAverage: details.vote_average,
            runtime: details.runtime,
            genres: details.genres.map((g) => g.name),
            year: releaseYear,
        };

        console.log(`✅ Found TMDB match: ${metadata.title} (${metadata.year})`);
        return metadata;
    } catch (error) {
        console.error("❌ TMDB API error:", error);
        return null;
    }
}

/**
 * Gets the full poster URL from TMDB path
 */
export function getPosterUrl(posterPath: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

/**
 * Gets the full backdrop URL from TMDB path
 */
export function getBackdropUrl(backdropPath: string | null, size: "w300" | "w780" | "w1280" | "original" = "w1280"): string | null {
    if (!backdropPath) return null;
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
}


import axios from "axios";
import type { TMDBSearchResponse, TMDBMovieDetails, MovieMetadata } from "../types/tmdb.d.ts";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
    console.warn("⚠️ TMDB_API_KEY is not configured. Movie metadata will not be fetched.");
}

/**
 * Cleans and parses filename to extract movie title and year
 * Simple and effective approach:
 * 1. Remove file extension
 * 2. Replace dots with spaces
 * 3. Find year (4 digits)
 * 4. Cut everything after the year
 * 
 * Examples:
 * - "The.Fantastic.Four.First.Steps.2025.REPACK.MULTi.TRUEFRENCH.mkv" 
 *   -> { title: "The Fantastic Four First Steps", year: 2025 }
 * - "Movie.Name.2023.1080p.BluRay.x264.mkv" 
 *   -> { title: "Movie Name", year: 2023 }
 */
function parseFileName(fileName: string): { title: string; year: number | null } {
    // Step 1: Remove file extension
    let cleaned = fileName.replace(/\.(mkv|mp4|avi|mov|wmv|flv|webm|m4v|ts)$/i, "");

    // Step 2: Replace dots, underscores, and dashes with spaces
    cleaned = cleaned.replace(/[\._\-]+/g, " ");

    // Step 3: Find year (4 digits between 1900-2099)
    const yearMatch = cleaned.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

    // Step 4: If year found, cut everything after it (keep only title)
    if (yearMatch && yearMatch.index !== undefined) {
        cleaned = cleaned.substring(0, yearMatch.index).trim();
    }

    // Clean up multiple spaces and trim
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return { title: cleaned, year };
}

/**
 * Determines if the API key is a Bearer token (JWT) or a simple API key
 */
function isBearerToken(apiKey: string): boolean {
    return apiKey.startsWith("eyJ"); // JWT tokens start with eyJ
}

/**
 * Gets the appropriate axios config for TMDB API authentication
 */
function getTMDBConfig(params: Record<string, any> = {}) {
    if (!TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is not configured");
    }

    // Check if it's a Bearer token or simple API key
    if (isBearerToken(TMDB_API_KEY)) {
        // Use Authorization header for Bearer tokens
        return {
            headers: {
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },
            params,
        };
    } else {
        // Use api_key query param for simple API keys
        return {
            params: {
                api_key: TMDB_API_KEY,
                ...params,
            },
        };
    }
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
        const searchResponse = await axios.get<TMDBSearchResponse>(
            searchUrl,
            getTMDBConfig({
                query: title,
                year: year || undefined,
                include_adult: false,
            })
        );

        if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
            console.log(`❌ No TMDB results found for: "${title}"`);
            return null;
        }

        // Get the first (most relevant) result
        const movie = searchResponse.data.results[0];

        // Fetch detailed movie information
        const detailsUrl = `${TMDB_BASE_URL}/movie/${movie.id}`;
        const detailsResponse = await axios.get<TMDBMovieDetails>(
            detailsUrl,
            getTMDBConfig()
        );

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


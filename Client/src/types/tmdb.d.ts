export interface MovieMetadata {
    tmdbId: number;
    title: string;
    originalTitle: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    voteAverage: number;
    runtime: number | null;
    genres: string[];
    year: number | null;
}


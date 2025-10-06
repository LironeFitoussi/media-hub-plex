import mongoose, { Schema } from "mongoose";
import type { IDownloadDoc } from "../types/downloads.d.ts";

const downloadSchema = new Schema<IDownloadDoc>({
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'RUNNING', 'DONE', 'ERROR'], 
        required: true, 
        default: 'PENDING' 
    },
    progress: { type: Number, required: true, default: 0 },
    filePath: { type: String, required: false },
    error: { type: String, required: false },
    movieMetadata: {
        tmdbId: { type: Number, required: false },
        title: { type: String, required: false },
        originalTitle: { type: String, required: false },
        overview: { type: String, required: false },
        posterPath: { type: String, required: false },
        backdropPath: { type: String, required: false },
        releaseDate: { type: String, required: false },
        voteAverage: { type: Number, required: false },
        runtime: { type: Number, required: false },
        genres: { type: [String], required: false },
        year: { type: Number, required: false },
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }   
});

const DownloadModel = mongoose.model<IDownloadDoc>("Download", downloadSchema);

export default DownloadModel;


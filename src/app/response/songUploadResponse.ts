import { SongUpload } from "../models/songUpload.module";

export interface SongUploadResponse{
    content: SongUpload[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}
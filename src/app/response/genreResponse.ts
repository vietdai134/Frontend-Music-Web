import { Genre } from "../models/genre.module";

export interface GenreResponse{
    content:Genre[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}
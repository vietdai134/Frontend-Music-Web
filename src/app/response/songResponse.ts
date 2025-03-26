import { Song } from "../models/song.module";

export interface SongResponse {
    content: Song[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  }
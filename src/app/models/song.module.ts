import { Genre } from "./genre.module";

export interface Song{
    songId:number;
    title:string;
    songImage?:string;
    songFileData:string;
    downloadable:boolean;
    genres:Genre[];
    userName:string;
    approvedDate:Date;

    fileSongId: string;
    artist:string;
    uploadDate:Date;
    genresName?:string;

    listenedDate?: string | null;
}
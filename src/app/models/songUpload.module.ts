import { Song } from "./song.module";

export interface SongUpload{
    uploadId:number;
    uploadDate:Date;
    songDto:Song;
    userName:string;
}
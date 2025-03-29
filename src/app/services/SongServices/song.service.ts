import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from '../../models/song.module';
import { environment } from '../../../environments/environment';
import { SongResponse } from '../../response/songResponse';
@Injectable({
  providedIn: 'root'
})
export class SongService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllSongsWithStatus(page: number = 0, size: number = 10,approvalStatus:string): Observable<SongResponse> {
    return this.http.get<SongResponse>(`${this.baseUrl}/songs/all?page=${page}&size=${size}&approvalStatus=${approvalStatus}`);
  }

  getSongById(songId:number):Observable<Song>{
    return this.http.get<Song>(`${this.baseUrl}/songs/${songId}`,{ withCredentials: true });
  }

  createSong(
    song: { 
      title: string; 
      artist: string; 
      songImage?: File; 
      songFileData: File; 
      genreNames: string[];
      downloadable:boolean;
    }): Observable<Song> {
      const formData = new FormData();
    formData.append('title', song.title);
    formData.append('artist', song.artist);
    formData.append('downloadable', song.downloadable.toString());
    song.genreNames.forEach(genreName => formData.append('genreNames[]', genreName)); // Gửi từng roleName riêng
    if (song.songImage) {
      formData.append('songImage', song.songImage);
    }
    if (song.songFileData) {
      formData.append('songFileData', song.songFileData);
    }
    console.log('Sending FormData:', Array.from(formData.entries()));
    return this.http.post<Song>(`${this.baseUrl}/songs`, formData,{ withCredentials: true });
  }

  updateSong(
      songId:number,
      song:{
        title:string;
        artist:string;
        songFileId: string;
        genreNames: string[];
        songImage?:File;
        downloadable: boolean;
      }):Observable<Song>{
        const formData = new FormData();
        formData.append('title', song.title);
        formData.append('artist', song.artist);
        formData.append('songFileId', song.songFileId);
        // formData.append('roleNames', JSON.stringify(user.roleNames));
        song.genreNames.forEach(genreName => formData.append('genreNames[]', genreName)); // Gửi từng roleName riêng
        if (song.songImage) {
          formData.append('songImage', song.songImage);
        }
        return this.http.put<Song>(`${this.baseUrl}/songs/update/${songId}`, formData,{ withCredentials: true });
      }
}

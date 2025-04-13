import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SongResponse } from '../../response/songResponse';
import { Song } from '../../models/song.module';

@Injectable({
  providedIn: 'root'
})
export class UserUploadService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllUploadedSongs(
    page:number=0,
    size:number=10,
    content:string,
    sort:string,
    approvedStatus:string,
  ) : Observable<SongResponse>{
    const sortParam = `${content},${sort}`;
    let params= new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortParam)
      .set('approvalStatus', approvedStatus);
    return this.http.get<SongResponse>(`${this.baseUrl}/song-upload/all-song-upload`, { params, withCredentials: true });
  }

  uploadSong(
    song: { 
      title: string; 
      artist: string; 
      songImage?: File; 
      songFileData: File; 
      genreNames: string[];
    }): Observable<Song> {
      const formData = new FormData();
    formData.append('title', song.title);
    formData.append('artist', song.artist);
    song.genreNames.forEach(genreName => formData.append('genreNames[]', genreName)); // Gửi từng roleName riêng
    if (song.songImage) {
      formData.append('songImage', song.songImage);
    }
    if (song.songFileData) {
      formData.append('songFileData', song.songFileData);
    }
    console.log('Sending FormData:', Array.from(formData.entries()));
    return this.http.post<Song>(`${this.baseUrl}/song-upload`, formData,{ withCredentials: true });
  }

  updateUploadSong(
    songId:number,
    song:{
      title:string;
      artist:string;
      songFileId: string;
      genreNames: string[];
      songImage?:File;
    }):Observable<Song>{
      const formData = new FormData();
      formData.append('title', song.title);
      formData.append('artist', song.artist);
      formData.append('songFileId', song.songFileId);
      song.genreNames.forEach(genreName => formData.append('genreNames[]', genreName)); // Gửi từng roleName riêng
      if (song.songImage) {
        formData.append('songImage', song.songImage);
      }
      return this.http.put<Song>(`${this.baseUrl}/song-upload/update/${songId}`, formData,{ withCredentials: true });
  }
}

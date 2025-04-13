import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Album } from '../../models/album.module';
import { AlbumSong } from '../../models/albumSong.module';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }
  
  getAllAlbums():Observable<Album[]>{
    return this.http.get<Album[]>(`${this.baseUrl}/albums`,{ withCredentials: true});
  }

  getSongsByAlbumId(albumId: number): Observable<AlbumSong>{
    return this.http.get<AlbumSong>(`${this.baseUrl}/albums/songs?albumId=${albumId}`, { withCredentials: true });
  }

  createAlbum(
    album:{
      albumName: string, 
      albumImage?:File
    }
  ): Observable<Album> {
    const formData= new FormData();
    formData.append('albumName', album.albumName);
    if (album.albumImage) {
      formData.append('albumImage', album.albumImage);
    }
    console.log('Sending FormData:', Array.from(formData.entries()));
    return this.http.post<Album>(`${this.baseUrl}/albums/create`, formData, { withCredentials: true });
  }

  addSongToAlbum(songId: number, albumId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/albums/add-song?songId=${songId}&albumId=${albumId}`, {}, { withCredentials: true });
  }

  addMultipleSongsToAlbum(albumId: number, songIds: number[]): Observable<any> {
    // Tạo query string từ songIds và albumId
    const queryParams = songIds.map(id => `songIds=${id}`).join('&') + `&albumId=${albumId}`;
    const url = `${this.baseUrl}/albums/add-multiple-song?${queryParams}`;
    return this.http.post<any>(url, null, { withCredentials: true });
  }

  deleteSongFromAlbum(albumId:number, songId:number):Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/albums/delete-song?songId=${songId}&albumId=${albumId}`, { withCredentials: true });
  }

  deleteAlbum(albumId:number):Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/albums?albumId=${albumId}`, { withCredentials: true });
  }

  updateAlbum(
    albumId:number, 
    album:{
      albumName:string, 
      albumImage?:File
    }
    ):Observable<Album>{
    const formData= new FormData();
    formData.append('albumName', album.albumName);
    if (album.albumImage) {
      formData.append('albumImage', album.albumImage);
    }
    return this.http.put<Album>(`${this.baseUrl}/albums?albumId=${albumId}`, formData, { withCredentials: true });
  }


}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LikedSong } from '../../models/likedSong.module';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikedSongService {
  private baseUrl = environment.baseUrl; 
    constructor(private http: HttpClient) { }

  getAllLikedSongs(): Observable<LikedSong[]> {
    return this.http.get<LikedSong[]>(`${this.baseUrl}/liked-song`, { withCredentials: true });
  }
  addSongToLikedSongs(songId: number) {
    return this.http.post<any>(`${this.baseUrl}/liked-song?songId=${songId}`, {}, { withCredentials: true });
  }
  deleteSongFromLikedSongs(songId: number) {
    return this.http.delete<any>(`${this.baseUrl}/liked-song?songId=${songId}`, { withCredentials: true });
  }
}

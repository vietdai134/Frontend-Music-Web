import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist } from '../../models/playlist.module';
import { PlaylistSong } from '../../models/playlistSong.module';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllPlaylists():Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/playlist`,{ withCredentials: true});
  }

  getSongsByPlaylistId(playlistId: number): Observable<PlaylistSong> {
    return this.http.get<PlaylistSong>(`${this.baseUrl}/playlist/songs?playlistId=${playlistId}`, { withCredentials: true });
  }

  createPlaylist(playlistName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/playlist/create`, { playListName: playlistName }, { withCredentials: true });
  }

  addSongToPlaylist(songId: number, playlistId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/playlist/add-song?songId=${songId}&playlistId=${playlistId}`, {}, { withCredentials: true });
  }

  deleteSongFromPlaylist(playlistId: number, songId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/playlist/delete-song?songId=${songId}&playlistId=${playlistId}`, { withCredentials: true });
  }

  deletePlaylist(playlistId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/playlist?playlistId=${playlistId}`, { withCredentials: true });
  }

  updatePlaylist(playlistId: number, playlistName: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/playlist?playlistId=${playlistId}`, { playListName: playlistName }, { withCredentials: true });
  }
}

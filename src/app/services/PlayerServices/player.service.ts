import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../../models/song.module';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  currentSong$ = this.currentSongSubject.asObservable();
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  setCurrentSong(song: Song): void {
    this.currentSongSubject.next(song);
  }

  streamingSong(fileSongId: string) {
    return this.http.get(`${this.baseUrl}/songs/stream/${fileSongId}`, { responseType: 'blob',withCredentials: true },);
  }
  
}

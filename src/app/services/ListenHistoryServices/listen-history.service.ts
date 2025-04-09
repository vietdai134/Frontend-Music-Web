import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ListenHistory } from '../../models/listenHistory.module';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListenHistoryService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllSongsHistory():Observable<ListenHistory[]> {
    return this.http.get<ListenHistory[]>(`${this.baseUrl}/listen-history`,{ withCredentials: true});
  }

  deleteSongFromHistory(songId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/listen-history?songId=${songId}`, { withCredentials: true });
  }

  addSongToHistory(songId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/listen-history?songId=${songId}`, {}, { withCredentials: true });
  }
}

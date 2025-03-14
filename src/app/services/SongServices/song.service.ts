import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Song } from '../../models/song.module';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SongService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllSongs(page: number = 0, size: number = 10): Observable<{
    content: Song[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    }
  }> {
    return this.http.get<{
      content: Song[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      }
    }>(`${this.baseUrl}/songs/all?page=${page}&size=${size}`);
  }
}

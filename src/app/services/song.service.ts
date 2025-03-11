import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private baseUrl = 'http://localhost:8080/api'; 
  constructor(private http: HttpClient) { }

  getAllSongs(page: number = 0, size: number = 10) {
    return this.http.get<any>(`${this.baseUrl}/songs/all?page=${page}&size=${size}`);
  }
}

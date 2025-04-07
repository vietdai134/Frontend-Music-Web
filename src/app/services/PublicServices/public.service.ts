import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SongResponse } from '../../response/songResponse';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }
  
  getAllSongsWithApproved(page: number = 0, size: number = 10,content:string,sort:string): Observable<SongResponse> {
    return this.http.get<SongResponse>(`${this.baseUrl}/public/all?page=${page}&size=${size}&sort=${content}%2C${sort}`);
  }

  searchSongByKeyword(
    title?:string,
    artist?:string,
    genres?:string[],
    username?:string,
    page: number = 0,
    size: number = 10,
    content?:string,
    sort?:string
  ):Observable<SongResponse>{
    const sortParam = `${content},${sort}`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sortParam);

    if (title) {
      params = params.set('title', title);
    }
    if (artist) {
      params = params.set('artist', artist);
    }
    // if (genres && genres.length > 0) {
    //   params = params.set('genres', genres.join(',')); // Chuyển mảng thành chuỗi ngăn cách bởi dấu phẩy
    // }
    if (genres && genres.length > 0) {
      genres.forEach((genre) => {
        params = params.append('genres', genre);
      });
    }
    
    if (username) {
      params = params.set('username', username);
    }
    const urlWithParams = `${this.baseUrl}/public/songs/search?${params.toString()}`;
    console.log('Generated URL:', urlWithParams);
    return this.http.get<SongResponse>(`${this.baseUrl}/public/songs/search`, { params });
  }
}

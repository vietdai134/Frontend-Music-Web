import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { GenreResponse } from '../../response/genreResponse';
import { Observable } from 'rxjs';
import { Genre } from '../../models/genre.module';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  searchGenres(keyword: string, page: number = 0, size: number = 10): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${this.baseUrl}/genres/search?keyword=${keyword}&page=${page}&size=${size}`,{ withCredentials: true });
  }
  
  getAllGenres(page: number = 0, size: number = 10): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${this.baseUrl}/genres/all?page=${page}&size=${size}`,{ withCredentials: true });
  }

  getListAllGenres():Observable<Genre[]>{
    return this.http.get<Genre[]>(`${this.baseUrl}/genres/list`,{ withCredentials: true });
  }

  getGenreById(genreId:number):Observable<Genre>{
    return this.http.get<Genre>(`${this.baseUrl}/genres/${genreId}`,{ withCredentials: true });
  }

  deleteGenre(genreId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/genres/${genreId}`,{ withCredentials: true });
  }

  createGenre(genreName:string): Observable<Genre> {
    return this.http.post<Genre>(`${this.baseUrl}/genres`, genreName,{ withCredentials: true });
  }

  updateGenre(
    genreId:number,
    genreName:string
    ):Observable<Genre>{
      return this.http.put<Genre>(`${this.baseUrl}/genres/update/${genreId}`, genreName,{ withCredentials: true });
  }
}

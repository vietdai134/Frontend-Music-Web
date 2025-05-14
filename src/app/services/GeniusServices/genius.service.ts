import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LyricsResponse } from '../../models/lyricGenius.module';
import { Observable } from 'rxjs';
import { TranslateResponse } from '../../models/translate.module';

@Injectable({
  providedIn: 'root'
})
export class GeniusService {
  private geniusBaseUrl = environment.geniusServiceUrl;

  constructor(private http: HttpClient) { }

  getLyrics(songTitle: string, artistName: string): Observable<LyricsResponse> {
    const params = new HttpParams()
      .set('song', songTitle)
      .set('artist', artistName);

    return this.http.get<LyricsResponse>(`${this.geniusBaseUrl}/lyrics`, { params });
  }

  translateText(text: string, targetLanguage: string): Observable<TranslateResponse> {
    const body = { text, target_language: targetLanguage };
    return this.http.post<TranslateResponse>(`${this.geniusBaseUrl}/translate`, body);
  }
}

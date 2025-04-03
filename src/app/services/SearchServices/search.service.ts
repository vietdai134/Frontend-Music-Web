import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private currentKeyword = new BehaviorSubject<string | null>(null);
  currentKeyword$ = this.currentKeyword.asObservable();
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  setTitleOrArtistSong(keyword: string): void {
    this.currentKeyword.next(keyword);
  }

  getCurrentKeyword(): string | null {
    return this.currentKeyword.value;
  }
}

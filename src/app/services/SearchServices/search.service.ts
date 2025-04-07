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

  private currentTypeSearch = new BehaviorSubject<string>('title');
  currentTypeSearch$ = this.currentTypeSearch.asObservable();

  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  // setKeyword(keyword: string,type:string): void {
  //   this.currentKeyword.next(keyword);
  //   this.currentTypeSearch.next(type);
  // }
  setKeyword(keyword: string): void {
    this.currentKeyword.next(keyword);
  }

  setTypeSearch(type: string): void {
    this.currentTypeSearch.next(type);
  }

  getCurrentKeyword(): { keyword: string | null, type: string } {
    return {
      keyword: this.currentKeyword.value,
      type: this.currentTypeSearch.value
    };
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SongApproval } from '../../models/songApproval.module';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongApprovalService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  createSongApproval(
    songApproval: { 
      songId:number;
      status:string;
    }): Observable<SongApproval> {
      
    return this.http.post<SongApproval>(`${this.baseUrl}/songs-approval`, songApproval,{ withCredentials: true });
  }
}


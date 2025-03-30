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

  UpdateSongApproval( 
      songId:number,
      status:string
    ): Observable<void> {
      
    return this.http.put<void>(`${this.baseUrl}/song-approval/${songId}?approvalStatus=${status}`,null,{ withCredentials: true });
  }
}


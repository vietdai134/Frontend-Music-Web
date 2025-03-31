import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SongUploadResponse } from '../../response/songUploadResponse';

@Injectable({
  providedIn: 'root'
})
export class SongUploadService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllSongsUpload(page: number = 0, size: number = 10,approvalStatus:string): Observable<SongUploadResponse> {
    return this.http.get<SongUploadResponse>(`${this.baseUrl}/song-upload/all?page=${page}&size=${size}&approvalStatus=${approvalStatus}`,{withCredentials:true});
    
  }

  searchSongsUploadWithStatus(page: number = 0, size: number = 10,keyword:string,approvalStatus:string): Observable<SongUploadResponse> {
    return this.http.get<SongUploadResponse>(`${this.baseUrl}/song-upload/search?page=${page}&size=${size}&keyword=${keyword}&approvalStatus=${approvalStatus}`,{withCredentials:true});
  }
}

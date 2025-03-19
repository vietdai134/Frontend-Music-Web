import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../../response/userResponse';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllUsers(page: number = 0, size: number = 10): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user/all?page=${page}&size=${size}`);
  }

  searchUsers(keyword: string, page: number = 0, size: number = 10): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user/search?keyword=${keyword}&page=${page}&size=${size}`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/delete/${userId}`);
  }
}

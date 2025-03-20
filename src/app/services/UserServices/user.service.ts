import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../../response/userResponse';
import {User} from '../../models/user.module';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllUsers(page: number = 0, size: number = 10): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user/all?page=${page}&size=${size}`,{ withCredentials: true });
  }

  getUserById(userId:number):Observable<User>{
    return this.http.get<User>(`${this.baseUrl}/user/${userId}`,{ withCredentials: true });
  }

  searchUsers(keyword: string, page: number = 0, size: number = 10): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/user/search?keyword=${keyword}&page=${page}&size=${size}`,{ withCredentials: true });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/delete/${userId}`,{ withCredentials: true });
  }

  createUser(
    user: { 
      userName: string; 
      email: string; 
      password: string; 
      accountType: string; 
      roleNames: string[] 
    }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/user/create`, user,{ withCredentials: true });
  }

  registerUser(
    user:{
      userName: string;
      email: string;
      password: string;
    }): Observable<User>{
      return this.http.post<User>(`${this.baseUrl}/user/register`, user);
  }

  updateUser(
    userId:number,
    user:{
      userName:string;
      email:string;
      accountType: string;
      roleNames: string[];
    }):Observable<User>{
      return this.http.put<User>(`${this.baseUrl}/user/update/${userId}`, user,{ withCredentials: true });
    }
}

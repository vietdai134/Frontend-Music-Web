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
      roleNames: string[];
      avatar?:File;
    }): Observable<User> {
      const formData = new FormData();
    formData.append('userName', user.userName);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('accountType', user.accountType);
    user.roleNames.forEach(roleName => formData.append('roleNames[]', roleName)); // Gửi từng roleName riêng
    if (user.avatar) {
      formData.append('avatar', user.avatar);
    }
    console.log('Sending FormData:', Array.from(formData.entries()));
    return this.http.post<User>(`${this.baseUrl}/user/create`, formData,{ withCredentials: true });
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
      avatar?:File;
    }):Observable<User>{
      const formData = new FormData();
      formData.append('userName', user.userName);
      formData.append('email', user.email);
      formData.append('accountType', user.accountType);
      // formData.append('roleNames', JSON.stringify(user.roleNames));
      user.roleNames.forEach(roleName => formData.append('roleNames[]', roleName)); // Gửi từng roleName riêng
      if (user.avatar) {
        formData.append('avatar', user.avatar);
      }
      return this.http.put<User>(`${this.baseUrl}/user/update/${userId}`, formData,{ withCredentials: true });
    }
}

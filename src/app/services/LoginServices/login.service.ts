import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  userLogin(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password },{withCredentials:true});
  }
}

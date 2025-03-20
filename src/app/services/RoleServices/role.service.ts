import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.module';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  getAllRoles():Observable<Role[]>{
    return this.http.get<Role[]>(`${this.baseUrl}/roles/all`,{ withCredentials: true });
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.module';
import { RoleResponse } from '../../response/roleResponse';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = environment.baseUrl; 
  constructor(private http: HttpClient) { }

  searchRoles(keyword: string, page: number = 0, size: number = 10): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.baseUrl}/roles/search?keyword=${keyword}&page=${page}&size=${size}`,{ withCredentials: true });
  }
  
  getPageAllRoles(page: number = 0, size: number = 10): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.baseUrl}/roles/all?page=${page}&size=${size}`,{ withCredentials: true });
  }

  getListAllRoles():Observable<Role[]>{
    return this.http.get<Role[]>(`${this.baseUrl}/roles/list`,{ withCredentials: true });
  }

  getRoleById(roleId:number):Observable<Role>{
        return this.http.get<Role>(`${this.baseUrl}/roles/${roleId}`,{ withCredentials: true });
      }
    
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/delete/${roleId}`,{ withCredentials: true });
  }

  createRole(
    role: { 
      roleName: string; 
      description: string; 
      permissionNames: string[] 
    }
  ): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, role,{ withCredentials: true });
  }

  updateRole(
    roleId:number,
    role:{
      roleName: string; 
      description: string; 
      permissionNames: string[] 
    }
    ):Observable<Role>{
      return this.http.put<Role>(`${this.baseUrl}/roles/update/${roleId}`, role,{ withCredentials: true });
  }
}

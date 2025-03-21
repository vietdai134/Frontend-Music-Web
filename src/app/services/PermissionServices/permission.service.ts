import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissionResponse } from '../../response/permissionResponse';
import { Permission } from '../../models/permission.module';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }
    searchPermissions(keyword: string, page: number = 0, size: number = 10): Observable<PermissionResponse> {
      return this.http.get<PermissionResponse>(`${this.baseUrl}/permissions/search?keyword=${keyword}&page=${page}&size=${size}`,{ withCredentials: true });
    }
    
    getPageAllPermissions(page: number = 0, size: number = 10): Observable<PermissionResponse> {
      return this.http.get<PermissionResponse>(`${this.baseUrl}/permissions/all?page=${page}&size=${size}`,{ withCredentials: true });
    }

    getListAllPermissions(){
      return this.http.get<Permission[]>(`${this.baseUrl}/permissions/list`,{ withCredentials: true });
    }
  
    getPermissionById(permissionId:number):Observable<Permission>{
      return this.http.get<Permission>(`${this.baseUrl}/permissions/${permissionId}`,{ withCredentials: true });
    }
  
    deletePermission(permissionId: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/permissions/${permissionId}`,{ withCredentials: true });
    }
  
    createPermission(
      permission:{
        permissionName:string;
        description:string;
      }
    ): Observable<Permission> {
      return this.http.post<Permission>(`${this.baseUrl}/permissions`, permission, { withCredentials: true });
    }
  
    updatePermission(
      permissionId:number,
      permission:{
        permissionName:string;
        description:string;
      }
      ):Observable<Permission>{
        return this.http.put<Permission>(`${this.baseUrl}/permissions/update/${permissionId}`, permission,{ withCredentials: true });
    }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideBarAdminService {
  private isSidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  isSidebarCollapsed$: Observable<boolean> = this.isSidebarCollapsedSubject.asObservable();

  toggleSidebar(): void {
    this.isSidebarCollapsedSubject.next(!this.isSidebarCollapsedSubject.value);
  }

  setSidebarCollapsed(state: boolean): void {
    this.isSidebarCollapsedSubject.next(state);
  }
}

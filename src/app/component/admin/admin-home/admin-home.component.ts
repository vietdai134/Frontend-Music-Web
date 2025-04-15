import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { SideBarAdminService } from '../../../services/SideBarAdminServices/side-bar-admin.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent {
  isSidebarCollapsed$: Observable<boolean>;

  constructor(private sidebarService: SideBarAdminService) {
    this.isSidebarCollapsed$ = this.sidebarService.isSidebarCollapsed$;
  }
}
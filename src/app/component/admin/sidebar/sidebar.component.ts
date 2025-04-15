import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.module';
import { LoginService } from '../../../services/LoginServices/login.service';
import { MatIconModule } from '@angular/material/icon';
import { SideBarAdminService } from '../../../services/SideBarAdminServices/side-bar-admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  user$: Observable<User | null>;
  isSidebarCollapsed = false;
  
  menuItems = [
    { label: 'Quay lại trang chủ', icon: 'home', link: '/' },
    // { label: 'Dashboard', icon: 'fas fa-home', link: '/admin' },
    { label: 'Song', icon: 'music_note', link: '/admin/song' },
    { label: 'Genre', icon: 'category', link: '/admin/genre' },
    { label: 'Permission', icon: 'lock', link: '/admin/permission' },
    { label: 'Role', icon: 'admin_panel_settings', link: '/admin/role' },
    { label: 'Users', icon: 'people', link: '/admin/user' },
    // { label: 'User-Payment', icon: 'fas fa-cog', link: '/admin/user-payment' }
    
  ];
  constructor(
    private loginService: LoginService,
    private router:Router,
    private sidebarService: SideBarAdminService
  ) {
    this.user$ = this.loginService.user$; // Gán user$ từ LoginService
    this.sidebarService.isSidebarCollapsed$.subscribe(state => {
      this.isSidebarCollapsed = state;
    });
}
  ngOnInit(): void {
    // Kiểm tra user và thêm mục Moderate nếu cần
    this.user$.subscribe(user => {
      if (this.hasModerateSongPermission(user)) {
          // Kiểm tra xem mục Moderate đã tồn tại chưa để tránh trùng lặp
          if (!this.menuItems.some(item => item.label === 'Song-Upload')) {
              this.menuItems.push({
                  label: 'Song-Upload',
                  icon: 'upload_file', // Chọn icon phù hợp
                  link: '/admin/song-upload'
              });
          }
      }
    });
  }
  // Kiểm tra xem user có permission MODERATE_SONG không
  hasModerateSongPermission(user: User | null): boolean {
    return user?.permissions?.includes('MODERATE_SONG') || false;
  }

  toggleSidebar(): void {
    // this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarService.toggleSidebar();
  }

  logout() {
    this.loginService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout Error:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}

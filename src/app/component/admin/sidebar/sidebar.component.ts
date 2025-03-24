import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.module';
import { LoginService } from '../../../services/LoginServices/login.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit{
  user$: Observable<User | null>;
  menuItems = [
    { label: 'Quay lại trang chủ', icon: 'fas fa-users', link: '/' },
    { label: 'Dashboard', icon: 'fas fa-home', link: '/admin' },
    { label: 'Song', icon: 'fas fa-users', link: '/admin/song' },
    { label: 'Genre', icon: 'fas fa-shopping-cart', link: '/admin/genre' },
    { label: 'Permission', icon: 'fas fa-box', link: '/admin/permission' },
    { label: 'Role', icon: 'fas fa-cog', link: '/admin/role' },
    { label: 'Users', icon: 'fas fa-users', link: '/admin/user' },
    { label: 'User-Payment', icon: 'fas fa-cog', link: '/admin/user-payment' }
    
  ];
  constructor(
    private loginService: LoginService,
    private router:Router
  ) {
    this.user$ = this.loginService.user$; // Gán user$ từ LoginService
}
  ngOnInit(): void {
    // Kiểm tra user và thêm mục Moderate nếu cần
    this.user$.subscribe(user => {
      if (this.hasModerateSongPermission(user)) {
          // Kiểm tra xem mục Moderate đã tồn tại chưa để tránh trùng lặp
          if (!this.menuItems.some(item => item.label === 'Song-Approval')) {
              this.menuItems.push({
                  label: 'Song-Approval',
                  icon: 'fas fa-check-circle', // Chọn icon phù hợp
                  link: '/admin/song-approval'
              });
          }
      }
    });
  }
  // Kiểm tra xem user có permission MODERATE_SONG không
  hasModerateSongPermission(user: User | null): boolean {
    return user?.permissions?.includes('MODERATE_SONG') || false;
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

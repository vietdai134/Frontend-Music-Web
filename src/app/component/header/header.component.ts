import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user$: Observable<User | null> = new Observable();
  showDropdown = false;
  hideTimeout: any;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.user$ = this.loginService.user$;
  }

  goToLogin() {
    this.router.navigate(['/login']);
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

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  // Kiểm tra xem user có permission SYSTEM_MANAGEMENT không
  isAdmin(user: User | null): boolean { // Đổi tham số thành User | null để an toàn hơn
      return user?.permissions?.includes('SYSTEM_MANAGEMENT') || false;
  }

  // Hiển thị dropdown khi hover
  showDropdownMenu() {
    clearTimeout(this.hideTimeout);
    this.showDropdown = true;
  }

  // Ẩn dropdown sau khi rời chuột với delay
  hideDropdownWithDelay() {
    this.hideTimeout = setTimeout(() => {
      this.showDropdown = false;
    }, 300);
  }

  // Hủy ẩn nếu quay lại
  cancelHideDropdown() {
    clearTimeout(this.hideTimeout);
  }

  // Ẩn ngay lập tức nếu cần
  hideDropdown() {
    this.showDropdown = false;
  }
}
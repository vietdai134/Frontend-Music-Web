import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SearchService } from '../../services/SearchServices/search.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule
  ],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user$: Observable<User | null> = new Observable();
  showDropdown = false;
  hideTimeout: any;
  searchKeyword: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private searchService: SearchService
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

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchKeyword = inputElement.value;
    console.log(this.searchKeyword);
    this.searchService.setTitleOrArtistSong(this.searchKeyword); 
  }
}
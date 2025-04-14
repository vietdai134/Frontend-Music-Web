import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/LoginServices/login.service';
import { Observable, Subscription } from 'rxjs';
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
import { MatIconModule } from '@angular/material/icon';
import { SidebarService } from '../../services/SidebarServices/sidebar.service';
import { MatSelectModule } from '@angular/material/select';

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
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule
  ],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy{
  user$: Observable<User | null> = new Observable();
  showDropdown = false;
  hideTimeout: any;
  searchKeyword: string = '';
  selected = 'title';
  isSidebarVisible: boolean = true;
  private sidebarSubscription!: Subscription;
  
  constructor(
    private router: Router,
    private loginService: LoginService,
    private searchService: SearchService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.user$ = this.loginService.user$;
    this.sidebarSubscription = this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isSidebarVisible = visible
    );
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
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
    console.log(this.selected);
    // this.searchService.setKeyword(this.searchKeyword, this.selected);
    this.searchService.setKeyword(this.searchKeyword);
    this.searchService.setTypeSearch(this.selected);
  }
  onTypeChange() {
    console.log('Type changed to:', this.selected);
    this.searchService.setTypeSearch(this.selected);
    // Nếu có keyword, gửi lại để kích hoạt tìm kiếm
    if (this.searchKeyword) {
      this.searchService.setKeyword(this.searchKeyword);
    }
  }
  goHome() {
    this.router.navigate(['/']);
  }
}
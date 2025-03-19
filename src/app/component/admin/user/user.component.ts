import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../services/UserServices/user.service';
import { User } from '../../../models/user.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Role } from '../../../models/role.module';
import { ConfirmDeleteComponent } from '../../dialog/confirm-delete/confirm-delete.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [DatePipe]
})
export class UserComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['userId', 'userName', 'email', 'accountType', 'roles','createdDate', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchKeyword: string = ''; // Khai báo biến searchKeyword

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadUsers(this.currentPage, this.pageSize);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; // Gắn paginator vào dataSource
  }

  loadUsers(page: number, size: number): void {
    this.userService.getAllUsers(page, size).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers(this.currentPage, this.pageSize);
  }

  getRolesDisplay(user: User): string {
    return user.roles.length > 0 
      ? user.roles.map((role: Role) => role.roleName).join(', ') 
      : 'Không có quyền';
  }

  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      data: { userId } // Truyền userId vào dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Nếu người dùng xác nhận xóa
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            console.log(`Delete user with ID: ${userId}`);
            this.loadUsers(this.currentPage, this.pageSize); // Tải lại danh sách sau khi xóa
          },
          error: (err) => {
            console.error('Error deleting user:', err);
          }
        });
      }
    });
  }

  editUser(userId: number): void {
    console.log(`Edit user with ID: ${userId}`);
  }

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchKeyword = inputElement.value;
    console.log(this,this.searchKeyword);
    this.searchUsers(this.currentPage, this.pageSize);
    
  }

  searchUsers(page: number, size: number): void {
    if (!this.searchKeyword.trim()) {
      this.loadUsers(page, size); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
      return;
    }
    this.userService.searchUsers(this.searchKeyword, page, size).subscribe({
      next: (response) => { // Xác định kiểu dữ liệu
        this.dataSource.data = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err: any) => { // Xác định kiểu dữ liệu
        console.error('Error searching users:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss') || '';
  }
}
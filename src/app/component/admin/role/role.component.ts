import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Role } from '../../../models/role.module';
import { RoleService } from '../../../services/RoleServices/role.service';
import { ConfirmDeleteComponent } from '../../dialog/confirm-delete/confirm-delete.component';
import { Permission } from '../../../models/permission.module';
import { RoleDialogComponent } from '../../dialog/role-dialog/role-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-role',
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
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss',
  providers: [DatePipe]
})
export class RoleComponent implements OnInit{
  displayedColumns: string[] = ['roleId', 'roleName', 'description', 'permissions', 'assignedDate','actions'];
  roles:Role[]=[];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchKeyword: string = ''; // Khai báo biến searchKeyword

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private roleService: RoleService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ){}

  ngOnInit(): void {
    this.loadRoles(this.currentPage, this.pageSize);
  }

  loadRoles(page: number, size: number): void {
    this.roleService.getPageAllRoles(page, size).subscribe({
      next: (response) => {
        this.roles = response.content;
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
    // this.loadUsers(this.currentPage, this.pageSize);
    if (this.searchKeyword.trim()) {
      this.searchRoles(this.currentPage, this.pageSize);
    } else {
      this.loadRoles(this.currentPage, this.pageSize);
    }
  }

  getPermissionsDisplay(role: Role): string {
    return role.permissions.length > 0 
      ? role.permissions.map((permission: Permission) => permission.permissionName).join(', ') 
      : 'Không có quyền';
  }

  deleteRole(roleId: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      data: { 
        // userId 
        entity:'role',
        id:roleId
      } // Truyền roleId vào dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Nếu người dùng xác nhận xóa
        this.roleService.deleteRole(roleId).subscribe({
          next: () => {
            console.log(`Delete user with ID: ${roleId}`);
            this.loadRoles(this.currentPage, this.pageSize); // Tải lại danh sách sau khi xóa
          },
          error: (err) => {
            console.error('Error deleting user:', err);
          }
        });
      }
    });
  }

  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchKeyword = inputElement.value;
    console.log(this,this.searchKeyword);
    // Reset currentPage về 0 khi tìm kiếm
    this.currentPage = 0;
    
    // Cập nhật paginator để hiển thị trang đầu tiên
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.searchRoles(this.currentPage, this.pageSize);
    
  }

  searchRoles(page: number, size: number): void {
    if (!this.searchKeyword.trim()) {
      this.loadRoles(page, size); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
      return;
    }
    this.roleService.searchRoles(this.searchKeyword, page, size).subscribe({
      next: (response) => { // Xác định kiểu dữ liệu
        this.roles = response.content;
        this.totalElements = response.page.totalElements;
        this.pageSize = response.page.size;
        this.currentPage = response.page.number;
      },
      error: (err: any) => { // Xác định kiểu dữ liệu
        console.error('Error searching users:', err);
      }
    });
  }

  createRole(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles(this.currentPage, this.pageSize);
      }
    });
  }

  // Cập nhật method editUser
  editRole(roleId: number): void {
    console.log(`Edit user with ID: ${roleId}`);
    this.roleService.getRoleById(roleId).subscribe({
      next: (role) => {
        const dialogRef = this.dialog.open(RoleDialogComponent, {
          width: '400px',
          disableClose: true,
          data: { role } // Truyền dữ liệu user vào dialog
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadRoles(this.currentPage, this.pageSize);
          }
        });
      },
      error: (err) => console.error('Error fetching user:', err)
    });
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm:ss') || '';
  }
}

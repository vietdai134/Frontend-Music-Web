import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Permission } from '../../../models/permission.module';
import { PermissionService } from '../../../services/PermissionServices/permission.service';
import { ConfirmDeleteComponent } from '../../dialog/confirm-delete/confirm-delete.component';
import { PermissionDialogComponent } from '../../dialog/permission-dialog/permission-dialog.component';

@Component({
  selector: 'app-permission',
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
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss'
})
export class PermissionComponent implements OnInit{
  displayedColumns: string[] = ['permissionId', 'permissionName','description','actions'];
  permissions: Permission[] = [];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  searchKeyword: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private permissionService: PermissionService,
    private dialog: MatDialog,
  ){}

  ngOnInit(): void {
    this.loadPermissions(this.currentPage, this.pageSize);
  }

  loadPermissions(page: number, size: number): void {
    this.permissionService.getPageAllPermissions(page, size).subscribe({
      next: (response) => {
        // console.log('API Response:', response);
        this.permissions = response.content;
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
    // Kiểm tra xem có từ khóa tìm kiếm hay không
    if (this.searchKeyword.trim()) {
      this.searchPermissions(this.currentPage, this.pageSize);
    } else {
      this.loadPermissions(this.currentPage, this.pageSize);
    }
  }

  deletePermission(permissionId: number): void {
      const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
        width: '300px',
        data: { 
          entity:'permission',
          id:permissionId
        } 
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // Nếu người dùng xác nhận xóa
          this.permissionService.deletePermission(permissionId).subscribe({
            next: () => {
              console.log(`Delete user with ID: ${permissionId}`);
              this.loadPermissions(this.currentPage, this.pageSize); // Tải lại danh sách sau khi xóa
            },
            error: (err) => {
              console.error('Error deleting user:', err);
            }
          });
        }
      });
    }
  
    editPermission(permissionId: number): void {
      console.log(`Edit genre with ID: ${permissionId}`);
      this.permissionService.getPermissionById(permissionId).subscribe({
        next: (permission) => {
          console.log(permission)
          const dialogRef = this.dialog.open(PermissionDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { permission } // Truyền dữ liệu user vào dialog
          });
  
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.loadPermissions(this.currentPage, this.pageSize);
            }
          });
        },
        error: (err) => console.error('Error fetching user:', err)
      });
    }

  createPermission(): void {
      const dialogRef = this.dialog.open(PermissionDialogComponent, {
        width: '400px',
        disableClose: true
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadPermissions(this.currentPage, this.pageSize);
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
      this.searchPermissions(this.currentPage, this.pageSize);
      
    }
  
    searchPermissions(page: number, size: number): void {
      if (!this.searchKeyword.trim()) {
        this.loadPermissions(page, size); // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách
        return;
      }
      this.permissionService.searchPermissions(this.searchKeyword, page, size).subscribe({
        next: (response) => { // Xác định kiểu dữ liệu
          this.permissions = response.content;
          this.totalElements = response.page.totalElements;
          this.pageSize = response.page.size;
          this.currentPage = response.page.number;
        },
        error: (err: any) => { // Xác định kiểu dữ liệu
          console.error('Error searching users:', err);
        }
      });
    }
}

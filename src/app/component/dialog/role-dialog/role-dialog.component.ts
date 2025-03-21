import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Permission } from '../../../models/permission.module';
import { PermissionService } from '../../../services/PermissionServices/permission.service';
import { RoleService } from '../../../services/RoleServices/role.service';

@Component({
  selector: 'app-role-dialog',
  imports: [
    MatDialogModule,       // Thêm module cho dialog
    MatFormFieldModule,    // Cho mat-form-field
    MatInputModule,        // Cho input
    MatSelectModule,       // Cho mat-select
    MatButtonModule,       // Cho button
    FormsModule,           // Cho ngModel (nếu cần)
    ReactiveFormsModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './role-dialog.component.html',
  styleUrl: './role-dialog.component.scss'
})
export class RoleDialogComponent {
  roleForm: FormGroup;
  isEditMode: boolean;
  availablePermissions:Permission[]= [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    private permissionService: PermissionService,
    private roleService: RoleService,
    @Inject(MAT_DIALOG_DATA) 
    public data: any
  ){
    this.isEditMode = !!data?.role; // Nếu có user truyền vào thì là edit mode

    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      description: ['', Validators.required],
      permissionNames:[[]]
    });

    if (this.isEditMode) {
      // this.userForm.patchValue(data.user); // Điền dữ liệu user hiện tại vào form
      this.roleForm.patchValue({
        ...data.role,
        permissionNames: data.role.permissions.map((permission: Permission) => permission.permissionName) // Chuyển roles thành mảng roleName
      });
    }
  }
  ngOnInit(): void {
    this.getAllPermissions();
  }
  removePermission(permission: string): void {
    const currentPermissions = this.roleForm.get('permissionNames')?.value as string[];
    this.roleForm.get('permissionNames')?.setValue(currentPermissions.filter(p => p !== permission));
  }
  onSubmit() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      if (this.isEditMode) {
        console.log(this.data.role.roleId);
        console.log(roleData);
        this.roleService.updateRole(this.data.role.roleId, roleData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error updating role:', err)
        });
        console.log("edit mode");
      } else {
        // console.log(userData)
        this.roleService.createRole(roleData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error creating role:', err)
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getAllPermissions(){
    // Gọi API để lấy danh sách roles
    this.permissionService.getListAllPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions; // Cập nhật availableRoles từ API
      },
      error: (err) => {
        console.error('Error fetching permissions:', err);
      }
    });
  }
}

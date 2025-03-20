import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/UserServices/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Role } from '../../../models/role.module';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../../services/RoleServices/role.service';

@Component({
  selector: 'app-user-dialog',
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
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent implements OnInit{
  userForm: FormGroup;
  isEditMode: boolean;
  availableRoles:Role[]= [];
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private userService: UserService,
    private roleService: RoleService,
    @Inject(MAT_DIALOG_DATA) 
    public data: any
  ){
    this.isEditMode = !!data?.user; // Nếu có user truyền vào thì là edit mode

    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      accountType: ['', Validators.required],
      roleNames:[[]]
    });

    if (this.isEditMode) {
      // this.userForm.patchValue(data.user); // Điền dữ liệu user hiện tại vào form
      this.userForm.patchValue({
        ...data.user,
        roleNames: data.user.roles.map((role: Role) => role.roleName) // Chuyển roles thành mảng roleName
      });
    }
  }
  ngOnInit(): void {
    this.getAllRoles();
  }
  removeRole(role: string): void {
    const currentRoles = this.userForm.get('roleNames')?.value as string[];
    this.userForm.get('roleNames')?.setValue(currentRoles.filter(r => r !== role));
  }
  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      if (this.isEditMode) {
        console.log(this.data.user.userId);
        console.log(userData);
        this.userService.updateUser(this.data.user.userId, userData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error updating user:', err)
        });
        console.log("edit mode");
      } else {
        // console.log(userData)
        this.userService.createUser(userData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => console.error('Error creating user:', err)
        });
      }
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getAllRoles(){
    // Gọi API để lấy danh sách roles
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles; // Cập nhật availableRoles từ API
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }
}

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
import { minSelectionValidator } from '../../../shared/Validators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Thêm module spinner

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
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent implements OnInit{
  userForm: FormGroup;
  isEditMode: boolean;
  availableRoles:Role[]= [];
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  
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
      roleNames:[[],minSelectionValidator(1)],
      userAvatar: ['']
    });

    if (this.isEditMode) {
      // this.userForm.patchValue(data.user); // Điền dữ liệu user hiện tại vào form
      this.userForm.patchValue({
        ...data.user,
        roleNames: data.user.roles.map((role: Role) => role.roleName), // Chuyển roles thành mảng roleName
        userAvatar: data.user.avatar
      });
    }
  }
  ngOnInit(): void {
    this.getAllRoles();
    console.log(this.data.user)
  }
  removeRole(role: string): void {
    const currentRoles = this.userForm.get('roleNames')?.value as string[];
    this.userForm.get('roleNames')?.setValue(currentRoles.filter(r => r !== role));
  }
  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      const requestData = {
        userName: userData.userName,
        email: userData.email,
        password: userData.password,
        accountType: userData.accountType,
        roleNames: userData.roleNames,
        avatar: this.selectedFile || undefined // Thêm file ảnh từ selectedFile
      };
      // console.log('Request Data:', requestData);
      if (this.isEditMode) {
        console.log(this.data.user.userId);
        // console.log(userData);
        // this.userService.updateUser(this.data.user.userId, userData).subscribe({
        this.userService.updateUser(this.data.user.userId, requestData).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => 
            console.error('Error updating user:', err)
        });
        console.log("edit mode");
      } else {  
        console.log(requestData)
        this.userService.createUser(requestData).subscribe({
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
    this.roleService.getListAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles; // Cập nhật availableRoles từ API
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      console.log('Selected file:', this.selectedFile);
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.selectedFileName = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}

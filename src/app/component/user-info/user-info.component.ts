import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/LoginServices/login.service';
import { User } from '../../models/user.module';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/UserServices/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-user-info',
  imports: [
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit{
  user!: User;
  isLoadingImg = false;
  isLoadingPass= false;
  isLoadingUserName= false;
  originalUsername = '';
  usernameChanged = false;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  passwordMismatch = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | '' = '';

  isLocal=false;

  constructor(
    private LoginService: LoginService,
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(){
    this.LoginService.getUserInfo().subscribe({
      next: (response) => {
        console.log('load user info successfully:', response);
        this.user=response;
        this.originalUsername = this.user.userName;
        this.checkAuthProvider(this.user.authProvider);
      }
      , error: (err) => {
        console.error('Error loading user info:', err);
      }
    });
  }

  checkAuthProvider(authProvider: string){
    if (!authProvider.includes("LOCAL")){
      this.isLocal=false;
    }
    else{
      this.isLocal=true;
    }
  }
  checkUsernameChange() {
    this.usernameChanged = this.user.userName !== this.originalUsername;
  }

  updateUsername() {
    this.userService.userUpdateInfo(this.user.userName).subscribe({
      next: (response) => {
        console.log('userName updated successfully:', response);
        this.isLoadingUserName = false;
        // Reload user info to refresh the avatar
        this.loadUserInfo();
      },
      error: (err) => {
        console.error('Error updating userName:', err);
        this.isLoadingUserName = false;
        alert('Failed to update userName.');
      }
    });
    console.log('Username updated to:', this.user.userName);
    this.originalUsername = this.user.userName;
    this.usernameChanged = false;
  }

  checkPasswordMatch() {
    this.passwordMismatch = this.passwordForm.newPassword !== this.passwordForm.confirmPassword
      && this.passwordForm.confirmPassword !== '';
    this.clearNotification();
  }

  changePassword() {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!newPassword || !confirmPassword) {
      this.notificationMessage = 'Vui lòng điền đầy đủ các trường mật khẩu!';
      this.notificationType = 'error';
      return;
    }

    if (this.passwordMismatch) {
      this.notificationMessage = 'Mật khẩu xác nhận không khớp!';
      this.notificationType = 'error';
      return;
    }
    this.isLoadingPass=false;
    // Call API to change password
    console.log('Changing password:', this.passwordForm);
    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        console.log('Password changed successfully:', response);
        this.notificationMessage = response.message || 'Đổi mật khẩu thành công!';
        this.notificationType = 'success';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.isLoadingPass=false;
        this.passwordMismatch = false;
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (err) => {
        console.error('Error changing password:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.isLoadingPass = false;
        this.notificationMessage = err.error?.message || 'Đổi mật khẩu thất bại!';
        this.notificationType = 'error';
      }
    });
  }

  changeAvatar() {
    // this.userService.userUpdateImage()
    const avatarInput = document.getElementById('avatarInput') as HTMLInputElement;
    avatarInput.click();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Check if the file is an image
      if (file.type.startsWith('image/')) {
        this.isLoadingImg = true;
        // Call userService to update the avatar
        this.userService.userUpdateImage(file).subscribe({
          next: (response) => {
            console.log('Avatar updated successfully:', response);
            this.isLoadingImg = false;
            // Reload user info to refresh the avatar
            this.loadUserInfo();
          },
          error: (err) => {
            console.error('Error updating avatar:', err);
            this.isLoadingImg = false;
            alert('Failed to update avatar.');
          }
        });
      } else {
        console.log('Invalid file type:', file.type);
        alert('Vui lòng chọn một file ảnh!');
      }
    }
  }
  clearNotification() {
    this.notificationMessage = '';
    this.notificationType = '';
  }
}

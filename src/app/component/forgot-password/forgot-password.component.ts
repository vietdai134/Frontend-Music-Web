import { Component, OnDestroy } from '@angular/core';
import { LoginService } from '../../services/LoginServices/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnDestroy {
  email: string = '';
  message: string = '';
  error: string = '';
  isButtonDisabled: boolean = false;
  countdown: number = 60;
  private countdownInterval: any;

  constructor(
    private loginService: LoginService
  ) {}

  onSubmit() {
    if(this.email){

      this.loginService.forgotPassword(this.email).subscribe({
            next: (response) => {
              this.message = response.message; // "Đã gửi link reset về email nếu tồn tại"
              this.error = '';
            },
            error: (err) => {
              this.error = 'Có lỗi xảy ra. Vui lòng thử lại.';
              this.message = '';
            },
          });
        this.isButtonDisabled = true;
        this.countdown = 60; // Reset đếm ngược về 60s
        this.message =
          'Vui lòng kiểm tra Gmail (nếu không thấy, hãy tìm thử trong spam)';
        this.error = '';
  
        // Bắt đầu đếm ngược
        this.countdownInterval = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            this.isButtonDisabled = false;
            this.message = ''; // Xóa thông báo sau 60s (tùy chọn)
            clearInterval(this.countdownInterval);
          }
        }, 1000);
    }
    else{
      this.error = 'Vui lòng nhập email hợp lệ';
      this.message = '';
    }
    
  }
  ngOnDestroy() {
    // Clear interval khi component bị hủy để tránh memory leak
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}

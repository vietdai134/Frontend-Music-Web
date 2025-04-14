import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/LoginServices/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit{
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  error: string = '';
  

  constructor(
    private route: ActivatedRoute, 
    private loginService: LoginService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Lấy token từ query parameter
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Mật khẩu không khớp';
      return;
    }

    this.loginService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.message = response.message; // "Đặt lại mật khẩu thành công"
        this.error = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Token không hợp lệ hoặc đã hết hạn';
        this.message = '';
      },
    });
  }
}

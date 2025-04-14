import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../services/LoginServices/login.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private loginService: LoginService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.loginService.userLogin(this.loginForm.value.email, this.loginForm.value.password).subscribe(
        (res:any) => {
          // console.log('Login Success:', res?.message);
          // alert('Đăng nhập thành công!');
          // this.router.navigate(['/']);
          this.successMessage = 'Đăng nhập thành công!';
          this.errorMessage = '';
  
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        (err) => {
          // console.log('Login Error:', err);
          // alert('Đăng nhập thất bại!');
          this.errorMessage = 'Email hoặc mật khẩu không đúng!';
          this.successMessage = '';
        }
      );
    }
  }

  goSignUp() {
    this.router.navigate(['/signup']);
  }
  goForgetPassword(){
    this.router.navigate(['/forgot-password'])
  }
}

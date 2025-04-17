import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/UserServices/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, OnDestroy{
  signupForm: FormGroup;
  isSubmitted = false;

  successMessage = '';
  errorMessage = '';

  private verificationSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private userService: UserService,
    private route: ActivatedRoute
  ){
    this.signupForm = this.fb.group({
      userName:['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
        this.successMessage = '';
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.signupForm.valid) {
      const userData = this.signupForm.value;
      this.userService.registerUser(userData).subscribe(
        (res:any) => {
          this.successMessage = 'Vui lòng kiểm tra Gmail (bao gồm cả thư mục Spam) để xác thực email.';
          this.errorMessage = '';
          this.checkVerificationStatus(userData.email);
        },
        (err) => {
          this.errorMessage = 'Email đã tồn tại!';
          this.successMessage = '';
        }
      );
    }
  }

  checkVerificationStatus(email: string) {
    let attempts = 0;
    const maxAttempts = 300; // 15 phút với interval 5 giây
    this.verificationSubscription = interval(3000).subscribe(() => {
      if (attempts >= maxAttempts) {
        this.verificationSubscription?.unsubscribe();
        this.errorMessage = 'Link xác minh đã hết hạn. Vui lòng thử lại.';
        this.successMessage = '';
        return;
      }
      this.userService.checkEmailVerify(email).subscribe(
        (response) => {
          if (response.isVerified) {
            this.successMessage = 'Xác minh email thành công! Chuyển hướng đến trang đăng nhập...';
            this.errorMessage = '';
            this.verificationSubscription?.unsubscribe();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        },
        (err) => {
          console.error('Error checking verification status:', err);
        }
      );
      attempts++;
    });
  }

  ngOnDestroy() {
    if (this.verificationSubscription) {
      this.verificationSubscription.unsubscribe();
    }
  }

  goLogin(){
    this.router.navigate(['/login']);
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/UserServices/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitted = false;

  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private userService: UserService
  ){
    this.signupForm = this.fb.group({
      userName:['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.signupForm.valid) {
      const userData = this.signupForm.value;
      this.userService.registerUser(userData).subscribe(
        (res:any) => {
          console.log('Signup Success:', res?.message);
          alert('Dăng ký thành công!');
          this.router.navigate(['/']);
        },
        (err) => {
          console.log('Signup Error:', err);
          alert('Đăng ký thất bại!');
        }
      );
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthService, Role } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  role: Role = 'student';
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.toastr.error('Password must be at least 6 characters');
      return;
    }

    this.isSubmitting = true;

    try {
      await this.auth.register(this.email, this.password, this.name, this.role);
      this.toastr.success('✅ Account created! Please check your email to verify your account, then sign in.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error?.code === 'auth/email-already-in-use' || error?.message?.includes('email-already-in-use')) {
        this.toastr.error('⚠️ This email is already registered. Please use a different email or sign in.');
      } else if (error?.code === 'auth/invalid-email' || error?.message?.includes('invalid-email')) {
        this.toastr.error('⚠️ Invalid email address.');
      } else if (error?.code === 'auth/weak-password' || error?.message?.includes('weak-password')) {
        this.toastr.error('⚠️ Password is too weak. Please choose a stronger password.');
      } else {
        this.toastr.error('⚠️ Registration failed. Please try again.');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePassword(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
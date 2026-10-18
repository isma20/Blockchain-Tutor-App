import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminAuthService } from '../admin-auth/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  hideCredentials = true;

  constructor(
    private fb: FormBuilder,
    private adminAuth: AdminAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if already logged in
    if (this.adminAuth.isLoggedIn()) {
      this.router.navigate(['/admin-panel']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      
      try {
        const success = await this.adminAuth.login(
          this.loginForm.value.email,
          this.loginForm.value.password
        );
        
        if (success) {
          this.router.navigate(['/admin-panel']);
        } else {
          this.loginForm.setErrors({ invalid: true });
        }
      } catch (error) {
        this.loginForm.setErrors({ invalid: true });
      } finally {
        this.loading = false;
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleCredentialsVisibility() {
    this.hideCredentials = !this.hideCredentials;
  }

  getCredentials() {
    return this.adminAuth.getAdminCredentials();
  }

  getErrorMessage() {
    if (this.loginForm.hasError('invalid')) {
      return 'Invalid email or password';
    }
    
    if (this.loginForm.get('email')?.hasError('required')) {
      return 'Email is required';
    }
    
    if (this.loginForm.get('email')?.hasError('email')) {
      return 'Please enter a valid email';
    }
    
    if (this.loginForm.get('password')?.hasError('required')) {
      return 'Password is required';
    }
    
    if (this.loginForm.get('password')?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    
    return '';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback (you could use a snackbar here)
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}

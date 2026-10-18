import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService, Role } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { signInWithEmailAndPassword, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = 'student@example.com';
  password = '';
  role: Role = 'student';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const verified = this.route.snapshot.queryParamMap.get('verified');
    if (verified === '1' || verified === 'true') {
      this.toastr.success('Email verified successfully. You can now sign in.');
    }
  }

  async onSubmit() {
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', this.email);
    console.log('🔑 Password length:', this.password.length);
    console.log('👤 Role:', this.role);
    
    try {
      console.log('🚀 Calling auth.login...');
      const user = await this.auth.login(this.email, this.password, this.role);
      console.log('✅ Login successful:', user);
      this.toastr.success(`✅ Welcome, ${user.name}!`);
      console.log('🔄 Navigating to dashboard...');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('❌ Login error details:', error);
      console.error('📝 Error message:', error?.message);
      console.error('🔍 Error code:', error?.code);
      
      if (error?.message?.includes('verify your email')) {
        console.log('📧 Email verification required');
        this.toastr.error('⚠️ Please verify your email before logging in. Check your inbox for the verification link.');
        return;
      }
      if (error?.message?.includes('invalid-email') || error?.message?.includes('invalid-credential')) {
        console.log('🚫 Invalid credentials');
        this.toastr.error('⚠️ Invalid email or password.');
        return;
      }
      if (error?.message?.includes('user-not-found')) {
        console.log('👤 User not found');
        this.toastr.error('⚠️ No account found with this email. Please register first.');
        return;
      }
      if (error?.message?.includes('wrong-password')) {
        console.log('🔑 Wrong password');
        this.toastr.error('⚠️ Incorrect password. Please try again.');
        return;
      }
      this.toastr.error('⚠️ Login failed. Please try again.');
    }
  }

  async resendVerification() {
    try {
      await this.auth.resendVerificationEmail();
      this.toastr.success('✅ Verification email sent. Please check your inbox.');
    } catch {
      this.toastr.error('⚠️ Failed to resend verification email.');
    }
  }
}
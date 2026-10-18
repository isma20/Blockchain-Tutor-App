import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-router">
      <div class="loading" *ngIf="!user">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard...</p>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    console.log('🚀 Dashboard component initializing...');
    const ok = await this.auth.ensureSession();
    console.log('📊 ensureSession result:', ok);
    
    if (!ok) {
      console.log('❌ Session invalid, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
    console.log('👤 User data:', this.user);
    
    // Route to appropriate dashboard based on role
    if (this.user?.role === 'admin') {
      console.log('👑 Redirecting to admin dashboard');
      this.router.navigate(['/dashboard/admin']);
    } else if (this.user?.role === 'tutor') {
      console.log('🎓 Redirecting to tutor dashboard');
      this.router.navigate(['/dashboard/tutor']);
    } else {
      console.log('📚 Redirecting to student dashboard');
      this.router.navigate(['/dashboard/student']);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
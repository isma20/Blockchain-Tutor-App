import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user: any = null;
  
  // System Stats
  totalUsers = 3456;
  totalTutors = 234;
  totalStudents = 3222;
  totalRevenue = 125000;
  activeSessions = 45;

  // Recent Activity
  recentActivity = [
    {
      type: 'user_registration',
      user: 'John Doe',
      role: 'Student',
      time: '5 minutes ago',
      icon: 'person_add'
    },
    {
      type: 'session_completed',
      user: 'Mansour Al-Monsour',
      role: 'Tutor',
      time: '15 minutes ago',
      icon: 'video_call'
    },
    {
      type: 'payment_processed',
      user: 'Maria Garcia',
      role: 'Student',
      time: '1 hour ago',
      icon: 'payments'
    }
  ];

  // Pending Approvals
  pendingTutors = [
    {
      name: 'Dr. Emily Watson',
      specialty: 'Physics',
      experience: '10 years',
      appliedDate: '2024-01-15',
      documents: ['CV', 'Certificates', 'ID Proof']
    },
    {
      name: 'Prof. James Chen',
      specialty: 'Mathematics',
      experience: '8 years',
      appliedDate: '2024-01-14',
      documents: ['CV', 'Certificates']
    }
  ];

  // System Analytics
  analyticsData = [
    { metric: 'Daily Active Users', value: 1234, change: '+12%' },
    { metric: 'New Registrations', value: 45, change: '+8%' },
    { metric: 'Session Completion Rate', value: '94%', change: '+2%' },
    { metric: 'User Satisfaction', value: '4.8/5', change: '+0.2' }
  ];

  // Table data for users
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'joinDate', 'actions'];
  usersData = [
    { name: 'Alex Thompson', email: 'alex@example.com', role: 'Student', status: 'Active', joinDate: '2024-01-10' },
    { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Tutor', status: 'Active', joinDate: '2024-01-08' },
    { name: 'Mike Wilson', email: 'mike@example.com', role: 'Student', status: 'Inactive', joinDate: '2024-01-05' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const ok = await this.auth.ensureSession();
    if (!ok) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  approveTutor(tutor: any) {
    console.log('Approving tutor:', tutor.name);
  }

  rejectTutor(tutor: any) {
    console.log('Rejecting tutor:', tutor.name);
  }

  viewUserDetails(user: any) {
    console.log('Viewing details for:', user.name);
  }

  suspendUser(user: any) {
    console.log('Suspending user:', user.name);
  }

  generateReport() {
    console.log('Generating system report');
  }

  exportData() {
    console.log('Exporting system data');
  }

  viewAnalytics() {
    console.log('Opening detailed analytics');
  }
}

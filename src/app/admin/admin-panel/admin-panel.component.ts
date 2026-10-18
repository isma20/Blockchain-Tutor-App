import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { UserManagementService, UserAccount, StudentGrade, UserAction } from '../../services/user-management.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatExpansionModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  loading = true;
  
  // Data
  users: UserAccount[] = [];
  grades: StudentGrade[] = [];
  userActions: UserAction[] = [];
  selectedUser: UserAccount | null = null;
  
  // Stats
  userStats = {
    total: 0,
    students: 0,
    tutors: 0,
    admins: 0,
    active: 0,
    suspended: 0,
    pending: 0
  };
  
  gradeStats = {
    totalGrades: 0,
    averageGrade: 0,
    gradesBySubject: {} as { [subject: string]: number },
    recentGrades: [] as StudentGrade[]
  };
  
  // Table configurations
  userColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];
  gradeColumns: string[] = ['studentName', 'tutorName', 'subject', 'grade', 'assignment', 'gradedAt', 'actions'];
  actionColumns: string[] = ['userId', 'action', 'reason', 'performedBy', 'performedAt'];
  
  // Forms
  userForm: FormGroup;
  actionForm: FormGroup;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private adminAuth: AdminAuthService,
    private userManagement: UserManagementService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['student', [Validators.required]],
      status: ['active', [Validators.required]]
    });

    this.actionForm = this.fb.group({
      userId: ['', [Validators.required]],
      action: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    if (!this.adminAuth.isLoggedIn()) {
      this.router.navigate(['/admin-login']);
      return;
    }

    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData() {
    this.loading = true;
    
    // Load users
    const userSub = this.userManagement.getAllUsers().subscribe(users => {
      this.users = users;
      this.loadUserStats();
    });
    
    // Load grades
    const gradeSub = this.userManagement.getGradeStats().subscribe(stats => {
      this.gradeStats = stats;
    });
    
    // Load user actions
    const actionSub = this.userManagement.getUserActions('').subscribe(actions => {
      this.userActions = actions;
    });
    
    // Load user stats
    const statsSub = this.userManagement.getUserStats().subscribe(stats => {
      this.userStats = stats;
      this.loading = false;
    });
    
    this.subscriptions.push(userSub, gradeSub, actionSub, statsSub);
  }

  private loadUserStats() {
    this.userStats = {
      total: this.users.length,
      students: this.users.filter(u => u.role === 'student').length,
      tutors: this.users.filter(u => u.role === 'tutor').length,
      admins: this.users.filter(u => u.role === 'admin').length,
      active: this.users.filter(u => u.status === 'active').length,
      suspended: this.users.filter(u => u.status === 'suspended').length,
      pending: this.users.filter(u => u.status === 'pending').length
    };
  }

  // User Management Actions
  async createUser() {
    if (this.userForm.valid) {
      try {
        await this.userManagement.createUser(this.userForm.value);
        this.userForm.reset();
        this.loadData();
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  }

  async suspendUser(user: UserAccount) {
    const reason = prompt(`Enter reason for suspending ${user.name}:`);
    if (reason) {
      try {
        await this.userManagement.suspendUser(user.id, reason, 'Admin');
        this.loadData();
      } catch (error) {
        console.error('Error suspending user:', error);
      }
    }
  }

  async activateUser(user: UserAccount) {
    const reason = `Activating ${user.name} account`;
    try {
      await this.userManagement.activateUser(user.id, reason, 'Admin');
      this.loadData();
    } catch (error) {
      console.error('Error activating user:', error);
    }
  }

  async deleteUser(user: UserAccount) {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      const reason = prompt(`Enter reason for deleting ${user.name}:`);
      if (reason) {
        try {
          await this.userManagement.deleteUser(user.id, reason, 'Admin');
          this.loadData();
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      }
    }
  }

  async changeUserRole(user: UserAccount, newRole: 'student' | 'tutor' | 'admin') {
    const reason = prompt(`Enter reason for changing ${user.name}'s role to ${newRole}:`);
    if (reason) {
      try {
        await this.userManagement.changeUserRole(user.id, newRole, reason, 'Admin');
        this.loadData();
      } catch (error) {
        console.error('Error changing user role:', error);
      }
    }
  }

  viewUserDetails(user: UserAccount) {
    this.selectedUser = user;
  }

  // Grade Management
  async deleteGrade(gradeId: string) {
    if (confirm('Are you sure you want to delete this grade?')) {
      try {
        await this.userManagement.deleteGrade(gradeId);
        this.loadData();
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  }

  // Utility Methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'suspended': return 'warn';
      case 'pending': return 'accent';
      default: return 'primary';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'warn';
      case 'tutor': return 'primary';
      case 'student': return 'accent';
      default: return 'primary';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'suspend': return 'warn';
      case 'activate': return 'primary';
      case 'delete': return 'warn';
      case 'promote': return 'primary';
      case 'demote': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleDateString() : new Date(timestamp).toLocaleDateString();
  }

  formatDateTime(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
  }

  // Computed properties for template
  get gradeStatsKeys() {
    return Object.keys(this.gradeStats.gradesBySubject);
  }

  get todayActionsCount() {
    const today = new Date().toDateString();
    return this.userActions.filter(a => {
      let actionDate: string;
      if (a.performedAt && typeof a.performedAt === 'object' && 'toDate' in a.performedAt) {
        actionDate = (a.performedAt as any).toDate().toDateString();
      } else {
        actionDate = new Date(a.performedAt).toDateString();
      }
      return actionDate === today;
    }).length;
  }

  get gradedStudentsCount() {
    if (this.grades.length === 0) return 0;
    return new Set(this.grades.map(g => g.studentId)).size;
  }

  // Navigation
  logout() {
    this.adminAuth.logout();
    this.router.navigate(['/admin-login']);
  }

  // Quick Actions
  refreshData() {
    this.loadData();
  }

  exportData() {
    const data = {
      users: this.users,
      grades: this.gradeStats.recentGrades,
      userActions: this.userActions,
      stats: {
        users: this.userStats,
        grades: this.gradeStats
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-panel-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Get user name by ID
  getUserNameById(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  }
}

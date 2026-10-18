import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService, User, Role } from '../../auth/auth.service';

@Component({
  selector: 'app-role-navigation',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './role-navigation.component.html',
  styleUrls: ['./role-navigation.component.scss']
})
export class RoleNavigationComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isAdmin = false;
  isTutor = false;
  isStudent = false;

  private userSubscription: Subscription | undefined;

  constructor(
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      this.user = user;
      this.updateRoleFlags();
    });
    
    // Initial check
    this.user = this.auth.getUser();
    this.updateRoleFlags();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateRoleFlags() {
    this.isAdmin = this.user?.role === 'admin';
    this.isTutor = this.user?.role === 'tutor';
    this.isStudent = this.user?.role === 'student';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  navigateToDashboard() {
    if (!this.user) return;
    
    switch (this.user.role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'tutor':
        this.router.navigate(['/teacher']);
        break;
      case 'student':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  navigateToProfile() {
    if (!this.user) return;
    
    switch (this.user.role) {
      case 'admin':
        this.router.navigate(['/admin/profile']);
        break;
      case 'tutor':
        this.router.navigate(['/teacher/profile']);
        break;
      case 'student':
        this.router.navigate(['/dashboard/profile']);
        break;
      default:
        this.router.navigate(['/dashboard/profile']);
    }
  }

  navigateToSettings() {
    if (!this.user) return;
    
    switch (this.user.role) {
      case 'admin':
        this.router.navigate(['/admin/settings']);
        break;
      case 'tutor':
        this.router.navigate(['/teacher/settings']);
        break;
      case 'student':
        this.router.navigate(['/dashboard/settings']);
        break;
      default:
        this.router.navigate(['/dashboard/settings']);
    }
  }

  getRoleIcon(): string {
    switch (this.user?.role) {
      case 'admin': return 'admin_panel_settings';
      case 'tutor': return 'school';
      case 'student': return 'person';
      default: return 'person';
    }
  }

  getRoleLabel(): string {
    switch (this.user?.role) {
      case 'admin': return 'Administrator';
      case 'tutor': return 'Teacher';
      case 'student': return 'Student';
      default: return 'User';
    }
  }

  getNavigationItems(): { label: string; icon: string; route: string; roles: Role[] }[] {
    return [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        roles: ['student', 'tutor', 'admin']
      },
      {
        label: 'Students',
        icon: 'group',
        route: '/teacher',
        roles: ['tutor']
      },
      {
        label: 'Admin Panel',
        icon: 'admin_panel_settings',
        route: '/admin',
        roles: ['admin']
      },
      {
        label: 'My Sessions',
        icon: 'video_call',
        route: '/dashboard/sessions',
        roles: ['student', 'tutor']
      },
      {
        label: 'Messages',
        icon: 'message',
        route: '/dashboard/messages',
        roles: ['student', 'tutor', 'admin']
      },
      {
        label: 'Analytics',
        icon: 'analytics',
        route: '/dashboard/analytics',
        roles: ['tutor', 'admin']
      }
    ];
  }

  getFilteredNavigationItems() {
    return this.getNavigationItems().filter(item => 
      this.user && item.roles.includes(this.user.role)
    );
  }
}

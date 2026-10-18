import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard/student-dashboard.component';
import { TutorDashboardComponent } from './dashboard/tutor-dashboard/tutor-dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { authGuard } from './auth/auth.guard';
import { adminGuard, tutorGuard, studentGuard } from './auth/role.guard';
import { adminAuthGuard } from './admin/admin-auth/admin-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { 
    path: 'landing', 
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/student', component: StudentDashboardComponent, canActivate: [studentGuard] },
  { 
    path: 'dashboard/student/tutor/:id', 
    loadComponent: () => import('./dashboard/student-dashboard/tutor-profile-view/tutor-profile-view.component').then(m => m.TutorProfileViewComponent),
    canActivate: [studentGuard]
  },
  { path: 'dashboard/tutor', component: TutorDashboardComponent, canActivate: [tutorGuard] },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'teacher', 
    loadComponent: () => import('./teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
    canActivate: [tutorGuard]
  },
  { 
    path: 'teacher/grading', 
    loadComponent: () => import('./teacher/grading/grading.component').then(m => m.GradingComponent),
    canActivate: [tutorGuard]
  },
  { 
    path: 'tutor-profile/:id', 
    loadComponent: () => import('./tutor/tutor-profile/tutor-profile.component').then(m => m.TutorProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'find-tutors', 
    loadComponent: () => import('./find-tutors/find-tutors.component').then(m => m.FindTutorsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'admin-login', 
    loadComponent: () => import('./admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  { 
    path: 'admin-panel', 
    loadComponent: () => import('./admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [adminAuthGuard]
  },
  { path: '**', redirectTo: '/landing' }
];
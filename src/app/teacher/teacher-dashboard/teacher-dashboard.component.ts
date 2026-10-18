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

import { AuthService, User } from '../../auth/auth.service';
import { ContactService } from '../../services/contact.service';
import { Router } from '@angular/router';

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledDate: any;
  status: 'active' | 'inactive' | 'suspended';
  progress: number;
  sessionsCompleted: number;
  nextSession?: any;
  subjects: string[];
  notes?: string;
  rating?: number;
}

export interface Session {
  id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  scheduledTime: any;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  recordingUrl?: string;
}

export interface TutorProfile {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  experience: string;
  hourlyRate: number;
  rating: number;
  totalStudents: number;
  totalSessions: number;
  totalEarnings: number;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  bio: string;
}

@Component({
  selector: 'app-teacher-dashboard',
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
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  
  // Data
  students: Student[] = [];
  sessions: Session[] = [];
  tutorProfile: TutorProfile | null = null;
  selectedStudent: Student | null = null;
  
  // Forms
  studentForm: FormGroup;
  sessionForm: FormGroup;
  profileForm: FormGroup;
  
  // Table configurations
  studentColumns: string[] = ['name', 'email', 'status', 'progress', 'sessions', 'actions'];
  sessionColumns: string[] = ['studentName', 'subject', 'scheduledTime', 'duration', 'status', 'actions'];
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private contactService: ContactService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subjects: [[], [Validators.required]],
      notes: ['']
    });

    this.sessionForm = this.fb.group({
      studentId: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      scheduledTime: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(30)]],
      notes: ['']
    });

    this.profileForm = this.fb.group({
      specialties: [[], [Validators.required]],
      experience: ['', [Validators.required]],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      bio: ['', [Validators.required]],
      availability: this.fb.group({
        monday: [true],
        tuesday: [true],
        wednesday: [true],
        thursday: [true],
        friday: [true],
        saturday: [false],
        sunday: [false]
      })
    });
  }

  async ngOnInit() {
    const ok = await this.auth.ensureSession();
    if (!ok) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
    
    if (this.user?.role !== 'tutor') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData() {
    this.loading = true;
    
    // Load mock data (in real app, this would come from a service)
    this.loadMockData();
    this.loading = false;
  }

  private loadMockData() {
    // Mock tutor profile
    this.tutorProfile = {
      id: this.user?.uid || 'tutor1',
      name: this.user?.name || 'Dr. Sarah Johnson',
      email: this.user?.email || 'sarah@example.com',
      specialties: ['Mathematics', 'Physics', 'Chemistry'],
      experience: '10 years',
      hourlyRate: 50,
      rating: 4.8,
      totalStudents: 45,
      totalSessions: 234,
      totalEarnings: 11700,
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      bio: 'Experienced tutor with a passion for teaching science and mathematics.'
    };

    // Mock students
    this.students = [
      {
        id: 'student1',
        name: 'Alex Thompson',
        email: 'alex@example.com',
        enrolledDate: new Date('2024-01-10'),
        status: 'active',
        progress: 75,
        sessionsCompleted: 12,
        nextSession: new Date('2024-01-25T14:00:00'),
        subjects: ['Mathematics', 'Physics'],
        notes: 'Excellent progress in calculus',
        rating: 4.5
      },
      {
        id: 'student2',
        name: 'Maria Garcia',
        email: 'maria@example.com',
        enrolledDate: new Date('2024-01-15'),
        status: 'active',
        progress: 60,
        sessionsCompleted: 8,
        nextSession: new Date('2024-01-26T16:00:00'),
        subjects: ['Chemistry'],
        notes: 'Needs more practice with organic chemistry',
        rating: 4.2
      },
      {
        id: 'student3',
        name: 'James Wilson',
        email: 'james@example.com',
        enrolledDate: new Date('2024-01-05'),
        status: 'inactive',
        progress: 30,
        sessionsCompleted: 3,
        subjects: ['Mathematics'],
        notes: 'On temporary leave',
        rating: 3.8
      }
    ];

    // Mock sessions
    this.sessions = [
      {
        id: 'session1',
        studentName: 'Alex Thompson',
        studentEmail: 'alex@example.com',
        subject: 'Mathematics',
        scheduledTime: new Date('2024-01-25T14:00:00'),
        duration: 60,
        status: 'scheduled',
        notes: 'Calculus review session'
      },
      {
        id: 'session2',
        studentName: 'Maria Garcia',
        studentEmail: 'maria@example.com',
        subject: 'Chemistry',
        scheduledTime: new Date('2024-01-26T16:00:00'),
        duration: 90,
        status: 'scheduled',
        notes: 'Organic chemistry fundamentals'
      },
      {
        id: 'session3',
        studentName: 'Alex Thompson',
        studentEmail: 'alex@example.com',
        subject: 'Physics',
        scheduledTime: new Date('2024-01-24T15:00:00'),
        duration: 60,
        status: 'completed',
        notes: 'Quantum mechanics introduction',
        recordingUrl: 'https://example.com/recording/session3'
      }
    ];
  }

  // Student Management
  addStudent() {
    if (this.studentForm.valid) {
      const newStudent: Student = {
        id: Date.now().toString(),
        ...this.studentForm.value,
        enrolledDate: new Date(),
        status: 'active',
        progress: 0,
        sessionsCompleted: 0
      };
      
      this.students.push(newStudent);
      this.studentForm.reset();
    }
  }

  updateStudent(student: Student) {
    const index = this.students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      this.students[index] = { ...student };
    }
  }

  suspendStudent(student: Student) {
    if (confirm(`Are you sure you want to suspend ${student.name}?`)) {
      student.status = 'suspended';
      this.updateStudent(student);
    }
  }

  activateStudent(student: Student) {
    student.status = 'active';
    this.updateStudent(student);
  }

  deleteStudent(studentId: string) {
    if (confirm('Are you sure you want to remove this student?')) {
      this.students = this.students.filter(s => s.id !== studentId);
    }
  }

  viewStudentDetails(student: Student) {
    this.selectedStudent = student;
  }

  // Session Management
  scheduleSession() {
    if (this.sessionForm.valid) {
      const student = this.students.find(s => s.id === this.sessionForm.value.studentId);
      if (student) {
        const newSession: Session = {
          id: Date.now().toString(),
          studentName: student.name,
          studentEmail: student.email,
          ...this.sessionForm.value,
          status: 'scheduled'
        };
        
        this.sessions.push(newSession);
        this.sessionForm.reset();
      }
    }
  }

  completeSession(session: Session) {
    session.status = 'completed';
    const student = this.students.find(s => s.email === session.studentEmail);
    if (student) {
      student.sessionsCompleted++;
      student.progress = Math.min(100, student.progress + 5);
    }
  }

  cancelSession(session: Session) {
    if (confirm('Are you sure you want to cancel this session?')) {
      session.status = 'cancelled';
    }
  }

  // Profile Management
  updateProfile() {
    if (this.profileForm.valid && this.tutorProfile) {
      this.tutorProfile = { ...this.tutorProfile, ...this.profileForm.value };
      // In real app, save to backend
    }
  }

  // Computed properties for template
  get activeStudentsCount(): number {
    return this.students.filter(s => s.status === 'active').length;
  }

  get scheduledSessionsCount(): number {
    return this.sessions.filter(s => s.status === 'scheduled').length;
  }

  get averageProgress(): number {
    if (this.students.length === 0) return 0;
    const totalProgress = this.students.reduce((acc, s) => acc + s.progress, 0);
    return Math.round(totalProgress / this.students.length);
  }

  // Utility Methods
  openUrl(url: string): void {
    window.open(url, '_blank');
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'completed': return 'primary';
      case 'inactive':
      case 'cancelled': return 'warn';
      case 'suspended': return 'accent';
      case 'scheduled': return 'primary';
      default: return 'primary';
    }
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return date instanceof Date ? date.toLocaleDateString() : date.toDate().toLocaleDateString();
  }

  formatDateTime(date: any): string {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleString();
  }

  // Navigation
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  navigateToProfile() {
    // Navigate to profile page
  }

  // Quick Actions
  refreshData() {
    this.loadData();
  }

  exportStudentData() {
    const data = {
      students: this.students,
      sessions: this.sessions,
      profile: this.tutorProfile,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

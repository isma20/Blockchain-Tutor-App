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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { UserManagementService } from '../../services/user-management.service';
import { TutorStudentService } from '../../services/tutor-student.service';
import { AvailabilityDialogComponent } from '../../shared/availability-dialog/availability-dialog.component';
import { SessionHistoryDialogComponent } from '../../shared/session-history-dialog/session-history-dialog.component';

@Component({
  selector: 'app-tutor-dashboard',
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
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AvailabilityDialogComponent,
    SessionHistoryDialogComponent
  ],
  templateUrl: './tutor-dashboard.component.html',
  styleUrls: ['./tutor-dashboard.component.scss']
})
export class TutorDashboardComponent implements OnInit {
  user: any = null;
  
  // Stats
  totalStudents = 156;
  totalSessions = 892;
  totalEarnings = 13450;
  averageRating = 4.9;

  // Upcoming Sessions
  upcomingSessions = [
    {
      student: 'Alex Thompson',
      subject: 'Machine Learning Basics',
      date: 'Today',
      time: '3:00 PM',
      duration: '1 hour',
      status: 'confirmed'
    },
    {
      student: 'Maria Garcia',
      subject: 'Advanced Python',
      date: 'Tomorrow',
      time: '2:00 PM',
      duration: '1.5 hours',
      status: 'pending'
    }
  ];

  // Recent Students
  recentStudents = [
    {
      name: 'Alex Thompson',
      subject: 'Machine Learning',
      progress: 75,
      lastSession: '2 days ago',
      rating: 5
    },
    {
      name: 'Maria Garcia',
      subject: 'Python Programming',
      progress: 90,
      lastSession: '1 week ago',
      rating: 4
    }
  ];

  // Earnings Data
  earningsData = [
    { month: 'Jan', amount: 2100 },
    { month: 'Feb', amount: 2450 },
    { month: 'Mar', amount: 2800 },
    { month: 'Apr', amount: 2650 },
    { month: 'May', amount: 3450 }
  ];

  // Session History
  sessionHistory = [
    {
      student: 'Alex Thompson',
      subject: 'Machine Learning Basics',
      date: '2024-01-15',
      time: '3:00 PM',
      duration: '1 hour',
      status: 'completed',
      earnings: 50
    },
    {
      student: 'Maria Garcia',
      subject: 'Advanced Python',
      date: '2024-01-14',
      time: '2:00 PM',
      duration: '1.5 hours',
      status: 'completed',
      earnings: 75
    },
    {
      student: 'John Doe',
      subject: 'Web Development',
      date: '2024-01-13',
      time: '10:00 AM',
      duration: '2 hours',
      status: 'completed',
      earnings: 100
    }
  ];

  // Payment History
  paymentHistory = [
    {
      student: 'Alex Thompson',
      date: '2024-01-15',
      amount: 50,
      status: 'completed',
      method: 'Credit Card'
    },
    {
      student: 'Maria Garcia',
      date: '2024-01-14',
      amount: 75,
      status: 'completed',
      method: 'PayPal'
    },
    {
      student: 'John Doe',
      date: '2024-01-13',
      amount: 100,
      status: 'completed',
      method: 'Bank Transfer'
    }
  ];

  // Reviews and Ratings
  reviews = [
    {
      student: 'Alex Thompson',
      rating: 5,
      comment: 'Excellent tutor! Very patient and knowledgeable.',
      date: '2024-01-15',
      subject: 'Machine Learning'
    },
    {
      student: 'Maria Garcia',
      rating: 4,
      comment: 'Great teaching style, helped me understand complex concepts.',
      date: '2024-01-14',
      subject: 'Advanced Python'
    },
    {
      student: 'John Doe',
      rating: 5,
      comment: 'Amazing experience! Highly recommend.',
      date: '2024-01-13',
      subject: 'Web Development'
    }
  ];

  // Table columns
  displayedColumns: string[] = ['month', 'amount', 'sessions', 'students'];
  sessionHistoryColumns: string[] = ['student', 'subject', 'date', 'time', 'duration', 'status', 'earnings'];
  paymentHistoryColumns: string[] = ['student', 'date', 'amount', 'status', 'method'];
  reviewsColumns: string[] = ['student', 'rating', 'comment', 'date', 'subject'];

  // Forms
  availabilityForm: FormGroup;
  gradingForm: FormGroup;

  constructor(
    private auth: AuthService,
    private router: Router,
    private userManagement: UserManagementService,
    private tutorStudentService: TutorStudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    // Initialize forms
    this.availabilityForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      status: ['available', Validators.required]
    });

    this.gradingForm = this.fb.group({
      studentId: ['', Validators.required],
      subject: ['', Validators.required],
      grade: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      maxGrade: ['', [Validators.required, Validators.min(1)]],
      feedback: ['', Validators.required]
    });
  }

  async ngOnInit() {
    console.log('🎓 Tutor Dashboard component initializing...');
    const ok = await this.auth.ensureSession();
    console.log('📊 Tutor ensureSession result:', ok);
    
    if (!ok) {
      console.log('❌ Tutor session invalid, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
    console.log('👤 Tutor user data:', this.user);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  startSession(session: any) {
    console.log('🎥 Starting session with:', session.student);
    this.snackBar.open(`Starting session with ${session.student}...`, 'Close', { duration: 3000 });
    
    // In a real app, this would open a video session
    setTimeout(() => {
      this.snackBar.open('Session started successfully!', 'Close', { duration: 3000 });
    }, 2000);
  }

  viewStudentProfile(student: any) {
    console.log('👤 Viewing profile for:', student.name);
    this.snackBar.open(`Opening profile for ${student.name}...`, 'Close', { duration: 3000 });
    
    // In a real app, this would navigate to student profile
    setTimeout(() => {
      this.snackBar.open('Student profile loaded', 'Close', { duration: 2000 });
    }, 1500);
  }

  editProfile() {
    console.log('✏️ Editing tutor profile');
    this.snackBar.open('Opening profile editor...', 'Close', { duration: 3000 });
    
    // In a real app, this would open a profile edit dialog
    setTimeout(() => {
      this.snackBar.open('Profile editor opened', 'Close', { duration: 2000 });
    }, 1500);
  }

  viewCalendar() {
    console.log('📅 Opening calendar');
    this.snackBar.open('Opening calendar...', 'Close', { duration: 3000 });
    
    // In a real app, this would open a calendar view
    setTimeout(() => {
      this.snackBar.open('Calendar loaded', 'Close', { duration: 2000 });
    }, 1500);
  }

  // Set Availability
  setAvailability() {
    console.log('⏰ Opening availability dialog');
    
    const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
      width: '600px',
      data: {
        title: 'Set Your Availability',
        availability: []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Availability saved:', result);
        this.snackBar.open('Availability saved successfully!', 'Close', { duration: 3000 });
        // Here you would save to Firebase
      } else {
        console.log('❌ Availability dialog cancelled');
      }
    });
  }

  // Session History
  viewSessionHistory() {
    console.log('📚 Opening session history dialog');
    
    const dialogRef = this.dialog.open(SessionHistoryDialogComponent, {
      width: '900px',
      data: {
        title: 'Session History',
        sessions: this.sessionHistory
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Session history dialog closed');
    });
  }

  // Payment History
  viewPaymentHistory() {
    console.log('💳 Viewing payment history');
    this.snackBar.open('Loading payment history...', 'Close', { duration: 3000 });
    
    // In a real app, this would navigate to payment history
    setTimeout(() => {
      this.snackBar.open(`Found ${this.paymentHistory.length} payments`, 'Close', { duration: 2000 });
    }, 1500);
  }

  // Reviews and Ratings
  viewReviewsAndRatings() {
    console.log('⭐ Viewing reviews and ratings');
    this.snackBar.open('Loading reviews...', 'Close', { duration: 3000 });
    
    // In a real app, this would navigate to reviews
    setTimeout(() => {
      this.snackBar.open(`Found ${this.reviews.length} reviews`, 'Close', { duration: 2000 });
    }, 1500);
  }

  // Grade Student
  gradeStudent() {
    console.log('📝 Grading student');
    this.snackBar.open('Opening grading interface...', 'Close', { duration: 3000 });
    
    // In a real app, this would open a grading dialog
    setTimeout(() => {
      this.snackBar.open('Grading interface opened', 'Close', { duration: 2000 });
    }, 1500);
  }

  // Helper methods
  getRandomStudents() {
    return Math.floor(Math.random() * 10) + 5;
  }

  getSessionsFromEarnings(amount: number) {
    return Math.floor(amount / 25);
  }

  // Rating stars helper
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  // Format date helper
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  // Format currency helper
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary';
      case 'pending':
        return 'warn';
      case 'confirmed':
        return 'accent';
      default:
        return 'primary';
    }
  }

  // Get rating color
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'primary';
    if (rating >= 3.5) return 'accent';
    return 'warn';
  }
}

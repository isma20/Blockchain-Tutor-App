import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PaymentDialogComponent } from '../../../shared/payment-dialog/payment-dialog.component';

export interface TutorProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  skills: string[];
  experience: string;
  education: string;
  hourlyRate: number;
  rating: number;
  totalStudents: number;
  totalSessions: number;
  availability: string[];
  languages: string[];
  certifications: string[];
  reviews?: {
    studentName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

@Component({
  selector: 'app-tutor-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './tutor-profile-view.component.html',
  styleUrls: ['./tutor-profile-view.component.scss']
})
export class TutorProfileViewComponent implements OnInit {
  tutor: TutorProfile | null = null;
  isLoading = true;
  user: any = null;

  // Mock tutor data
  private mockTutors: TutorProfile[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      bio: 'Experienced mathematics tutor with 10+ years of teaching experience. I specialize in calculus, algebra, and statistics. My teaching approach focuses on building strong foundations and helping students develop problem-solving skills that last a lifetime.',
      specialties: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
      skills: ['Problem Solving', 'Test Preparation', 'Online Teaching', 'Curriculum Development'],
      experience: '10+ years of teaching mathematics at university level',
      education: 'PhD in Mathematics from MIT',
      hourlyRate: 50,
      rating: 4.8,
      totalStudents: 150,
      totalSessions: 500,
      availability: ['Mon-Fri 9AM-6PM', 'Sat 10AM-2PM'],
      languages: ['English', 'Spanish'],
      certifications: ['Mathematics Teaching Certificate', 'Advanced Calculus'],
      reviews: [
        {
          studentName: 'John Doe',
          rating: 5,
          comment: 'Excellent tutor! Dr. Johnson made calculus so much easier to understand.',
          date: '2024-01-15'
        },
        {
          studentName: 'Jane Smith',
          rating: 4,
          comment: 'Very patient and knowledgeable. Helped me improve my grade significantly.',
          date: '2024-01-10'
        }
      ]
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      email: 'michael.chen@email.com',
      bio: 'Computer science expert specializing in web development and machine learning. I have 8 years of industry experience as a software engineer and love teaching students practical coding skills.',
      specialties: ['Programming', 'Web Development', 'Machine Learning'],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TensorFlow', 'Docker'],
      experience: '8 years as software engineer and instructor',
      education: 'MS in Computer Science from Stanford',
      hourlyRate: 65,
      rating: 4.9,
      totalStudents: 200,
      totalSessions: 750,
      availability: ['Mon-Wed 6PM-9PM', 'Sat-Sun 10AM-4PM'],
      languages: ['English', 'Mandarin'],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
      reviews: [
        {
          studentName: 'Alice Johnson',
          rating: 5,
          comment: 'Best programming tutor! Made React so easy to learn.',
          date: '2024-01-12'
        }
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      bio: 'Native Spanish speaker teaching Spanish language and literature. I help students become fluent in Spanish through immersive conversations and cultural understanding.',
      specialties: ['Languages', 'Spanish', 'Literature'],
      skills: ['Grammar', 'Conversation', 'Writing', 'Cultural Studies'],
      experience: '6 years teaching Spanish to all levels',
      education: 'MA in Spanish Literature from University of Madrid',
      hourlyRate: 40,
      rating: 4.7,
      totalStudents: 80,
      totalSessions: 300,
      availability: ['Tue-Thu 4PM-7PM', 'Sat 9AM-1PM'],
      languages: ['Spanish', 'English', 'French'],
      certifications: ['DELE Examiner Certificate', 'Teaching Spanish as Foreign Language'],
      reviews: [
        {
          studentName: 'Robert Brown',
          rating: 5,
          comment: 'Emily makes learning Spanish fun and engaging!',
          date: '2024-01-08'
        }
      ]
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      email: 'james.wilson@email.com',
      bio: 'Physics and chemistry tutor with research background in nanotechnology. I bring real-world research experience into my teaching to make science concepts tangible and exciting.',
      specialties: ['Science', 'Physics', 'Chemistry'],
      skills: ['Laboratory Techniques', 'Theory', 'Problem Solving', 'Research Methods'],
      experience: '12 years in research and teaching',
      education: 'PhD in Physics from Caltech',
      hourlyRate: 55,
      rating: 4.6,
      totalStudents: 120,
      totalSessions: 450,
      availability: ['Mon-Fri 2PM-8PM', 'Weekends flexible'],
      languages: ['English'],
      certifications: ['Physics Teaching License', 'Laboratory Safety Certification'],
      reviews: [
        {
          studentName: 'Sarah Lee',
          rating: 4,
          comment: 'Very knowledgeable and explains complex topics clearly.',
          date: '2024-01-05'
        }
      ]
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      bio: 'Business and marketing professional with real-world corporate experience. I teach practical business skills that students can apply immediately in their careers.',
      specialties: ['Business', 'Marketing', 'Management'],
      skills: ['Strategy', 'Digital Marketing', 'Leadership', 'Business Planning'],
      experience: '15 years in corporate management',
      education: 'MBA from Harvard Business School',
      hourlyRate: 70,
      rating: 4.8,
      totalStudents: 90,
      totalSessions: 280,
      availability: ['Mon-Thu 6PM-9PM', 'Sat 10AM-2PM'],
      languages: ['English'],
      certifications: ['PMP Certification', 'Digital Marketing Professional'],
      reviews: [
        {
          studentName: 'Mike Davis',
          rating: 5,
          comment: 'Lisa\'s business insights are invaluable! Highly recommend.',
          date: '2024-01-03'
        }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTutorProfile();
    // Mock user data
    this.user = { name: 'Student User', uid: 'student123' };
  }

  loadTutorProfile() {
    const tutorId = this.route.snapshot.paramMap.get('id');
    
    if (tutorId) {
      this.tutor = this.mockTutors.find(t => t.id === tutorId) || null;
    }
    
    this.isLoading = false;
    
    if (!this.tutor) {
      this.snackBar.open('Tutor not found', 'Close', { duration: 3000 });
      this.router.navigate(['/student-dashboard']);
    }
  }

  bookTutor() {
    if (!this.tutor || !this.user) {
      this.snackBar.open('Please login to book a tutor', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: {
        tutor: this.tutor,
        hourlyRate: this.tutor.hourlyRate,
        studentName: this.user.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processPayment(result);
      }
    });
  }

  processPayment(paymentData: any) {
    try {
      this.snackBar.open('Processing payment...', '', { duration: 2000 });
      
      setTimeout(() => {
        this.snackBar.open('Payment successful! Tutor will contact you soon.', 'Close', { duration: 3000 });
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
    }
  }

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '⭐'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
  }
}

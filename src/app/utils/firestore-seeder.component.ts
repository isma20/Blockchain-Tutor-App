import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserManagementService } from '../services/user-management.service';
import { TutorStudentService } from '../services/tutor-student.service';

@Component({
  selector: 'app-firestore-seeder',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="seeder-container">
      <h2>🌱 Firestore Data Seeder</h2>
      <p>Click the buttons below to populate Firebase with sample data</p>
      
      <div class="button-group">
        <button mat-raised-button color="primary" (click)="seedTutors()">
          <mat-icon>school</mat-icon>
          Seed Sample Tutors
        </button>
        
        <button mat-raised-button color="accent" (click)="seedStudents()">
          <mat-icon>person</mat-icon>
          Seed Sample Students
        </button>
        
        <button mat-raised-button color="warn" (click)="seedReviews()">
          <mat-icon>star</mat-icon>
          Seed Sample Reviews
        </button>
        
        <button mat-button (click)="checkData()">
          <mat-icon>visibility</mat-icon>
          Check Existing Data
        </button>
      </div>
      
      <div *ngIf="loading" class="loading">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>{{ loadingMessage }}</p>
      </div>
      
      <div *ngIf="results.length > 0" class="results">
        <h3>Results:</h3>
        <ul>
          <li *ngFor="let result of results">{{ result }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .seeder-container {
      padding: 20px;
      max-width: 600px;
      margin: 20px auto;
    }
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 20px 0;
    }
    .loading {
      text-align: center;
      margin: 20px 0;
    }
    .results {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
  `]
})
export class FirestoreSeederComponent {
  loading = false;
  loadingMessage = '';
  results: string[] = [];

  constructor(
    private userManagement: UserManagementService,
    private tutorStudentService: TutorStudentService,
    private snackBar: MatSnackBar
  ) {}

  async seedTutors() {
    this.loading = true;
    this.loadingMessage = 'Creating sample tutors...';
    this.results = [];

    const sampleTutors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@tutorapp.com',
        role: 'tutor' as const,
        status: 'active' as const,
        profile: {
          bio: 'Experienced mathematics tutor with 10+ years of teaching experience. Specialized in calculus, algebra, and statistics.',
          specialties: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
          experience: '10+ years of teaching mathematics at university level',
          education: 'PhD in Mathematics from MIT',
          hourlyRate: 50,
          rating: 4.8,
          skills: ['Problem Solving', 'Test Preparation', 'Online Teaching', 'Curriculum Development'],
          totalStudents: 150,
          totalSessions: 500,
          availability: ['Mon-Fri 9AM-6PM', 'Sat 10AM-2PM'],
          languages: ['English', 'Spanish'],
          certifications: ['Mathematics Teaching Certificate', 'Advanced Calculus']
        }
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@tutorapp.com',
        role: 'tutor' as const,
        status: 'active' as const,
        profile: {
          bio: 'Computer science expert specializing in web development and machine learning.',
          specialties: ['Programming', 'Web Development', 'Machine Learning'],
          experience: '8 years as software engineer and instructor',
          education: 'MS in Computer Science from Stanford',
          hourlyRate: 65,
          rating: 4.9,
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TensorFlow', 'Docker'],
          totalStudents: 200,
          totalSessions: 750,
          availability: ['Mon-Wed 6PM-9PM', 'Sat-Sun 10AM-4PM'],
          languages: ['English', 'Mandarin'],
          certifications: ['AWS Certified Developer', 'Google Cloud Professional']
        }
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@tutorapp.com',
        role: 'tutor' as const,
        status: 'active' as const,
        profile: {
          bio: 'Native Spanish speaker teaching Spanish language and literature.',
          specialties: ['Languages', 'Spanish', 'Literature'],
          experience: '6 years teaching Spanish to all levels',
          education: 'MA in Spanish Literature from University of Madrid',
          hourlyRate: 40,
          rating: 4.7,
          skills: ['Grammar', 'Conversation', 'Writing', 'Cultural Studies'],
          totalStudents: 80,
          totalSessions: 300,
          availability: ['Tue-Thu 4PM-7PM', 'Sat 9AM-1PM'],
          languages: ['Spanish', 'English', 'French'],
          certifications: ['DELE Examiner Certificate', 'Teaching Spanish as Foreign Language']
        }
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@tutorapp.com',
        role: 'tutor' as const,
        status: 'active' as const,
        profile: {
          bio: 'Physics and chemistry tutor with research background in nanotechnology.',
          specialties: ['Science', 'Physics', 'Chemistry'],
          experience: '12 years in research and teaching',
          education: 'PhD in Physics from Caltech',
          hourlyRate: 55,
          rating: 4.6,
          skills: ['Laboratory Techniques', 'Theory', 'Problem Solving', 'Research Methods'],
          totalStudents: 120,
          totalSessions: 450,
          availability: ['Mon-Fri 2PM-8PM', 'Weekends flexible'],
          languages: ['English'],
          certifications: ['Physics Teaching License', 'Laboratory Safety Certification']
        }
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@tutorapp.com',
        role: 'tutor' as const,
        status: 'active' as const,
        profile: {
          bio: 'Business and marketing professional with real-world corporate experience.',
          specialties: ['Business', 'Marketing', 'Management'],
          experience: '15 years in corporate management',
          education: 'MBA from Harvard Business School',
          hourlyRate: 70,
          rating: 4.8,
          skills: ['Strategy', 'Digital Marketing', 'Leadership', 'Business Planning'],
          totalStudents: 90,
          totalSessions: 280,
          availability: ['Mon-Thu 6PM-9PM', 'Sat 10AM-2PM'],
          languages: ['English'],
          certifications: ['PMP Certification', 'Digital Marketing Professional']
        }
      }
    ];

    for (const tutor of sampleTutors) {
      try {
        const tutorId = await this.userManagement.createUser(tutor);
        this.results.push(`✅ Created tutor: ${tutor.name} (ID: ${tutorId})`);
        console.log(`✅ Created tutor: ${tutor.name} (ID: ${tutorId})`);
      } catch (error) {
        this.results.push(`❌ Error creating tutor ${tutor.name}: ${error}`);
        console.error(`❌ Error creating tutor ${tutor.name}:`, error);
      }
    }

    this.loading = false;
    this.snackBar.open('Tutor seeding completed!', 'Close', { duration: 3000 });
  }

  async seedStudents() {
    this.loading = true;
    this.loadingMessage = 'Creating sample students...';
    this.results = [];

    const sampleStudents = [
      {
        name: 'John Doe',
        email: 'john.doe@tutorapp.com',
        role: 'student' as const,
        status: 'active' as const,
        profile: {
          bio: 'Computer science student interested in web development.',
          specialties: ['Programming'],
          experience: '2 years of programming experience',
          education: 'Currently pursuing BS in Computer Science',
          hourlyRate: 0,
          rating: 0,
          skills: ['JavaScript', 'HTML', 'CSS'],
          totalStudents: 0,
          totalSessions: 0,
          availability: [],
          languages: ['English'],
          certifications: []
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@tutorapp.com',
        role: 'student' as const,
        status: 'active' as const,
        profile: {
          bio: 'Mathematics student looking for help with calculus.',
          specialties: ['Mathematics'],
          experience: 'High school mathematics background',
          education: 'Currently pursuing BS in Mathematics',
          hourlyRate: 0,
          rating: 0,
          skills: ['Algebra', 'Geometry'],
          totalStudents: 0,
          totalSessions: 0,
          availability: [],
          languages: ['English'],
          certifications: []
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@tutorapp.com',
        role: 'student' as const,
        status: 'active' as const,
        profile: {
          bio: 'Business student seeking help with marketing courses.',
          specialties: ['Business'],
          experience: 'Internship experience in marketing',
          education: 'Currently pursuing BBA',
          hourlyRate: 0,
          rating: 0,
          skills: ['Marketing', 'Communication'],
          totalStudents: 0,
          totalSessions: 0,
          availability: [],
          languages: ['English'],
          certifications: []
        }
      }
    ];

    for (const student of sampleStudents) {
      try {
        const studentId = await this.userManagement.createUser(student);
        this.results.push(`✅ Created student: ${student.name} (ID: ${studentId})`);
        console.log(`✅ Created student: ${student.name} (ID: ${studentId})`);
      } catch (error) {
        this.results.push(`❌ Error creating student ${student.name}: ${error}`);
        console.error(`❌ Error creating student ${student.name}:`, error);
      }
    }

    this.loading = false;
    this.snackBar.open('Student seeding completed!', 'Close', { duration: 3000 });
  }

  async seedReviews() {
    this.loading = true;
    this.loadingMessage = 'Creating sample reviews...';
    this.results = [];

    const sampleReviews = [
      {
        tutorId: 'sarah.johnson@tutorapp.com',
        studentId: 'john.doe@tutorapp.com',
        rating: 5,
        comment: 'Dr. Johnson is an amazing mathematics tutor! She explained complex calculus concepts in a way I could finally understand. Highly recommended!',
        subject: 'Calculus',
        sessionId: 'session-1'
      },
      {
        tutorId: 'michael.chen@tutorapp.com',
        studentId: 'jane.smith@tutorapp.com',
        rating: 4,
        comment: 'Great web development tutor. Very patient and knowledgeable about React and Node.js. Helped me build my first full-stack application.',
        subject: 'Web Development',
        sessionId: 'session-2'
      },
      {
        tutorId: 'emily.rodriguez@tutorapp.com',
        studentId: 'mike.johnson@tutorapp.com',
        rating: 5,
        comment: 'Emily is a fantastic Spanish teacher! Her lessons are engaging and she makes learning fun. My conversational skills have improved so much.',
        subject: 'Spanish',
        sessionId: 'session-3'
      }
    ];

    for (const review of sampleReviews) {
      try {
        const reviewId = await this.tutorStudentService.createReview(review);
        this.results.push(`✅ Created review for tutor (Rating: ${review.rating}/5)`);
        console.log(`✅ Created review: ${reviewId}`);
      } catch (error) {
        this.results.push(`❌ Error creating review: ${error}`);
        console.error('❌ Error creating review:', error);
      }
    }

    this.loading = false;
    this.snackBar.open('Review seeding completed!', 'Close', { duration: 3000 });
  }

  async checkData() {
    this.loading = true;
    this.loadingMessage = 'Checking existing data...';
    this.results = [];

    try {
      // Check tutors
      this.userManagement.getUsersByRole('tutor').subscribe(tutors => {
        this.results.push(`👨‍🏫 Found ${tutors.length} tutors in Firebase`);
        tutors.forEach(tutor => {
          this.results.push(`  - ${tutor.name} (${tutor.email})`);
        });
      });

      // Check students
      this.userManagement.getUsersByRole('student').subscribe(students => {
        this.results.push(`👩‍🎓 Found ${students.length} students in Firebase`);
        students.forEach(student => {
          this.results.push(`  - ${student.name} (${student.email})`);
        });
      });

      // Check reviews
      setTimeout(() => {
        this.tutorStudentService.getTutorReviews('any').subscribe(reviews => {
          this.results.push(`⭐ Found ${reviews.length} reviews in Firebase`);
        });
      }, 1000);

    } catch (error) {
      this.results.push(`❌ Error checking data: ${error}`);
      console.error('Error checking data:', error);
    }

    this.loading = false;
  }
}

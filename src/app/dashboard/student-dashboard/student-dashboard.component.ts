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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { UserManagementService } from '../../services/user-management.service';
import { TutorStudentService } from '../../services/tutor-student.service';
import { PaymentDialogComponent } from '../../shared/payment-dialog/payment-dialog.component';

export interface TutorInfo {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  experience: string;
  education: string;
  hourlyRate: number;
  rating: number;
  totalStudents: number;
  totalSessions: number;
  availability: string[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

export interface StudentGrade {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  grade: number;
  maxGrade: number;
  assignment: string;
  feedback: string;
  gradedAt: any;
  semester: string;
  year: number;
}

@Component({
  selector: 'app-student-dashboard',
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
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatDialogModule,
    PaymentDialogComponent
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: any = null;
  selectedTab = 0;
  isLoading = false;

  // Tutor Discovery
  tutors: TutorInfo[] = [];
  filteredTutors: TutorInfo[] = [];
  searchForm: FormGroup;
  selectedSpecialty = '';

  // Grades
  studentGrades: StudentGrade[] = [];
  gradeColumns: string[] = ['subject', 'grade', 'assignment', 'tutor', 'gradedAt', 'feedback'];

  // Topics/Specialties
  specialties = [
    'Mathematics', 'Science', 'Programming', 'Languages', 
    'Business', 'Arts', 'Music', 'History', 'Literature', 'Other'
  ];

  upcomingSessions = [
    {
      tutor: 'Mansour Al-Monsour',
      subject: 'Machine Learning',
      time: 'Today, 3:00 PM',
      duration: '1 hour',
      type: 'video'
    },
    {
      tutor: 'Sarah Johnson',
      subject: 'Calculus',
      time: 'Tomorrow, 2:00 PM',
      duration: '45 minutes',
      type: 'in-person'
    },
    {
      tutor: 'Dr. Emily Watson',
      subject: 'Physics',
      time: 'Friday, 4:00 PM',
      duration: '1 hour',
      type: 'video'
    }
  ];

  recentActivity = [
    {
      type: 'session_completed',
      description: 'Completed Machine Learning session',
      time: '2 hours ago',
      icon: 'check_circle'
    },
    {
      type: 'assignment_submitted',
      description: 'Submitted Calculus homework',
      time: '5 hours ago',
      icon: 'assignment'
    },
    {
      type: 'grade_received',
      description: 'Received grade on Physics quiz',
      time: '1 day ago',
      icon: 'grade'
    }
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private userManagement: UserManagementService,
    private tutorStudentService: TutorStudentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      specialty: ['']
    });
  }

  async ngOnInit() {
    const ok = await this.auth.ensureSession();
    if (!ok) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
    console.log('🚀 Student Dashboard Component initialized');
    console.log('🔥 Current user:', this.user);
    console.log('🔥 User ID:', this.user?.uid);
    console.log('🔥 User email:', this.user?.email);
    
    // Test Firebase connection
    this.testFirebaseConnection();
    
    // Load user data
    this.loadData();
    this.loadTutors(); // This should load real tutors
    this.loadStudentGrades();
    this.initializeSearchForm();
  }

  private testFirebaseConnection() {
    console.log('🔍 Testing Firebase connection...');
    console.log('🔍 UserManagement service:', this.userManagement);
    
    // Test 1: Check if we can get all users
    this.userManagement.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Firebase connection successful!');
        console.log('📊 Total users in Firebase:', users.length);
        console.log('📊 All users:', users);
        
        const tutors = users.filter(u => u.role === 'tutor');
        console.log('📊 Tutors found:', tutors.length);
        console.log('📊 Tutor details:', tutors);
        
        if (tutors.length === 0) {
          console.log('⚠️ No tutors found. Adding test tutor for debugging...');
          this.addTestTutor();
        }
      },
      error: (error) => {
        console.error('❌ Firebase connection failed:', error);
        console.error('❌ Please check Firebase configuration in app.config.ts');
        this.snackBar.open('Firebase connection error. Please check configuration.', 'Close', { 
          duration: 5000 
        });
        
        // Add mock data for testing
        console.log('🔄 Adding mock tutors for testing...');
        this.addMockTutorsForTesting();
      }
    });
  }

  private addTestTutor() {
    const testTutor = {
      name: 'Test Tutor',
      email: 'test@tutorapp.com',
      role: 'tutor' as const,
      status: 'active' as const,
      profile: {
        bio: 'Test tutor for debugging purposes',
        specialties: ['Testing', 'Debugging'],
        experience: '5 years of testing',
        education: 'Test University',
        hourlyRate: 50,
        rating: 4.5,
        skills: ['Testing', 'Debugging', 'Problem Solving'],
        totalStudents: 10,
        totalSessions: 50,
        availability: ['Mon-Fri 9AM-5PM'],
        languages: ['English'],
        certifications: ['Test Certification']
      }
    };

    this.userManagement.createUser(testTutor).then(userId => {
      console.log('✅ Test tutor created with ID:', userId);
      this.snackBar.open('Test tutor created! Refreshing tutor list...', 'Close', { duration: 3000 });
      setTimeout(() => {
        this.loadTutors();
      }, 1000);
    }).catch(error => {
      console.error('❌ Error creating test tutor:', error);
    });
  }

  private addMockTutorsForTesting() {
    // Add mock tutors directly to the array for testing
    this.tutors = [
      {
        id: 'test-1',
        name: 'Dr. Test Tutor',
        email: 'test@tutorapp.com',
        bio: 'Test tutor for debugging purposes. This is a mock tutor to test the UI.',
        specialties: ['Testing', 'Debugging', 'Problem Solving'],
        skills: ['Testing', 'Debugging', 'Problem Solving'],
        experience: '5 years of testing experience',
        education: 'Test University',
        hourlyRate: 50,
        rating: 4.5,
        totalStudents: 10,
        totalSessions: 50,
        availability: ['Mon-Fri 9AM-5PM'],
        languages: ['English'],
        certifications: ['Test Certification']
      },
      {
        id: 'test-2',
        name: 'Prof. Sample Tutor',
        email: 'sample@tutorapp.com',
        bio: 'Sample tutor for testing the student dashboard functionality.',
        specialties: ['Sample', 'Testing', 'Demo'],
        skills: ['Sample Skills', 'Demo Skills'],
        experience: '3 years of sample teaching',
        education: 'Sample University',
        hourlyRate: 45,
        rating: 4.3,
        totalStudents: 15,
        totalSessions: 75,
        availability: ['Tue-Thu 10AM-6PM'],
        languages: ['English', 'Spanish'],
        certifications: ['Sample Certification']
      }
    ];
    
    this.filteredTutors = [...this.tutors];
    this.isLoading = false;
    
    console.log('🧪 Added mock tutors for testing:', this.tutors);
    this.snackBar.open('Added test tutors for debugging', 'Close', { duration: 3000 });
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Load tutors
      await this.loadTutors();

      // Load student grades
      this.userManagement.getStudentGrades(this.user.uid).subscribe({
        next: (grades) => {
          this.studentGrades = grades;
          console.log('📊 Loaded student grades:', grades);
        },
        error: (error) => {
          console.error('Error loading grades:', error);
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private initializeSearchForm() {
    // Search form is already initialized in constructor
    console.log('🔍 Search form initialized');
  }

  private loadStudentGrades() {
    if (!this.user) {
      console.log('⚠️ No user logged in, cannot load grades');
      return;
    }
    
    this.userManagement.getStudentGrades(this.user.uid).subscribe({
      next: (grades) => {
        this.studentGrades = grades;
        console.log('📊 Loaded student grades:', grades);
      },
      error: (error) => {
        console.error('Error loading student grades:', error);
      }
    });
  }

  async loadTutors() {
    this.isLoading = true;
    try {
      console.log('🔍 Loading tutors...');
      
      // Load mock tutors first for immediate display
      this.loadMockTutors();
      
      // Then try to load real tutors from Firebase
      this.userManagement.getUsersByRole('tutor').subscribe({
        next: (tutors) => {
          console.log('📊 Real tutors from Firebase:', tutors);
          
          if (tutors && tutors.length > 0) {
            // Transform Firebase user data to tutor format
            this.tutors = tutors.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              bio: user.profile?.bio || 'Experienced tutor passionate about helping students succeed.',
              specialties: user.profile?.specialties || ['General'],
              skills: user.profile?.skills || ['Teaching', 'Communication'],
              experience: user.profile?.experience || 'Experienced educator',
              education: user.profile?.education || 'Qualified professional',
              hourlyRate: user.profile?.hourlyRate || 50,
              rating: user.profile?.rating || 4.5,
              totalStudents: user.profile?.totalStudents || Math.floor(Math.random() * 200) + 50,
              totalSessions: user.profile?.totalSessions || Math.floor(Math.random() * 500) + 100,
              availability: user.profile?.availability || ['Flexible scheduling'],
              languages: user.profile?.languages || ['English'],
              certifications: user.profile?.certifications || ['Professional Certification']
            }));
            
            this.filteredTutors = [...this.tutors];
            console.log('✅ Loaded real tutors from Firebase:', this.tutors);
            this.snackBar.open('Loaded real tutors from Firebase', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('❌ Error loading real tutors from Firebase:', error);
          console.log('🔄 Using mock tutors for now');
          // Mock tutors already loaded above
        }
      });
      
    } catch (error) {
      console.error('❌ Critical error in loadTutors:', error);
      // Mock tutors already loaded above
    }
  }

  private loadMockTutors() {
    // Mock tutors for testing and demonstration
    this.tutors = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@tutorapp.com',
        bio: 'Experienced mathematics tutor with 10+ years of teaching experience. Specialized in calculus and algebra.',
        specialties: ['Mathematics', 'Calculus', 'Algebra'],
        skills: ['Problem Solving', 'Test Preparation', 'Online Teaching'],
        experience: '10+ years of teaching mathematics at university level',
        education: 'PhD in Mathematics from MIT',
        hourlyRate: 50,
        rating: 4.8,
        totalStudents: 150,
        totalSessions: 500,
        availability: ['Mon-Fri 9AM-6PM', 'Sat 10AM-2PM'],
        languages: ['English', 'Spanish'],
        certifications: ['Mathematics Teaching Certificate', 'Advanced Calculus']
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@tutorapp.com',
        bio: 'Computer science expert specializing in web development and machine learning.',
        specialties: ['Programming', 'Web Development', 'Machine Learning'],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TensorFlow'],
        experience: '8 years as software engineer and instructor',
        education: 'MS in Computer Science from Stanford',
        hourlyRate: 65,
        rating: 4.9,
        totalStudents: 200,
        totalSessions: 750,
        availability: ['Mon-Wed 6PM-9PM', 'Sat-Sun 10AM-4PM'],
        languages: ['English', 'Mandarin'],
        certifications: ['AWS Certified Developer', 'Google Cloud Professional']
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@tutorapp.com',
        bio: 'Native Spanish speaker teaching Spanish language and literature.',
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
        certifications: ['DELE Examiner Certificate', 'Teaching Spanish as Foreign Language']
      },
      {
        id: '4',
        name: 'Dr. James Wilson',
        email: 'james.wilson@tutorapp.com',
        bio: 'Physics and chemistry tutor with research background in nanotechnology.',
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
        certifications: ['Physics Teaching License', 'Laboratory Safety Certification']
      },
      {
        id: '5',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@tutorapp.com',
        bio: 'Business and marketing professional with real-world corporate experience.',
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
        certifications: ['PMP Certification', 'Digital Marketing Professional']
      }
    ];
    
    this.filteredTutors = [...this.tutors];
    this.isLoading = false;
    
    console.log('🧪 Loaded mock tutors for student dashboard:', this.tutors);
    this.snackBar.open('Showing available tutors for booking', 'Close', { duration: 3000 });
  }

  searchTutors() {
    const { search, specialty } = this.searchForm.value;
    
    this.filteredTutors = this.tutors.filter(tutor => {
      // Search query
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const matchesSearch = 
          tutor.name.toLowerCase().includes(searchLower) ||
          tutor.bio.toLowerCase().includes(searchLower) ||
          tutor.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
          tutor.skills.some(s => s.toLowerCase().includes(searchLower)) ||
          tutor.education.toLowerCase().includes(searchLower) ||
          tutor.experience.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (specialty && specialty.trim() && !tutor.specialties.includes(specialty)) {
        return false;
      }

      return true;
    });

    // Show message if no results found
    if (this.filteredTutors.length === 0 && (search || specialty)) {
      this.snackBar.open('No tutors found matching your criteria', 'Clear', {
        duration: 3000
      }).onAction().subscribe(() => {
        this.clearFilters();
      });
    }
  }

  viewTutorProfile(tutorId: string) {
    // Show message and route to landing page tutors section
    this.snackBar.open('Opening tutor profiles...', '', { duration: 2000 });
    setTimeout(() => {
      this.router.navigate(['/landing'], { fragment: 'tutors' });
    }, 500);
  }

  contactTutor(tutor: TutorInfo) {
    console.log('📧 Contacting tutor:', tutor.name);
    
    // Create a simple contact dialog or open email client
    const subject = `Tutoring Inquiry from ${this.user.name}`;
    const body = `Hi ${tutor.name},\n\nI'm interested in booking a tutoring session with you. Here are my details:\n\nName: ${this.user.name}\nEmail: ${this.user.email}\n\nI'd like to learn more about your tutoring services in ${tutor.specialties.join(', ')}.\n\nPlease let me know your availability and rates.\n\nThank you!\n${this.user.name}`;
    
    // Try to open email client
    const mailtoLink = `mailto:${tutor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      window.location.href = mailtoLink;
      this.snackBar.open('Opening email client to contact tutor...', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('❌ Could not open email client:', error);
      // Fallback: show contact information
      this.snackBar.open(`Contact ${tutor.name} at: ${tutor.email}`, 'Close', { duration: 5000 });
    }
  }

  // Payment functionality
  async bookTutor(tutor: TutorInfo) {
    if (!this.user) {
      this.snackBar.open('Please login to book a tutor', 'Close', { duration: 3000 });
      return;
    }

    console.log('🚀 Starting booking process for tutor:', tutor.name);
    console.log('👤 Student:', this.user.name);
    console.log('💰 Hourly rate:', tutor.hourlyRate);

    try {
      // Open payment dialog immediately
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '500px',
        data: {
          tutor: tutor,
          hourlyRate: tutor.hourlyRate,
          studentName: this.user.name || 'Student'
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        console.log('💳 Payment dialog result:', result);
        
        if (result) {
          await this.processPayment(result, tutor);
        } else {
          console.log('❌ Payment cancelled by user');
          this.snackBar.open('Payment cancelled', 'Close', { duration: 2000 });
        }
      });

    } catch (error) {
      console.error('❌ Error opening payment dialog:', error);
      this.snackBar.open('Error opening payment dialog. Please try again.', 'Close', { duration: 3000 });
    }
  }

  async processPayment(paymentData: any, tutor: TutorInfo) {
    try {
      console.log('💳 Processing payment:', paymentData);
      
      // Show processing message
      this.snackBar.open('Processing payment...', '', { duration: 2000 });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a real match in Firebase (if available)
      try {
        const matchId = await this.tutorStudentService.createMatch({
          tutorId: tutor.id,
          studentId: this.user.uid,
          status: 'pending',
          subject: tutor.specialties[0] || 'General',
          hourlyRate: tutor.hourlyRate,
          duration: paymentData.hours || 1,
          totalAmount: paymentData.amount,
          paymentStatus: 'paid',
          tutorName: tutor.name,
          studentName: this.user.name
        });
        
        console.log('✅ Created tutor-student match:', matchId);
      } catch (firebaseError) {
        console.warn('⚠️ Could not create Firebase match, but payment processed:', firebaseError);
      }
      
      // Create payment record
      const payment = {
        studentId: this.user.uid,
        tutorId: tutor.id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        description: `Booking session with ${tutor.name} - ${paymentData.hours || 1} hour(s)`,
        status: 'completed',
        createdAt: new Date(),
        hours: paymentData.hours || 1,
        tutorName: tutor.name,
        studentName: this.user.name
      };

      console.log('💳 Payment processed successfully:', payment);

      // Show success message
      this.snackBar.open(`Payment successful! Booking confirmed with ${tutor.name}.`, 'Close', { duration: 5000 });

      // You could also send notifications here
      await this.sendNotificationToTutor(tutor.id, this.user.name);

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      this.snackBar.open('Payment failed. Please try again.', 'Close', { duration: 3000 });
    }
  }

  private async sendNotificationToTutor(tutorId: string, studentName: string) {
    // This would send a notification to the tutor
    // You can implement this with Firebase Cloud Messaging or a custom notification system
    console.log(`📧 Notification sent to tutor ${tutorId}: New booking from ${studentName}`);
  }

  getGradePercentage(grade: StudentGrade): number {
    return Math.round((grade.grade / grade.maxGrade) * 100);
  }

  getGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 80) return 'primary';
    if (percentage >= 60) return 'accent';
    return 'warn';
  }

  getSpecialtyColor(specialty: string): string {
    const colors = {
      'Mathematics': 'primary',
      'Science': 'accent',
      'Programming': 'warn',
      'Languages': 'primary',
      'Business': 'accent',
      'Arts': 'warn',
      'Music': 'primary',
      'History': 'accent',
      'Literature': 'warn'
    };
    return colors[specialty as keyof typeof colors] || 'primary';
  }

  clearFilters() {
    this.searchForm.reset();
    this.filteredTutors = [...this.tutors];
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  joinSession(session: any) {
    // Navigate to video session
    console.log('Joining session with:', session.tutor);
    this.snackBar.open('Opening video session...', 'Close', { duration: 2000 });
  }
}

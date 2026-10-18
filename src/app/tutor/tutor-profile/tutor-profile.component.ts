import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../auth/auth.service';
import { UserManagementService } from '../../services/user-management.service';
// import { PaymentService } from '../../services/payment.service';

export interface TutorProfile {
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
  courses: Course[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  enrolledStudents: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  tutorId: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  progress: number;
  lastActive: Date;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

@Component({
  selector: 'app-tutor-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  templateUrl: './tutor-profile.component.html',
  styleUrls: ['./tutor-profile.component.scss']
})
export class TutorProfileComponent implements OnInit {
  tutorProfile: TutorProfile | null = null;
  currentUser: any = null;
  isOwnProfile = false;
  isLoading = true;
  selectedTab = 0;

  // Forms
  courseForm: FormGroup;
  editProfileForm: FormGroup;

  // Data
  tutorStudents: StudentInfo[] = [];
  availableCourses: Course[] = [];
  enrolledCourses: Course[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userManagement: UserManagementService,
    // private paymentService: PaymentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: ['', Validators.required],
      level: ['beginner', Validators.required],
      category: ['', Validators.required],
      maxStudents: [10, [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.editProfileForm = this.fb.group({
      bio: ['', Validators.required],
      specialties: [[]],
      experience: ['', Validators.required],
      education: ['', Validators.required],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      availability: [[]],
      skills: [[]],
      languages: [[]],
      certifications: [[]]
    });
  }

  async ngOnInit() {
    const tutorId = this.route.snapshot.paramMap.get('id');
    this.currentUser = this.authService.getUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!tutorId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (tutorId === 'me' || tutorId === this.currentUser.uid) {
      this.isOwnProfile = true;
      await this.loadOwnProfile();
    } else {
      await this.loadTutorProfile(tutorId);
    }

    this.isLoading = false;
  }

  async loadOwnProfile() {
    try {
      const userData = await this.userManagement.getUserById(this.currentUser.uid);
      if (userData && userData.role === 'tutor') {
        this.tutorProfile = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          bio: userData.profile?.bio || '',
          specialties: userData.profile?.specialties || [],
          experience: userData.profile?.experience || '',
          education: userData.profile?.education || '',
          hourlyRate: userData.profile?.hourlyRate || 0,
          rating: userData.profile?.rating || 0,
          totalStudents: userData.profile?.totalStudents || 0,
          totalSessions: userData.profile?.totalSessions || 0,
          availability: userData.profile?.availability || [],
          courses: userData.profile?.courses || [],
          skills: userData.profile?.skills || [],
          languages: userData.profile?.languages || [],
          certifications: userData.profile?.certifications || []
        };

        // Load students and courses
        await this.loadTutorStudents();
        await this.loadTutorCourses();

        // Populate edit form
        this.editProfileForm.patchValue({
          bio: this.tutorProfile.bio,
          specialties: this.tutorProfile.specialties,
          experience: this.tutorProfile.experience,
          education: this.tutorProfile.education,
          hourlyRate: this.tutorProfile.hourlyRate,
          availability: this.tutorProfile.availability,
          skills: this.tutorProfile.skills,
          languages: this.tutorProfile.languages,
          certifications: this.tutorProfile.certifications
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
    }
  }

  async loadTutorProfile(tutorId: string) {
    try {
      const userData = await this.userManagement.getUserById(tutorId);
      if (userData && userData.role === 'tutor') {
        this.tutorProfile = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          bio: userData.profile?.bio || '',
          specialties: userData.profile?.specialties || [],
          experience: userData.profile?.experience || '',
          education: userData.profile?.education || '',
          hourlyRate: userData.profile?.hourlyRate || 0,
          rating: userData.profile?.rating || 0,
          totalStudents: userData.profile?.totalStudents || 0,
          totalSessions: userData.profile?.totalSessions || 0,
          availability: userData.profile?.availability || [],
          courses: userData.profile?.courses || [],
          skills: userData.profile?.skills || [],
          languages: userData.profile?.languages || [],
          certifications: userData.profile?.certifications || []
        };

        await this.loadTutorCourses();
      }
    } catch (error) {
      console.error('Error loading tutor profile:', error);
      this.snackBar.open('Error loading tutor profile', 'Close', { duration: 3000 });
    }
  }

  async loadTutorStudents() {
    if (!this.tutorProfile) return;
    
    try {
      // This would typically fetch from a service that gets students for this tutor
      this.tutorStudents = await this.userManagement.getTutorStudents(this.tutorProfile.id);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }

  async loadTutorCourses() {
    if (!this.tutorProfile) return;

    try {
      this.availableCourses = await this.userManagement.getTutorCourses(this.tutorProfile.id);
      
      if (this.currentUser?.role === 'student') {
        this.enrolledCourses = await this.userManagement.getStudentEnrolledCourses(this.currentUser.uid);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }

  async createCourse() {
    if (!this.courseForm.valid || !this.tutorProfile) return;

    try {
      const courseData: Course = {
        id: '',
        ...this.courseForm.value,
        tutorId: this.tutorProfile.id,
        enrolledStudents: 0,
        isActive: true,
        createdAt: new Date()
      };

      const createdCourse = await this.userManagement.createCourse(courseData);
      
      this.snackBar.open('Course created successfully!', 'Close', { duration: 3000 });
      this.courseForm.reset();
      await this.loadTutorCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      this.snackBar.open('Error creating course', 'Close', { duration: 3000 });
    }
  }

  async updateProfile() {
    if (!this.editProfileForm.valid || !this.tutorProfile) return;

    try {
      const profileData = this.editProfileForm.value;
      await this.userManagement.updateTutorProfile(this.tutorProfile.id, profileData);
      
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      await this.loadOwnProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
    }
  }

  async enrollInCourse(course: Course) {
    if (!this.currentUser || this.currentUser.role !== 'student') return;

    try {
      // TODO: Re-enable when PaymentService is properly imported
      // await this.paymentService.processCourseEnrollment(this.currentUser.uid, course.id, course.price);
      
      this.snackBar.open('Course enrollment feature coming soon!', 'Close', { duration: 3000 });
      // await this.loadTutorCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      this.snackBar.open('Error enrolling in course', 'Close', { duration: 3000 });
    }
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'primary';
      case 'pending': return 'warn';
      case 'overdue': return 'accent';
      default: return 'primary';
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'beginner': return 'primary';
      case 'intermediate': return 'accent';
      case 'advanced': return 'warn';
      default: return 'primary';
    }
  }

  isEnrolledInCourse(courseId: string): boolean {
    return this.enrolledCourses.some(course => course.id === courseId);
  }

  getCourseProgress(courseId: string): number {
    const course = this.enrolledCourses.find(c => c.id === courseId);
    return course ? Math.random() * 100 : 0; // Placeholder - would come from actual progress data
  }

  backToDashboard() {
    if (this.currentUser?.role === 'tutor') {
      this.router.navigate(['/teacher']);
    } else if (this.currentUser?.role === 'student') {
      this.router.navigate(['/dashboard/student']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  editProfile() {
    this.selectedTab = 2; // Switch to edit profile tab
  }

  addCourse() {
    this.selectedTab = 1; // Switch to courses tab
  }
}

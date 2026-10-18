import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { AuthService } from '../auth/auth.service';
import { UserManagementService } from '../services/user-management.service';

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

@Component({
  selector: 'app-find-tutors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './find-tutors.component.html',
  styleUrls: ['./find-tutors.component.scss']
})
export class FindTutorsComponent implements OnInit {
  tutors: TutorInfo[] = [];
  filteredTutors: TutorInfo[] = [];
  isLoading = true;
  currentUser: any = null;

  // Search and Filter
  searchForm: FormGroup;
  selectedSpecialty = '';
  selectedLevel = '';
  selectedPriceRange = '';
  searchQuery = '';

  // Pagination
  pageSize = 12;
  currentPage = 0;

  specialties = [
    'Mathematics', 'Science', 'Programming', 'Languages', 
    'Business', 'Arts', 'Music', 'History', 'Literature', 'Other'
  ];

  priceRanges = [
    { label: 'Under $25/hr', min: 0, max: 25 },
    { label: '$25-$50/hr', min: 25, max: 50 },
    { label: '$50-$100/hr', min: 50, max: 100 },
    { label: 'Over $100/hr', min: 100, max: Infinity }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userManagement: UserManagementService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      specialty: [''],
      priceRange: [''],
      availability: ['']
    });
  }

  async ngOnInit() {
    this.currentUser = this.authService.getUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadTutors();
    this.setupSearchListeners();
    this.isLoading = false;
  }

  async loadTutors() {
    try {
      this.userManagement.getUsersByRole('tutor').subscribe({
        next: (users) => {
          this.tutors = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            bio: user.profile?.bio || '',
            specialties: user.profile?.specialties || [],
            experience: user.profile?.experience || '',
            education: (user.profile as any)?.education || '',
            hourlyRate: user.profile?.hourlyRate || 0,
            rating: user.profile?.rating || 0,
            totalStudents: (user.profile as any)?.totalStudents || 0,
            totalSessions: (user.profile as any)?.totalSessions || 0,
            availability: (user.profile as any)?.availability || [],
            skills: (user.profile as any)?.skills || [],
            languages: (user.profile as any)?.languages || [],
            certifications: (user.profile as any)?.certifications || []
          }));
          this.filteredTutors = [...this.tutors];
        },
        error: (error) => {
          console.error('Error loading tutors:', error);
          this.snackBar.open('Error loading tutors', 'Close', { duration: 3000 });
        }
      });
    } catch (error) {
      console.error('Error loading tutors:', error);
      this.snackBar.open('Error loading tutors', 'Close', { duration: 3000 });
    }
  }

  setupSearchListeners() {
    this.searchForm.valueChanges.subscribe(() => {
      this.filterTutors();
    });
  }

  filterTutors() {
    const { search, specialty, priceRange, availability } = this.searchForm.value;
    
    this.filteredTutors = this.tutors.filter(tutor => {
      // Search query
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          tutor.name.toLowerCase().includes(searchLower) ||
          tutor.bio.toLowerCase().includes(searchLower) ||
          tutor.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
          tutor.skills.some(s => s.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (specialty && !tutor.specialties.includes(specialty)) {
        return false;
      }

      // Price range filter
      if (priceRange) {
        const range = this.priceRanges.find(r => r.label === priceRange);
        if (range && (tutor.hourlyRate < range.min || tutor.hourlyRate > range.max)) {
          return false;
        }
      }

      // Availability filter
      if (availability && !tutor.availability.includes(availability)) {
        return false;
      }

      return true;
    });
  }

  viewTutorProfile(tutorId: string) {
    this.router.navigate(['/tutor-profile', tutorId]);
  }

  contactTutor(tutor: TutorInfo) {
    // This would typically open a messaging component
    this.snackBar.open(`Contact feature coming soon for ${tutor.name}`, 'Close', { duration: 3000 });
  }

  getRatingStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(0);
    }
    
    return stars;
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

  getAverageRating(tutor: TutorInfo): string {
    return (tutor.rating || 4.5).toFixed(1);
  }

  backToDashboard() {
    if (this.currentUser?.role === 'student') {
      this.router.navigate(['/dashboard/student']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}

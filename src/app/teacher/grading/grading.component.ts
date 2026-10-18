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
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../auth/auth.service';
import { UserManagementService, StudentGrade, UserAccount } from '../../services/user-management.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grading',
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
    MatSliderModule,
    ReactiveFormsModule
  ],
  templateUrl: './grading.component.html',
  styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  
  // Data
  students: UserAccount[] = [];
  grades: StudentGrade[] = [];
  selectedStudent: UserAccount | null = null;
  selectedGrade: StudentGrade | null = null;
  
  // Forms
  gradeForm: FormGroup;
  
  // Table configurations
  gradeColumns: string[] = ['studentName', 'subject', 'grade', 'maxGrade', 'assignment', 'gradedAt', 'actions'];
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private userManagement: UserManagementService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.gradeForm = this.fb.group({
      studentId: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      grade: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxGrade: [100, [Validators.required, Validators.min(1)]],
      assignment: ['', [Validators.required]],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
      semester: ['Fall 2024', [Validators.required]],
      year: [2024, [Validators.required, Validators.min(2020), Validators.max(2030)]]
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
    
    // Load students
    const studentSub = this.userManagement.getUsersByRole('student').subscribe(students => {
      this.students = students;
    });
    
    // Load tutor's grades
    const gradeSub = this.userManagement.getTutorGrades(this.user!.uid).subscribe(grades => {
      this.grades = grades;
      this.loading = false;
    });
    
    this.subscriptions.push(studentSub, gradeSub);
  }

  // Grade Management
  async addGrade() {
    if (this.gradeForm.valid && this.user) {
      try {
        await this.userManagement.addGrade({
          ...this.gradeForm.value,
          tutorId: this.user.uid
        });
        
        this.gradeForm.reset();
        this.loadData();
      } catch (error) {
        console.error('Error adding grade:', error);
      }
    }
  }

  async updateGrade() {
    if (this.selectedGrade && this.gradeForm.valid) {
      try {
        await this.userManagement.updateGrade(this.selectedGrade.id, this.gradeForm.value);
        this.selectedGrade = null;
        this.gradeForm.reset();
        this.loadData();
      } catch (error) {
        console.error('Error updating grade:', error);
      }
    }
  }

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

  editGrade(grade: StudentGrade) {
    this.selectedGrade = grade;
    this.gradeForm.patchValue({
      studentId: grade.studentId,
      subject: grade.subject,
      grade: grade.grade,
      maxGrade: grade.maxGrade,
      assignment: grade.assignment,
      feedback: grade.feedback,
      semester: grade.semester,
      year: grade.year
    });
  }

  cancelEdit() {
    this.selectedGrade = null;
    this.gradeForm.reset();
  }

  // Student Selection
  selectStudent(student: UserAccount) {
    this.selectedStudent = student;
    this.gradeForm.patchValue({ studentId: student.id });
  }

  // Utility Methods
  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  }

  getGradePercentage(grade: StudentGrade): number {
    return Math.round((grade.grade / grade.maxGrade) * 100);
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 80) return 'primary';
    if (percentage >= 60) return 'accent';
    return 'warn';
  }

  getGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleDateString() : new Date(timestamp).toLocaleDateString();
  }

  formatDateTime(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
  }

  // Statistics
  getGradeStats() {
    if (this.grades.length === 0) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
      };
    }

    const percentages = this.grades.map(g => this.getGradePercentage(g));
    const average = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    percentages.forEach(p => {
      const letter = this.getGradeLetter(p);
      distribution[letter as keyof typeof distribution]++;
    });

    return {
      total: this.grades.length,
      average,
      highest,
      lowest,
      distribution
    };
  }

  getStudentGrades(studentId: string): StudentGrade[] {
    return this.grades.filter(g => g.studentId === studentId);
  }

  getStudentAverage(studentId: string): number {
    const studentGrades = this.getStudentGrades(studentId);
    if (studentGrades.length === 0) return 0;
    
    const percentages = studentGrades.map(g => this.getGradePercentage(g));
    return Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  }

  // Computed properties for template
  get gradedStudentsCount() {
    if (this.grades.length === 0) return 0;
    return new Set(this.grades.map(g => g.studentId)).size;
  }

  // Navigation
  backToDashboard() {
    this.router.navigate(['/teacher']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Quick Actions
  refreshData() {
    this.loadData();
  }

  exportGrades() {
    const data = {
      grades: this.grades,
      students: this.students,
      tutor: this.user,
      stats: this.getGradeStats(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

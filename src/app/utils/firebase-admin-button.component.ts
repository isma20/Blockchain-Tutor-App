import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseDataService } from './firebase-data.service';

@Component({
  selector: 'app-firebase-admin-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="admin-panel" style="position: fixed; top: 20px; right: 20px; z-index: 1000; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <h3 style="margin: 0 0 10px 0; color: #333;">🔧 Firebase Admin</h3>
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Populate sample data</p>
      
      <button mat-raised-button color="primary" (click)="populateData()" [disabled]="isLoading" style="margin-right: 8px;">
        <mat-icon>person_add</mat-icon>
        Add Users
      </button>
      
      <button mat-raised-button color="accent" (click)="addReviews()" [disabled]="isLoading">
        <mat-icon>star</mat-icon>
        Add Reviews
      </button>
      
      <div *ngIf="isLoading" style="margin-top: 10px; font-size: 12px; color: #666;">
        Processing... Please wait
      </div>
    </div>
  `,
  styles: [`
    .admin-panel {
      font-family: Arial, sans-serif;
    }
  `]
})
export class FirebaseAdminButtonComponent {
  isLoading = false;

  constructor(
    private firebaseDataService: FirebaseDataService,
    private snackBar: MatSnackBar
  ) {}

  async populateData() {
    this.isLoading = true;
    try {
      const result = await this.firebaseDataService.populateSampleData();
      console.log('✅ Data population completed:', result);
    } catch (error) {
      console.error('❌ Error populating data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addReviews() {
    this.isLoading = true;
    try {
      const result = await this.firebaseDataService.addSampleReviews();
      console.log('✅ Reviews added:', result);
    } catch (error) {
      console.error('❌ Error adding reviews:', error);
    } finally {
      this.isLoading = false;
    }
  }
}

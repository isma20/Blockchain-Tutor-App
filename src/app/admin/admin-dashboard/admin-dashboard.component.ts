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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../auth/auth.service';
import { ContactService, ContactMessage, UserApproval } from '../../services/contact.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
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
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  
  // Data
  contactMessages: ContactMessage[] = [];
  userApprovals: UserApproval[] = [];
  selectedApproval: UserApproval | null = null;
  
  // Stats
  messageStats = { pending: 0, read: 0, responded: 0, archived: 0, total: 0 };
  approvalStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
  
  // Table configurations
  messageColumns: string[] = ['name', 'email', 'type', 'status', 'timestamp', 'actions'];
  approvalColumns: string[] = ['name', 'email', 'role', 'submittedAt', 'status', 'actions'];
  
  // Forms
  rejectionForm: FormGroup;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private contactService: ContactService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.rejectionForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    const ok = await this.auth.ensureSession();
    if (!ok) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.auth.getUser();
    
    if (this.user?.role !== 'admin') {
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
    
    // Load contact messages
    const messageSub = this.contactService.getContactMessages().subscribe(messages => {
      this.contactMessages = messages;
      this.loadMessageStats();
    });
    
    // Load user approvals
    const approvalSub = this.contactService.getAllApprovals().subscribe(approvals => {
      this.userApprovals = approvals;
      this.loadApprovalStats();
      this.loading = false;
    });
    
    // Load stats
    const messageStatsSub = this.contactService.getMessageStats().subscribe(stats => {
      this.messageStats = stats;
    });
    
    const approvalStatsSub = this.contactService.getApprovalStats().subscribe(stats => {
      this.approvalStats = stats;
    });
    
    this.subscriptions.push(messageSub, approvalSub, messageStatsSub, approvalStatsSub);
  }

  private loadMessageStats() {
    this.messageStats = {
      pending: this.contactMessages.filter(m => m.status === 'pending').length,
      read: this.contactMessages.filter(m => m.status === 'read').length,
      responded: this.contactMessages.filter(m => m.status === 'responded').length,
      archived: this.contactMessages.filter(m => m.status === 'archived').length,
      total: this.contactMessages.length
    };
  }

  private loadApprovalStats() {
    this.approvalStats = {
      pending: this.userApprovals.filter(a => a.status === 'pending').length,
      approved: this.userApprovals.filter(a => a.status === 'approved').length,
      rejected: this.userApprovals.filter(a => a.status === 'rejected').length,
      total: this.userApprovals.length
    };
  }

  // Contact Message Actions
  async updateMessageStatus(messageId: string, status: ContactMessage['status']) {
    try {
      await this.contactService.updateMessageStatus(messageId, status);
      this.loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  async deleteMessage(messageId: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await this.contactService.deleteMessage(messageId);
        this.loadData(); // Refresh data
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }

  // User Approval Actions
  async approveUser(approval: UserApproval) {
    if (!this.user) return;
    
    try {
      await this.contactService.approveUser(approval.id, this.user.email);
      this.loadData(); // Refresh data
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }

  async rejectUser(approval: UserApproval) {
    if (!this.user) return;
    
    const reason = this.rejectionForm.get('rejectionReason')?.value;
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      await this.contactService.rejectUser(approval.id, this.user.email, reason);
      this.rejectionForm.reset();
      this.selectedApproval = null;
      this.loadData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  }

  viewApprovalDetails(approval: UserApproval) {
    this.selectedApproval = approval;
  }

  // Utility Methods
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'approved':
      case 'read': return 'primary';
      case 'rejected':
      case 'archived': return 'accent';
      default: return 'primary';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'student_approval': return 'school';
      case 'tutor_approval': return 'psychology';
      case 'complaint': return 'warning';
      case 'feedback': return 'feedback';
      default: return 'message';
    }
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return timestamp.toDate ? timestamp.toDate().toLocaleDateString() : new Date(timestamp).toLocaleDateString();
  }

  // Navigation
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }

  // Quick Actions
  refreshData() {
    this.loadData();
  }

  exportData() {
    // Export functionality
    const data = {
      messages: this.contactMessages,
      approvals: this.userApprovals,
      stats: {
        messages: this.messageStats,
        approvals: this.approvalStats
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

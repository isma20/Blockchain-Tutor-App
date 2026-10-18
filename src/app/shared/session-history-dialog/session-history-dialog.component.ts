import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

export interface SessionHistoryDialogData {
  title: string;
  sessions: any[];
}

@Component({
  selector: 'app-session-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './session-history-dialog.component.html',
  styleUrls: ['./session-history-dialog.component.scss']
})
export class SessionHistoryDialogComponent {
  displayedColumns: string[] = ['student', 'subject', 'date', 'time', 'duration', 'status', 'earnings'];
  
  constructor(
    public dialogRef: MatDialogRef<SessionHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SessionHistoryDialogData
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}

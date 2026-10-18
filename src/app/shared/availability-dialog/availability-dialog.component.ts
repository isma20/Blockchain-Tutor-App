import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface AvailabilityDialogData {
  title: string;
  availability?: any[];
}

export interface AvailabilityResult {
  availability: any[];
}

@Component({
  selector: 'app-availability-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './availability-dialog.component.html',
  styleUrls: ['./availability-dialog.component.scss']
})
export class AvailabilityDialogComponent {
  availabilityForm: FormGroup;
  availabilitySlots: any[] = [];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AvailabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AvailabilityDialogData
  ) {
    this.availabilityForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      status: ['available', Validators.required]
    });
    
    if (data.availability) {
      this.availabilitySlots = [...data.availability];
    }
  }

  addAvailabilitySlot() {
    if (this.availabilityForm.valid) {
      const slot = {
        ...this.availabilityForm.value,
        id: Date.now()
      };
      this.availabilitySlots.push(slot);
      this.availabilityForm.reset();
    }
  }

  removeSlot(slot: any) {
    const index = this.availabilitySlots.findIndex(s => s.id === slot.id);
    if (index > -1) {
      this.availabilitySlots.splice(index, 1);
    }
  }

  onSave() {
    this.dialogRef.close({ availability: this.availabilitySlots });
  }

  onCancel() {
    this.dialogRef.close();
  }
}

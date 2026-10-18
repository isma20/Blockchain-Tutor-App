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

export interface PaymentDialogData {
  tutor: any;
  hourlyRate: number;
  studentName: string;
}

export interface PaymentResult {
  amount: number;
  paymentMethod: string;
  cardNumber?: string;
}

@Component({
  selector: 'app-payment-dialog',
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
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  paymentForm: FormGroup;
  totalAmount = 0;
  data: PaymentDialogData;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public injectedData: PaymentDialogData
  ) {
    this.data = injectedData;
    this.paymentForm = this.fb.group({
      hours: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      paymentMethod: ['credit_card', Validators.required],
      cardNumber: ['', Validators.required]
    });

    // Calculate total amount when hours change
    this.paymentForm.get('hours')?.valueChanges.subscribe(hours => {
      this.totalAmount = hours * this.data.hourlyRate;
    });

    // Remove card validation if not card payment
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardField = this.paymentForm.get('cardNumber');
      if (method === 'credit_card' || method === 'debit_card') {
        cardField?.setValidators(Validators.required);
      } else {
        cardField?.clearValidators();
        cardField?.setValue('');
      }
      cardField?.updateValueAndValidity();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.paymentForm.valid) {
      const result: PaymentResult = {
        amount: this.totalAmount,
        paymentMethod: this.paymentForm.get('paymentMethod')?.value,
        cardNumber: this.paymentForm.get('cardNumber')?.value
      };
      this.dialogRef.close(result);
    }
  }
}

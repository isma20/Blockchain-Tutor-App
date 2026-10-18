import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

export interface Payment {
  id: string;
  studentId: string;
  tutorId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'paypal' | 'bank_transfer';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  description: string;
  metadata?: any;
}

export interface Enrollment {
  id: string;
  studentId: string;
  tutorId: string;
  courseId: string;
  paymentId: string;
  status: 'active' | 'completed' | 'cancelled' | 'suspended';
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  lastAccessedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly PAYMENTS_COLLECTION = 'payments';
  private readonly ENROLLMENTS_COLLECTION = 'enrollments';

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async processCourseEnrollment(studentId: string, courseId: string, amount: number): Promise<Enrollment> {
    try {
      // Create payment record
      const paymentData: Omit<Payment, 'id'> = {
        studentId,
        tutorId: '', // Will be filled from course data
        courseId,
        amount,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'card',
        createdAt: new Date(),
        description: `Course enrollment for course ${courseId}`
      };

      const paymentRef = await addDoc(collection(this.firestore, this.PAYMENTS_COLLECTION), paymentData);
      
      // Simulate payment processing (in real app, integrate with payment gateway)
      await this.simulatePaymentProcessing(paymentRef.id);

      // Create enrollment after successful payment
      const enrollmentData: Omit<Enrollment, 'id'> = {
        studentId,
        tutorId: '', // Will be filled from course data
        courseId,
        paymentId: paymentRef.id,
        status: 'active',
        enrolledAt: new Date(),
        progress: 0,
        lastAccessedAt: new Date()
      };

      const enrollmentRef = await addDoc(collection(this.firestore, this.ENROLLMENTS_COLLECTION), enrollmentData);

      return {
        id: enrollmentRef.id,
        ...enrollmentData
      };
    } catch (error) {
      console.error('Error processing course enrollment:', error);
      throw error;
    }
  }

  async simulatePaymentProcessing(paymentId: string): Promise<void> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update payment status to completed
    const paymentRef = doc(this.firestore, this.PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status: 'completed',
      completedAt: new Date(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  async getStudentPayments(studentId: string): Promise<Payment[]> {
    try {
      const paymentsQuery = query(
        collection(this.firestore, this.PAYMENTS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(paymentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Payment));
    } catch (error) {
      console.error('Error getting student payments:', error);
      throw error;
    }
  }

  async getTutorPayments(tutorId: string): Promise<Payment[]> {
    try {
      const paymentsQuery = query(
        collection(this.firestore, this.PAYMENTS_COLLECTION),
        where('tutorId', '==', tutorId),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc')
      );

      const querySnapshot = await getDocs(paymentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Payment));
    } catch (error) {
      console.error('Error getting tutor payments:', error);
      throw error;
    }
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(this.firestore, this.ENROLLMENTS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('enrolledAt', 'desc')
      );

      const querySnapshot = await getDocs(enrollmentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Enrollment));
    } catch (error) {
      console.error('Error getting student enrollments:', error);
      throw error;
    }
  }

  async getTutorEnrollments(tutorId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsQuery = query(
        collection(this.firestore, this.ENROLLMENTS_COLLECTION),
        where('tutorId', '==', tutorId),
        orderBy('enrolledAt', 'desc')
      );

      const querySnapshot = await getDocs(enrollmentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Enrollment));
    } catch (error) {
      console.error('Error getting tutor enrollments:', error);
      throw error;
    }
  }

  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<void> {
    try {
      const enrollmentRef = doc(this.firestore, this.ENROLLMENTS_COLLECTION, enrollmentId);
      await updateDoc(enrollmentRef, {
        progress,
        lastAccessedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      throw error;
    }
  }

  async cancelEnrollment(enrollmentId: string): Promise<void> {
    try {
      const enrollmentRef = doc(this.firestore, this.ENROLLMENTS_COLLECTION, enrollmentId);
      await updateDoc(enrollmentRef, {
        status: 'cancelled'
      });

      // Process refund (in real app, integrate with payment gateway)
      await this.processRefund(enrollmentId);
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      throw error;
    }
  }

  private async processRefund(enrollmentId: string): Promise<void> {
    try {
      // Get enrollment to find payment
      const enrollmentRef = doc(this.firestore, this.ENROLLMENTS_COLLECTION, enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);
      
      if (enrollmentDoc.exists()) {
        const enrollment = enrollmentDoc.data() as Enrollment;
        
        // Update payment status to refunded
        const paymentRef = doc(this.firestore, this.PAYMENTS_COLLECTION, enrollment.paymentId);
        await updateDoc(paymentRef, {
          status: 'refunded'
        });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getTutorEarnings(tutorId: string): Promise<{ total: number; monthly: number; pending: number }> {
    try {
      const payments = await this.getTutorPayments(tutorId);
      
      const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const monthly = payments
        .filter(payment => payment.completedAt && payment.completedAt >= currentMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const pendingPayments = await getDocs(
        query(
          collection(this.firestore, this.PAYMENTS_COLLECTION),
          where('tutorId', '==', tutorId),
          where('status', '==', 'pending')
        )
      );
      
      const pending = pendingPayments.docs.reduce((sum, doc) => {
        const payment = doc.data() as Payment;
        return sum + payment.amount;
      }, 0);

      return { total, monthly, pending };
    } catch (error) {
      console.error('Error getting tutor earnings:', error);
      throw error;
    }
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'pending': return 'warn';
      case 'failed': return 'accent';
      case 'refunded': return 'default';
      default: return 'default';
    }
  }

  getEnrollmentStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return 'warn';
      case 'suspended': return 'default';
      default: return 'default';
    }
  }
}

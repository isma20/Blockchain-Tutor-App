import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, Firestore, Timestamp } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: Timestamp;
  status: 'pending' | 'read' | 'responded' | 'archived';
  type: 'general' | 'student_approval' | 'tutor_approval' | 'complaint' | 'feedback';
  userId?: string;
  userRole?: 'student' | 'tutor' | 'admin';
  metadata?: {
    [key: string]: any;
  };
}

export interface UserApproval {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'tutor';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  documents?: {
    cv?: string;
    certificates?: string[];
    idProof?: string;
    qualifications?: string[];
  };
  specialties?: string[];
  experience?: string;
  hourlyRate?: number;
  bio?: string;
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly CONTACT_COLLECTION = 'contactMessages';
  private readonly APPROVAL_COLLECTION = 'userApprovals';

  constructor(private firestore: Firestore) {}

  // Contact Message Methods
  async submitContactMessage(message: Omit<ContactMessage, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.CONTACT_COLLECTION));
    const contactMessage: ContactMessage = {
      ...message,
      id: docRef.id,
      timestamp: Timestamp.now(),
      status: 'pending'
    };
    
    await setDoc(docRef, contactMessage);
    return docRef.id;
  }

  getContactMessages(): Observable<ContactMessage[]> {
    const q = query(
      collection(this.firestore, this.CONTACT_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ContactMessage))
      ),
      catchError(error => {
        console.error('Error fetching contact messages:', error);
        return of([]);
      })
    );
  }

  getPendingMessages(): Observable<ContactMessage[]> {
    const q = query(
      collection(this.firestore, this.CONTACT_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ContactMessage))
      ),
      catchError(error => {
        console.error('Error fetching pending messages:', error);
        return of([]);
      })
    );
  }

  async updateMessageStatus(messageId: string, status: ContactMessage['status']): Promise<void> {
    const docRef = doc(this.firestore, this.CONTACT_COLLECTION, messageId);
    await updateDoc(docRef, { 
      status,
      ...(status === 'read' ? { readAt: Timestamp.now() } : {}),
      ...(status === 'responded' ? { respondedAt: Timestamp.now() } : {})
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    const docRef = doc(this.firestore, this.CONTACT_COLLECTION, messageId);
    await deleteDoc(docRef);
  }

  // User Approval Methods
  async submitUserApproval(approval: Omit<UserApproval, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.APPROVAL_COLLECTION));
    const userApproval: UserApproval = {
      ...approval,
      id: docRef.id,
      submittedAt: Timestamp.now(),
      status: 'pending'
    };
    
    await setDoc(docRef, userApproval);
    return docRef.id;
  }

  getPendingApprovals(): Observable<UserApproval[]> {
    const q = query(
      collection(this.firestore, this.APPROVAL_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserApproval))
      ),
      catchError(error => {
        console.error('Error fetching pending approvals:', error);
        return of([]);
      })
    );
  }

  getAllApprovals(): Observable<UserApproval[]> {
    const q = query(
      collection(this.firestore, this.APPROVAL_COLLECTION),
      orderBy('submittedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserApproval))
      ),
      catchError(error => {
        console.error('Error fetching all approvals:', error);
        return of([]);
      })
    );
  }

  async approveUser(approvalId: string, reviewedBy: string): Promise<void> {
    const docRef = doc(this.firestore, this.APPROVAL_COLLECTION, approvalId);
    await updateDoc(docRef, {
      status: 'approved',
      reviewedAt: Timestamp.now(),
      reviewedBy
    });
  }

  async rejectUser(approvalId: string, reviewedBy: string, rejectionReason: string): Promise<void> {
    const docRef = doc(this.firestore, this.APPROVAL_COLLECTION, approvalId);
    await updateDoc(docRef, {
      status: 'rejected',
      reviewedAt: Timestamp.now(),
      reviewedBy,
      rejectionReason
    });
  }

  async getApprovalById(approvalId: string): Promise<UserApproval | null> {
    const docRef = doc(this.firestore, this.APPROVAL_COLLECTION, approvalId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as UserApproval;
    }
    
    return null;
  }

  // Statistics Methods
  getApprovalStats(): Observable<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    return this.getAllApprovals().pipe(
      map(approvals => {
        const stats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: approvals.length
        };

        approvals.forEach(approval => {
          stats[approval.status]++;
        });

        return stats;
      })
    );
  }

  getMessageStats(): Observable<{
    pending: number;
    read: number;
    responded: number;
    archived: number;
    total: number;
  }> {
    return this.getContactMessages().pipe(
      map(messages => {
        const stats = {
          pending: 0,
          read: 0,
          responded: 0,
          archived: 0,
          total: messages.length
        };

        messages.forEach(message => {
          stats[message.status]++;
        });

        return stats;
      })
    );
  }
}

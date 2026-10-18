import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, addDoc, serverTimestamp, onSnapshot, Timestamp, Firestore } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TutorStudentMatch {
  id: string;
  tutorId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestedAt: Timestamp;
  acceptedAt?: Timestamp;
  completedAt?: Timestamp;
  subject: string;
  message?: string;
  hourlyRate: number;
  scheduledDate?: Timestamp;
  duration: number; // in hours
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  tutorName?: string;
  studentName?: string;
}

export interface TutorReview {
  id: string;
  tutorId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  subject: string;
  sessionId: string;
  createdAt: Timestamp;
  studentName?: string;
  tutorName?: string;
  helpful: number; // number of people who found this helpful
}

export interface TutorStudentConnection {
  id: string;
  tutorId: string;
  studentId: string;
  connectionType: 'session' | 'booking' | 'inquiry';
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  lastInteraction?: Timestamp;
  subject: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TutorStudentService {
  private readonly MATCHES_COLLECTION = 'tutorStudentMatches';
  private readonly REVIEWS_COLLECTION = 'tutorReviews';
  private readonly CONNECTIONS_COLLECTION = 'tutorStudentConnections';

  constructor(private firestore: Firestore) {}

  // Tutor-Student Matching
  async createMatch(matchData: Omit<TutorStudentMatch, 'id' | 'requestedAt'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.MATCHES_COLLECTION));
    const match: TutorStudentMatch = {
      ...matchData,
      id: docRef.id,
      requestedAt: Timestamp.now()
    };
    
    await setDoc(docRef, match);
    return docRef.id;
  }

  // Get matches for a specific tutor
  getTutorMatches(tutorId: string): Observable<TutorStudentMatch[]> {
    const q = query(
      collection(this.firestore, this.MATCHES_COLLECTION),
      where('tutorId', '==', tutorId),
      orderBy('requestedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentMatch))
      ),
      catchError(error => {
        console.error('Error fetching tutor matches:', error);
        return of([]);
      })
    );
  }

  // Get matches for a specific student
  getStudentMatches(studentId: string): Observable<TutorStudentMatch[]> {
    const q = query(
      collection(this.firestore, this.MATCHES_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('requestedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentMatch))
      ),
      catchError(error => {
        console.error('Error fetching student matches:', error);
        return of([]);
      })
    );
  }

  // Accept a match (tutor accepts student's request)
  async acceptMatch(matchId: string): Promise<void> {
    const docRef = doc(this.firestore, this.MATCHES_COLLECTION, matchId);
    await updateDoc(docRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now()
    });
  }

  // Complete a match
  async completeMatch(matchId: string): Promise<void> {
    const docRef = doc(this.firestore, this.MATCHES_COLLECTION, matchId);
    await updateDoc(docRef, {
      status: 'completed',
      completedAt: Timestamp.now()
    });
  }

  // Reviews System
  async createReview(reviewData: Omit<TutorReview, 'id' | 'createdAt' | 'helpful'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.REVIEWS_COLLECTION));
    const review: TutorReview = {
      ...reviewData,
      id: docRef.id,
      createdAt: Timestamp.now(),
      helpful: 0
    };
    
    await setDoc(docRef, review);
    return docRef.id;
  }

  // Get reviews for a tutor
  getTutorReviews(tutorId: string): Observable<TutorReview[]> {
    const q = query(
      collection(this.firestore, this.REVIEWS_COLLECTION),
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorReview))
      ),
      catchError(error => {
        console.error('Error fetching tutor reviews:', error);
        return of([]);
      })
    );
  }

  // Get reviews by a student
  getStudentReviews(studentId: string): Observable<TutorReview[]> {
    const q = query(
      collection(this.firestore, this.REVIEWS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorReview))
      ),
      catchError(error => {
        console.error('Error fetching student reviews:', error);
        return of([]);
      })
    );
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId: string): Promise<void> {
    const docRef = doc(this.firestore, this.REVIEWS_COLLECTION, reviewId);
    const reviewDoc = await getDoc(docRef);
    
    if (reviewDoc.exists()) {
      const currentHelpful = reviewDoc.data()['helpful'] || 0;
      await updateDoc(docRef, {
        helpful: currentHelpful + 1
      });
    }
  }

  // Calculate tutor's average rating
  async calculateTutorRating(tutorId: string): Promise<number> {
    const q = query(
      collection(this.firestore, this.REVIEWS_COLLECTION),
      where('tutorId', '==', tutorId)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => doc.data() as TutorReview);
    
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
  }

  // Connections/Interactions tracking
  async createConnection(connectionData: Omit<TutorStudentConnection, 'id' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.CONNECTIONS_COLLECTION));
    const connection: TutorStudentConnection = {
      ...connectionData,
      id: docRef.id,
      createdAt: Timestamp.now()
    };
    
    await setDoc(docRef, connection);
    return docRef.id;
  }

  // Get connections for tutor
  getTutorConnections(tutorId: string): Observable<TutorStudentConnection[]> {
    const q = query(
      collection(this.firestore, this.CONNECTIONS_COLLECTION),
      where('tutorId', '==', tutorId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentConnection))
      ),
      catchError(error => {
        console.error('Error fetching tutor connections:', error);
        return of([]);
      })
    );
  }

  // Get connections for student
  getStudentConnections(studentId: string): Observable<TutorStudentConnection[]> {
    const q = query(
      collection(this.firestore, this.CONNECTIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentConnection))
      ),
      catchError(error => {
        console.error('Error fetching student connections:', error);
        return of([]);
      })
    );
  }

  // Real-time updates for matches
  getTutorMatchesRealtime(tutorId: string): Observable<TutorStudentMatch[]> {
    const q = query(
      collection(this.firestore, this.MATCHES_COLLECTION),
      where('tutorId', '==', tutorId),
      orderBy('requestedAt', 'desc')
    );

    return new Observable<TutorStudentMatch[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const matches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentMatch));
        observer.next(matches);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  // Real-time updates for student matches
  getStudentMatchesRealtime(studentId: string): Observable<TutorStudentMatch[]> {
    const q = query(
      collection(this.firestore, this.MATCHES_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('requestedAt', 'desc')
    );

    return new Observable<TutorStudentMatch[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const matches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TutorStudentMatch));
        observer.next(matches);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  // Get tutor statistics
  async getTutorStats(tutorId: string): Promise<{
    totalMatches: number;
    acceptedMatches: number;
    completedMatches: number;
    averageRating: number;
    totalReviews: number;
    totalEarnings: number;
  }> {
    const [matchesSnapshot, reviewsSnapshot] = await Promise.all([
      getDocs(query(collection(this.firestore, this.MATCHES_COLLECTION), where('tutorId', '==', tutorId))),
      getDocs(query(collection(this.firestore, this.REVIEWS_COLLECTION), where('tutorId', '==', tutorId)))
    ]);

    const matches = matchesSnapshot.docs.map(doc => doc.data() as TutorStudentMatch);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data() as TutorReview);

    const totalMatches = matches.length;
    const acceptedMatches = matches.filter(m => m.status === 'accepted').length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10 
      : 0;
    const totalEarnings = matches
      .filter(m => m.status === 'completed' && m.paymentStatus === 'paid')
      .reduce((sum, m) => sum + m.totalAmount, 0);

    return {
      totalMatches,
      acceptedMatches,
      completedMatches,
      averageRating,
      totalReviews,
      totalEarnings
    };
  }
}

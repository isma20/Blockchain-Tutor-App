import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, user, User as FirebaseUser } from '@angular/fire/auth';
import { doc, setDoc, getDoc, Firestore } from '@angular/fire/firestore';

export type Role = 'student' | 'tutor' | 'admin';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  verified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    user(this.auth).subscribe(async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(this.firestore, 'users', fbUser.uid));
        const data = userDoc.data() as { name?: string; role?: Role } | undefined;
        this.currentUser.next({
          uid: fbUser.uid,
          email: fbUser.email!,
          name: data?.name || '',
          role: data?.role || 'student',
          verified: fbUser.emailVerified
        });
      } else {
        this.currentUser.next(null);
      }
    });
  }

  async getToken(): Promise<string | null> {
    return this.auth.currentUser?.getIdToken() ?? null;
  }

  async ensureSession(): Promise<boolean> {
    const fbUser = this.auth.currentUser;
    console.log('🔍 ensureSession check - fbUser:', fbUser?.email, 'emailVerified:', fbUser?.emailVerified);
    
    if (!fbUser) {
      console.log('❌ No Firebase user found');
      return false;
    }
    
    // Re-enable email verification
    if (!fbUser.emailVerified) {
      console.log('❌ Email not verified for:', fbUser.email);
      return false;
    }
    
    // Ensure user data is populated
    if (!this.currentUser.value) {
      console.log('📝 Loading user data from Firestore...');
      const userDoc = await getDoc(doc(this.firestore, 'users', fbUser.uid));
      const data = userDoc.data() as { name?: string; role?: Role } | undefined;
      this.currentUser.next({
        uid: fbUser.uid,
        email: fbUser.email!,
        name: data?.name || '',
        role: data?.role || 'student',
        verified: fbUser.emailVerified
      });
    }
    
    console.log('✅ Session valid for user:', this.currentUser.value?.email, 'role:', this.currentUser.value?.role);
    return true;
  }

  async register(email: string, password: string, name: string, role: Role): Promise<void> {
    console.log('📧 Sending verification email to:', email);
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await sendEmailVerification(cred.user);
    console.log('✅ Verification email sent successfully to:', email);
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      name,
      role,
      createdAt: new Date()
    });
  }

  async login(email: string, password: string, role: Role): Promise<User> {
    console.log('🔐 AuthService.login called');
    console.log('📧 Email:', email);
    console.log('👤 Expected role:', role);
    
    try {
      console.log('🚀 Calling Firebase signInWithEmailAndPassword...');
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Firebase auth successful');
      console.log('📧 Firebase user email:', cred.user.email);
      console.log('📧 Email verified:', cred.user.emailVerified);
      console.log('🆔 Firebase UID:', cred.user.uid);
      
      // Re-enable email verification
      if (!cred.user.emailVerified) {
        console.log('❌ Email not verified, signing out...');
        await signOut(this.auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      
      console.log('📊 Fetching user data from Firestore...');
      const userDoc = await getDoc(doc(this.firestore, 'users', cred.user.uid));
      const data = userDoc.data() as { name?: string; role?: Role; createdAt?: any } | undefined;
      console.log('📝 Firestore data:', data);
      
      const user: User = {
        uid: cred.user.uid,
        email: cred.user.email!,
        name: data?.name || '',
        role: data?.role || role, // Use the login role if no role in Firestore
        verified: cred.user.emailVerified
      };
      
      console.log('👤 Complete user object:', user);
      console.log('🔄 Checking role match - expected:', role, 'actual:', user.role);
      
      // Update Firestore if role is missing or different
      if (!data?.role || data.role !== role) {
        console.log('🔄 Updating user role in Firestore to:', role);
        await setDoc(doc(this.firestore, 'users', cred.user.uid), {
          name: data?.name || user.name,
          role: role,
          createdAt: data?.createdAt || new Date()
        }, { merge: true });
        user.role = role;
      }
      
      this.currentUser.next(user);
      console.log('✅ Login completed successfully');
      return user;
    } catch (error: any) {
      console.error('❌ AuthService.login error:', error);
      throw error;
    }
  }

  logout() {
    signOut(this.auth);
  }

  getUser(): User | null {
    return this.currentUser.value;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  resendVerificationEmail(): Promise<void> {
    const fbUser = this.auth.currentUser;
    if (!fbUser) throw new Error('No user logged in');
    return sendEmailVerification(fbUser);
  }
}
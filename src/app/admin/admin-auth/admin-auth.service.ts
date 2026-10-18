import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly ADMIN_CREDENTIALS: AdminCredentials = {
    email: 'admin@tutorapp.com',
    password: 'Admin@2024!'
  };

  private isAdminLoggedIn = new BehaviorSubject<boolean>(false);
  isAdminLoggedIn$ = this.isAdminLoggedIn.asObservable();

  constructor() {
    // Check if admin is already logged in (session storage)
    const storedAuth = sessionStorage.getItem('adminAuth');
    if (storedAuth === 'true') {
      this.isAdminLoggedIn.next(true);
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        if (email === this.ADMIN_CREDENTIALS.email && 
            password === this.ADMIN_CREDENTIALS.password) {
          this.isAdminLoggedIn.next(true);
          sessionStorage.setItem('adminAuth', 'true');
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  }

  logout(): void {
    this.isAdminLoggedIn.next(false);
    sessionStorage.removeItem('adminAuth');
  }

  isLoggedIn(): boolean {
    return this.isAdminLoggedIn.value;
  }

  getAdminCredentials(): AdminCredentials {
    return { ...this.ADMIN_CREDENTIALS };
  }
}

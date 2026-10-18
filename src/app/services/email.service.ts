import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly API_URL = 'http://localhost:3000/api/email'; // Backend API endpoint

  constructor(private http: HttpClient) {}

  sendWelcomeEmail(email: string, name: string): Observable<any> {
    const emailData = {
      to: email,
      subject: 'Welcome to TutorConnect Pro!',
      template: 'welcome',
      data: {
        name: name,
        email: email,
        loginUrl: 'http://localhost:4200/login'
      }
    };
    
    return this.http.post(`${this.API_URL}/send`, emailData);
  }

  sendLoginNotification(email: string, name: string, loginTime: Date): Observable<any> {
    const emailData = {
      to: email,
      subject: 'Login Notification - TutorConnect Pro',
      template: 'login-notification',
      data: {
        name: name,
        email: email,
        loginTime: loginTime.toLocaleString(),
        loginUrl: 'http://localhost:4200/login'
      }
    };
    
    return this.http.post(`${this.API_URL}/send`, emailData);
  }
}

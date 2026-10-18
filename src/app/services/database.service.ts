import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly API_URL = 'http://localhost:3000/api/users'; // Backend API endpoint

  constructor(private http: HttpClient) {}

  // Save user to database
  saveUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.API_URL}`, user);
  }

  // Get user by email
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/email/${email}`);
  }

  // Update user
  updateUser(email: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/email/${email}`, userData);
  }

  // Log user activity
  logUserActivity(email: string, activity: string, metadata?: any): Observable<any> {
    const logData = {
      email,
      activity,
      timestamp: new Date(),
      metadata
    };
    
    return this.http.post(`${this.API_URL}/activity`, logData);
  }
}

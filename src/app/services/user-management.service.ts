import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, Firestore, Timestamp, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  profile?: {
    bio?: string;
    specialties?: string[];
    experience?: string;
    education?: string;
    hourlyRate?: number;
    rating?: number;
    skills?: string[];
    totalStudents?: number;
    totalSessions?: number;
    availability?: string[];
    languages?: string[];
    certifications?: string[];
  };
  permissions?: {
    canManageStudents: boolean;
    canManageTutors: boolean;
    canViewAnalytics: boolean;
    canManageSystem: boolean;
  };
}

export interface StudentGrade {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  grade: number;
  maxGrade: number;
  assignment: string;
  feedback: string;
  gradedAt: Timestamp;
  semester: string;
  year: number;
}

export interface UserAction {
  id: string;
  userId: string;
  action: 'suspend' | 'activate' | 'delete' | 'promote' | 'demote';
  reason: string;
  performedBy: string;
  performedAt: Timestamp;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly USERS_COLLECTION = 'users';
  private readonly GRADES_COLLECTION = 'grades';
  private readonly ACTIONS_COLLECTION = 'userActions';

  constructor(private firestore: Firestore) {}

  // User Management Methods
  async createUser(userData: Omit<UserAccount, 'id' | 'createdAt'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.USERS_COLLECTION));
    const user: UserAccount = {
      ...userData,
      id: docRef.id,
      createdAt: Timestamp.now(),
      permissions: this.getDefaultPermissions(userData.role)
    };
    
    await setDoc(docRef, user);
    return docRef.id;
  }

  getAllUsers(): Observable<UserAccount[]> {
    const q = query(
      collection(this.firestore, this.USERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserAccount))
      ),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getUsersByRole(role: 'student' | 'tutor' | 'admin'): Observable<UserAccount[]> {
    const q = query(
      collection(this.firestore, this.USERS_COLLECTION),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as UserAccount))
      ),
      catchError(error => {
        console.error(`Error fetching ${role}s:`, error);
        return of([]);
      })
    );
  }

  async updateUser(userId: string, userData: Partial<UserAccount>): Promise<void> {
    const docRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(docRef, userData);
  }

  async suspendUser(userId: string, reason: string, performedBy: string): Promise<void> {
    const docRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(docRef, { status: 'suspended' });
    
    // Log the action
    await this.logUserAction({
      userId,
      action: 'suspend',
      reason,
      performedBy,
      details: { previousStatus: 'active' }
    });
  }

  async activateUser(userId: string, reason: string, performedBy: string): Promise<void> {
    const docRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(docRef, { status: 'active' });
    
    // Log the action
    await this.logUserAction({
      userId,
      action: 'activate',
      reason,
      performedBy,
      details: { previousStatus: 'suspended' }
    });
  }

  async deleteUser(userId: string, reason: string, performedBy: string): Promise<void> {
    const docRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await deleteDoc(docRef);
    
    // Log the action
    await this.logUserAction({
      userId,
      action: 'delete',
      reason,
      performedBy
    });
  }

  async changeUserRole(userId: string, newRole: 'student' | 'tutor' | 'admin', reason: string, performedBy: string): Promise<void> {
    const docRef = doc(this.firestore, this.USERS_COLLECTION, userId);
    await updateDoc(docRef, { 
      role: newRole,
      permissions: this.getDefaultPermissions(newRole)
    });
    
    // Log the action
    await this.logUserAction({
      userId,
      action: newRole === 'admin' ? 'promote' : 'demote',
      reason,
      performedBy,
      details: { newRole }
    });
  }

  // Student Grading Methods
  async addGrade(gradeData: Omit<StudentGrade, 'id' | 'gradedAt'>): Promise<string> {
    const docRef = doc(collection(this.firestore, this.GRADES_COLLECTION));
    const grade: StudentGrade = {
      ...gradeData,
      id: docRef.id,
      gradedAt: Timestamp.now()
    };
    
    await setDoc(docRef, grade);
    return docRef.id;
  }

  getStudentGrades(studentId: string): Observable<StudentGrade[]> {
    const q = query(
      collection(this.firestore, this.GRADES_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('gradedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StudentGrade))
      ),
      catchError(error => {
        console.error('Error fetching student grades:', error);
        return of([]);
      })
    );
  }

  getTutorGrades(tutorId: string): Observable<StudentGrade[]> {
    const q = query(
      collection(this.firestore, this.GRADES_COLLECTION),
      where('tutorId', '==', tutorId),
      orderBy('gradedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StudentGrade))
      ),
      catchError(error => {
        console.error('Error fetching tutor grades:', error);
        return of([]);
      })
    );
  }

  async updateGrade(gradeId: string, gradeData: Partial<StudentGrade>): Promise<void> {
    const docRef = doc(this.firestore, this.GRADES_COLLECTION, gradeId);
    await updateDoc(docRef, gradeData);
  }

  async deleteGrade(gradeId: string): Promise<void> {
    const docRef = doc(this.firestore, this.GRADES_COLLECTION, gradeId);
    await deleteDoc(docRef);
  }

  // User Actions Logging
  private async logUserAction(actionData: Omit<UserAction, 'id' | 'performedAt'>): Promise<void> {
    const docRef = doc(collection(this.firestore, this.ACTIONS_COLLECTION));
    const action: UserAction = {
      ...actionData,
      id: docRef.id,
      performedAt: Timestamp.now()
    };
    
    await setDoc(docRef, action);
  }

  getUserActions(userId: string): Observable<UserAction[]> {
    const q = query(
      collection(this.firestore, this.ACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('performedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
        } as UserAction))
      ),
      catchError(error => {
        console.error('Error fetching user actions:', error);
        return of([]);
      })
    );
  }

  // Course Management
  async createCourse(courseData: any): Promise<any> {
    try {
      const courseRef = await addDoc(collection(this.firestore, 'courses'), {
        ...courseData,
        createdAt: serverTimestamp()
      });
      
      return {
        id: courseRef.id,
        ...courseData
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getTutorCourses(tutorId: string): Promise<any[]> {
    try {
      const coursesQuery = query(
        collection(this.firestore, 'courses'),
        where('tutorId', '==', tutorId),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(coursesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tutor courses:', error);
      throw error;
    }
  }

  async getStudentEnrolledCourses(studentId: string): Promise<any[]> {
    try {
      const enrollmentsQuery = query(
        collection(this.firestore, 'enrollments'),
        where('studentId', '==', studentId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(enrollmentsQuery);
      const enrollments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        courseId: doc.data()['courseId'],
        studentId: doc.data()['studentId'],
        tutorId: doc.data()['tutorId'],
        progress: doc.data()['progress'],
        lastAccessedAt: doc.data()['lastAccessedAt'],
        enrolledAt: doc.data()['enrolledAt'],
        status: doc.data()['status'],
        paymentId: doc.data()['paymentId']
      }));

      // Get course details for each enrollment
      const courses = [];
      for (const enrollment of enrollments) {
        const courseDoc = await getDoc(doc(this.firestore, 'courses', enrollment.courseId));
        if (courseDoc.exists()) {
          courses.push({
            id: courseDoc.id,
            ...courseDoc.data(),
            enrollmentId: enrollment.id,
            progress: enrollment.progress
          });
        }
      }

      return courses;
    } catch (error) {
      console.error('Error getting student enrolled courses:', error);
      throw error;
    }
  }

  async getTutorStudents(tutorId: string): Promise<any[]> {
    try {
      const enrollmentsQuery = query(
        collection(this.firestore, 'enrollments'),
        where('tutorId', '==', tutorId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(enrollmentsQuery);
      const enrollments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        courseId: doc.data()['courseId'],
        studentId: doc.data()['studentId'],
        tutorId: doc.data()['tutorId'],
        progress: doc.data()['progress'],
        lastAccessedAt: doc.data()['lastAccessedAt'],
        enrolledAt: doc.data()['enrolledAt'],
        status: doc.data()['status'],
        paymentId: doc.data()['paymentId']
      }));

      // Get unique student details
      const studentMap = new Map();
      for (const enrollment of enrollments) {
        if (!studentMap.has(enrollment.studentId)) {
          const userDoc = await getDoc(doc(this.firestore, 'users', enrollment.studentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            studentMap.set(enrollment.studentId, {
              id: enrollment.studentId,
              name: userData['name'],
              email: userData['email'],
              enrolledCourses: [],
              progress: enrollment.progress,
              lastActive: enrollment.lastAccessedAt || enrollment.enrolledAt,
              paymentStatus: 'paid'
            });
          }
        }
        
        // Add course to student's enrolled courses
        const student = studentMap.get(enrollment.studentId);
        if (student) {
          const courseDoc = await getDoc(doc(this.firestore, 'courses', enrollment.courseId));
          if (courseDoc.exists()) {
            student.enrolledCourses.push(courseDoc.data()['title']);
          }
        }
      }

      return Array.from(studentMap.values());
    } catch (error) {
      console.error('Error getting tutor students:', error);
      throw error;
    }
  }

  async updateTutorProfile(tutorId: string, profileData: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', tutorId);
      await updateDoc(userRef, {
        'profile': profileData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating tutor profile:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  getUserStats(): Observable<{
    total: number;
    students: number;
    tutors: number;
    admins: number;
    active: number;
    suspended: number;
    pending: number;
  }> {
    return this.getAllUsers().pipe(
      map(users => {
        const stats = {
          total: users.length,
          students: users.filter(u => u.role === 'student').length,
          tutors: users.filter(u => u.role === 'tutor').length,
          admins: users.filter(u => u.role === 'admin').length,
          active: users.filter(u => u.status === 'active').length,
          suspended: users.filter(u => u.status === 'suspended').length,
          pending: users.filter(u => u.status === 'pending').length
        };
        return stats;
      })
    );
  }

  getGradeStats(): Observable<{
    totalGrades: number;
    averageGrade: number;
    gradesBySubject: { [subject: string]: number };
    recentGrades: StudentGrade[];
  }> {
    return from(getDocs(collection(this.firestore, this.GRADES_COLLECTION))).pipe(
      map(snapshot => {
        const grades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StudentGrade));

        const gradesBySubject: { [subject: string]: number } = {};
        let totalGrade = 0;
        let gradeCount = 0;

        grades.forEach(grade => {
          if (!gradesBySubject[grade.subject]) {
            gradesBySubject[grade.subject] = 0;
          }
          gradesBySubject[grade.subject]++;
          
          totalGrade += (grade.grade / grade.maxGrade) * 100;
          gradeCount++;
        });

        return {
          totalGrades: grades.length,
          averageGrade: gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0,
          gradesBySubject,
          recentGrades: grades.slice(0, 10)
        };
      }),
      catchError(error => {
        console.error('Error fetching grade stats:', error);
        return of({
          totalGrades: 0,
          averageGrade: 0,
          gradesBySubject: {},
          recentGrades: []
        });
      })
    );
  }

  // Helper Methods
  private getDefaultPermissions(role: 'student' | 'tutor' | 'admin') {
    switch (role) {
      case 'admin':
        return {
          canManageStudents: true,
          canManageTutors: true,
          canViewAnalytics: true,
          canManageSystem: true
        };
      case 'tutor':
        return {
          canManageStudents: true,
          canManageTutors: false,
          canViewAnalytics: true,
          canManageSystem: false
        };
      case 'student':
        return {
          canManageStudents: false,
          canManageTutors: false,
          canViewAnalytics: false,
          canManageSystem: false
        };
      default:
        return {
          canManageStudents: false,
          canManageTutors: false,
          canViewAnalytics: false,
          canManageSystem: false
        };
    }
  }
}

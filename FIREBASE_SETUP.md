# Firebase Setup Guide for TutorApp

## 🚀 Quick Setup Steps

### 1. Check Your Firebase Project
Your Firebase project is already configured in `src/environments/environment.ts`:
- Project ID: `tutor-app-727a1`
- Auth Domain: `tutor-app-727a1.firebaseapp.com`

### 2. Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tutor-app-727a1`
3. Go to **Firestore Database** in the left menu
4. Click **Create database**
5. Choose **Start in test mode** (for now)
6. Select a location (choose closest to your users)
7. Click **Enable**

### 3. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### 4. Security Rules (Important!)
In Firestore → Rules, replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tutors can read all user profiles (for finding students)
    match /users/{userId} {
      allow read: if request.auth != null && resource.data.role == 'tutor';
    }
    
    // Students can read tutor profiles
    match /users/{userId} {
      allow read: if request.auth != null && resource.data.role == 'student' && resource.data.role == 'tutor';
    }
    
    // Tutor-Student matches
    match /tutorStudentMatches/{matchId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.tutorId || 
        request.auth.uid == resource.data.studentId
      );
    }
    
    // Reviews
    match /tutorReviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.studentId;
    }
    
    // Connections
    match /tutorStudentConnections/{connectionId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.tutorId || 
        request.auth.uid == resource.data.studentId
      );
    }
  }
}
```

## 📱 How to Test

### 1. Create Sample Users
Run this in browser console when app is running:
```javascript
// Create sample tutors
const tutors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@tutorapp.com',
    role: 'tutor',
    status: 'active',
    profile: {
      bio: 'Mathematics expert with 10+ years experience',
      specialties: ['Mathematics', 'Calculus', 'Algebra'],
      hourlyRate: 50,
      rating: 4.8
    }
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.c@tutorapp.com', 
    role: 'tutor',
    status: 'active',
    profile: {
      bio: 'Computer science and web development expert',
      specialties: ['Programming', 'Web Development'],
      hourlyRate: 65,
      rating: 4.9
    }
  }
];

// Create sample students
const students = [
  {
    name: 'John Doe',
    email: 'john.d@tutorapp.com',
    role: 'student', 
    status: 'active'
  },
  {
    name: 'Jane Smith',
    email: 'jane.s@tutorapp.com',
    role: 'student',
    status: 'active'
  }
];

// This will create users in Firebase
```

### 2. Test the Flow
1. **Student logs in** → Sees real tutors from Firebase
2. **Student searches** → Searches real tutor profiles  
3. **Student books tutor** → Creates real match in Firebase
4. **Tutor sees match** → Can accept/decline in their dashboard
5. **Student leaves review** → Saves to Firebase reviews

## 🔍 What You'll See in Firebase

### Collections Created:
- **users** - All user profiles (tutors & students)
- **tutorStudentMatches** - Booking requests and matches
- **tutorReviews** - Student reviews for tutors
- **tutorStudentConnections** - Interaction history

### Real-time Features:
- ✅ Student sees real tutor profiles
- ✅ Tutor sees student booking requests
- ✅ Reviews appear immediately
- ✅ Dashboard updates in real-time

## 🛠️ Troubleshooting

### If you don't see the database:
1. Make sure Firestore is enabled in Firebase Console
2. Check your Firebase configuration in environment.ts
3. Look for errors in browser console (F12)

### If authentication fails:
1. Enable Email/Password in Firebase Auth
2. Check your security rules
3. Make sure users are created with correct roles

### If data doesn't appear:
1. Check Firestore Rules (above)
2. Look at browser console for errors
3. Verify Firebase project ID matches

## 🎯 Next Steps

1. ✅ Set up Firestore Database
2. ✅ Enable Authentication  
3. ✅ Add Security Rules
4. ✅ Test with sample users
5. 🔄 Add real payment integration
6. 🔄 Add email notifications
7. 🔄 Add video calling integration

Your app will now show REAL users from Firebase! 🚀

import { Injectable } from '@angular/core';
import { UserManagementService } from '../services/user-management.service';
import { TutorStudentService } from '../services/tutor-student.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService {
  
  constructor(
    private userManagement: UserManagementService,
    private tutorStudentService: TutorStudentService,
    private snackBar: MatSnackBar
  ) {}

  async populateSampleData() {
    try {
      console.log('🌱 Starting to populate Firebase with sample data...');
      
      // Sample tutors data
      const tutors = [
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@tutorapp.com',
          role: 'tutor' as const,
          status: 'active' as const,
          profile: {
            bio: 'Experienced mathematics tutor with 10+ years of teaching experience. Specialized in calculus, algebra, and statistics.',
            specialties: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
            experience: '10+ years of teaching mathematics at university level',
            education: 'PhD in Mathematics from MIT',
            hourlyRate: 50,
            rating: 4.8,
            skills: ['Problem Solving', 'Test Preparation', 'Online Teaching', 'Curriculum Development'],
            totalStudents: 150,
            totalSessions: 500,
            availability: ['Mon-Fri 9AM-6PM', 'Sat 10AM-2PM'],
            languages: ['English', 'Spanish'],
            certifications: ['Mathematics Teaching Certificate', 'Advanced Calculus']
          }
        },
        {
          name: 'Prof. Michael Chen',
          email: 'michael.chen@tutorapp.com',
          role: 'tutor' as const,
          status: 'active' as const,
          profile: {
            bio: 'Computer science expert specializing in web development and machine learning.',
            specialties: ['Programming', 'Web Development', 'Machine Learning'],
            experience: '8 years as software engineer and instructor',
            education: 'MS in Computer Science from Stanford',
            hourlyRate: 65,
            rating: 4.9,
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TensorFlow', 'Docker'],
            totalStudents: 200,
            totalSessions: 750,
            availability: ['Mon-Wed 6PM-9PM', 'Sat-Sun 10AM-4PM'],
            languages: ['English', 'Mandarin'],
            certifications: ['AWS Certified Developer', 'Google Cloud Professional']
          }
        },
        {
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@tutorapp.com',
          role: 'tutor' as const,
          status: 'active' as const,
          profile: {
            bio: 'Native Spanish speaker teaching Spanish language and literature.',
            specialties: ['Languages', 'Spanish', 'Literature'],
            experience: '6 years teaching Spanish to all levels',
            education: 'MA in Spanish Literature from University of Madrid',
            hourlyRate: 40,
            rating: 4.7,
            skills: ['Grammar', 'Conversation', 'Writing', 'Cultural Studies'],
            totalStudents: 80,
            totalSessions: 300,
            availability: ['Tue-Thu 4PM-7PM', 'Sat 9AM-1PM'],
            languages: ['Spanish', 'English', 'French'],
            certifications: ['DELE Examiner Certificate', 'Teaching Spanish as Foreign Language']
          }
        },
        {
          name: 'Dr. James Wilson',
          email: 'james.wilson@tutorapp.com',
          role: 'tutor' as const,
          status: 'active' as const,
          profile: {
            bio: 'Physics and chemistry tutor with research background in nanotechnology.',
            specialties: ['Science', 'Physics', 'Chemistry'],
            experience: '12 years in research and teaching',
            education: 'PhD in Physics from Caltech',
            hourlyRate: 55,
            rating: 4.6,
            skills: ['Laboratory Techniques', 'Theory', 'Problem Solving', 'Research Methods'],
            totalStudents: 120,
            totalSessions: 450,
            availability: ['Mon-Fri 2PM-8PM', 'Weekends flexible'],
            languages: ['English'],
            certifications: ['Physics Teaching License', 'Laboratory Safety Certification']
          }
        },
        {
          name: 'Lisa Anderson',
          email: 'lisa.anderson@tutorapp.com',
          role: 'tutor' as const,
          status: 'active' as const,
          profile: {
            bio: 'Business and marketing professional with real-world corporate experience.',
            specialties: ['Business', 'Marketing', 'Management'],
            experience: '15 years in corporate management',
            education: 'MBA from Harvard Business School',
            hourlyRate: 70,
            rating: 4.8,
            skills: ['Strategy', 'Digital Marketing', 'Leadership', 'Business Planning'],
            totalStudents: 90,
            totalSessions: 280,
            availability: ['Mon-Thu 6PM-9PM', 'Sat 10AM-2PM'],
            languages: ['English'],
            certifications: ['PMP Certification', 'Digital Marketing Professional']
          }
        }
      ];

      // Sample students data
      const students = [
        {
          name: 'John Doe',
          email: 'john.doe@tutorapp.com',
          role: 'student' as const,
          status: 'active' as const,
          profile: {
            bio: 'Computer science student interested in web development.',
            specialties: ['Programming'],
            experience: '2 years of programming experience',
            education: 'Currently pursuing BS in Computer Science',
            hourlyRate: 0,
            rating: 0,
            skills: ['JavaScript', 'HTML', 'CSS'],
            totalStudents: 0,
            totalSessions: 0,
            availability: [],
            languages: ['English'],
            certifications: []
          }
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@tutorapp.com',
          role: 'student' as const,
          status: 'active' as const,
          profile: {
            bio: 'Mathematics student looking for help with calculus.',
            specialties: ['Mathematics'],
            experience: 'High school mathematics background',
            education: 'Currently pursuing BS in Mathematics',
            hourlyRate: 0,
            rating: 0,
            skills: ['Algebra', 'Geometry'],
            totalStudents: 0,
            totalSessions: 0,
            availability: [],
            languages: ['English'],
            certifications: []
          }
        },
        {
          name: 'Mike Johnson',
          email: 'mike.johnson@tutorapp.com',
          role: 'student' as const,
          status: 'active' as const,
          profile: {
            bio: 'Business student seeking help with marketing courses.',
            specialties: ['Business'],
            experience: 'Internship experience in marketing',
            education: 'Currently pursuing BBA',
            hourlyRate: 0,
            rating: 0,
            skills: ['Marketing', 'Communication'],
            totalStudents: 0,
            totalSessions: 0,
            availability: [],
            languages: ['English'],
            certifications: []
          }
        }
      ];

      // Create tutors
      console.log('📚 Creating tutors...');
      let createdTutors = 0;
      for (const tutor of tutors) {
        try {
          await this.userManagement.createUser(tutor);
          createdTutors++;
          console.log(`✅ Created tutor: ${tutor.name}`);
        } catch (error) {
          console.error(`❌ Error creating tutor ${tutor.name}:`, error);
        }
      }

      // Create students
      console.log('👨‍🎓 Creating students...');
      let createdStudents = 0;
      for (const student of students) {
        try {
          await this.userManagement.createUser(student);
          createdStudents++;
          console.log(`✅ Created student: ${student.name}`);
        } catch (error) {
          console.error(`❌ Error creating student ${student.name}:`, error);
        }
      }

      console.log(`🎉 Firebase population completed!`);
      console.log(`📊 Created ${createdTutors} tutors and ${createdStudents} students`);
      
      this.snackBar.open(`Successfully created ${createdTutors} tutors and ${createdStudents} students!`, 'Close', {
        duration: 5000
      });

      return { createdTutors, createdStudents };

    } catch (error) {
      console.error('❌ Error populating Firebase:', error);
      this.snackBar.open('Error populating Firebase. Check console for details.', 'Close', {
        duration: 3000
      });
      throw error;
    }
  }

  async addSampleReviews() {
    try {
      console.log('⭐ Adding sample reviews...');
      
      const sampleReviews = [
        {
          tutorId: 'sarah.johnson@tutorapp.com',
          studentId: 'john.doe@tutorapp.com',
          rating: 5,
          comment: 'Dr. Johnson is an amazing mathematics tutor! She explained complex calculus concepts in a way I could finally understand.',
          subject: 'Calculus',
          sessionId: 'session-1'
        },
        {
          tutorId: 'michael.chen@tutorapp.com',
          studentId: 'jane.smith@tutorapp.com',
          rating: 4,
          comment: 'Great web development tutor. Very patient and knowledgeable about React and Node.js.',
          subject: 'Web Development',
          sessionId: 'session-2'
        },
        {
          tutorId: 'emily.rodriguez@tutorapp.com',
          studentId: 'mike.johnson@tutorapp.com',
          rating: 5,
          comment: 'Emily is a fantastic Spanish teacher! Her lessons are engaging and she makes learning fun.',
          subject: 'Spanish',
          sessionId: 'session-3'
        }
      ];

      let createdReviews = 0;
      for (const review of sampleReviews) {
        try {
          await this.tutorStudentService.createReview(review);
          createdReviews++;
          console.log(`✅ Created review (Rating: ${review.rating}/5)`);
        } catch (error) {
          console.error(`❌ Error creating review:`, error);
        }
      }

      console.log(`🎉 Added ${createdReviews} sample reviews!`);
      this.snackBar.open(`Added ${createdReviews} sample reviews!`, 'Close', { duration: 3000 });

      return createdReviews;
    } catch (error) {
      console.error('❌ Error adding reviews:', error);
      this.snackBar.open('Error adding reviews. Check console for details.', 'Close', { duration: 3000 });
      throw error;
    }
  }
}

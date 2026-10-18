import { UserManagementService } from '../services/user-management.service';

export class FirebaseSeeder {
  constructor(private userManagement: UserManagementService) {}

  async seedSampleTutors() {
    const sampleTutors = [
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

    console.log('🌱 Starting to seed sample tutors...');
    
    for (const tutor of sampleTutors) {
      try {
        const tutorId = await this.userManagement.createUser(tutor);
        console.log(`✅ Created tutor: ${tutor.name} (ID: ${tutorId})`);
      } catch (error) {
        console.error(`❌ Error creating tutor ${tutor.name}:`, error);
      }
    }
    
    console.log('🎉 Seeding completed!');
  }

  async seedSampleStudents() {
    const sampleStudents = [
      {
        name: 'John Doe',
        email: 'john.doe@student.com',
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
        email: 'jane.smith@student.com',
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
      }
    ];

    console.log('🌱 Starting to seed sample students...');
    
    for (const student of sampleStudents) {
      try {
        const studentId = await this.userManagement.createUser(student);
        console.log(`✅ Created student: ${student.name} (ID: ${studentId})`);
      } catch (error) {
        console.error(`❌ Error creating student ${student.name}:`, error);
      }
    }
    
    console.log('🎉 Student seeding completed!');
  }
}

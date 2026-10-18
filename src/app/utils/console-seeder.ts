// CONSOLE SEEDER - Copy and paste this into your browser console when the app is running
// This is a pure JavaScript file - no TypeScript errors

// Type definitions for better TypeScript support
interface UserProfile {
  bio?: string;
  specialties?: readonly string[];
  experience?: string;
  education?: string;
  hourlyRate?: number;
  rating?: number;
  skills?: readonly string[];
  totalStudents?: number;
  totalSessions?: number;
  availability?: readonly string[];
  languages?: readonly string[];
  certifications?: readonly string[];
}

interface UserData {
  name: string;
  email: string;
  role: 'tutor' | 'student';
  status: 'active' | 'suspended' | 'pending';
  profile?: UserProfile;
}

interface FirestoreValue {
  stringValue?: string;
  integerValue?: number;
  arrayValue?: {
    values: FirestoreValue[];
  };
  mapValue?: {
    fields: Record<string, FirestoreValue>;
  };
  timestampValue?: string;
}

interface FirestoreDocument {
  fields: Record<string, FirestoreValue>;
}

console.log('🌱 Starting Firebase Data Seeding...');

// Sample data to populate Firebase
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
] as const;

const sampleStudents = [
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
] as const;

// Function to create users via Firebase REST API
async function createUserInFirebase(userData: Readonly<UserData>): Promise<string | null> {
  try {
    // Convert readonly data to mutable format
    const mutableUserData: UserData = {
      ...userData,
      profile: userData.profile ? {
        ...userData.profile,
        specialties: [...(userData.profile.specialties || [])],
        skills: [...(userData.profile.skills || [])],
        availability: [...(userData.profile.availability || [])],
        languages: [...(userData.profile.languages || [])],
        certifications: [...(userData.profile.certifications || [])]
      } : undefined
    };

    const response = await fetch('https://firestore.googleapis.com/v1/projects/tutor-app-727a1/databases/(default)/documents/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: mutableUserData.name },
          email: { stringValue: mutableUserData.email },
          role: { stringValue: mutableUserData.role },
          status: { stringValue: mutableUserData.status },
          createdAt: { timestampValue: new Date().toISOString() },
          profile: {
            mapValue: {
              fields: Object.entries(mutableUserData.profile || {}).reduce((acc: Record<string, FirestoreValue>, [key, value]) => {
                if (Array.isArray(value)) {
                  acc[key] = {
                    arrayValue: {
                      values: value.map(v => ({ stringValue: v }))
                    }
                  };
                } else if (typeof value === 'number') {
                  acc[key] = { integerValue: value };
                } else {
                  acc[key] = { stringValue: String(value) };
                }
                return acc;
              }, {})
            }
          }
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created ${mutableUserData.role}: ${mutableUserData.name} (ID: ${result.name.split('/').pop()})`);
      return result.name.split('/').pop();
    } else {
      console.error(`❌ Error creating ${mutableUserData.name}:`, await response.text());
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ${userData.name}:`, error);
    return null;
  }
}

// Function to seed all data
async function seedAllData() {
  console.log('🚀 Starting to seed tutors...');
  
  for (const tutor of sampleTutors) {
    await createUserInFirebase(tutor);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to avoid rate limiting
  }
  
  console.log('🚀 Starting to seed students...');
  
  for (const student of sampleStudents) {
    await createUserInFirebase(student);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to avoid rate limiting
  }
  
  console.log('🎉 Seeding completed! Check your Firebase Firestore to see the data.');
  console.log('🔄 Refresh your app to see the real tutors and students!');
}

// Auto-run the seeding
seedAllData();

console.log('📝 If you want to run this again, type: seedAllData()');

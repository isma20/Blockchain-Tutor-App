// POPULATE FIREBASE - Copy this entire script and paste into browser console (F12)
// Make sure you're on any page of your TutorApp when you run this

console.log('🚀 Starting Firebase Population Script...');

// Sample tutors data
const tutors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@tutorapp.com',
    role: 'tutor',
    status: 'active',
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
    role: 'tutor',
    status: 'active',
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
    role: 'tutor',
    status: 'active',
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
    role: 'tutor',
    status: 'active',
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
    role: 'tutor',
    status: 'active',
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
    role: 'student',
    status: 'active',
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
    role: 'student',
    status: 'active',
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
    role: 'student',
    status: 'active',
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

// Function to create user in Firebase
async function createUser(userData) {
  try {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/tutor-app-727a1/databases/(default)/documents/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: userData.name },
          email: { stringValue: userData.email },
          role: { stringValue: userData.role },
          status: { stringValue: userData.status },
          createdAt: { timestampValue: new Date().toISOString() },
          profile: {
            mapValue: {
              fields: Object.entries(userData.profile).reduce((acc, [key, value]) => {
                if (Array.isArray(value)) {
                  acc[key] = {
                    arrayValue: {
                      values: value.map(v => ({ stringValue: v }))
                    }
                  };
                } else if (typeof value === 'number') {
                  acc[key] = { integerValue: value };
                } else {
                  acc[key] = { stringValue: value };
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
      const userId = result.name.split('/').pop();
      console.log(`✅ Created ${userData.role}: ${userData.name} (ID: ${userId})`);
      return userId;
    } else {
      console.error(`❌ Error creating ${userData.name}:`, await response.text());
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating ${userData.name}:`, error);
    return null;
  }
}

// Main function to populate Firebase
async function populateFirebase() {
  console.log('🌱 Starting to populate Firebase with sample data...');
  
  // Create tutors
  console.log('📚 Creating tutors...');
  for (const tutor of tutors) {
    await createUser(tutor);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  // Create students
  console.log('👨‍🎓 Creating students...');
  for (const student of students) {
    await createUser(student);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  console.log('🎉 Firebase population completed!');
  console.log('📊 Check your Firebase Firestore to see the data.');
  console.log('🔄 Refresh your app to see the real tutors and students!');
}

// Auto-run the population
populateFirebase();

console.log('⏳ Script is running... Please wait for completion message.');

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserManagementService } from '../services/user-management.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    ReactiveFormsModule
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isScrolled = false;
  activeSection = '';
  private scrollSubscription: Subscription | undefined;

  // Enhanced How It Works with emojis
  howItWorksSteps = [
    {
      icon: 'person_add',
      title: '🚀 Sign Up & Get Verified',
      description: '📧 Create your account in seconds with email verification. Choose your role as Student or Tutor and complete your profile with learning preferences or teaching expertise.'
    },
    {
      icon: 'search',
      title: '🔍 Find Your Perfect Match',
      description: '🎯 Browse our extensive database of expert tutors. Filter by subject, rating, price, and availability. Use AI-powered recommendations to find your ideal learning partner.'
    },
    {
      icon: 'calendar_today',
      title: '📅 Book Your Session',
      description: '⏰ Schedule sessions at your convenience with our smart calendar system. Choose from flexible time slots, set reminders, and get instant confirmations.'
    },
    {
      icon: 'video_call',
      title: '🎥 Start Learning',
      description: '💻 Join HD video sessions with interactive whiteboards, screen sharing, and real-time collaboration. Access recorded lessons anytime for revision.'
    },
    {
      icon: 'workspace_premium',
      title: '🏆 Earn & Grow',
      description: '📈 Track your progress with detailed analytics. Receive blockchain-verified certificates. Tutors earn competitive rates while students achieve their learning goals.'
    }
  ];

  // Enhanced Features with emojis
  features = [
    {
      icon: 'video_call',
      title: '🎥 HD Video Sessions',
      description: '📹 Experience crystal-clear video calls with 1080p quality, real-time screen sharing, and collaborative whiteboards. Perfect for interactive learning!',
      tags: ['HD Video', 'Screen Share', 'Whiteboard', 'Recording']
    },
    {
      icon: 'cloud_download',
      title: '☁️ Cloud Recording Library',
      description: '💾 Never miss a lesson! All sessions are automatically recorded and stored in your personal cloud library. Download and revisit anytime.',
      tags: ['Cloud Storage', 'Unlimited Access', 'Download', 'Mobile Friendly']
    },
    {
      icon: 'trending_up',
      title: '📊 Smart Progress Analytics',
      description: '📈 Track your learning journey with detailed analytics, AI-powered insights, and personalized recommendations. Watch your skills grow!',
      tags: ['Analytics', 'AI Insights', 'Progress Reports', 'Goals']
    },
    {
      icon: 'chat',
      title: '💬 Instant Messaging',
      description: '🚀 Connect instantly with tutors and students. Share files, collaborate on documents, and get quick answers in real-time.',
      tags: ['Instant Chat', 'File Sharing', 'Group Study', 'Mobile App']
    },
    {
      icon: 'account_tree',
      title: '🔗 Blockchain Certificates',
      description: '🏅 Earn tamper-proof, blockchain-verified certificates that employers trust. Your achievements are permanently recorded and globally recognized.',
      tags: ['Blockchain', 'Verified', 'Secure', 'Shareable']
    },
    {
      icon: 'schedule',
      title: '⏰ Smart Scheduling',
      description: '📅 Book sessions 24/7 with our intelligent calendar system. Automatic timezone detection, reminders, and flexible rescheduling.',
      tags: ['Calendar', 'Reminders', 'Time Zones', 'Mobile Sync']
    },
    {
      icon: 'payments',
      title: '💳 Secure Payments',
      description: '🔒 Pay safely with encrypted transactions, escrow protection, and multiple payment options. Refund guarantee for unsatisfactory sessions.',
      tags: ['Secure', 'Escrow', 'Refund', 'Multi-Currency']
    },
    {
      icon: 'psychology',
      title: '🧠 AI-Powered Matching',
      description: '🎯 Our smart algorithm matches you with the perfect tutor based on learning style, goals, and personality. Better matches, better results!',
      tags: ['AI Matching', 'Personalized', 'Smart Learning', 'Success Rate']
    }
  ];

  // Enhanced Getting Started Guide with emojis
  instructions = [
    {
      title: '🎓 Getting Started as a Student',
      content: '🚀 Welcome to your learning journey! Follow these simple steps to start learning with expert tutors and achieve your goals.',
      steps: [
        '📝 Create your account with email verification (takes 30 seconds)',
        '👤 Complete your profile with learning preferences and goals',
        '🔍 Browse and filter tutors by subject, rating, and availability',
        '💳 Book your first session with secure payment options',
        '🎥 Join the HD video session and start learning!'
      ]
    },
    {
      title: '🍎 Becoming a Tutor',
      content: '🌟 Share your knowledge and earn money! Join our community of expert tutors and start teaching students worldwide.',
      steps: [
        '📋 Sign up as a tutor with professional details and expertise',
        '📜 Submit verification documents and credentials',
        '📅 Set your availability and competitive hourly rates',
        '🌟 Create your impressive tutor profile with specialties',
        '🎯 Start receiving student requests and begin teaching!'
      ]
    },
    {
      title: '📊 Using Your Dashboard',
      content: '💻 Navigate through your personalized command center to manage your entire learning experience efficiently.',
      steps: [
        '🏠 Access your personalized dashboard after login',
        '📅 View upcoming sessions and manage your calendar',
        '📈 Track progress and view earned certificates',
        '💳 Manage payment methods and transaction history',
        '📚 Access learning resources and study materials'
      ]
    },
    {
      title: '🔗 Blockchain Integration',
      content: '🛡️ Learn how our cutting-edge blockchain technology secures your certificates and payments like never before.',
      steps: [
        '🔐 Certificates are stored on blockchain for maximum security',
        '💰 Payments are processed through smart contracts',
        '✅ Verification of credentials is instant and tamper-proof',
        '🌐 Your data is encrypted and decentralized',
        '📄 Export certificates for external verification and sharing'
      ]
    },
    {
      title: '📱 Mobile App Usage',
      content: '📲 Learn on the go! Access all features from your mobile device and never miss a learning opportunity.',
      steps: [
        '⬇️ Download the TutorApp mobile app (iOS/Android)',
        '🔐 Login with your existing account credentials',
        '📱 Access all features: video, chat, scheduling',
        '🔔 Receive push notifications for sessions and messages',
        '📚 Download materials for offline learning'
      ]
    }
  ];

  // Enhanced Expert Tutors with emojis and bios (8 total)
  tutors = [
    {
      name: '👨‍🏫 Dr. Mansour Al-Monsour',
      specialty: '🤖 Computer Science & AI',
      rating: 4.9,
      reviews: 234,
      students: 567,
      sessions: 1890,
      tags: ['Machine Learning', 'Python', 'Data Science', 'Deep Learning', 'Neural Networks'],
      avatar: 'https://picsum.photos/seed/mansour/200/200',
      bio: '🎓 PhD in AI from MIT with 10+ years teaching experience. Published researcher in machine learning.'
    },
    {
      name: '👨‍🏫 Salman Khan',
      specialty: '📐 Mathematics & Education',
      rating: 5.0,
      reviews: 892,
      students: 2341,
      sessions: 5678,
      tags: ['Mathematics', 'Calculus', 'Algebra', 'Educational Technology', 'Statistics'],
      avatar: 'https://picsum.photos/seed/salmankhan/200/200',
      bio: '🏆 Award-winning educator and founder of Khan Academy. Passionate about making math accessible to everyone.'
    },
    {
      name: '👩‍🏫 Dr. Sarah Johnson',
      specialty: '⚛️ Physics & Engineering',
      rating: 4.8,
      reviews: 156,
      students: 423,
      sessions: 1456,
      tags: ['Quantum Physics', 'Engineering', 'Research Methods', 'Robotics'],
      avatar: 'https://picsum.photos/seed/sarah/200/200',
      bio: '🔬 Research scientist at NASA with expertise in quantum mechanics and engineering physics.'
    },
    {
      name: '👨‍🏫 Prof. Michael Chen',
      specialty: '💻 Web Development',
      rating: 4.9,
      reviews: 445,
      students: 892,
      sessions: 2341,
      tags: ['React', 'Node.js', 'TypeScript', 'Cloud Computing', 'DevOps'],
      avatar: 'https://picsum.photos/seed/michael/200/200',
      bio: '🚀 Full-stack developer and tech lead at Google. Specializes in modern web technologies.'
    },
    {
      name: '👩‍🏫 Emily Rodriguez',
      specialty: '🎨 Digital Marketing',
      rating: 4.7,
      reviews: 312,
      students: 567,
      sessions: 1234,
      tags: ['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'Branding'],
      avatar: 'https://picsum.photos/seed/emily/200/200',
      bio: '📱 Marketing expert with Fortune 500 experience. Helped 100+ businesses grow their online presence.'
    },
    {
      name: '👨‍🏫 David Kumar',
      specialty: '💰 Business & Finance',
      rating: 4.8,
      reviews: 278,
      students: 445,
      sessions: 1567,
      tags: ['Investment', 'Accounting', 'Business Strategy', 'Financial Analysis'],
      avatar: 'https://picsum.photos/seed/david/200/200',
      bio: '📊 MBA from Harvard with 15+ years in investment banking. Expert in financial modeling and business strategy.'
    },
    {
      name: '👩‍🏫 Dr. Lisa Wang',
      specialty: '🧬 Biology & Medicine',
      rating: 4.9,
      reviews: 189,
      students: 334,
      sessions: 1123,
      tags: ['Molecular Biology', 'Genetics', 'Medical Science', 'Biochemistry', 'Research'],
      avatar: 'https://picsum.photos/seed/lisa/200/200',
      bio: '🔬 MD from Johns Hopkins with research experience at NIH. Specializes in medical education and clinical research.'
    },
    {
      name: '👨‍🏫 Carlos Rodriguez',
      specialty: '🎨 Creative Arts & Design',
      rating: 4.7,
      reviews: 267,
      students: 456,
      sessions: 987,
      tags: ['Graphic Design', 'UI/UX', 'Digital Art', 'Animation', 'Creative Writing'],
      avatar: 'https://picsum.photos/seed/carlos/200/200',
      bio: '🎨 Award-winning creative director with 12+ years in design industry. Taught at top art schools worldwide.'
    }
  ];

  // Enhanced Student Success Stories with achievements
  testimonials = [
    {
      name: '👨‍🎓 Alex Thompson',
      course: '📊 Advanced Mathematics',
      content: '🌟 TutorApp has been a game-changer for my studies! The blockchain-verified certificates add real value to my resume. I went from failing calculus to scoring A+ grades in just 3 months. The AI-powered tutor matching found me the perfect teacher who explained complex concepts in simple terms.',
      avatar: 'https://picsum.photos/seed/student1/100/100',
      achievement: '🏆 Math Competition Winner',
      improvement: '95% Grade Improvement'
    },
    {
      name: '👩‍🎓 Maria Garcia',
      course: '💻 Web Development',
      content: '🚀 The quality of tutors is exceptional! I learned more in 3 months than I did in a year of self-study. The interactive whiteboard and screen sharing made learning React so much easier. I landed my dream job as a frontend developer thanks to the skills I gained!',
      avatar: 'https://picsum.photos/seed/student2/100/100',
      achievement: '💼 Job Promotion',
      improvement: 'Built 5 Portfolio Projects'
    },
    {
      name: '👨‍🎓 James Wilson',
      course: '🤖 Data Science',
      content: '💡 The platform is user-friendly and the video quality is excellent. Worth every penny! My tutor helped me transition from marketing to data science. Now I\'m working on machine learning projects that I never thought possible. The progress tracking kept me motivated throughout!',
      avatar: 'https://picsum.photos/seed/student3/100/100',
      achievement: '🎯 Career Change Success',
      improvement: '3 Certifications Earned'
    },
    {
      name: '👩‍🎓 Priya Sharma',
      course: '🎨 Digital Marketing',
      content: '📈 As a small business owner, TutorApp helped me master digital marketing. My tutor was incredibly patient and knowledgeable. My online sales increased by 200% after implementing the strategies I learned. The flexible scheduling fit perfectly with my busy schedule!',
      avatar: 'https://picsum.photos/seed/student4/100/100',
      achievement: '📈 Business Growth',
      improvement: '200% Sales Increase'
    },
    {
      name: '👨‍🎓 Li Wei',
      course: '🗣️ English Language',
      content: '🌍 Coming from China, I struggled with English communication. My tutor was amazing! In just 6 months, I went from basic conversation to fluency. I recently got promoted at my multinational company thanks to my improved English skills. Thank you TutorApp!',
      avatar: 'https://picsum.photos/seed/student5/100/100',
      achievement: '📊 Career Advancement',
      improvement: 'Fluent in 6 Months'
    },
    {
      name: '👩‍🎓 Aisha Johnson',
      course: '🎹 Music Theory',
      content: '🎵 I always wanted to understand music theory but found it intimidating. My tutor made it fun and easy to understand! Now I\'m composing my own music and even teaching others. The blockchain certificate gave me credibility when I started offering music lessons.',
      avatar: 'https://picsum.photos/seed/student6/100/100',
      achievement: '🎼 Music Composer',
      improvement: 'Started Teaching Others'
    }
  ];

  // Enhanced Why TutorApp is Special
  specialFeatures = [
    {
      icon: 'verified_user',
      title: '🔗 Blockchain Credential Verification',
      description: '🛡️ All certificates and credentials are stored on blockchain, ensuring they are tamper-proof and instantly verifiable by employers worldwide.',
      highlight: '100% Secure & Immutable'
    },
    {
      icon: 'star',
      title: '⭐ Top-Quality Verified Tutors',
      description: '🏆 Every tutor is thoroughly vetted, background-checked, and continuously evaluated to maintain the highest teaching standards in the industry.',
      highlight: 'Expert Verified Tutors'
    },
    {
      icon: 'attach_money',
      title: '💰 Affordable & Flexible Pricing',
      description: '💳 Competitive rates starting at $15/hour with flexible payment options, financial aid, and escrow protection for peace of mind.',
      highlight: 'Starting at $15/hour'
    },
    {
      icon: 'security',
      title: '🔒 Bank-Level Security Platform',
      description: '🛡️ End-to-end encryption, secure payment processing, and GDPR-compliant data protection ensure your information is always safe and private.',
      highlight: 'Bank-Level Security'
    },
    {
      icon: 'devices',
      title: '📱 Cutting-Edge Interactive Tools',
      description: '🚀 Advanced whiteboard with AI assistance, real-time collaboration, recording capabilities, and AR/VR tools enhance your learning experience.',
      highlight: 'Next-Gen Technology'
    },
    {
      icon: 'support_agent',
      title: '🤝 24/7 Dedicated Support',
      description: '🌟 Round-the-clock customer support with live chat, video calls, and personalized assistance to help you succeed in your learning journey.',
      highlight: 'Always Here to Help'
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userManagement: UserManagementService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Initialize scroll effects
    this.initializeScrollEffects();
    
    // Setup intersection observer for animations
    this.setupIntersectionObserver();
    
    // Load real tutors from Firebase
    this.loadRealTutors();
    
    // DEBUG: Log data to console
    console.log('🚀 Landing component initialized!');
    console.log('📊 How It Works Steps:', this.howItWorksSteps);
    console.log('🎯 Features:', this.features);
    console.log('👨‍🏫 Tutors:', this.tutors);
    console.log('📚 Testimonials:', this.testimonials);
    console.log('✨ Special Features:', this.specialFeatures);
  }

  loadRealTutors() {
    try {
      console.log('🔍 Loading real tutors for landing page...');
      
      this.userManagement.getUsersByRole('tutor').subscribe({
        next: (firebaseTutors) => {
          console.log('📊 Raw tutors from Firebase:', firebaseTutors);
          
          if (firebaseTutors && firebaseTutors.length > 0) {
            // Transform Firebase data to landing page format
            this.tutors = firebaseTutors.map(user => ({
              name: `👨‍🏫 ${user.name}`,
              specialty: `📚 ${user.profile?.specialties?.join(' & ') || 'General Tutoring'}`,
              rating: user.profile?.rating || 4.5,
              reviews: Math.floor(Math.random() * 500) + 50,
              students: user.profile?.totalStudents || Math.floor(Math.random() * 300) + 100,
              sessions: user.profile?.totalSessions || Math.floor(Math.random() * 1000) + 200,
              tags: user.profile?.specialties || ['Teaching', 'Mentoring'],
              avatar: `https://picsum.photos/seed/${user.name.replace(/\s+/g, '')}/200/200`,
              bio: `🎓 ${user.profile?.bio || 'Experienced educator passionate about helping students succeed.'}`
            }));
            
            console.log('✅ Loaded real tutors from Firebase for landing page:', this.tutors);
            console.log(`🎯 Landing page now shows ${this.tutors.length} real tutors`);
          } else {
            console.log('ℹ️ No tutors found in Firebase, using mock data for landing page');
          }
        },
        error: (error) => {
          console.error('❌ Error loading tutors from Firebase for landing page:', error);
          console.log('ℹ️ Using mock tutor data as fallback for landing page');
        }
      });
    } catch (error) {
      console.error('❌ Error in loadRealTutors for landing page:', error);
    }
  }

  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private initializeScrollEffects() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
      this.updateActiveSection();
    });
  }

  private updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        this.activeSection = sectionId || '';
      }
    });
  }

  private setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
      observer.observe(element);
    });
  }

  // Navigation methods
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Contact form submission - WORKING FUNCTIONALITY
  onSubmitContact() {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      console.log('📧 Contact form submitted:', formData);
      
      // Show success message
      this.toastr.success('✅ Message sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form
      this.contactForm.reset();
      
      // In a real application, you would send this to your backend
      // Example: this.contactService.sendMessage(formData).subscribe(...)
    } else {
      // Show error for invalid form
      this.toastr.error('❌ Please fill in all required fields correctly.');
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(bodyParser.json({ limit: '50kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// In-memory database (for demo purposes)
const users = [];
const activities = [];

// Email configuration using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail
    pass: 'your-app-password'     // Replace with your Gmail app password
  }
});

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function sanitizeUser(user) {
  if (!user) return user;
  const {
    passwordHash,
    passwordSalt,
    verificationToken,
    verificationExpiresAt,
    ...safe
  } = user;
  return safe;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req?.auth?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}

// API Routes

// Register user + send verification email
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!['student', 'tutor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, passwordSalt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = {
      id: Date.now().toString(),
      createdAt: new Date(),
      email,
      name,
      role,
      verified: false,
      passwordSalt,
      passwordHash,
      verificationToken,
      verificationExpiresAt
    };

    users.push(user);

    const verifyUrl = `http://localhost:${PORT}/api/auth/verify?token=${verificationToken}`;

    const mailOptions = {
      from: 'your-email@gmail.com', // Replace with your Gmail
      to: email,
      subject: 'Verify your Tutor App account',
      html: `
        <h2>Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Thanks for creating your Tutor App account. Please verify your email to activate your account.</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
        <br>
        <p>Best regards,<br>Tutor App Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    res.status(201).json({ message: 'Registration successful. Please verify your email to login.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify email token and redirect user to login page
app.get('/api/auth/verify', (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('Missing token');
    }

    const user = users.find(u => u.verificationToken === token);
    if (!user) {
      return res.status(400).send('Invalid token');
    }

    if (!user.verificationExpiresAt || new Date(user.verificationExpiresAt) < new Date()) {
      return res.status(400).send('Token expired');
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationExpiresAt = null;

    return res.redirect('http://localhost:4200/login?verified=1');
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).send('Internal server error');
  }
});

// Login (blocked until verified)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const calculatedHash = hashPassword(password, user.passwordSalt);
    if (calculatedHash !== user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const token = signToken(user);

    activities.push({
      id: Date.now().toString(),
      email: user.email,
      activity: 'login',
      timestamp: new Date(),
      metadata: { role: user.role }
    });

    const mailOptions = {
      from: 'your-email@gmail.com', // Replace with your Gmail
      to: user.email,
      subject: 'Login Notification - Tutor App',
      html: `
        <h2>Login Notification</h2>
        <p>Hi ${user.name},</p>
        <p>We detected a login to your Tutor App account.</p>
        <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p>If this was you, no action is needed. If you didn't login, please reset your password.</p>
        <br>
        <p>Best regards,<br>Tutor App Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending login notification:', emailError);
    }

    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validate session / get current user
app.get('/api/auth/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.auth.sub);
  if (!user) {
    return res.status(401).json({ message: 'Invalid session' });
  }
  return res.json(sanitizeUser(user));
});

// Save user to database (admin only)
app.post('/api/users', authenticate, requireAdmin, (req, res) => {
  try {
    const user = req.body;
    const existingUser = users.find(u => u.email === user.email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    user.id = Date.now().toString();
    user.createdAt = new Date();
    users.push(user);
    
    console.log('User saved:', user);
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by email (self or admin)
app.get('/api/users/email/:email', authenticate, (req, res) => {
  try {
    const email = req.params.email;
    if (req.auth.role !== 'admin' && req.auth.email !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (self or admin)
app.put('/api/users/email/:email', authenticate, (req, res) => {
  try {
    const email = req.params.email;
    if (req.auth.role !== 'admin' && req.auth.email !== email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userData = req.body;
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    users[userIndex] = { ...users[userIndex], ...userData };
    console.log('User updated:', users[userIndex]);
    res.json(sanitizeUser(users[userIndex]));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Log user activity (auth required; email is derived from token)
app.post('/api/users/activity', authenticate, (req, res) => {
  try {
    const activity = {
      id: Date.now().toString(),
      email: req.auth.email,
      activity: req.body?.activity || 'unknown',
      timestamp: new Date(),
      metadata: req.body?.metadata
    };
    activities.push(activity);
    
    console.log('Activity logged:', activity);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug endpoints (admin only)
app.get('/api/users', authenticate, requireAdmin, (req, res) => {
  res.json(users.map(sanitizeUser));
});

app.get('/api/activities', authenticate, requireAdmin, (req, res) => {
  res.json(activities);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/register - Register user (student/tutor) + send verification email');
  console.log('  GET /api/auth/verify?token=... - Verify email and redirect to login');
  console.log('  POST /api/auth/login - Login (requires verified email)');
  console.log('  GET /api/auth/me - Get current user (requires Bearer token)');
  console.log('  POST /api/users/activity - Log activity (requires Bearer token)');
  console.log('  GET /api/users - List users (admin only, requires Bearer token)');
  console.log('  GET /api/activities - List activities (admin only, requires Bearer token)');
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic API routes to handle the most common requests from the frontend
app.get('/', (req, res) => {
  res.json({ message: 'Creditor Backend API is running!' });
});

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  // Mock login - in a real backend, this would validate credentials
  const { email, password } = req.body;

  if (email && password) {
    // Generate a mock JWT token
    const token = 'mock-jwt-token-for-testing';

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: 1,
        email: email,
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }
});

app.post('/api/auth/registerUser', (req, res) => {
  // Mock registration
  const { email, password, firstName, lastName } = req.body;

  if (email && password && firstName && lastName) {
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: 2,
        email: email,
        firstName: firstName,
        lastName: lastName,
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
});

// Course routes
app.get('/api/course/getAllCourses', (req, res) => {
  // Mock courses data
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming',
        thumbnail: 'https://via.placeholder.com/300x200',
        instructor: 'John Doe',
        enrolled: 150,
        rating: 4.5,
      },
      {
        id: 2,
        title: 'Advanced React',
        description: 'Master advanced React concepts and patterns',
        thumbnail: 'https://via.placeholder.com/300x200',
        instructor: 'Jane Smith',
        enrolled: 89,
        rating: 4.8,
      },
    ],
  });
});

app.post('/api/course/createCourse', (req, res) => {
  const { title, description, category, thumbnail } = req.body;

  if (title && description) {
    res.json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: Math.floor(Math.random() * 1000),
        title,
        description,
        category: category || 'General',
        thumbnail: thumbnail || 'https://via.placeholder.com/300x200',
        createdAt: new Date(),
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Title and description are required',
    });
  }
});

// User profile routes
app.get('/api/user/getUserProfile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      bio: 'This is a test user profile',
      profileImage: 'https://via.placeholder.com/150x150',
      role: 'student',
      createdAt: new Date(),
    },
  });
});

app.put('/api/user/updateUserProfile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { ...req.body },
  });
});

// Quiz routes
app.get('/api/quiz/get/:quizId', (req, res) => {
  const { quizId } = req.params;

  res.json({
    success: true,
    data: {
      id: quizId,
      title: 'Sample Quiz',
      description: 'This is a sample quiz for testing',
      questions: [
        {
          id: 1,
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 'Paris',
        },
        {
          id: 2,
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
        },
      ],
      timeLimit: 300, // 5 minutes
    },
  });
});

// Catch-all route for other API endpoints that might be called
app.all('/api/*', (req, res) => {
  console.log(`Unimplemented route: ${req.method} ${req.path}`);
  res.status(200).json({
    success: true,
    message: `Mock response for ${req.method} ${req.path}`,
    data: {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

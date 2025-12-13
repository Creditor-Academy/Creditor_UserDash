# 🎓 Creditor Academy LMS Platform

> A comprehensive Learning Management System with AI-powered course creation, interactive assessments, real-time collaboration, and modern educational tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)

---

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Application Flow](#-application-flow)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development Setup](#-development-setup)
- [Deployment](#-deployment)
- [Features](#-features)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Frontend)                       │
├─────────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + TailwindCSS + Shadcn/UI             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Pages      │  │  Components  │  │   Services    │           │
│  │   (126)      │  │   (415)      │  │    (61)       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Contexts   │  │    Hooks     │  │   Utils      │           │
│  │    (3)      │  │     (9)      │  │    (15)      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST + WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Express.js Server + Socket.IO + Middleware                         │
│  ├─ Authentication & Authorization                                  │
│  ├─ Rate Limiting & Security                                        │
│  ├─ Request Validation                                              │
│  └─ Error Handling                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│  Controllers (48) │ DAOs (38) │ Services │ Validators (13)         │
│  ├─ Course Management                                               │
│  ├─ User Management                                                  │
│  ├─ Assessment Engine                                                │
│  ├─ AI Services                                                     │
│  ├─ File Processing                                                 │
│  └─ Real-time Communication                                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma ORM) │ Redis Cache │ S3 Storage │ Cloudinary    │
│  ├─ User Data                                                       │
│  ├─ Course Content                                                  │
│  ├─ Assessments & Submissions                                       │
│  ├─ Media Files                                                     │
│  └─ Session & Cache                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────┤
│  AI Services │ Payment │ Email │ Storage │ CDN                      │
│  ├─ OpenAI / HuggingFace / Bytez.js                                 │
│  ├─ Stripe Payment Gateway                                          │
│  ├─ AWS S3 / Cloudinary                                             │
│  ├─ SendGrid / AWS SES                                              │
│  └─ Socket.IO Real-time                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Pages (126)     │  Components (415)   │  UI Components (53)  │
│  ├─ Dashboard    │  ├─ Courses (45)    │  ├─ Buttons          │
│  ├─ Courses      │  ├─ Lessons (19)    │  ├─ Forms            │
│  ├─ Lessons      │  ├─ Assessments      │  ├─ Modals           │
│  ├─ Quizzes      │  ├─ AI Tools        │  ├─ Tables          │
│  ├─ Groups       │  ├─ Chat/Messages   │  └─ Navigation       │
│  └─ Profile      │  └─ Admin Tools      │                      │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Services (61)  │  Contexts (3)       │  Hooks (9)            │
│  ├─ API Client  │  ├─ Auth Context    │  ├─ useAuth           │
│  ├─ Course      │  ├─ Credits Context │  ├─ useCourses        │
│  ├─ AI/Bytez    │  └─ User Context    │  ├─ useQuiz           │
│  ├─ Upload      │                     │  └─ useWebSocket      │
│  └─ Socket      │                     │                       │
├─────────────────────────────────────────────────────────────────┤
│                       STATE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│  React Context API │ React Query │ Local Storage │ Session      │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER (41 routes)                    │
├─────────────────────────────────────────────────────────────────┤
│  /api/auth │ /api/course │ /api/user │ /api/quiz │ ...         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER (9 middleware)               │
├─────────────────────────────────────────────────────────────────┤
│  Auth │ Validation │ Rate Limiting │ Upload │ Error Handling   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONTROLLERS LAYER (48 controllers)             │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic │ Request Processing │ Response Formatting     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DAO LAYER (38 DAOs)                          │
├─────────────────────────────────────────────────────────────────┤
│  Database Operations │ Prisma Queries │ Data Transformation     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + Prisma)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Application Flow

### User Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User   │────────▶│  Login   │────────▶│  Backend │────────▶│ Database │
│ Browser │         │   Page   │         │   Auth   │         │          │
└─────────┘         └──────────┘         └──────────┘         └──────────┘
     │                    │                     │                    │
     │                    │                     │                    │
     │                    ▼                     ▼                    │
     │              ┌──────────┐         ┌──────────┐              │
     │              │  JWT     │         │  Verify  │              │
     │              │  Token   │         │  User    │              │
     │              └──────────┘         └──────────┘              │
     │                    │                     │                    │
     │                    │                     │                    │
     └────────────────────┼─────────────────────┼────────────────────┘
                          │                     │
                          ▼                     ▼
                    ┌──────────┐         ┌──────────┐
                    │  Store   │         │  Return  │
                    │  Token   │         │  User    │
                    └──────────┘         └──────────┘
```

### Course Creation Flow

```
┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User   │───▶│  Create      │───▶│  AI          │───▶│  Backend     │
│         │    │  Course Page │    │  Generation  │    │  API         │
└─────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     │                 │                     │                  │
     │                 │                     │                  │
     │                 ▼                     ▼                  ▼
     │          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │          │  Manual      │    │  AI Service   │    │  Database   │
     │          │  Input       │    │  (OpenAI/     │    │  Save        │
     │          │              │    │   HuggingFace)│    │              │
     │          └──────────────┘    └──────────────┘    └──────────────┘
     │                 │                     │                  │
     │                 │                     │                  │
     └─────────────────┼─────────────────────┼──────────────────┘
                       │                     │
                       ▼                     ▼
                 ┌──────────────┐    ┌──────────────┐
                 │  Course      │    │  Lesson      │
                 │  Created     │    │  Builder     │
                 └──────────────┘    └──────────────┘
```

### Lesson Builder Flow

```
┌─────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User   │───▶│  Lesson      │───▶│  Add         │───▶│  Content     │
│         │    │  Builder     │    │  Blocks      │    │  Library     │
└─────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     │                 │                     │                  │
     │                 │                     │                  │
     │                 ▼                     ▼                  ▼
     │          ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │          │  Text/Image/ │    │  AI          │    │  Auto-save   │
     │          │  Video/etc   │    │  Generation  │    │  Backend     │
     │          │  Blocks      │    │  (Optional)  │    │              │
     │          └──────────────┘    └──────────────┘    └──────────────┘
     │                 │                     │                  │
     │                 │                     │                  │
     └─────────────────┼─────────────────────┼──────────────────┘
                       │                     │
                       ▼                     ▼
                 ┌──────────────┐    ┌──────────────┐
                 │  Preview     │    │  Save        │
                 │  Lesson       │    │  Changes     │
                 └──────────────┘    └──────────────┘
```

### Real-time Communication Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌─────────┐
│ Client  │────────▶│ Socket.IO │────────▶│ Backend  │────────▶│ Client  │
│    A    │         │  Client   │         │  Server  │         │    B    │
└─────────┘         └──────────┘         └──────────┘         └─────────┘
     │                    │                     │                    │
     │  emit('message')   │                     │                    │
     │───────────────────▶│                     │                    │
     │                    │  io.emit()          │                    │
     │                    │─────────────────────▶│                    │
     │                    │                     │  broadcast()        │
     │                    │                     │─────────────────────▶│
     │                    │                     │                    │
     │                    │                     │                    │
     └────────────────────┼─────────────────────┼────────────────────┘
                          │                     │
                          ▼                     ▼
                    ┌──────────┐         ┌──────────┐
                    │  Redis   │         │ Database │
                    │  Cache   │         │  Store   │
                    └──────────┘         └──────────┘
```

---

## 🚀 Technology Stack

### Frontend Stack

| Category             | Technology            | Version         |
| -------------------- | --------------------- | --------------- |
| **Framework**        | React                 | 18.3.1          |
| **Language**         | TypeScript            | 5.5.3           |
| **Build Tool**       | Vite                  | 5.4.1           |
| **Styling**          | TailwindCSS           | 3.4.17          |
| **UI Components**    | Shadcn/UI + Radix UI  | Latest          |
| **State Management** | React Context API     | -               |
| **Data Fetching**    | Axios                 | 1.11.0          |
| **Routing**          | React Router DOM      | 6.26.2          |
| **Forms**            | React Hook Form + Zod | 7.53.0 / 3.23.8 |
| **Real-time**        | Socket.IO Client      | 4.8.1           |
| **Rich Text Editor** | TipTap                | 3.1.0           |
| **Charts**           | Recharts              | 2.15.4          |
| **Animations**       | Framer Motion         | 12.23.12        |
| **Icons**            | Lucide React          | 0.540.0         |

### Backend Stack

| Category           | Technology                  | Version          |
| ------------------ | --------------------------- | ---------------- |
| **Runtime**        | Node.js                     | Latest LTS       |
| **Framework**      | Express.js                  | 4.21.2           |
| **Database**       | PostgreSQL                  | Latest           |
| **ORM**            | Prisma                      | 6.13.0           |
| **Real-time**      | Socket.IO                   | 4.8.1            |
| **Authentication** | JWT + Passport.js           | 9.0.2 / 0.7.0    |
| **File Upload**    | Multer + Express-fileupload | 1.4.5 / 1.5.1    |
| **Caching**        | Redis                       | 5.6.0            |
| **Validation**     | Joi                         | 17.13.3          |
| **Email**          | SendGrid / AWS SES          | 8.1.6            |
| **Payment**        | Stripe                      | 18.5.0           |
| **Storage**        | AWS S3 / Cloudinary         | 3.883.0 / 1.21.0 |

### AI & External Services

| Service              | Provider                                    | Purpose                    |
| -------------------- | ------------------------------------------- | -------------------------- |
| **Text Generation**  | OpenAI GPT-4o, HuggingFace                  | Course content, summaries  |
| **Image Generation** | HuggingFace Stable Diffusion, OpenAI DALL-E | Course thumbnails, visuals |
| **Storage**          | AWS S3, Cloudinary                          | Media files                |
| **Email**            | SendGrid, AWS SES                           | Notifications              |
| **Payment**          | Stripe                                      | Subscriptions              |

---

## 📁 Project Structure

```
JFKC/
├── 📁 Creditor_UserDash/              # Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/             # React Components (415 files)
│   │   │   ├── 📁 ui/                 # Base UI components (53)
│   │   │   ├── 📁 courses/            # Course components (45)
│   │   │   ├── 📁 dashboard/          # Dashboard widgets (21)
│   │   │   ├── 📁 group/              # Group/collaboration (9)
│   │   │   └── 📁 lessonbuilder/      # Lesson builder (19)
│   │   │
│   │   ├── 📁 pages/                  # Page Components (126 files)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── LessonBuilder.jsx
│   │   │   ├── QuizTakePage.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 services/               # API Services (61 files)
│   │   │   ├── apiClient.js           # HTTP client with interceptors
│   │   │   ├── courseService.js       # Course APIs
│   │   │   ├── aiCourseService.js     # AI course generation
│   │   │   ├── authService.js         # Authentication
│   │   │   ├── quizService.js         # Quiz management
│   │   │   ├── uploadService.js      # File uploads
│   │   │   └── ...
│   │   │
│   │   ├── 📁 contexts/                # React Contexts (3)
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CreditsContext.jsx
│   │   │   └── UserContext.jsx
│   │   │
│   │   ├── 📁 hooks/                   # Custom Hooks (9)
│   │   │   ├── useAuth.js
│   │   │   ├── useCourseManagement.js
│   │   │   └── ...
│   │   │
│   │   ├── 📁 lessonbuilder/           # Lesson Builder Module
│   │   │   ├── 📁 components/          # Block components
│   │   │   ├── 📁 hooks/               # Lesson builder hooks
│   │   │   ├── 📁 pages/               # Builder pages
│   │   │   ├── 📁 services/            # Builder services
│   │   │   └── 📁 utils/               # Builder utilities
│   │   │
│   │   ├── 📁 layouts/                 # Layout Components
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── GroupLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── 📁 config/                  # Configuration
│   │   │   └── apiConfig.js
│   │   │
│   │   ├── App.jsx                     # Main App Component
│   │   └── main.jsx                    # Entry Point
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
│
├── 📁 backend/                         # Backend Application
│   └── 📁 creditor_backend/
│       ├── 📁 src/
│       │   ├── 📁 routes/              # API Routes (41 files)
│       │   │   ├── 📁 auth/             # Authentication routes
│       │   │   ├── 📁 course/           # Course routes
│       │   │   ├── 📁 user/             # User routes
│       │   │   ├── 📁 quiz/             # Quiz routes
│       │   │   ├── 📁 lesson/           # Lesson routes
│       │   │   ├── 📁 ai/               # AI proxy routes
│       │   │   └── ...
│       │   │
│       │   ├── 📁 controllers/         # Controllers (48 files)
│       │   │   ├── 📁 auth/
│       │   │   ├── 📁 course/
│       │   │   ├── 📁 user/
│       │   │   └── ...
│       │   │
│       │   ├── 📁 dao/                  # Data Access Objects (38)
│       │   │   ├── courseDAO.js
│       │   │   ├── userDAO.js
│       │   │   └── ...
│       │   │
│       │   ├── 📁 middleware/          # Middleware (9)
│       │   │   ├── authMiddleware.js
│       │   │   ├── uploadMiddleware.js
│       │   │   └── ...
│       │   │
│       │   ├── 📁 services/             # Business Services
│       │   │   └── 📁 instructionalDesign/
│       │   │
│       │   ├── 📁 sockets/              # Socket.IO Handlers
│       │   │   ├── socket.js
│       │   │   ├── chat.js
│       │   │   └── privateChatSocket.js
│       │   │
│       │   ├── 📁 config/               # Configuration
│       │   │   ├── db.js
│       │   │   ├── prismaClient.js
│       │   │   ├── redis.js
│       │   │   └── ...
│       │   │
│       │   ├── 📁 cron/                 # Scheduled Jobs
│       │   │   ├── notificationCron.js
│       │   │   └── ...
│       │   │
│       │   └── index.js                 # Server Entry Point
│       │
│       ├── 📁 prisma/
│       │   ├── schema.prisma            # Database Schema
│       │   └── 📁 migrations/           # Database Migrations
│       │
│       └── package.json
│
└── README.md                           # This File
```

---

## 📡 API Documentation

### Base URL

```
Production: https://creditor-backend-ceds.onrender.com
Development: http://localhost:9000
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

### 🔐 Authentication APIs

#### Register User

```http
POST /api/auth/registerUser
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify OTP

```http
POST /api/auth/verifyOtp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Forgot Password

```http
POST /api/auth/forgotPassword
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /api/auth/resetPassword
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newPassword123"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

### 👤 User APIs

#### Get User Profile

```http
GET /api/user/getUserProfile
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /api/user/updateUserProfile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "User bio"
}
```

#### Update Profile Image

```http
PUT /api/user/updateProfileImage
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image-file>
```

#### Get My Courses

```http
GET /api/user/getMyCourses
Authorization: Bearer <token>
```

#### Get User Progress

```http
GET /api/user/getUserProgress
Authorization: Bearer <token>
```

---

### 📚 Course APIs

#### Get All Courses

```http
GET /api/course/getAllCourses
Authorization: Bearer <token>
```

#### Create Course

```http
POST /api/course/createCourse
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Course Title",
  "description": "Course Description",
  "category": "Technology",
  "thumbnail": "https://example.com/image.jpg"
}
```

#### Get Course by ID

```http
GET /api/course/:courseId
Authorization: Bearer <token>
```

#### Update Course

```http
PUT /api/course/editCourse/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

#### Delete Course

```http
DELETE /api/course/:courseId/delete
Authorization: Bearer <token>
```

#### Enroll in Course

```http
POST /api/course/:courseId/enroll
Authorization: Bearer <token>
```

---

### 📖 Lesson APIs

#### Get Lesson Content

```http
GET /api/lessoncontent/get/:lessonId
Authorization: Bearer <token>
```

#### Create/Update Lesson Content

```http
PUT /api/lessoncontent/update/:lessonId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": [...blocks],
  "title": "Lesson Title"
}
```

#### Get Lesson Resources

```http
GET /api/resource/get/:lessonId
Authorization: Bearer <token>
```

#### Upload Lesson Resource

```http
POST /api/resource/upload-resource
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <resource-file>
lessonId: <lesson-id>
```

---

### 📝 Module APIs

#### Get Course Modules

```http
GET /api/course/:courseId/modules
Authorization: Bearer <token>
```

#### Create Module

```http
POST /api/course/:courseId/modules
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Module Title",
  "description": "Module Description",
  "order": 1
}
```

#### Update Module

```http
PUT /api/modules/:moduleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Unlock Module

```http
POST /api/modules/:moduleId/unlock
Authorization: Bearer <token>
```

---

### ✅ Quiz APIs

#### Get Quiz

```http
GET /api/quiz/get/:quizId
Authorization: Bearer <token>
```

#### Create Quiz

```http
POST /api/quiz/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Quiz Title",
  "questions": [...],
  "moduleId": "module-id"
}
```

#### Submit Quiz

```http
POST /api/quiz/submit/:quizId
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": {
    "questionId": "answerId"
  }
}
```

#### Get Quiz Results

```http
GET /api/quiz/results/:quizId
Authorization: Bearer <token>
```

---

### 📄 Assignment APIs

#### Get Assignment

```http
GET /api/course/:courseId/modules/:moduleId/assessment/assignment/:assignmentId
Authorization: Bearer <token>
```

#### Create Assignment

```http
POST /api/course/:courseId/modules/:moduleId/assessment/assignment
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Assignment Title",
  "description": "Assignment Description",
  "dueDate": "2024-12-31"
}
```

#### Submit Assignment

```http
POST /api/user/course/:courseId/modules/:moduleId/assessment/assignment/:assignmentId/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <submission-file>
```

#### Get Submissions

```http
GET /api/course/:courseId/modules/:moduleId/assessment/assignment/:assignmentId/submissions
Authorization: Bearer <token>
```

---

### 📝 Essay APIs

#### Get Essay

```http
GET /api/course/:courseId/modules/:moduleId/assessment/essay/:essayId
Authorization: Bearer <token>
```

#### Create Essay

```http
POST /api/course/:courseId/modules/:moduleId/assessment/essay
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Essay Title",
  "prompt": "Essay prompt",
  "wordLimit": 1000
}
```

#### Submit Essay

```http
POST /api/user/course/:courseId/modules/:moduleId/assessment/essay/:essayId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Essay content"
}
```

---

### 🤖 AI APIs

#### Generate Course Outline

```http
POST /api/ai-proxy/generate-course-outline
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Machine Learning",
  "duration": "8 weeks",
  "level": "intermediate"
}
```

#### Generate Comprehensive Course

```http
POST /api/ai-proxy/generate-comprehensive-course
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Machine Learning",
  "modules": 5,
  "lessonsPerModule": 4
}
```

#### Generate Text Content

```http
POST /api/ai-proxy/generate-text
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Explain machine learning",
  "model": "gpt-4o"
}
```

#### Generate Image

```http
POST /api/ai-proxy/generate-image
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "A futuristic classroom",
  "model": "dall-e-3"
}
```

#### Generate Structured Content

```http
POST /api/ai-proxy/generate-structured
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Create a lesson plan",
  "structure": "lesson_plan"
}
```

---

### 💬 Chat & Messaging APIs

#### Get Private Messages

```http
GET /api/private-messaging/conversations
Authorization: Bearer <token>
```

#### Send Private Message

```http
POST /api/private-messaging/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user-id",
  "message": "Hello!"
}
```

#### Get Group Messages

```http
GET /api/groups/:groupId/messages
Authorization: Bearer <token>
```

#### Send Group Message

```http
POST /api/groups/:groupId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Group message"
}
```

---

### 👥 Group APIs

#### Get All Groups

```http
GET /api/groups
Authorization: Bearer <token>
```

#### Create Group

```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Group Name",
  "description": "Group Description",
  "courseId": "course-id"
}
```

#### Join Group

```http
POST /api/groups/:groupId/join
Authorization: Bearer <token>
```

#### Leave Group

```http
POST /api/groups/:groupId/leave
Authorization: Bearer <token>
```

---

### 🔔 Notification APIs

#### Get Notifications

```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read

```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All as Read

```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

---

### 🎫 Support Ticket APIs

#### Create Ticket

```http
POST /api/support-tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Ticket Subject",
  "message": "Ticket message",
  "category": "technical"
}
```

#### Get My Tickets

```http
GET /api/support-tickets/my-tickets
Authorization: Bearer <token>
```

#### Get Ticket Details

```http
GET /api/support-tickets/:ticketId
Authorization: Bearer <token>
```

---

### 💳 Payment APIs

#### Create Payment Intent

```http
POST /api/payment/create-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "currency": "usd",
  "courseId": "course-id"
}
```

#### Process Payment

```http
POST /api/payment/process
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

#### Get Payment History

```http
GET /api/payment/history
Authorization: Bearer <token>
```

---

### 📅 Calendar APIs

#### Get Events

```http
GET /calendar/events
Authorization: Bearer <token>
```

#### Create Event

```http
POST /calendar/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Event Title",
  "startDate": "2024-01-01T10:00:00Z",
  "endDate": "2024-01-01T12:00:00Z"
}
```

#### Get Event Participants

```http
GET /calendar/participants/:eventId
Authorization: Bearer <token>
```

---

### 🔍 Search APIs

#### Search Courses

```http
GET /api/search/courses?q=keyword
Authorization: Bearer <token>
```

#### Search Users

```http
GET /api/search/users?q=keyword
Authorization: Bearer <token>
```

---

### 📊 Catalog APIs

#### Get Catalog Courses

```http
GET /api/catalog/courses
Authorization: Bearer <token>
```

#### Get Course Catalog Details

```http
GET /api/catalog/courses/:courseId
Authorization: Bearer <token>
```

---

### 🎤 Text-to-Speech APIs

#### Generate Speech

```http
POST /api/tts/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "voice": "en-US-JennyNeural"
}
```

---

### 📦 SCORM APIs

#### Upload SCORM Package

```http
POST /api/scorm/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <scorm-package.zip>
```

#### Get SCORM Content

```http
GET /api/scorm/:scormId
Authorization: Bearer <token>
```

---

### 🗂️ Asset APIs

#### Upload Asset

```http
POST /api/assets/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <asset-file>
```

#### Get Asset

```http
GET /api/assets/:assetId
Authorization: Bearer <token>
```

---

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- npm or yarn

### Frontend Setup

```bash
# Navigate to frontend directory
cd Creditor_UserDash

# Install dependencies
npm install

# Create environment file
cp .env.example .env.development

# Edit .env.development with your configuration
# VITE_API_BASE_URL=http://localhost:9000

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend/creditor_backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your configuration:
# DATABASE_URL="postgresql://user:password@localhost:5432/creditor_db"
# REDIS_URL="redis://localhost:6379"
# JWT_SECRET="your-secret-key"
# OPENAI_API_KEY="your-openai-key"
# STRIPE_SECRET_KEY="your-stripe-key"
# AWS_ACCESS_KEY_ID="your-aws-key"
# AWS_SECRET_ACCESS_KEY="your-aws-secret"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm start
```

### Database Setup

```bash
# Create PostgreSQL database
createdb creditor_db

# Run migrations
cd backend/creditor_backend
npx prisma migrate dev

# (Optional) Seed database
node src/Seeds/index.js
```

---

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

```bash
# Build for production
cd Creditor_UserDash
npm run build

# Deploy to Netlify
netlify deploy --prod

# Or deploy to Vercel
vercel --prod
```

### Backend Deployment (Render/Railway)

1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm install && npm run prisma:generate`
4. Set start command: `npm start`
5. Deploy

---

## ✨ Features

### 🎓 Learning Management

- ✅ Course Creation (Manual & AI-powered)
- ✅ Rich Lesson Builder with Multimedia Support
- ✅ Module Organization & Sequencing
- ✅ Progress Tracking & Analytics
- ✅ Certificate Generation
- ✅ SCORM Package Support

### 🤖 AI-Powered Tools

- ✅ AI Course Generator
- ✅ AI Image Generation
- ✅ Content Summarization
- ✅ Smart Q&A Generation
- ✅ Multi-model AI Support with Fallbacks

### 📝 Assessment Engine

- ✅ Quiz Builder (Multiple Choice, True/False, etc.)
- ✅ Assignment System with File Submissions
- ✅ Essay Assessments
- ✅ Survey Tools
- ✅ Debate Platform
- ✅ Auto-grading & Manual Grading

### 👥 Collaboration

- ✅ Group Management
- ✅ Real-time Chat (Socket.IO)
- ✅ Private Messaging
- ✅ Discussion Forums
- ✅ Announcements System
- ✅ Live Classes

### 💳 Payment & Subscriptions

- ✅ Stripe Integration
- ✅ Subscription Management
- ✅ Payment History
- ✅ Credit System

### 📅 Calendar & Events

- ✅ Event Management
- ✅ Calendar Integration
- ✅ Reminders & Notifications
- ✅ Attendance Tracking

### 🔔 Notifications

- ✅ Real-time Notifications
- ✅ Email Notifications
- ✅ In-app Notifications
- ✅ Push Notifications

### 🎨 User Experience

- ✅ Responsive Design (Mobile-first)
- ✅ Dark Mode Support
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Modern UI/UX
- ✅ Performance Optimized

---

## 📚 Additional Documentation

- [AI Integration Guide](./Creditor_UserDash/docs/MULTI_API_INTEGRATION.md)
- [Setup Instructions](./Creditor_UserDash/SETUP.md)
- [Testing Guide](./Creditor_UserDash/TESTING_GUIDE.md)
- [Tech Stack Workflow](./Creditor_UserDash/TECH_STACK_WORKFLOW.md)
- [Backend AI Architecture](./backend/creditor_backend/AI_ARCHITECTURE.md)
- [Redis Caching](./backend/creditor_backend/REDIS_CACHING_README.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

Built with ❤️ by the Creditor Academy Team

---

## 📞 Support

For support, email support@creditoracademy.com or create a support ticket in the application.

---

**Last Updated**: January 2025

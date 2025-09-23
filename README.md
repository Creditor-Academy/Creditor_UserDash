# 🎓 Creditor Academy LMS Platform

> A comprehensive Learning Management System with AI-powered course creation, interactive assessments, and modern educational tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.1-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue.svg)

## 🏗️ **System Architecture**

### **Frontend Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CREDITOR ACADEMY LMS                         │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + TailwindCSS + Shadcn/UI        │
├─────────────────────────────────────────────────────────────────┤
│                     PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages (98)     │  Components (253)   │  UI Components (53)    │
│  ├─ Dashboard   │  ├─ Courses (45)    │  ├─ Buttons           │
│  ├─ Courses     │  ├─ Lessons (19)    │  ├─ Forms             │
│  ├─ Lessons     │  ├─ Assessments     │  ├─ Modals            │
│  ├─ Quizzes     │  ├─ AI Tools        │  ├─ Tables            │
│  ├─ Groups      │  ├─ Chat/Messages   │  └─ Navigation        │
│  └─ Profile     │  └─ Admin Tools     │                       │
├─────────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Services (30)  │  Contexts (3)       │  Hooks (9)            │
│  ├─ API Client │  ├─ Auth Context    │  ├─ useAuth           │
│  ├─ Course     │  ├─ Credits Context │  ├─ useCourses        │
│  ├─ AI/Bytez   │  └─ Theme Context   │  ├─ useQuiz           │
│  ├─ Upload     │                     │  └─ useWebSocket      │
│  └─ Socket     │                     │                       │
├─────────────────────────────────────────────────────────────────┤
│                       DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  API Integration │ State Management   │  Local Storage        │
│  ├─ REST APIs    │ ├─ React State    │  ├─ User Preferences  │
│  ├─ WebSockets   │ ├─ Context API    │  ├─ Auth Tokens       │
│  ├─ File Upload  │ └─ Local State    │  └─ Cached Data       │
│  └─ Real-time    │                   │                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYED BACKEND                            │
│            https://creditor-backend-ceds.onrender.com          │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + MongoDB + S3 + Authentication            │
│  ├─ Course Management APIs                                     │
│  ├─ User Management & Auth                                     │
│  ├─ Assessment & Quiz Engine                                   │
│  ├─ File Upload & Storage (S3)                                │
│  ├─ Real-time Communication                                    │
│  └─ AI Proxy Services                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 **Technology Stack**

### **Core Technologies**
- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1 (Lightning-fast HMR)
- **Styling**: TailwindCSS 3.4.17 + Shadcn/UI
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 + Zod Validation

### **UI & Design**
- **Components**: Radix UI Primitives (Accessible)
- **Icons**: Lucide React (540+ icons)
- **Animations**: Framer Motion 12.23.12
- **Charts**: Recharts 2.12.7
- **Editor**: TipTap 3.1.0
- **Notifications**: React Hot Toast 2.6.0

### **AI & Advanced Features**
- **AI Integration**: Bytez.js 1.1.15 (Multi-model)
- **Real-time**: Socket.IO Client 4.8.1
- **File Processing**: XLSX 0.18.5
- **Media**: Speechify Integration
- **Date Handling**: Date-fns 3.6.0

## 📁 **Project Structure**

```
creditor-academy/
├── 📁 src/
│   ├── 📁 components/ (253 files)
│   │   ├── 📁 ui/ (53 files) - Base UI components
│   │   ├── 📁 courses/ (45 files) - Course management
│   │   ├── 📁 dashboard/ (21 files) - Analytics widgets
│   │   ├── 📁 LessonBuilder/ (19 files) - Content creation
│   │   └── 📁 group/ (9 files) - Collaboration tools
│   │
│   ├── 📁 pages/ (98 files)
│   │   ├── Dashboard.jsx - Main dashboard
│   │   ├── CreateCourse.jsx - Course creation
│   │   ├── LessonBuilder.jsx - Advanced editor
│   │   ├── QuizTakePage.jsx - Assessment interface
│   │   └── ManageUsers.jsx - Admin panel
│   │
│   ├── 📁 services/ (30 files)
│   │   ├── apiClient.js - HTTP client
│   │   ├── courseService.js - Course APIs
│   │   ├── aiCourseService.js - AI features
│   │   ├── authService.js - Authentication
│   │   └── uploadService.js - File handling
│   │
│   ├── 📁 contexts/ (3 files)
│   │   ├── AuthContext.jsx - Auth state
│   │   ├── CreditsContext.jsx - Billing
│   │   └── ThemeContext.jsx - UI themes
│   │
│   └── 📁 hooks/ (9 files)
│       ├── useAuth.js - Authentication
│       ├── useCourseManagement.js - Course ops
│       └── useWebSocket.js - Real-time
│
├── 📄 vite.config.ts - Build configuration
├── 📄 tailwind.config.js - Styling config
├── 📄 package.json - Dependencies
└── 📄 .env.development - Environment vars
```

## 🎯 **Core Features**

### **🎓 Learning Management**
- **Course Creation**: Manual & AI-powered generation
- **Lesson Builder**: Rich multimedia editor
- **Module Organization**: Structured learning paths
- **Progress Tracking**: Real-time monitoring
- **Certificates**: Automated generation

### **🤖 AI-Powered Tools**
- **AI Course Generator**: Complete course creation
- **AI Image Generation**: Custom thumbnails
- **Content Summarization**: Auto text condensation
- **Smart Q&A**: AI question generation
- **Multi-model Support**: Bytez.js with fallbacks

### **📝 Assessment Engine**
- **Quiz Builder**: Multiple question types
- **Assignment System**: File submissions & grading
- **Survey Tools**: Feedback collection
- **Debate Platform**: Discussion forums
- **Auto-grading**: Intelligent scoring

### **👥 Collaboration**
- **Group Management**: Student teams
- **Real-time Chat**: Socket.IO messaging
- **Discussion Forums**: Threaded conversations
- **Live Classes**: Virtual classrooms
- **Announcements**: Broadcast system

## 🔧 **Development Setup**

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd creditor-academy

# Install dependencies
npm install

# Configure environment
cp .env.example .env.development
# Edit .env.development with your API keys

# Start development
npm run dev
```

### **Environment Variables**
```env
VITE_API_BASE_URL=https://creditor-backend-ceds.onrender.com
VITE_BYTEZ_KEY=your_primary_api_key
VITE_BYTEZ_KEY_2=your_secondary_api_key
VITE_BYTEZ_KEY_3=your_tertiary_api_key
VITE_BYTEZ_KEY_4=your_quaternary_api_key
```

### **Scripts**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Code analysis
```

## 🔌 **API Integration**

### **Backend Services**
**Base URL**: `https://creditor-backend-ceds.onrender.com`

### **Key Endpoints**
```
# Authentication
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/verify

# Course Management
GET    /api/course/getAllCourses
POST   /api/course/createCourse
PUT    /api/course/editCourse/:id
DELETE /api/course/:id/delete

# AI Services
POST /api/ai/generate-content
POST /api/ai/create-course
POST /api/ai/generate-image

# File Upload
POST /api/resource/upload-resource
```

## 🤖 **AI Integration**

### **Bytez.js Multi-Model System**
- **Text Models**: google/flan-t5-base, gpt-4o
- **Image Models**: dreamlike-art/dreamlike-photoreal-2.0
- **Fallback System**: 4 API keys with graceful degradation
- **Offline Mode**: Template-based generation

### **AI Features**
1. **Course Generation**: Automated outlines & content
2. **Image Creation**: Custom visuals & thumbnails
3. **Content Enhancement**: Summarization & Q&A
4. **Smart Assistance**: Context-aware help

## 🎨 **Design System**

### **Component Architecture**
- **Base Components**: Shadcn/UI + Radix primitives
- **Feature Components**: Domain-specific interfaces
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

### **Styling**
- **Utility-First**: TailwindCSS approach
- **Design Tokens**: Consistent color & spacing
- **Dark Mode**: System preference support
- **Animations**: Framer Motion integration

## 🔒 **Security**

### **Authentication**
- **JWT Tokens**: Secure token system
- **Role-Based Access**: Student/Instructor/Admin
- **Protected Routes**: Client-side protection
- **Session Management**: Auto refresh

### **Security Measures**
- **Input Validation**: Zod schema validation
- **XSS Protection**: DOMPurify sanitization
- **CSRF Protection**: Token validation
- **Secure Headers**: HTTPS enforcement

## 🚀 **Performance**

### **Optimization**
- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image compression
- **Caching**: API response caching

### **Monitoring**
- **Core Web Vitals**: Performance tracking
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton placeholders
- **Offline Support**: Service worker

## 📦 **Deployment**

### **Build Process**
```bash
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Local preview
```

### **Targets**
- **Netlify**: Primary deployment (netlify.toml)
- **Vercel**: Alternative (vercel.json)
- **Static Hosting**: Any CDN/server

## 📚 **Documentation**

### **Available Docs**
- `AI_INTEGRATION_DOCS.md` - AI service guide
- `SETUP.md` - Development setup
- `RESOURCES_README.md` - Resource management
- `DIAGNOSTIC_REPORT.md` - System diagnostics

### **Support**
- **Issues**: GitHub issue tracking
- **Documentation**: Comprehensive guides
- **Development**: Team contact

---

**Built with ❤️ by the Creditor Academy Team**

*Empowering education through innovative technology and AI-powered learning experiences.*

# Creditor Academy LMS - Complete Feature List

This document provides a comprehensive list of all features in the LMS along with their related files.

## Total Features: 50+

---

## 1. **Search Bar in Dashboard**

**Description:** Global search functionality to search for courses and users across the platform.

**Related Files:**

- `src/components/dashboard/DashboardHeader.jsx`
- `src/services/searchService.js`
- `src/components/UserDetailsModal.jsx`

---

## 2. **Dashboard Overview**

**Description:** Main dashboard displaying user statistics, courses, progress, and quick access to features.

**Related Files:**

- `src/pages/Dashboard.jsx`
- `src/components/dashboard/ProgressStats.jsx`
- `src/components/dashboard/CourseCard.jsx`
- `src/components/dashboard/DashboardCarousel.jsx`
- `src/components/dashboard/MonthlyProgress.jsx`
- `src/components/dashboard/DashboardAnnouncements.jsx`
- `src/components/dashboard/LiveClasses.jsx`
- `src/components/dashboard/UpcomingLiveClasses.jsx`
- `src/components/dashboard/UpcomingClassesSection.jsx`

---

## 3. **Course Management**

**Description:** Create, edit, view, and manage courses with modules and lessons.

**Related Files:**

- `src/pages/Courses.jsx`
- `src/pages/CourseView.jsx`
- `src/pages/CreateCourse.jsx`
- `src/pages/UpcomingCourses.jsx`
- `src/services/courseService.js`
- `src/components/courses/CourseCard.jsx`
- `src/components/courses/CourseDetail.jsx`
- `src/components/courses/CreateCourseModal.jsx`
- `src/components/courses/EditCourseModal.jsx`
- `src/components/courses/CourseModulesSection.jsx`
- `src/components/courses/CourseUsersModal.jsx`
- `src/components/courses/CourseTimerProvider.jsx`

---

## 4. **Module Management**

**Description:** Create and manage course modules with lessons and assessments.

**Related Files:**

- `src/pages/ModulesList.jsx`
- `src/pages/ModuleDetail.jsx`
- `src/pages/ModuleLessonsView.jsx`
- `src/pages/ModuleAssessmentsView.jsx`
- `src/pages/InstructorCourseModulesPage.jsx`
- `src/services/modulesService.js`
- `src/components/courses/ModuleCard.jsx`
- `src/components/courses/CreateModuleDialog.jsx`

---

## 5. **Lesson Builder & Management**

**Description:** Advanced lesson creation with rich content blocks, AI assistance, and multimedia support.

**Related Files:**

- `src/lessonbuilder/pages/LessonBuilder.jsx`
- `src/lessonbuilder/pages/LessonView.jsx`
- `src/lessonbuilder/pages/LessonPreview.jsx`
- `src/pages/LessonDetail.jsx`
- `src/pages/CourseLessonsPage.jsx`
- `src/services/lessonService.js`
- `src/components/courses/LessonCard.jsx`
- `src/components/courses/LessonCardModule.jsx`
- `src/components/courses/LessonContent.jsx`
- `src/components/courses/CreateLessonDialog.jsx`
- `src/components/courses/LessonCreatorTabs/BlockEditorTab.jsx`
- `src/components/courses/LessonCreatorTabs/ContentSyncTab.jsx`
- `src/components/courses/LessonCreatorTabs/LessonsTab.jsx`
- `src/components/courses/LessonCreatorTabs/OutlineTab.jsx`
- `src/components/courses/LessonCreatorTabs/PreviewTab.jsx`
- `src/components/courses/LessonCreatorTabs/SettingsTab.jsx`
- `src/components/courses/LessonCreatorTabs/VideoLinksTab.jsx`
- `src/lessonbuilder/hooks/useLessonBlocks.js`
- `src/lessonbuilder/hooks/useLessonAutosave.js`
- `src/lessonbuilder/hooks/useLessonLoader.js`
- `src/lessonbuilder/components/blocks/` (15 block type files)

---

## 6. **AI Course Creator**

**Description:** AI-powered course generation with automatic content creation.

**Related Files:**

- `src/pages/AICourseCreator.jsx`
- `src/services/aiCourseService.js`
- `src/services/comprehensiveCourseGenerator.js`
- `src/services/courseArchitectService.js`
- `src/services/fallbackCourseGenerator.js`
- `src/components/courses/AICourseCreationPanel.jsx`
- `src/components/courses/AICourseOutlineModal.jsx`
- `src/components/courses/AICourseSuccessModal.jsx`
- `src/components/courses/AICourseBadge.jsx`
- `src/components/courses/SimpleAICourseCreator.jsx`
- `src/components/courses/DedicatedAICourseCreator.jsx`

---

## 7. **AI Content Generation Tools**

**Description:** Various AI tools for generating images, summaries, Q&A, and content.

**Related Files:**

- `src/services/aiService.js`
- `src/services/enhancedAIService.js`
- `src/services/unifiedAIContentService.js`
- `src/services/universalAILessonService.js`
- `src/services/structuredLessonGenerator.js`
- `src/services/contentLibraryAIService.js`
- `src/components/courses/AIImageGenerator.jsx`
- `src/components/courses/AISummarizationTool.jsx`
- `src/components/courses/AIQuestionAnswering.jsx`
- `src/components/courses/AIContentButton.jsx`
- `src/components/courses/AIContentSearch.jsx`
- `src/components/courses/AIFeatureAccess.jsx`
- `src/components/courses/AIUsageDashboard.jsx`
- `src/components/courses/AIWorkflowManager.jsx`
- `src/components/courses/AIWorkspaceTabs.jsx`

---

## 8. **AI Image Generation**

**Description:** Generate custom images and thumbnails using AI models.

**Related Files:**

- `src/services/enhancedImageService.js`
- `src/services/smartImageService.js`
- `src/services/qwenImageService.js`
- `src/services/imageUploadService.js`
- `src/services/imageProxyService.js`
- `src/components/courses/AIImageGenerator.jsx`

---

## 9. **AI Lesson Creator**

**Description:** AI-assisted lesson creation with automated content generation.

**Related Files:**

- `src/components/courses/AILessonCreator.jsx`
- `src/components/courses/EnhancedAILessonCreator.jsx`
- `src/components/courses/StreamingLessonGenerator.jsx`
- `src/components/courses/BatchLessonGenerator.jsx`
- `src/components/courses/UnifiedAIBlockEditor.jsx`

---

## 10. **Quiz System**

**Description:** Create and take quizzes with multiple question types (MCQ, True/False, Fill in Blanks, etc.).

**Related Files:**

- `src/pages/AddQuiz.jsx`
- `src/pages/QuizView.jsx`
- `src/pages/QuizTypePage.jsx`
- `src/pages/QuizInstructionPage.jsx`
- `src/pages/QuizTakePage.jsx`
- `src/pages/QuizResultsPage.jsx`
- `src/pages/DemoQuizPage.jsx`
- `src/services/quizService.js`
- `src/services/quizServices.js`
- `src/components/courses/QuizCard.jsx`
- `src/components/courses/QuizModal.jsx`
- `src/components/courses/QuizScoresModal.jsx`
- `src/components/courses/EditQuestionModal.jsx`
- `src/components/assessments/DemoQuizDialog.jsx`
- `src/components/QuizCorrectAns.jsx`

---

## 11. **Assignment System**

**Description:** File-based assignments with submission and grading capabilities.

**Related Files:**

- `src/pages/AssignmentInstructionPage.jsx`
- `src/pages/AssignmentTakePage.jsx`
- `src/pages/AssignmentSubmit.jsx`
- `src/pages/AssignmentResultsPage.jsx`
- `src/pages/AssignmentSubmissions.jsx`
- `src/components/courses/AssignmentCard.jsx`
- `src/components/assignments/AssignmentSubmissionDialog.jsx`
- `src/components/assignments/AssignmentReportDialog.jsx`

---

## 12. **Essay Assessment**

**Description:** Essay writing assessments with word count and grading.

**Related Files:**

- `src/pages/EssayInstructionPage.jsx`
- `src/pages/EssayTakePage.jsx`
- `src/pages/EssayResultsPage.jsx`
- `src/components/essays/EssayAssessmentDialog.jsx`
- `src/components/essays/EssayViewDialog.jsx`

---

## 13. **Debate Platform**

**Description:** Interactive debate and discussion platform.

**Related Files:**

- `src/pages/DebateView.jsx`
- `src/pages/DebateInstructionPage.jsx`
- `src/pages/DebateTakePage.jsx`
- `src/components/debates/DebateInfoDialog.jsx`

---

## 14. **Survey System**

**Description:** Create and conduct surveys for feedback collection.

**Related Files:**

- `src/pages/SurveyView.jsx`
- `src/pages/SurveyInstructionPage.jsx`
- `src/components/surveys/` (survey components)

---

## 15. **Scenario-Based Assessment**

**Description:** Interactive scenario-based assessments for practical learning.

**Related Files:**

- `src/pages/CreateScenario.jsx`
- `src/pages/PreviewScenario.jsx`
- `src/pages/ScenarioTakePage.jsx`
- `src/pages/FinalScanrioscore.jsx`
- `src/pages/ScanerioLastAttempt.jsx`
- `src/pages/SceanrioScoreCard.jsx`
- `src/services/scenarioService.js`
- `src/components/courses/ScenarioModal.jsx`
- `src/components/LastAttemptModal.jsx`

---

## 16. **Group Management & Collaboration**

**Description:** Create and manage groups with chat, announcements, and member management.

**Related Files:**

- `src/pages/Groups.jsx`
- `src/pages/AddGroups.jsx`
- `src/pages/GroupInfo.jsx`
- `src/pages/group/AdminPage.jsx`
- `src/pages/group/MembersPage.jsx`
- `src/pages/group/ChatPage.jsx`
- `src/pages/group/AnnouncementsPage.jsx`
- `src/pages/group/NewsPage.jsx`
- `src/services/groupService.js`
- `src/services/privateGroupService.js`
- `src/components/dashboard/DashboardGroup.jsx`
- `src/components/group/ChatHeader.jsx`
- `src/components/group/ChatInput.jsx`
- `src/components/group/ChatMessage.jsx`
- `src/components/group/ChatMessagesList.jsx`
- `src/components/group/ParticipantsPanel.jsx`
- `src/components/group/PollComposer.jsx`
- `src/components/group/PollMessage.jsx`
- `src/components/group/AttachmentModal.jsx`
- `src/components/group/EmojiPicker.jsx`
- `src/components/group/ImagePreview.jsx`
- `src/components/group/AudioPreview.jsx`
- `src/components/group/LinkPreview.jsx`
- `src/hooks/useGroupChatSocket.js`
- `src/layouts/GroupLayout.jsx`

---

## 17. **Real-time Chat**

**Description:** Socket.IO based real-time messaging system.

**Related Files:**

- `src/services/socketClient.js`
- `src/services/privateGroupSocket.js`
- `src/hooks/useGroupChatSocket.js`
- `src/components/group/ChatPage.jsx` (in pages/group)
- `src/components/group/ChatMessage.jsx`
- `src/components/group/ChatInput.jsx`

---

## 18. **Announcements System**

**Description:** Broadcast announcements to users and groups.

**Related Files:**

- `src/pages/Announcements.jsx`
- `src/components/dashboard/DashboardAnnouncements.jsx`
- `src/pages/group/AnnouncementsPage.jsx`
- `src/hooks/useAnnouncementsSocket.js`

---

## 19. **Notifications System**

**Description:** User notifications with real-time updates.

**Related Files:**

- `src/services/notificationService.js`
- `src/components/dashboard/NotificationModal.jsx`
- `src/components/dashboard/DashboardHeader.jsx` (notification icon)

---

## 20. **Messages/Inbox**

**Description:** Private messaging system between users.

**Related Files:**

- `src/pages/Messages.jsx`
- `src/services/messageService.js`
- `src/components/dashboard/InboxModal.jsx`
- `src/components/messages/` (message components)
- `src/components/messages/PrivateGroupsAdmin.jsx`

---

## 21. **Calendar & Events**

**Description:** Calendar view with event management and scheduling.

**Related Files:**

- `src/pages/CalendarPage.jsx`
- `src/pages/AddEvent.jsx`
- `src/pages/AthenaUpcomingEvent.jsx`
- `src/services/calendarService.js`
- `src/services/eventService.js`
- `src/components/dashboard/DashboardCalendar.jsx`
- `src/components/dashboard/CalendarModal.jsx`
- `src/components/dashboard/EventAttendanceModal.jsx`

---

## 22. **Todo/Task Management**

**Description:** Personal task and todo list management.

**Related Files:**

- `src/pages/TodoPage.jsx`
- `src/components/dashboard/DashboardTodo.jsx`

---

## 23. **Live Classes**

**Description:** Virtual classroom functionality with scheduling.

**Related Files:**

- `src/pages/LiveClass.jsx`
- `src/components/dashboard/LiveClasses.jsx`
- `src/components/dashboard/UpcomingLiveClasses.jsx`
- `src/components/dashboard/UpcomingClassesSection.jsx`
- `src/components/ClassLC.jsx`

---

## 24. **Class Recordings**

**Description:** View and manage recorded class sessions.

**Related Files:**

- `src/pages/ClassRecordings.jsx`
- `src/components/dashboard/ClassRecording.jsx`
- `src/components/dashboard/VideoViewerModal.jsx`

---

## 25. **Progress Tracking**

**Description:** Track learning progress, completion rates, and statistics.

**Related Files:**

- `src/pages/Progress.jsx`
- `src/components/dashboard/ProgressStats.jsx`
- `src/components/dashboard/MonthlyProgress.jsx`
- `src/services/analyticsService.js`
- `src/utils/analyticsUtils.js`

---

## 26. **Course Analytics**

**Description:** Analytics dashboard for instructors showing course activity and engagement.

**Related Files:**

- `src/pages/CourseActivityAnalytics.jsx`
- `src/services/analyticsService.js`
- `src/utils/analyticsUtils.js`
- `src/pages/Instructorpage.jsx` (analytics tab)

---

## 27. **User Profile Management**

**Description:** User profile with avatar, settings, and preferences.

**Related Files:**

- `src/pages/Profile.jsx`
- `src/pages/AvatarPickerPage.jsx`
- `src/services/userService.js`
- `src/components/profile/` (profile components)
- `src/components/dashboard/ProfileDropdown.jsx`
- `src/lib/avatar-utils.js`

---

## 28. **User Management (Admin/Instructor)**

**Description:** Add, edit, and manage users (admin/instructor feature).

**Related Files:**

- `src/pages/AddUsersPage.jsx`
- `src/pages/ManageUsers.jsx`
- `src/components/UserDetailsModal.jsx`
- `src/services/userService.js`

---

## 29. **Course Enrollment**

**Description:** Enroll in courses with payment/credit system.

**Related Files:**

- `src/pages/CourseEnrollment.jsx`
- `src/services/courseService.js`
- `src/components/courses/CourseUnlocks.jsx`

---

## 30. **Payment & Credits System**

**Description:** Credit-based payment system for course purchases and features.

**Related Files:**

- `src/pages/PaymentSuccess.jsx`
- `src/pages/PaymentFailed.jsx`
- `src/contexts/CreditsContext.jsx`
- `src/components/credits/CreditPurchaseModal.jsx`
- `src/components/credits/AdminPayments.jsx`
- `src/utils/trialUtils.js`

---

## 31. **Catalog System**

**Description:** Browse and filter courses by categories.

**Related Files:**

- `src/pages/Catalog.jsx`
- `src/pages/CatelogCourses.jsx`
- `src/pages/AddCatelog.jsx`
- `src/services/catalogService.js`
- `src/services/instructorCatalogService.js`

---

## 32. **Certificate Generation**

**Description:** Automated certificate generation upon course completion.

**Related Files:**

- `src/pages/CertificatePage.jsx`

---

## 33. **Support Ticket System**

**Description:** Create and manage support tickets.

**Related Files:**

- `src/pages/Support.jsx`
- `src/pages/SupportTicket.jsx`
- `src/pages/MyTickets.jsx`
- `src/services/ticketService.js`

---

## 34. **FAQ System**

**Description:** Frequently asked questions and help documentation.

**Related Files:**

- `src/pages/FAQs.jsx`
- `src/pages/faqpages/faqpage.jsx`
- `src/components/dashboard/DashboardFAQ.jsx`
- `src/components/faq/hero.jsx`
- `src/components/faq/Resources.jsx`

---

## 35. **Guides & Resources**

**Description:** Help guides and resource library.

**Related Files:**

- `src/pages/Guides.jsx`
- `src/components/Resources.jsx`

---

## 36. **Attendance Tracking**

**Description:** Track attendance for events and classes.

**Related Files:**

- `src/services/attendanceService.js`
- `src/components/dashboard/AttendanceViewerModal.jsx`
- `src/components/dashboard/EventAttendanceModal.jsx`

---

## 37. **Video Upload & Management**

**Description:** Upload and manage video content for lessons.

**Related Files:**

- `src/services/videoUploadService.js`
- `src/components/dashboard/VideoViewerModal.jsx`

---

## 38. **Audio Upload & Management**

**Description:** Upload and manage audio content.

**Related Files:**

- `src/services/audioUploadService.js`

---

## 39. **Asset Management**

**Description:** Manage course assets and resources.

**Related Files:**

- `src/services/assetsService.js`
- `src/pages/Instructorpage.jsx` (assets tab)

---

## 40. **Speechify Reader (Text-to-Speech)**

**Description:** Text-to-speech functionality for accessibility.

**Related Files:**

- `src/pages/SpeechifyReaderView.jsx`
- `src/components/courses/SpeechifyReader.jsx`
- `src/components/courses/ImmersiveReader.jsx`
- `src/hooks/useSpeechSynthesis.jsx`
- `src/types/speechify.d.js`

---

## 41. **Text Selection Toolbar**

**Description:** Text selection with quick actions (highlight, note, etc.).

**Related Files:**

- `src/components/TextSelectionToolbar.jsx`
- `src/hooks/useTextSelection.js`
- `src/pages/TEXT_SELECTION_FEATURE.md`

---

## 42. **Voice Recording**

**Description:** Record and manage voice notes.

**Related Files:**

- `src/hooks/useVoiceRecording.jsx`

---

## 43. **Chatbot Assistant**

**Description:** AI-powered chatbot for platform assistance.

**Related Files:**

- `src/pages/Chatbot.jsx`
- `src/components/LMSChatbot.jsx`
- `src/components/chatbot/FloatingChatbot.jsx`

---

## 44. **Games/Interactive Learning**

**Description:** Gamified learning experiences.

**Related Files:**

- `src/pages/Games.jsx`
- `src/components/games/GameDetailView.jsx`
- `src/components/GameBanner.jsx`

---

## 45. **Instructor Dashboard**

**Description:** Comprehensive instructor dashboard with all management tools.

**Related Files:**

- `src/pages/Instructorpage.jsx`
- `src/pages/InstructorCourseModulesPage.jsx`
- `src/components/layout/Sidebar.jsx`

---

## 46. **Website Service Booking**

**Description:** Book website creation and related services.

**Related Files:**

- `src/pages/WebsiteCreation.jsx`
- `src/services/websiteService.js`
- `src/services/consultationService.js`

---

## 47. **URL Shortener**

**Description:** Shorten URLs for sharing.

**Related Files:**

- `src/services/urlShortenerService.js`

---

## 48. **Cookie Management**

**Description:** Cookie consent and management.

**Related Files:**

- `src/pages/Cookies.jsx`
- `src/services/cookieService.js`

---

## 49. **Authentication & Authorization**

**Description:** User authentication, login, signup, and password reset.

**Related Files:**

- `src/pages/Auth/Login.jsx`
- `src/pages/Auth/SignUp.jsx`
- `src/pages/Auth/ResetPassword.jsx`
- `src/contexts/AuthContext.jsx`
- `src/services/authHeader.js`
- `src/services/tokenService.js`
- `src/components/ProtectedRoute.jsx`

---

## 50. **Landing Pages & Marketing**

**Description:** Public-facing landing pages and marketing content.

**Related Files:**

- `src/pages/home.jsx`
- `src/pages/LandingPage.jsx`
- `src/pages/AboutUsPage/About.jsx`
- `src/pages/contactpage/contact.jsx`
- `src/pages/FeaturesPage/Features.jsx`
- `src/pages/WhyusPage/WhyUs.jsx`
- `src/pages/Product/Product.jsx`
- `src/pages/Pricing.jsx`
- `src/pages/Plans.jsx`
- `src/pages/PrivacyPolicy.jsx`
- `src/pages/TermCondition.jsx`
- `src/pages/ReturnRefund.jsx`
- `src/pages/MembershipTnC.jsx`
- `src/pages/Sitemap.jsx`
- `src/components/homepage/` (19 files)
- `src/components/AboutUs/` (11 files)
- `src/components/contactus/` (5 files)
- `src/components/Features/` (3 files)
- `src/components/Product/` (8 files)
- `src/components/Why us/` (3 files)
- `src/components/Website/` (7 files)
- `src/components/Platform/` (44 files)

---

## 51. **Platform Features Pages**

**Description:** Marketing pages for platform features.

**Related Files:**

- `src/pages/Platform/CoursesPage.jsx`
- `src/pages/Platform/CommunitiesPage.jsx`
- `src/pages/Platform/DigitalDownloadsPage.jsx`
- `src/pages/Platform/MembershipsPage.jsx`
- `src/pages/Platform/CoachingPage.jsx`
- `src/pages/Platform/Emailautomation.jsx`
- `src/pages/Platform/Analyticspage.jsx`
- `src/pages/Platform/Brandpage.jsx`
- `src/pages/Platform/Sellingpage.jsx`
- `src/components/Platform/` (44 files)

---

## 52. **Course Landing Pages**

**Description:** Specific course landing pages.

**Related Files:**

- `src/coursesL/Sov.jsx`
- `src/coursesL/Sophomore.jsx`
- `src/coursesL/OperatePrivate.jsx`
- `src/coursesL/Senior.jsx`
- `src/coursesL/Remedy.jsx`
- `src/coursesL/PrivateMerchant.jsx`
- `src/pages/MasterClass.jsx`
- `src/pages/MerchantProcessing.jsx`
- `src/pages/AcademicAthena.jsx`
- `src/pages/CompanyAthena.jsx`
- `src/pages/Expert_athena.jsx`
- `src/pages/RevenueGeneration.jsx`
- `src/pages/CustomerTraining.jsx`
- `src/pages/LeadGeneration.jsx`
- `src/pages/InstructionalDesign.jsx`

---

## Summary Statistics

- **Total Features:** 52+
- **Total Pages:** 126+ files
- **Total Components:** 413+ files
- **Total Services:** 58+ files
- **Total Hooks:** 9 files
- **Total Contexts:** 3 files

---

## Feature Categories

1. **Core Learning Management** (Features 1-5)
2. **AI-Powered Features** (Features 6-9)
3. **Assessment System** (Features 10-15)
4. **Collaboration & Communication** (Features 16-20)
5. **Scheduling & Organization** (Features 21-23)
6. **Analytics & Progress** (Features 24-26)
7. **User Management** (Features 27-28)
8. **Commerce & Enrollment** (Features 29-31)
9. **Support & Help** (Features 32-35)
10. **Media Management** (Features 36-38)
11. **Accessibility & Tools** (Features 39-42)
12. **Additional Features** (Features 43-52)

---

_Last Updated: Based on current codebase analysis_
_Total Lines of Code: 100,000+_

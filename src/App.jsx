import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';

import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import UpcomingCourses from '@/pages/UpcomingCourses';
import Courses from '@/pages/Courses';
import ModulesList from '@/pages/ModulesList';
import ModuleDetail from '@/pages/ModuleDetail';
import LessonDetail from '@/pages/LessonDetail';
import QuizView from '@/pages/QuizView';
import QuizTypePage from '@/pages/QuizTypePage';
import QuizInstructionPage from '@/pages/QuizInstructionPage';
import QuizTakePage from '@/pages/QuizTakePage';
import QuizResultsPage from '@/pages/QuizResultsPage';
import AssignmentInstructionPage from '@/pages/AssignmentInstructionPage';
import AssignmentTakePage from '@/pages/AssignmentTakePage';
import AssignmentResultsPage from '@/pages/AssignmentResultsPage';
import EssayInstructionPage from '@/pages/EssayInstructionPage';
import EssayTakePage from '@/pages/EssayTakePage';
import EssayResultsPage from '@/pages/EssayResultsPage';
import ModernLessonDemo from '@/pages/ModernLessonDemo';
import Groups from '@/pages/Groups';
import Catalog from '@/pages/Catalog';
import CatelogCourses from '@/pages/CatelogCourses';

import Progress from '@/pages/Progress';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import CourseView from '@/pages/CourseView';
import ModuleLessonsView from '@/pages/ModuleLessonsView';
import ModuleAssessmentsView from '@/pages/ModuleAssessmentsView';
import CourseEnrollment from '@/pages/CourseEnrollment';
import GroupLayout from '@/layouts/GroupLayout';
import MembersPage from '@/pages/group/MembersPage';
import NewsPage from '@/pages/group/NewsPage';

import AnnouncementsPage from '@/pages/group/AnnouncementsPage';
import ChatPage from '@/pages/group/ChatPage';
import SponsorCenterLayout from '@/pages/sponsorCenter/SponsorCenterLayout';
import SponsorRequestPage from '@/pages/sponsorCenter/SponsorRequestPage';
import SponsorRequestDescriptionPage from '@/pages/sponsorCenter/SponsorRequestDescriptionPage';
import MySponsorAdsPage from '@/pages/sponsorCenter/MySponsorAdsPage';
import SponsorAnalyticsPage from '@/pages/sponsorCenter/SponsorAnalyticsPage';
import SponsorAdDetailsPage from '@/pages/sponsorCenter/SponsorAdDetailsPage';
import SpeechifyReaderView from '@/pages/SpeechifyReaderView';
import AvatarPickerPage from '@/pages/AvatarPickerPage';
import FAQs from '@/pages/FAQs';
import Support from '@/pages/Support';
import Privacy from '@/pages/Privacy';
import Guides from '@/pages/Guides';
import SupportTicket from '@/pages/SupportTicket';
import Announcements from '@/pages/Announcements';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import AssignmentSubmit from '@/pages/AssignmentSubmit';
import AssignmentSubmissions from '@/pages/AssignmentSubmissions';
import DebateView from '@/pages/DebateView';
import SurveyView from '@/pages/SurveyView';
import DemoQuizPage from '@/pages/DemoQuizPage';
import CalendarPage from '@/pages/CalendarPage';
import TodoPage from '@/pages/TodoPage';
import ClassRecordings from '@/pages/ClassRecordings';
import Attendance from '@/pages/Attendance';
import CertificatePage from '../src/pages/CertificatePage';
import SurveyInstructionPage from '@/pages/SurveyInstructionPage';
import DebateInstructionPage from '@/pages/DebateInstructionPage';
import DebateTakePage from '@/pages/DebateTakePage';
import Chatbot from '@/pages/Chatbot';
import Games from '@/pages/Games';
import GameDetailView from '@/components/games/GameDetailView';
import MyTickets from '@/pages/MyTickets';
import { CourseTimerProvider } from '@/components/courses/CourseTimerProvider';
import { currentUserId } from '@/data/currentUser';
import Instructorpage from '@/pages/Instructorpage';
import InstructorCourseModulesPage from '@/pages/InstructorCourseModulesPage';
import LessonBuilder from '@lessonbuilder/pages/LessonBuilder';
import LessonPreview from '@lessonbuilder/pages/LessonPreview';
import LandingPage from '@/pages/LandingPage';
import Home from '@/pages/home';
import About from '@/pages/AboutUsPage/About';
import Contact from '@/pages/contactpage/contact';
import FAQPage from '@/pages/faqpages/faqpage';
import Product from '@/pages/Product/Product';
import Features from '@/pages/FeaturesPage/Features';
import WhyUs from '@/pages/WhyusPage/WhyUs';
import Plans from '@/pages/Plans';
import PageTransitionOverlay from '@/components/PageTransitionOverlay';
import AdminModal from '@/components/AdminModal';
import Sov from './coursesL/Sov';
import Sophomore from './coursesL/Sophomore';
import OperatePrivate from './coursesL/OperatePrivate';
import Senior from './coursesL/Senior';
import Remedy from './coursesL/Remedy';
import PrivateMerchant from './coursesL/PrivateMerchant';
import { MasterClass } from '@/pages/MasterClass';
import LiveClass from './pages/LiveClass';
import { WebsiteCreation } from './pages/WebsiteCreation';
import AcademicAthena from './pages/AcademicAthena';
import CompanyAthena from './pages/CompanyAthena';
import MerchantProcessing from './pages/MerchantProcessing';
import ProtectedRoute from './components/ProtectedRoute';
import Login from '@/pages/Auth/Login';
import ResetPassword from '@/pages/Auth/ResetPassword';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermCondition';
import ReturnRefund from '@/pages/ReturnRefund';
import MembershipTnC from '@/pages/MembershipTnC';
import MembershipEnrollment from '@/pages/MembershipEnrollment';
import ContactSection from '@/components/ContactSection';
import AddUsersPage from '@/pages/AddUsersPage';
import AICourseCreator from '@/pages/AICourseCreator';
import CreateScenario from '@/pages/CreateScenario';
import PreviewScenario from '@/pages/PreviewScenario';
import ScenarioTakePage from '@/pages/ScenarioTakePage';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { CreditsProvider } from './contexts/CreditsContext';
import { SponsorAdsProvider } from '@/contexts/SponsorAdsContext';
import { UserSponsorProvider } from '@/contexts/UserSponsorContext';
// import  ModuleView  from "@/pages/ModuleView";
import LessonView from '@lessonbuilder/pages/LessonView';
import LessonResourcesPage from '@/pages/LessonResourcesPage';
import InstructionalDesign from '@/pages/InstructionalDesign';
import PricingPage from '@/pages/Pricing';
import ExpertAthena from './pages/Expert_athena';
import RevenueGeneration from './pages/RevenueGeneration';
import CustomerTraining from './pages/CustomerTraining';
import LeadGeneration from './pages/LeadGeneration';
import CoursesPage from './pages/Platform/CoursesPage';
import CommunitiesPage from './pages/Platform/CommunitiesPage';
import DigitalDownloadsPage from './pages/Platform/DigitalDownloadsPage';
import MembershipsPage from './pages/Platform/MembershipsPage';
import CoachingPage from './pages/Platform/CoachingPage';
import Emailautomation from './pages/Platform/Emailautomation';
import Analyticspage from './pages/Platform/Analyticspage';
import Brandpage from './pages/Platform/Brandpage';
import Sellingpage from './pages/Platform/Sellingpage';
import PrivacyAthena from './pages/PrivacyAthena';
import TermAthena from './pages/TermAthena';
import Cookies from './pages/Cookies';
import Sitemap from './pages/Sitemap';

function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <AuthProvider>
        <UserProvider>
          <CreditsProvider>
            <SponsorAdsProvider>
              <UserSponsorProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/whyus" element={<WhyUs />} />
                  <Route
                    path="/instructionaldesign"
                    element={<InstructionalDesign />}
                  />
                  <Route path="/sov" element={<Sov />} />
                  <Route path="/sophomore" element={<Sophomore />} />
                  <Route path="/operateprivate" element={<OperatePrivate />} />
                  <Route path="/unlimitedcredit" element={<Senior />} />
                  <Route path="/masterclass" element={<MasterClass />} />
                  <Route path="/liveclass" element={<LiveClass />} />
                  <Route path="/website" element={<WebsiteCreation />} />
                  <Route path="/academic_athena" element={<AcademicAthena />} />
                  <Route path="/company_athena" element={<CompanyAthena />} />
                  <Route path="/expert_athena" element={<ExpertAthena />} />
                  <Route
                    path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/preview"
                    element={
                      <ProtectedRoute>
                        <LessonPreview />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/revenue_generation"
                    element={<RevenueGeneration />}
                  />
                  <Route
                    path="/customer_training"
                    element={<CustomerTraining />}
                  />
                  <Route path="/lead_generation" element={<LeadGeneration />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/remedy" element={<Remedy />} />
                  <Route path="/pmp" element={<MerchantProcessing />} />
                  <Route
                    path="/privatemerchant"
                    element={<PrivateMerchant />}
                  />

                  {/* Platform routes */}
                  <Route path="/platform/courses" element={<CoursesPage />} />
                  <Route
                    path="/platform/communities"
                    element={<CommunitiesPage />}
                  />
                  <Route
                    path="/platform/digital-downloads"
                    element={<DigitalDownloadsPage />}
                  />
                  <Route
                    path="/platform/memberships"
                    element={<MembershipsPage />}
                  />
                  <Route path="/platform/coaching" element={<CoachingPage />} />
                  <Route
                    path="/platform/email-automation"
                    element={<Emailautomation />}
                  />
                  <Route
                    path="/platform/analytics"
                    element={<Analyticspage />}
                  />
                  <Route path="/platform/brand" element={<Brandpage />} />
                  <Route path="/platform/selling" element={<Sellingpage />} />
                  <Route path="/privacy-athena" element={<PrivacyAthena />} />
                  <Route path="/term-athena" element={<TermAthena />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route
                    path="/instructor"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/course-management"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/user-management"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/course-catalog"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/create-quiz"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/course-lessons"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/group-management"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/event-management"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/support-tickets"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/assets"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/payments"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/sponsor-ads"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/sponsor-ads/create"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/sponsor-ads/manage"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/sponsor-ads/requests"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/sponsor-ads/analytics"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/payment-dashboard"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/courses/:courseId/modules"
                    element={
                      <ProtectedRoute>
                        <InstructorCourseModulesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/add-users"
                    element={
                      <ProtectedRoute>
                        <AddUsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-quiz"
                    element={
                      <ProtectedRoute>
                        <Instructorpage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-scenario"
                    element={
                      <ProtectedRoute>
                        <CreateScenario />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/preview-scenario"
                    element={
                      <ProtectedRoute>
                        <PreviewScenario />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public routes (outside ProtectedRoute) */}
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route
                    path="/termcondition"
                    element={<TermsAndConditions />}
                  />
                  <Route path="/ReturnRefund" element={<ReturnRefund />} />
                  <Route path="/MembershipTnC" element={<MembershipTnC />} />
                  <Route path="/contact" element={<ContactSection />} />

                  {/* Protected dashboard route */}
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route
                      path="membership/enroll"
                      element={<MembershipEnrollment />}
                    />
                    <Route
                      path="upcoming-courses"
                      element={<UpcomingCourses />}
                    />

                    {/* Course related routes */}
                    <Route path="courses">
                      <Route index element={<Courses />} />
                      <Route path=":courseId">
                        <Route
                          index
                          element={
                            <CourseTimerProvider>
                              <CourseView />
                            </CourseTimerProvider>
                          }
                        />
                        <Route path="modules" element={<ModulesList />} />
                        <Route
                          path="modules/:moduleId/assessments"
                          element={<ModuleAssessmentsView />}
                        />
                        <Route
                          path="modules/:moduleId/lessons"
                          element={<LessonView />}
                        />
                        <Route
                          path="modules/:moduleId/lessons/:lessonId/resources"
                          element={<LessonResourcesPage />}
                        />
                        <Route path="module/:moduleId">
                          <Route index element={<ModuleDetail />} />
                          <Route
                            path="lessons"
                            element={<ModuleLessonsView />}
                          />
                          <Route
                            path="assessments"
                            element={<ModuleAssessmentsView />}
                          />
                          <Route path="lesson/:lessonId">
                            <Route index element={<LessonView />} />
                            <Route path="detail" element={<LessonDetail />} />
                            <Route path="builder" element={<LessonBuilder />} />
                            <Route path="preview" element={<LessonPreview />} />
                            <Route
                              path="resources"
                              element={<LessonResourcesPage />}
                            />
                          </Route>
                        </Route>
                      </Route>
                    </Route>

                    {/* Assessment routes */}
                    <Route path="quiz">
                      <Route path=":quizType" element={<QuizTypePage />} />
                      <Route
                        path="instruction/:quizId"
                        element={<QuizInstructionPage />}
                      />
                      <Route path="take/:quizId" element={<QuizTakePage />} />
                      <Route
                        path="results/:quizId"
                        element={<QuizResultsPage />}
                      />
                    </Route>

                    {/* Scenario routes */}
                    <Route path="scenario">
                      <Route
                        path="take/:scenarioId"
                        element={<ScenarioTakePage />}
                      />
                    </Route>

                    <Route path="assignment">
                      <Route
                        path="instruction/:assignmentId"
                        element={<AssignmentInstructionPage />}
                      />
                      <Route
                        path="take/:assignmentId"
                        element={<AssignmentTakePage />}
                      />
                      <Route
                        path="results/:assignmentId"
                        element={<AssignmentResultsPage />}
                      />
                      <Route
                        path=":assignmentId/submit"
                        element={<AssignmentSubmit />}
                      />
                      <Route
                        path=":assignmentId/submissions"
                        element={<AssignmentSubmissions />}
                      />
                    </Route>

                    <Route path="essay">
                      <Route
                        path="instruction/:essayId"
                        element={<EssayInstructionPage />}
                      />
                      <Route path="take/:essayId" element={<EssayTakePage />} />
                      <Route
                        path="results/:essayId"
                        element={<EssayResultsPage />}
                      />
                    </Route>

                    <Route path="debate">
                      <Route
                        path="instruction/:debateId"
                        element={<DebateInstructionPage />}
                      />
                      <Route
                        path="take/:debateId"
                        element={<DebateTakePage />}
                      />
                      <Route path=":debateId" element={<DebateView />} />
                    </Route>

                    <Route path="survey">
                      <Route
                        path="instruction/:surveyId"
                        element={<SurveyInstructionPage />}
                      />
                      <Route
                        path=":moduleId/:surveyId"
                        element={<SurveyView />}
                      />
                    </Route>

                    {/* Group routes */}
                    <Route path="groups">
                      <Route index element={<Groups />} />
                      <Route path=":groupId/*" element={<GroupLayout />}>
                        <Route path="news" element={<NewsPage />} />
                        <Route path="members" element={<MembersPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route
                          path="announcements"
                          element={<AnnouncementsPage />}
                        />
                        <Route path="*" element={<NewsPage />} />
                      </Route>
                    </Route>

                    <Route
                      path="sponsor-center"
                      element={<SponsorCenterLayout />}
                    >
                      <Route index element={<SponsorRequestPage />} />
                      <Route path="submit" element={<SponsorRequestPage />} />
                      <Route
                        path="submit/description"
                        element={<SponsorRequestDescriptionPage />}
                      />
                      <Route path="my-ads" element={<MySponsorAdsPage />} />
                      <Route
                        path="analytics"
                        element={<SponsorAnalyticsPage />}
                      />
                    </Route>
                    <Route
                      path="sponsor-ad/:adId"
                      element={
                        <ProtectedRoute>
                          <SponsorAdDetailsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catalog and enrollment */}
                    <Route path="catalog">
                      <Route index element={<Catalog />} />
                      <Route path=":catalogId" element={<CatelogCourses />} />
                    </Route>
                    <Route
                      path="course-enrollment/:courseId"
                      element={<CourseEnrollment />}
                    />
                    <Route
                      path="payment-success/:courseId"
                      element={<PaymentSuccess />}
                    />
                    <Route
                      path="payment-failed/:courseId"
                      element={<PaymentFailed />}
                    />

                    {/* User related routes */}
                    <Route path="profile" element={<Profile />} />
                    <Route
                      path="avatar-picker"
                      element={<AvatarPickerPage />}
                    />
                    <Route path="progress" element={<Progress />} />
                    <Route path="messages" element={<Messages />} />

                    {/* Other dashboard routes */}
                    <Route
                      path="certificate/:courseId"
                      element={<CertificatePage />}
                    />
                    <Route
                      path="demo-quiz/:assessmentTitle"
                      element={<DemoQuizPage />}
                    />
                    <Route
                      path="class-recordings"
                      element={<ClassRecordings />}
                    />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="todo" element={<TodoPage />} />
                    <Route path="chatbot" element={<Chatbot />} />
                    <Route path="faqs" element={<FAQs />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="guides" element={<Guides />} />
                    <Route
                      path="termcondition"
                      element={<TermsAndConditions />}
                    />

                    {/* Support routes */}
                    <Route path="support">
                      <Route index element={<Support />} />
                      <Route path="ticket" element={<SupportTicket />} />
                      <Route path="tickets" element={<MyTickets />} />
                    </Route>
                  </Route>

                  {/* Catalog and enrollment */}
                  <Route path="catalog">
                    <Route index element={<Catalog />} />
                    <Route
                      path="category/:categoryName"
                      element={<CatelogCourses />}
                    />
                  </Route>
                  <Route
                    path="course-enrollment/:courseId"
                    element={<CourseEnrollment />}
                  />
                  <Route
                    path="payment-success/:courseId"
                    element={<PaymentSuccess />}
                  />
                  <Route
                    path="payment-failed/:courseId"
                    element={<PaymentFailed />}
                  />
                  <Route path="progress" element={<Progress />} />
                  {/* Duplicate top-level messages route removed to keep messages inside dashboard layout */}

                  <Route path="profile" element={<Profile />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="avatar-picker" element={<AvatarPickerPage />} />
                  <Route path="faqs" element={<FAQs />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="todo" element={<TodoPage />} />
                  <Route path="support" element={<Support />} />
                  <Route path="guides" element={<Guides />} />
                  <Route path="support/ticket" element={<SupportTicket />} />
                  <Route path="support/tickets" element={<MyTickets />} />
                  <Route path="instructor" element={<Instructorpage />} />
                  <Route path="add-users" element={<AddUsersPage />} />

                  {/* AI Course Creator Route - Fullscreen */}
                  <Route
                    path="/ai-course-creator"
                    element={
                      <ProtectedRoute>
                        <AICourseCreator />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                  <Route
                    path="/speechify-reader"
                    element={<SpeechifyReaderView />}
                  />
                  <Route
                    path="/modern-lesson-demo"
                    element={<ModernLessonDemo />}
                  />
                  <Route path="/games" element={<Games />} />
                </Routes>
                <PageTransitionOverlay />
                <Toaster />
              </UserSponsorProvider>
            </SponsorAdsProvider>
          </CreditsProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Helper wrapper to extract courseId param and wrap children in CourseTimerProvider
import {
  useParams,
  Routes as SubRoutes,
  Route as SubRoute,
} from 'react-router-dom';
function CourseTimerProviderWrapper() {
  const { courseId } = useParams();
  return (
    <CourseTimerProvider courseId={courseId}>
      <SubRoutes>
        <SubRoute index element={<CourseView />} />
        <SubRoute path="modules/:moduleId/lessons" element={<LessonView />} />
        <SubRoute
          path="module/:moduleId/lessons"
          element={<ModuleLessonsView />}
        />
        <SubRoute
          path="module/:moduleId/assessments"
          element={<ModuleAssessmentsView />}
        />
        <SubRoute
          path="module/:moduleId/lesson/:lessonId"
          element={<LessonView />}
        />
        <SubRoute
          path="module/:moduleId/lesson/:lessonId/detail"
          element={<LessonDetail />}
        />
        {/* Add more subroutes as needed */}
      </SubRoutes>
    </CourseTimerProvider>
  );
}

// Always scroll to top on route change (prevents landing mid-page after navigation)
function ScrollToTop() {
  const location = useLocation();
  React.useEffect(() => {
    // If navigating to a hash, let the browser handle it; otherwise scroll to top
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);
  return null;
}

export default App;

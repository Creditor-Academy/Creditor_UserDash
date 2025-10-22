import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import CreateCourse from "./CreateCourse";
import CourseLessonsPage from "./CourseLessonsPage";
import AddEvent from "./AddEvent";
import AddCatelog from "./AddCatelog";
import AddUsersForm from "./AddUsersPage";
import ManageUsers from "./ManageUsers";
import AddQuiz from "./AddQuiz";
import AddGroups from "./AddGroups";
import SupportTickets from "./Support";
import Resources from "@/components/Resources";
import AdminPayments from "@/components/credits/AdminPayments";
import CourseActivityAnalytics from "@/pages/CourseActivityAnalytics";
import PrivateGroupsAdmin from "@/components/messages/PrivateGroupsAdmin";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FaBook, 
  FaUsers, 
  FaBookOpen, 
  FaEdit, 
  FaFolder, 
  FaCalendarAlt,
  FaTicketAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileAlt,
  FaImages,
  FaCreditCard,
  FaChartLine
} from "react-icons/fa";

const InstructorPage = () => {
  const { isInstructorOrAdmin } = useAuth();
  const isAllowed = isInstructorOrAdmin();
  const [collapsed, setCollapsed] = useState(true); // Start with sidebar collapsed
  const [userManagementView, setUserManagementView] = useState(() => {
    const saved = localStorage.getItem("userManagementView");
    return saved || "add";
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/course-management')) return 'course';
    if (path.includes('/user-management')) return 'users';
    if (path.includes('/course-catalog')) return 'catalog';
    if (path.includes('/create-quiz')) return 'quiz';
    if (path.includes('/course-lessons')) return 'lessons';
    if (path.includes('/group-management')) return 'groups';
    if (path.includes('/event-management')) return 'events';
    if (path.includes('/support-tickets')) return 'tickets';
    if (path.includes('/assets')) return 'resources';
    if (path.includes('/payments')) return 'payments';
    return 'course'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    localStorage.setItem("userManagementView", userManagementView);
  }, [userManagementView]);
  
  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);
  
  // Redirect to default section if on base instructor path
  useEffect(() => {
    if (location.pathname === '/instructor') {
      navigate('/instructor/course-management', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // Navigation handlers
  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };
  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-yellow-50 border-l-8 border-yellow-400 p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-yellow-500">
                <FaExclamationTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-1">
                  Access Restricted
                </h3>
                <p className="text-yellow-700">
                  This page is only accessible to authorized instructors or
                  admins. Please contact support if you believe this is an
                  error.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-4 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FaArrowLeft /> Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
      {/* Main Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Sub Sidebar - Always show when on instructor page */}
      <div 
        className="fixed top-0 h-screen z-20 bg-white shadow-sm border-r border-gray-200 transition-all duration-300 overflow-y-auto w-52"
        style={{
          left: collapsed ? "4.5rem" : "17rem"
        }}
      >
        {/* Sub Sidebar Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">Instructor Tools</h2>
          <p className="text-xs text-gray-500">Manage your content</p>
        </div>

        {/* Sub Sidebar Navigation */}
        <div className="flex flex-col p-4 gap-3 text-sm">
          <button 
            onClick={() => handleNavigation("course", "/instructor/course-management")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "course" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaBook /> Course Management
          </button>
          <button 
            onClick={() => handleNavigation("users", "/instructor/user-management")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "users" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaUsers /> User Management
          </button>
          <button 
            onClick={() => handleNavigation("catalog", "/instructor/course-catalog")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "catalog" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaBookOpen /> Course Catalog
          </button>
          <button 
            onClick={() => handleNavigation("quiz", "/instructor/create-quiz")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "quiz" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaEdit /> Manage Assessments
          </button>
          <button 
            onClick={() => handleNavigation("lessons", "/instructor/course-lessons")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "lessons" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaFileAlt /> Course Lessons
          </button>
          <button 
            onClick={() => handleNavigation("groups", "/instructor/group-management")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "groups" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaUsers /> Group Management
          </button>
          <button 
            onClick={() => handleNavigation("events", "/instructor/event-management")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "events" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaCalendarAlt /> Event Management
          </button>
          <button 
            onClick={() => handleNavigation("tickets", "/instructor/support-tickets")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "tickets" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaTicketAlt /> Support Tickets
          </button>
          <button 
            onClick={() => handleNavigation("resources", "/instructor/assets")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "resources" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaImages /> Assets
          </button>
          <button 
            onClick={() => handleNavigation("payments", "/instructor/payments")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "payments" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaCreditCard /> Payments
          </button>
          <button 
            onClick={() => setActiveTab("analytics")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "analytics" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaChartLine /> Course Analytics
          </button>
          <button 
            onClick={() => setActiveTab("adminPrivateGroups")} 
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "adminPrivateGroups" 
                ? "bg-blue-100 text-blue-700 font-semibold" 
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaUsers /> Private Groups (Admin)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ 
          marginLeft: collapsed ? "calc(4.5rem + 13rem)" : "calc(17rem + 13rem)"
        }}
      >
        <header
          className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 h-16 transition-all duration-300"
          style={{ 
            marginLeft: collapsed ? "calc(4.5rem + 13rem)" : "calc(17rem + 13rem)"
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <DashboardHeader sidebarCollapsed={collapsed} />
          </div>
        </header>

        {/* Fixed Dashboard Header */}
        <div 
          className="fixed bg-white/95 border-b border-gray-200/60 backdrop-blur-md z-10 transition-all duration-300"
          style={{ 
            top: '4rem',
            left: collapsed ? "calc(4.5rem + 13rem)" : "calc(17rem + 13rem)",
            right: '0'
          }}
        >
          <div className="max-w-7xl mx-auto w-full px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-blue-600/20">
                    <FaBook className="text-white text-lg" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                    Instructor Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 leading-tight">
                    Manage your courses, users, SCORM, lessons, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingTop: '8rem' }}>
          <div className="max-w-7xl mx-auto w-full px-6 pb-14 pt-6">

            {/* Tabs Content */}
            {activeTab === "course" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CreateCourse />
              </section>
            )}

            {activeTab === "users" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setUserManagementView("add")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      userManagementView === "add"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FaUsers /> Add Users
                  </button>
                  <button
                    onClick={() => setUserManagementView("manage")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      userManagementView === "manage"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FaUsers /> Manage Users
                  </button>
                </div>
                {userManagementView === "add" ? <AddUsersForm /> : <ManageUsers />}
              </section>
            )}

            {activeTab === "catalog" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddCatelog />
              </section>
            )}

            {activeTab === "quiz" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddQuiz />
              </section>
            )}


            {activeTab === "lessons" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CourseLessonsPage />
              </section>
            )}

            {activeTab === "groups" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddGroups />
              </section>
            )}

            {activeTab === "events" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddEvent />
              </section>
            )}
            {activeTab === "tickets" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <SupportTickets />
              </section>
            )}
            {activeTab === "resources" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Resources />
              </section>
            )}
            {activeTab === "payments" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AdminPayments />
              </section>
            )}
            {activeTab === "analytics" && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CourseActivityAnalytics />
              </section>
            )}
          {activeTab === "adminPrivateGroups" && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <PrivateGroupsAdmin />
            </section>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;
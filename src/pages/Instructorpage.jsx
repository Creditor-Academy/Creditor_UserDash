import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import CourseLessonsPage from './CourseLessonsPage';
import AddEvent from './AddEvent';
import AddCatelog from './AddCatelog';
import AddUsersForm from './AddUsersPage';
import ManageUsers from './ManageUsers';
import AddQuiz from './AddQuiz';
import AddGroups from './AddGroups';
import SupportTickets from './Support';
import Resources from '@/components/Resources';
import AdminPayments from '@/components/credits/AdminPayments';
import CourseActivityAnalytics from '@/pages/CourseActivityAnalytics';
import InstructorFeedbackAnalysis from '@/pages/InstructorFeedbackAnalysis';
import PrivateGroupsAdmin from '@/components/messages/PrivateGroupsAdmin';
import StorageTokens from './StorageTokens';
// import CompactTokenDisplay from '@/components/courses/CompactTokenDisplay'; // commented AI token box reference
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { api } from '@/services/apiClient';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  FaBook,
  FaUsers,
  FaBookOpen,
  FaEdit,
  FaCalendarAlt,
  FaTicketAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileAlt,
  FaImages,
  FaCreditCard,
  FaChartLine,
  FaStar,
  FaCloud,
} from 'react-icons/fa';

const InstructorPage = () => {
  const { isInstructorOrAdmin, hasRole } = useAuth();
  const { userProfile } = useUser();
  const isAllowed = isInstructorOrAdmin();
  const [collapsed, setCollapsed] = useState(true); // Start with sidebar collapsed
  const [userManagementView, setUserManagementView] = useState(() => {
    const saved = localStorage.getItem('userManagementView');
    return saved || 'add';
  });
  const [storageUsage, setStorageUsage] = useState({ used: null, total: null });
  const [isStorageLoading, setIsStorageLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/course-old')) return 'lessons';
    if (path.includes('/user-management')) return 'users';
    if (path.includes('/course-catalog')) return 'catalog';
    if (path.includes('/create-quiz')) return 'quiz';
    if (path.includes('/course-management')) return 'lessons';
    if (path.includes('/group-management')) return 'groups';
    if (path.includes('/event-management')) return 'events';
    if (path.includes('/support-tickets')) return 'tickets';
    if (path.includes('/assets')) return 'resources';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/feedback-analysis')) return 'feedback';
    if (path.includes('/storage-tokens') && hasRole('admin')) return 'storage';
    return 'lessons'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    localStorage.setItem('userManagementView', userManagementView);
  }, [userManagementView]);

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    const isStorageRoute = location.pathname.includes('/storage-tokens');
    if (isStorageRoute && !hasRole('admin')) {
      navigate('/instructor/payments', { replace: true });
    }
  }, [location.pathname, hasRole, navigate]);

  // Redirect to default section if on base instructor path
  useEffect(() => {
    if (location.pathname === '/instructor') {
      navigate('/instructor/course-management', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Fetch storage usage for compact display in header
  useEffect(() => {
    const orgId =
      userProfile?.organization_id ||
      userProfile?.org_id ||
      userProfile?.organizationId ||
      userProfile?.organization?.id ||
      localStorage.getItem('orgId');

    if (!orgId) return;

    const fetchStorage = async () => {
      try {
        setIsStorageLoading(true);
        const resp = await api.get(`/api/org/SingleOrg/${orgId}`);
        const data = resp?.data?.data || resp?.data;
        if (!data) return;
        const used = Number(data.storage) || 0;
        const total = Number(data.storage_limit) || 0;
        setStorageUsage({ used, total });
      } catch (error) {
        console.error('Failed to fetch storage usage for header', error);
      } finally {
        setIsStorageLoading(false);
      }
    };

    fetchStorage();
  }, [userProfile]);

  const formatStorageDisplay = (usedBytes, totalRaw) => {
    if (
      usedBytes === null ||
      usedBytes === undefined ||
      totalRaw === null ||
      totalRaw === undefined
    ) {
      return null;
    }

    const usedGb = usedBytes / Math.pow(1024, 3);
    // storage_limit from API can be sent either as GB or bytes; if it's a small number, treat as GB
    const totalGb =
      totalRaw > 1024 * 1024 * 1024 ? totalRaw / Math.pow(1024, 3) : totalRaw;

    const fmt = val => {
      if (Number.isNaN(val)) return null;
      return `${val.toFixed(val >= 10 ? 0 : 1)} GB`;
    };

    const usedText = fmt(usedGb);
    const totalText = fmt(totalGb);

    if (!usedText || !totalText) return null;
    return `${usedText} / ${totalText}`;
  };

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
      <div className="fixed top-0 left-0 h-screen z-[1]">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Sub Sidebar - Always show when on instructor page */}
      <div
        className="fixed top-0 h-screen z-[2] bg-white shadow-sm border-r border-gray-200 transition-all duration-300 overflow-y-auto w-52"
        style={{
          left: collapsed ? '4.5rem' : '17rem',
        }}
      >
        {/* Sub Sidebar Header */}
        <div className="sticky top-0 z-[1] bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Instructor Tools
          </h2>
          <p className="text-xs text-gray-500">Manage your content</p>
        </div>

        {/* Sub Sidebar Navigation */}
        <div className="flex flex-col p-4 gap-3 text-sm">
          <button
            onClick={() =>
              handleNavigation('lessons', '/instructor/course-management')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'lessons'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaFileAlt /> Course Management
          </button>
          {/* <button
            onClick={() =>
              handleNavigation('course', '/instructor/course-old')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'course'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaBook /> Course old
          </button> */}
          <button
            onClick={() =>
              handleNavigation('users', '/instructor/user-management')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaUsers /> User Management
          </button>
          <button
            onClick={() =>
              handleNavigation('catalog', '/instructor/course-catalog')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaBookOpen /> Course Catalog
          </button>
          <button
            onClick={() => handleNavigation('quiz', '/instructor/create-quiz')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaEdit /> Manage Assessments
          </button>

          <button
            onClick={() =>
              handleNavigation('groups', '/instructor/group-management')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaUsers /> Group Management
          </button>
          <button
            onClick={() =>
              handleNavigation('events', '/instructor/event-management')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaCalendarAlt /> Event Management
          </button>
          <button
            onClick={() =>
              handleNavigation('tickets', '/instructor/support-tickets')
            }
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaTicketAlt /> Support Tickets
          </button>
          <button
            onClick={() => handleNavigation('resources', '/instructor/assets')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaImages /> Assets
          </button>
          <button
            onClick={() => handleNavigation('payments', '/instructor/payments')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaCreditCard /> Payments
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaStar /> Feedback Analysis
          </button>
          {hasRole('admin') && (
            <button
              onClick={() =>
                handleNavigation('storage', '/instructor/storage-tokens')
              }
              className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'storage'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaCloud /> Storage & Tokens
            </button>
          )}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaChartLine /> Course Analytics
          </button>
          <button
            onClick={() => setActiveTab('adminPrivateGroups')}
            className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'adminPrivateGroups'
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
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
          marginLeft: collapsed
            ? 'calc(4.5rem + 13rem)'
            : 'calc(17rem + 13rem)',
        }}
      >
        <header
          className="fixed top-0 left-0 right-0 z-[3] bg-white border-b border-gray-200 h-16 transition-all duration-300"
          style={{
            marginLeft: collapsed
              ? 'calc(4.5rem + 13rem)'
              : 'calc(17rem + 13rem)',
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <DashboardHeader sidebarCollapsed={collapsed} />
          </div>
        </header>

        {/* Fixed Dashboard Header */}
        <div
          className="fixed bg-white/95 border-b border-gray-200/60 backdrop-blur-md z-[3] transition-all duration-300"
          style={{
            top: '4rem',
            left: collapsed ? 'calc(4.5rem + 13rem)' : 'calc(17rem + 13rem)',
            right: '0',
          }}
        >
          <div className="max-w-7xl mx-auto w-full px-6 py-5">
            <div className="flex items-center justify-between gap-4">
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
              {/* AI token box (CompactTokenDisplay) retained for reference */}

              {/* <div className="flex-shrink-0">
                <CompactTokenDisplay />
              </div> */}

              <div className="flex-shrink-0">
                {/* AI token chip temporarily replaced with storage usage */}
                <div className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold">
                    <FaCloud />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-gray-500 font-semibold">
                      Storage
                    </span>
                    {isStorageLoading ? (
                      <span className="text-sm text-gray-600">Loading…</span>
                    ) : formatStorageDisplay(
                        storageUsage.used,
                        storageUsage.total
                      ) ? (
                      <span className="text-sm font-semibold text-gray-900">
                        {formatStorageDisplay(
                          storageUsage.used,
                          storageUsage.total
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingTop: '8rem' }}>
          <div className="max-w-7xl mx-auto w-full px-6 pb-14 pt-6">
            {/* Tabs Content */}
            {/* Course Management temporarily disabled */}
            {/* {activeTab === 'course' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CreateCourse />
              </section>
            )} */}

            {activeTab === 'users' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setUserManagementView('add')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      userManagementView === 'add'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaUsers /> Add Users
                  </button>
                  <button
                    onClick={() => setUserManagementView('manage')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      userManagementView === 'manage'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaUsers /> Manage Users
                  </button>
                </div>
                {userManagementView === 'add' ? (
                  <AddUsersForm />
                ) : (
                  <ManageUsers />
                )}
              </section>
            )}

            {activeTab === 'catalog' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddCatelog />
              </section>
            )}

            {activeTab === 'quiz' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddQuiz />
              </section>
            )}

            {activeTab === 'lessons' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CourseLessonsPage />
              </section>
            )}

            {activeTab === 'groups' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddGroups />
              </section>
            )}

            {activeTab === 'events' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AddEvent />
              </section>
            )}
            {activeTab === 'tickets' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <SupportTickets />
              </section>
            )}
            {activeTab === 'resources' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Resources />
              </section>
            )}
            {activeTab === 'payments' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <AdminPayments />
              </section>
            )}
            {activeTab === 'feedback' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <InstructorFeedbackAnalysis />
              </section>
            )}
            {hasRole('admin') && activeTab === 'storage' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <StorageTokens />
              </section>
            )}
            {activeTab === 'analytics' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <CourseActivityAnalytics />
              </section>
            )}
            {activeTab === 'adminPrivateGroups' && (
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

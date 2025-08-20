import React, { useRef, useState, useEffect } from "react";
import ProgressStats from "@/components/dashboard/ProgressStats";
import CourseCard from "@/components/dashboard/CourseCard";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, GraduationCap, Target, Clock, ChevronLeft, CheckCircle, Search, MonitorPlay, Award, Video } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardCarousel from "@/components/dashboard/DashboardCarousel";
import UpcomingCourses from "@/pages/UpcomingCourses";
import DashboardCalendar from "@/components/dashboard/DashboardCalendar";
import DashboardTodo from "@/components/dashboard/DashboardTodo";
import MonthlyProgress from "@/components/dashboard/MonthlyProgress";
import DashboardAnnouncements from "@/components/dashboard/DashboardAnnouncements";
import LiveClasses from "@/components/dashboard/LiveClasses";
import axios from "axios";
import { fetchUserCourses, fetchCourseModules } from '../services/courseService';
import { useUser } from '@/contexts/UserContext';
import { getAuthHeader } from '../services/authHeader'; // adjust path as needed

export function Dashboard() {
  const { userProfile } = useUser();
  // Dashboard data structure based on backend getUserOverview endpoint
  // Expected response structure:
  // {
  //   summary: { activeCourses, completedCourses, totalLearningHours, averageProgress },
  //   weeklyPerformance: { studyHours, lessonsCompleted },
  //   monthlyProgressChart: [...],
  //   learningActivities: [...]
  // }
  // 
  // NOTE: Using the working endpoints from your backend:
  // - /api/course/getCourses - for user courses
  // - /api/user/getUserProfile - for user profile
  // 
  // The dashboard shows basic stats based on available data.
  // Progress tracking, time tracking, and detailed analytics will be added
  // when those features are implemented in the backend.
  const [dashboardData, setDashboardData] = useState({
    summary: {
      activeCourses: 0,
      completedCourses: 0,
      totalLearningHours: 0,
      averageProgress: 0
    },
    weeklyPerformance: {
      studyHours: 0,
      lessonsCompleted: 0
    },
    monthlyProgressChart: [],
    learningActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userCourses, setUserCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [userCoursesMap, setUserCoursesMap] = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://creditor-backend-testing-branch.onrender.com";
  // Get userId from localStorage or cookies, or fetch from profile
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const fetchUserOverview = async () => {
    try {
      setLoading(true);
      
      // Get userId - use from context if available, otherwise fetch from profile
      let currentUserId = userId;
      if (!currentUserId && userProfile) {
        currentUserId = userProfile.id;
        setUserId(currentUserId);
        localStorage.setItem('userId', currentUserId);
      } else if (!currentUserId) {
        currentUserId = await fetchUserProfile();
      }
      
      if (!currentUserId) {
        throw new Error('Unable to get user ID. Please log in again.');
      }
      
      // Use the working endpoints from your backend
      try {
        // console.log('🔍 Fetching user courses from:', `${API_BASE}/api/course/getCourses`);
        // console.log('👤 User ID:', currentUserId);
        
        // Get user courses using the correct endpoint - backend's HttpOnly token cookie will be automatically sent
        const userCoursesResponse = await axios.get(`${API_BASE}/api/course/getCourses`, {
          headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  },
  credentials: 'include',
});
        
        if (userCoursesResponse.data && userCoursesResponse.data.data) {
          const courses = userCoursesResponse.data.data;
          
          // Calculate basic dashboard stats from available data
          const activeCourses = courses.length;
          const completedCourses = 0; // Will be calculated when progress tracking is implemented
          const totalLearningHours = 0; // Will be calculated when time tracking is implemented
          const averageProgress = 0; // Will be calculated when progress tracking is implemented
          
                      const newDashboardData = {
              summary: {
                activeCourses,
                completedCourses,
                totalLearningHours,
                averageProgress
              },
              weeklyPerformance: {
                studyHours: 0, // Will be calculated when time tracking is implemented
                lessonsCompleted: activeCourses
              },
              monthlyProgressChart: [],
              learningActivities: []
            };
            
            setDashboardData(newDashboardData);
        } else {
          // No courses found, set default values
          setDashboardData({
            summary: {
              activeCourses: 0,
              completedCourses: 0,
              totalLearningHours: 0,
              averageProgress: 0
            },
            weeklyPerformance: {
              studyHours: 0,
              lessonsCompleted: 0
            },
            monthlyProgressChart: [],
            learningActivities: []
          });
        }
      } catch (coursesError) {
        console.error('❌ Failed to fetch user courses:', coursesError);
        console.error('❌ Error details:', {
          message: coursesError.message,
          status: coursesError.response?.status,
          data: coursesError.response?.data
        });
        // Set default values if endpoint fails
        setDashboardData({
          summary: {
            activeCourses: 0,
            completedCourses: 0,
            totalLearningHours: 0,
            averageProgress: 0
          },
          weeklyPerformance: {
            studyHours: 0,
            lessonsCompleted: 0
          },
          monthlyProgressChart: [],
          learningActivities: []
        });
      }
    } catch (err) {
      console.error('Error fetching user overview:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view this data.');
      } else if (err.response?.status === 404) {
        setError('User data not found. Please contact support.');
      } else {
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      }
      
      // Set default values if API fails
      setDashboardData({
        summary: {
          activeCourses: 0,
          completedCourses: 0,
          totalLearningHours: 0,
          averageProgress: 0
        },
        weeklyPerformance: {
          studyHours: 0,
          lessonsCompleted: 0
        },
        monthlyProgressChart: [],
        learningActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always try to fetch user overview - UserContext handles authentication
    fetchUserOverview();
  }, [userId]);

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const data = await fetchUserCourses();
        // Fetch modules for each course and add modulesCount and totalDuration
        const coursesWithModules = await Promise.all(
          data.map(async (course) => {
            try {
              const modules = await fetchCourseModules(course.id);
              const modulesCount = modules.length;
              const totalDurationMins = modules.reduce((sum, m) => sum + (parseInt(m.estimated_duration, 10) || 0), 0);
              const totalDurationSecs = totalDurationMins * 60;
              return { 
                ...course, 
                modulesCount, 
                totalDurationSecs,
                // Ensure image field is set from thumbnail with proper fallbacks
                image: course.thumbnail || course.image || course.coverImage || course.course_image || course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
              };
            } catch {
              return { 
                ...course, 
                modulesCount: 0, 
                totalDurationSecs: 0,
                // Ensure image field is set from thumbnail with proper fallbacks
                image: course.thumbnail || course.image || course.coverImage || course.course_image || course.thumbnail_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
              };
            }
          })
        );
        setUserCourses(coursesWithModules);
      } catch (err) {
        setCoursesError('Failed to fetch courses');
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Monitor dashboard data changes
  useEffect(() => {
  }, [dashboardData]);

  // Fetch user profile to get userId and userName if not available
  const fetchUserProfile = async () => {
    try {
      // Backend's HttpOnly token cookie will be automatically sent with the request
      const response = await axios.get(`${API_BASE}/api/user/getUserProfile`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data && response.data.data && response.data.data.id) {
        const userProfile = response.data.data;
        setUserId(userProfile.id);
        localStorage.setItem('userId', userProfile.id);
        // Set user name for welcome message
        const name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
        setUserName(name || userProfile.email || "User");
        return userProfile.id;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  };

  // Use userProfile from context to set user name
  useEffect(() => {
    if (userProfile) {
      const name = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
      setUserName(name || userProfile.email || "User");
      setUserId(userProfile.id);
      localStorage.setItem('userId', userProfile.id);
    }
  }, [userProfile]);

  // Add retry functionality
  const handleRetry = () => {
    setError(null);
    fetchUserOverview();
  };

  const inProgressCourses = [
    {
      id: "1",
      title: "Constitutional Law Fundamentals",
      description: "Learn the essentials of US constitutional law including rights, powers, and judicial review.",
      image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=1000",
      progress: 62,
      lessonsCount: 42,
      category: "Legal Studies",
      duration: "25 hours"
    },
    {
      id: "2",
      title: "Civil Litigation Procedure",
      description: "Master the procedures and strategies involved in civil litigation in American courts.",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000",
      progress: 35,
      lessonsCount: 28,
      category: "Legal Practice",
      duration: "18 hours"
    },
    {
      id: "3",
      title: "Criminal Law and Procedure",
      description: "Study the principles of criminal law, defenses, and procedural requirements in the US justice system.",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1000",
      progress: 78,
      lessonsCount: 36,
      category: "Criminal Justice",
      duration: "22 hours"
    },
    {
      id: "4",
      title: "Intellectual Property Law",
      description: "Explore copyright, trademark, and patent law with real-world case studies.",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=1000",
      progress: 50,
      lessonsCount: 30,
      category: "IP Law",
      duration: "20 hours"
    },
    {
      id: "5",
      title: "Family Law Essentials",
      description: "Understand the basics of family law, including divorce, custody, and adoption.",
      image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1000",
      progress: 20,
      lessonsCount: 18,
      category: "Family Law",
      duration: "12 hours"
    },
    {
      id: "6",
      title: "International Business Law",
      description: "Gain insights into cross-border transactions, trade regulations, and dispute resolution.",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1000",
      progress: 10,
      lessonsCount: 25,
      category: "Business Law",
      duration: "16 hours"
    }
  ];

  const recommendedCourses = [
    // No upcoming courses at the moment
  ];

  // Carousel state for My Courses
  const courseScrollRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCards = 2;
  const totalCards = userCourses.length;

  const handleScroll = (direction) => {
    let newIndex = scrollIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex > totalCards - visibleCards) newIndex = totalCards - visibleCards;
    setScrollIndex(newIndex);
    if (courseScrollRef.current) {
      const cardWidth = courseScrollRef.current.firstChild?.offsetWidth || 320;
      const scrollAmount = newIndex * (cardWidth + 24); // 24px gap
      courseScrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">      
      <main className="flex-1">
        <div className="container py-6 max-w-7xl">
          {/* Top grid section - align greeting with latest updates */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 relative z-0">
            {/* Left section - greeting and latest updates */}
            <div className="xl:col-span-8 space-y-8">
              {/* Enhanced Greeting Section */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <div className="animate-gradient-shift absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10"></div>
                <div className="relative z-10 p-4 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="text-white" size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {`Welcome back${userName ? `, ${userName}` : ''}!`}
                      </h2>
                      <p className="text-gray-600 text-base">Continue your private education journey and achieve your learning goals.</p>
                    </div>
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-700 text-sm">Failed to load dashboard data</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRetry}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-blue-600" size={20} />
                        <span className="text-blue-600 font-semibold">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        {loading ? (
                          <div className="animate-pulse bg-blue-200 h-8 w-12 rounded"></div>
                        ) : (
                          dashboardData.summary?.completedCourses || 0
                        )}
                      </p>
                      <p className="text-blue-600 text-sm">Courses finished</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <Clock className="text-emerald-600" size={20} />
                        <span className="text-emerald-600 font-semibold">This Week</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">
                        {loading ? (
                          <div className="animate-pulse bg-emerald-200 h-8 w-12 rounded"></div>
                        ) : (
                          `${dashboardData.weeklyPerformance?.studyHours || 0}h`
                        )}
                      </p>
                      <p className="text-emerald-600 text-sm">Study Time</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center gap-2">
                        <BookOpen className="text-purple-600" size={20} />
                        <span className="text-purple-600 font-semibold">Active</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-700 mt-1">
                        {loading ? (
                          <div className="animate-pulse bg-purple-200 h-8 w-12 rounded"></div>
                        ) : (
                          dashboardData.summary?.activeCourses || 0
                        )}
                      </p>
                      <p className="text-purple-600 text-sm">Courses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Courses Section (carousel with arrows) */}
              <div className="mb-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
                  <Button variant="outline" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Link to="/dashboard/courses" className="flex items-center gap-2">
                      View all courses
                      <ChevronRight size={16} />
                    </Link>
                  </Button>
                </div>
                {/* Cards Row or Empty State */}
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading courses...</p>
                    </div>
                  </div>
                ) : userCourses && userCourses.length > 0 ? (
                  <div className="relative">
                    {/* Left Arrow */}
                    {scrollIndex > 0 && (
                      <button
                        onClick={() => handleScroll(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow-md p-2 hover:bg-blue-50 transition disabled:opacity-40"
                        style={{ marginLeft: '-24px' }}
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    {/* Cards Row */}
                    <div
                      ref={courseScrollRef}
                      className="flex gap-6 overflow-x-hidden scroll-smooth px-1"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {userCourses.map((course) => (
                        <div
                          key={course.id}
                          className="min-w-[320px] max-w-xs flex-shrink-0"
                        >
                          <CourseCard {...course} />
                        </div>
                      ))}
                    </div>
                    {/* Right Arrow */}
                    {scrollIndex < userCourses.length - visibleCards && userCourses.length > visibleCards && (
                      <button
                        onClick={() => handleScroll(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full shadow-md p-2 hover:bg-blue-50 transition disabled:opacity-40"
                        style={{ marginRight: '-24px' }}
                        aria-label="Scroll right"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <h3 className="text-lg font-medium mb-2">No courses enrolled</h3>
                    <p className="text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors duration-200"
                      onClick={() => window.location.href = '/dashboard/catalog'}
                    >
                      Click to view courses
                    </Button>
                  </div>
                )}
              </div>

              {/* Latest Updates Section */}
              {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Latest Updates</h3>
                </div>
                <DashboardCarousel />
              </div> */}

              {/* Your Progress */}
              {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Your Progress Overview</h3>
                <ProgressStats />
              </div> */}

              {/* Monthly Overview */}
              {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Learning Analytics</h3>
                <MonthlyProgress />
              </div> */}
            </div>
            
            {/* Right section - enhanced sidebar widgets */}
            <div className="xl:col-span-4 space-y-6">
              {/* Announcements*/}
              {/*<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Announcements</h3>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <DashboardAnnouncements />
              </div> */}

              {/* Calendar */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Your Calendar</h3>
                <div className="flex justify-center">
                  <DashboardCalendar />
                </div>
              </div>

              {/* Todo */}
              {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Tasks</h3>
                <DashboardTodo />
              </div> */}
            </div>
          </div>
              {/* Catalog Banner Section */}
          <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Featured Courses</h3>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Discover our comprehensive range of private education courses designed to empower your journey
              </p>
            </div>
            <DashboardCarousel />
          </div>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <MonitorPlay className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-800">Learning Sessions</h2>
              </div>
              <LiveClasses />
            </div>
          </div>
          <UpcomingCourses />
          {/* How It Works Section */}
          <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 mb-8">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Start your education journey in just three simple steps. Our platform makes learning accessible and effective.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 min-h-[320px] flex flex-col justify-between">
                <div className="absolute -top-5 left-4 sm:left-6 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold">1</span>
                </div>
                <div className="flex flex-col items-center text-center pt-8 sm:pt-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 transition-all">
                    <Search className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Choose a Course</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Browse our extensive catalog of private courses and select the one that matches your career goals.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="group relative bg-gradient-to-br from-purple-50 to-white p-4 sm:p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 min-h-[320px] flex flex-col justify-between">
                <div className="absolute -top-5 left-4 sm:left-6 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold">2</span>
                </div>
                <div className="flex flex-col items-center text-center pt-8 sm:pt-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-200 transition-all">
                    <MonitorPlay className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Learn Anytime</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Access high-quality video lectures, case studies, and interactive materials at your own pace.
                  </p>
                </div>
              </div>
              
              {/* Step 3 - Updated version without certification mention */}
              <div className="group relative bg-gradient-to-br from-green-50 to-white p-4 sm:p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 min-h-[320px] flex flex-col justify-between">
                <div className="absolute -top-5 left-4 sm:left-6 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold">3</span>
                </div>
                <div className="flex flex-col items-center text-center pt-8 sm:pt-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-200 transition-all">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Master the Material</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Complete lessons, apply your knowledge with practical exercises, and track your progress.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8 sm:mt-10">
            </div>
          </div>

          {/* Upcoming Courses */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Courses</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Advanced Legal Studies */}
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=1000"
                    alt="Advanced Legal Studies"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Advanced Legal Studies</h3>
                  <p className="text-gray-600 text-sm mb-3">Deep dive into complex legal frameworks and advanced case studies.</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Duration: 25 hours</span>
                    <span>Level: Advanced</span>
                  </div>
                </div>
              </div>

              {/* International Business Law */}
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1000"
                    alt="International Business Law"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">International Business Law</h3>
                  <p className="text-gray-600 text-sm mb-3">Master cross-border transactions and global business regulations.</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Duration: 20 hours</span>
                    <span>Level: Intermediate</span>
                  </div>
                </div>
              </div>

              {/* Digital Forensics */}
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-emerald-500 to-emerald-600 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
                    alt="Digital Forensics"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Digital Forensics</h3>
                  <p className="text-gray-600 text-sm mb-3">Learn modern digital investigation techniques and cybercrime analysis.</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Duration: 18 hours</span>
                    <span>Level: Advanced</span>
                  </div>
                </div>
              </div>

              {/* Environmental Law */}
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-500 to-orange-600 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000"
                    alt="Environmental Law"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Environmental Law</h3>
                  <p className="text-gray-600 text-sm mb-3">Explore sustainability regulations and environmental protection laws.</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Duration: 15 hours</span>
                    <span>Level: Intermediate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Features In Athena</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Group Message Feature */}
              <div className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80">
                {/* Banner Image - Always visible, fades on hover */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                  <img 
                    src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Group_messages.jpeg"
                    alt="Group Messages Feature"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Content - Appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Group Message</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Connect and collaborate effortlessly with multiple users in a single conversation.
                    </p>
                  </div>
                </div>
                
                {/* Default overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg">Group Message</h3>
                </div>
              </div>

              {/* Private Message Feature */}
              <div className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80">
                {/* Banner Image - Always visible, fades on hover */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                  <img 
                    src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Private_messages.jpeg"
                    alt="Private Messages Feature"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Content - Appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Private Message</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Communicate one-on-one with complete privacy and security.
                    </p>
                  </div>
                </div>
                
                {/* Default overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg">Private Message</h3>
                </div>
              </div>

              {/* Profile Picture Feature */}
              <div className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80">
                {/* Banner Image - Always visible, fades on hover */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                  <img 
                    src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Profile_picture.jpeg"
                    alt="Profile Picture Feature"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                {/* Content - Appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Profile Picture</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Personalize your account with a custom profile photo for easy recognition.
                    </p>
                  </div>
                </div>
                
                {/* Default overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg">Profile Picture</h3>
                </div>
            </div>
            
              {/* Notifications Feature */}
              <div className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80">
                {/* Banner Image - Always visible, fades on hover */}
                <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                  <img 
                    src="https://lesson-banners.s3.us-east-1.amazonaws.com/Recording-banners/Upcoming-Features/Notifications.jpeg"
                    alt="Notifications Feature"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                
                {/* Content - Appears on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-1.81 1.19zM4 6h16M4 10h16M4 14h16" />
                      </svg>
                  </div>
                    <h3 className="text-xl font-bold text-white mb-3">Notifications</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Stay updated in real time with instant alerts on important activities.
                    </p>
                  </div>
                </div>
                
                {/* Default overlay with title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg">Notifications</h3>
                </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

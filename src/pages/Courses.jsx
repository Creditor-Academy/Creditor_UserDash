import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { BookOpen, Clock, Filter, Search, Award, ChevronDown, ChevronRight, Lock, Play, FileText, Folder, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { fetchUserCourses, fetchCourseModules } from '../services/courseService';
import { getCourseTrialStatus } from '../utils/trialUtils';
import TrialBadge from '../components/ui/TrialBadge';
import TrialExpiredDialog from '../components/ui/TrialExpiredDialog';
import { useCredits } from '../contexts/CreditsContext';
import { useUser } from '../contexts/UserContext';
import { getUnlockedModulesByUser } from '../services/modulesService';
import api from '../services/apiClient';

export function Courses() {
  const { userProfile } = useUser();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [progressFilter, setProgressFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseModules, setCourseModules] = useState({});
  const [selectedExpiredCourse, setSelectedExpiredCourse] = useState(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [myLessons, setMyLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedFolderKey, setSelectedFolderKey] = useState(null);
  // Track modules currently being marked as complete
  const [markingCompleteIds, setMarkingCompleteIds] = useState(new Set());
  // Cache for complete module data to avoid repeated API calls
  const [completeModulesCache, setCompleteModulesCache] = useState({});
  // Track modules currently loading for Start Module
  const [loadingStartModuleIds, setLoadingStartModuleIds] = useState(new Set());

  // Helper to format seconds as HH:MM:SS
  function formatTime(secs) {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function parseDuration(durationStr) {
    if (!durationStr) return 0;
    // Format: "60 min"
    const minMatch = durationStr.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1], 10);

    // Format: "1h 45m"
    const hourMinMatch = durationStr.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i);
    if (hourMinMatch) {
      const hours = parseInt(hourMinMatch[1], 10);
      const mins = hourMinMatch[2] ? parseInt(hourMinMatch[2], 10) : 0;
      return hours * 60 + mins;
    }

    // Format: "15:30" (mm:ss or hh:mm)
    const colonMatch = durationStr.match(/(\d+):(\d+)/);
    if (colonMatch) {
      const first = parseInt(colonMatch[1], 10);
      const second = parseInt(colonMatch[2], 10);
      // If first > 10, assume mm:ss, else hh:mm
      if (first > 10) return first; // mm:ss, ignore seconds
      return first * 60 + second; // hh:mm
    }

    // Format: "8 min read"
    const minReadMatch = durationStr.match(/(\d+)\s*min read/);
    if (minReadMatch) return parseInt(minReadMatch[1], 10);

    return 0;
  }
  // Get time spent for all courses from localStorage
  const getCourseTimes = () => {
    const times = {};
    courses.forEach(course => {
      const t = localStorage.getItem(`course_time_${course.id}`);
      times[course.id] = t ? parseInt(t, 10) : 0;
    });
    return times;
  };
  const [courseTimes, setCourseTimes] = useState(getCourseTimes());
  // Update times when component mounts and when tab regains focus
  useEffect(() => {
    const updateTimes = () => setCourseTimes(getCourseTimes());
    window.addEventListener("focus", updateTimes);
    return () => window.removeEventListener("focus", updateTimes);
  }, []);
  // Update times when route changes to /courses
  useEffect(() => {
    if (location.pathname === "/courses") {
      setCourseTimes(getCourseTimes());
    }
  }, [location.pathname]);

  useEffect(() => {
    const selector = activeTab === 'courses' ? '.course-card' : '.lesson-card';
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
        card.classList.remove('opacity-0');
      }, 100 * index);
    });
  }, [filteredCourses, myLessons, activeTab]);

  // Recording course IDs to filter out from My Courses
  const RECORDING_COURSE_IDS = [
    "a188173c-23a6-4cb7-9653-6a1a809e9914", // Become Private Recordings
    "7b798545-6f5f-4028-9b1e-e18c7d2b4c47", // Operate Private Recordings
    "199e328d-8366-4af1-9582-9ea545f8b59e", // Business Credit Recordings
    "d8e2e17f-af91-46e3-9a81-6e5b0214bc5e", // Private Merchant Recordings
    "d5330607-9a45-4298-8ead-976dd8810283", // Sovereignty 101 Recordings
    "814b3edf-86da-4b0d-bb8c-8a6da2d9b4df", // I Want Remedy Now Recordings
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Fetch courses with modules included in a single API call
        const data = await fetchUserCourses(true);
        
        // Filter out recording courses from My Courses
        const filteredData = data.filter(course => !RECORDING_COURSE_IDS.includes(course.id));
        
        // Process each course to add modulesCount, totalDuration, and trial status
        const processedCourses = filteredData.map(course => {
          const modules = course.modules || [];
          // Sum durations using 'estimated_duration' (in minutes)
          const totalDurationMins = modules.reduce((sum, m) => sum + (parseInt(m.estimated_duration, 10) || 0), 0);
          // Convert to seconds for formatTime
          const totalDurationSecs = totalDurationMins * 60;
          
          // Get trial status
          const trialStatus = getCourseTrialStatus(course);
          
          return {
            ...course,
            modulesCount: course._count?.modules || 0, 
            totalDurationSecs,
            image: course.thumbnail || course.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
            trialStatus
          };
        });
        
        setCourses(processedCourses);
        setFilteredCourses(processedCourses);
        
        // Pre-populate courseModules for expanded view
        const modulesMap = {};
        data.forEach(course => {
          if (course.modules) {
            modulesMap[course.id] = course.modules;
          }
        });
        setCourseModules(prev => ({
          ...prev,
          ...modulesMap
        }));
        
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);


  // Update trial status every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCourses(prevCourses => 
        prevCourses.map(course => ({
          ...course,
          trialStatus: getCourseTrialStatus(course)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCourseClick = (course) => {
    if (course.trialStatus.isInTrial && course.trialStatus.isExpired) {
      setSelectedExpiredCourse(course);
      setShowTrialDialog(true);
      return;
    }
    // Navigate to course normally
    window.location.href = `/dashboard/courses/${course.id}/modules`;
  };

  const handleCloseTrialDialog = () => {
    setShowTrialDialog(false);
    setSelectedExpiredCourse(null);
  };

  const handleViewModules = (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    
    // Modules are already loaded in the initial fetch
    // No need for additional API calls
  };

  useEffect(() => {
    let results = courses;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply progress filter
    if (progressFilter !== "all") {
      results = results.filter(course => {
        const progress = course.progress || 0;
        switch (progressFilter) {
          case "not-started":
            return progress === 0;
          case "in-progress":
            return progress > 0 && progress < 100;
          case "completed":
            return progress === 100;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      results = results.filter(course => course.category === categoryFilter);
    }

    setFilteredCourses(results);
  }, [courses, searchTerm, progressFilter, categoryFilter]);

  const folderSections = useMemo(() => {
    const buckets = {
      becomePrivate: [],
      operatePrivate: [],
      other: [],
    };

    filteredCourses.forEach((course) => {
      const title = course.title?.toLowerCase() || "";
      const category = course.category?.toLowerCase() || "";
      const slug = course.slug?.toLowerCase() || "";

      if (
        title.includes("become private") ||
        category.includes("become private") ||
        slug.includes("become-private")
      ) {
        buckets.becomePrivate.push(course);
      } else if (
        title.includes("operate private") ||
        category.includes("operate private") ||
        slug.includes("operate-private")
      ) {
        buckets.operatePrivate.push(course);
      } else {
        buckets.other.push(course);
      }
    });

    return {
      meta: [
        {
          key: "becomePrivate",
          title: "Become Private",
          helper: "Start your private journey",
          courses: buckets.becomePrivate,
        },
        {
          key: "operatePrivate",
          title: "Oprate Private",
          helper: "Operate with confidence",
          courses: buckets.operatePrivate,
        },
        {
          key: "other",
          title: "Other Courses",
          helper: "Everything else you unlocked",
          courses: buckets.other,
        },
      ],
      data: buckets,
    };
  }, [filteredCourses]);

  const renderCourseCard = (course) => (
    <div key={course.id} className="course-card opacity-0">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-200">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={course.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {/* Trial Badge Overlay */}
          {course.trialStatus.isInTrial && (
            <div className="absolute top-3 left-3">
              <TrialBadge timeRemaining={course.trialStatus.timeRemaining} />
            </div>
          )}
          {/* Lock Overlay for Expired Trials */}
          {course.trialStatus.isInTrial && course.trialStatus.isExpired && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Trial Expired</p>
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-base sm:text-lg line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm sm:text-base">{course.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{course.modulesCount || 0} modules</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Link to={`/dashboard/courses/${course.id}/modules`} className="flex-1">
              <Button variant="default" className="w-full text-sm sm:text-base">
                Continue Learning
              </Button>
            </Link>
          </div>

          {/* Trial Status Info */}
          {course.trialStatus.isInTrial && !course.trialStatus.isExpired && (
            <div className="text-xs text-center text-gray-600">
              Trial ends: {new Date(course.trialStatus.subscriptionEnd).toLocaleDateString()}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );



  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm sm:text-base">Loading courses...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">Error loading courses</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container py-4 sm:py-6 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">My Learning</h1>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button> */}
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'courses' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('courses')}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </div>
                {activeTab === 'courses' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
              <button
                className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'lessons' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={async () => {
                  setActiveTab('lessons');
                  if (!userProfile?.id) return;
                  setLoadingLessons(true);
                  try {
                    console.log('[UI] Fetch My Lessons for', userProfile.id);
                    const data = await getUnlockedModulesByUser(userProfile.id);
                    console.log('[UI] My Lessons count', Array.isArray(data) ? data.length : 'not-array');
                    setMyLessons(data);
                    
                    // Pre-load module data in background (non-blocking)
                    if (data && data.length > 0) {
                      console.log('[UI] Starting background pre-loading of module data');
                      const uniqueCourseIds = [...new Set(data.map(lesson => lesson.module?.course_id).filter(Boolean))];
                      
                      // Start pre-loading but don't wait for it
                      Promise.all(uniqueCourseIds.map(async (courseId) => {
                        try {
                          const modules = await fetchCourseModules(courseId);
                          return { courseId, modules };
                        } catch (error) {
                          console.warn(`Failed to pre-load modules for course ${courseId}:`, error);
                          return { courseId, modules: [] };
                        }
                      })).then(courseModulesResults => {
                        // Cache all module data
                        const newCache = {};
                        courseModulesResults.forEach(({ courseId, modules }) => {
                          modules.forEach(module => {
                            const cacheKey = `${courseId}-${module.id}`;
                            newCache[cacheKey] = module;
                          });
                        });
                        
                        setCompleteModulesCache(prev => ({ ...prev, ...newCache }));
                        console.log('[UI] Background pre-loaded and cached', Object.keys(newCache).length, 'modules');
                      }).catch(error => {
                        console.warn('[UI] Background pre-loading failed:', error);
                        // Don't show error to user, just log it
                      });
                    }
                    
                  } catch (e) {
                    console.error('[UI] My Lessons fetch error', e);
                    setMyLessons([]);
                  } finally {
                    setLoadingLessons(false);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  My Lessons
                  {loadingLessons && (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {activeTab === 'lessons' && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
            </div>
          </div>


          {/* Filters */}
          {/* {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Progress</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business Law">Business Law</option>
                    <option value="Legal Skills">Legal Skills</option>
                  </select>
                </div>
              </div>
            </div>
          )} */}

          {activeTab === 'courses' && (
            filteredCourses.length > 0 ? (
              <div className="space-y-4">
                {!selectedFolderKey ? (
                  <>
                    <div className="flex flex-col gap-4 lg:flex-row">
                      {folderSections.meta.map((section) => (
                        <button
                          key={section.key}
                          onClick={() => setSelectedFolderKey(section.key)}
                          className="flex-1 min-w-0 group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-blue-50/60 via-white to-transparent">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Folder className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                                  <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{section.helper}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {section.courses.length} {section.courses.length === 1 ? "Course" : "Courses"}
                              </Badge>
                            </div>
                            <div className="px-5 py-6 flex-1 flex items-center justify-center text-sm text-muted-foreground">
                              <span className="group-hover:text-gray-700 transition-colors">
                                Tap to open folder
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  (() => {
                    const activeSection = folderSections.meta.find((item) => item.key === selectedFolderKey);
                    if (!activeSection) {
                      return null;
                    }

                    return (
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-blue-50/60 via-white to-transparent">
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => setSelectedFolderKey(null)}
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                              <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-800">{activeSection.title}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{activeSection.helper}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {activeSection.courses.length} {activeSection.courses.length === 1 ? "Course" : "Courses"}
                          </Badge>
                        </div>
                        <div className="p-5">
                          {activeSection.courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {activeSection.courses.map((course) => renderCourseCard(course))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground text-sm py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/60">
                              <span>No courses available in this folder</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-medium">No courses found</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              </div>
            )
          )}

          {activeTab === 'lessons' && (
            <div>
              {loadingLessons ? (
                <div className="text-center py-10 text-sm text-gray-600">Loading your lessons...</div>
              ) : (
                (() => {
                  const combined = myLessons;
                  if (!combined || combined.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <h3 className="text-base sm:text-lg font-medium">No lessons unlocked yet</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">Unlock lessons from the catalog or course pages.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {combined.map((access) => {
                        const module = access.module;
                        const courseId = access.module?.course_id;
                        const isContentAvailable = !!module?.resource_url;
                        // Check if user_module_progress has any completed entries
                        const isCompleted = module?.user_module_progress && 
                          Array.isArray(module.user_module_progress) && 
                          module.user_module_progress.length > 0 &&
                          module.user_module_progress.some(progress => progress.completed === true);
                        
                        // Get complete module data from cache for better thumbnail and resource_url
                        const cacheKey = `${courseId}-${module?.id}`;
                        const completeModule = completeModulesCache[cacheKey];
                        const displayModule = completeModule || module; // Use complete module if available, fallback to original
                        
                        return (
                          <div key={`${access.user_id}-${access.module_id}`} className="opacity-0 lesson-card h-full">
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                            <div className="aspect-video relative overflow-hidden">
                              <img
                                  src={displayModule?.thumbnail || module?.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"}
                                  alt={displayModule?.title || module?.title || 'Lesson'}
                                className="w-full h-full object-cover"
                              />
                                {isCompleted && (
                                  <div className="absolute top-2 left-2">
                                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      Completed
                                    </div>
                                  </div>
                                )}
                                {/* Course name tag */}
                                <div className="absolute top-2 right-2">
                                  <div className="bg-white/90 text-gray-800 px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                                    {access.course?.title || 'Course'}
                                  </div>
                                </div>
                            </div>
                              
                              {/* Fixed height for content area, flex-grow to fill space */}
                              <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                                <CardHeader className="pb-2 px-0 pt-0">
                                  <CardTitle className="text-lg line-clamp-2 min-h-[56px]">{displayModule?.title || module?.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{displayModule?.description || module?.description}</p>
                            </CardHeader>
                                <CardContent className="space-y-3 px-0 pt-0 pb-0">
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <BookOpen size={14} />
                                      <span>Order: {module?.order || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={14} />
                                      <span>{module?.estimated_duration || 60} min</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                <span>Course: {access.course?.title}</span>
                                  </div>
                                </CardContent>
                              </div>
                              
                              {/* Footer always at the bottom */}
                              <div className="mt-auto px-6 pb-4">
                                <CardFooter className="p-0 flex flex-col gap-2">
                                  {/* Since these are unlocked lessons, they should always have content available */}
                              <Button 
                                    className="w-full disabled:opacity-60"
                                    disabled={loadingStartModuleIds.has(String(module?.id))}
                                    onClick={async () => {
                                      const idStr = String(module?.id);
                                      
                                      // Prevent multiple clicks
                                      if (loadingStartModuleIds.has(idStr)) return;
                                      
                                      setLoadingStartModuleIds(prev => {
                                        const next = new Set(prev);
                                        next.add(idStr);
                                        return next;
                                      });
                                      
                                      try {
                                        let completeModule = null;
                                        
                                        // Check cache first
                                        const cacheKey = `${courseId}-${module?.id}`;
                                        if (completeModulesCache[cacheKey]) {
                                          console.log('Using cached module data');
                                          completeModule = completeModulesCache[cacheKey];
                                        } else {
                                          console.log('Fetching complete module data for course:', courseId, 'module:', module?.id);
                                          const courseModules = await fetchCourseModules(courseId);
                                          completeModule = courseModules.find(m => m.id === module?.id);
                                          
                                          // Cache the result
                                          if (completeModule) {
                                            setCompleteModulesCache(prev => ({
                                              ...prev,
                                              [cacheKey]: completeModule
                                            }));
                                          }
                                        }
                                        
                                        console.log('Complete module data:', completeModule);
                                        
                                        // Get resource_url from complete module data
                                        let fullUrl = completeModule?.resource_url;
                                        
                                        // If still no resource_url, try from original module data as fallback
                                        if (!fullUrl) {
                                          fullUrl = module?.resource_url;
                                          console.log('Using fallback resource_url from original module:', fullUrl);
                                        }
                                        
                                        console.log('Final resource_url:', fullUrl);
                                  
                                  // If it's not already a full URL, prepend the API base URL
                                  if (fullUrl && !fullUrl.startsWith('http')) {
                                    fullUrl = `${import.meta.env.VITE_API_BASE_URL}${fullUrl}`;
                                  }
                                  
                                  // For S3 URLs, ensure they have the correct protocol
                                  if (fullUrl && fullUrl.includes('s3.amazonaws.com') && !fullUrl.startsWith('https://')) {
                                    fullUrl = fullUrl.replace('http://', 'https://');
                                  }
                                        
                                        console.log('Final URL to open:', fullUrl);
                                  
                                  // Open in new tab
                                  if (fullUrl) {
                                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                  } else {
                                          console.error('No resource URL found for module:', completeModule || module);
                                          alert('No content URL available for this lesson. Please contact support.');
                                        }
                                      } catch (error) {
                                        console.error('Error fetching module data:', error);
                                        alert('Failed to load lesson content. Please try again.');
                                      } finally {
                                        setLoadingStartModuleIds(prev => {
                                          const next = new Set(prev);
                                          next.delete(idStr);
                                          return next;
                                        });
                                      }
                                    }}
                                  >
                                    {loadingStartModuleIds.has(String(module?.id)) ? (
                                      <>
                                        <Clock size={16} className="mr-2 animate-spin" />
                                        Loading...
                                      </>
                                    ) : (
                                      <>
                                <Play size={16} className="mr-2" />
                                Start Module
                                      </>
                                    )}
                              </Button>
                                  <Link to={`/dashboard/courses/${courseId}/modules/${module?.id}/assessments`} className="w-full">
                                <Button variant="outline" className="w-full">
                                  <FileText size={16} className="mr-2" />
                                  Start Assessment
                                </Button>
                              </Link>
                                  {/* Mark as Complete - only show when not completed */}
                                  {!isCompleted ? (
                                    <Button
                                      variant="secondary"
                                      className="w-full disabled:opacity-60"
                                      disabled={markingCompleteIds.has(String(module?.id))}
                                      onClick={async () => {
                                        const idStr = String(module?.id);
                                        if (!courseId || !module?.id) return;
                                        
                                        // Prevent duplicate clicks
                                        if (markingCompleteIds.has(idStr)) return;
                                        
                                        setMarkingCompleteIds(prev => {
                                          const next = new Set(prev);
                                          next.add(idStr);
                                          return next;
                                        });
                                        
                                        try {
                                          console.log('Marking module as complete:', courseId, module?.id);
                                          await api.post(`/api/course/${courseId}/modules/${module?.id}/mark-complete`);
                                          
                                          // Update the local state to reflect completion
                                          setMyLessons(prev => prev.map(lesson => 
                                            lesson.module_id === access.module_id 
                                              ? { ...lesson, completed: true }
                                              : lesson
                                          ));
                                          
                                          console.log('Module marked as complete successfully');
                                        } catch (err) {
                                          console.error('Failed to mark module as complete', err);
                                          alert('Failed to mark lesson as complete. Please try again.');
                                        } finally {
                                          setMarkingCompleteIds(prev => {
                                            const next = new Set(prev);
                                            next.delete(idStr);
                                            return next;
                                          });
                                        }
                                      }}
                                    >
                                      {markingCompleteIds.has(String(module?.id)) ? 'Marking...' : 'Mark as Complete'}
                                    </Button>
                                  ) : (
                                    <div className="w-full flex items-center justify-center">
                                      <Badge className="px-3 py-1">Completed</Badge>
                                    </div>
                                  )}
                            </CardFooter>
                              </div>
                          </Card>
                        </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Trial Expired Dialog */}
      <TrialExpiredDialog 
        isOpen={showTrialDialog}
        onClose={handleCloseTrialDialog}
        course={selectedExpiredCourse}
      />
    </div>
  );
}

export default Courses;
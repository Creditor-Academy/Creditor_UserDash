import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  BookOpen,
  Clock,
  Filter,
  Search,
  Award,
  ChevronDown,
  ChevronRight,
  Lock,
  Play,
  FileText,
} from "lucide-react";
import { Input } from "../components/ui/input";
import {
  fetchUserCourses,
  fetchCourseModules,
} from "../services/courseService";
import { getCourseTrialStatus } from "../utils/trialUtils";
import TrialBadge from "../components/ui/TrialBadge";
import TrialExpiredDialog from "../components/ui/TrialExpiredDialog";
import { useCredits } from "../contexts/CreditsContext";
import { useUser } from "../contexts/UserContext";
import { useSponsorAds } from "@/contexts/SponsorAdsContext";
import SponsorAdCard from "@/components/sponsorAds/SponsorAdCard";
import { useAuth } from "@/contexts/AuthContext";
import { getUnlockedModulesByUser } from "../services/modulesService";
import api from "../services/apiClient";

export function Courses() {
  const { userProfile } = useUser();
  const { userRole } = useAuth();
  const { getPrimaryAdForPlacement } = useSponsorAds();
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
  const [activeTab, setActiveTab] = useState("courses");
  const [myLessons, setMyLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  // Track modules currently being marked as complete
  const [markingCompleteIds, setMarkingCompleteIds] = useState(new Set());
  // Cache for complete module data to avoid repeated API calls
  const [completeModulesCache, setCompleteModulesCache] = useState({});
  // Helper to format seconds as HH:MM:SS
  function formatTime(secs) {
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function parseDuration(durationStr) {
    if (!durationStr) return 0;
    // Format: "60 min"
    const minMatch = durationStr.match(/(\d+)\s*min/);
    if (minMatch) return parseInt(minMatch[1], 10);

    // Format: "1h 45m"
    const hourMinMatch = durationStr.match(
      /(\d+)\s*h(?:ours?)?\s*(\d+)?\s*m?/i,
    );
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
    courses.forEach((course) => {
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
    const selector = activeTab === "courses" ? ".course-card" : ".lesson-card";
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-fade-in");
        card.classList.remove("opacity-0");
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
        const filteredData = data.filter(
          (course) => !RECORDING_COURSE_IDS.includes(course.id),
        );

        // Process each course to add modulesCount, totalDuration, and trial status
        const processedCourses = filteredData.map((course) => {
          const modules = course.modules || [];
          // Sum durations using 'estimated_duration' (in minutes)
          const totalDurationMins = modules.reduce(
            (sum, m) => sum + (parseInt(m.estimated_duration, 10) || 0),
            0,
          );
          // Convert to seconds for formatTime
          const totalDurationSecs = totalDurationMins * 60;

          // Get trial status
          const trialStatus = getCourseTrialStatus(course);

          return {
            ...course,
            modulesCount: course._count?.modules || 0,
            totalDurationSecs,
            image:
              course.thumbnail ||
              course.image ||
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
            trialStatus,
          };
        });

        setCourses(processedCourses);
        setFilteredCourses(processedCourses);

        // Pre-populate courseModules for expanded view
        const modulesMap = {};
        data.forEach((course) => {
          if (course.modules) {
            modulesMap[course.id] = course.modules;
          }
        });
        setCourseModules((prev) => ({
          ...prev,
          ...modulesMap,
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
      setCourses((prevCourses) =>
        prevCourses.map((course) => ({
          ...course,
          trialStatus: getCourseTrialStatus(course),
        })),
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
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply progress filter
    if (progressFilter !== "all") {
      results = results.filter((course) => {
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
      results = results.filter((course) => course.category === categoryFilter);
    }

    setFilteredCourses(results);
  }, [courses, searchTerm, progressFilter, categoryFilter]);

  // Shimmer skeleton component for loading state
  const CourseCardSkeleton = () => (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
      </div>

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="h-6 bg-gray-200 rounded-md mb-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded-md w-24 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex flex-col gap-2 flex-shrink-0">
        <div className="h-10 bg-gray-200 rounded-md w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
        </div>
      </CardFooter>
    </Card>
  );

  const courseListingAd = useMemo(
    () => getPrimaryAdForPlacement("course_listing_tile", { role: userRole }),
    [getPrimaryAdForPlacement, userRole],
  );

  const decoratedCourseList = useMemo(() => {
    if (!courseListingAd) {
      return filteredCourses.map((course) => ({
        type: "course",
        data: course,
      }));
    }
    if (filteredCourses.length === 0) {
      return [{ type: "ad", data: courseListingAd }];
    }
    const items = [];
    filteredCourses.forEach((course, index) => {
      items.push({ type: "course", data: course });
      if (index === 1) {
        items.push({ type: "ad", data: courseListingAd });
      }
    });
    if (!items.some((item) => item.type === "ad")) {
      items.splice(Math.min(1, items.length), 0, {
        type: "ad",
        data: courseListingAd,
      });
    }
    return items;
  }, [filteredCourses, courseListingAd]);

  const renderCourseTile = (course) => (
    <div key={course.id} className="course-card opacity-0">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={
              course.image ||
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
            }
            alt={course.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {course.trialStatus.isInTrial && (
            <div className="absolute top-3 left-3">
              <TrialBadge timeRemaining={course.trialStatus.timeRemaining} />
            </div>
          )}
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
          <CardTitle className="text-base sm:text-lg line-clamp-2">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm sm:text-base">
            {course.description}
          </CardDescription>
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
            <Link
              to={`/dashboard/courses/${course.id}/modules`}
              className="flex-1"
            >
              <Button variant="default" className="w-full text-sm sm:text-base">
                Continue Learning
              </Button>
            </Link>
          </div>
          {course.trialStatus.isInTrial && !course.trialStatus.isExpired && (
            <div className="text-xs text-center text-gray-600">
              Trial ends:{" "}
              {new Date(
                course.trialStatus.subscriptionEnd,
              ).toLocaleDateString()}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">My Learning</h1>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8 w-full"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  className="relative px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  disabled
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </div>
                </button>
                <button
                  className="relative px-6 py-3 text-sm font-medium rounded-lg bg-[#6164ec] text-white disabled:text-white/70"
                  disabled
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    My Modules
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
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
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">
                    Error loading courses
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">
                    {error}
                  </p>
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
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm gap-4">
              <button
                className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "courses"
                    ? "bg-[#6164ec] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("courses")}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </div>
                {activeTab === "courses" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
              <button
                className={`relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "lessons"
                    ? "bg-[#6164ec] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={async () => {
                  setActiveTab("lessons");
                  if (!userProfile?.id) return;
                  setLoadingLessons(true);
                  try {
                    console.log("[UI] Fetch My Lessons for", userProfile.id);
                    const data = await getUnlockedModulesByUser(userProfile.id);
                    console.log(
                      "[UI] My Lessons count",
                      Array.isArray(data) ? data.length : "not-array",
                    );
                    setMyLessons(data);

                    // Pre-load module data in background (non-blocking)
                    if (data && data.length > 0) {
                      console.log(
                        "[UI] Starting background pre-loading of module data",
                      );
                      const uniqueCourseIds = [
                        ...new Set(
                          data
                            .map((lesson) => lesson.module?.course_id)
                            .filter(Boolean),
                        ),
                      ];

                      // Start pre-loading but don't wait for it
                      Promise.all(
                        uniqueCourseIds.map(async (courseId) => {
                          try {
                            const modules = await fetchCourseModules(courseId);
                            return { courseId, modules };
                          } catch (error) {
                            console.warn(
                              `Failed to pre-load modules for course ${courseId}:`,
                              error,
                            );
                            return { courseId, modules: [] };
                          }
                        }),
                      )
                        .then((courseModulesResults) => {
                          // Cache all module data
                          const newCache = {};
                          courseModulesResults.forEach(
                            ({ courseId, modules }) => {
                              modules.forEach((module) => {
                                const cacheKey = `${courseId}-${module.id}`;
                                newCache[cacheKey] = module;
                              });
                            },
                          );

                          setCompleteModulesCache((prev) => ({
                            ...prev,
                            ...newCache,
                          }));
                          console.log(
                            "[UI] Background pre-loaded and cached",
                            Object.keys(newCache).length,
                            "modules",
                          );
                        })
                        .catch((error) => {
                          console.warn(
                            "[UI] Background pre-loading failed:",
                            error,
                          );
                          // Don't show error to user, just log it
                        });
                    }
                  } catch (e) {
                    console.error("[UI] My Lessons fetch error", e);
                    setMyLessons([]);
                  } finally {
                    setLoadingLessons(false);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  My Modules
                  {loadingLessons && (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                {activeTab === "lessons" && (
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

          {activeTab === "courses" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id} className="course-card opacity-0">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={
                            course.image ||
                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
                          }
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Trial Badge Overlay */}
                        {course.trialStatus.isInTrial && (
                          <div className="absolute top-3 left-3">
                            <TrialBadge
                              timeRemaining={course.trialStatus.timeRemaining}
                            />
                          </div>
                        )}
                        {/* Lock Overlay for Expired Trials */}
                        {course.trialStatus.isInTrial &&
                          course.trialStatus.isExpired && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="text-white text-center">
                                <Lock className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                  Trial Expired
                                </p>
                              </div>
                            </div>
                          )}
                      </div>

                      <CardHeader className="pb-3 flex-shrink-0">
                        <CardTitle className="text-base sm:text-lg line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm sm:text-base">
                          {course.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 flex-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                          {/* <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.totalDurationSecs ? formatTime(course.totalDurationSecs) : "Duration not specified"}</span>
                      </div> */}
                          <div className="flex items-center gap-1">
                            <BookOpen size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>{course.modulesCount || 0} modules</span>
                          </div>
                        </div>

                        {/* <Progress value={course.progress || 0} className="h-2" /> */}
                        {/*
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Time spent: {formatTime(courseTimes[course.id] || 0)}</span>
                      <span>{course.category || "Uncategorized"}</span>
                    </div>
                    */}
                      </CardContent>

                      <CardFooter className="pt-2 flex flex-col gap-2 flex-shrink-0">
                        <div className="flex gap-2 w-full">
                          <Link
                            to={`/dashboard/courses/${course.id}/modules`}
                            className="flex-1"
                          >
                            <Button
                              variant="default"
                              className="w-full text-sm sm:text-base bg-[#6164ec]"
                            >
                              Continue Learning
                            </Button>
                          </Link>
                        </div>

                        {/* Trial Status Info */}
                        {course.trialStatus.isInTrial &&
                          !course.trialStatus.isExpired && (
                            <div className="text-xs text-center text-gray-600">
                              Trial ends:{" "}
                              {new Date(
                                course.trialStatus.subscriptionEnd,
                              ).toLocaleDateString()}
                            </div>
                          )}

                        {/* {course.progress === 100 && (
                      <Link to={`/certificate/${course.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          <Award size={16} className="mr-2" />
                          View Certificate
                        </Button>
                      </Link>
                    )} */}
                      </CardFooter>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <h3 className="text-base sm:text-lg font-medium">
                    No courses found
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "lessons" && (
            <div>
              {loadingLessons ? (
                <div className="text-center py-10 text-sm text-gray-600">
                  Loading your modules...
                </div>
              ) : (
                (() => {
                  const combined = myLessons;
                  if (!combined || combined.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <h3 className="text-base sm:text-lg font-medium">
                          No lessons unlocked yet
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          Unlock lessons from the catalog or course pages.
                        </p>
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
                        const isCompleted =
                          module?.user_module_progress &&
                          Array.isArray(module.user_module_progress) &&
                          module.user_module_progress.length > 0 &&
                          module.user_module_progress.some(
                            (progress) => progress.completed === true,
                          );

                        // Get complete module data from cache for better thumbnail and resource_url
                        const cacheKey = `${courseId}-${module?.id}`;
                        const completeModule = completeModulesCache[cacheKey];
                        const displayModule = completeModule || module; // Use complete module if available, fallback to original

                        return (
                          <div
                            key={`${access.user_id}-${access.module_id}`}
                            className="opacity-0 lesson-card h-full"
                          >
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                              <div className="aspect-video relative overflow-hidden">
                                <img
                                  src={
                                    displayModule?.thumbnail ||
                                    module?.thumbnail ||
                                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"
                                  }
                                  alt={
                                    displayModule?.title ||
                                    module?.title ||
                                    "Lesson"
                                  }
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
                                    {access.course?.title || "Course"}
                                  </div>
                                </div>
                              </div>

                              {/* Fixed height for content area, flex-grow to fill space */}
                              <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                                <CardHeader className="pb-2 px-0 pt-0">
                                  <CardTitle className="text-lg line-clamp-2 min-h-[56px]">
                                    {displayModule?.title || module?.title}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                                    {displayModule?.description ||
                                      module?.description}
                                  </p>
                                </CardHeader>
                                <CardContent className="space-y-3 px-0 pt-0 pb-0">
                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <BookOpen size={14} />
                                      <span>
                                        Order: {module?.order || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={14} />
                                      <span>
                                        {module?.estimated_duration || 60} min
                                      </span>
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
                                  {courseId && module?.id ? (
                                    <Link
                                      to={`/dashboard/courses/${courseId}/modules/${module?.id}/lessons`}
                                      className="w-full"
                                    >
                                      <Button className="w-full bg-[#6164ec] hover:bg-[#b00000]">
                                        <Play size={16} className="mr-2" />
                                        View Lessons
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button
                                      className="w-full bg-[#6164ec] hover:bg-[#b00000]"
                                      disabled
                                    >
                                      <Play size={16} className="mr-2" />
                                      View Lessons
                                    </Button>
                                  )}
                                  <Link
                                    to={`/dashboard/courses/${courseId}/modules/${module?.id}/assessments`}
                                    className="w-full"
                                  >
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <FileText size={16} className="mr-2" />
                                      View Assessment
                                    </Button>
                                  </Link>
                                  {/* Mark as Complete - only show when not completed */}
                                  {!isCompleted ? (
                                    <Button
                                      variant="secondary"
                                      className="w-full disabled:opacity-60"
                                      disabled={markingCompleteIds.has(
                                        String(module?.id),
                                      )}
                                      onClick={async () => {
                                        const idStr = String(module?.id);
                                        if (!courseId || !module?.id) return;

                                        // Prevent duplicate clicks
                                        if (markingCompleteIds.has(idStr))
                                          return;

                                        setMarkingCompleteIds((prev) => {
                                          const next = new Set(prev);
                                          next.add(idStr);
                                          return next;
                                        });

                                        try {
                                          console.log(
                                            "Marking module as complete:",
                                            courseId,
                                            module?.id,
                                          );
                                          await api.post(
                                            `/api/course/${courseId}/modules/${module?.id}/mark-complete`,
                                          );

                                          // Update the local state to reflect completion
                                          setMyLessons((prev) =>
                                            prev.map((lesson) =>
                                              lesson.module_id ===
                                              access.module_id
                                                ? { ...lesson, completed: true }
                                                : lesson,
                                            ),
                                          );

                                          console.log(
                                            "Module marked as complete successfully",
                                          );
                                        } catch (err) {
                                          console.error(
                                            "Failed to mark module as complete",
                                            err,
                                          );
                                          alert(
                                            "Failed to mark lesson as complete. Please try again.",
                                          );
                                        } finally {
                                          setMarkingCompleteIds((prev) => {
                                            const next = new Set(prev);
                                            next.delete(idStr);
                                            return next;
                                          });
                                        }
                                      }}
                                    >
                                      {markingCompleteIds.has(
                                        String(module?.id),
                                      )
                                        ? "Marking..."
                                        : "Mark as Complete"}
                                    </Button>
                                  ) : (
                                    <div className="w-full flex items-center justify-center">
                                      <Badge className="px-3 py-1">
                                        Completed
                                      </Badge>
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

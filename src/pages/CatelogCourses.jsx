import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowLeft, Loader2, Lock, ShoppingCart, Unlock } from "lucide-react";
import { getCatalogCourses, testIndividualCourseAPI } from "@/services/instructorCatalogService";
import { fetchUserCourses, fetchCourseModules, fetchCoursePrice } from "@/services/courseService";
import { getCourseTrialStatus } from '../utils/trialUtils';
import TrialBadge from '../components/ui/TrialBadge';
import TrialExpiredDialog from '../components/ui/TrialExpiredDialog';
import { useCredits } from '@/contexts/CreditsContext';
import { useUser } from '@/contexts/UserContext';
import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { getUnlockedModulesByUser } from '@/services/modulesService';

// Component to display course price
const CoursePrice = ({ course }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const backendPrice = await fetchCoursePrice(course.id);
        if (backendPrice && Number(backendPrice) > 0) {
          setPrice(Number(backendPrice));
        } else if (course.price && Number(course.price) > 0) {
          setPrice(Number(course.price));
        } else {
          // Generate stable random price based on course ID
          const input = String(course?.id || "");
          let hash = 0;
          for (let i = 0; i < input.length; i++) {
            hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
          }
          const baseOptions = [500, 750, 1000, 1250, 1500];
          setPrice(baseOptions[hash % baseOptions.length]);
        }
      } catch (error) {
        console.log('Backend price not available, using fallback pricing');
        // Use fallback pricing
        const input = String(course?.id || "");
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
        }
        const baseOptions = [500, 750, 1000, 1250, 1500];
        setPrice(baseOptions[hash % baseOptions.length]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [course.id, course.price]);

  if (loading) {
    return <span>Loading...</span>;
  }

  return <span>{price} credits</span>;
};

// Component for buy course button text
const BuyCourseButton = ({ course }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const backendPrice = await fetchCoursePrice(course.id);
        if (backendPrice && Number(backendPrice) > 0) {
          setPrice(Number(backendPrice));
        } else if (course.price && Number(course.price) > 0) {
          setPrice(Number(course.price));
        } else {
          // Generate stable random price based on course ID
          const input = String(course?.id || "");
          let hash = 0;
          for (let i = 0; i < input.length; i++) {
            hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
          }
          const baseOptions = [500, 750, 1000, 1250, 1500];
          setPrice(baseOptions[hash % baseOptions.length]);
        }
      } catch (error) {
        console.log('Backend price not available, using fallback pricing');
        // Use fallback pricing
        const input = String(course?.id || "");
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
        }
        const baseOptions = [500, 750, 1000, 1250, 1500];
        setPrice(baseOptions[hash % baseOptions.length]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [course.id, course.price]);

  if (loading) {
    return <span>Buy Course</span>;
  }

  return <span>Buy Course ({price} credits)</span>;
};

const CatelogCourses = () => {
  const { catalogId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const { balance, unlockContent, refreshBalance } = useCredits();
  const [catalog, setCatalog] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [accessibleCourseIds, setAccessibleCourseIds] = useState([]);
  const [courseModuleCounts, setCourseModuleCounts] = useState({});
  const [selectedExpiredCourse, setSelectedExpiredCourse] = useState(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [userCoursesWithTrial, setUserCoursesWithTrial] = useState([]);
  
  // Course purchase states
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [selectedCourseToBuy, setSelectedCourseToBuy] = useState(null);
  const [buyDetailsOpen, setBuyDetailsOpen] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Unlocked modules state for checking individual lesson purchases
  const [unlockedModules, setUnlockedModules] = useState([]);

  // Helper function to format course level
  const formatCourseLevel = (level) => {
    if (!level) return "BEGINNER";
    
    // Convert to uppercase and handle different formats
    const upperLevel = level.toUpperCase();
    switch (upperLevel) {
      case 'BEGINNER':
      case 'B':
        return 'BEGINNER';
      case 'INTERMEDIATE':
      case 'I':
        return 'INTERMEDIATE';
      case 'ADVANCE':
      case 'ADVANCED':
      case 'A':
        return 'ADVANCED';
      default:
        return upperLevel;
    }
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    
    // If it's already a string with units, return as is
    if (typeof duration === 'string' && (duration.includes('hour') || duration.includes('min') || duration.includes(':'))) {
      return duration;
    }
    
    // If it's a number, assume it's in minutes and format accordingly
    const numDuration = parseInt(duration);
    if (isNaN(numDuration)) return duration;
    
    if (numDuration >= 60) {
      const hours = Math.floor(numDuration / 60);
      const minutes = numDuration % 60;
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } else {
      return `${numDuration}m`;
    }
  };

  // Helper function to get course price in credits
  const getCoursePriceCredits = async (course) => {
    // First try to fetch price from backend
    try {
      const backendPrice = await fetchCoursePrice(course.id);
      if (backendPrice && Number(backendPrice) > 0) {
        return Number(backendPrice);
      }
    } catch (error) {
      console.log('Backend price not available, using fallback pricing');
    }
    
    // Check if course has a price field from backend
    if (course.price && Number(course.price) > 0) {
      return Number(course.price);
    }
    
    // Generate stable random price based on course ID
    const input = String(course?.id || "");
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    const baseOptions = [500, 750, 1000, 1250, 1500];
    return baseOptions[hash % baseOptions.length];
  };

  // Handle buy course click
  const handleBuyCourseClick = async (course) => {
    const price = await getCoursePriceCredits(course);
    const currentBalance = Number(balance) || 0;
    
    setSelectedCourseToBuy({ ...course, priceCredits: price });
    
    if (currentBalance >= price && price > 0) {
      // User has enough credits - show purchase confirmation
      setBuyDetailsOpen(true);
    } else {
      // User doesn't have enough credits - show insufficient credits modal
      setShowInsufficientCreditsModal(true);
    }
  };

  const closeAllModals = () => {
    setBuyDetailsOpen(false);
    setShowCreditsModal(false);
    setShowInsufficientCreditsModal(false);
    setSelectedCourseToBuy(null);
    setIsPurchasing(false);
  };

  // Helper function to check if user can buy a course
  const canBuyCourse = (course) => {
    // Hide buy options for Master Class catalog courses
    const isMasterClassCatalog = (catalog?.name || "").toLowerCase().includes("master class");
    if (isMasterClassCatalog) return false;

    // Check if this course belongs to a free catalog (Roadmap Series or Start Your Passive Income Now)
    const freeCourseNames = ["Roadmap Series", "Start Your Passive Income Now"];
    const isFreeCatalog = freeCourseNames.some(name => 
      (catalog?.name || "").trim().toLowerCase() === name.toLowerCase()
    );
    
    // Check if this course belongs to a class recording catalog
    const isClassRecordingCatalog = (catalog?.name || "").toLowerCase().includes("class recording") || 
      (catalog?.name || "").toLowerCase().includes("class recordings") ||
      (catalog?.name || "").toLowerCase().includes("course recording") ||
      (catalog?.name || "").toLowerCase().includes("course recordings") ||
      (catalog?.name || "").toLowerCase().includes("recordings") ||
      (catalog?.name || "").toLowerCase().includes("recording");
    
    // If this is a free catalog or class recording catalog, users cannot buy courses from it
    if (isFreeCatalog || isClassRecordingCatalog) {
      return false;
    }
    
    // If user is already enrolled in the course, they can't buy it
    if (accessibleCourseIds.includes(course.id)) {
      return false;
    }
    
    // Check if user has purchased any individual lessons from this course
    const hasLessonPurchasesFromCourse = unlockedModules.some(module => {
      const courseId = module.course_id || module.courseId;
      return courseId && courseId === course.id;
    });
    
    // If user has bought individual lessons, they can't buy the whole course
    if (hasLessonPurchasesFromCourse) {
      return false;
    }
    
    return true;
  };

  
  // Fetch catalog courses from backend
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        
        // Use catalog data from URL state if available, otherwise create basic object
        const catalogFromState = location.state?.catalog;
        if (catalogFromState) {
          setCatalog(catalogFromState);
        } else {
          setCatalog({
            id: catalogId,
            name: `Catalog ${catalogId.split('-')[0]}`, // Show first part of UUID for readability
            description: "Course catalog"
          });
        }
        
        // Fetch the courses in this catalog using the instructor service
        let coursesData = await getCatalogCourses(catalogId);
        
        // If API returns empty and we have catalog data from state, try to use that
        if ((!coursesData || coursesData.length === 0) && catalogFromState?.courses) {
          coursesData = catalogFromState.courses;
        }
        
        // Handle nested course structure - extract course objects if they're nested
        let processedCourses = [];
        if (Array.isArray(coursesData)) {
          processedCourses = coursesData.map((item, index) => {
            
            // If the item has a nested 'course' property, extract it
            if (item && typeof item === 'object' && item.course) {
              return item.course;
            }
            // If the item is already a course object, use it as is
            return item;
          });
        } else {
          console.warn('⚠️ Courses data is not an array:', coursesData);
        }
        
        if (processedCourses?.[0]) {
          // Test individual course API if we have minimal data
          if (processedCourses[0].id && processedCourses[0].title && !processedCourses[0].description) {
                          const testResult = await testIndividualCourseAPI(processedCourses[0].id);
              if (testResult) {
                // Individual course API test successful
              } else {
                // Individual course API test failed
              }
          }
        } else {
          console.warn('⚠️ No courses found in processed data');
        }
        
        setCourses(processedCourses);
        
      } catch (err) {
        console.error("Failed to fetch catalog courses:", err);
        // Don't show error, just set empty courses array
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (catalogId) {
      fetchCatalogData();
    }
  }, [catalogId, location.state]);

  // Fetch accessible courses for the user
  useEffect(() => {
    const fetchAccessible = async () => {
      try {
        const userCourses = await fetchUserCourses();
        setAccessibleCourseIds(userCourses.map(c => c.id));
        setUserCoursesWithTrial(userCourses);
      } catch (e) {
        setAccessibleCourseIds([]);
        setUserCoursesWithTrial([]);
      }
    };
    fetchAccessible();
  }, []);

  // Fetch unlocked modules to check for individual lesson purchases
  useEffect(() => {
    const fetchUnlockedModules = async () => {
      if (!userProfile?.id) return;
      
      try {
        const modules = await getUnlockedModulesByUser(userProfile.id);
        setUnlockedModules(modules || []);
      } catch (err) {
        console.error('Error fetching unlocked modules:', err);
        setUnlockedModules([]);
      }
    };

    fetchUnlockedModules();
  }, [userProfile?.id]);

  // Fetch all courses and catalog courses when modal opens
  useEffect(() => {
    if (showCourseModal) {
      setModalLoading(true);
      Promise.all([
        fetchAllCourses(),
        getCatalogCourses(catalogId)
      ]).then(([all, catalogCourses]) => {
        setAllCourses(all);
        setSelectedCourseIds((catalogCourses || []).map(c => c.id));
        setModalLoading(false);
      });
    }
  }, [showCourseModal, catalogId]);

  // After setting courses (setCourses), fetch module counts for each course
  useEffect(() => {
    const fetchModulesForCourses = async () => {
      if (!courses || courses.length === 0) return;
      const counts = {};
      await Promise.all(
        courses.map(async (course) => {
          try {
            const modules = await fetchCourseModules(course.id);
            // Only count published modules; hide drafts from counts
            const publishedCount = (Array.isArray(modules) ? modules : []).filter((m) => {
              const status = (m.module_status || m.status || "").toString().toUpperCase();
              return status === "PUBLISHED" || m.published === true;
            }).length;
            counts[course.id] = publishedCount;
          } catch {
            counts[course.id] = 0;
          }
        })
      );
      setCourseModuleCounts(counts);
    };
    fetchModulesForCourses();
  }, [courses]);

  // Handle checkbox toggle in modal
  const handleCourseToggle = async (courseId, checked) => {
    setModalLoading(true);
    if (checked) {
      await addCourseToCatalog(catalogId, courseId);
      setSelectedCourseIds(prev => [...prev, courseId]);
    } else {
      await removeCourseFromCatalog(catalogId, courseId);
      setSelectedCourseIds(prev => prev.filter(id => id !== courseId));
    }
    setModalLoading(false);
    // Optionally, refresh catalog courses in main view
    fetchCatalogData();
  };

  // Use the fetched courses directly since they're already filtered by catalog
  const filteredCourses = courses || [];

  
  const handleCourseClick = (course) => {
    // Find the user's course data to check trial status
    const userCourse = userCoursesWithTrial.find(uc => uc.id === course.id);
    if (userCourse) {
      const trialStatus = getCourseTrialStatus(userCourse);
      if (trialStatus.isInTrial && trialStatus.isExpired) {
        setSelectedExpiredCourse({ ...course, ...userCourse });
        setShowTrialDialog(true);
        return;
      }
    }
    // Navigate to course normally
    window.location.href = `/dashboard/courses/${course.id}`;
  };
  
  const handleCloseTrialDialog = () => {
    setShowTrialDialog(false);
    setSelectedExpiredCourse(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading catalog...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1">
          <div className="container py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container pt-4 pb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Catalog Header - Compact, Beautiful, and Aligned */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-blue-100/50 px-6 pt-4 pb-6 mb-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              {/* Top Bar: Back Button (left) and Course Count (right) */}
              <div className="flex items-center justify-between mb-2">
                <Link
                  to="/dashboard/catalog"
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium transition-colors text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-100 hover:bg-white hover:border-blue-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Catalogs
                </Link>
                <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-blue-100 text-sm font-medium text-gray-700">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'}
                </span>
              </div>
              {/* Catalog Title */}
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {catalog?.name || "Catalog"}
              </h1>
              {/* Description Box - Compact and Justified */}
              <div className="bg-white/90 backdrop-blur-md rounded-4xl p-5 border border-white/50 shadow-xl">
                <p className="text-gray-700 text-sm leading-relaxed text-justify">
                  {catalog?.description || "Explore our comprehensive collection of courses designed to help you achieve your learning goals. This catalog provides a structured learning path with carefully curated content to enhance your knowledge and skills in your chosen field."}
                </p>
              </div>
            </div>
          </div>

          {/* Modal for adding/removing courses */}
          {showCourseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full relative">
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Courses for Catalog</h3>
                {modalLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {allCourses.map(course => (
                      <label key={course.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={e => handleCourseToggle(course.id, e.target.checked)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{course.title || course.name}</div>
                          <div className="text-xs text-gray-500">{course.description || course.summary}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}





          {/* Enhanced Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="mx-auto max-w-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses available</h3>
                <p className="mt-2 text-gray-600">
                  {loading ? "Loading courses..." : "This catalog doesn't have any courses yet. Check back later for new content!"}
                </p>
                <div className="mt-6">
                  <Link
                    to="/dashboard/catalog"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse all catalogs
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course, idx) => {
                const isAccessible = accessibleCourseIds.includes(course.id);
                const cardContent = (
                  <div 
                    key={course.id || course._id || course.uuid || idx} 
                    className="group flex flex-col border border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full hover:border-blue-200 hover:scale-[1.02]"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail || course.image || course.coverImage || course.course_image || course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000"}
                        alt={course.title || course.name || course.courseName || course.course_title || 'Course image'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000";
                        }}
                      />
                      
                      {/* Course Level and Price Badges */}
                      {/* <div className="absolute bottom-3 left-3 flex gap-2">
                        <Badge key={`${course.id}-level`} variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200 font-medium">
                          {formatCourseLevel(course.course_level || course.level || course.difficulty)}
                        </Badge>
                      </div> */}
                      
                      {/* Trial Badge */}
                      {(() => {
                        const userCourse = userCoursesWithTrial.find(uc => uc.id === course.id);
                        if (userCourse) {
                          const trialStatus = getCourseTrialStatus(userCourse);
                          if (trialStatus.isInTrial) {
                            return (
                              <div className="absolute top-3 left-3">
                                <TrialBadge timeRemaining={trialStatus.timeRemaining} />
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                      
                      {/* Category Badge */}
                      {course.category && (
                        <div className="absolute top-3 right-3">
                          <Badge key={`${course.id}-category`} variant="outline" className="bg-white/95 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200 font-medium">
                            {course.category}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Lock Overlay for Expired Trials */}
                      {(() => {
                        const userCourse = userCoursesWithTrial.find(uc => uc.id === course.id);
                        if (userCourse) {
                          const trialStatus = getCourseTrialStatus(userCourse);
                          if (trialStatus.isInTrial && trialStatus.isExpired) {
                            return (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Lock className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm font-medium">Trial Expired</p>
                                </div>
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Course Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex-1">
                        {/* Course Title */}
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {course.title || course.name || course.courseName || course.course_title || course.courseName || <span className="text-red-500">Missing title</span>}
                        </h2>
                        
                        {/* Course Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {course.description || course.summary || course.shortDescription || course.course_description || course.desc || course.content || course.overview || course.synopsis || course.details || course.about || <span className="text-red-500">No description available</span>}
                        </p>
                        
                        {/* Course Tags/Skills */}
                        {course.tags && course.tags.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {course.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={`${course.id}-tag-${index}`} 
                                  className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-200 font-medium hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                                >
                                  {tag}
                                </span>
                              ))}
                              {course.tags.length > 3 && (
                                <span key={`${course.id}-more-tags`} className="inline-block px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                  +{course.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                        {/* Course Details */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* Duration and Modules */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                            <span key={`${course.id}-duration`} className="flex items-center gap-1.5">
                              <Clock size={14} className="text-blue-500 shrink-0" />
                              {formatDuration(course.estimated_duration || course.duration || course.timeEstimate || course.timeRequired || course.duration_hours || course.hours || course.time || course.length || course.course_duration)}
                            </span>
                            <span key={`${course.id}-modules`} className="flex items-center gap-1.5">
                              <BookOpen size={14} className="text-indigo-500 shrink-0" />
                              {courseModuleCounts[course.id] || 0} modules
                            </span>
                            {course.rating && (
                              <span key={`${course.id}-rating`} className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                                </svg>
                                {course.rating}
                              </span>
                            )}
                          </div>
                          
                          {/* Course Price */}
                          {!isAccessible && canBuyCourse(course) && (
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                                <ShoppingCart size={14} />
                                <CoursePrice course={course} />
                              </span>
                            </div>
                          )}
                        
                        {/* Course Status */}
                        {/* {course.course_status && (
                          <div className="text-xs text-gray-500 mb-3">
                            <span className="font-medium">Status:</span> 
                            <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                              course.course_status === 'PUBLISHED' ? 'bg-green-100 text-green-800 border border-green-200' :
                              course.course_status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {course.course_status}
                            </span>
                          </div>
                        )} */}
                        
                        {/* Max Students */}
                        {course.maxStudents && (
                          <div className="text-xs text-gray-500 mb-3">
                            <span className="font-medium">Max Students:</span> {course.maxStudents}
                          </div>
                        )}
                        
                        {/* Language */}
                        {course.language && (
                          <div className="text-xs text-gray-500 mb-3">
                            <span className="font-medium">Language:</span> {course.language}
                          </div>
                        )}
                        
                        {/* Enrollment Status */}
                        {course.enrollmentStatus && (
                          <div className="mt-3">
                            <Badge 
                              key={`${course.id}-enrollment`}
                              variant={course.enrollmentStatus === 'enrolled' ? 'default' : 'outline'}
                              className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 font-medium"
                            >
                              {course.enrollmentStatus === 'enrolled' ? 'Enrolled' : 'Available'}
                            </Badge>
                          </div>
                        )}
                       </div>
                     </div>
                     
                     {/* Course Actions */}
                     <div className="p-6 pt-0">
                       {isAccessible ? (
                         <Link to={`/dashboard/courses/${course.id}`} className="w-full">
                           <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                             <BookOpen size={16} className="mr-2" />
                             Continue Learning
                           </Button>
                         </Link>
                       ) : canBuyCourse(course) ? (
                         <div className="flex gap-2">
                           <Button 
                             className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                             asChild
                           >
                             <Link 
                               to={`/dashboard/courses/${course.id}`}
                               className="flex items-center justify-center"
                             >
                               <BookOpen size={16} className="mr-2" />
                               View Course
                             </Link>
                           </Button>
                           
                        <Button
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleBuyCourseClick(course);
                           }}
                             className="h-11 px-4 rounded-lg text-sm font-semibold shadow-sm border transition-all duration-200 bg-white text-green-700 border-green-300 hover:bg-green-50"
                         >
                           <Unlock size={16} className="mr-2" />
                             Buy Course
                         </Button>
                         </div>
                       ) : (
                         <div className="w-full">
                           <Link to={`/dashboard/courses/${course.id}`} className="w-full">
                             <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                             <BookOpen size={16} className="mr-2" />
                             View Course
                           </Button>
                           </Link>
                           {/* Only show the message for non-free and non-recording catalog courses */}
                          {(() => {
                             // Check if this course belongs to a free catalog (Roadmap Series or Start Your Passive Income Now)
                             const freeCourseNames = ["Roadmap Series", "Start Your Passive Income Now"];
                             const isFreeCatalog = freeCourseNames.some(name =>
                               (catalog?.name || "").trim().toLowerCase() === name.toLowerCase()
                             );

                             // Check if this course belongs to a class recording catalog
                             const isClassRecordingCatalog = (catalog?.name || "").toLowerCase().includes("class recording") ||
                               (catalog?.name || "").toLowerCase().includes("class recordings") ||
                               (catalog?.name || "").toLowerCase().includes("course recording") ||
                               (catalog?.name || "").toLowerCase().includes("course recordings") ||
                               (catalog?.name || "").toLowerCase().includes("recordings") ||
                               (catalog?.name || "").toLowerCase().includes("recording");

                              // Only show the message if it's NOT a free catalog, NOT a class recording catalog, and NOT master class
                             const isMasterClassCatalog = (catalog?.name || "").toLowerCase().includes("master class");
                             if (!isFreeCatalog && !isClassRecordingCatalog && !isMasterClassCatalog) {
                               return (
                                 <p className="text-xs text-gray-500 mt-2 text-center">
                                   You bought individual lessons - continue buying lessons only
                                 </p>
                               );
                             }
                             return null;
                           })()}
                         </div>
                       )}
                     </div>
                   </div>
                 );
                 
                 const userCourse = userCoursesWithTrial.find(uc => uc.id === course.id);
                 const trialStatus = userCourse ? getCourseTrialStatus(userCourse) : { isInTrial: false, isExpired: false };
                 
                 if (trialStatus.isInTrial && trialStatus.isExpired) {
                   return (
                     <div key={course.id || idx} className="relative cursor-pointer" onClick={() => handleCourseClick(course)}>
                       {cardContent}
                     </div>
                   );
                 }
                 
                 return (
                   <Link to={`/dashboard/courses/${course.id}`} state={{ isAccessible }} key={course.id || idx} className="relative">{cardContent}</Link>
                 );
               })}
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

      {/* Buy details modal when user has enough credits */}
      {buyDetailsOpen && selectedCourseToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAllModals} />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg p-6">
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
                <h3 className="text-xl font-semibold text-gray-900">Confirm Course Purchase</h3>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-lg font-semibold text-gray-900 mb-2">{selectedCourseToBuy.title}</div>
              <div className="text-sm text-gray-600 mb-3">{selectedCourseToBuy.description || "Complete course with multiple modules"}</div>
              
              {/* Course Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedCourseToBuy.duration || "Self-paced"}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Modules</div>
                  <div className="text-sm font-semibold text-gray-900">{courseModuleCounts[selectedCourseToBuy.id] || 0} modules</div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                <span className="text-lg font-bold text-blue-600">{selectedCourseToBuy.priceCredits || 0} credits</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Your Balance:</span>
                <span className="text-sm font-semibold text-gray-900">{Number(balance) || 0} credits</span>
              </div>
              <div className="border-t border-blue-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">After Purchase:</span>
                  <span className="text-sm font-bold text-green-600">
                    {(Number(balance) || 0) - (selectedCourseToBuy.priceCredits || 0)} credits
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Buying this course will unlock all {courseModuleCounts[selectedCourseToBuy.id] || 0} modules at once. You'll have immediate access to all content.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeAllModals} className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm">Cancel</button>
              <button
                disabled={isPurchasing}
                onClick={async () => { 
                  if (isPurchasing) return; // Prevent multiple clicks
                  
                  try {
                    setIsPurchasing(true);
                    
                    // Call unlock API for course
                    await unlockContent('COURSE', selectedCourseToBuy.id, selectedCourseToBuy.priceCredits);
                    
                    // Refresh balance to show updated credits
                    if (refreshBalance) {
                      await refreshBalance();
                    }
                    
                    // Refresh user courses to update enrollment status
                    try {
                      const updatedCourses = await fetchUserCourses();
                      setUserCoursesWithTrial(updatedCourses || []);
                      setAccessibleCourseIds(updatedCourses.map(c => c.id) || []);
                    } catch (err) {
                      console.error('Error refreshing user courses after purchase:', err);
                    }
                    
                    // Show success notice
                    setPurchaseNotice(`Successfully purchased course: ${selectedCourseToBuy.title}. All modules are now unlocked.`);
                    closeAllModals();
                    setTimeout(() => setPurchaseNotice(""), 4000);
                  } catch (error) {
                    console.error('Failed to purchase course:', error);
                    setPurchaseNotice(`Failed to purchase course: ${error.message}`);
                    setTimeout(() => setPurchaseNotice(""), 4000);
                  } finally {
                    setIsPurchasing(false);
                  }
                }}
                className={`px-4 py-2 rounded-md text-white text-sm ${
                  isPurchasing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPurchasing ? 'Processing...' : 'Confirm & Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient credits modal */}
      {showInsufficientCreditsModal && selectedCourseToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAllModals} />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full mr-3">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Insufficient Credits</h3>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 mb-6 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">Purchase Details:</div>
                <div><span className="font-medium">Course:</span> {selectedCourseToBuy.title}</div>
                <div><span className="font-medium">Price:</span> {selectedCourseToBuy.priceCredits || 0} credits</div>
                <div><span className="font-medium">Your balance:</span> {Number(balance) || 0} credits</div>
                <div><span className="font-medium">Modules included:</span> {courseModuleCounts[selectedCourseToBuy.id] || 0} modules</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="bg-orange-100 p-1 rounded-full mr-2">
                    <svg className="h-3 w-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium text-orange-800">You need more credits</span>
                </div>
                <p className="text-orange-700 text-xs">
                  You need {(selectedCourseToBuy.priceCredits || 0) - (Number(balance) || 0)} more credits to purchase this course.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeAllModals} 
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Close insufficient credits modal and open credit purchase modal
                  setShowInsufficientCreditsModal(false);
                  setShowCreditsModal(true);
                }}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit purchase modal */}
      {showCreditsModal && (
        <CreditPurchaseModal
          open={showCreditsModal}
          onClose={() => setShowCreditsModal(false)}
          balance={Number(balance) || 0}
        />
      )}

      {/* Purchase notice */}
      {purchaseNotice && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm rounded-lg shadow-lg">
          {purchaseNotice}
        </div>
      )}

    </div>
  );
};

export default CatelogCourses;
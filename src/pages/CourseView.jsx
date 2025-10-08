import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Play, BookOpen, Users, Calendar, Award, FileText, Lock, Unlock, ShoppingCart, ArrowLeft, ChevronDown } from "lucide-react";
import { fetchCourseModules, fetchCourseById, fetchUserCourses, fetchCoursePrice } from "@/services/courseService";
import { useCredits } from "@/contexts/CreditsContext";
import { useUser } from "@/contexts/UserContext";
import CreditPurchaseModal from "@/components/credits/CreditPurchaseModal";
import { getUnlockedModulesByUser } from "@/services/modulesService";
import api from "@/services/apiClient";

// MODULE_UNLOCK_COST will be fetched from backend per module

// Component to display course price
const CoursePriceDisplay = ({ course }) => {
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

export function CourseView() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const hasAccessFromState = location.state?.isAccessible ?? false;
  const { userProfile } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [unlockingId, setUnlockingId] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState(new Set());
  const [confirmUnlock, setConfirmUnlock] = useState({ open: false, module: null });
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const { balance, unlockContent, refreshBalance } = useCredits();
  
  // Book Smart vs Street Smart state
  const [viewMode, setViewMode] = useState("book"); // "book" | "street"
  const [streetModules, setStreetModules] = useState([]);
  const [streetLoading, setStreetLoading] = useState(false);
  const [streetError, setStreetError] = useState("");
  const [isEnrolledRecording, setIsEnrolledRecording] = useState(false);
  // Accordion expansion control for Book/Street sections
  const [expandedSection, setExpandedSection] = useState(null); // null | 'book' | 'street'
  
  // Course purchase states
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [selectedCourseToBuy, setSelectedCourseToBuy] = useState(null);
  const [buyDetailsOpen, setBuyDetailsOpen] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Unlocked modules state for checking individual lesson purchases
  const [unlockedModules, setUnlockedModules] = useState([]);
  
  // Sequential unlock modal state
  const [showSequentialModal, setShowSequentialModal] = useState(false);
  const [selectedModuleForSequential, setSelectedModuleForSequential] = useState(null);

  // Initialize unlocked modules from backend for this user
  useEffect(() => {
    const initUnlocked = async () => {
      try {
        if (!userProfile?.id) return;
        console.log('[UI] Fetch unlocked IDs for CourseView', userProfile.id);
        const data = await getUnlockedModulesByUser(userProfile.id);
        console.log('[UI] Unlocked IDs count', Array.isArray(data) ? data.length : 'not-array');
        const ids = new Set((data || []).map((d) => String(d.module_id)));
        setUnlockedIds(ids);
        setUnlockedModules(data || []);
      } catch (e) {
        console.error('[UI] Fetch unlocked IDs error', e);
      }
    };
    initUnlocked();
  }, [userProfile?.id]);

  // Mapping of supported courses to their recordings course IDs (Street Smart)
  // Source IDs from components/dashboard/ClassRecording.jsx
  const RECORDING_COURSE_IDS = {
    becomePrivate: "a188173c-23a6-4cb7-9653-6a1a809e9914",
    operatePrivate: "7b798545-6f5f-4028-9b1e-e18c7d2b4c47",
    businessCredit: "199e328d-8366-4af1-9582-9ea545f8b59e",
    privateMerchant: "d8e2e17f-af91-46e3-9a81-6e5b0214bc5e",
    sovereignty101: "d5330607-9a45-4298-8ead-976dd8810283",
      remedy: "814b3edf-86da-4b0d-bb8c-8a6da2d9b4df", // I Want Remedy Now recording course ID
  };

  // Check if current course is a recording course
  const isRecordingCourse = (title) => {
    const t = (title || "").toLowerCase();
    return t.includes("recording") || t.includes("recordings");
  };

  // Determine if current course is one of the eligible courses (with recording course IDs)
  // But exclude recording courses themselves
  const isEligibleForTwoModes = (title) => {
    if (isRecordingCourse(title)) return false; // Don't show Book Smart/Street Smart in recording courses
    
    const t = (title || "").toLowerCase();
    return [
      "become private",
      "sovereignty 101",
      "sov 101",
      "operate private",
      "business credit",
      "i want remedy now",
      "private merchant",
    ].some((k) => t.includes(k));
  };

  // Get recording course id for the matching title
  const getRecordingCourseIdForTitle = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("become private")) return RECORDING_COURSE_IDS.becomePrivate;
    if (t.includes("operate private")) return RECORDING_COURSE_IDS.operatePrivate;
    if (t.includes("business credit")) return RECORDING_COURSE_IDS.businessCredit;
    if (t.includes("private merchant")) return RECORDING_COURSE_IDS.privateMerchant;
    if (t.includes("sovereignty 101") || t.includes("sov 101")) return RECORDING_COURSE_IDS.sovereignty101;
    if (t.includes("i want remedy now")) return RECORDING_COURSE_IDS.remedy;
    return null;
  };

  const getStableRandomPrice = (moduleObj) => {
    const input = String(moduleObj?.id || "");
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    const baseOptions = [100, 150, 200, 250];
    return baseOptions[hash % baseOptions.length];
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
    if (course?.price && Number(course.price) > 0) {
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
    setCreditsModalOpen(false);
    setShowInsufficientCreditsModal(false);
    setSelectedCourseToBuy(null);
    setIsPurchasing(false);
    setShowSequentialModal(false);
    setSelectedModuleForSequential(null);
    setIsDescriptionExpanded(false);
  };

  // Helper function to check if user can buy a course
  const canBuyCourse = (course) => {
    // Hide buy option for specific Master Class courses
    const title = (course?.title || "").toLowerCase();
    const isMasterClassCourse = [
      "formation of business trust",
      "tier 1: optimizing your business credit profile"
    ].some(name => title.includes(name));
    if (isMasterClassCourse) return false;

    // Check if this course belongs to a free catalog (Roadmap Series/Start Your Passive Income Now)
    // or a class recording catalog
    const freeCatalogKeywords = [
      "roadmap",
      "road map",
      "roadmap series",
      "road map series",
      "passive income",
      "start your passive income"
    ];
    const classRecordingKeywords = ["class recording", "class recordings", "course recording", "course recordings", "recordings", "recording"];
    const courseTitle = (course?.title || "").toLowerCase();
    const isFromFreeCatalog = freeCatalogKeywords.some(keyword => 
      courseTitle.includes(keyword)
    );
    const isFromClassRecording = classRecordingKeywords.some(keyword => 
      courseTitle.includes(keyword)
    );
    
    // If this course is from a free catalog or class recording, users cannot buy it
    if (isFromFreeCatalog || isFromClassRecording) {
      return false;
    }
    
    // If user is already enrolled in the course, they can't buy it
    if (isEnrolled) {
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

  // Helper function to check if course is from a free catalog or class recording
  const isFromFreeCatalog = (course) => {
    const freeCatalogKeywords = [
      "roadmap",
      "road map",
      "roadmap series",
      "road map series",
      "passive income",
      "start your passive income"
    ];
    const classRecordingKeywords = ["class recording", "class recordings", "course recording", "course recordings", "recordings", "recording"];
    const courseTitle = (course?.title || "").toLowerCase();
    return freeCatalogKeywords.some(keyword => courseTitle.includes(keyword)) ||
           classRecordingKeywords.some(keyword => courseTitle.includes(keyword));
  };

  // Handle sequential unlock click
  const handleSequentialUnlockClick = (module) => {
    setSelectedModuleForSequential(module);
    setShowSequentialModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Fetch both course details and modules in parallel
        const [courseData, modulesData] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseModules(courseId)
        ]);
        
        setCourseDetails(courseData);
        // Only include published modules; hide drafts from users
        const publishedModules = (Array.isArray(modulesData) ? modulesData : []).filter((m) => {
          const status = (m.module_status || m.status || "").toString().toUpperCase();
          return status === "PUBLISHED" || m.published === true;
        });
        setModules(publishedModules);
        setFilteredModules(publishedModules);
        
        // Calculate total duration from modules
        const total = publishedModules.reduce((sum, module) => {
          const duration = parseInt(module.estimated_duration) || 0;
          return sum + duration;
        }, 0);
        setTotalDuration(total);
        
        // Removed lesson access fetch since we're not using locked state anymore
        
      } catch (err) {
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) fetchData();
  }, [courseId]);

  // Load Street Smart modules only for eligible courses
  useEffect(() => {
    const loadStreetSmart = async () => {
      if (!courseDetails) return;
      if (!isEligibleForTwoModes(courseDetails.title)) return;
      const recordingCourseId = getRecordingCourseIdForTitle(courseDetails.title);
      if (!recordingCourseId) {
        setStreetModules([]);
        setStreetError("");
        return;
      }
      setStreetLoading(true);
      setStreetError("");
      try {
        const recMods = await fetchCourseModules(recordingCourseId);
        const published = (Array.isArray(recMods) ? recMods : []).filter((m) => {
          const status = (m.module_status || m.status || "").toString().toUpperCase();
          return status === "PUBLISHED" || m.published === true;
        });
        setStreetModules(published);
        // Refresh enrollment status after loading Street Smart modules
        await checkEnrollmentStatus();
      } catch (e) {
        setStreetError("Failed to load recordings");
        setStreetModules([]);
      } finally {
        setStreetLoading(false);
      }
    };
    loadStreetSmart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetails?.title]);

  // Check if user is enrolled in the current course
  const checkEnrollmentStatus = async () => {
    if (!userProfile?.id || !courseId) {
      console.log(`[CourseView] No userProfile.id or courseId available, skipping enrollment check`);
      return;
    }
    
    try {
      console.log(`[CourseView] Checking if user is enrolled in course: ${courseId}`);
      // Use the same method as Courses.jsx - fetchUserCourses from courseService
      const userCourses = await fetchUserCourses();
      console.log(`[CourseView] User courses:`, userCourses);
      
      // Check if current course is in user's enrolled courses
      const enrolled = userCourses.some(course => {
        const courseIdStr = course.id?.toString();
        const currentCourseIdStr = courseId?.toString();
        const match = courseIdStr === currentCourseIdStr;
        console.log(`[CourseView] Comparing course.id: ${courseIdStr} with courseId: ${currentCourseIdStr}, match: ${match}`);
        return match;
      });
      
      console.log(`[CourseView] Is user enrolled in course ${courseId}:`, enrolled);
      setIsEnrolled(enrolled);
      
      // Check recording course enrollment
      try {
        if (courseDetails?.title) {
          const recId = getRecordingCourseIdForTitle(courseDetails.title);
          console.log(`[CourseView] Recording course ID for ${courseDetails.title}:`, recId);
          if (recId) {
            const recEnrolled = userCourses.some(c => {
              const cId = c.id?.toString?.() || c.id?.toString();
              const recIdStr = recId.toString();
              const match = cId === recIdStr;
              console.log(`[CourseView] Recording enrollment check - course.id: ${cId}, recordingId: ${recIdStr}, match: ${match}`);
              return match;
            });
            console.log(`[CourseView] Is user enrolled in recording course ${recId}:`, recEnrolled);
            setIsEnrolledRecording(recEnrolled);
          } else {
            console.log(`[CourseView] No recording course ID found for ${courseDetails.title}`);
            setIsEnrolledRecording(false);
          }
        } else {
          setIsEnrolledRecording(false);
        }
      } catch (e) { 
        console.error(`[CourseView] Error checking recording enrollment:`, e);
        setIsEnrolledRecording(false); 
      }
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
      setIsEnrolled(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(module =>
        module.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, modules]);

  // Check enrollment status when component mounts or userProfile/courseId changes
  useEffect(() => {
    if (userProfile?.id && courseId) {
      checkEnrollmentStatus();
    }
  }, [userProfile?.id, courseId]);


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading course modules...</p>
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
          <div className="container py-6 max-w-7xl">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Failed to load modules</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${minutes} min`;
    if (remainingMinutes === 0) return `${hours} hr`;
    return `${hours} hr ${remainingMinutes} min`;
  };

  // Removed handleUnlockClick since we're not using locked state anymore

  // Removed unlock-related functions since we're not using locked state anymore


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <main className="flex-1">
        <div className="container py-8 max-w-7xl">

          {/* Course Details Section */}
          {courseDetails && (
            <div className="mb-8">
              <Card className="overflow-hidden shadow-xl border-0">
                {/* Course Title and Description at the top */}
                <CardContent className="p-6">
                  <div className="max-w-4xl">
                    {/* Back Button */}
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{courseDetails.title}</h1>
                    <p className={`text-gray-600 text-md leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                      {courseDetails.description}
                    </p>
                    {courseDetails.description.length > 150 && (
                      <Button 
                        variant="link"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto mt-2 text-md font-medium hover:underline"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      >
                        {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                      </Button>
                    )}
                    
                    {/* Course Stats with reduced size and compact layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="p-2 bg-green-500 rounded-lg shadow-md">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-700">Total Modules</p>
                          <p className="text-lg font-bold text-green-800">{modules.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                        <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-purple-700">Duration</p>
                          <p className="text-lg font-bold text-purple-800">
                            {totalDuration > 0 ? formatDuration(totalDuration) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {courseDetails.instructor && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                          <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700">Instructor</p>
                            <p className="text-sm font-bold text-orange-800">{courseDetails.instructor}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Moved accordion below the Total Modules/Search section */}

                    {/* Course Purchase Section (Book Smart only) */}
                    {viewMode === "book" && !isEnrolled && canBuyCourse(courseDetails) && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg shadow-md">
                              <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Course Price</p>
                              <p className="text-lg font-bold text-green-600"><CoursePriceDisplay course={courseDetails} /></p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleBuyCourseClick(courseDetails)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Buy Course
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Buying this course will unlock all {modules.length} modules at once.</p>
                      </div>
                    )}
                    
                    {/* Street Smart instructor enrollment note (no payments) */}
                    {viewMode === "street" && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Instructor Enrollment</p>
                            <p className="text-xs text-blue-600 mt-1">Street Smart recordings are available via instructor enrollment only.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Course Not Available Message (Book Smart) */}
                    {viewMode === "book" && !isEnrolled && !canBuyCourse(courseDetails) && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        {(() => {
                          const title = (courseDetails?.title || "").toLowerCase();
                          const isClassRecording = ["class recording", "class recordings", "course recording", "course recordings", "recordings", "recording"].some(k => title.includes(k));
                          const isMasterClassCourse = [
                            "formation of business trust",
                            "tier 1: optimizing your business credit profile"
                          ].some(name => title.includes(name));
                          if (isFromFreeCatalog(courseDetails) || isMasterClassCourse) {
                            return (
                          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                {isClassRecording ? "Class Recording - Instructor Enrollment" : (isMasterClassCourse ? "Master Class - Instructor Enrollment" : "Free Course - Instructor Enrollment")}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {isClassRecording 
                                  ? "This is a class recording. Your instructor will enroll you in this course." 
                                  : (isMasterClassCourse 
                                    ? "This is part of Master Class. Your instructor will enroll you in this course." 
                                    : "This is a free course. Your instructor will enroll you in this course.")}
                              </p>
                            </div>
                          </div>
                            );
                          }
                          return (
                          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="p-2 bg-green-500 rounded-lg shadow-md">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-800">Continue Your Learning Journey</p>
                              <p className="text-xs text-green-600 mt-1">
                                You've already started this course with individual lessons! 
                                Keep building your knowledge by purchasing more lessons.
                              </p>
                            </div>
                          </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-muted-foreground" size={20} />
              <span className="font-medium">Total Modules:</span>
              <span className="font-mono text-lg">{viewMode === "street" ? streetModules.length : modules.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search modules..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Accordion with inline module lists only for eligible courses */}
          {isEligibleForTwoModes(courseDetails?.title) && (
            <div className="mb-4 space-y-3">
              {/* Book Smart */}
              <div
                className={`w-full flex items-center justify-between px-6 py-6 rounded-2xl border-2 transition-colors cursor-default select-none ${
                  viewMode === "book" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg md:text-xl font-semibold text-gray-900">Book Smart</div>
                    <div className="text-base md:text-lg text-gray-600">Standard lessons for this course</div>
                  </div>
                  <div className="ml-3 hidden sm:flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] rounded-full border font-semibold transition-all ${
                      viewMode === 'book'
                        ? 'bg-white text-blue-700 border-blue-400 ring-2 ring-blue-300/70 shadow-md'
                        : 'bg-gradient-to-b from-blue-50 to-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${viewMode === 'book' ? 'bg-blue-600' : 'bg-blue-500'}`}></span>
                      Standard
                    </span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-300`} />
              </div>
              {
                filteredModules.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No modules found</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery ? "Try adjusting your search query" : "This course doesn't have any modules yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredModules.map((module) => {
                    const isContentAvailable = !!module.resource_url;
                    const hasAccess = isEnrolled || unlockedIds.has(String(module.id));
                    const isLocked = !hasAccess;
                    const modulePrice = Number(module.price) > 0 ? Number(module.price) : getStableRandomPrice(module);

                    // Sequential unlock: allow only the first module or next after highest unlocked
                    let canUnlockInOrder = false;
                    if (isLocked) {
                      const allOrders = modules.map((m) => Number(m.order) || 0).filter((n) => n > 0);
                      const minOrder = allOrders.length ? Math.min(...allOrders) : 1;
                      const unlockedOrders = new Set(
                        modules
                          .filter((m) => unlockedIds.has(m.id))
                          .map((m) => Number(m.order) || 0)
                      );
                      const highestUnlocked = unlockedOrders.size ? Math.max(...Array.from(unlockedOrders)) : null;
                      const currentOrder = Number(module.order) || 0;
                      if (highestUnlocked == null) {
                        canUnlockInOrder = currentOrder === minOrder;
                      } else {
                        canUnlockInOrder = currentOrder === highestUnlocked + 1;
                      }
                    }
                     
                    
                    return (
                      <div key={module.id} className="module-card h-full">
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={module.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                              alt={module.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Lock overlay for locked modules */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="bg-white/95 rounded-lg p-3 shadow-xl flex items-center gap-2">
                                  <Lock className="w-5 h-5 text-gray-700" />
                                  <span className="text-sm font-medium text-gray-800">Locked</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Fixed height for content area, flex-grow to fill space */}
                          <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                            <CardHeader className="pb-2 px-0 pt-0">
                              <CardTitle className="text-lg line-clamp-2 min-h-[56px]">{module.title}</CardTitle>
                              <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{module.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-3 px-0 pt-0 pb-0">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <BookOpen size={14} />
                                  <span>Order: {module.order || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{module.estimated_duration || 0} min</span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                          {/* Footer always at the bottom */}
                          <div className="mt-auto px-6 pb-4">
                            <CardFooter className="p-0 flex flex-col gap-2">
                               {isContentAvailable && hasAccess ? (
                                <>
                                  <Button 
                                    className="w-full"
                                    onClick={() => {
                                      // Get resource_url from module data
                                      let fullUrl = module.resource_url;
                                      
                                      // If it's not already a full URL, prepend the API base URL
                                      if (fullUrl && !fullUrl.startsWith('http')) {
                                        fullUrl = `${import.meta.env.VITE_API_BASE_URL}${fullUrl}`;
                                      }
                                      
                                      // For S3 URLs, ensure they have the correct protocol
                                      if (fullUrl && fullUrl.includes('s3.amazonaws.com') && !fullUrl.startsWith('https://')) {
                                        fullUrl = fullUrl.replace('http://', 'https://');
                                      }
                                      
                                      // Open in new tab
                                      if (fullUrl) {
                                        window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                      } else {
                                        console.error('No resource URL found for module:', module);
                                      }
                                    }}
                                  >
                                    <Play size={16} className="mr-2" />
                                    Start Module
                                  </Button>
                                  <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/assessments`} className="w-full">
                                   <Button variant="outline" className="w-full">
                                      <FileText size={16} className="mr-2" />
                                      Start Assessment
                                    </Button> 
                                  </Link>
                                </>
                               ) : !isContentAvailable ? (
                                 <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                                   <Clock size={16} className="mr-2" />
                                   <span className="font-medium">Upcoming Module</span>
                                 </Button>
                               ) : isFromFreeCatalog(courseDetails) ? (
                                 <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                                   <Clock size={16} className="mr-2" />
                                   <span className="font-medium">
                                     {(() => {
                                       const courseTitle = (courseDetails?.title || "").toLowerCase();
                                       const isClassRecording = ["class recording", "class recordings", "course recording", "course recordings", "recordings", "recording"].some(keyword => 
                                         courseTitle.includes(keyword)
                                       );
                                       return isClassRecording ? "Upcoming Recording" : "Upcoming Course";
                                     })()}
                                   </span>
                                 </Button>
                               ) : (() => {
                                  const t = (courseDetails?.title || "").toLowerCase();
                                  const isMasterClassCourse = [
                                    "formation of business trust",
                                    "tier 1: optimizing your business credit profile"
                                  ].some(name => t.includes(name));
                                  if (isMasterClassCourse) {
                                    return (
                                      <div className="w-full flex flex-col gap-2">
                                        <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                                          <Clock size={16} className="mr-2" />
                                          <span className="font-medium">Upcoming</span>
                                        </Button>
                                      </div>
                                    );
                                  }
                                  return null;
                               })() || (
                                 <div className="w-full flex flex-col gap-2">
                                   <Button 
                                     className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200 disabled:opacity-60"
                                     onClick={() => {
                                       if (!modulePrice || modulePrice <= 0) return;
                                       if (!canUnlockInOrder) {
                                         handleSequentialUnlockClick(module);
                                         return;
                                       }
                                       if (balance < modulePrice) {
                                         setCreditsModalOpen(true);
                                         return;
                                       }
                                       setConfirmUnlock({ open: true, module });
                                     }}
                                     disabled={!modulePrice || unlockingId === module.id}
                                   >
                                     {unlockingId === module.id ? (
                                       <>
                                         <Clock size={16} className="mr-2 animate-spin" />
                                         Processing...
                                       </>
                                     ) : (
                                       <>
                                         <Unlock size={16} className="mr-2" />
                                         Unlock for {modulePrice} credits
                                       </>
                                     )}
                                   </Button>
                                   {balance < modulePrice && canUnlockInOrder && (
                                     <Button 
                                       variant="outline"
                                       className="w-full"
                                       onClick={() => setCreditsModalOpen(true)}
                                     >
                                       Buy credits
                                     </Button>
                                   )}
                                 </div>
                               )}
                            </CardFooter>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
                )
              }

              {/* Street Smart */}
              <div
                className={`w-full flex items-center justify-between px-6 py-6 rounded-2xl border-2 transition-colors cursor-default select-none ${
                  viewMode === "street" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-xl shadow-md">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg md:text-xl font-semibold text-gray-900">Street Smart</div>
                    <div className="text-base md:text-lg text-gray-600">Recorded lessons for this course</div>
                  </div>
                  <div className="ml-3 hidden sm:flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] rounded-full border font-semibold transition-all ${
                      viewMode === 'street'
                        ? 'bg-white text-purple-700 border-purple-400 ring-2 ring-purple-300/70 shadow-md'
                        : 'bg-gradient-to-b from-purple-50 to-purple-100 text-purple-800 border-purple-300'
                    }`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${viewMode === 'street' ? 'bg-purple-600' : 'bg-purple-500'}`}></span>
                      Recorded
                    </span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-300`} />
              </div>
              {
            streetLoading ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                <h3 className="text-lg font-medium">Loading recordings...</h3>
              </div>
            ) : streetError ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">{streetError}</h3>
                <p className="text-muted-foreground mt-1">Please try again later.</p>
              </div>
            ) : streetModules.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recordings found</h3>
                <p className="text-muted-foreground mt-1">Recordings may not be available yet for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streetModules
                  .filter((m) => (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (m.description || "").toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((module) => {
                  const isContentAvailable = !!module.resource_url;
                  const hasAccessRecording = isEnrolledRecording || unlockedIds.has(String(module.id));
                  const isLockedRecording = !hasAccessRecording;
                  const modulePrice = Number(module.price) > 0 ? Number(module.price) : getStableRandomPrice(module);
                  const recordingCourseId = getRecordingCourseIdForTitle(courseDetails?.title);
                  
                  // Debug logging for Street Smart access
                  console.log(`[Street Smart] Module ${module.id}: isEnrolledRecording=${isEnrolledRecording}, unlockedIds.has=${unlockedIds.has(String(module.id))}, hasAccessRecording=${hasAccessRecording}`);
                  return (
                    <div key={module.id} className="module-card h-full">
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={module.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                            alt={module.title}
                            className="w-full h-full object-cover"
                          />
                          {isLockedRecording && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="bg-white/95 rounded-lg p-3 shadow-xl flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-700" />
                                <span className="text-sm font-medium text-gray-800">Locked</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                          <CardHeader className="pb-2 px-0 pt-0">
                            <CardTitle className="text-lg line-clamp-2 min-h-[56px]">{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{module.description}</p>
                                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Order: {module.order || module.sequence || 1}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{module.duration || '60'} min</span>
                                  </div>
                                </div>
                          </CardHeader>
                        </div>
                        <div className="mt-auto px-6 pb-4">
                          <CardFooter className="p-0 flex flex-col gap-2">
                            {isContentAvailable && hasAccessRecording ? (
                              <>
                              <Button 
                                className="w-full"
                                onClick={() => {
                                      // Get resource_url from module data
                                  let fullUrl = module.resource_url;
                                      
                                      // If it's not already a full URL, prepend the API base URL
                                  if (fullUrl && !fullUrl.startsWith('http')) {
                                    fullUrl = `${import.meta.env.VITE_API_BASE_URL}${fullUrl}`;
                                  }
                                      
                                      // For S3 URLs, ensure they have the correct protocol
                                      if (fullUrl && fullUrl.includes('s3.amazonaws.com') && !fullUrl.startsWith('https://')) {
                                        fullUrl = fullUrl.replace('http://', 'https://');
                                      }
                                      
                                      // Open in new tab
                                  if (fullUrl) {
                                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                      } else {
                                        console.error('No resource URL found for module:', module);
                                  }
                                }}
                              >
                                <Play size={16} className="mr-2" />
                                    Start Module
                              </Button>
                                  <Link to={`/dashboard/courses/${recordingCourseId}/modules/${module.id}/assessments`} className="w-full">
                                   <Button variant="outline" className="w-full">
                                      <FileText size={16} className="mr-2" />
                                      Start Assessment
                                    </Button> 
                                  </Link>
                              </>
                            ) : !isContentAvailable ? (
                              <Button className="w-full" disabled>
                                <Clock size={16} className="mr-2" />
                                Upcoming Recording
                              </Button>
                            ) : (
                              <div className="w-full flex flex-col gap-2">
                                <Button 
                                  className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200 disabled:opacity-60"
                                  onClick={() => {
                                    if (!modulePrice || modulePrice <= 0) return;
                                    if (balance < modulePrice) {
                                      setCreditsModalOpen(true);
                                      return;
                                    }
                                    setConfirmUnlock({ open: true, module });
                                  }}
                                  disabled={!modulePrice || unlockingId === module.id}
                                >
                                  {unlockingId === module.id ? (
                                    <>
                                      <Clock size={16} className="mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Unlock size={16} className="mr-2" />
                                      Unlock recording for {modulePrice} credits
                                    </>
                                  )}
                                </Button>
                                {balance < modulePrice && (
                                  <Button 
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setCreditsModalOpen(true)}
                                  >
                                    Buy credits
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardFooter>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )
              }
            </div>
          )}

          {/* For non-eligible courses, show normal module grid without Book/Street headers */}
          {!isEligibleForTwoModes(courseDetails?.title) && (
            filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No modules found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search query" : "This course doesn't have any modules yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredModules.map((module) => {
                const isContentAvailable = !!module.resource_url;
                const hasAccess = isEnrolled || unlockedIds.has(String(module.id));
                const isLocked = !hasAccess;
                const modulePrice = Number(module.price) > 0 ? Number(module.price) : getStableRandomPrice(module);

                // Sequential unlock: allow only the first module or next after highest unlocked
                let canUnlockInOrder = false;
                if (isLocked) {
                  const allOrders = modules.map((m) => Number(m.order) || 0).filter((n) => n > 0);
                  const minOrder = allOrders.length ? Math.min(...allOrders) : 1;
                  const unlockedOrders = new Set(
                    modules
                      .filter((m) => unlockedIds.has(m.id))
                      .map((m) => Number(m.order) || 0)
                  );
                  const highestUnlocked = unlockedOrders.size ? Math.max(...Array.from(unlockedOrders)) : null;
                  const currentOrder = Number(module.order) || 0;
                  if (highestUnlocked == null) {
                    canUnlockInOrder = currentOrder === minOrder;
                  } else {
                    canUnlockInOrder = currentOrder === highestUnlocked + 1;
                  }
                }
                 
                
                return (
                  <div key={module.id} className="module-card h-full">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={module.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000"} 
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Lock overlay for locked modules */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white/95 rounded-lg p-3 shadow-xl flex items-center gap-2">
                              <Lock className="w-5 h-5 text-gray-700" />
                              <span className="text-sm font-medium text-gray-800">Locked</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Fixed height for content area, flex-grow to fill space */}
                      <div className="flex flex-col flex-grow min-h-[170px] max-h-[170px] px-6 pt-4 pb-2">
                        <CardHeader className="pb-2 px-0 pt-0">
                          <CardTitle className="text-lg line-clamp-2 min-h-[56px]">{module.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{module.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-3 px-0 pt-0 pb-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              <span>Order: {module.order || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{module.estimated_duration || 0} min</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                      {/* Footer always at the bottom */}
                      <div className="mt-auto px-6 pb-4">
                        <CardFooter className="p-0 flex flex-col gap-2">
                           {isContentAvailable && hasAccess ? (
                            <>
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  // Get resource_url from module data
                                  let fullUrl = module.resource_url;
                                  
                                  // If it's not already a full URL, prepend the API base URL
                                  if (fullUrl && !fullUrl.startsWith('http')) {
                                    fullUrl = `${import.meta.env.VITE_API_BASE_URL}${fullUrl}`;
                                  }
                                  
                                  // For S3 URLs, ensure they have the correct protocol
                                  if (fullUrl && fullUrl.includes('s3.amazonaws.com') && !fullUrl.startsWith('https://')) {
                                    fullUrl = fullUrl.replace('http://', 'https://');
                                  }
                                  
                                  // Open in new tab
                                  if (fullUrl) {
                                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                                  } else {
                                    console.error('No resource URL found for module:', module);
                                  }
                                }}
                              >
                                <Play size={16} className="mr-2" />
                                Start Module
                              </Button>
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/assessments`} className="w-full">
                               <Button variant="outline" className="w-full">
                                  <FileText size={16} className="mr-2" />
                                  Start Assessment
                                </Button> 
                              </Link>
                            </>
                           ) : !isContentAvailable ? (
                             <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                               <Clock size={16} className="mr-2" />
                               <span className="font-medium">Upcoming Module</span>
                             </Button>
                           ) : isFromFreeCatalog(courseDetails) ? (
                             <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                               <Clock size={16} className="mr-2" />
                               <span className="font-medium">
                                 {(() => {
                                   const courseTitle = (courseDetails?.title || "").toLowerCase();
                                   const isClassRecording = ["class recording", "class recordings", "course recording", "course recordings", "recordings", "recording"].some(keyword => 
                                     courseTitle.includes(keyword)
                                   );
                                   return isClassRecording ? "Upcoming Recording" : "Upcoming Course";
                                 })()}
                               </span>
                             </Button>
                           ) : (() => {
                              const t = (courseDetails?.title || "").toLowerCase();
                              const isMasterClassCourse = [
                                "formation of business trust",
                                "tier 1: optimizing your business credit profile"
                              ].some(name => t.includes(name));
                              if (isMasterClassCourse) {
                                return (
                                  <div className="w-full flex flex-col gap-2">
                                    <Button className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200" disabled>
                                      <Clock size={16} className="mr-2" />
                                      <span className="font-medium">Upcoming</span>
                                    </Button>
                                  </div>
                                );
                              }
                              return null;
                           })() || (
                             <div className="w-full flex flex-col gap-2">
                               <Button 
                                 className="w-full bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200 disabled:opacity-60"
                                 onClick={() => {
                                   if (!modulePrice || modulePrice <= 0) return;
                                   if (!canUnlockInOrder) {
                                     handleSequentialUnlockClick(module);
                                     return;
                                   }
                                   if (balance < modulePrice) {
                                     setCreditsModalOpen(true);
                                     return;
                                   }
                                   setConfirmUnlock({ open: true, module });
                                 }}
                                 disabled={!modulePrice || unlockingId === module.id}
                               >
                                 {unlockingId === module.id ? (
                                   <>
                                     <Clock size={16} className="mr-2 animate-spin" />
                                     Processing...
                                   </>
                                 ) : (
                                   <>
                                     <Unlock size={16} className="mr-2" />
                                     Unlock for {modulePrice} credits
                                   </>
                                 )}
                               </Button>
                               {balance < modulePrice && canUnlockInOrder && (
                                 <Button 
                                   variant="outline"
                                   className="w-full"
                                   onClick={() => setCreditsModalOpen(true)}
                                 >
                                   Buy credits
                                 </Button>
                               )}
                             </div>
                           )}
                        </CardFooter>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
            )
          )}
        </div>
      </main>
      {/* Confirm Unlock Dialog */}
      {confirmUnlock.open && confirmUnlock.module && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setConfirmUnlock({ open: false, module: null });
            setIsDescriptionExpanded(false);
          }} />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg p-6">
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <Unlock className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Unlock Lesson</h4>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-lg font-semibold text-gray-900 mb-2">{confirmUnlock.module.title}</div>
              <div className="text-sm text-gray-600 mb-3">
                {(() => {
                  const description = confirmUnlock.module.description || "Individual lesson from this course";
                  const maxLength = 200; // Character limit for truncated description
                  
                  if (description.length <= maxLength) {
                    return description;
                  }
                  
                  return (
                    <div>
                      {isDescriptionExpanded ? description : `${description.substring(0, maxLength)}...`}
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                      >
                        {isDescriptionExpanded ? 'View Less' : 'View More'}
                      </button>
                    </div>
                  );
                })()}
              </div>
              
              {/* Lesson Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">{confirmUnlock.module.duration || "Self-paced"}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <div className="text-sm font-semibold text-gray-900">Individual Lesson</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Lesson Cost:</span>
                <span className="text-lg font-bold text-purple-600">{Number(confirmUnlock.module.price) || 0} credits</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Your Balance:</span>
                <span className="text-sm font-semibold text-gray-900">{Number(balance) || 0} credits</span>
              </div>
              <div className="border-t border-purple-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">After Purchase:</span>
                  <span className="text-sm font-bold text-green-600">
                    {(Number(balance) || 0) - (Number(confirmUnlock.module.price) || 0)} credits
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
                    <strong>Note:</strong> This will unlock only this individual lesson. You can continue buying other lessons separately or purchase the entire course for better value.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md border hover:bg-gray-50" onClick={() => {
                setConfirmUnlock({ open: false, module: null });
                setIsDescriptionExpanded(false);
              }}>Cancel</button>
              <button 
                disabled={unlockingId === confirmUnlock.module?.id}
                className={`px-4 py-2 rounded-md text-white ${
                  unlockingId === confirmUnlock.module?.id 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={async () => {
                  if (unlockingId === confirmUnlock.module?.id) return; // Prevent double clicks
                  
                  const m = confirmUnlock.module;
                  const cost = Number(m.price) || 0;
                  setUnlockingId(m.id);
                  try {
                    await unlockContent('LESSON', m.id, cost);
                    await refreshBalance?.();
                    // Re-fetch unlocked list from backend to reflect source of truth
                    try {
                      if (userProfile?.id) {
                        console.log('[UI] Refresh unlocked IDs after unlock for', userProfile.id);
                        const fresh = await getUnlockedModulesByUser(userProfile.id);
                        console.log('[UI] Refreshed unlocked count', Array.isArray(fresh) ? fresh.length : 'not-array');
                        setUnlockedIds(new Set((fresh || []).map(d => String(d.module_id))));
                      }
                    } catch (err) {
                      console.error('[UI] Refresh unlocked IDs failed', err);
                    }
                  } catch (e) {
                    console.error('Failed to unlock lesson', e);
                  } finally {
                    setUnlockingId(null);
                    setConfirmUnlock({ open: false, module: null });
                  }
                }}
              >
                {unlockingId === confirmUnlock.module?.id ? 'Processing...' : 'Confirm Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      <CreditPurchaseModal open={creditsModalOpen} onClose={() => setCreditsModalOpen(false)} />

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
              <div className="text-sm text-gray-600 mb-3">
                {(() => {
                  const description = selectedCourseToBuy.description || "Complete course with multiple modules";
                  const maxLength = 200; // Character limit for truncated description
                  
                  if (description.length <= maxLength) {
                    return description;
                  }
                  
                  return (
                    <div>
                      {isDescriptionExpanded ? description : `${description.substring(0, maxLength)}...`}
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                      >
                        {isDescriptionExpanded ? 'View Less' : 'View More'}
                      </button>
                    </div>
                  );
                })()}
              </div>
              
              {/* Course Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedCourseToBuy.duration || "Self-paced"}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Modules</div>
                  <div className="text-sm font-semibold text-gray-900">{modules.length} modules</div>
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
                    <strong>Note:</strong> Buying this course will unlock all {modules.length} modules at once. You'll have immediate access to all content.
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
                    
                    // Also unlock the Street Smart (recording) course when applicable
                    try {
                      if (isEligibleForTwoModes(selectedCourseToBuy.title)) {
                        const recId = getRecordingCourseIdForTitle(selectedCourseToBuy.title);
                        if (recId) {
                          await unlockContent('COURSE', recId, 0);
                          // Frontend guarantee: mark recordings as enrolled to reflect unlocked UI immediately
                          setIsEnrolledRecording(true);
                          // Ensure recordings list is loaded so user immediately sees unlocked items
                          try {
                            if (!streetModules || streetModules.length === 0) {
                              const recMods = await fetchCourseModules(recId);
                              const published = (Array.isArray(recMods) ? recMods : []).filter((m) => {
                                const status = (m.module_status || m.status || "").toString().toUpperCase();
                                return status === "PUBLISHED" || m.published === true;
                              });
                              setStreetModules(published);
                            }
                          } catch {}
                        }
                      }
                    } catch (e) {
                      console.warn('[CourseView] Optional recording unlock failed:', e?.message || e);
                      // Even if backend unlock fails, reflect enrollment locally so UI shows access
                      try {
                        if (isEligibleForTwoModes(selectedCourseToBuy.title)) {
                          setIsEnrolledRecording(true);
                        }
                      } catch {}
                    }
                    
                    // Refresh balance to show updated credits
                    if (refreshBalance) {
                      await refreshBalance();
                    }
                    
                    // Refresh enrollment status
                    await checkEnrollmentStatus();
                    
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
                <div><span className="font-medium">Modules included:</span> {modules.length} modules</div>
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
                  setCreditsModalOpen(true);
                }}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sequential unlock modal */}
      {showSequentialModal && selectedModuleForSequential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeAllModals} />
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-6">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full mr-3">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lessons Must Be Unlocked in Order</h3>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 mb-6 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">Current Lesson:</div>
                <div><span className="font-medium">Title:</span> {selectedModuleForSequential.title}</div>
                <div><span className="font-medium">Order:</span> {selectedModuleForSequential.order}</div>
                <div><span className="font-medium">Price:</span> {Number(selectedModuleForSequential.price) || 0} credits</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="bg-orange-100 p-1 rounded-full mr-2">
                    <svg className="h-3 w-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium text-orange-800">Unlock Previous Lessons First</span>
                </div>
                <p className="text-orange-700 text-xs">
                  You need to unlock and complete the previous lessons in order before you can access this lesson.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeAllModals} 
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase notice */}
      {purchaseNotice && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-sm rounded-lg shadow-lg">
          {purchaseNotice}
        </div>
      )}
    </div>
  );
}

export default CourseView;


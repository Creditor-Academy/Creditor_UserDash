import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Play, BookOpen, Users, Calendar, Award, FileText, Lock, Unlock, ShoppingCart } from "lucide-react";
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
  };

  // Helper function to check if user can buy a course
  const canBuyCourse = (course) => {
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
        setModules(modulesData);
        setFilteredModules(modulesData);
        
        // Calculate total duration from modules
        const total = modulesData.reduce((sum, module) => {
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
                    
                    {/* Course Purchase Section */}
                    {!isEnrolled && canBuyCourse(courseDetails) && (
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
                    
                    {/* Course Not Available Message */}
                    {!isEnrolled && !canBuyCourse(courseDetails) && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-orange-800">Individual Lessons Only</p>
                            <p className="text-xs text-orange-600 mt-1">
                              You bought individual lessons from this course. 
                              You can only buy more individual lessons, not the whole course.
                            </p>
                          </div>
                        </div>
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
              <span className="font-mono text-lg">{modules.length}</span>
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

          {filteredModules.length === 0 ? (
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
                              <Link to={`/dashboard/courses/${courseId}/modules/${module.id}/view`} className="w-full">
                                <Button className="w-full">
                                  <Play size={16} className="mr-2" />
                                  Start Module
                                </Button>
                              </Link>
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
                           ) : (
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
          )}
        </div>
      </main>
      {/* Confirm Unlock Dialog */}
      {confirmUnlock.open && confirmUnlock.module && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmUnlock({ open: false, module: null })} />
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-6">
            <h4 className="text-lg font-semibold mb-2">Unlock Module</h4>
            <p className="text-sm text-gray-700 mb-4">Unlock "{confirmUnlock.module.title}" for {Number(confirmUnlock.module.price) || 0} credits?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md border hover:bg-gray-50" onClick={() => setConfirmUnlock({ open: false, module: null })}>Cancel</button>
              <button 
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                onClick={async () => {
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
                Confirm Unlock
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
          <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-5">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Course Purchase</h3>
            </div>
            <div className="text-sm text-gray-700 mb-4">
              <div className="mb-1"><span className="font-medium">Course:</span> {selectedCourseToBuy.title}</div>
              <div className="mb-1"><span className="font-medium">Price:</span> {selectedCourseToBuy.priceCredits || 0} credits</div>
              <div className="mb-1"><span className="font-medium">Your balance:</span> {Number(balance) || 0}</div>
              <div className="mb-1"><span className="font-medium">Modules included:</span> {modules.length} modules</div>
              <p className="mt-3 text-xs text-gray-600">Buying the course will unlock all modules in this course at once.</p>
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
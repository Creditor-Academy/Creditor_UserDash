import React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { 

  User, 

  Mail, 

  Calendar, 

  Clock, 

  BookOpen, 

  Award,

  MapPin,

  Phone,

  Globe,

  Activity,

  Shield,

  Users,

  GraduationCap,

  CreditCard,

  DollarSign,

  CheckCircle,

  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BookOpenCheck
} from "lucide-react";

import { fetchUserCoursesByUserId } from "@/services/userService";
import { fetchCourseModules, fetchCourseById, fetchCoursePrice } from "@/services/courseService";
import { getUnlockedModulesByUser } from "@/services/modulesService";

const UserDetailsModal = ({ isOpen, onClose, user, isLoading = false, error, isInstructorOrAdmin = false, viewerTimezone }) => {

  const [courses, setCourses] = React.useState([]);

  const [loadingCourses, setLoadingCourses] = React.useState(false);

  const [coursesError, setCoursesError] = React.useState(null);

  const [bioExpanded, setBioExpanded] = React.useState(false);
  const [courseModules, setCourseModules] = React.useState({});
  const [loadingModules, setLoadingModules] = React.useState({});
  const [modulesError, setModulesError] = React.useState({});
  const [expandedCourses, setExpandedCourses] = React.useState({});
  const [activeTab, setActiveTab] = React.useState('courses');
  const [purchasedModules, setPurchasedModules] = React.useState([]);
  const [loadingPurchasedModules, setLoadingPurchasedModules] = React.useState(false);
  const [purchasedModulesError, setPurchasedModulesError] = React.useState(null);
  const [coursePrices, setCoursePrices] = React.useState({});
  const [expandedModuleCourses, setExpandedModuleCourses] = React.useState({});
  const [totalModulesPerCourse, setTotalModulesPerCourse] = React.useState({});

  // Fetch courses for the selected user when modal opens or user changes

  React.useEffect(() => {

    if (isOpen && user?.id) {

      fetchCourses();

    }

  }, [isOpen, user?.id]);



  const fetchCourses = async () => {

    setLoadingCourses(true);

    setCoursesError(null);

    try {

      const coursesData = await fetchUserCoursesByUserId(user.id);
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      setCourses(coursesArray);
      
      // Fetch modules for each course
      if (coursesArray.length > 0) {
        fetchModulesForCourses(coursesArray);
        fetchPricesForCourses(coursesArray);
        fetchTotalModulesForCourses(coursesArray);
        // Fetch unlocked/purchased modules for the viewed user (single call)
        await fetchPurchasedModulesForUser(coursesArray);
      }
    } catch (error) {

      console.error("Failed to fetch courses:", error);

      setCoursesError("Failed to load courses");

    } finally {

      setLoadingCourses(false);

    }

  };
  
  // Removed per-course purchased modules flow

  // New: fetch unlocked/purchased modules for the viewed user directly
  const fetchPurchasedModulesForUser = async (coursesArray) => {
    setLoadingPurchasedModules(true);
    setPurchasedModulesError(null);
    try {
      const unlocked = await getUnlockedModulesByUser(user.id);
      const modulesArray = Array.isArray(unlocked) ? unlocked : [];
      // Build courseId -> title map from fetched courses
      const courseIdToTitle = new Map(
        (coursesArray || []).map((c) => [c.course_id || c.id, c.title || c?.course?.title || "Course"])
      );

      // Collect missing course ids that aren't in the map
      const missingIds = Array.from(new Set(
        modulesArray
          .map((m) => m.course_id || m.module?.course_id || m.courseId)
          .filter((id) => id && !courseIdToTitle.has(id))
      ));

      // Fetch titles for missing course ids
      if (missingIds.length > 0) {
        try {
          const fetched = await Promise.all(
            missingIds.map(async (id) => {
              try {
                const course = await fetchCourseById(id);
                return { id, title: course?.title || course?.name || "Course" };
              } catch (_) {
                return { id, title: "Course" };
              }
            })
          );
          fetched.forEach(({ id, title }) => courseIdToTitle.set(id, title));
        } catch (_) {
          // ignore; we'll fall back to Unknown Course
        }
      }
      const withCourseInfo = modulesArray.map((m) => {
        const normalized = {
          // Prefer top-level id/title; fallback to nested module object often returned by access APIs
          id: m.id || m.module?.id,
          title: m.title || m.module?.title || m.name || m.module_name || m.moduleTitle,
          course_id: m.course_id || m.module?.course_id || m.courseId,
          estimated_duration: m.estimated_duration || m.module?.estimated_duration,
          price: m.price || m.module?.price,
          thumbnail: m.thumbnail || m.module?.thumbnail,
          // include original for any other fields
          ...m,
        };
        return {
          ...normalized,
          course_title:
            m.course_title || m.module?.course_title || courseIdToTitle.get(normalized.course_id) || "Unknown Course",
        };
      });
      setPurchasedModules(withCourseInfo);
    } catch (err) {
      console.warn("getUnlockedModulesByUser failed, will fallback to per-course API", err);
      throw err;
    } finally {
      setLoadingPurchasedModules(false);
    }
  };

  // Fetch and cache course prices to display in Courses tab
  const fetchPricesForCourses = async (coursesArray) => {
    try {
      const entries = await Promise.all(
        (coursesArray || []).map(async (c) => {
          const id = c.course_id || c.id;
          if (!id) return null;
          try {
            const priceData = await fetchCoursePrice(id);
            const raw = (priceData && (priceData.price || priceData.amount || priceData)) ?? null;
            return raw != null ? [id, raw] : null;
          } catch (_) {
            return null;
          }
        })
      );
      const map = {};
      entries.forEach((e) => {
        if (e && e[0] != null) map[e[0]] = e[1];
      });
      setCoursePrices((prev) => ({ ...prev, ...map }));
    } catch (_) {
      // silently ignore pricing failures
    }
  };

  // Fetch total modules count for each course
  const fetchTotalModulesForCourses = async (coursesArray) => {
    try {
      const entries = await Promise.all(
        (coursesArray || []).map(async (c) => {
          const id = c.course_id || c.id;
          if (!id) return null;
          try {
            const response = await fetch(`/api/course/${id}/modules/getAllModules`);
            if (!response.ok) return null;
            const modules = await response.json();
            const totalCount = Array.isArray(modules) ? modules.length : 0;
            return [id, totalCount];
          } catch (_) {
            return null;
          }
        })
      );
      const map = {};
      entries.forEach((e) => {
        if (e && e[0] != null) map[e[0]] = e[1];
      });
      setTotalModulesPerCourse((prev) => ({ ...prev, ...map }));
    } catch (_) {
      // silently ignore failures
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return null;
    const str = String(price).trim().replace(/^\$/, "");
    return `$${str}`;
  };

  // Helper function to group modules by course
  const groupModulesByCourse = (modules) => {
    const grouped = {};
    modules.forEach(module => {
      const courseId = module.course_id || module.module?.course_id || module.courseId;
      const courseTitle = module.course_title || module.module?.course_title || 'Unknown Course';
      
      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseId,
          courseTitle,
          modules: []
        };
      }
      grouped[courseId].modules.push(module);
    });
    
    return Object.values(grouped);
  };

  // Helper function to get purchased modules count for a course
  const getPurchasedModulesCount = (courseId) => {
    return purchasedModules.filter(module => 
      (module.course_id || module.module?.course_id || module.courseId) === courseId
    ).length;
  };
  
  const fetchModulesForCourses = async (coursesArray) => {
    const modulesPromises = coursesArray.map(async (course) => {
      // ✅ use course.course_id if available
      const courseId = course.course_id || course.id;
      if (!courseId) return;
      
      setLoadingModules(prev => ({ ...prev, [courseId]: true }));
      setModulesError(prev => ({ ...prev, [courseId]: null }));
      
      try {
        const modules = await fetchCourseModules(courseId);
  
        const publishedModules = Array.isArray(modules)
          ? modules.filter(module => {
              const status = (module.module_status || module.status || "").toString().toUpperCase();
              return status === "PUBLISHED" || module.published === true;
            })
          : [];
        
        setCourseModules(prev => ({ ...prev, [courseId]: publishedModules }));
      } catch (error) {
        console.error(`Failed to fetch modules for course ${courseId}:`, error);
        setModulesError(prev => ({ ...prev, [courseId]: "Failed to load modules" }));
      } finally {
        setLoadingModules(prev => ({ ...prev, [courseId]: false }));
      }
    });
    
    await Promise.all(modulesPromises);
  };
  

  if (isLoading) {

    return (

      <Dialog open={isOpen} onOpenChange={onClose}>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-2">

              <User className="h-5 w-5" />

              User Details

            </DialogTitle>

          </DialogHeader>

          <div className="flex items-center justify-center py-12">

            <div className="text-center">

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>

              <p className="text-gray-600">Loading user details...</p>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    );

  }



  if (!user) {

    return (

      <Dialog open={isOpen} onOpenChange={onClose}>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle className="flex items-center gap-2">

              <User className="h-5 w-5" />

              User Details

            </DialogTitle>

          </DialogHeader>

          <div className="py-8">

            {error ? (

              <div className="p-4 bg-red-50 border border-red-200 rounded">

                <p className="text-sm text-red-700">{error}</p>

              </div>

            ) : (

              <p className="text-sm text-gray-600">No user data to display.</p>

            )}

          </div>

        </DialogContent>

      </Dialog>

    );

  }



  // Helper function to get user role from user_roles array

  const getUserRole = (user) => {

    if (user.user_roles && user.user_roles.length > 0) {

      const roles = user.user_roles.map(r => r.role);

      

      if (roles.includes('admin')) {

        return 'admin';

      } else if (roles.includes('instructor')) {

        return 'instructor';

      } else {

        const role = roles[0];

        return role;

      }

    }

    return 'user';

  };



  // Helper function to calculate time difference and format it

  const calculateTimeDifference = (lastLoginTime) => {

    if (!lastLoginTime) {

      return null;

    }



    // Normalize the last login as UTC-based date

    const lastLogin = new Date(lastLoginTime);



    // Get current time in viewer's timezone by formatting, then re-parsing to Date for diff

    // But re-parsing a formatted string can be lossy; instead compute diff in UTC directly

    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - lastLogin.getTime();

    

    const seconds = Math.floor(timeDifference / 1000);

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    const months = Math.floor(days / 30);

    const years = Math.floor(days / 365);



    if (years > 0) {

      return `${years} year${years > 1 ? 's' : ''} ago`;

    } else if (months > 0) {

      return `${months} month${months > 1 ? 's' : ''} ago`;

    } else if (days > 0) {

      return `${days} day${days > 1 ? 's' : ''} ago`;

    } else if (hours > 0) {

      return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    } else if (minutes > 0) {

      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    } else if (seconds > 0) {

      return `${seconds} second${seconds > 1 ? 's' : ''} ago`;

    } else {

      return 'Just now';

    }

  };



  // Helper function to get last visited from activity_log

  const getLastVisited = (user) => {

    if (user.activity_log && user.activity_log.length > 0) {

      const sortedLogs = user.activity_log.sort((a, b) => 

        new Date(b.createdAt) - new Date(a.createdAt)

      );

      const lastLoginTime = sortedLogs[0].createdAt;

      return calculateTimeDifference(lastLoginTime);

    }

    return null;

  };



  // Helper function to get role badge color

  const getRoleBadgeColor = (role) => {

    switch (role) {

      case 'admin':

        return 'bg-purple-100 text-purple-800';

      case 'instructor':

        return 'bg-blue-100 text-blue-800';

      case 'user':

        return 'bg-green-100 text-green-800';

      default:

        return 'bg-gray-100 text-gray-800';

    }

  };



  // Helper function to format date

  const formatDate = (dateString) => {

    if (!dateString) return 'Not available';

    const options = {

      year: 'numeric',

      month: 'long',

      day: 'numeric',

      hour: '2-digit',

      minute: '2-digit',

      timeZone: viewerTimezone || undefined,

    };

    try {

      return new Date(dateString).toLocaleString('en-US', options);

    } catch (e) {

      return new Date(dateString).toLocaleString('en-US');

    }

  };

  const getPaymentStatusBadge = (status) => {

    switch (status?.toLowerCase()) {

      case 'paid':

      case 'completed':

        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>;

      case 'pending':

        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;

      case 'failed':

      case 'declined':

        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;

      default:

        return <Badge variant="outline">Unknown</Badge>;

    }

  };



  const userRole = getUserRole(user);

  const lastVisited = getLastVisited(user);

  const lastActiveLabel = user.last_login ? formatDate(user.last_login) : (lastVisited || 'Never');



  return (

    <Dialog open={isOpen} onOpenChange={onClose}>

      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border-0">

        <DialogHeader className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200/60 rounded-t-2xl">

          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">

            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">

              <User className="h-6 w-6 text-white" />

            </div>

            User Details

          </DialogTitle>

        </DialogHeader>



        <div className="px-8 py-6 space-y-8 max-h-[calc(95vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

          {/* Basic Information */}

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/30 rounded-2xl overflow-hidden">

            <CardHeader className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">

              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">

                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">

                  <User className="h-5 w-5 text-white" />

                </div>

                Basic Information

              </CardTitle>

            </CardHeader>

            <CardContent className="px-6 py-6 space-y-6">

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

                {user.image ? (

                  <img

                    src={user.image}

                    alt={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User avatar'}

                    className="h-20 w-20 rounded-2xl object-cover flex-shrink-0 ring-4 ring-white shadow-lg"

                  />

                ) : (

                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-lg">

                    <span className="text-xl font-bold text-white">

                      {user.first_name?.[0]}{user.last_name?.[0]}

                    </span>

                  </div>

                )}

                <div className="flex-1 min-w-0">

                  <h3 className="text-2xl font-bold text-gray-900 break-words mb-2">

                    {user.first_name} {user.last_name}

                  </h3>

                  {isInstructorOrAdmin && (

                    <p className="text-sm text-gray-600 break-all mb-3 font-medium">{user.email}</p>

                  )}

                  <Badge className={`px-3 py-1 text-sm font-medium ${getRoleBadgeColor(userRole)} rounded-full`}>

                    {userRole}

                  </Badge>

                </div>

              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {isInstructorOrAdmin && (

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                      <Mail className="h-4 w-4 text-blue-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>

                      <p className="text-sm font-semibold text-gray-900 break-all">{user.email}</p>

                    </div>

                  </div>

                )}



                {isInstructorOrAdmin && (

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">

                      <Phone className="h-4 w-4 text-green-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>

                      <p className="text-sm font-semibold text-gray-900 break-all">{user.phone || 'Not set'}</p>

                    </div>

                  </div>

                )}

                

                {user.location && (

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">

                      <MapPin className="h-4 w-4 text-purple-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>

                      <p className="text-sm font-semibold text-gray-900 break-words">{user.location}</p>

                    </div>

                  </div>

                )}



                {isInstructorOrAdmin && (

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">

                      <User className="h-4 w-4 text-pink-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Gender</p>

                      <p className="text-sm font-semibold text-gray-900 capitalize">{user.gender || 'Not set'}</p>

                    </div>

                  </div>

                )}



                {user.website && (

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">

                      <Globe className="h-4 w-4 text-indigo-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Website</p>

                      <a 

                        href={user.website} 

                        target="_blank" 

                        rel="noopener noreferrer"

                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all transition-colors"

                      >

                        {user.website}

                      </a>

                    </div>

                  </div>

                )}



                {/* Social Handles - always show rows, fall back to Not set (Instagram removed) */}

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                    <Globe className="h-4 w-4 text-blue-600" />

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">LinkedIn</p>

                    {user?.social_handles?.linkedin ? (

                      <a 

                        href={user.social_handles.linkedin} 

                        target="_blank" 

                        rel="noopener noreferrer"

                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all transition-colors"

                      >

                        {user.social_handles.linkedin}

                      </a>

                    ) : (

                      <span className="text-sm font-semibold text-gray-500">Not set</span>

                    )}

                  </div>

                </div>



                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                    <Globe className="h-4 w-4 text-blue-600" />

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Facebook</p>

                    {user?.social_handles?.facebook ? (

                      <a 

                        href={user.social_handles.facebook} 

                        target="_blank" 

                        rel="noopener noreferrer"

                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all transition-colors"

                      >

                        {user.social_handles.facebook}

                      </a>

                    ) : (

                      <span className="text-sm font-semibold text-gray-500">Not set</span>

                    )}

                  </div>

                </div>



                {/* Bio moved to full-width below with graceful truncate */}

              </div>



              <div className="pt-6 mt-6 border-t border-gray-200/60">

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100/50">

                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">

                    <User className="h-4 w-4 text-amber-600" />

                  </div>

                  <div className="flex-1">

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Bio</p>

                    <div className="space-y-2">

                      {(() => {

                        const full = user.bio || 'Not set';

                        const limit = 180;

                        const isLong = typeof full === 'string' && full.length > limit;

                        const shown = bioExpanded || !isLong ? full : `${full.slice(0, limit)}…`;

                        return (

                          <>

                            <p className="text-sm font-medium text-gray-800 break-words whitespace-pre-line leading-relaxed">{shown}</p>

                            {isLong && (

                              <button

                                type="button"

                                onClick={() => setBioExpanded(!bioExpanded)}

                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-all duration-200"

                              >

                                {bioExpanded ? 'Show less' : 'Show more'}

                                {bioExpanded ? (

                                  <ChevronDown className="h-3 w-3" />

                                ) : (

                                  <ChevronRight className="h-3 w-3" />

                                )}

                              </button>

                            )}

                          </>

                        );

                      })()}

                    </div>

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>



          {/* Account Information - Only for instructors/admins */}

          {isInstructorOrAdmin && (

            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50/30 rounded-2xl overflow-hidden">

              <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100/50">

                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">

                  <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg shadow-sm">

                    <Shield className="h-5 w-5 text-white" />

                  </div>

                  Account Information

                </CardTitle>

              </CardHeader>

              <CardContent className="px-6 py-6 space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">

                      <Calendar className="h-4 w-4 text-blue-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Joined</p>

                      <p className="text-sm font-semibold text-gray-900">

                        {formatDate(user.created_at)}

                      </p>

                    </div>

                  </div>



                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">

                      <Clock className="h-4 w-4 text-green-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Active</p>

                      <p className="text-sm font-semibold text-gray-900">

                        {lastActiveLabel}

                      </p>

                    </div>

                  </div>



                  <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                    <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">

                      <Activity className="h-4 w-4 text-emerald-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>

                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-medium rounded-full">

                        Active

                      </Badge>

                    </div>

                  </div>



                  {user.last_login && (

                    <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">

                        <Clock className="h-4 w-4 text-purple-600" />

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Login</p>

                        <p className="text-sm font-semibold text-gray-900">

                          {formatDate(user.last_login)}

                        </p>

                      </div>

                    </div>

                  )}



                  {user.timezone && (

                    <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">

                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">

                        <Globe className="h-4 w-4 text-indigo-600" />

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Timezone</p>

                        <p className="text-sm font-semibold text-gray-900">{user.timezone}</p>

                      </div>

                    </div>

                  )}

                </div>

              </CardContent>

            </Card>

          )}

          {/* Enrolled */}
          {loadingCourses ? (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <GraduationCap className="h-4 w-4" />
                  Enrolled
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Loading courses...</p>

                </div>
              </CardContent>

            </Card>

          ) : coursesError ? (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <GraduationCap className="h-4 w-4" />
                  Enrolled
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{coursesError}</p>
                </div>
              </CardContent>

            </Card>
          ) : (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30 rounded-2xl overflow-hidden">
              <CardHeader className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                <CardTitle className="flex items-center gap-4 text-xl font-bold text-gray-800">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Enrolled
                  </span>
                  <Badge className="ml-auto bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-semibold rounded-full shadow-sm">
                    {activeTab === 'courses' ? `${courses.length} Course${courses.length !== 1 ? 's' : ''}` : `${purchasedModules.length} Module${purchasedModules.length !== 1 ? 's' : ''}`}
                  </Badge>
                </CardTitle>
                
                {/* Tab Navigation */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === 'courses'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4" />
                      Courses
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      activeTab === 'modules'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpenCheck className="h-4 w-4" />
                      Modules
                    </div>
                  </button>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6">
                <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {activeTab === 'courses' ? (
                    // Courses Tab
                    courses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <GraduationCap className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-3">No Enrollments</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">This user is not enrolled in any courses yet.</p>
                      </div>
                    ) : (
                    courses.map((course, index) => {
                      const courseId = course.course_id || course.id;
                      const modules = courseModules[courseId] || [];
                      const isLoadingModules = loadingModules[courseId] || false;
                      const modulesErrorMsg = modulesError[courseId];
                      const isExpanded = expandedCourses[courseId];
                      
                      return (
                        <div 
                          key={courseId || index} 
                          className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/60 hover:border-blue-300 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
                        >
                          {/* Course Header */}
                          <div className="p-6 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/30">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <BookOpen className="h-5 w-5 text-white" />
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                                    {course.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">
                                      {(() => {
                                        const purchasedCount = getPurchasedModulesCount(courseId);
                                        const totalCount = totalModulesPerCourse[courseId] || modules.length;
                                        return `${purchasedCount}/${totalCount} module${totalCount !== 1 ? 's' : ''}`;
                                      })()}
                                    </span>
                                  </div>
                                  {formatPrice(coursePrices[courseId]) && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-green-500" />
                                      <span className="font-semibold text-green-600">{formatPrice(coursePrices[courseId])}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Expand/Collapse Button */}
                              {modules.length > 0 && (
                                <button
                                  onClick={() => setExpandedCourses(prev => ({ 
                                    ...prev, 
                                    [courseId]: !prev[courseId] 
                                  }))}
                                  className="p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group-hover:bg-blue-100 shadow-sm hover:shadow-md"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Modules Section */}
                          {modules.length > 0 && (
                            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                              <div className="p-6 pt-4 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
                                {isLoadingModules ? (
                                  <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                      <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl animate-pulse">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                      </div>
                                    ))}
                                  </div>
                                ) : modulesErrorMsg ? (
                                  <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                                    <AlertCircle className="h-4 w-4" />
                                    {modulesErrorMsg}
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {modules.map((module, moduleIndex) => (
                                      <div 
                                        key={module.id || moduleIndex} 
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 group/module border border-gray-100/50"
                                      >
                                        <div className="flex-shrink-0">
                                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover/module:scale-125 transition-transform duration-200 shadow-sm"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-700 group-hover/module:text-gray-900 truncate">
                                            {module.title || module.module?.title || module.name || module.module_name || 'Untitled Module'}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* No Modules State */}
                          {!isLoadingModules && !modulesErrorMsg && modules.length === 0 && (
                            <div className="p-6 text-center">
                              <div className="flex flex-col items-center gap-3 text-gray-500">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium">No modules available yet</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                    )
                  ) : (
                    // Modules Tab
                    loadingPurchasedModules ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded-2xl border border-gray-200/60 p-6 animate-pulse shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                              <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                            </div>
                            <div className="space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : purchasedModulesError ? (
                      <div className="flex items-center gap-4 p-6 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <p className="text-sm font-semibold text-red-700">{purchasedModulesError}</p>
                      </div>
                    ) : purchasedModules.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <BookOpenCheck className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-3">No Purchased Modules</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">This user hasn't purchased any individual modules yet.</p>
                      </div>
                    ) : (
                      (() => {
                        const groupedModules = groupModulesByCourse(purchasedModules);
                        return groupedModules.map((courseGroup, courseIndex) => {
                          const isExpanded = expandedModuleCourses[courseGroup.courseId];
                          return (
                            <div 
                              key={courseGroup.courseId || courseIndex} 
                              className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200/60 hover:border-green-300 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                            >
                              {/* Course Header */}
                              <div className="p-6 border-b border-gray-100/60 bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                      <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                                        {courseGroup.courseTitle}
                                      </h3>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {(() => {
                                          const purchasedCount = courseGroup.modules.length;
                                          const totalCount = totalModulesPerCourse[courseGroup.courseId] || purchasedCount;
                                          return `${purchasedCount}/${totalCount} module${totalCount !== 1 ? 's' : ''} purchased`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Expand/Collapse Button */}
                                  <button
                                    onClick={() => setExpandedModuleCourses(prev => ({ 
                                      ...prev, 
                                      [courseGroup.courseId]: !prev[courseGroup.courseId] 
                                    }))}
                                    className="p-3 rounded-xl hover:bg-green-100 transition-all duration-200 group-hover:bg-green-200 shadow-sm hover:shadow-md"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-green-600 transition-colors duration-200" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-green-600 transition-colors duration-200" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Modules Section */}
                              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="p-6 pt-4 bg-gradient-to-r from-gray-50/50 to-green-50/30">
                                  <div className="space-y-3">
                                    {courseGroup.modules.map((module, moduleIndex) => (
                                      <div 
                                        key={module.id || moduleIndex} 
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 group/module border border-gray-100/50"
                                      >
                                        <div className="flex-shrink-0">
                                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full group-hover/module:scale-125 transition-transform duration-200 shadow-sm"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-700 group-hover/module:text-gray-900 truncate">
                                            {module.title || module.module?.title || module.name || module.module_name || 'Untitled Module'}
                                          </p>
                                          {formatPrice(module.price) && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <DollarSign className="h-3 w-3 text-green-500" />
                                              <p className="text-xs font-medium text-green-600">
                                                {formatPrice(module.price)}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-shrink-0">
                                          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-xs font-semibold rounded-full">
                                            Purchased
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )
                  )}
                </div>

              </CardContent>

            </Card>

          )}

          {/* Payment Status Section - Only for instructors/admins */}

          {isInstructorOrAdmin && ((Array.isArray(user?.payments) && user.payments.length > 0) || (Array.isArray(user?.subscriptions) && user.subscriptions.length > 0)) ? (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader className="pb-3 border-b border-gray-100">

                <CardTitle className="flex items-center gap-2 text-base">

                  <CreditCard className="h-4 w-4" />

                  Payment Status

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-4">

                  {/* Overall Payment Status */}

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">

                    <div className="flex items-center gap-3">

                      <DollarSign className="h-5 w-5 text-gray-600" />

                      <div>

                        <h4 className="text-sm font-medium">Payment Status</h4>

                        <p className="text-xs text-gray-500">

                          {user.payment_status || 'Sample payment information'}

                        </p>

                      </div>

                    </div>

                    {getPaymentStatusBadge(user.payment_status || 'completed')}

                  </div>



                  {/* Recent Payments */}

                  <div>

                    <h4 className="text-sm font-medium mb-2">Recent Payments</h4>

                    <div className="space-y-2 max-h-40 overflow-y-auto">

                      {(user.payments?.length > 0 ? user.payments : [

                        {

                          id: 1,

                          amount: 49.99,

                          description: "Premium Course Payment",

                          status: "completed",

                          createdAt: new Date().toISOString()

                        },

                        {

                          id: 2,

                          amount: 19.99,

                          description: "Basic Course Payment",

                          status: "completed",

                          createdAt: new Date(Date.now() - 86400000).toISOString()

                        }

                      ]).slice(0, 3).map((payment, index) => (

                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">

                          <div>

                            <p className="text-sm font-medium">

                              {payment.description || `Payment #${index + 1}`}

                            </p>

                            <p className="text-xs text-gray-500">

                              {formatDate(payment.createdAt)} • ${payment.amount}

                            </p>

                          </div>

                          {getPaymentStatusBadge(payment.status)}

                        </div>

                      ))}

                    </div>

                  </div>



                  {/* Subscriptions */}

                  <div>

                    <h4 className="text-sm font-medium mb-2">Subscriptions</h4>

                    <div className="space-y-2 max-h-40 overflow-y-auto">

                      {(user.subscriptions?.length > 0 ? user.subscriptions : [

                        {

                          id: 1,

                          plan_name: "Monthly Subscription",

                          amount: 9.99,

                          interval: "month",

                          status: "active",

                          start_date: new Date(Date.now() - 2592000000).toISOString(),

                          end_date: null

                        }

                      ]).map((sub, index) => (

                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">

                          <div>

                            <p className="text-sm font-medium">

                              {sub.plan_name || `Subscription Plan`}

                            </p>

                            <p className="text-xs text-gray-500">

                              {formatDate(sub.start_date)} - {sub.end_date ? formatDate(sub.end_date) : 'Ongoing'}

                            </p>

                          </div>

                          <div className="flex items-center gap-2">

                            <Badge variant="outline">

                              ${sub.amount}/{sub.interval}

                            </Badge>

                            {getPaymentStatusBadge(sub.status)}

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          ) : null}

          {/* Activity Information - Only for instructors/admins */}

          {isInstructorOrAdmin && user.activity_log && user.activity_log.length > 0 && (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader className="pb-3 border-b border-gray-100">

                <CardTitle className="flex items-center gap-2 text-base">

                  <Activity className="h-4 w-4" />

                  Recent Activity

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-3 max-h-40 overflow-y-auto">

                  {user.activity_log.slice(0, 5).map((activity, index) => (

                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">

                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>

                      <div className="flex-1">

                        <p className="text-sm font-medium text-gray-900">

                          {activity.action || 'Activity logged'}

                        </p>

                        <p className="text-xs text-gray-500">

                          {formatDate(activity.createdAt)}

                        </p>

                      </div>

                    </div>

                  ))}

                  {user.activity_log.length > 5 && (

                    <p className="text-xs text-gray-500 text-center">

                      +{user.activity_log.length - 5} more activities

                    </p>

                  )}

                </div>

              </CardContent>

            </Card>

          )}



          {/* Course Enrollments - Only for instructors/admins */}

          {isInstructorOrAdmin && user.course_enrollments && user.course_enrollments.length > 0 && (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader className="pb-3 border-b border-gray-100">

                <CardTitle className="flex items-center gap-2 text-base">

                  <BookOpen className="h-4 w-4" />

                  Course Enrollments

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-3 max-h-40 overflow-y-auto">

                  {user.course_enrollments.map((enrollment, index) => (

                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">

                      <div>

                        <p className="text-sm font-medium text-gray-900">

                          {enrollment.course?.title || 'Course'}

                        </p>

                        <p className="text-xs text-gray-500">

                          Enrolled: {formatDate(enrollment.createdAt)}

                        </p>

                      </div>

                      <Badge variant="outline">

                        {enrollment.status || 'Active'}

                      </Badge>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

          )}



          



          {/* System Information - Only for instructors/admins */}

          {isInstructorOrAdmin && (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader className="pb-3 border-b border-gray-100">

                <CardTitle className="flex items-center gap-2 text-base">

                  <Shield className="h-4 w-4" />

                  System Information

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-1 gap-4 text-sm">

                  <div>

                    <span className="text-gray-600">User ID:</span>

                    <span className="ml-2 font-mono text-xs">{user.id}</span>

                  </div>

                  <div>

                    <span className="text-gray-600">Updated:</span>

                    <span className="ml-2">{formatDate(user.updated_at)}</span>

                  </div>

                  {user.email_verified && (

                    <div>

                      <span className="text-gray-600">Email Verified:</span>

                      <Badge variant="outline" className="ml-2">

                        {user.email_verified ? 'Yes' : 'No'}

                      </Badge>

                    </div>

                  )}

                  {user.two_factor_enabled && (

                    <div>

                      <span className="text-gray-600">2FA Enabled:</span>

                      <Badge variant="outline" className="ml-2">

                        {user.two_factor_enabled ? 'Yes' : 'No'}

                      </Badge>

                    </div>

                  )}

                </div>

              </CardContent>

            </Card>

          )}

        </div>

      </DialogContent>

    </Dialog>

  );

};



export default UserDetailsModal;






                 






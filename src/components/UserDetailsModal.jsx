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
import { fetchUserCoursesByUserId, fetchAllCourses } from "@/services/userService";
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
  const [totalModuleCounts, setTotalModuleCounts] = React.useState({});
  const [expandedGrouped, setExpandedGrouped] = React.useState({});

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

      // Build courseId -> totalModules map from `_count.modules` coming from getCourses
      try {
        let countsMap = (coursesArray || []).reduce((acc, c) => {
          const id = c.course_id || c.courseId || c.id || c.course?.id || c.course?.course_id;
          if (!id) return acc;
          const total = (c._count && typeof c._count.modules === 'number')
            ? c._count.modules
            : (c.course && c.course._count && typeof c.course._count.modules === 'number')
              ? c.course._count.modules
              : (typeof c.modulesCount === 'number' ? c.modulesCount : undefined);
          if (typeof total === 'number') acc[String(id)] = Number(total);
          return acc;
        }, {});
        console.log('[UserDetailsModal] user courses IDs:', (coursesArray||[]).map(c => c.course_id || c.courseId || c.id || c.course?.id || c.course?.course_id));
        console.log('[UserDetailsModal] derived totals from user courses:', countsMap);

        // If any course is missing a count, fetch global courses to complete the map
        const missingIds = (coursesArray || [])
          .map(c => c.course_id || c.courseId || c.id || c.course?.id || c.course?.course_id)
          .filter(Boolean)
          .filter(id => countsMap[String(id)] === undefined);

        if (missingIds.length > 0) {
          const allCourses = await fetchAllCourses().catch(() => []);
          const globalMap = Array.isArray(allCourses) ? allCourses.reduce((acc, c) => {
            const gid = c.id || c.course_id || c.courseId;
            if (!gid) return acc;
            const gtotal = c?._count?.modules;
            if (typeof gtotal === 'number') acc[String(gid)] = Number(gtotal);
            return acc;
          }, {}) : {};
          countsMap = { ...globalMap, ...countsMap };
          console.log('[UserDetailsModal] filled totals from global getCourses for missingIds:', missingIds, 'globalMap:', globalMap);
        }
        setTotalModuleCounts(countsMap);
        console.log('[UserDetailsModal] final totalModuleCounts:', countsMap);
      } catch (_) {
        // ignore; UI will fallback to purchased count if absent
      }
      
      // Fetch modules for each course
      if (coursesArray.length > 0) {
        fetchModulesForCourses(coursesArray);
        fetchPricesForCourses(coursesArray);
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

      // Ensure we have total counts for any courseIds present only in purchased modules
      try {
        const purchasedCourseIds = Array.from(new Set(
          (withCourseInfo || [])
            .map(m => m.course_id || m.module?.course_id || m.courseId)
            .filter(Boolean)
        ));
        const missingForPurchased = purchasedCourseIds.filter(id => totalModuleCounts[String(id)] === undefined);
        if (missingForPurchased.length > 0) {
          const entries = await Promise.all(missingForPurchased.map(async (id) => {
            try {
              const mods = await fetchCourseModules(id);
              const count = Array.isArray(mods) ? mods.length : 0;
              // Also cache modules for use in rendering not-purchased rows (published only)
              const publishedModules = Array.isArray(mods)
                ? mods.filter(module => {
                    const status = (module.module_status || module.status || "").toString().toUpperCase();
                    return status === "PUBLISHED" || module.published === true;
                  })
                : [];
              return [id, count, publishedModules];
            } catch (_) {
              return [id, 0, []];
            }
          }));
          const map = entries.reduce((acc, [id, cnt]) => { acc[String(id)] = cnt; return acc; }, {});
          setTotalModuleCounts(prev => ({ ...map, ...prev }));
          // Merge modules into courseModules cache
          const modulesMap = entries.reduce((acc, [id, _cnt, mods]) => { acc[String(id)] = mods; return acc; }, {});
          setCourseModules(prev => ({ ...prev, ...modulesMap }));
          console.log('[UserDetailsModal] filled totals from purchased-only courses:', map);
        }
      } catch (_) {}
    } catch (err) {
      console.warn("getUnlockedModulesByUser failed, will fallback to per-course API", err);
      throw err;
    } finally {
      setLoadingPurchasedModules(false);
    }
  };

  // Fetch and cache course prices to display in Courses tab
  const fetchPricesForCourses = async (coursesArray) => {
    console.log('[UserDetailsModal] Fetching prices for courses. Note: 404 errors for /price endpoints are normal for free courses.');
    try {
      const entries = await Promise.all(
        (coursesArray || []).map(async (c) => {
          const id = c.course_id || c.id;
          if (!id) return null;
          
          // Skip price fetching for courses that are likely free or don't have individual pricing
          // This prevents unnecessary 404 errors in the console
          if (c.price === "0" || c.price === 0 || c.courseType === "FREE") {
            return null;
          }
          
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
    } catch (error) {
      console.warn('[UserDetailsModal] Price fetching failed:', error);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return null;
    const str = String(price).trim().replace(/^\$/, "");
    return `$${str}`;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader className="pb-2 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User avatar'}
                    className="h-16 w-16 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                    <span className="text-lg font-medium text-gray-700">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 break-words">
                    {user.first_name} {user.last_name}
                  </h3>
                  {isInstructorOrAdmin && (
                    <p className="text-sm text-gray-500 break-all">{user.email}</p>
                  )}
                  <Badge className={`mt-2 ${getRoleBadgeColor(userRole)}`}>
                    {userRole}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isInstructorOrAdmin && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Email:</span>
                    </div>
                    <span className="text-sm font-medium break-all sm:ml-6">{user.email}</span>
                  </div>
                )}

                {isInstructorOrAdmin && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Phone:</span>
                    </div>
                    <span className="text-sm font-medium break-all sm:ml-6">{user.phone || 'Not set'}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Location:</span>
                    </div>
                    <span className="text-sm font-medium break-words sm:ml-6">{user.location}</span>
                  </div>
                )}

                {isInstructorOrAdmin && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Gender:</span>
                    </div>
                    <span className="text-sm font-medium capitalize sm:ml-6">{user.gender || 'Not set'}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Website:</span>
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {user.website}
                    </a>
                  </div>
                )}

                {/* Social Handles - always show rows, fall back to Not set (Instagram removed) */}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">LinkedIn:</span>
                  {user?.social_handles?.linkedin ? (
                    <a 
                      href={user.social_handles.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {user.social_handles.linkedin}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Not set</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Facebook:</span>
                  {user?.social_handles?.facebook ? (
                    <a 
                      href={user.social_handles.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {user.social_handles.facebook}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Not set</span>
                  )}
                </div>

                {/* Bio moved to full-width below with graceful truncate */}
              </div>

              <div className="pt-3 mt-1 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Bio</span>
                    <div className="sm:ml-6 mt-1">
                      {(() => {
                        const full = user.bio || 'Not set';
                        const limit = 180;
                        const isLong = typeof full === 'string' && full.length > limit;
                        const shown = bioExpanded || !isLong ? full : `${full.slice(0, limit)}…`;
                        return (
                          <>
                            <p className="text-sm font-medium text-gray-700 break-words whitespace-pre-line">{shown}</p>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => setBioExpanded(!bioExpanded)}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {bioExpanded ? 'Show less' : 'Show more'}
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
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Joined:</span>
                    <span className="text-sm font-medium">
                      {formatDate(user.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last Active:</span>
                    <span className="text-sm font-medium">
                      {lastActiveLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>

                  {user.last_login && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Last Login:</span>
                      <span className="text-sm font-medium">
                        {formatDate(user.last_login)}
                      </span>
                    </div>
                  )}

                  {user.timezone && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Timezone:</span>
                      <span className="text-sm font-medium">{user.timezone}</span>
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
                <p className="text-sm text-gray-500">Loading courses...</p>
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
                <p className="text-sm text-red-500">{coursesError}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-gray-100 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="text-gray-800">Enrolled</span>
                  <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 border-gray-200">
                    {activeTab === 'courses' 
                      ? `${courses.length} Course${courses.length !== 1 ? 's' : ''}` 
                      : (() => {
                          // Group modules by course to get course count
                          const groupedModules = purchasedModules.reduce((acc, module) => {
                            const courseTitle = module.course_title || 'Unknown Course';
                            if (!acc[courseTitle]) {
                              acc[courseTitle] = [];
                            }
                            acc[courseTitle].push(module);
                            return acc;
                          }, {});
                          const courseCount = Object.keys(groupedModules).length;
                          return `${courseCount} Course${courseCount !== 1 ? 's' : ''}`;
                        })()
                    }
                  </Badge>
                </CardTitle>
                
                {/* Tab Navigation */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'courses'
                        ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Courses
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'modules'
                        ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4" />
                      Modules
                    </div>
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {activeTab === 'courses' ? (
                    // Courses Tab
                    courses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Enrollments</h3>
                        <p className="text-sm text-gray-500">This user is not enrolled in any courses yet.</p>
                      </div>
                    ) : (
                    courses.map((course, index) => {
                      const courseId = course.course_id || course.id;
                      const modules = courseModules[courseId] || [];
                      const isLoadingModules = loadingModules[courseId] || false;
                      const modulesErrorMsg = modulesError[courseId];
                      const isExpanded = expandedCourses[courseId];
                      const totalFromCounts = totalModuleCounts[String(courseId)];
                      const totalModulesForHeader = modules.length > 0
                        ? modules.length
                        : (typeof totalFromCounts === 'number' ? totalFromCounts : 0);
                      
                      return (
                        <div 
                          key={courseId || index} 
                          className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          {/* Course Header */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-gray-700" />
                                  </div>
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {course.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <BookOpenCheck className="h-3 w-3" />
                                    <span>{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  {formatPrice(coursePrices[courseId]) && (
                                    <div className="flex items-center gap-1">
                                      <span>{formatPrice(coursePrices[courseId])}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Right-side controls */}
                              <div className="flex items-center gap-2">
                                {/* Total modules pill */}
                                <span
                                  className="hidden sm:inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-white border border-gray-200 text-gray-700"
                                  title={`Total modules in ${course.title}`}
                                >
                                  {`Total ${totalModulesForHeader} Module${totalModulesForHeader !== 1 ? 's' : ''}`}
                                </span>

                                {/* Expand/Collapse Button */}
                                {modules.length > 0 && (
                                  <button
                                    onClick={() => setExpandedCourses(prev => ({ 
                                      ...prev, 
                                      [courseId]: !prev[courseId] 
                                    }))}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    aria-label={isExpanded ? 'Collapse modules' : 'Expand modules'}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-600" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Modules Section */}
                          {modules.length > 0 && (
                            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                              <div className="p-4 pt-2 bg-gray-50">
                                {isLoadingModules ? (
                                  <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                      <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                                      </div>
                                    ))}
                                  </div>
                                ) : modulesErrorMsg ? (
                                  <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                                    <AlertCircle className="h-3 w-3" />
                                    {modulesErrorMsg}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {modules.map((module, moduleIndex) => (
                                      <div 
                                        key={module.id || moduleIndex} 
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group/module"
                                      >
                                        <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-700 group-hover/module:text-gray-900 truncate">
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
                            <div className="p-4 text-center">
                              <div className="flex flex-col items-center gap-2 text-gray-500">
                                <BookOpen className="h-8 w-8 text-gray-300" />
                                <p className="text-xs">No modules available yet</p>
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
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : purchasedModulesError ? (
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-700">{purchasedModulesError}</p>
                      </div>
                    ) : purchasedModules.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpenCheck className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Purchased Modules</h3>
                        <p className="text-sm text-gray-500">This user hasn't purchased any individual modules yet.</p>
                      </div>
                    ) : (() => {
                      // Group purchased modules by courseId while keeping course title for display
                      const groupedByCourse = purchasedModules.reduce((acc, m) => {
                        const cid = m.course_id || m.module?.course_id || m.courseId;
                        if (!cid) return acc;
                        const title = m.course_title || m.module?.course_title || 'Unknown Course';
                        if (!acc[cid]) acc[cid] = { title, items: [] };
                        acc[cid].items.push(m);
                        return acc;
                      }, {});
                      console.log('[UserDetailsModal] groupedByCourse keys:', Object.keys(groupedByCourse));

                      return Object.entries(groupedByCourse).map(([courseId, group]) => {
                        const getModuleId = (x) => {
                          try {
                            const val = x?.id || x?.module?.id || x?.module_id || x?.moduleId || x?.uuid || x?._id;
                            return val != null ? String(val) : '';
                          } catch { return ''; }
                        };
                        const isExpanded = Boolean(expandedGrouped[courseId]);
                        const allMods = courseModules[courseId] || [];
                        // Build a set of purchased module ids to diff
                        const purchasedIds = new Set(
                          group.items.map((m) => getModuleId(m)).filter(Boolean)
                        );
                        // Non-purchased = all course modules (published) that are not in purchased set
                        const notPurchased = allMods.filter((mod) => {
                          const mid = getModuleId(mod);
                          return mid && !purchasedIds.has(mid);
                        });
                        const purchasedCount = group.items.length;
                        const totalForCourse = totalModuleCounts[String(courseId)];
                        const actualTotal = allMods.length > 0 ? allMods.length : (typeof totalForCourse === 'number' ? totalForCourse : purchasedCount);
                        const showNotPurchased = purchasedCount < actualTotal && notPurchased.length > 0;
                        
                        // Debug logging for inconsistent counts
                        if (purchasedCount === actualTotal && notPurchased.length > 0) {
                          console.warn(`[UserDetailsModal] Inconsistent module counts for course ${courseId}:`, {
                            purchased: purchasedCount,
                            totalFromCounts: totalForCourse,
                            actualModules: allMods.length,
                            notPurchased: notPurchased.length,
                            purchasedIds: Array.from(purchasedIds),
                            allModuleIds: allMods.map(m => getModuleId(m))
                          });
                        }
                        return (
                        <div key={courseId} className="space-y-3">
                          {/* Course Header */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                               onClick={() => setExpandedGrouped(prev => ({ ...prev, [courseId]: !prev[courseId] }))}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                <BookOpen className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                  {group.title}
                                </h3>
                                <p className="text-xs text-blue-700/90">
                                  {(() => {
                                    const purchased = group.items.length;
                                    const total = totalModuleCounts[String(courseId)];
                                    const allMods = courseModules[courseId] || [];
                                    const actualTotal = allMods.length > 0 ? allMods.length : (typeof total === 'number' ? total : purchased);
                                    return `${purchased} purchased of ${actualTotal} total`;
                                  })()}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-white/70 text-blue-700 border-blue-300 shadow-sm">
                                {(() => {
                                  const total = totalModuleCounts[String(courseId)];
                                  const allMods = courseModules[courseId] || [];
                                  const actualTotal = allMods.length > 0 ? allMods.length : (typeof total === 'number' ? total : group.items.length);
                                  return `Total ${actualTotal} Module${actualTotal !== 1 ? 's' : ''}`;
                                })()}
                              </Badge>
                              <button type="button"
                                      onClick={(e) => { e.stopPropagation(); setExpandedGrouped(prev => ({ ...prev, [courseId]: !prev[courseId] })); }}
                                      className="ml-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-blue-600" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Modules under this course */}
                          <div className={`ml-4 space-y-2 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            {isExpanded && group.items.length > 0 && (
                              <div className="sticky top-0 z-0 -mb-1 text-[11px] text-gray-500 px-1 select-none">Purchased</div>
                            )}
                            {isExpanded && group.items.map((module, index) => (
                        <div 
                          key={module.id || index} 
                                className="group relative overflow-hidden bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                        >
                                <div className="p-3">
                            <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md group-hover:scale-110 transition-transform duration-200">
                                      <BookOpenCheck className="h-3 w-3 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-200 truncate mb-1">
                                  {module.title || module.module?.title || module.name || module.module_name || 'Untitled Module'}
                                      </h4>
                                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                  {formatPrice(module.price) && (
                                    <div className="flex items-center gap-1">
                                      <span>{formatPrice(module.price)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                                  Purchased
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                            ))}
                            {isExpanded && showNotPurchased && (
                              <div className="pt-2 mt-1 border-t border-gray-100" />
                            )}
                            {isExpanded && showNotPurchased && (
                              <div className="sticky top-0 z-0 -mb-1 text-[11px] text-gray-500 px-1 select-none">Not Purchased</div>
                            )}
                            {isExpanded && showNotPurchased && notPurchased.map((module, index) => (
                              <div 
                                key={(module.id || module.module?.id || `np-${index}`)} 
                                className="group relative overflow-hidden bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                              >
                                <div className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-gray-200 rounded-md">
                                      <BookOpenCheck className="h-3 w-3 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-700 truncate mb-1">
                                        {module.title || module.module?.title || module.name || module.module_name || 'Untitled Module'}
                                      </h4>
                                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                        {formatPrice(module.price) && (
                                          <div className="flex items-center gap-1">
                                            <span>{formatPrice(module.price)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px]">
                                        Not Purchased
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                      });
                    })()
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



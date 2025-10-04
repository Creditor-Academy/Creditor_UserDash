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

  AlertCircle

} from "lucide-react";

import { fetchUserCoursesByUserId } from "@/services/userService";


import { fetchCourseModules } from "@/services/courseService";



const UserDetailsModal = ({ isOpen, onClose, user, isLoading = false, error, isInstructorOrAdmin = false, viewerTimezone }) => {

  const [courses, setCourses] = React.useState([]);

  const [loadingCourses, setLoadingCourses] = React.useState(false);

  const [coursesError, setCoursesError] = React.useState(null);

  const [bioExpanded, setBioExpanded] = React.useState(false);

  const [loadingModules, setLoadingModules] = React.useState(false);

  const [modulesByCourse, setModulesByCourse] = React.useState({});
  const [moduleProgress, setModuleProgress] = React.useState({});


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

      setCourses(Array.isArray(coursesData) ? coursesData : []);

    } catch (error) {

      console.error("Failed to fetch courses:", error);

      setCoursesError("Failed to load courses");

    } finally {

      setLoadingCourses(false);

    }

  };



  // Fetch published modules for each enrolled course

  React.useEffect(() => {

    const loadPublishedModules = async () => {

      if (!isOpen || !user?.id || courses.length === 0) return;

      setLoadingModules(true);

      try {




        // For each enrolled course, fetch its modules and show only PUBLISHED modules
        const results = await Promise.all(

          courses.map(async (c) => {

            try {

              const allModules = await fetchCourseModules(c.id);

              const courseModules = Array.isArray(allModules) ? allModules : [];
              
              // Filter to show only published modules
              const publishedModules = courseModules.filter(module => 
                module.published === true || module.status === 'published' || module.is_published === true
              );
              
              console.log(`Course ${c.id} has ${courseModules.length} total modules, ${publishedModules.length} published:`, publishedModules);
              return [c.id, publishedModules];
            } catch (e) {

              console.error(`Error fetching modules for course ${c.id}:`, e);
              return [c.id, []];

            }

          })

        );



        const map = {};

        results.forEach(([cid, arr]) => { map[cid] = arr; });

        setModulesByCourse(map);

        // Simulate module progress for published modules (in a real app, this would come from the API)
        const progressMap = {};
        results.forEach(([courseId, modules]) => {
          progressMap[courseId] = {};
          modules.forEach((module, index) => {
            // Simulate progress: some modules completed, some in progress
            const isCompleted = Math.random() > 0.6;
            const progress = isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;
            progressMap[courseId][module.id] = {
              completed: isCompleted,
              progress: progress,
              lastAccessed: isCompleted ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
            };
          });
        });
        setModuleProgress(progressMap);
      } catch (e) {

        // Non-fatal; leave map empty

        setModulesByCourse({});
        setModuleProgress({});
      } finally {

        setLoadingModules(false);

      }

    };



    loadPublishedModules();

  }, [isOpen, user?.id, courses]);



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



          {/* Enrolled Courses with Modules */}
          {loadingCourses ? (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <GraduationCap className="h-4 w-4" />

                  Enrolled Courses
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

                  Enrolled Courses
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{coursesError}</p>
                </div>
              </CardContent>

            </Card>

          ) : courses.length === 0 ? (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <GraduationCap className="h-4 w-4" />

                  Enrolled Courses
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No courses enrolled</p>
                </div>
              </CardContent>

            </Card>

          ) : (

            <Card className="shadow-sm border border-gray-100">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <GraduationCap className="h-4 w-4" />

                  Enrolled Courses & Modules
                </CardTitle>

              </CardHeader>

              <CardContent>

                {/* Course Progress Summary */}
                {courses.length > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">Overall Progress</h4>
                      <span className="text-xs text-gray-500">
                        {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">Total Modules:</span>
                        <span className="ml-2 font-medium">
                          {courses.reduce((total, course) => total + (modulesByCourse?.[course.id]?.length || 0), 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completed:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {courses.reduce((total, course) => {
                            const modules = modulesByCourse?.[course.id] || [];
                            return total + modules.filter(module => moduleProgress[course.id]?.[module.id]?.completed).length;
                          }, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {courses.map((course, index) => {

                    const modules = modulesByCourse?.[course.id] || [];
                    const totalModules = modules.length;
                    
                    return (

                      <div key={course.id || index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {course.title}

                            </h4>
                            {course.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {totalModules} module{totalModules !== 1 ? 's' : ''}
                              </span>
                              {course.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                              )}
                            </div>
                            {totalModules > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600">Course Progress</span>
                                  <span className="text-xs font-medium text-gray-700">
                                    {(() => {
                                      const completedModules = modules.filter(module => 
                                        moduleProgress[course.id]?.[module.id]?.completed
                                      ).length;
                                      const percentage = Math.round((completedModules / totalModules) * 100);
                                      return `${completedModules}/${totalModules} (${percentage}%)`;
                                    })()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${(() => {
                                        const completedModules = modules.filter(module => 
                                          moduleProgress[course.id]?.[module.id]?.completed
                                        ).length;
                                        return Math.round((completedModules / totalModules) * 100);
                                      })()}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Enrolled
                          </Badge>
                        </div>
                        
                        <div className="border-t border-blue-200 pt-3">
                          {loadingModules ? (

                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <p className="text-xs text-gray-500">Loading modules...</p>

                            </div>
                          ) : totalModules > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-700 mb-2">Available Modules:</p>
                              <div className="grid gap-2">
                                {modules.map((module, moduleIndex) => {
                                  const progress = moduleProgress[course.id]?.[module.id];
                                  const isCompleted = progress?.completed || false;
                                  const progressPercent = progress?.progress || 0;
                                  
                                  return (
                                    <div key={module.id || moduleIndex} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                                      <div className="flex-shrink-0">
                                        <div className={`h-2 w-2 rounded-full ${
                                          isCompleted ? 'bg-green-500' : 
                                          progressPercent > 0 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}></div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">
                                          {module.title || `Module ${moduleIndex + 1}`}
                                        </p>
                                        {module.description && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {module.description}
                                          </p>
                                        )}
                                        {progress && (
                                          <div className="mt-1">
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 bg-gray-200 rounded-full h-1">
                                                <div 
                                                  className={`h-1 rounded-full transition-all duration-300 ${
                                                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                  }`}
                                                  style={{ width: `${progressPercent}%` }}
                                                ></div>
                                              </div>
                                              <span className="text-xs text-gray-500">
                                                {progressPercent}%
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${
                                            isCompleted ? 'bg-green-100 text-green-800 border-green-200' :
                                            progressPercent > 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                            'bg-blue-100 text-blue-800 border-blue-200'
                                          }`}
                                        >
                                          {isCompleted ? 'Completed' : 
                                           progressPercent > 0 ? 'In Progress' : 'Unlocked'}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-3">
                              <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">No modules available for this course</p>
                            </div>
                          )}

                        </div>

                      </div>

                    );

                  })}

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






                 






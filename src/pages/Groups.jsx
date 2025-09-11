import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Users2, Calendar, MessageSquare, ArrowRight, BookOpen, UserPlus, Check, Lock } from "lucide-react";
import { getGroups, addGroupMember } from "@/services/groupService";
import { fetchUserCourses, fetchAllCourses } from "@/services/courseService";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { isInstructorOrAdmin } from "@/services/userService";

// Initial empty state for groups
const initialGroups = [];

export function Groups() {
  const { userProfile } = useUser();
  const [groups, setGroups] = useState(initialGroups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [joiningGroup, setJoiningGroup] = useState(null);
  const [activeView, setActiveView] = useState("common"); // "common" or "course"
  const groupsPerPage = 6; // Show 6 groups per page (2 rows of 3 in grid)
  const [userCourses, setUserCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);

  // Check if current user is admin or instructor
  const isAdminOrInstructor = isInstructorOrAdmin();

  // Resolve a displayable course name for a course group
  const getCourseDisplayName = (group) => {
    if (!group) return "Course";
    if (group.courseName && group.courseName.trim().length > 0) return group.courseName;
    // Prefer looking up from allCourses to ensure accuracy
    const matchAll = allCourses.find(c => (c.id === group.courseId || c.course_id === group.courseId));
    if (matchAll) return matchAll.name || matchAll.title || matchAll.course_name || "Course";
    // Fallback to user's courses if necessary
    const matchUser = userCourses.find(c => (c.id === group.courseId || c.course_id === group.courseId));
    return matchUser?.name || matchUser?.title || matchUser?.course_name || "Course";
  };

  // Fetch user's enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      setLoadingCourses(true);
      const courses = await fetchUserCourses();
      setUserCourses(courses || []);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      setUserCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch all courses (for resolving course names on course groups)
  const fetchAllCoursesList = async () => {
    try {
      setLoadingAllCourses(true);
      const courses = await fetchAllCourses();
      setAllCourses(Array.isArray(courses) ? courses : []);
    } catch (error) {
      console.error("Error fetching all courses:", error);
      setAllCourses([]);
    } finally {
      setLoadingAllCourses(false);
    }
  };

  // Check if user is enrolled in a course
  const isUserEnrolledInCourse = (courseId) => {
    if (!courseId || !userCourses.length) return false;
    return userCourses.some(course => course.id === courseId || course.course_id === courseId);
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getGroups();
      
      if (response.success && response.data) {
        // Transform API data to match our component's expected format
        const transformedGroups = response.data.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          members: group.members ? group.members.length : 0,
          active: true, // Default to active since API doesn't have this field
          featured: false, // Default to false since API doesn't have this field
          lastActivity: "Recently", // Default since API doesn't have this field
          type: group.course_id ? "course" : "common", // Determine type based on course_id
          courseName: group.course_name || "", // API doesn't have course name
          courseId: group.course_id || null,
          createdAt: group.createdAt,
          createdBy: group.created_by,
          membersList: group.members || [],
          isMember: group.members ? group.members.some(member => 
            member.user_id === userProfile?.id || member.id === userProfile?.id
          ) : false
        }));
        
                 // Sort groups by creation date (latest first)
         const sortedGroups = transformedGroups.sort((a, b) => 
           new Date(b.createdAt) - new Date(a.createdAt)
         );
         
         setGroups(sortedGroups);
         setCurrentPage(1); // Reset to first page when fetching new data
      } else {
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError(error.message);
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    if (!groupId) return;
    
    try {
      setJoiningGroup(groupId);
      console.log("📤 Groups: Joining group:", groupId);
      
      await addGroupMember(groupId); // No userId means self-join
      
      toast.success("Successfully joined the group!");
      
      // Refresh groups to update member status
      await fetchGroups();
    } catch (error) {
      console.error("❌ Groups: Error joining group:", error);
      toast.error(error?.response?.data?.message || error.message || "Failed to join group");
    } finally {
      setJoiningGroup(null);
    }
  };

  // Fetch groups, user courses, and all courses on component mount
  useEffect(() => {
    fetchGroups();
    fetchUserEnrolledCourses();
    fetchAllCoursesList();
  }, []);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const visible = normalized
      ? groups.filter(
          (g) =>
            g.name.toLowerCase().includes(normalized) ||
            g.description.toLowerCase().includes(normalized)
        )
      : groups;
    
    // Apply additional filters
    let filtered = visible;
    if (filterBy === "featured") {
      filtered = filtered.filter(g => g.featured);
    } else if (filterBy === "popular") {
      filtered = filtered.filter(g => g.members > 15);
    } else if (filterBy === "course") {
      filtered = filtered.filter(g => g.type === "course");
    } else if (filterBy === "common") {
      filtered = filtered.filter(g => g.type === "common");
    }
    
    // Apply sorting: always show joined groups first, then apply selected sort
    const sorted = [...filtered].sort((a, b) => {
      if (a.isMember !== b.isMember) return a.isMember ? -1 : 1;
      if (sortBy === "members") return b.members - a.members;
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });
    
         return sorted;
   }, [query, sortBy, filterBy, groups]);

  // Filter groups based on active view
  const viewGroups = useMemo(() => {
    if (activeView === "common") {
      return filteredGroups.filter(g => g.type !== "course");
    } else {
      return filteredGroups.filter(g => g.type === "course");
    }
  }, [filteredGroups, activeView]);

   // Pagination logic
  const totalPages = Math.ceil(viewGroups.length / groupsPerPage);
   const startIndex = (currentPage - 1) * groupsPerPage;
   const endIndex = startIndex + groupsPerPage;
  const currentGroups = viewGroups.slice(startIndex, endIndex);

   const goToPage = (page) => {
     setCurrentPage(page);
   };

   const goToNextPage = () => {
     if (currentPage < totalPages) {
       setCurrentPage(currentPage + 1);
     }
   };

   const goToPrevPage = () => {
     if (currentPage > 1) {
       setCurrentPage(currentPage - 1);
     }
   };

  // Reset to first page when switching views
  const handleViewChange = (view) => {
    setActiveView(view);
    setCurrentPage(1);
  };

  return (
    <div className="container py-6 md:py-8 max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Learning Communities</h1>
            <p className="text-gray-600 mt-2">
              Connect with peers, share knowledge, and collaborate on learning journeys.
            </p>
          </div>
          
         
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeView === "common" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("common")}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeView === "common" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="h-4 w-4" />
              Common Groups
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-1">
                {filteredGroups.filter(g => g.type !== "course").length}
              </span>
            </Button>
            <Button
              variant={activeView === "course" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("course")}
              className={`flex items-center gap-2 px-4 py-2 ${
                activeView === "course" 
                  ? "bg-white text-purple-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Course Groups
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-1">
                {filteredGroups.filter(g => g.type === "course").length}
              </span>
            </Button>
          </div>
          
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              
              
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-gray-700"
                >
                  <option value="all">All Groups</option>
                  <option value="featured">Featured</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-gray-600 text-sm">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-gray-700"
                >
                  <option value="name">Name</option>
                  <option value="members">Members</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading groups...</div>
          <p className="text-gray-500 mt-1 text-sm">Please wait while we fetch the latest groups</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-xl bg-red-50">
          <div className="text-red-500 mb-3">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-lg font-medium text-red-700">Error loading groups</div>
          <p className="text-red-600 mt-1 text-sm mb-4">{error}</p>
          <Button onClick={fetchGroups} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && viewGroups.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {viewGroups.length} {activeView === "common" ? "common" : "course"} group{viewGroups.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Groups grid */}
      {!isLoading && !error && (
        <>
          {viewGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
              {activeView === "common" ? (
              <Users2 className="h-12 w-12 text-gray-400 mb-4" />
              ) : (
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              )}
              <div className="text-lg font-medium text-gray-700">
                No {activeView === "common" ? "common" : "course"} groups found
              </div>
              <p className="text-gray-500 mt-1 text-sm max-w-md">
                {activeView === "common" 
                  ? "Try adjusting your search or filters to find relevant communities."
                  : "No course-specific groups available at the moment."
                }
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-gray-300 text-gray-700"
                onClick={() => {
                  setQuery("");
                  setFilterBy("all");
                  setSortBy("name");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentGroups.map((group) => (
                  <Card 
                    key={group.id} 
                    className="relative overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 h-full w-1 ${
                    group.type === "course" ? "bg-purple-500" : "bg-blue-500"
                  }`} />
                  
                  {/* Course tag for course groups */}
                  {group.type === "course" && group.courseName && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                        {group.courseName}
                      </span>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg font-semibold text-gray-800 group-hover:${
                      group.type === "course" ? "text-purple-600" : "text-blue-600"
                    } transition-colors`}>
                        {group.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        group.type === "course" 
                          ? "bg-purple-50 text-purple-700" 
                          : "bg-blue-50 text-blue-700"
                      }`}>
                          <Users className="h-3 w-3" /> {group.members} members
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Last activity: {group.lastActivity}
                      </div>
                    </CardContent>
                    
                  <CardFooter className="relative border-t border-gray-100 bg-gray-50/50 py-3 flex justify-between">
                    {group.isMember ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled
                          className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          Joined
                        </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                          className={`gap-1 hover:bg-gray-100 ${
                            group.type === "course" 
                              ? "text-purple-600 hover:text-purple-700" 
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                      >
                        <Link to={`/dashboard/groups/${group.id}/news`}>
                            View Group <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      </>
                    ) : group.type === "course" && !isUserEnrolledInCourse(group.courseId) ? (
                      // Course group - user not enrolled (locked)
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm font-medium">Group Locked</span>
                        </div>
                        <p className="text-xs text-gray-600 text-center">
                          Enroll into <span className="font-medium text-purple-600">"{getCourseDisplayName(group)}"</span> to join this group
                        </p>
                      </div>
                    ) : (
                      // Common group or enrolled course group
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={joiningGroup === group.id}
                        className={`gap-1 ${
                          group.type === "course" 
                            ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50" 
                            : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        {joiningGroup === group.id ? "Joining..." : "Join Group"}
                      </Button>
                    )}

                    {/* Overlay when locked */}
                    {group.type === "course" && !group.isMember && !isUserEnrolledInCourse(group.courseId) && (
                      <div className="absolute inset-0 bg-purple-200/30 pointer-events-none rounded-b-xl" />
                    )}
                  </CardFooter>
                  </Card>
                ))}
                 </div>
           )}

           {/* Pagination Controls */}
           {totalPages > 1 && (
             <div className="flex items-center justify-center gap-2 mt-8">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={goToPrevPage}
                 disabled={currentPage === 1}
                 className="px-3 py-1"
               >
                 Previous
               </Button>
               
               <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }, (_, index) => {
                   const pageNumber = index + 1;
                   // Show current page, first page, last page, and pages around current
                   if (
                     pageNumber === 1 ||
                     pageNumber === totalPages ||
                     (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                   ) {
                     return (
                       <Button
                         key={pageNumber}
                         variant={currentPage === pageNumber ? "default" : "outline"}
                         size="sm"
                         onClick={() => goToPage(pageNumber)}
                         className="px-3 py-1 min-w-[40px]"
                       >
                         {pageNumber}
                       </Button>
                     );
                   } else if (
                     pageNumber === currentPage - 2 ||
                     pageNumber === currentPage + 2
                   ) {
                     return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                   }
                   return null;
                 })}
               </div>
               
               <Button
                 variant="outline"
                 size="sm"
                 onClick={goToNextPage}
                 disabled={currentPage === totalPages}
                 className="px-3 py-1"
               >
                 Next
               </Button>
             </div>
           )}

           {/* Page Info */}
           {totalPages > 1 && (
             <div className="text-center text-sm text-gray-500 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, viewGroups.length)} of {viewGroups.length} groups
             </div>
           )}
         </>
       )}
     </div>
   );
 }

export default Groups;
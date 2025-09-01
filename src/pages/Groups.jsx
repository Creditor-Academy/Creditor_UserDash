import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Users2, Calendar, MessageSquare, ArrowRight, BookOpen } from "lucide-react";
import { getGroups } from "@/services/groupService";
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
  const groupsPerPage = 6; // Show 6 groups per page (2 rows of 3 in grid)

  // Check if current user is admin or instructor
  const isAdminOrInstructor = isInstructorOrAdmin();

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
          type: "common", // Default to common since API doesn't have this field
          courseName: "", // API doesn't have course name
          createdAt: group.createdAt,
          createdBy: group.created_by,
          membersList: group.members || []
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

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
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
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "members") return b.members - a.members;
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });
    
         return sorted;
   }, [query, sortBy, filterBy, groups]);

   // Pagination logic
   const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);
   const startIndex = (currentPage - 1) * groupsPerPage;
   const endIndex = startIndex + groupsPerPage;
   const currentGroups = filteredGroups.slice(startIndex, endIndex);

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
              <Button
                onClick={fetchGroups}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                <div className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}>
                  {isLoading ? (
                    <div className="rounded-full border-2 border-gray-300 border-t-gray-600 h-full w-full"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                Refresh
              </Button>
              
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-gray-700"
                >
                  <option value="all">All Groups</option>
                  <option value="common">Common Groups</option>
                  <option value="course">Course Groups</option>
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
      {!isLoading && !error && filteredGroups.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Groups grid */}
      {!isLoading && !error && (
        <>
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Users2 className="h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-700">No groups found</div>
              <p className="text-gray-500 mt-1 text-sm max-w-md">
                Try adjusting your search or filters to find relevant communities.
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
        <div className="space-y-8">
                     {/* Common groups */}
           {currentGroups.filter((g) => g.type !== "course").length > 0 && (
             <div>
               <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <Users className="h-5 w-5 text-blue-600" />
                 Common Groups
                 <span className="text-sm font-normal text-gray-500 ml-2">
                   ({filteredGroups.filter((g) => g.type !== "course").length})
                 </span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {currentGroups.filter((g) => g.type !== "course").map((group) => (
                  <Card 
                    key={group.id} 
                    className="overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="h-2 w-full bg-blue-500" />
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
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
                    
                    <CardFooter className="border-t border-gray-100 bg-gray-50/50 py-3 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Link to={`/dashboard/groups/${group.id}/news`}>
                          View group <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

                     {/* Course-specific groups */}
           {currentGroups.filter((g) => g.type === "course").length > 0 && (
             <div>
               <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <BookOpen className="h-5 w-5 text-blue-600" />
                 Course Groups
                 <span className="text-sm font-normal text-gray-500 ml-2">
                   ({filteredGroups.filter((g) => g.type === "course").length})
               </span>
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {currentGroups.filter((g) => g.type === "course").map((group) => (
                  <Card 
                    key={group.id} 
                    className="relative overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="h-2 w-full bg-blue-500" />
                    
                    {/* Course tag */}
                    {group.courseName && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          {group.courseName}
                        </span>
                      </div>
                    )}

                    <CardHeader className="pb-3 pr-10">
                      <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
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
                    
                    <CardFooter className="border-t border-gray-100 bg-gray-50/50 py-3 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Link to={`/dashboard/groups/${group.id}/news`}>
                          View group <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
               Showing {startIndex + 1}-{Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} groups
             </div>
           )}
         </>
       )}
     </div>
   );
 }

export default Groups;
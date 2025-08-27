import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Users2, Calendar, MessageSquare, ArrowRight, BookOpen } from "lucide-react";

// Dummy data for groups
const groups = [
  { 
    id: 1, 
    name: "Web Development", 
    members: 24, 
    description: "Learn modern web development techniques together",
    active: true,
    featured: true,
    lastActivity: "2 hours ago",
    type: "common"
  },
  { 
    id: 2, 
    name: "Data Science", 
    members: 18, 
    description: "Explore data analysis and machine learning",
    active: true,
    featured: false,
    lastActivity: "5 hours ago",
    type: "common"
  },
  { 
    id: 3, 
    name: "Mobile App Development", 
    members: 15, 
    description: "Build cross-platform mobile applications",
    active: true,
    featured: true,
    lastActivity: "1 day ago",
    type: "course",
    courseName: "React Native"
  },
  { 
    id: 4, 
    name: "UI/UX Design", 
    members: 12, 
    description: "Master user interface and experience design principles",
    active: true,
    featured: false,
    lastActivity: "3 days ago",
    type: "common"
  },
  { 
    id: 5, 
    name: "Cloud Computing", 
    members: 8, 
    description: "Discuss cloud technologies and best practices",
    active: true,
    featured: false,
    lastActivity: "1 week ago",
    type: "course",
    courseName: "AWS Fundamentals"
  },
  { 
    id: 6, 
    name: "Digital Marketing", 
    members: 21, 
    description: "Share strategies for effective online marketing",
    active: true,
    featured: true,
    lastActivity: "Yesterday",
    type: "common"
  },
];

export function Groups() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

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
      if (sortBy === "recent") return b.id - a.id;
      return a.name.localeCompare(b.name);
    });
    
    return sorted;
  }, [query, sortBy, filterBy]);

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

      {/* Results count */}
      {filteredGroups.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Groups grid */}
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
          {filteredGroups.filter((g) => g.type !== "course").length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Common Groups
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredGroups.filter((g) => g.type !== "course").length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGroups.filter((g) => g.type !== "course").map((group) => (
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
          {filteredGroups.filter((g) => g.type === "course").length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Course Groups
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredGroups.filter((g) => g.type === "course").length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGroups.filter((g) => g.type === "course").map((group) => (
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
    </div>
  );
}

export default Groups;
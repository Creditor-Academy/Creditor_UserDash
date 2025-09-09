import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Users2, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getGroups } from "@/services/groupService";
import { toast } from "sonner";

export default function DashboardGroup() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getGroups();
        
        if (response.success && response.data) {
          // Transform API data and sort by member count (descending)
          const transformedGroups = response.data
            .map(group => ({
              id: group.id,
              name: group.name,
              description: group.description,
              memberCount: group.members ? group.members.length : 0,
              createdAt: group.createdAt,
              createdBy: group.created_by,
              type: "common", // Default type since API doesn't have this field
              courseName: "", // API doesn't have course name
              isPrivate: false, // Default to false
              members: group.members || []
            }))
            .sort((a, b) => b.memberCount - a.memberCount) // Sort by member count descending
            .slice(0, 4); // Take top 4 groups
          
          setGroups(transformedGroups);
        } else {
          throw new Error(response.message || "Failed to fetch groups");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError(error.message);
        toast.error("Failed to load popular groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Helper function to get color based on group index
  const getGroupColor = (index) => {
    const colors = ['blue', 'green', 'purple', 'orange'];
    return colors[index % colors.length];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };
  // Color mapping for different group types
  const colorMap = {
    blue: {
      bg: "bg-blue-500",
      lightBg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-100"
    },
    green: {
      bg: "bg-green-500",
      lightBg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      hover: "hover:bg-green-100"
    },
    purple: {
      bg: "bg-purple-500",
      lightBg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-100"
    },
    orange: {
      bg: "bg-orange-500",
      lightBg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:bg-orange-100"
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
              <Users2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Learning Communities</h3>
              <p className="text-sm text-gray-600 mt-1">Connect with peers and share knowledge</p>
            </div>
          </div>
          <Button 
            asChild 
            className="gap-1 bg-blue-600 text-white hover:bg-blue-700 hidden sm:flex shadow-sm"
          >
            <Link to="/dashboard/groups">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-3">
            <Users2 className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <p className="text-red-600 text-sm mb-3">Failed to load popular groups</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-8">
          <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No groups available yet</p>
        </div>
      )}

      {/* Groups Grid */}
      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((group, index) => {
            const groupColor = getGroupColor(index);
            const colors = colorMap[groupColor];
            
            return (
              <Card 
                key={group.id} 
                className={`relative overflow-hidden border ${colors.border} hover:shadow-md transition-all duration-300 group h-full`}
              >
                {/* Colorful header strip */}
                <div className={`absolute top-0 left-0 right-0 h-2 ${colors.bg}`}></div>
                
                <CardContent className="p-5 h-full flex flex-col pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.lightBg} ${colors.text}`}>
                        {group.type === 'course' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className={`text-base font-semibold text-gray-800 group-hover:${colors.text} transition-colors line-clamp-1`}>
                          {group.name}
                        </h4>
                        {group.type === 'course' && group.courseName && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            {group.courseName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs ${colors.text} border ${colors.border} shadow-sm`}>
                        <Users className="h-3 w-3" />
                        {group.memberCount}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {group.description || "Join this community to connect with like-minded learners"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Active • {formatDate(group.createdAt)}</span>
                    </div>
                    
                    <Button 
                      size="sm"
                      asChild
                      className={`text-xs h-8 px-3 ${colors.text} ${colors.hover} border ${colors.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <Link to="/dashboard/groups">
                        View Groups
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Mobile view all button */}
      <div className="mt-6 flex sm:hidden">
        <Button 
          asChild 
          className="gap-1 bg-blue-600 text-white hover:bg-blue-700 w-full shadow-sm"
        >
          <Link to="/dashboard/groups">
            View all communities <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
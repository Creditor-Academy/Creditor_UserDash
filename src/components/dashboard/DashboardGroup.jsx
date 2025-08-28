import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Users2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

// Lightweight preview dataset
const previewGroups = [
  { 
    id: 1, 
    name: "Web Development", 
    members: 24, 
    description: "Learn modern web development techniques and frameworks", 
    active: true,
    lastActivity: "2 hours ago",
    type: "common",
    color: "blue"
  },
  { 
    id: 2, 
    name: "Data Science", 
    members: 18, 
    description: "Explore data analysis, visualization and machine learning", 
    active: true,
    lastActivity: "5 hours ago",
    type: "common",
    color: "green"
  },
  { 
    id: 3, 
    name: "UI/UX Design", 
    members: 12, 
    description: "Master user interface and experience design principles", 
    active: true,
    lastActivity: "1 day ago",
    type: "course",
    courseName: "Design Basics",
    color: "purple"
  },
  { 
    id: 4, 
    name: "Mobile App Development", 
    members: 15, 
    description: "Build cross-platform mobile applications", 
    active: true,
    lastActivity: "Yesterday",
    type: "course",
    courseName: "React Native",
    color: "orange"
  },
];

export default function DashboardGroup() {
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

      {/* Colorful Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {previewGroups.map((group) => {
          const colors = colorMap[group.color];
          
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
                      {group.members}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                  {group.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Active • {group.lastActivity}</span>
                  </div>
                  
                  <Button 
                    size="sm"
                    className={`text-xs h-8 px-3 ${colors.text} ${colors.hover} border ${colors.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
                  >
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
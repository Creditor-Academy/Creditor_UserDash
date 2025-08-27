import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Users2, MessageSquare, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

// Lightweight preview dataset. Replace with API data if available
const previewGroups = [
  { 
    id: 1, 
    name: "Web Development", 
    members: 24, 
    description: "Learn modern web development techniques and frameworks", 
    active: true,
    lastActivity: "2 hours ago",
    type: "common"
  },
  { 
    id: 2, 
    name: "Data Science", 
    members: 18, 
    description: "Explore data analysis, visualization and machine learning", 
    active: true,
    lastActivity: "5 hours ago",
    type: "common"
  },
  { 
    id: 3, 
    name: "UI/UX Design", 
    members: 12, 
    description: "Master user interface and experience design principles", 
    active: true,
    lastActivity: "1 day ago",
    type: "course",
    courseName: "Design Basics"
  },
  { 
    id: 4, 
    name: "Mobile App Development", 
    members: 15, 
    description: "Build cross-platform mobile applications", 
    active: true,
    lastActivity: "Yesterday",
    type: "course",
    courseName: "React Native"
  },
];

export default function DashboardGroup() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Learning Communities</h3>
            <p className="text-sm text-gray-500 mt-1">Connect with peers and share knowledge</p>
          </div>
        </div>
        <Button 
          asChild 
          variant="ghost" 
          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Link to="/dashboard/groups">
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Common groups */}
      {previewGroups.filter(g => g.type !== 'course').length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Common Groups</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {previewGroups.filter(g => g.type !== 'course').map((group) => (
              <Card 
                key={group.id} 
                className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Users className="h-3 w-3" /> {group.members} members
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Active
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Last activity: {group.lastActivity}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Course groups */}
      {previewGroups.filter(g => g.type === 'course').length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Course Groups</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {previewGroups.filter(g => g.type === 'course').map((group) => (
              <Card 
                key={group.id} 
                className="relative overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
                {group.courseName && (
                  <span className="absolute top-2 right-2 inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">
                    {group.courseName}
                  </span>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Users className="h-3 w-3" /> {group.members} members
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      Active
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Last activity: {group.lastActivity}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
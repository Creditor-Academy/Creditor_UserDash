import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Medal, Star, Target, BookOpen, CheckCircle } from "lucide-react";

// Utility function to get badge count and data (can be used by other components)
export const getBadgeData = (badges = null) => {
  const mockBadges = badges || [
    { id: 1, name: "Perfect Attendance", description: "Achieved 100% attendance in course events", type: "attendance", courseName: "Introduction to Web Development", percentage: 100, icon: "trophy", color: "gold", earnedDate: "2024-01-15" },
    { id: 2, name: "Quiz Master", description: "Scored 90% or higher on all quizzes", type: "quiz", courseName: "JavaScript Fundamentals", percentage: 95, icon: "medal", color: "silver", earnedDate: "2024-01-20" },
    { id: 3, name: "Assessment Expert", description: "Passed all assessments with excellence", type: "assessment", courseName: "React Advanced", percentage: 88, icon: "star", color: "bronze", earnedDate: "2024-01-25" },
    { id: 4, name: "Consistent Learner", description: "Maintained 85%+ attendance", type: "attendance", courseName: "Node.js Backend", percentage: 87, icon: "award", color: "blue", earnedDate: "2024-02-01" }
  ];

  // Determine the top/highlighted badge using a simple priority on color
  const colorPriority = { gold: 4, silver: 3, bronze: 2, blue: 1 };
  const topBadge = [...mockBadges].sort((a, b) => (colorPriority[b.color] || 0) - (colorPriority[a.color] || 0))[0] || null;

  return { badges: mockBadges, count: mockBadges.length, hasBadges: mockBadges.length > 0, topBadge };
};

// Small helper: choose a per-user top badge deterministically so not everyone shows the same badge
export const getTopBadgeForUser = (userKey, badges = null) => {
  const { badges: list } = getBadgeData(badges);
  if (!list || list.length === 0) return null;
  if (!userKey) return list[0];
  // Simple string hash
  let hash = 0;
  const str = String(userKey);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // keep 32-bit
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
};

// For tiny chip background colors
export const getBadgeChipBg = (color) => {
  switch (color) {
    case "gold":
      return "bg-yellow-500 text-white";
    case "silver":
      return "bg-gray-400 text-white";
    case "bronze":
      return "bg-amber-600 text-white";
    case "blue":
      return "bg-blue-500 text-white";
    default:
      return "bg-primary text-white";
  }
};

// Export a tiny icon renderer for reuse
export const renderBadgeIconSmall = (iconType) => {
  switch (iconType) {
    case "trophy":
      return <Trophy className="h-3.5 w-3.5" />;
    case "medal":
      return <Medal className="h-3.5 w-3.5" />;
    case "star":
      return <Star className="h-3.5 w-3.5" />;
    case "award":
      return <Award className="h-3.5 w-3.5" />;
    default:
      return <Award className="h-3.5 w-3.5" />;
  }
};

const UserBadges = ({ badges = null, isLoading = false }) => {
  // Mock badges data for frontend display (will be replaced with API data later)
  const mockBadges = badges || getBadgeData().badges;

  const getBadgeIcon = (iconType) => {
    switch (iconType) {
      case "trophy":
        return <Trophy className="h-6 w-6" />;
      case "medal":
        return <Medal className="h-6 w-6" />;
      case "star":
        return <Star className="h-6 w-6" />;
      case "award":
        return <Award className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  const getBadgeColorClasses = (color) => {
    switch (color) {
      case "gold":
        return { bg: "bg-gradient-to-br from-yellow-400 to-yellow-600", text: "text-yellow-700", border: "border-yellow-300", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" };
      case "silver":
        return { bg: "bg-gradient-to-br from-gray-300 to-gray-500", text: "text-gray-700", border: "border-gray-300", badge: "bg-gray-50 text-gray-700 border-gray-200" };
      case "bronze":
        return { bg: "bg-gradient-to-br from-amber-600 to-amber-800", text: "text-amber-700", border: "border-amber-300", badge: "bg-amber-50 text-amber-700 border-amber-200" };
      case "blue":
        return { bg: "bg-gradient-to-br from-blue-400 to-blue-600", text: "text-blue-700", border: "border-blue-300", badge: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return { bg: "bg-gradient-to-br from-primary to-purple-400", text: "text-primary", border: "border-primary/30", badge: "bg-primary/10 text-primary border-primary/20" };
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "attendance":
        return "Attendance";
      case "quiz":
        return "Quiz Performance";
      case "assessment":
        return "Assessment";
      default:
        return "Achievement";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            Badges & Achievements
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Your learning achievements and milestones</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mockBadges || mockBadges.length === 0) {
    return (
      <Card className="w-full transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            Badges & Achievements
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Your learning achievements and milestones</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Badges Yet</h3>
            <p className="text-sm text-gray-500">Complete courses, attend events, and pass quizzes to earn badges!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
          Badges & Achievements
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Your learning achievements and milestones</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockBadges.map((badge) => {
            const colors = getBadgeColorClasses(badge.color);
            return (
              <div key={badge.id} className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 p-5">
                <div className="flex items-start gap-4">
                  {/* Badge Icon */}
                  <div className={`${colors.bg} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  
                  {/* Badge Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">{badge.name}</h3>
                      <Badge className={`${colors.badge} text-xs font-medium`}>{getTypeLabel(badge.type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{badge.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><BookOpen className="h-3 w-3" /><span className="truncate max-w-[150px]">{badge.courseName}</span></div>
                      {badge.type === "attendance" && (<div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>{badge.percentage}%</span></div>)}
                      {(badge.type === "quiz" || badge.type === "assessment") && (<div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /><span>{badge.percentage}%</span></div>)}
                    </div>
                    {badge.earnedDate && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Earned on {new Date(badge.earnedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserBadges;

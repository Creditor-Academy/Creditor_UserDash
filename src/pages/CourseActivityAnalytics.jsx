import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  BookOpen,
  Calendar,
  Activity,
  BarChart3,
  RefreshCw,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { fetchCourseAnalytics, fetchCourseAndEnrollments } from '@/services/analyticsService';
import { toast } from 'sonner';

export function CourseActivityAnalytics() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [mostActiveCourses, setMostActiveCourses] = useState([]);
  const [mostInactiveCourses, setMostInactiveCourses] = useState([]);
  const [allCoursesActivity, setAllCoursesActivity] = useState([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0
  });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both analytics data and course/enrollment counts
      const [analyticsData, courseEnrollmentData] = await Promise.all([
        fetchCourseAnalytics(),
        fetchCourseAndEnrollments()
      ]);

      // Set course stats from the new API
      setCourseStats({
        totalCourses: courseEnrollmentData.CourseCount || 0,
        totalEnrollments: courseEnrollmentData.TotalEnrollments || 0
      });
      
      // Map backend data to frontend format
      const mapCourse = (course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        course_level: course.course_level,
        enrollments: course.total_enrolled_users,
        activeUsers: course.enrolled_last_30_days,
        // Calculate activity rate as completion rate indicator
        completionRate: course.total_enrolled_users > 0 
          ? Math.round((course.enrolled_last_30_days / course.total_enrolled_users) * 100)
          : 0,
        trend: course.enrolled_last_30_days > 0 ? 'up' : 'down',
      });

      // Map all courses first
      const allMappedCourses = (analyticsData.allCourseAnalytics || []).map(mapCourse);
      
      // Sort by enrolled_last_30_days (activeUsers) instead of total enrollments
      const sortedByLast30Days = [...allMappedCourses].sort(
        (a, b) => b.activeUsers - a.activeUsers
      );
      
      // Get top 3 most active (highest enrolled_last_30_days)
      const top3Active = sortedByLast30Days.slice(0, 3);
      
      // Get bottom 3 least active (lowest enrolled_last_30_days)
      const least3Active = sortedByLast30Days.slice(-3).reverse();
      
      setMostActiveCourses(top3Active);
      setMostInactiveCourses(least3Active);
      setAllCoursesActivity(sortedByLast30Days);
      
      toast.success('Course analytics loaded successfully');
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
      toast.error('Failed to load course analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Format course level badge
  const formatCourseLevel = (level) => {
    const levels = {
      BEGINNER: { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-300' },
      INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      ADVANCE: { label: 'Advanced', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    };
    return levels[level] || levels.BEGINNER;
  };

  // Render course card with clean design
  const renderCourseCard = (course, index, isActive = true) => (
    <div
      key={course.id}
      className="group relative bg-white rounded-lg md:rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Top section with thumbnail and info */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 md:p-5">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base md:text-lg ${
              index === 0
                ? 'bg-yellow-400 text-white'
                : index === 1
                ? 'bg-gray-400 text-white'
                : index === 2
                ? 'bg-orange-400 text-white'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {index + 1}
          </div>
        </div>

        {/* Course Thumbnail - Hidden on very small screens */}
        <div className="hidden xs:block flex-shrink-0">
          <img 
            src={course.thumbnail || 'https://via.placeholder.com/100x60?text=Course'} 
            alt={course.title}
            className="w-12 h-9 sm:w-16 sm:h-12 md:w-20 md:h-14 object-cover rounded-lg"
          />
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base mb-1 md:mb-2 truncate group-hover:text-blue-600 transition-colors">
            {course.title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm">
            <Badge variant="outline" className={`text-[10px] sm:text-xs ${formatCourseLevel(course.course_level).color}`}>
              {formatCourseLevel(course.course_level).label}
            </Badge>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span className="text-gray-600 text-[10px] sm:text-xs">{course.enrollments} total</span>
          </div>
        </div>

        {/* Active users count */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg sm:text-xl md:text-2xl font-bold ${
            course.activeUsers >= 20 ? 'text-green-600' :
            course.activeUsers >= 10 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {course.activeUsers}
          </div>
          <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5">last 30d</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <div className="absolute inset-0 animate-ping">
              <RefreshCw className="h-12 w-12 mx-auto text-blue-300 opacity-75" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Loading Analytics</p>
            <p className="text-sm text-gray-500 mt-1">Fetching course activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Course Activity Analytics
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Track enrollment activity over the last 30 days
          </p>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-8">
        <Card className="border border-gray-200">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {courseStats.totalCourses}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Enrolled</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {courseStats.totalEnrollments.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <Award className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="all-courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            All Courses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Most Active Courses */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                <Award className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Most Active Courses</h3>
                <span className="text-xs md:text-sm text-gray-500">({mostActiveCourses.length})</span>
              </div>
              <div className="space-y-2 md:space-y-3">
                {mostActiveCourses.length > 0 ? (
                  mostActiveCourses.map((course, index) => renderCourseCard(course, index, true))
                ) : (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Activity className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-gray-400" />
                    <p className="text-sm md:text-base text-gray-600">No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Least Active Courses */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Needs Attention</h3>
                <span className="text-xs md:text-sm text-gray-500">({mostInactiveCourses.length})</span>
              </div>
              <div className="space-y-2 md:space-y-3">
                {mostInactiveCourses.length > 0 ? (
                  mostInactiveCourses.map((course, index) => renderCourseCard(course, index, false))
                ) : (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <CheckCircle2 className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-green-400" />
                    <p className="text-sm md:text-base text-gray-600">All courses performing well!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>


        {/* All Courses Tab */}
        <TabsContent value="all-courses" className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900">All Courses</h3>
              <span className="text-xs md:text-sm text-gray-500">({courseStats.totalCourses} total)</span>
            </div>
          </div>
          <Card className="border border-gray-200">
            <CardContent className="p-3 md:p-6">
              <div className="space-y-2">
                {allCoursesActivity.length > 0 ? (
                  allCoursesActivity.map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gray-200 rounded flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                        {index + 1}
                      </div>
                      <img 
                        src={course.thumbnail || 'https://via.placeholder.com/60x40?text=Course'} 
                        alt={course.title}
                        className="hidden xs:block w-10 h-7 sm:w-12 sm:h-8 md:w-16 md:h-11 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate mb-1">
                          {course.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs text-gray-600">
                          <span>{course.enrollments} total</span>
                          <span className="hidden sm:inline">•</span>
                          <Badge variant="outline" className={`text-[9px] sm:text-[10px] md:text-xs ${formatCourseLevel(course.course_level).color}`}>
                            {formatCourseLevel(course.course_level).label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-base sm:text-lg md:text-xl font-bold ${
                          course.activeUsers >= 20 ? 'text-green-600' :
                          course.activeUsers >= 10 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {course.activeUsers}
                        </div>
                        <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500">last 30d</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg">
                    <BookOpen className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 text-gray-400" />
                    <p className="text-sm md:text-base text-gray-600">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CourseActivityAnalytics;


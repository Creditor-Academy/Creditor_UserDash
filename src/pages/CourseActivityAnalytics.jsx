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
import { fetchMostActiveInactiveCourses, fetchAllCoursesActivity, fetchCourseActivityByMonth } from '@/services/analyticsService';
import { toast } from 'sonner';

export function CourseActivityAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [mostActiveCourses, setMostActiveCourses] = useState([]);
  const [mostInactiveCourses, setMostInactiveCourses] = useState([]);
  const [allCoursesActivity, setAllCoursesActivity] = useState([]);
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);

  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate year options (current year and 2 previous years)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data
      const summaryData = await fetchMostActiveInactiveCourses();
      setMostActiveCourses(summaryData.mostActive || []);
      setMostInactiveCourses(summaryData.mostInactive || []);
      
      // Fetch all courses activity
      const coursesData = await fetchAllCoursesActivity();
      setAllCoursesActivity(coursesData || []);
      
      toast.success('Course analytics loaded successfully');
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
      toast.error('Failed to load course analytics. Using sample data for demonstration.');
      
      // Fallback to sample data for demonstration
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for specific month
  const fetchMonthlyData = async () => {
    try {
      setRefreshing(true);
      const data = await fetchCourseActivityByMonth(selectedYear, selectedMonth);
      setMonthlyData(data);
      toast.success(`Data loaded for ${months[selectedMonth - 1].label} ${selectedYear}`);
    } catch (error) {
      console.error('Failed to fetch monthly data:', error);
      toast.error('Failed to load monthly data');
    } finally {
      setRefreshing(false);
    }
  };

  // Set sample data for demonstration
  const setSampleData = () => {
    setMostActiveCourses([
      {
        id: '1',
        title: 'Private Merchant Course',
        enrollments: 245,
        activeUsers: 189,
        completionRate: 78,
        avgTimeSpent: 1250,
        trend: 'up',
      },
      {
        id: '2',
        title: 'Sovereignty 101',
        enrollments: 198,
        activeUsers: 156,
        completionRate: 82,
        avgTimeSpent: 980,
        trend: 'up',
      },
      {
        id: '3',
        title: 'Business Credit Fundamentals',
        enrollments: 176,
        activeUsers: 142,
        completionRate: 75,
        avgTimeSpent: 1120,
        trend: 'up',
      },
    ]);

    setMostInactiveCourses([
      {
        id: '4',
        title: 'Advanced Legal Strategies',
        enrollments: 34,
        activeUsers: 12,
        completionRate: 35,
        avgTimeSpent: 280,
        trend: 'down',
      },
      {
        id: '5',
        title: 'Estate Planning Basics',
        enrollments: 28,
        activeUsers: 8,
        completionRate: 28,
        avgTimeSpent: 195,
        trend: 'down',
      },
    ]);

    setAllCoursesActivity([
      { id: '1', title: 'Private Merchant Course', enrollments: 245, activeUsers: 189 },
      { id: '2', title: 'Sovereignty 101', enrollments: 198, activeUsers: 156 },
      { id: '3', title: 'Business Credit Fundamentals', enrollments: 176, activeUsers: 142 },
      { id: '4', title: 'Advanced Legal Strategies', enrollments: 34, activeUsers: 12 },
      { id: '5', title: 'Estate Planning Basics', enrollments: 28, activeUsers: 8 },
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch monthly data when filters change
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyData();
    }
  }, [selectedMonth, selectedYear, activeTab]);

  // Format time in minutes
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render course card with enhanced design
  const renderCourseCard = (course, index, isActive = true) => (
    <div
      key={course.id}
      className="group relative flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300"
    >
      {/* Rank Badge with gradient */}
      <div className="flex-shrink-0 relative">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm transition-transform group-hover:scale-110 ${
            index === 0
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
              : index === 1
              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
              : index === 2
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
              : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
          }`}
        >
          {index + 1}
        </div>
        {index === 0 && (
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
        )}
      </div>

      {/* Course Info */}
      <div className="flex-1 min-w-0 space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{course.enrollments}</span>
              <span className="text-gray-500">enrolled</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium">{course.activeUsers}</span>
              <span className="text-gray-500">active</span>
            </div>
            {course.avgTimeSpent && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{formatTime(course.avgTimeSpent)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {course.completionRate !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Completion Rate</span>
              <span className={`font-semibold ${
                course.completionRate >= 70 ? 'text-green-600' : 
                course.completionRate >= 40 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {course.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  course.completionRate >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                  course.completionRate >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${course.completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        {isActive ? (
          <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 px-3 py-1.5 flex items-center gap-1.5">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="font-semibold">Active</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 px-3 py-1.5 flex items-center gap-1.5">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span className="font-semibold">Needs Attention</span>
          </Badge>
        )}
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between pb-6 border-b border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Course Activity Analytics
            </h2>
          </div>
          <p className="text-gray-600 text-base ml-14">
            Monitor and analyze course engagement and performance metrics
          </p>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          size="default"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {allCoursesActivity.length}
                </p>
                <p className="text-xs text-gray-500">All active courses</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-100 hover:border-green-300 transition-colors bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Enrollments
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {allCoursesActivity.reduce((sum, c) => sum + (c.enrollments || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Across all courses</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors bg-gradient-to-br from-white to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  High Engagement
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {mostActiveCourses.length}
                </p>
                <p className="text-xs text-gray-500">Performing well</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 hover:border-red-300 transition-colors bg-gradient-to-br from-white to-red-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Needs Attention
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {mostInactiveCourses.length}
                </p>
                <p className="text-xs text-gray-500">Low engagement</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-gray-100">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
          >
            <Award className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Monthly Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="all-courses" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            All Courses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Active Courses */}
            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      Most Active Courses
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      🏆 Top performing courses this month
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1">
                    {mostActiveCourses.length} courses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4 bg-gray-50">
                {mostActiveCourses.length > 0 ? (
                  mostActiveCourses.map((course, index) => renderCourseCard(course, index, true))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium">No active course data available</p>
                    <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Inactive Courses */}
            <Card className="border-2 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      Needs Attention
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      ⚠️ Courses requiring improvement focus
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 px-3 py-1">
                    {mostInactiveCourses.length} courses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4 bg-gray-50">
                {mostInactiveCourses.length > 0 ? (
                  mostInactiveCourses.map((course, index) => renderCourseCard(course, index, false))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
                    <p className="text-gray-600 font-medium">All courses performing well!</p>
                    <p className="text-sm text-gray-500 mt-1">No courses need attention</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Analysis Tab */}
        <TabsContent value="monthly" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Monthly Course Activity
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Analyze course performance for a specific period
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Month:</label>
                    <Select
                      value={selectedMonth.toString()}
                      onValueChange={(val) => setSelectedMonth(parseInt(val))}
                    >
                      <SelectTrigger className="w-[150px] bg-white shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Year:</label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(val) => setSelectedYear(parseInt(val))}
                    >
                      <SelectTrigger className="w-[110px] bg-white shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {refreshing ? (
                <div className="text-center py-16">
                  <div className="relative inline-block">
                    <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
                    <div className="absolute inset-0 animate-ping">
                      <RefreshCw className="h-12 w-12 text-blue-300 opacity-75" />
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium mt-4">Loading monthly data...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait</p>
                </div>
              ) : monthlyData ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-medium text-blue-900">
                      📊 Showing data for {months[selectedMonth - 1].label} {selectedYear}
                    </p>
                  </div>
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium">Monthly Analysis View</p>
                    <p className="text-sm text-gray-500 mt-2">Detailed monthly breakdown coming soon...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-700 font-medium">Select a Month and Year</p>
                  <p className="text-sm text-gray-500 mt-2">Choose filters above to view monthly data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Courses Tab */}
        <TabsContent value="all-courses" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    All Courses Activity
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Complete overview of all courses and their engagement metrics
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 px-4 py-1.5 text-base">
                  {allCoursesActivity.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-gray-50">
              <div className="space-y-3">
                {allCoursesActivity.length > 0 ? (
                  allCoursesActivity.map((course, index) => {
                    const engagementRate = Math.round((course.activeUsers / course.enrollments) * 100 || 0);
                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base mb-2 truncate">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{course.enrollments}</span>
                                <span className="text-gray-500">enrolled</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span className="font-medium">{course.activeUsers}</span>
                                <span className="text-gray-500">active</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              engagementRate >= 70 ? 'text-green-600' :
                              engagementRate >= 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {engagementRate}%
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Engagement</div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`px-3 py-1.5 ${
                              engagementRate >= 70 ? 'bg-green-50 text-green-700 border-green-300' :
                              engagementRate >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                              'bg-red-50 text-red-700 border-red-300'
                            }`}
                          >
                            {engagementRate >= 70 ? 'High' :
                             engagementRate >= 40 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-700 font-medium">No Course Data Available</p>
                    <p className="text-sm text-gray-500 mt-2">Courses will appear here once data is available</p>
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


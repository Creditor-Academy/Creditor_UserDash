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

  // Render course card
  const renderCourseCard = (course, index, isActive = true) => (
    <div
      key={course.id}
      className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      {/* Rank Badge */}
      <div className="flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
            index === 0
              ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              : index === 1
              ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
              : index === 2
              ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {index + 1}
        </div>
      </div>

      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate mb-1">{course.title}</h4>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollments} enrolled</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>{course.activeUsers} active</span>
          </div>
          {course.avgTimeSpent && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(course.avgTimeSpent)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col items-end gap-2">
        {course.completionRate !== undefined && (
          <Badge
            variant={course.completionRate > 70 ? 'default' : 'secondary'}
            className="font-medium"
          >
            {course.completionRate}% Complete
          </Badge>
        )}
        {isActive ? (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
            <TrendingDown className="h-4 w-4" />
            <span>Inactive</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading course analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Course Activity Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track the most active and inactive courses each month
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{allCoursesActivity.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allCoursesActivity.reduce((sum, c) => sum + (c.enrollments || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-green-600">
                  {mostActiveCourses.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Courses</p>
                <p className="text-2xl font-bold text-red-600">
                  {mostInactiveCourses.length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Active Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Most Active Courses
                </CardTitle>
                <CardDescription>
                  Top performing courses this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostActiveCourses.length > 0 ? (
                  mostActiveCourses.map((course, index) => renderCourseCard(course, index, true))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active course data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Most Inactive Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Most Inactive Courses
                </CardTitle>
                <CardDescription>
                  Courses that need attention this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostInactiveCourses.length > 0 ? (
                  mostInactiveCourses.map((course, index) => renderCourseCard(course, index, false))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No inactive course data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Analysis Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Course Activity</CardTitle>
                  <CardDescription>
                    Analyze course performance for a specific month
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(val) => setSelectedMonth(parseInt(val))}
                  >
                    <SelectTrigger className="w-[140px]">
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
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(val) => setSelectedYear(parseInt(val))}
                  >
                    <SelectTrigger className="w-[100px]">
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
            </CardHeader>
            <CardContent>
              {refreshing ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-600">Loading monthly data...</p>
                </div>
              ) : monthlyData ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Data for {months[selectedMonth - 1].label} {selectedYear}
                  </p>
                  {/* Display monthly data here */}
                  <div className="text-gray-600">
                    Monthly data display coming soon...
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a month to view data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Courses Tab */}
        <TabsContent value="all-courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                All Courses Activity
              </CardTitle>
              <CardDescription>
                Complete list of courses and their activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allCoursesActivity.length > 0 ? (
                  allCoursesActivity.map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-400 text-sm w-8">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.enrollments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {course.activeUsers}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Math.round((course.activeUsers / course.enrollments) * 100 || 0)}% active
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No course data available</p>
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


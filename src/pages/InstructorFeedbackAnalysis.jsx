/**
 * Instructor Feedback Analysis Page
 * Displays course feedback analytics for all instructor's courses
 * Shows ratings, satisfaction, and content performance
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Star,
  Users,
  Target,
} from 'lucide-react';
import CourseAnalyticsDashboard from '@/components/courses/CourseAnalyticsDashboard';
import { toast } from 'sonner';

export function InstructorFeedbackAnalysis() {
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  // Fetch instructor's courses
  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/getMyCourses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const courses = response.data.data || [];
      setMyCourses(courses);

      if (courses.length > 0) {
        setSelectedCourse(courses[0]);
      }

      toast.success(`Loaded ${courses.length} course(s)`);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchMyCourses();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch AI vs Manual comparison
      const response = await axios.get(
        '/api/feedback/compare-creation-methods',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComparisonData(response.data.data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, []);

  // Precompute safe comparison metrics to avoid undefined access
  const aiRating = comparisonData?.AI?.avg_rating ?? 0;
  const manualRating = comparisonData?.MANUAL?.avg_rating ?? 0;
  const ratingDelta = Math.abs(aiRating - manualRating).toFixed(1);
  const ratingInsight =
    aiRating >= manualRating
      ? `AI-generated courses have ${ratingDelta} higher average rating`
      : `Manual courses have ${ratingDelta} higher average rating`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Loading Feedback Analysis
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Fetching your course data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Feedback Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            View student feedback and satisfaction metrics for your courses
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Course Selection */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose a course to view detailed feedback analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedCourse?.id || ''}
                onValueChange={courseId => {
                  const course = myCourses.find(c => c.id === courseId);
                  setSelectedCourse(course);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center gap-2">
                        <span>{course.title}</span>
                        <Badge variant="outline" className="ml-2">
                          {course.creation_method === 'AI'
                            ? '🤖 AI'
                            : '✍️ Manual'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Badge
                  variant="outline"
                  className={
                    selectedCourse.creation_method === 'AI'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }
                >
                  {selectedCourse.creation_method === 'AI'
                    ? '🤖 AI Generated'
                    : '✍️ Manual'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Stats */}
      {comparisonData && (
        <Card className="border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              AI vs Manual Courses Comparison
            </CardTitle>
            <CardDescription>
              Overall performance metrics across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Courses */}
              <div className="bg-white p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🤖 AI-Generated Courses
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {comparisonData.AI?.total_courses || 0} courses
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-blue-600">
                        {(comparisonData.AI?.avg_rating || 0).toFixed(1)}
                      </span>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {(comparisonData.AI?.avg_completion_rate || 0).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Engagement Score</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {(comparisonData.AI?.avg_engagement_score || 0).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Feedback</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {comparisonData.AI?.total_feedback || 0} entries
                    </span>
                  </div>
                </div>
              </div>

              {/* Manual Courses */}
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ✍️ Manual Courses
                  </h3>
                  <Badge className="bg-green-100 text-green-800">
                    {comparisonData.MANUAL?.total_courses || 0} courses
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-green-600">
                        {(comparisonData.MANUAL?.avg_rating || 0).toFixed(1)}
                      </span>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="text-lg font-semibold text-green-600">
                      {(
                        comparisonData.MANUAL?.avg_completion_rate || 0
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Engagement Score</span>
                    <span className="text-lg font-semibold text-green-600">
                      {(
                        comparisonData.MANUAL?.avg_engagement_score || 0
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Feedback</span>
                    <span className="text-lg font-semibold text-green-600">
                      {comparisonData.MANUAL?.total_feedback || 0} entries
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Insight */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Performance Insight
                  </p>
                  <p className="text-sm text-blue-700 mt-1">{ratingInsight}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Feedback Analytics Dashboard */}
      {selectedCourse ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CourseAnalyticsDashboard courseId={selectedCourse.id} />
        </div>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No courses available. Please create a course first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {myCourses.length === 0 && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  No Courses Yet
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You haven't created any courses yet. Create a course to start
                  collecting feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default InstructorFeedbackAnalysis;

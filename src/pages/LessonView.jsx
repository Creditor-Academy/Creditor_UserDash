import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, Play, FileText, Loader2, AlertCircle, Search, RefreshCw, ArrowLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { fetchCourseById, fetchCourseModules } from "@/services/courseService";
import { getAuthHeader } from "@/services/authHeader";
import { SidebarContext } from "@/layouts/DashboardLayout";
import axios from "axios";

const LessonView = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate(); 
  const { toast } = useToast();
  const { setSidebarCollapsed } = useContext(SidebarContext);
  
  console.log('LessonView rendered with params:', { courseId, moduleId });
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch module and lessons data
  useEffect(() => {
    console.log('LessonView component mounted with courseId:', courseId, 'moduleId:', moduleId);
    if (courseId && moduleId) {
      fetchModuleLessons();
    }
  }, [courseId, moduleId]);

  const fetchModuleLessons = async () => {
    try {
      setLoading(true);
      console.log('Fetching lessons for courseId:', courseId, 'moduleId:', moduleId);
      
      // Use the same API pattern as CourseView.jsx
      const [courseData, modulesData] = await Promise.all([
        fetchCourseById(courseId),
        fetchCourseModules(courseId)
      ]);
      
      console.log('Course data:', courseData);
      console.log('Modules data:', modulesData);
      
      // Set course details
      setCourseDetails({
        title: courseData.title || courseData.course_title || courseData.name || 'Course',
        description: courseData.description || courseData.course_description || ''
      });
      
      // Find the specific module from the modules data
      const currentModule = modulesData.find(module => 
        module.id?.toString() === moduleId?.toString() ||
        module.module_id?.toString() === moduleId?.toString()
      );
      
      console.log('Current module:', currentModule);
      
      if (currentModule) {
        setModuleDetails({
          title: currentModule.title || currentModule.module_title || currentModule.name || 'Module',
          description: currentModule.description || currentModule.module_description || '',
          totalModules: modulesData.length || 0,
          duration: currentModule.estimated_duration || currentModule.duration || 0
        });
      } else {
        setModuleDetails({
          title: 'Module',
          description: '',
          totalModules: 0,
          duration: 0
        });
      }
      
      // Fetch lessons using the same pattern
      const lessonsResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/all-lessons`,
        {
          headers: getAuthHeader(),
          withCredentials: true,
        }
      );
      
      console.log('Lessons response:', lessonsResponse.data);
      
      // Handle lessons response
      let lessonsData = [];
      if (Array.isArray(lessonsResponse.data)) {
        lessonsData = lessonsResponse.data;
      } else if (lessonsResponse.data?.data) {
        lessonsData = Array.isArray(lessonsResponse.data.data) 
          ? lessonsResponse.data.data 
          : [lessonsResponse.data.data];
      } else if (lessonsResponse.data?.lessons) {
        lessonsData = Array.isArray(lessonsResponse.data.lessons)
          ? lessonsResponse.data.lessons
          : [lessonsResponse.data.lessons];
      }
      
      // Normalize lesson data to ensure consistent field names
      const normalizedLessons = lessonsData.map(lesson => ({
        id: lesson.id || lesson.lesson_id,
        title: lesson.title || lesson.lesson_title || 'Untitled Lesson',
        description: lesson.description || lesson.lesson_description || 'No description available.',
        order: lesson.order || lesson.lesson_order || 0,
        status: lesson.status || lesson.lesson_status || 'DRAFT',
        duration: lesson.duration || lesson.lesson_duration || '0 min',
        thumbnail: lesson.thumbnail || lesson.lesson_thumbnail || null,
        updatedAt: lesson.updatedAt || lesson.updated_at || lesson.createdAt || lesson.created_at,
        type: lesson.type || lesson.lesson_type || 'text'
      }));
      
      // Filter to only show published lessons
      const publishedLessons = normalizedLessons.filter(lesson => 
        lesson.status && lesson.status.toUpperCase() === 'PUBLISHED'
      );
      
      // Sort lessons by order
      publishedLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setLessons(publishedLessons);
      
    } catch (err) {
      console.error("Error fetching module lessons:", err);
      setError("Failed to load module lessons. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load lessons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }; 

  const filteredLessons = useMemo(() => {
    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return [];
    }
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return lessons;
    
    return lessons.filter(lesson => {
      if (!lesson) return false;
      const title = (lesson.title || '').toLowerCase();
      const description = (lesson.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [lessons, searchQuery]);

  const handleViewLesson = (lesson) => {
    // Close the sidebar before navigating
    if (setSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    // Navigate to lesson preview
    navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/preview`);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'COMPLETED':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/courses')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>
        <ChevronRight size={16} className="text-muted-foreground" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {courseDetails?.title || 'Course'}
        </Button>
        <ChevronRight size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">
          {moduleDetails?.title || 'Module Lessons'}
        </span>
      </div>

      {/* Module Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {moduleDetails?.title || 'Module Lessons'}
        </h1>
        {moduleDetails?.description && (
          <p className="text-gray-600 text-lg mb-4">{moduleDetails.description}</p>
        )}
        
        {/* Module Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {lessons.length}
            </div>
            <div>
              <div className="text-sm font-medium text-green-700">Total Lessons</div>
              <div className="text-xs text-green-600">{lessons.length}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-purple-700">Duration</div>
              <div className="text-xs text-purple-600">{moduleDetails?.duration || '0'} hr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Total Count */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-5 w-5" />
          <span>Total Lessons: {filteredLessons.length}</span>
        </div>
        
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search lessons..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading lessons...</span>
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Lessons</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchModuleLessons}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson, index) => (
            <Card key={lesson.id || `lesson-${index}`} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              {/* Lesson Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {lesson.thumbnail ? (
                  <img 
                    src={lesson.thumbnail} 
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl font-bold mb-2">LESSON {lesson.order}</div>
                      <div className="text-sm opacity-80">{lesson.type?.toUpperCase() || 'LESSON'}</div>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant={getStatusColor(lesson.status)} className="flex items-center gap-1">
                    {getStatusIcon(lesson.status)}
                    {lesson.status || 'DRAFT'}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {lesson.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Order: {lesson.order}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration}
                  </span>
                </div>
                
                {lesson.updatedAt && (
                  <div className="text-xs text-gray-400">
                    Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                 // onClick={() => handleViewLesson(lesson)}
                >
                  <Play className="h-4 w-4" /> Start Lesson
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-dashed border-blue-200">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {searchQuery ? 'No matching lessons found' : 'Lessons Coming Soon!'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try a different search term to find the lessons you\'re looking for.' 
              : 'We\'re working hard to bring you amazing lessons. Check back soon for exciting new content!'}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery('')} className="bg-white hover:bg-gray-50">
              Clear Search
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Stay tuned for updates</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonView;

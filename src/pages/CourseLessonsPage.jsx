import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUserId } from '@/data/currentUser';
import { createModule, fetchAllCourses } from '@/services/courseService';
import { CreateModuleDialog } from '@/components/courses/CreateModuleDialog';
import { CreateLessonDialog } from '@/components/courses/CreateLessonDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Clock,
  ChevronLeft,
  Play,
  Eye,
  Upload,
  Trash2,
  FileText,
  Plus,
  List,
  BookOpen,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/apiClient';

const COURSES_PER_PAGE = 6;

const CourseLessonsPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);
  const [moduleDialogMode, setModuleDialogMode] = useState('create');
  const [editModuleData, setEditModuleData] = useState(null);
  const [showCreateLessonDialog, setShowCreateLessonDialog] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const exportInProgressRef = useRef(false);
  const navigate = useNavigate();

  const isAllowed = true;

  useEffect(() => {
    if (!isAllowed) return;
    const fetchCoursesData = async () => {
      setIsLoading(true);
      try {
        const coursesData = await fetchAllCourses();
        console.log(
          '✅ OPTIMIZATION: Using module count from course data instead of fetching modules for each course'
        );

        // Use module count from course data instead of fetching modules for each course
        const coursesWithModules = coursesData.map(course => {
          // Use the module count from _count.modules instead of fetching actual modules
          const moduleCount = course._count?.modules || 0;
          console.log(
            `Course "${course.title}" has ${moduleCount} modules (from _count.modules)`
          );

          return {
            ...course,
            moduleCount, // Add module count for display
            modules: [], // Don't fetch actual modules unless needed for specific functionality
          };
        });
        setCourses(coursesWithModules);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoursesData();
  }, [isAllowed]);

  // Filtered and paginated courses
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const lower = searchTerm.toLowerCase();
    return courses.filter(
      course =>
        course.title.toLowerCase().includes(lower) ||
        course.description?.toLowerCase().includes(lower)
    );
  }, [courses, searchTerm]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE) || 1;
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleExpandCourse = courseId => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  const handleCreateModuleClick = courseId => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(null);
    setModuleDialogMode('create');
    setShowCreateModuleDialog(true);
  };

  const handleEditModuleClick = (courseId, module) => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(module);
    setModuleDialogMode('edit');
    setShowCreateModuleDialog(true);
  };

  // Use the same logic as Course Management for saving modules
  const handleModuleSaved = async moduleData => {
    try {
      if (moduleDialogMode === 'edit' && editModuleData) {
        // Optionally implement updateModule logic here
        // await updateModule(selectedCourseForModule, editModuleData.id, moduleData);
      } else {
        await createModule(selectedCourseForModule, moduleData);
      }
      // Refresh modules after creation
      const updatedModules = await fetchCourseModules(selectedCourseForModule);
      const modulesWithLessons = updatedModules.map(module => {
        if (module.title === 'Introduction machine learning') {
          return {
            ...module,
            lessons: [
              {
                id: `lesson-${module.id}-1`,
                title: `Intro: What is Machine Learning?`,
                description: 'A beginner-friendly introduction to ML concepts.',
                status: 'PUBLISHED',
                duration: 20,
                order: 1,
                createdAt: new Date().toISOString(),
              },
              {
                id: `lesson-${module.id}-2`,
                title: `Supervised vs Unsupervised Learning`,
                description: 'Understanding the two main types of ML.',
                status: 'DRAFT',
                duration: 25,
                order: 2,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        } else {
          return { ...module, lessons: [] };
        }
      });
      setCourses(prev =>
        prev.map(course =>
          course.id === selectedCourseForModule
            ? { ...course, modules: modulesWithLessons }
            : course
        )
      );
      setShowCreateModuleDialog(false);
    } catch (err) {
      alert('Failed to save module: ' + err.message);
    }
  };

  const handleAddLesson = (courseId, moduleId) => {
    setSelectedCourseForLesson(courseId);
    setSelectedModuleForLesson(moduleId);
    setShowCreateLessonDialog(true);
  };

  const handleLessonCreated = lessonData => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: lessonData.title,
      description: lessonData.description,
      lessonNumber: lessonData.lessonNumber,
      status: lessonData.status,
      duration: 0,
      order: lessonData.lessonNumber,
      createdAt: lessonData.createdAt,
    };

    setCourses(prev =>
      prev.map(course =>
        course.id === selectedCourseForLesson
          ? {
              ...course,
              modules: course.modules.map(module =>
                module.id === selectedModuleForLesson
                  ? {
                      ...module,
                      lessons: [...(module.lessons || []), newLesson],
                    }
                  : module
              ),
            }
          : course
      )
    );

    setShowCreateLessonDialog(false);
    setSelectedCourseForLesson(null);
    setSelectedModuleForLesson(null);
  };

  const handleEditLesson = lessonId => {
    // Navigate to edit lesson page
    navigate(`/instructor/edit-lesson/${lessonId}`);
  };

  const handleDeleteLesson = lesson => {
    setShowDeleteDialog(lesson);
  };

  const confirmDelete = async () => {
    if (!showDeleteDialog) return;

    try {
      // Simulate API call to delete lesson
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove lesson from local state
      setCourses(prev =>
        prev.map(course => ({
          ...course,
          modules: course.modules.map(module => ({
            ...module,
            lessons: module.lessons.filter(
              lesson => lesson.id !== showDeleteDialog.id
            ),
          })),
        }))
      );

      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Helper function to format duration
  const formatDuration = duration => {
    if (!duration) return '00:00:00';

    // If duration is a string (e.g., "4 weeks", "3 months"), return it as-is
    if (typeof duration === 'string') {
      return duration;
    }

    // If duration is a number, treat it as minutes and format as HH:MM:SS
    const minutes = Number(duration);
    if (isNaN(minutes)) return '00:00:00';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`;
  };

  const handleExportScorm = async () => {
    if (exportInProgressRef.current) {
      return;
    }

    try {
      setIsExporting(true);
      exportInProgressRef.current = true;
      const response = await api.get('/api/export/modules-scorm', {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'scorm-data.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/i);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      const blob = new Blob([response.data], {
        type:
          response.headers['content-type'] ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting modules as SCORM:', error);
      alert('Failed to export SCORM package. Please try again.');
    } finally {
      setIsExporting(false);
      exportInProgressRef.current = false;
    }
  };

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Lessons Management
          </h1>
          <p className="text-gray-600">
            Manage lesson content for your course modules
          </p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <div className="h-10 bg-gray-200 rounded-md w-full max-w-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(index => (
            <Card key={index} className="overflow-hidden flex flex-col h-full">
              {/* Shimmer Image */}
              <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

              {/* Shimmer Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 space-y-4">
                  {/* Title shimmer */}
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                  {/* Description shimmer */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  </div>

                  {/* Stats shimmer */}
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>

                {/* Button shimmer */}
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Lessons Management
          </h1>
          <p className="text-gray-600">
            Manage lesson content for your course modules
          </p>
        </div>
        <Button
          onClick={handleExportScorm}
          disabled={isExporting}
          className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export SCORM'}
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search by course or module title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {paginatedCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map(course => (
            <div key={course.id} className="space-y-4">
              {/* Course Card */}
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                {/* Course Image */}
                <div className="w-full h-48 flex-shrink-0">
                  <img
                    src={
                      course.thumbnail ||
                      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDuration(course.estimated_duration || 60)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.moduleCount || 0} modules</span>
                      </div>
                    </div>
                  </div>

                  {/* View Modules Button */}
                  <Button
                    onClick={() =>
                      navigate(`/instructor/courses/${course.id}/modules`, {
                        state: {
                          courseData: {
                            id: course.id,
                            title: course.title,
                            description: course.description,
                            estimated_duration: course.estimated_duration,
                            course_level: course.course_level,
                            course_status: course.course_status,
                            thumbnail: course.thumbnail,
                            moduleCount: course.moduleCount,
                          },
                        },
                      })
                    }
                    className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    View Modules
                  </Button>
                </div>
              </Card>

              {/* Modules Section */}
              {expandedCourseId === course.id && (
                <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Course Modules
                    </h4>
                    <Button
                      onClick={() => handleCreateModuleClick(course.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Module
                    </Button>
                  </div>

                  {course.moduleCount === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">
                        No modules yet
                      </h5>
                      <p className="text-gray-500 mb-4">
                        Start building your course by creating the first module.
                      </p>
                      <Button
                        onClick={() => handleCreateModuleClick(course.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <Plus size={16} className="mr-2" />
                        Create First Module
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.modules.map(module => (
                        <Card
                          key={module.id}
                          className="hover:shadow-md transition-shadow duration-200"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                                  {module.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {module.description}
                                </p>

                                {/* Module Stats */}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>
                                    Duration: {module.estimated_duration || 0}{' '}
                                    min
                                  </span>
                                  <span>
                                    {(() => {
                                      const title = (
                                        module.title ||
                                        module.name ||
                                        ''
                                      ).toLowerCase();
                                      const isIntroModule =
                                        title.includes('why you must exit') &&
                                        (title.includes('llc') ||
                                          title.includes('corporation')) &&
                                        title.includes('structure');
                                      return isIntroModule
                                        ? 'Intro Module'
                                        : `Order: ${module.order || 'N/A'}`;
                                    })()}
                                  </span>
                                </div>

                                {/* Module Status */}
                                <div className="mt-3">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      module.module_status === 'PUBLISHED'
                                        ? 'bg-green-100 text-green-800'
                                        : module.module_status === 'DRAFT'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {module.module_status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleEditModuleClick(course.id, module)
                                }
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye size={14} className="mr-2" />
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAddLesson(course.id, module.id)
                                }
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Plus size={14} className="mr-2" />
                                Add Lesson
                              </Button>
                            </div>

                            {/* Lessons Count */}
                            {module.lessons && module.lessons.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    {module.lessons.length} lesson
                                    {module.lessons.length !== 1 ? 's' : ''}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                  >
                                    View Lessons
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      <CreateModuleDialog
        isOpen={showCreateModuleDialog}
        onClose={() => setShowCreateModuleDialog(false)}
        courseId={selectedCourseForModule}
        onModuleCreated={() => {}}
        existingModules={
          courses.find(c => c.id === selectedCourseForModule)?.modules || []
        }
        initialData={editModuleData}
        mode={moduleDialogMode}
        onSave={handleModuleSaved}
      />

      <CreateLessonDialog
        isOpen={showCreateLessonDialog}
        onClose={() => setShowCreateLessonDialog(false)}
        moduleId={selectedModuleForLesson}
        onLessonCreated={handleLessonCreated}
        existingLessons={
          courses
            .find(c => c.id === selectedCourseForLesson)
            ?.modules.find(m => m.id === selectedModuleForLesson)?.lessons || []
        }
        courseId={selectedCourseForLesson}
      />

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the lesson "
              {showDeleteDialog.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLessonsPage;

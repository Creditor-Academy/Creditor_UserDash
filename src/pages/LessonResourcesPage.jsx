import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  FileText,
  Download,
  Image,
  Video,
  File,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLessonResources } from '@/services/lessonResourceService';
import axios from 'axios';
import { getAuthHeader } from '@/services/authHeader';

const LessonResourcesPage = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      fetchLessonData();
    } else {
      console.error('Missing route parameters:', {
        courseId,
        moduleId,
        lessonId,
      });
      setError('Invalid route parameters. Please navigate from a lesson page.');
      setLoading(false);
    }
  }, [courseId, moduleId, lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lesson details and resources in parallel
      const [lessonResponse, resourcesData] = await Promise.all([
        axios
          .get(
            `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/all-lessons`,
            {
              headers: getAuthHeader(),
              withCredentials: true,
            }
          )
          .catch(err => {
            console.error('Error fetching lessons:', err);
            return { data: [] };
          }),
        getLessonResources(lessonId).catch(err => {
          console.warn('Lesson resources endpoint error:', err);
          return [];
        }),
      ]);

      // Find the specific lesson
      let lessonsData = [];
      if (Array.isArray(lessonResponse.data)) {
        lessonsData = lessonResponse.data;
      } else if (lessonResponse.data?.data) {
        lessonsData = Array.isArray(lessonResponse.data.data)
          ? lessonResponse.data.data
          : [lessonResponse.data.data];
      } else if (lessonResponse.data?.lessons) {
        lessonsData = Array.isArray(lessonResponse.data.lessons)
          ? lessonResponse.data.lessons
          : [lessonResponse.data.lessons];
      }

      const lesson = lessonsData.find(
        l =>
          l.id?.toString() === lessonId?.toString() ||
          l.lesson_id?.toString() === lessonId?.toString()
      );

      if (lesson) {
        setLessonTitle(lesson.title || lesson.lesson_title || 'Lesson');
      }

      setResources(Array.isArray(resourcesData) ? resourcesData : []);
    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError('Failed to load lesson resources. Please try again.');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load resources.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = resourceType => {
    // Backend returns resource_type: IMAGE, VIDEO, TEXT_FILE, PDF
    const type = resourceType?.toUpperCase();

    if (type === 'IMAGE') {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (type === 'VIDEO') {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    if (type === 'PDF') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (type === 'TEXT_FILE') {
      return <File className="h-8 w-8 text-gray-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeBadge = resourceType => {
    const type = resourceType?.toUpperCase();

    if (type === 'IMAGE') return 'Image';
    if (type === 'VIDEO') return 'Video';
    if (type === 'PDF') return 'PDF';
    if (type === 'TEXT_FILE') return 'Document';
    return 'File';
  };

  const handleDownload = resource => {
    // Backend returns 'url' field with S3 URL
    const resourceUrl = resource.url;
    if (resourceUrl) {
      window.open(resourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Error',
        description: 'Resource URL not available.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = bytes => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  // Early return if missing params
  if (!courseId || !moduleId || !lessonId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Invalid Route
          </h3>
          <p className="text-gray-600 mb-4">
            Missing route parameters. Please navigate from a lesson page.
          </p>
          <Button onClick={() => navigate('/dashboard/courses')}>
            Go to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Resources: {lessonTitle || 'Lesson Resources'}
          </h1>
          <p className="text-gray-600 mt-1">
            Download and access all resources for this lesson
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {resources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => {
            // Backend response fields: id, title, description, url, resource_type, created_at
            const resourceType = resource.resource_type;

            return (
              <Card
                key={resource.id || index}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(resourceType)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {resource.title || 'Untitled Resource'}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {getFileTypeBadge(resourceType)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                  )}
                  {(resource.created_at || resource.updated_at) && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>
                        {formatDate(resource.created_at || resource.updated_at)}
                      </span>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {resourceType === 'VIDEO' ? 'Watch' : 'Download'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Resources Available
          </h3>
          <p className="text-gray-600">
            There are no resources available for this lesson yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonResourcesPage;

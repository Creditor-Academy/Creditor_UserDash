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
        getLessonResources(courseId, moduleId, lessonId).catch(err => {
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
    // Backend returns resource_type: IMAGE, VIDEO, TEXT, PDF
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
    if (type === 'TEXT') {
      return <File className="h-8 w-8 text-gray-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeBadge = resourceType => {
    const type = resourceType?.toUpperCase();

    if (type === 'IMAGE') return 'Image';
    if (type === 'VIDEO') return 'Video';
    if (type === 'PDF') return 'PDF';
    if (type === 'TEXT') return 'Document';
    return 'File';
  };

  const getResourceUrl = resource => {
    // Backend returns 'url' field with S3 URL
    return resource.url;
  };

  const handleDownload = resource => {
    const resourceUrl = getResourceUrl(resource);
    if (!resourceUrl) {
      toast({
        title: 'Error',
        description: 'Resource URL not available.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const urlParts = resourceUrl.split('/');
      const urlFileName = urlParts[urlParts.length - 1] || 'resource';
      const safeTitle =
        (resource.title || 'resource')
          .toString()
          .replace(/[^a-z0-9_\-]/gi, '_') || 'resource';
      const fileName = `${safeTitle}-${urlFileName}`;

      const link = document.createElement('a');
      link.href = resourceUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      window.open(resourceUrl, '_blank', 'noopener,noreferrer');
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

  const handleView = resource => {
    const resourceUrl = getResourceUrl(resource);
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

  const renderPreview = (resourceType, resource) => {
    const url = getResourceUrl(resource);
    const type = resourceType?.toUpperCase();

    if (type === 'IMAGE' && url) {
      return (
        <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-4">
          <img
            src={url}
            alt={resource.title || 'Resource preview'}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (type === 'VIDEO') {
      return (
        <div className="w-full h-40 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white mb-4">
          <div className="flex flex-col items-center gap-2">
            <Video className="h-8 w-8" />
            <span className="text-sm font-medium">Video Resource</span>
          </div>
        </div>
      );
    }

    if (type === 'PDF') {
      return (
        <div className="w-full h-40 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white mb-4">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8" />
            <span className="text-sm font-medium">PDF Document</span>
          </div>
        </div>
      );
    }

    // TEXT or unknown
    return (
      <div className="w-full h-40 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white mb-4">
        <div className="flex flex-col items-center gap-2">
          <File className="h-8 w-8" />
          <span className="text-sm font-medium">Document</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                {resources.length} Resources
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Resources: {lessonTitle || 'Lesson Resources'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Download, preview, and access supporting materials for this
                lesson
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Resources Grid */}
          {resources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource, index) => {
                // Backend response fields: id, title, description, url, resource_type, created_at
                const resourceType = resource.resource_type;

                return (
                  <Card
                    key={resource.id || index}
                    className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden rounded-xl"
                  >
                    <CardHeader className="pb-0">
                      {renderPreview(resourceType, resource)}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg text-gray-900 line-clamp-2">
                            {resource.title || 'Untitled Resource'}
                          </CardTitle>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="border-transparent bg-purple-50 text-purple-700"
                            >
                              {getFileTypeBadge(resourceType)}
                            </Badge>
                            {resource.resource_type && (
                              <Badge
                                variant="outline"
                                className="border-gray-200 text-gray-600 bg-gray-50"
                              >
                                {formatFileSize(resource.file_size)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {resource.description}
                        </p>
                      )}
                      {(resource.created_at || resource.updated_at) && (
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <span>
                            Added:{' '}
                            {formatDate(
                              resource.created_at || resource.updated_at
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleView(resource)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => handleDownload(resource)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <FileText className="h-14 w-14 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Resources Available
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">
                There are no resources available for this lesson yet. Check back
                later or ask your instructor to upload supporting materials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonResourcesPage;

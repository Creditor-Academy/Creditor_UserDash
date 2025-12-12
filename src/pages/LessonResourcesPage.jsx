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
import { getLessonResources } from '@/services/lessonResourcesService';

const LessonResourcesPage = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      if (!lessonId) {
        console.error('Missing lessonId parameter.');
        setError(
          'Invalid route parameters. Please navigate from a lesson page.'
        );
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedResources = await getLessonResources(lessonId);
        setResources(fetchedResources);
        // Assuming lessonTitle would come from a separate lesson details API, or from resources if available
        setLessonTitle(`Lesson ${lessonId} Resources`); // Placeholder
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch lesson resources:', err);
        setError('Failed to load resources. Please try again later.');
        setLoading(false);
      }
    };

    if (courseId && moduleId && lessonId) {
      fetchResources();
    } else {
      console.error('Missing route parameters:', {
        courseId,
        moduleId,
        lessonId,
      });
      setError('Invalid route parameters. Please navigate from a lesson page.');
      setLoading(false);
    }
  }, [courseId, moduleId, lessonId, toast]);

  const getFileIcon = (fileType, fileName) => {
    if (!fileType && fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return <Image className="h-8 w-8 text-blue-500" />;
      }
      if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
        return <Video className="h-8 w-8 text-purple-500" />;
      }
      if (['pdf'].includes(ext)) {
        return <FileText className="h-8 w-8 text-red-500" />;
      }
    }

    if (fileType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (fileType?.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    if (fileType === 'application/pdf' || fileName?.endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeBadge = (fileType, fileName) => {
    if (!fileType && fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return 'Image';
      }
      if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
        return 'Video';
      }
      if (['pdf'].includes(ext)) {
        return 'PDF';
      }
      return 'File';
    }

    if (fileType?.startsWith('image/')) return 'Image';
    if (fileType?.startsWith('video/')) return 'Video';
    if (fileType === 'application/pdf') return 'PDF';
    return 'File';
  };

  const handleDownload = resource => {
    const url =
      resource.url ||
      resource.fileUrl ||
      resource.assetUrl ||
      resource.asset_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Error',
        description: 'Resource URL not available.',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = bytes => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
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
            const resourceUrl =
              resource.url ||
              resource.fileUrl ||
              resource.assetUrl ||
              resource.asset_url ||
              resource.Location;
            const fileName =
              resource.fileName ||
              resource.filename ||
              resource.title ||
              `Resource ${index + 1}`;
            const fileType =
              resource.fileType || resource.file_type || resource.mimetype;

            return (
              <Card
                key={resource.id || resource._id || index}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(fileType, fileName)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {resource.title || fileName}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {getFileTypeBadge(fileType, fileName)}
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
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {resource.fileSize && (
                      <span>{formatFileSize(resource.fileSize)}</span>
                    )}
                    {resource.uploadDate && (
                      <span>
                        {new Date(resource.uploadDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {fileType?.startsWith('video/') ? 'Watch' : 'Download'}
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

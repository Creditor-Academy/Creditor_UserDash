import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Clock,
  Play,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  Plus,
  RefreshCw,
  X,
  Upload,
  Link,
  ExternalLink,
  FolderOpen,
  Trash2 as Trash2Icon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getAuthHeader } from '@/services/authHeader';
import { MoreVertical, Edit, Trash2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ImageEditor from '@lessonbuilder/components/blocks/MediaBlocks/ImageEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImage } from '@/services/imageUploadService';
import {
  getLessonResources,
  uploadLessonResource,
  deleteLessonResource,
  updateLessonResource,
} from '@/services/lessonResourceService';

const ModuleLessonsView = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Lesson creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    order: 1,
    status: 'DRAFT',
    thumbnail: '',
  });

  // Lesson deletion state
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lesson update state
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // SCORM addition state
  const [showAddScormDialog, setShowAddScormDialog] = useState(false);
  const [scormLesson, setScormLesson] = useState(null);
  const [scormUrl, setScormUrl] = useState('');
  const [isAddingScorm, setIsAddingScorm] = useState(false);
  const [scormFile, setScormFile] = useState(null);
  const [isUploadingScorm, setIsUploadingScorm] = useState(false);
  const [existingScormUrl, setExistingScormUrl] = useState('');
  const [isFetchingScorm, setIsFetchingScorm] = useState(false);
  const [isDeletingScorm, setIsDeletingScorm] = useState(false);
  const [scormUploadProgress, setScormUploadProgress] = useState(0);
  const [scormServerProgress, setScormServerProgress] = useState(null);
  const scormProgressIntervalRef = useRef(null);

  // Lesson content state
  const [lessonContent, setLessonContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Image editor and upload state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [thumbnailMode, setThumbnailMode] = useState('url'); // 'url' or 'upload'
  const [editingContext, setEditingContext] = useState(null); // 'create' or 'update'

  // Lesson resources state
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [selectedLessonForResources, setSelectedLessonForResources] =
    useState(null);
  const [lessonResources, setLessonResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editResourceTitle, setEditResourceTitle] = useState('');
  const [editResourceDescription, setEditResourceDescription] = useState('');
  const [editResourceType, setEditResourceType] = useState('');
  const [updatingResourceId, setUpdatingResourceId] = useState(null);

  // Fetch module and lessons data
  useEffect(() => {
    fetchModuleLessons();
  }, [courseId, moduleId]);

  useEffect(() => {
    return () => {
      stopScormProgressPolling(true);
    };
  }, []);

  const fetchModuleLessons = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const [moduleResponse, lessonsResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/view`,
          {
            headers: getAuthHeader(),
            withCredentials: true,
          }
        ),
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/all-lessons`,
          {
            headers: getAuthHeader(),
            withCredentials: true,
          }
        ),
      ]);

      // Handle module details response
      const moduleData = moduleResponse.data.data || moduleResponse.data;
      setModuleDetails(moduleData);

      // Handle lessons response
      console.log('Lessons API Response:', lessonsResponse.data);

      let lessonsData = [];
      if (Array.isArray(lessonsResponse.data)) {
        lessonsData = lessonsResponse.data;
      } else if (
        lessonsResponse.data?.data &&
        Array.isArray(lessonsResponse.data.data)
      ) {
        lessonsData = lessonsResponse.data.data;
      } else if (lessonsResponse.data?.lessons) {
        lessonsData = Array.isArray(lessonsResponse.data.lessons)
          ? lessonsResponse.data.lessons
          : [lessonsResponse.data.lessons];
      }

      console.log('Extracted lessons data:', lessonsData);

      // Normalize lesson data to ensure consistent field names
      const normalizedLessons = lessonsData.map(lesson => ({
        ...lesson,
        status: lesson.status || lesson.lesson_status || 'DRAFT',
      }));

      console.log('Normalized lessons:', normalizedLessons);
      setLessons(normalizedLessons);

      // Set the next order number for new lessons
      const maxOrder =
        lessonsData.length > 0
          ? Math.max(...lessonsData.map(l => l.order || 0))
          : 0;
      setNewLesson(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (err) {
      console.error('Error fetching module lessons:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load module lessons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async () => {
    try {
      setIsCreating(true);

      // Prepare the lesson data in the expected format
      const lessonData = {
        title: newLesson.title,
        description: newLesson.description,
        order: parseInt(newLesson.order) || 1,
        lesson_status: newLesson.status,
        thumbnail: newLesson.thumbnail || null,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`,
        lessonData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // Add the new lesson to the list with normalized status field
      const createdLesson = response.data.data || response.data;
      // Normalize the status field to ensure consistent display
      const normalizedLesson = {
        ...createdLesson,
        status:
          createdLesson.lesson_status ||
          createdLesson.status ||
          newLesson.status,
      };
      setLessons(prev => [...prev, normalizedLesson]);

      // Reset form and close dialog
      setNewLesson({
        title: '',
        description: '',
        order: newLesson.order + 1, // Increment order for next lesson
        status: 'DRAFT',
        thumbnail: '',
      });

      setShowCreateDialog(false);

      toast({
        title: 'Success',
        description: 'Lesson created successfully!',
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      let errorMessage = 'Failed to create lesson. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLesson = async () => {
    if (!currentLesson) return;

    try {
      setIsUpdating(true);

      // Prepare the update data
      const updateData = {};
      if (currentLesson.title) updateData.title = currentLesson.title;
      if (currentLesson.description)
        updateData.description = currentLesson.description;
      if (currentLesson.order !== undefined)
        updateData.order = parseInt(currentLesson.order) || 1;
      if (currentLesson.status !== undefined)
        updateData.lesson_status = currentLesson.status;
      if (currentLesson.thumbnail !== undefined)
        updateData.thumbnail = currentLesson.thumbnail || null;

      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/${currentLesson.id}/update`,
        updateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      // Update the lesson in the state with the current lesson data (user's changes)
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === currentLesson.id
            ? { ...lesson, ...currentLesson }
            : lesson
        )
      );

      setShowUpdateDialog(false);

      toast({
        title: 'Success',
        description: 'Lesson updated successfully!',
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      let errorMessage = 'Failed to update lesson. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenUpdateDialog = lesson => {
    setCurrentLesson({
      ...lesson,
      order: lesson.order || 1,
      status: lesson.status || 'DRAFT',
      thumbnail: lesson.thumbnail || '',
    });
    setShowUpdateDialog(true);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewLesson(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setNewLesson(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection for thumbnail
  const handleFileSelect = (e, context) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 500MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImageFile(file);
    setEditingContext(context);
    setShowImageEditor(true);
  };

  // Handle image save from editor
  const handleImageEditorSave = async editedFile => {
    setShowImageEditor(false);
    setIsUploadingImage(true);

    try {
      // Use the same upload service as InteractiveComponent
      const uploadResult = await uploadImage(editedFile, {
        folder: 'lesson-thumbnails',
        public: true,
      });

      if (uploadResult.success && uploadResult.imageUrl) {
        // Set the thumbnail URL based on context
        if (editingContext === 'create') {
          setNewLesson(prev => ({
            ...prev,
            thumbnail: uploadResult.imageUrl,
          }));
        } else if (editingContext === 'update') {
          setCurrentLesson(prev => ({
            ...prev,
            thumbnail: uploadResult.imageUrl,
          }));
        }

        toast({
          title: 'Success',
          description: 'Image uploaded successfully!',
        });
      } else {
        throw new Error('Upload failed - no image URL returned');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description:
          error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
      setSelectedImageFile(null);
      setEditingContext(null);
    }
  };

  // Handle closing image editor
  const handleImageEditorClose = () => {
    setShowImageEditor(false);
    setSelectedImageFile(null);
    setEditingContext(null);
  };

  const filteredLessons = useMemo(() => {
    console.log('filteredLessons - lessons:', lessons);
    console.log('filteredLessons - searchQuery:', searchQuery);

    if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
      console.log('No lessons found or lessons is not an array');
      return [];
    }

    // First, sort lessons by order field (ascending)
    const sortedLessons = [...lessons].sort((a, b) => {
      const orderA = parseInt(a.order) || 0;
      const orderB = parseInt(b.order) || 0;
      return orderA - orderB;
    });

    console.log('Sorted lessons:', sortedLessons);

    // Then apply search filter if there's a query
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      console.log('No search query, returning sorted lessons');
      return sortedLessons;
    }

    const filtered = sortedLessons.filter(lesson => {
      if (!lesson) return false;
      const title = (lesson.title || '').toLowerCase();
      const description = (lesson.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });

    console.log('Filtered lessons:', filtered);
    return filtered;
  }, [lessons, searchQuery]);

  const handleLessonClick = lesson => {
    // Navigate to the builder - DashboardLayout will auto-collapse sidebar for lesson builder pages
    navigate(
      `/dashboard/courses/${courseId}/module/${moduleId}/lesson/${lesson.id}/builder`,
      {
        state: { lessonData: lesson },
      }
    );
  };

  const handleAddLesson = () => {
    setShowCreateDialog(true);
  };

  const fetchLessonScormDetails = async lessonId => {
    if (!lessonId) return;

    try {
      setIsFetchingScorm(true);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(
        `${apiBaseUrl}/api/lessoncontent/${lessonId}`,
        {
          withCredentials: true,
          headers: {
            ...getAuthHeader(),
          },
        }
      );

      const data = response.data?.data || response.data;
      const lessonData = data?.lesson || data;
      const fetchedScormUrl =
        data?.scorm_url ||
        data?.scormUrl ||
        lessonData?.scorm_url ||
        lessonData?.scormUrl ||
        '';

      setExistingScormUrl(fetchedScormUrl);
      setScormUrl(prev => prev || fetchedScormUrl || '');

      if (fetchedScormUrl) {
        setLessons(prev =>
          prev.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, scormUrl: fetchedScormUrl }
              : lesson
          )
        );
      }
    } catch (error) {
      console.error('Error fetching SCORM details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load existing SCORM details.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingScorm(false);
    }
  };

  const stopScormProgressPolling = (reset = false) => {
    if (scormProgressIntervalRef.current) {
      clearInterval(scormProgressIntervalRef.current);
      scormProgressIntervalRef.current = null;
    }
    if (reset) {
      setScormServerProgress(null);
    }
  };

  // const startScormProgressPolling = lessonId => {
  //   if (!lessonId) return;

  //   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  //   const poll = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${apiBaseUrl}/api/scorm/progress/${lessonId}`,
  //         {
  //           withCredentials: true,
  //           headers: {
  //             ...getAuthHeader(),
  //           },
  //         }
  //       );

  //       const payload = response.data?.data || response.data || {};
  //       const totalFiles =
  //         payload.totalFiles ??
  //         payload.total ??
  //         payload.total_files ??
  //         payload.totalfiles ??
  //         null;
  //       const uploadedCount =
  //         payload.uploadedCount ??
  //         payload.uploaded ??
  //         payload.uploaded_files ??
  //         payload.uploadedcount ??
  //         null;

  //       let percent = payload.percent;
  //       if (
  //         (percent === undefined || percent === null) &&
  //         totalFiles &&
  //         totalFiles > 0
  //       ) {
  //         percent = Math.round(((uploadedCount || 0) / totalFiles) * 100);
  //       }
  //       if (percent === undefined || percent === null) {
  //         percent = 0;
  //       }
  //       percent = Math.max(0, Math.min(100, percent));

  //       setScormServerProgress({
  //         percent,
  //         uploadedCount,
  //         totalFiles,
  //         status: payload.status || 'processing',
  //       });

  //       if (percent >= 100 || payload.status === 'completed') {
  //         stopScormProgressPolling(false);
  //       }
  //     } catch (error) {
  //       if (error.response?.status === 404) {
  //         setScormServerProgress(null);
  //         return;
  //       }
  //       console.error('Error fetching SCORM progress:', error);
  //     }
  //   };

  //   stopScormProgressPolling(false);
  //   poll();
  //   scormProgressIntervalRef.current = setInterval(poll, 1500);
  // };

  const handleOpenScormDialog = lesson => {
    stopScormProgressPolling(true);
    setScormUploadProgress(0);
    setScormLesson(lesson);
    setScormUrl(lesson?.scormUrl || '');
    setScormFile(null);
    setExistingScormUrl(lesson?.scormUrl || '');
    setShowAddScormDialog(true);
    fetchLessonScormDetails(lesson?.id);
  };

  const handleCloseScormDialog = () => {
    setShowAddScormDialog(false);
    setScormLesson(null);
    setScormUrl('');
    setScormFile(null);
    setExistingScormUrl('');
    setIsFetchingScorm(false);
    setScormUploadProgress(0);
    setScormServerProgress(null);
    stopScormProgressPolling(true);
  };

  const handleScormFileChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 1024 * 1024 * 1200; // 1200MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please select a SCORM package under 1200MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: 'Invalid File Type',
        description: 'SCORM packages must be provided as .zip files.',
        variant: 'destructive',
      });
      return;
    }

    setScormFile(file);
  };

  const handleUploadScormFile = async () => {
    if (!scormLesson) {
      toast({
        title: 'Select a Lesson',
        description: 'Choose a lesson before uploading a SCORM package.',
        variant: 'destructive',
      });
      return;
    }

    if (existingScormUrl) {
      toast({
        title: 'Remove Existing SCORM',
        description:
          'Delete the currently attached SCORM package before uploading a new one.',
        variant: 'destructive',
      });
      return;
    }

    if (!scormFile) {
      toast({
        title: 'Select a File',
        description: 'Choose a SCORM package before uploading.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingScorm(true);
      setScormUploadProgress(0);
      setScormServerProgress(null);
      // startScormProgressPolling(scormLesson.id);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const formData = new FormData();
      formData.append('scorm', scormFile);
      formData.append('lesson_id', scormLesson.id);

      const response = await axios.post(
        `${apiBaseUrl}/api/scorm/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            if (!progressEvent.total) return;
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setScormUploadProgress(percent);
          },
        }
      );

      const uploadedUrl =
        response.data?.data?.scorm_url ||
        response.data?.data?.url ||
        response.data?.scorm_url ||
        response.data?.url;

      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no SCORM URL was returned.');
      }

      setScormUrl(uploadedUrl);
      setExistingScormUrl(uploadedUrl);
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === scormLesson.id
            ? { ...lesson, scormUrl: uploadedUrl }
            : lesson
        )
      );
      setScormUploadProgress(100);
      toast({
        title: 'Upload Successful',
        description: 'SCORM package uploaded and linked to this lesson.',
      });
      setTimeout(() => setScormServerProgress(null), 1500);
    } catch (error) {
      console.error('Error uploading SCORM package:', error);
      let errorMessage = 'Failed to upload SCORM package. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setScormServerProgress(null);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingScorm(false);
      setTimeout(() => setScormUploadProgress(0), 600);
      stopScormProgressPolling(false);
    }
  };

  const handleDeleteExistingScorm = async () => {
    if (!scormLesson) return;

    try {
      setIsDeletingScorm(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${apiBaseUrl}/api/lessoncontent/add-scorm-url/${scormLesson.id}`,
        {
          lesson_id: scormLesson.id,
          scorm_url: null,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      setExistingScormUrl('');
      setScormUrl('');
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === scormLesson.id ? { ...lesson, scormUrl: null } : lesson
        )
      );

      toast({
        title: 'Deleted',
        description: 'Existing SCORM package removed.',
      });
    } catch (error) {
      console.error('Error deleting SCORM package:', error);
      let errorMessage = 'Failed to delete SCORM package. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingScorm(false);
    }
  };

  const handleAddScorm = async () => {
    if (!scormLesson) {
      toast({
        title: 'Select a Lesson',
        description: 'Please select a lesson before adding SCORM package.',
        variant: 'destructive',
      });
      return;
    }

    // Check if at least one field is provided
    if (!scormUrl.trim() && !scormFile) {
      toast({
        title: 'SCORM Required',
        description:
          'Please either upload a SCORM package or provide a SCORM URL.',
        variant: 'destructive',
      });
      return;
    }

    // If file is selected but URL is not set yet, user needs to upload first
    if (scormFile && !scormUrl.trim()) {
      toast({
        title: 'Upload Required',
        description:
          'Please upload the SCORM package first, or provide a URL directly.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAddingScorm(true);

      const payload = {
        lesson_id: scormLesson.id,
        scorm_url: scormUrl.trim(),
      };

      // TODO: Replace `/path-to-add-scorm` with the actual API path once available.
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.post(
        `${apiBaseUrl}/api/lessoncontent/add-scorm-url/${scormLesson.id}`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === scormLesson.id
            ? { ...lesson, scormUrl: payload.scorm_url }
            : lesson
        )
      );

      toast({
        title: 'Success',
        description: 'SCORM package added successfully.',
      });

      setExistingScormUrl(payload.scorm_url);
      handleCloseScormDialog();
    } catch (error) {
      console.error('Error adding SCORM package:', error);
      let errorMessage = 'Failed to add SCORM package. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAddingScorm(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      setIsDeleting(true);

      // Use the exact same endpoint format as in Postman
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonToDelete.id}/delete`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      // Remove the deleted lesson from the state
      setLessons(prev =>
        prev.filter(lesson => lesson.id !== lessonToDelete.id)
      );

      toast({
        title: 'Success',
        description: 'Lesson deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      let errorMessage = 'Failed to delete lesson. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setLessonToDelete(null);
    }
  };

  // Lesson Resources Handlers
  const handleOpenResourcesDialog = async lesson => {
    setSelectedLessonForResources(lesson);
    setShowResourcesDialog(true);
    setResourceFile(null);
    setResourceTitle('');
    setResourceDescription('');
    await fetchLessonResources(lesson.id);
  };

  const handleCloseResourcesDialog = () => {
    setShowResourcesDialog(false);
    setSelectedLessonForResources(null);
    setLessonResources([]);
    setResourceFile(null);
    setResourceTitle('');
    setResourceDescription('');
  };

  const fetchLessonResources = async lessonId => {
    try {
      setLoadingResources(true);
      const resources = await getLessonResources(courseId, moduleId, lessonId);
      setLessonResources(Array.isArray(resources) ? resources : []);
    } catch (error) {
      console.error('Error fetching lesson resources:', error);
      // Set empty array on error
      setLessonResources([]);
      toast({
        title: 'Error',
        description: 'Failed to load resources.',
        variant: 'destructive',
      });
    } finally {
      setLoadingResources(false);
    }
  };

  const handleResourceFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!resourceType) {
      toast({
        title: 'Select Type First',
        description: 'Please choose the resource type before selecting a file.',
        variant: 'destructive',
      });
      return;
    }

    const maxSize = 1024 * 1024 * 1024; // 1GB (backend limit)
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file under 1GB.',
        variant: 'destructive',
      });
      return;
    }

    // Basic MIME validation based on selected type
    const mime = file.type.toLowerCase();
    if (resourceType === 'IMAGE' && !mime.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Selected type is Image, but the file is not an image.',
        variant: 'destructive',
      });
      return;
    }
    if (resourceType === 'VIDEO' && !mime.startsWith('video/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Selected type is Video, but the file is not a video.',
        variant: 'destructive',
      });
      return;
    }
    if (resourceType === 'PDF' && mime !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Selected type is PDF, but the file is not a PDF.',
        variant: 'destructive',
      });
      return;
    }

    setResourceFile(file);
    if (!resourceTitle) {
      setResourceTitle(file.name);
    }
  };

  const handleUploadResource = async () => {
    if (!selectedLessonForResources) {
      toast({
        title: 'Select a Lesson',
        description: 'Please select a lesson before uploading resources.',
        variant: 'destructive',
      });
      return;
    }

    if (!resourceFile) {
      toast({
        title: 'Select a File',
        description: 'Please choose a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!resourceTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for the resource.',
        variant: 'destructive',
      });
      return;
    }

    if (!resourceType) {
      toast({
        title: 'Resource Type Required',
        description: 'Please select the type of resource.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingResource(true);

      await uploadLessonResource(
        courseId,
        moduleId,
        selectedLessonForResources.id,
        resourceFile,
        {
          title: resourceTitle,
          description: resourceDescription,
          resource_type: resourceType,
        }
      );

      toast({
        title: 'Success',
        description: 'Resource uploaded successfully!',
      });

      // Refresh resources list
      await fetchLessonResources(selectedLessonForResources.id);

      // Reset form
      setResourceFile(null);
      setResourceTitle('');
      setResourceDescription('');
      setResourceType('');
      if (document.getElementById('resource-file-input')) {
        document.getElementById('resource-file-input').value = '';
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      let errorMessage = 'Failed to upload resource. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteResource = async resourceId => {
    if (!selectedLessonForResources) return;

    try {
      setDeletingResourceId(resourceId);
      await deleteLessonResource(
        courseId,
        moduleId,
        selectedLessonForResources.id,
        resourceId
      );

      toast({
        title: 'Success',
        description: 'Resource deleted successfully!',
      });

      // Refresh resources list
      await fetchLessonResources(selectedLessonForResources.id);
    } catch (error) {
      console.error('Error deleting resource:', error);
      let errorMessage = 'Failed to delete resource. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeletingResourceId(null);
    }
  };

  const openEditResourceDialog = resource => {
    setEditingResource(resource);
    setEditResourceTitle(resource.title || '');
    setEditResourceDescription(resource.description || '');
    setEditResourceType(resource.resource_type || 'TEXT');
    setShowEditResourceDialog(true);
  };

  const handleUpdateResource = async () => {
    if (!selectedLessonForResources || !editingResource) return;

    if (!editResourceTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for the resource.',
        variant: 'destructive',
      });
      return;
    }

    if (!editResourceType) {
      toast({
        title: 'Resource Type Required',
        description: 'Please select the type of resource.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingResourceId(editingResource.id);

      await updateLessonResource(
        courseId,
        moduleId,
        selectedLessonForResources.id,
        editingResource.id,
        {
          title: editResourceTitle,
          description: editResourceDescription,
          resource_type: editResourceType,
        }
      );

      toast({
        title: 'Updated',
        description: 'Resource updated successfully!',
      });

      await fetchLessonResources(selectedLessonForResources.id);
      setShowEditResourceDialog(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error updating resource:', error);
      let errorMessage = 'Failed to update resource. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdatingResourceId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
            {moduleDetails?.title || 'Module Lessons'}
          </h1>
          {moduleDetails?.description && (
            <p className="text-gray-600 mt-1">{moduleDetails.description}</p>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search lessons..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAddLesson} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Lesson
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(index => (
            <Card key={index} className="overflow-hidden">
              {/* Shimmer Thumbnail */}
              <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

              {/* Shimmer Header */}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  {/* Title shimmer */}
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  {/* Badge shimmer */}
                  <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>

              {/* Shimmer Content */}
              <CardContent className="pb-4">
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </CardContent>

              {/* Shimmer Footer */}
              <CardFooter className="pt-0">
                <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Error Loading Lessons
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchModuleLessons}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson, index) => (
            <Card
              key={lesson.id || `lesson-${index}`}
              className="hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              {lesson.thumbnail && (
                <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title || 'Lesson thumbnail'}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                    style={{ display: 'none' }}
                  >
                    Image failed to load
                  </div>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {lesson.title || 'Untitled Lesson'}
                  </CardTitle>
                  <Badge
                    variant={
                      lesson.status === 'PUBLISHED' ? 'default' : 'secondary'
                    }
                    className="whitespace-nowrap"
                  >
                    {lesson.status || 'DRAFT'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {lesson.description || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Order: {lesson.order || 'N/A'}</span>
                  {lesson.updatedAt && (
                    <span>
                      Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleLessonClick(lesson)}
                >
                  <Play className="h-4 w-4" /> View Lesson
                </Button>
                <div
                  className="flex items-center justify-center gap-2 w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenUpdateDialog(lesson);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={e => {
                      e.stopPropagation();
                      setLessonToDelete(lesson);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-green-600 hover:bg-green-50 border-green-200"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenScormDialog(lesson);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add SCORM</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-purple-600 hover:bg-purple-50 border-purple-200"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenResourcesDialog(lesson);
                    }}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="sr-only">Upload Resources</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery
              ? 'No matching lessons found'
              : 'No lessons available yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try a different search term.'
              : 'Create your first lesson to get started.'}
          </p>
          <Button onClick={handleAddLesson}>
            <Plus className="mr-2 h-4 w-4" />
            {searchQuery ? 'Clear Search' : 'Create Your First Lesson'}
          </Button>
        </div>
      )}

      {/* Create Lesson Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new lesson for this module.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                name="title"
                value={newLesson.title}
                onChange={handleInputChange}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={newLesson.description}
                onChange={handleInputChange}
                placeholder="Enter lesson description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                  <Input
                    id="thumbnail"
                    name="thumbnail"
                    value={newLesson.thumbnail}
                    onChange={handleInputChange}
                    placeholder="Enter thumbnail image URL (optional)"
                    type="url"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a URL to an image file.
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileSelect(e, 'create')}
                      className="cursor-pointer"
                      disabled={isUploadingImage}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 500MB. Supported formats: JPG, PNG, GIF,
                    WebP.
                  </p>
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {newLesson.thumbnail && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-600">Preview:</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setNewLesson(prev => ({ ...prev, thumbnail: '' }))
                      }
                      className="h-6 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                    <img
                      src={newLesson.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                      style={{ display: 'none' }}
                    >
                      Invalid image URL
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={newLesson.order}
                  onChange={handleInputChange}
                  placeholder="Lesson order"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newLesson.status}
                onValueChange={value => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLesson}
              disabled={
                !newLesson.title || !newLesson.description || isCreating
              }
              type="submit"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lesson'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Lesson Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Lesson</DialogTitle>
            <DialogDescription>
              Fill in the details below to update the lesson.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                name="title"
                value={currentLesson?.title}
                onChange={e =>
                  setCurrentLesson(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={currentLesson?.description}
                onChange={e =>
                  setCurrentLesson(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter lesson description"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-2">
                  <Input
                    id="thumbnail"
                    name="thumbnail"
                    value={currentLesson?.thumbnail || ''}
                    onChange={e =>
                      setCurrentLesson(prev => ({
                        ...prev,
                        thumbnail: e.target.value,
                      }))
                    }
                    placeholder="Enter thumbnail image URL (optional)"
                    type="url"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a URL to an image file.
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileSelect(e, 'update')}
                      className="cursor-pointer"
                      disabled={isUploadingImage}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 500MB. Supported formats: JPG, PNG, GIF,
                    WebP.
                  </p>
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {currentLesson?.thumbnail && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-600">Preview:</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentLesson(prev => ({ ...prev, thumbnail: '' }))
                      }
                      className="h-6 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                    <img
                      src={currentLesson.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm"
                      style={{ display: 'none' }}
                    >
                      Invalid image URL
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  value={currentLesson?.order}
                  onChange={e =>
                    setCurrentLesson(prev => ({
                      ...prev,
                      order: e.target.value,
                    }))
                  }
                  placeholder="Lesson order"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentLesson?.status}
                  onValueChange={value =>
                    setCurrentLesson(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
              disabled={isUpdating}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLesson}
              disabled={
                !currentLesson?.title ||
                !currentLesson?.description ||
                isUpdating
              }
              type="submit"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Lesson'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!lessonToDelete}
        onOpenChange={open => !open && setLessonToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lesson "
              {lessonToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLesson}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SCORM Dialog */}
      <Dialog
        open={showAddScormDialog}
        onOpenChange={open => !open && handleCloseScormDialog()}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {scormLesson
                ? `Add SCORM Package to "${scormLesson.title || 'Lesson'}"`
                : 'Add SCORM Package'}
            </DialogTitle>
            <DialogDescription>
              Upload a SCORM package file or provide a SCORM package URL to
              attach it to this lesson.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {isFetchingScorm && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading existing SCORM details...</span>
              </div>
            )}

            {existingScormUrl && !isFetchingScorm && (
              <div className="space-y-2">
                <Label>Existing SCORM Package</Label>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
                  <p className="text-sm text-gray-700 break-all">
                    {existingScormUrl}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        window.open(
                          existingScormUrl,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteExistingScorm}
                      disabled={isDeletingScorm}
                    >
                      {isDeletingScorm ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Existing'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Delete the current SCORM package before uploading a
                    replacement.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="scorm-file">Upload SCORM Package</Label>
              <Input
                id="scorm-file"
                type="file"
                accept=".zip"
                onChange={handleScormFileChange}
                disabled={isUploadingScorm || !!existingScormUrl}
              />
              {scormFile && (
                <p className="text-xs text-gray-600">
                  Selected file: {scormFile.name}
                </p>
              )}
              {(isUploadingScorm || scormServerProgress) && (
                <div className="space-y-2 rounded-md border border-blue-100 bg-blue-50/70 p-3">
                  <div className="flex items-center justify-between text-xs text-blue-700 font-medium">
                    <span>
                      {scormServerProgress
                        ? 'Processing SCORM package'
                        : 'Uploading to server'}
                    </span>
                    <span>
                      {scormServerProgress
                        ? `${scormServerProgress.percent}%`
                        : `${scormUploadProgress}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200"
                      style={{
                        width: `${
                          scormServerProgress
                            ? scormServerProgress.percent
                            : scormUploadProgress
                        }%`,
                      }}
                    />
                  </div>
                  {scormServerProgress && (
                    <p className="text-xs text-blue-700">
                      {(
                        scormServerProgress.uploadedCount ?? 0
                      ).toLocaleString()}
                      {scormServerProgress.totalFiles
                        ? ` / ${scormServerProgress.totalFiles.toLocaleString()} files`
                        : ''}{' '}
                      uploaded
                    </p>
                  )}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadScormFile}
                disabled={isUploadingScorm || !scormFile || !!existingScormUrl}
              >
                {isUploadingScorm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload SCORM'
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Upload a ZIP file (max 1200MB). After the upload completes, the
                SCORM URL field below will be filled automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scorm-url">SCORM URL</Label>
              <Input
                id="scorm-url"
                type="url"
                placeholder="https://example.com/path/to/scorm-package"
                value={scormUrl}
                onChange={e => setScormUrl(e.target.value)}
                disabled={isUploadingScorm}
              />
              <p className="text-xs text-gray-500">
                Enter a direct URL to a SCORM package hosted on the cloud, or
                upload a file above.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseScormDialog}
              disabled={isAddingScorm}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddScorm}
              disabled={
                (!scormUrl.trim() && !scormFile) ||
                isAddingScorm ||
                isUploadingScorm
              }
            >
              {isAddingScorm ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding SCORM...
                </>
              ) : (
                'Add SCORM'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Editor Modal */}
      {selectedImageFile && (
        <ImageEditor
          isOpen={showImageEditor}
          onClose={handleImageEditorClose}
          imageFile={selectedImageFile}
          onSave={handleImageEditorSave}
          title="Edit Thumbnail Image"
        />
      )}

      {/* Upload Resources Dialog */}
      <Dialog
        open={showResourcesDialog}
        onOpenChange={open => !open && handleCloseResourcesDialog()}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLessonForResources
                ? `Manage Resources for "${selectedLessonForResources.title || 'Lesson'}"`
                : 'Upload Resources'}
            </DialogTitle>
            <DialogDescription>
              Upload and manage resources for this lesson. Students can download
              these resources.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Upload Section */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-lg font-semibold">Upload New Resource</h3>

              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type *</Label>
                <Select
                  value={resourceType}
                  onValueChange={value => {
                    setResourceType(value);
                    // Clear any previously selected file when changing type
                    setResourceFile(null);
                    if (document.getElementById('resource-file-input')) {
                      document.getElementById('resource-file-input').value = '';
                    }
                  }}
                  disabled={uploadingResource}
                >
                  <SelectTrigger id="resource-type">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="TEXT">
                      Document (Text / Other)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Choose the type that best matches this file. This controls how
                  it is validated and displayed to students.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-file-input">File *</Label>
                <Input
                  id="resource-file-input"
                  type="file"
                  onChange={handleResourceFileChange}
                  disabled={uploadingResource}
                  className="cursor-pointer"
                />
                {resourceFile && (
                  <p className="text-xs text-gray-600">
                    Selected: {resourceFile.name} (
                    {(resourceFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Maximum file size: 1GB. Supported formats: PDF, Images,
                  Videos, Documents.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-title">Title *</Label>
                <Input
                  id="resource-title"
                  value={resourceTitle}
                  onChange={e => setResourceTitle(e.target.value)}
                  placeholder="Enter resource title"
                  disabled={uploadingResource}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-description">Description</Label>
                <Textarea
                  id="resource-description"
                  value={resourceDescription}
                  onChange={e => setResourceDescription(e.target.value)}
                  placeholder="Enter resource description (optional)"
                  rows={3}
                  disabled={uploadingResource}
                />
              </div>

              <Button
                onClick={handleUploadResource}
                disabled={!resourceFile || !resourceTitle || uploadingResource}
                className="w-full"
              >
                {uploadingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resource
                  </>
                )}
              </Button>
            </div>

            {/* Existing Resources Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Existing Resources</h3>

              {loadingResources ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : lessonResources.length > 0 ? (
                <div className="space-y-2">
                  {lessonResources.map((resource, index) => {
                    // Backend response fields: id, title, description, url, resource_type
                    const resourceUrl = resource.url;

                    return (
                      <Card key={resource.id || index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm mb-1 line-clamp-1">
                                {resource.title || 'Untitled Resource'}
                              </h4>
                              {resource.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  {resource.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="capitalize">
                                  {resource.resource_type
                                    ?.replace('_', ' ')
                                    .toLowerCase() || 'File'}
                                </span>
                                {(resource.created_at ||
                                  resource.updated_at) && (
                                  <span>
                                    {new Date(
                                      resource.created_at || resource.updated_at
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {resourceUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      resourceUrl,
                                      '_blank',
                                      'noopener,noreferrer'
                                    )
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditResourceDialog(resource)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteResource(resource.id)
                                }
                                disabled={deletingResourceId === resource.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingResourceId === resource.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2Icon className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No resources uploaded yet.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseResourcesDialog}
              disabled={uploadingResource}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog
        open={showEditResourceDialog}
        onOpenChange={open => {
          if (!open) {
            setShowEditResourceDialog(false);
            setEditingResource(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingResource
                ? `Edit Resource "${editingResource.title || 'Resource'}"`
                : 'Edit Resource'}
            </DialogTitle>
            <DialogDescription>
              Update the title, description, or type of this resource.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-resource-title">Title *</Label>
              <Input
                id="edit-resource-title"
                value={editResourceTitle}
                onChange={e => setEditResourceTitle(e.target.value)}
                placeholder="Enter resource title"
                disabled={!!updatingResourceId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-resource-type">Resource Type *</Label>
              <Select
                value={editResourceType}
                onValueChange={value => setEditResourceType(value)}
                disabled={!!updatingResourceId}
              >
                <SelectTrigger id="edit-resource-type">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Document (Text / Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-resource-description">Description</Label>
              <Textarea
                id="edit-resource-description"
                value={editResourceDescription}
                onChange={e => setEditResourceDescription(e.target.value)}
                placeholder="Enter resource description (optional)"
                rows={3}
                disabled={!!updatingResourceId}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditResourceDialog(false);
                setEditingResource(null);
              }}
              disabled={!!updatingResourceId}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateResource}
              disabled={
                !!updatingResourceId || !editResourceTitle || !editResourceType
              }
            >
              {updatingResourceId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleLessonsView;

import React, { useState } from 'react';
import {
  createCourse,
  createAIModulesAndLessons,
} from '../../services/courseService';
import { createCourseNotification } from '@/services/notificationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, Upload, Loader2, X } from 'lucide-react';
import ImageEditor from '@lessonbuilder/components/blocks/MediaBlocks/ImageEditor';
import { uploadImage } from '@/services/imageUploadService';
import { useToast } from '@/hooks/use-toast';

const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    learning_objectives: '',
    isHidden: false,
    course_status: 'DRAFT',
    estimated_duration: '',
    max_students: 0,
    price: '',
    requireFinalQuiz: true,
    thumbnail: '',
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Image editor and upload state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle file selection for thumbnail
  const handleFileSelect = e => {
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
    setShowImageEditor(true);
  };

  // Handle image save from editor
  const handleImageEditorSave = async editedFile => {
    setShowImageEditor(false);
    setIsUploadingImage(true);

    try {
      // Use the same upload service as ModuleLessonsView
      const uploadResult = await uploadImage(editedFile, {
        folder: 'course-thumbnails',
        public: true,
      });

      if (uploadResult.success && uploadResult.imageUrl) {
        setForm(prev => ({
          ...prev,
          thumbnail: uploadResult.imageUrl,
        }));

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
    }
  };

  // Handle closing image editor
  const handleImageEditorClose = () => {
    setShowImageEditor(false);
    setSelectedImageFile(null);
  };

  // Generate AI modules and lessons
  const generateAIContent = async courseId => {
    // This function is now unused but kept for potential future use
    console.log('AI content generation is disabled in manual course creation');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.estimated_duration || !form.price) {
      setFormError('Title, duration, and price are required.');
      return;
    }
    setFormError('');
    setLoading(true);

    try {
      const learningObjectivesArray = form.learning_objectives
        ? form.learning_objectives
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: form.title,
        description: form.description,
        learning_objectives: learningObjectivesArray,
        isHidden: form.isHidden,
        course_status: form.course_status,
        estimated_duration: form.estimated_duration,
        max_students: form.max_students ? Number(form.max_students) : 0,
        course_level: 'BEGINNER',
        courseType: 'OPEN',
        lockModules: 'UNLOCKED',
        price: form.price,
        requireFinalQuiz: form.requireFinalQuiz,
        thumbnail: form.thumbnail || null,
      };

      const response = await createCourse(payload);

      if (response.success) {
        const courseId = response.data.id;

        onCourseCreated(response.data);

        // Only send notification to all users if course is PUBLISHED (not DRAFT)
        const courseStatus = (form.course_status || '').toUpperCase();

        if (courseStatus === 'PUBLISHED') {
          try {
            console.log(
              'Sending course notification for published course ID:',
              courseId
            );
            const notificationResponse =
              await createCourseNotification(courseId);
            console.log(
              'Course notification sent successfully:',
              notificationResponse
            );
          } catch (err) {
            console.warn(
              'Course notification failed (route might be disabled); continuing.',
              err
            );
            // Add local fallback notification
            const now = new Date();
            const localNotification = {
              id: `local-course-${courseId}-${now.getTime()}`,
              type: 'course',
              title: 'New Course Available',
              message: `"${form.title}" has been published and is now available`,
              created_at: now.toISOString(),
              read: false,
              courseId: courseId,
            };
            window.dispatchEvent(
              new CustomEvent('add-local-notification', {
                detail: localNotification,
              })
            );
          }

          // Trigger UI to refresh notifications
          console.log('Dispatching refresh-notifications event');
          window.dispatchEvent(new Event('refresh-notifications'));
        } else {
          console.log(
            `Course created with status "${form.course_status}" - no notification sent (only PUBLISHED courses notify users)`
          );
        }

        onClose();
        setForm({
          title: '',
          description: '',
          learning_objectives: '',
          isHidden: false,
          course_status: 'DRAFT',
          estimated_duration: '',
          max_students: 0,
          price: '',
          requireFinalQuiz: true,
          thumbnail: '',
        });
        setSelectedImageFile(null);
        setShowImageEditor(false);
      } else {
        setFormError(response.message || 'Failed to create course');
        // Show error to user
        alert(
          'Failed to create course: ' + (response.message || 'Unknown error')
        );
      }
    } catch (err) {
      console.error('Course creation error:', err);
      setFormError(err.message || 'Failed to create course');
      // Show error to user
      alert('Failed to create course: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title*
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course description"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Objectives (one per line)
            </label>
            <textarea
              name="learning_objectives"
              value={form.learning_objectives}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Master neural network basics\nImplement deep learning models"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration*
              </label>
              <input
                type="text"
                name="estimated_duration"
                value={form.estimated_duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 30 mins"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 0 or 199.99"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <input
                type="number"
                name="max_students"
                value={form.max_students}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 80"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Status
              </label>
              <select
                name="course_status"
                value={form.course_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isHidden"
                checked={form.isHidden}
                onChange={handleInputChange}
              />
              <span className="text-sm">Hidden</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requireFinalQuiz"
                checked={form.requireFinalQuiz}
                onChange={handleInputChange}
              />
              <span className="text-sm">Require Final Quiz</span>
            </label>
          </div>

          {/* Thumbnail Section */}
          <div className="space-y-2">
            <Label>Thumbnail Image</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Image URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-2">
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={form.thumbnail}
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
                    onChange={handleFileSelect}
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

            {form.thumbnail && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">Preview:</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm(prev => ({ ...prev, thumbnail: '' }))
                    }
                    className="h-6 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                  <img
                    src={form.thumbnail}
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

          {formError && (
            <div className="text-sm text-red-600 py-2">{formError}</div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>

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
      </div>
    </div>
  );
};

export default CreateCourseModal;

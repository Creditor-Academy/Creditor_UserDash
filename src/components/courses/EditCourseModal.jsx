import React, { useState, useRef, useEffect } from 'react';
import { updateCourse } from '../../services/courseService';
import { createCourseNotification } from '@/services/notificationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, Upload, Loader2, X } from 'lucide-react';
import ImageEditor from '@lessonbuilder/components/blocks/MediaBlocks/ImageEditor';
import { uploadImage } from '@/services/imageUploadService';
import { useToast } from '@/hooks/use-toast';

const EditCourseModal = ({ isOpen, onClose, courseData, onCourseUpdated }) => {
  const { toast } = useToast();
  const [editCourseData, setEditCourseData] = useState(courseData || {});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const editFormRef = useRef(null);

  // Image editor and upload state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Update form data when courseData changes
  useEffect(() => {
    if (courseData) {
      setEditCourseData(courseData);
    }
  }, [courseData]);

  // Clean up image editor state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowImageEditor(false);
      setSelectedImageFile(null);
      setIsUploadingImage(false);
    }
  }, [isOpen]);

  const handleEditInputChange = e => {
    const { name, value, type, checked } = e.target;
    setEditCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
        setEditCourseData(prev => ({
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

  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const payload = { ...editCourseData };
      delete payload.id;
      // Remove any fields not needed by backend
      [
        'created_at',
        'updated_at',
        'createdBy',
        'updatedBy',
        'deleted_at',
      ].forEach(f => delete payload[f]);
      // Ensure thumbnail is included as a string
      if (editCourseData.thumbnail) {
        payload.thumbnail = editCourseData.thumbnail;
      }

      // Check if course status is changing to PUBLISHED
      const oldStatus = (courseData.course_status || '').toUpperCase();
      const newStatus = (editCourseData.course_status || '').toUpperCase();
      const isBeingPublished =
        oldStatus !== 'PUBLISHED' && newStatus === 'PUBLISHED';

      await updateCourse(editCourseData.id, payload);

      // If course is being published, send notification to all users
      if (isBeingPublished) {
        try {
          console.log(
            'Course status changed to PUBLISHED - sending notification for course ID:',
            editCourseData.id
          );
          await createCourseNotification(editCourseData.id);
          console.log('Course publication notification sent successfully');
        } catch (err) {
          console.warn(
            'Course notification failed (route might be disabled); continuing.',
            err
          );
          // Add local fallback notification
          const now = new Date();
          const localNotification = {
            id: `local-course-${editCourseData.id}-${now.getTime()}`,
            type: 'course',
            title: 'New Course Available',
            message: `"${editCourseData.title}" has been published and is now available`,
            created_at: now.toISOString(),
            read: false,
            courseId: editCourseData.id,
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
      }

      onCourseUpdated(editCourseData);
      onClose();
    } catch (err) {
      setEditError(err.message || 'Failed to update course');
    } finally {
      setEditLoading(false);
    }
  };

  if (!isOpen || !courseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Edit Course
        </h2>
        <form
          onSubmit={handleEditSubmit}
          ref={editFormRef}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title*
            </label>
            <input
              type="text"
              name="title"
              value={editCourseData.title || ''}
              onChange={handleEditInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editCourseData.description || ''}
              onChange={handleEditInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                value={editCourseData.estimated_duration || ''}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                value={editCourseData.price || ''}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                value={editCourseData.max_students || ''}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Status
              </label>
              <select
                name="course_status"
                value={editCourseData.course_status || 'DRAFT'}
                onChange={handleEditInputChange}
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
                checked={editCourseData.isHidden || false}
                onChange={handleEditInputChange}
              />
              <span className="text-sm">Hidden</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requireFinalQuiz"
                checked={editCourseData.requireFinalQuiz || false}
                onChange={handleEditInputChange}
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
                  value={editCourseData.thumbnail || ''}
                  onChange={handleEditInputChange}
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

            {editCourseData.thumbnail && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">Preview:</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditCourseData(prev => ({ ...prev, thumbnail: '' }))
                    }
                    className="h-6 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                  <img
                    src={editCourseData.thumbnail}
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
          {editError && (
            <div className="text-sm text-red-600 py-2">{editError}</div>
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
              disabled={editLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editLoading ? 'Updating...' : 'Update Course'}
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

export default EditCourseModal;

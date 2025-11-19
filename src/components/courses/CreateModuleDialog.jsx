import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Upload, Loader2, X } from 'lucide-react';
import ImageEditor from '@lessonbuilder/components/blocks/MediaBlocks/ImageEditor';
import { uploadImage } from '@/services/imageUploadService';
import { useToast } from '@/hooks/use-toast';
import { createModule } from '@/services/courseService';

export function CreateModuleDialog({
  isOpen,
  onClose,
  courseId,
  onModuleCreated,
  existingModules = [],
  initialData = null,
  mode = 'create',
  onSave,
}) {
  const { toast } = useToast();
  const defaultCategory = 'BOOK_SMART';
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: 1,
    estimated_duration: 60,
    module_status: 'DRAFT',
    thumbnail: '',
    price: 0,
    category: defaultCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Image editor and upload state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        order: initialData.order || 1,
        estimated_duration: initialData.estimated_duration || 60,
        module_status: initialData.module_status || 'DRAFT',
        thumbnail: initialData.thumbnail || '',
        price: initialData.price || 0,
        category: initialData.category || defaultCategory,
      });
    } else if (mode === 'create') {
      setForm({
        title: '',
        description: '',
        order: existingModules.length + 1,
        estimated_duration: 60,
        module_status: 'DRAFT',
        thumbnail: '',
        price: 0,
        category: defaultCategory,
      });
    }
  }, [initialData, mode, existingModules.length, isOpen]);

  // Clean up image editor state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowImageEditor(false);
      setSelectedImageFile(null);
      setIsUploadingImage(false);
    }
  }, [isOpen]);

  const handleInputChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value,
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
      // Use the same upload service as courses and lessons
      const uploadResult = await uploadImage(editedFile, {
        folder: 'module-thumbnails',
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.title.trim()) {
        setError('Module title is required');
        setLoading(false);
        return;
      }
      const moduleData = {
        title: form.title.trim(),
        description: form.description.trim() || '',
        order: parseInt(form.order) || existingModules.length + 1,
        estimated_duration: parseInt(form.estimated_duration) || 60,
        module_status: form.module_status || 'DRAFT',
        thumbnail: form.thumbnail.trim() || null,
        price: parseInt(form.price) || 0,
        category: form.category || defaultCategory,
      };
      await onSave(moduleData);
      setForm({
        title: '',
        description: '',
        order: existingModules.length + 2,
        estimated_duration: 60,
        module_status: 'DRAFT',
        thumbnail: '',
        price: 0,
        category: defaultCategory,
      });
      setSelectedImageFile(null);
      setShowImageEditor(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save module');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      title: '',
      description: '',
      order: existingModules.length + 1,
      estimated_duration: 60,
      module_status: 'DRAFT',
      thumbnail: '',
      price: 0,
      category: defaultCategory,
    });
    setError('');
    setSelectedImageFile(null);
    setShowImageEditor(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {mode === 'edit' ? 'Edit Module' : 'Create New Module'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Module Title*</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Enter module title"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter module description"
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={form.order}
                onChange={handleInputChange}
                placeholder="1"
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="estimated_duration">Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                name="estimated_duration"
                type="number"
                value={form.estimated_duration}
                onChange={handleInputChange}
                placeholder="60"
                min="1"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="price">Price (Credits)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of credits required to unlock this module
            </p>
          </div>
          <div>
            <Label htmlFor="module_status">Module Status</Label>
            <Select
              value={form.module_status}
              onValueChange={value =>
                handleSelectChange('module_status', value)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category}
              onValueChange={value => handleSelectChange('category', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOK_SMART">Book Smart</SelectItem>
                <SelectItem value="STREET_SMART">Street Smart</SelectItem>
              </SelectContent>
            </Select>
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
          {error && (
            <div className="text-sm text-red-600 py-2 bg-red-50 rounded-md px-3">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? mode === 'edit'
                  ? 'Saving...'
                  : 'Creating...'
                : mode === 'edit'
                  ? 'Save Changes'
                  : 'Create Module'}
            </Button>
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
}

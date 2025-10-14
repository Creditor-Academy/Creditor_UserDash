import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, Play, FileText, Loader2, AlertCircle, Search, Plus, RefreshCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { getAuthHeader } from "@/services/authHeader";
import { MoreVertical, Edit, Trash2, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ModuleLessonsView = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Lesson creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    order: 1,
    status: "DRAFT",
    thumbnail: "",
  });

  // Lesson deletion state
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lesson update state
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Lesson content state
  const [lessonContent, setLessonContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Fetch module and lessons data
  useEffect(() => {
    fetchModuleLessons();
  }, [courseId, moduleId]);

  const fetchModuleLessons = async () => {
    try {
      setLoading(true);
      
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
        )
      ]);

      // Handle module details response
      const moduleData = moduleResponse.data.data || moduleResponse.data;
      setModuleDetails(moduleData);
      
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
        ...lesson,
        status: lesson.status || lesson.lesson_status || 'DRAFT'
      }));
      
      setLessons(normalizedLessons);
      
      // Set the next order number for new lessons
      const maxOrder = lessonsData.length > 0 
        ? Math.max(...lessonsData.map(l => l.order || 0)) 
        : 0;
      setNewLesson(prev => ({ ...prev, order: maxOrder + 1 }));
      
    } catch (err) {
      console.error("Error fetching module lessons:", err);
      setError("Failed to load module lessons. Please try again later.");
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
        status: createdLesson.lesson_status || createdLesson.status || newLesson.status
      };
      setLessons(prev => [...prev, normalizedLesson]);
      
      // Reset form and close dialog
      setNewLesson({
        title: "",
        description: "",
        order: newLesson.order + 1, // Increment order for next lesson
        status: "DRAFT",
        thumbnail: "",
      });
      
      setShowCreateDialog(false);
      
      toast({
        title: "Success",
        description: "Lesson created successfully!",
      });
      
    } catch (error) {
      console.error("Error creating lesson:", error);
      let errorMessage = "Failed to create lesson. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
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
      if (currentLesson.description) updateData.description = currentLesson.description;
      if (currentLesson.order !== undefined) updateData.order = parseInt(currentLesson.order) || 1;
      if (currentLesson.status !== undefined) updateData.lesson_status = currentLesson.status;
      if (currentLesson.thumbnail !== undefined) updateData.thumbnail = currentLesson.thumbnail || null;
      
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/${currentLesson.id}/update`,
        updateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      );
      
      // Update the lesson in the state with the current lesson data (user's changes)
      setLessons(prev => prev.map(lesson => 
        lesson.id === currentLesson.id ? { ...lesson, ...currentLesson } : lesson
      ));
      
      setShowUpdateDialog(false);
      
      toast({
        title: "Success",
        description: "Lesson updated successfully!",
      });
      
    } catch (error) {
      console.error("Error updating lesson:", error);
      let errorMessage = "Failed to update lesson. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenUpdateDialog = (lesson) => {
    setCurrentLesson({
      ...lesson,
      order: lesson.order || 1,
      status: lesson.status || 'DRAFT',
      thumbnail: lesson.thumbnail || ''
    });
    setShowUpdateDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLesson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setNewLesson(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleLessonClick = (lesson) => {
    // Navigate to the builder - DashboardLayout will auto-collapse sidebar for lesson builder pages
    navigate(`/dashboard/courses/${courseId}/module/${moduleId}/lesson/${lesson.id}/builder`, {
      state: { lessonData: lesson }
    });
  };

  const handleAddLesson = () => {
    setShowCreateDialog(true);
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
            ...getAuthHeader()
          }
        }
      );
      
      // Remove the deleted lesson from the state
      setLessons(prev => prev.filter(lesson => lesson.id !== lessonToDelete.id));
      
      toast({
        title: "Success",
        description: "Lesson deleted successfully!",
      });
      
    } catch (error) {
      console.error("Error deleting lesson:", error);
      let errorMessage = "Failed to delete lesson. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setLessonToDelete(null);
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAddLesson}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Lesson
        </Button>
      </div>

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
            <Card key={lesson.id || `lesson-${index}`} className="hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              {lesson.thumbnail && (
                <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img 
                    src={lesson.thumbnail} 
                    alt={lesson.title || 'Lesson thumbnail'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
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
                    variant={lesson.status === 'PUBLISHED' ? 'default' : 'secondary'}
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
                    <span>Updated: {new Date(lesson.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleLessonClick(lesson)}
                >
                  <Play className="h-4 w-4" /> View Lesson
                </Button>
                <div 
                  className="flex items-center space-x-2 ml-4" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 border-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenUpdateDialog(lesson);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  {/* <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-purple-600 hover:bg-purple-50 border-purple-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle settings click
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button> */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-red-600 hover:bg-red-50 border-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLessonToDelete(lesson);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
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
            {searchQuery ? 'No matching lessons found' : 'No lessons available yet'}
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
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={newLesson.thumbnail}
                onChange={handleInputChange}
                placeholder="Enter thumbnail image URL (optional)"
                type="url"
              />
              <p className="text-xs text-gray-500">
                Enter a URL to an image file. Maximum file size: 100MB. Supported formats: JPG, PNG, GIF, WebP.
              </p>
              {newLesson.thumbnail && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                    <img 
                      src={newLesson.thumbnail} 
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
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
                onValueChange={(value) => handleSelectChange('status', value)}
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
              disabled={!newLesson.title || !newLesson.description || isCreating}
              type="submit"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Lesson'}
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
                onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setCurrentLesson(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter lesson description"
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={currentLesson?.thumbnail || ''}
                onChange={(e) => setCurrentLesson(prev => ({ ...prev, thumbnail: e.target.value }))}
                placeholder="Enter thumbnail image URL (optional)"
                type="url"
              />
              <p className="text-xs text-gray-500">
                Enter a URL to an image file. Maximum file size: 100MB. Supported formats: JPG, PNG, GIF, WebP.
              </p>
              {currentLesson?.thumbnail && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className="w-full h-32 bg-gray-100 rounded border overflow-hidden">
                    <img 
                      src={currentLesson.thumbnail} 
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
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
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, order: e.target.value }))}
                  placeholder="Lesson order"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={currentLesson?.status} 
                  onValueChange={(value) => setCurrentLesson(prev => ({ ...prev, status: value }))}
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
              disabled={!currentLesson?.title || !currentLesson?.description || isUpdating}
              type="submit"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!lessonToDelete} onOpenChange={(open) => !open && setLessonToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lesson "{lessonToDelete?.title}"? This action cannot be undone.
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
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleLessonsView;
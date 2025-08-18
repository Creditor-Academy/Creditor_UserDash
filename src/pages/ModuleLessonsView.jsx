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
    duration: 0,
    order: 1,
    status: "DRAFT",
  });

  // Lesson deletion state
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      
      setLessons(lessonsData);
      
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
        duration: parseInt(newLesson.duration) || 0,
        order: parseInt(newLesson.order) || 1,
        status: newLesson.status,
      };
      
      const response = await axios.post(
        `https://sharebackend-sdkp.onrender.com/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`,
        lessonData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // Add the new lesson to the list
      const createdLesson = response.data.data || response.data;
      setLessons(prev => [...prev, createdLesson]);
      
      // Reset form and close dialog
      setNewLesson({
        title: "",
        description: "",
        duration: 0,
        order: newLesson.order + 1, // Increment order for next lesson
        status: "DRAFT",
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

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/dashboard/courses/${courseId}/module/${moduleId}/lesson/${lessonId}`);
  };

  const handleAddLesson = () => {
    setShowCreateDialog(true);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com/api'}/course/${courseId}/modules/${moduleId}/lesson/${lessonToDelete.id}/delete`,
        {
          headers: getAuthHeader(),
          withCredentials: true,
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
                {lesson.duration && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(lesson.duration)}
                  </div>
                )}
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
                  onClick={() => handleLessonClick(lesson.id)}
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
                      // Handle edit click
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
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
                  </Button>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={newLesson.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 30"
                  required
                />
              </div>
              
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
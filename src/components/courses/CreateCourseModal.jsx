import React, { useState } from 'react';
import { createCourse, createAIModulesAndLessons } from '../../services/courseService';
import { createCourseNotification } from '@/services/notificationService';
import { generateCourseImage } from '@/services/aiCourseService';

const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    learning_objectives: "",
    isHidden: false,
    course_status: "DRAFT",
    estimated_duration: "",
    max_students: 0,
    price: "",
    requireFinalQuiz: true,
    thumbnail: ""
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeThumbnailTab, setActiveThumbnailTab] = useState("upload"); // "upload" or "ai"
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [aiImageError, setAiImageError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "thumbnail" && type === "url") {
      setForm((prev) => ({ ...prev, thumbnail: value }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailTabChange = (tab) => {
    setActiveThumbnailTab(tab);
  };

  const handleAiImagePromptChange = (e) => {
    setAiImagePrompt(e.target.value);
  };

  const generateAiThumbnail = async () => {
    if (!form.title.trim() && !aiImagePrompt.trim()) {
      setAiImageError("Please enter a course title or image prompt");
      return;
    }

    setAiImageGenerating(true);
    setAiImageError("");

    try {
      // Create a more descriptive prompt based on course title if no prompt is provided
      const prompt = aiImagePrompt.trim() || `Professional course thumbnail for "${form.title}" - educational, modern, clean design`;
      
      const response = await generateCourseImage(prompt, {
        style: 'realistic',
        size: '1024x1024'
      });

      if (response.success) {
        setForm(prev => ({ ...prev, thumbnail: response.data.url }));
        setAiImageError("");
        // Show success message
        alert("AI thumbnail generated successfully!");
      } else {
        setAiImageError(response.error || "Failed to generate AI image");
      }
    } catch (error) {
      setAiImageError("Failed to generate AI image: " + error.message);
      // Log detailed error for debugging
      console.error("AI thumbnail generation error details:", {
        message: error.message,
        stack: error.stack,
        prompt: aiImagePrompt.trim() || `Professional course thumbnail for "${form.title}" - educational, modern, clean design`
      });
    } finally {
      setAiImageGenerating(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // For now, we'll just show an alert since we don't have actual file upload implemented
      // In a real implementation, you would upload the file to a server and get a URL back
      alert("File upload functionality would be implemented here. In a real application, this would upload the image and return a URL.");
      console.log("File dropped:", e.dataTransfer.files[0]);
    }
  };

  // Generate AI modules and lessons
  const generateAIContent = async (courseId) => {
    // This function is now unused but kept for potential future use
    console.log("AI content generation is disabled in manual course creation");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.estimated_duration || !form.price) {
      setFormError("Title, duration, and price are required.");
      return;
    }
    setFormError("");
    setLoading(true);

    try {
      const learningObjectivesArray = form.learning_objectives
        ? form.learning_objectives.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        title: form.title,
        description: form.description,
        learning_objectives: learningObjectivesArray,
        isHidden: form.isHidden,
        course_status: form.course_status,
        estimated_duration: form.estimated_duration,
        max_students: form.max_students ? Number(form.max_students) : 0,
        course_level: "BEGINNER",
        courseType: "OPEN",
        lockModules: "UNLOCKED",
        price: form.price,
        requireFinalQuiz: form.requireFinalQuiz,
        thumbnail: form.thumbnail || null
      };

      const response = await createCourse(payload);
      
      if (response.success) {
        const courseId = response.data.id;
        
        onCourseCreated(response.data);
        
        // Send notification to all users about new course
        try {
          console.log('Sending course notification for course ID:', courseId);
          const notificationResponse = await createCourseNotification(courseId);
          console.log('Course notification sent successfully:', notificationResponse);
        } catch (err) {
          console.warn('Course notification failed (route might be disabled); continuing.', err);
          // Add local fallback notification
          const now = new Date();
          const localNotification = {
            id: 'local-course-' + courseId + '-' + now.getTime(),
            type: 'course',
            title: 'Course Created',
            message: '"' + form.title + '" has been created successfully',
            created_at: now.toISOString(),
            read: false,
            courseId: courseId,
          };
          window.dispatchEvent(new CustomEvent('add-local-notification', { detail: localNotification }));
        }
        
        // Trigger UI to refresh notifications
        console.log('Dispatching refresh-notifications event');
        window.dispatchEvent(new Event('refresh-notifications'));

        onClose();
        setForm({
          title: "",
          description: "",
          learning_objectives: "",
          isHidden: false,
          course_status: "DRAFT",
          estimated_duration: "",
          max_students: 0,
          price: "",
          requireFinalQuiz: true,
          thumbnail: ""
        });
        // Reset thumbnail tab state
        setActiveThumbnailTab("upload");
        setAiImagePrompt("");
        setAiImageError("");
      } else {
        setFormError(response.message || "Failed to create course");
        // Show error to user
        alert("Failed to create course: " + (response.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Course creation error:", err);
      setFormError(err.message || "Failed to create course");
      // Show error to user
      alert("Failed to create course: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
           style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title*</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives (one per line)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Status</label>
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
          
          {/* Thumbnail Section with Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail</label>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-3">
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium ${
                  activeThumbnailTab === "upload"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleThumbnailTabChange("upload")}
              >
                Upload Image
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium ${
                  activeThumbnailTab === "ai"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleThumbnailTabChange("ai")}
              >
                Generate with AI
              </button>
            </div>
            
            {/* Tab Content */}
            {activeThumbnailTab === "upload" ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                <input
                  id="thumbnail-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // For now, we'll just show an alert since we don't have actual file upload implemented
                      // In a real implementation, you would upload the file to a server and get a URL back
                      alert("File upload functionality would be implemented here. In a real application, this would upload the image and return a URL.");
                    }
                  }}
                />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Drag & drop an image or click to browse</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                
                <div className="mt-4">
                  <input
                    type="url"
                    name="thumbnail"
                    value={form.thumbnail}
                    onChange={handleInputChange}
                    placeholder="Or enter image URL"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Image Prompt
                  </label>
                  <textarea
                    value={aiImagePrompt}
                    onChange={handleAiImagePromptChange}
                    placeholder={`Describe the image you want to generate for "${form.title || 'your course'}"`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  {!aiImagePrompt && form.title && (
                    <p className="text-xs text-gray-500 mt-1">
                      Using course title as prompt: "Professional course thumbnail for "{form.title}" - educational, modern, clean design"
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateAiThumbnail}
                  disabled={aiImageGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {aiImageGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate AI Thumbnail"
                  )}
                </button>
                {aiImageError && (
                  <div className="text-sm text-red-600">{aiImageError}</div>
                )}
                <div className="text-xs text-gray-500">
                  <p>Tip: Include details like subject matter, style, and mood for better results.</p>
                </div>
              </div>
            )}
            
            {/* Thumbnail Preview */}
            {form.thumbnail && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail Preview</p>
                <div className="border rounded-md p-2 bg-gray-50">
                  <img 
                    src={form.thumbnail} 
                    alt="Thumbnail preview" 
                    className="h-40 w-full object-cover rounded-md" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
          
          {formError && <div className="text-sm text-red-600 py-2">{formError}</div>}
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
      </div>
    </div>
  );
};

export default CreateCourseModal;
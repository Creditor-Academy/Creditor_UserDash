import React, { useState } from 'react';
import { createCourse, createAIModulesAndLessons } from '../../services/courseService';
import { createCourseNotification } from '@/services/notificationService';

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
  const [useAI, setUseAI] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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

  // Generate AI modules and lessons
  const generateAIContent = async (courseId) => {
    setAiGenerating(true);
    try {
      // Call backend AI service to generate course structure
      const response = await fetch('https://creditor-backend-ceds.onrender.com/api/ai/create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: form.title,
          subject: 'General',
          description: form.description,
          targetAudience: 'General audience',
          difficulty: 'intermediate',
          duration: form.estimated_duration
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform AI response to match existing module/lesson structure
          const aiOutlines = [{
            modules: result.data.modules.map(module => ({
              id: module.id,
              title: module.title,
              description: module.description,
              lessons: module.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.intro || lesson.description,
                content: `${lesson.intro || ''}\n\nKey Topics:\n${(lesson.subtopics || []).map(topic => `• ${topic}`).join('\n')}\n\n${lesson.summary || ''}`,
                duration: lesson.duration
              }))
            }))
          }];

          // Create modules and lessons using existing service
          await createAIModulesAndLessons(courseId, aiOutlines);
          console.log('✅ AI modules and lessons created successfully');
        }
      } else {
        // Fallback: create basic structure
        const fallbackOutlines = [{
          modules: [
            {
              id: 1,
              title: `${form.title} - Module 1`,
              description: `Introduction to ${form.title}`,
              lessons: [{
                id: 1,
                title: `Getting Started with ${form.title}`,
                description: `Learn the fundamentals of ${form.title}`,
                content: `Welcome to ${form.title}!\n\nIn this lesson, you'll learn:\n• Core concepts\n• Basic principles\n• Practical applications\n• Next steps\n\nThis provides a solid foundation for your learning journey.`,
                duration: '20 min'
              }]
            },
            {
              id: 2,
              title: `${form.title} - Module 2`,
              description: `Advanced concepts in ${form.title}`,
              lessons: [{
                id: 1,
                title: `Advanced ${form.title} Techniques`,
                description: `Master advanced techniques and best practices`,
                content: `Advanced ${form.title} Concepts\n\nKey areas covered:\n• Advanced techniques\n• Best practices\n• Real-world applications\n• Expert tips\n\nApply these concepts to enhance your expertise.`,
                duration: '25 min'
              }]
            }
          ]
        }];
        
        await createAIModulesAndLessons(courseId, fallbackOutlines);
        console.log('✅ Fallback modules and lessons created');
      }
    } catch (error) {
      console.error('AI content generation failed:', error);
      // Still create basic fallback structure
      const basicOutlines = [{
        modules: [{
          id: 1,
          title: `${form.title} - Introduction`,
          description: `Introduction to ${form.title}`,
          lessons: [{
            id: 1,
            title: `${form.title} Overview`,
            description: `Overview of ${form.title}`,
            content: `Welcome to ${form.title}!\n\nThis course will cover the essential concepts and practical applications.`,
            duration: '15 min'
          }]
        }]
      }];
      
      try {
        await createAIModulesAndLessons(courseId, basicOutlines);
        console.log('✅ Basic structure created as fallback');
      } catch (fallbackError) {
        console.error('Even fallback creation failed:', fallbackError);
      }
    } finally {
      setAiGenerating(false);
    }
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
        
        // Generate AI content if requested
        if (useAI) {
          await generateAIContent(courseId);
        }
        
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
            id: `local-course-${courseId}-${now.getTime()}`,
            type: 'course',
            title: useAI ? 'AI Course Created' : 'Course Created',
            message: `"${form.title}" has been created successfully${useAI ? ' with AI-generated content' : ''}`,
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
        setUseAI(false);
      } else {
        setFormError(response.message || "Failed to create course");
      }
    } catch (err) {
      console.error("Course creation error:", err);
      setFormError(err.message || "Failed to create course");
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <span className="text-sm text-blue-600 font-medium">🤖 Generate with AI</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image URL</label>
            <input
              type="url"
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {form.thumbnail && (
              <img src={form.thumbnail} alt="Preview" className="mt-2 h-24 rounded shadow" onError={(e) => e.target.style.display = 'none'} />
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
              disabled={loading || aiGenerating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (useAI ? 'Creating with AI...' : 'Creating...') : 
               aiGenerating ? 'Generating AI Content...' : 
               (useAI ? '🤖 Create with AI' : 'Create Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal; 
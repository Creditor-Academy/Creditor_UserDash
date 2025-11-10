import React, { useState } from "react";
import { X, Award, Loader2 } from "lucide-react";
import { createBadge } from "@/services/badgeService";
import { toast } from "sonner";

const CreateBadgeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    criteria: "",
    icon: "",
    category: "PARTICIPATION",
    criteria_type: "ATTENDANCE",
    criteria_config: {
      min_attendance: 5
    },
    is_auto_award: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        criteria: "",
        icon: "",
        category: "PARTICIPATION",
        criteria_type: "ATTENDANCE",
        criteria_config: {
          min_attendance: 5
        },
        is_auto_award: true
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.criteria.trim()) {
      newErrors.criteria = "Criteria is required";
    }

    if (!formData.icon.trim()) {
      newErrors.icon = "Icon is required (emoji or URL)";
    } else {
      // Allow emojis or valid URLs
      const isEmoji = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(formData.icon.trim());
      if (!isEmoji) {
        try {
          new URL(formData.icon);
        } catch (e) {
          newErrors.icon = "Please enter a valid emoji or URL";
        }
      }
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.criteria_type) {
      newErrors.criteria_type = "Criteria type is required";
    }

    // Validate criteria_config based on criteria_type
    if (formData.criteria_type === "ATTENDANCE") {
      const minAttendance = formData.criteria_config?.min_attendance;
      if (!minAttendance || minAttendance < 1) {
        newErrors.min_attendance = "Minimum attendance must be at least 1";
      }
    } else if (formData.criteria_type === "QUIZ_PERFORMANCE") {
      const minScore = formData.criteria_config?.min_score;
      const minPassingQuizzes = formData.criteria_config?.min_passing_quizzes;
      if (!minScore || minScore < 0 || minScore > 100) {
        newErrors.min_score = "Minimum score must be between 0 and 100";
      }
      if (!minPassingQuizzes || minPassingQuizzes < 1) {
        newErrors.min_passing_quizzes = "Minimum passing quizzes must be at least 1";
      }
    } else if (formData.criteria_type === "COURSE_COMPLETION") {
      const minCourses = formData.criteria_config?.min_courses;
      if (!minCourses || minCourses < 1) {
        newErrors.min_courses = "Minimum courses must be at least 1";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCriteriaTypeChange = (e) => {
    const criteriaType = e.target.value;
    let defaultConfig = {};
    
    if (criteriaType === "ATTENDANCE") {
      defaultConfig = { min_attendance: 5 };
    } else if (criteriaType === "QUIZ_PERFORMANCE") {
      defaultConfig = { 
        min_score: 90, 
        min_passing_quizzes: 5, 
        require_perfect_score: false 
      };
    } else if (criteriaType === "COURSE_COMPLETION") {
      defaultConfig = { min_courses: 3 };
    } else if (criteriaType === "CUSTOM") {
      defaultConfig = {};
    }

    setFormData(prev => ({
      ...prev,
      criteria_type: criteriaType,
      criteria_config: defaultConfig
    }));
    // Clear related errors
    setErrors(prev => ({
      ...prev,
      min_attendance: "",
      min_score: "",
      min_passing_quizzes: "",
      min_courses: "",
      criteria_type: ""
    }));
  };

  const handleCriteriaConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        criteria_config: {
          ...prev.criteria_config,
          [name]: checked
        }
      }));
    } else {
      const numValue = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        criteria_config: {
          ...prev.criteria_config,
          [name]: isNaN(numValue) ? 0 : numValue
        }
      }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createBadge(formData);
      
      if (response.success || response.code === 201) {
        toast.success(response.message || "Badge created successfully!");
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      } else {
        throw new Error(response.message || "Failed to create badge");
      }
    } catch (error) {
      console.error("Error creating badge:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create badge. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Badge</h3>
              <p className="text-xs text-gray-600">Create a new badge for your platform</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" 
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Badge Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Perfect Attendance"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Criteria */}
            <div>
              <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-1">
                Criteria Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="criteria"
                name="criteria"
                value={formData.criteria}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.criteria ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Attend 5 course events"
                disabled={isSubmitting}
              />
              {errors.criteria && (
                <p className="mt-1 text-sm text-red-600">{errors.criteria}</p>
              )}
            </div>

            {/* Icon (Emoji or URL) */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji or URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.icon ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="🎯 or https://img.icons8.com/fluency/96/medal.png"
                disabled={isSubmitting}
              />
              {errors.icon && (
                <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
              )}
              {formData.icon && !errors.icon && (
                <div className="mt-2 flex items-center gap-2">
                  {/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(formData.icon.trim()) ? (
                    <span className="text-4xl">{formData.icon}</span>
                  ) : (
                    <img 
                      src={formData.icon} 
                      alt="Badge icon preview" 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-xs text-gray-500">Icon preview</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              >
                <option value="PARTICIPATION">Participation</option>
                <option value="EXCELLENCE">Excellence</option>
                <option value="COMPLETION">Completion</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Criteria Type */}
            <div>
              <label htmlFor="criteria_type" className="block text-sm font-medium text-gray-700 mb-1">
                Criteria Type <span className="text-red-500">*</span>
              </label>
              <select
                id="criteria_type"
                name="criteria_type"
                value={formData.criteria_type}
                onChange={handleCriteriaTypeChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.criteria_type ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              >
                <option value="ATTENDANCE">Attendance</option>
                <option value="QUIZ_PERFORMANCE">Quiz Performance</option>
                <option value="COURSE_COMPLETION">Course Completion</option>
                <option value="CUSTOM">Custom</option>
              </select>
              {errors.criteria_type && (
                <p className="mt-1 text-sm text-red-600">{errors.criteria_type}</p>
              )}
            </div>

            {/* Criteria Config - Dynamic based on criteria_type */}
            {formData.criteria_type === "ATTENDANCE" && (
              <div>
                <label htmlFor="min_attendance" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Attendance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="min_attendance"
                  name="min_attendance"
                  value={formData.criteria_config?.min_attendance || ""}
                  onChange={handleCriteriaConfigChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.min_attendance ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="5"
                  disabled={isSubmitting}
                />
                {errors.min_attendance && (
                  <p className="mt-1 text-sm text-red-600">{errors.min_attendance}</p>
                )}
              </div>
            )}

            {/* QUIZ_PERFORMANCE Criteria Config */}
            {formData.criteria_type === "QUIZ_PERFORMANCE" && (
              <>
                <div>
                  <label htmlFor="min_score" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Score (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="min_score"
                    name="min_score"
                    value={formData.criteria_config?.min_score || ""}
                    onChange={handleCriteriaConfigChange}
                    min="0"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.min_score ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="90"
                    disabled={isSubmitting}
                  />
                  {errors.min_score && (
                    <p className="mt-1 text-sm text-red-600">{errors.min_score}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="min_passing_quizzes" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Passing Quizzes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="min_passing_quizzes"
                    name="min_passing_quizzes"
                    value={formData.criteria_config?.min_passing_quizzes || ""}
                    onChange={handleCriteriaConfigChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.min_passing_quizzes ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="5"
                    disabled={isSubmitting}
                  />
                  {errors.min_passing_quizzes && (
                    <p className="mt-1 text-sm text-red-600">{errors.min_passing_quizzes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="require_perfect_score"
                    name="require_perfect_score"
                    checked={formData.criteria_config?.require_perfect_score || false}
                    onChange={handleCriteriaConfigChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="require_perfect_score" className="text-sm font-medium text-gray-700">
                    Require perfect score (100%)
                  </label>
                </div>
              </>
            )}

            {/* COURSE_COMPLETION Criteria Config */}
            {formData.criteria_type === "COURSE_COMPLETION" && (
              <div>
                <label htmlFor="min_courses" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Courses <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="min_courses"
                  name="min_courses"
                  value={formData.criteria_config?.min_courses || ""}
                  onChange={handleCriteriaConfigChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.min_courses ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="3"
                  disabled={isSubmitting}
                />
                {errors.min_courses && (
                  <p className="mt-1 text-sm text-red-600">{errors.min_courses}</p>
                )}
              </div>
            )}


            {/* Auto Award */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_auto_award"
                name="is_auto_award"
                checked={formData.is_auto_award}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="is_auto_award" className="text-sm font-medium text-gray-700">
                Auto-award badge when criteria is met
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Badge"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBadgeModal;

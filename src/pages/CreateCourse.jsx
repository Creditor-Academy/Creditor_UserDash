import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useCourseManagement } from "../hooks/useCourseManagement";
import CourseCard from "../components/courses/CourseCard";
import CreateCourseModal from "../components/courses/CreateCourseModal";
import EditCourseModal from "../components/courses/EditCourseModal";
import CourseUsersModal from "../components/courses/CourseUsersModal";
import CourseModulesSection from "../components/courses/CourseModulesSection";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import { CreateModuleDialog } from "@/components/courses/CreateModuleDialog";
import CreateCourseOptions from "../components/courses/CreateCourseOptions";
import AICourseSuccessModal from "../components/courses/AICourseSuccessModal";
import AICourseOutlineModal from "../components/courses/AICourseOutlineModal";
import AICourseCreationPanel from "../components/courses/AICourseCreationPanel";
import AICourseSystemTest from "../components/courses/AICourseSystemTest";

const CreateCourse = ({ onCourseCreated }) => {
  const {
    courses,
    loading,
    error,
    expandedCourseId,
    courseModules,
    search,
    page,
    hasPrev,
    hasNext,
    totalPages,
    setSearch,
    setPage,
    handleViewModules,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    handleDeleteCourse,
    handleCourseUpdated,
    handleCourseCreated,
  } = useCourseManagement();

  // Modal states
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAISuccessModal, setShowAISuccessModal] = useState(false);
  const [showAIOutlineModal, setShowAIOutlineModal] = useState(false);
  const [showAICoursePanel, setShowAICoursePanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCourseConfirm, setShowDeleteCourseConfirm] = useState(false);
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);
  const [showSystemTest, setShowSystemTest] = useState(false);
  const [createdAICourse, setCreatedAICourse] = useState(null);
  
  // Selected items
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState(null);
  const [selectedCourseForUsers, setSelectedCourseForUsers] = useState(null);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [editModuleData, setEditModuleData] = useState(null);
  const [moduleDialogMode, setModuleDialogMode] = useState("create");

  // API response state
  const [apiResponse, setApiResponse] = useState(null);

  // Handle create course option selection
  const handleCreateOptionSelect = (option) => {
    console.log('Course option selected:', option);
    
    // Immediately close the options modal and clear all states
    setShowCreateOptions(false);
    setShowAIOutlineModal(false);
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowUsersModal(false);
    
    // Use a more reliable approach with multiple RAF calls
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log('Opening modal for option:', option);
        if (option === 'ai') {
          setShowAICoursePanel(true); // Open the AI course creation panel
        } else if (option === 'blank') {
          setShowCreateModal(true);
        } else if (option === 'template') {
          alert('Course templates will be available soon!');
        }
      });
    });
  };

  const handleAICourseCreated = (courseData) => {
    // Refresh the courses list to show the new AI-generated course
    handleCourseCreated(courseData);
    setCreatedAICourse(courseData);
    setShowAICoursePanel(false);
    setShowAISuccessModal(true);
  };

  // Handle AI outline generation
  const handleGenerateOutline = async (outlineData) => {
    console.log('Generating AI course outline with data:', outlineData);
    
    // Close the outline modal
    setShowAIOutlineModal(false);
    
    // Open the AI assisted course modal with the outline data
    setShowAIAssistedModal(true);
  };

  // Handle course edit
  const handleEditClick = (course) => {
    setSelectedCourseForEdit(course);
    setShowEditModal(true);
  };

  // Handle course delete
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteCourseConfirm(true);
  };

  // Handle course delete confirmation
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await handleDeleteCourse(courseToDelete.id);
      setShowDeleteCourseConfirm(false);
      setCourseToDelete(null);
      setApiResponse({ type: "success", message: "Course deleted successfully" });
      setTimeout(() => setApiResponse(null), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
      setApiResponse({ type: "error", message: err.message || "Failed to delete course" });
    }
  };

  // Handle view users
  const handleViewUsers = (courseId) => {
    setSelectedCourseForUsers(courseId);
    setShowUsersModal(true);
  };

  // Handle module creation
  const handleCreateModuleClick = (courseId) => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(null);
    setModuleDialogMode("create");
    setShowCreateModuleDialog(true);
  };

  // Handle module edit
  const handleEditModuleClick = (courseId, module) => {
    setSelectedCourseForModule(courseId);
    setEditModuleData(module);
    setModuleDialogMode("edit");
    setShowCreateModuleDialog(true);
  };

  // Handle module delete
  const handleDeleteModuleClick = (courseId, module) => {
    setModuleToDelete({ courseId, module });
    setShowDeleteConfirm(true);
  };

  // Handle module delete confirmation
  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    
    try {
      const { courseId, module } = moduleToDelete;
      await handleDeleteModule(courseId, module);
      setShowDeleteConfirm(false);
      setModuleToDelete(null);
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module: ' + err.message);
    }
  };

  // Handle module saved
  const handleModuleSaved = async (moduleData) => {
    try {
      if (moduleDialogMode === "edit" && editModuleData) {
        await handleUpdateModule(selectedCourseForModule, editModuleData.id, moduleData);
      } else {
        await handleCreateModule(selectedCourseForModule, moduleData);
      }
    } catch (err) {
      console.error('Error saving module:', err);
      alert('Failed to save module: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading courses</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 mt-1">Create and manage your courses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSystemTest(true)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            🧪 Test AI System
          </button>
          <button
            onClick={() => setShowCreateOptions(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Success/Error Messages */}
      {apiResponse && (
        <div className={`border rounded-lg p-4 ${apiResponse.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-sm ${apiResponse.type === "success" ? "text-green-800" : "text-red-800"}`}>
          {apiResponse.message}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onViewModules={handleViewModules}
            onViewUsers={handleViewUsers}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isExpanded={expandedCourseId === course.id}
          >
            {expandedCourseId === course.id && (
              <CourseModulesSection
                courseId={course.id}
                modules={courseModules[course.id]}
                isLoading={!courseModules[course.id]}
                onCreateModule={handleCreateModuleClick}
                onEditModule={handleEditModuleClick}
                onDeleteModule={handleDeleteModuleClick}
              />
            )}
          </CourseCard>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNext}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateCourseOptions
        isOpen={showCreateOptions}
        onClose={() => setShowCreateOptions(false)}
        onSelectOption={handleCreateOptionSelect}
      />

      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCourseCreated={handleCourseCreated}
      />

      <AICourseOutlineModal
        isOpen={showAIOutlineModal}
        onClose={() => setShowAIOutlineModal(false)}
        onGenerateOutline={handleGenerateOutline}
      />

      <AICourseCreationPanel
        isOpen={showAICoursePanel}
        onClose={() => setShowAICoursePanel(false)}
        onCourseCreated={handleAICourseCreated}
      />

      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        courseData={selectedCourseForEdit}
        onCourseUpdated={handleCourseUpdated}
      />

      <CourseUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        courseId={selectedCourseForUsers}
      />

      <CreateModuleDialog
        isOpen={showCreateModuleDialog}
        onClose={() => setShowCreateModuleDialog(false)}
        courseId={selectedCourseForModule}
        onModuleCreated={() => {}}
        existingModules={courseModules[selectedCourseForModule] || []}
        initialData={editModuleData}
        mode={moduleDialogMode}
        onSave={handleModuleSaved}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteModule}
        title="Delete Module"
        message={`Are you sure you want to delete the module "${moduleToDelete?.module?.title}"? This action cannot be undone.`}
        confirmText="Delete Module"
        type="danger"
      />

      <ConfirmationDialog
        isOpen={showDeleteCourseConfirm}
        onClose={() => setShowDeleteCourseConfirm(false)}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete the course "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Course"
        type="danger"
      />

      <AICourseSuccessModal
        isOpen={showAISuccessModal}
        onClose={() => setShowAISuccessModal(false)}
        courseData={createdAICourse}
        onViewCourse={(course) => {
          // Navigate to course view or expand course modules
          handleViewModules(course.id);
        }}
      />

      {/* AI System Test Modal */}
      {showSystemTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">AI Course System Test Suite</h2>
              <button
                onClick={() => setShowSystemTest(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AICourseSystemTest />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
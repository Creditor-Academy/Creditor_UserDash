import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchCourseById,
  fetchCourseModules,
  createModule,
  updateModule,
  deleteModule,
} from '@/services/courseService';
import { CreateModuleDialog } from '@/components/courses/CreateModuleDialog';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Clock, ArrowLeft, Edit, Trash2 } from 'lucide-react';
const InstructorCourseModulesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const { isInstructorOrAdmin } = useAuth();
  const isAllowed = isInstructorOrAdmin();

  const [collapsed, setCollapsed] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);
  const [moduleDialogMode, setModuleDialogMode] = useState('create');
  const [editModuleData, setEditModuleData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    if (!isAllowed) return;
    const init = async () => {
      try {
        setLoading(true);

        // Check if we have course data from navigation state (OPTIMIZATION)
        const navigationState = location.state;
        console.log('🔍 Checking navigation state:', navigationState);

        if (navigationState?.courseData) {
          console.log(
            '✅ OPTIMIZATION ACTIVE: Using navigation state data - avoiding course API call!'
          );
          console.log(
            '📦 Course data from navigation state:',
            navigationState.courseData
          );

          // Set course details from navigation state
          setCourse(navigationState.courseData);

          // Only fetch modules data (1 API call instead of 2)
          const modulesData = await fetchCourseModules(courseId);
          setModules(Array.isArray(modulesData) ? modulesData : []);
        } else {
          console.log(
            '❌ No navigation state data - falling back to full API calls'
          );
          // Fallback to original approach
          const [courseData, modulesData] = await Promise.all([
            fetchCourseById(courseId),
            fetchCourseModules(courseId),
          ]);
          setCourse(courseData);
          setModules(Array.isArray(modulesData) ? modulesData : []);
        }
      } catch (err) {
        console.error('Error loading course/modules:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, isAllowed, location.state]);

  const handleCreateModuleClick = () => {
    setEditModuleData(null);
    setModuleDialogMode('create');
    setShowCreateModuleDialog(true);
  };

  const handleEditModuleClick = module => {
    setEditModuleData(module);
    setModuleDialogMode('edit');
    setShowCreateModuleDialog(true);
  };

  const handleDeleteModuleClick = module => {
    setModuleToDelete(module);
    setShowDeleteConfirm(true);
  };

  const handleModuleSaved = async moduleData => {
    try {
      if (moduleDialogMode === 'edit' && editModuleData) {
        await updateModule(courseId, editModuleData.id, moduleData);
      } else {
        await createModule(courseId, moduleData);
      }
      const updated = await fetchCourseModules(courseId);
      setModules(updated || []);
      setShowCreateModuleDialog(false);
    } catch (err) {
      alert('Failed to save module: ' + err.message);
    }
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;

    try {
      const moduleData = {
        title: moduleToDelete.title,
        description: moduleToDelete.description || 'test description',
        order: moduleToDelete.order || 1,
        estimated_duration: moduleToDelete.estimated_duration || 60,
        module_status: moduleToDelete.module_status || 'DRAFT',
        thumbnail: moduleToDelete.thumbnail || 'test thumbnail',
      };

      await deleteModule(courseId, moduleToDelete.id, moduleData);
      const updated = await fetchCourseModules(courseId);
      setModules(updated || []);
      setShowDeleteConfirm(false);
      setModuleToDelete(null);
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module: ' + err.message);
    }
  };

  const filteredModules = modules.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = minutes => {
    const m = Number(minutes) || 0;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (!h) return `${rem} min`;
    if (!rem) return `${h} hr`;
    return `${h} hr ${rem} min`;
  };

  if (!isAllowed) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-white">
      {/* Main Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-30">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? '4.5rem' : '17rem' }}
      >
        <header
          className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 h-16 transition-all duration-300"
          style={{ marginLeft: collapsed ? '4.5rem' : '17rem' }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <DashboardHeader sidebarCollapsed={collapsed} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-16">
          <div className="max-w-7xl mx-auto w-full px-6 pb-14 pt-6">
            <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="hover:bg-gray-50 border-gray-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                      {course ? course.title : 'Course'} — Modules
                    </h1>
                    <p className="text-gray-600 text-sm">
                      View and manage all modules of this course.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateModuleClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Module
                </Button>
              </div>
            </section>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative max-w-md flex-1">
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search modules..."
                  className="pl-3 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                {filteredModules.length} module
                {filteredModules.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Modules List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {loading ? (
                <>
                  {[1, 2, 3].map(index => (
                    <div key={index} className="p-6">
                      <div className="flex items-stretch gap-4">
                        {/* Shimmer Thumbnail */}
                        <div className="w-44 h-28 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse"></div>

                        {/* Shimmer Content */}
                        <div className="flex-1 space-y-3">
                          {/* Title and badge shimmer */}
                          <div className="flex items-center gap-3">
                            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>

                          {/* Description shimmer */}
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>

                          {/* Stats shimmer */}
                          <div className="flex items-center gap-4">
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Shimmer Buttons */}
                        <div className="flex flex-col gap-2">
                          <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                          <div className="flex gap-2">
                            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredModules.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No modules found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first module for this course.
                  </p>
                  <Button
                    onClick={handleCreateModuleClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create First Module
                  </Button>
                </div>
              ) : (
                filteredModules.map(mod => (
                  <div
                    key={mod.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-stretch gap-4">
                      {/* Module Thumbnail */}
                      {mod.thumbnail && (
                        <div className="w-44 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={mod.thumbnail}
                            alt={mod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {mod.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              mod.module_status === 'PUBLISHED'
                                ? 'bg-green-100 text-green-800'
                                : mod.module_status === 'DRAFT'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {mod.module_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {mod.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(mod.estimated_duration)}
                          </span>
                          <span>Order: {mod.order || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() =>
                            navigate(
                              `/dashboard/courses/${courseId}/module/${mod.id}/lessons`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Manage Lessons
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditModuleClick(mod)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteModuleClick(mod)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateModuleDialog
        isOpen={showCreateModuleDialog}
        onClose={() => setShowCreateModuleDialog(false)}
        courseId={courseId}
        onModuleCreated={() => {}}
        existingModules={modules}
        initialData={editModuleData}
        mode={moduleDialogMode}
        onSave={handleModuleSaved}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteModule}
        title="Delete Module"
        message={`Are you sure you want to delete the module "${moduleToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Module"
        type="danger"
      />
    </div>
  );
};

export default InstructorCourseModulesPage;

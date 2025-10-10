import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCourseById, fetchCourseModules, createModule } from "@/services/courseService";
import { CreateModuleDialog } from "@/components/courses/CreateModuleDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, Clock, ArrowLeft } from "lucide-react";
import axios from "axios";
import { getAuthHeader } from '../services/authHeader';
const InstructorCourseModulesPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isInstructorOrAdmin } = useAuth();
  const isAllowed = isInstructorOrAdmin();

  const [collapsed, setCollapsed] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);
  const [moduleDialogMode, setModuleDialogMode] = useState("create");
  const [editModuleData, setEditModuleData] = useState(null);


  useEffect(() => {
    if (!isAllowed) return;
    const init = async () => {
      try {
        setLoading(true);
        const [courseData, modulesData] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseModules(courseId),
        ]);
        setCourse(courseData);
        setModules(Array.isArray(modulesData) ? modulesData : []);
      } catch (err) {
        console.error("Error loading course/modules:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, isAllowed]);

  const handleCreateModuleClick = () => {
    setEditModuleData(null);
    setModuleDialogMode("create");
    setShowCreateModuleDialog(true);
  };

  const handleModuleSaved = async (moduleData) => {
    try {
      if (moduleDialogMode === "create") {
        await createModule(courseId, moduleData);
      }
      const updated = await fetchCourseModules(courseId);
      setModules(updated || []);
      setShowCreateModuleDialog(false);
    } catch (err) {
      alert("Failed to save module: " + err.message);
    }
  };

  const filteredModules = modules.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (minutes) => {
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
        style={{ marginLeft: collapsed ? "4.5rem" : "17rem" }}
      >
        <header
          className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 h-16 transition-all duration-300"
          style={{ marginLeft: collapsed ? "4.5rem" : "17rem" }}
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
                      {course ? course.title : "Course"} — Modules
                    </h1>
                    <p className="text-gray-600 text-sm">View and manage all modules of this course.</p>
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modules..."
                  className="pl-3 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {/* Modules List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading modules...</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first module for this course.</p>
                  <Button 
                    onClick={handleCreateModuleClick} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium text-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create First Module
                  </Button>
                </div>
              ) : (
                filteredModules.map((mod) => (
                  <div key={mod.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{mod.title}</h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              mod.module_status === "PUBLISHED"
                                ? "bg-green-100 text-green-800"
                                : mod.module_status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {mod.module_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{mod.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 
                            {formatDuration(mod.estimated_duration)}
                          </span>
                          <span>Order: {mod.order || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => navigate(`/dashboard/courses/${courseId}/module/${mod.id}/lessons`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Manage Lessons
                        </Button>
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

    </div>
  );
};

export default InstructorCourseModulesPage;

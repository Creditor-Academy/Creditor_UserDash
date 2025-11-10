import React, { useState, useEffect } from "react";
import { Award, Plus, Loader2, Calendar, Tag, CheckCircle, XCircle } from "lucide-react";
import CreateBadgeModal from "@/components/badges/CreateBadgeModal";
import { fetchAllBadges, deleteBadge } from "@/services/badgeService";
import { toast } from "sonner";

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAllBadges();
      // Handle different response structures
      const badgesList = response?.data || response || [];
      setBadges(Array.isArray(badgesList) ? badgesList : []);
    } catch (error) {
      console.error("Error loading badges:", error);
      toast.error("Failed to load badges. Please try again.");
      setBadges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeCreated = (newBadge) => {
    // Reload badges list
    loadBadges();
    toast.success("Badge created successfully!");
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm("Are you sure you want to delete this badge?")) {
      return;
    }

    setIsDeleting(badgeId);
    try {
      const response = await deleteBadge(badgeId);
      if (response.success || response.code === 200) {
        toast.success("Badge deleted successfully!");
        loadBadges();
      } else {
        throw new Error(response.message || "Failed to delete badge");
      }
    } catch (error) {
      console.error("Error deleting badge:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete badge. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const getCriteriaTypeLabel = (type) => {
    switch (type) {
      case "ATTENDANCE":
        return "Attendance";
      case "QUIZ_PERFORMANCE":
        return "Quiz Performance";
      case "COURSE_COMPLETION":
        return "Course Completion";
      case "CUSTOM":
        return "Custom";
      default:
        return type;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "PARTICIPATION":
        return "Participation";
      case "EXCELLENCE":
        return "Excellence";
      case "COMPLETION":
        return "Completion";
      default:
        return category;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Badge Management</h2>
          <p className="text-gray-600 mt-1">Create and manage badges for your platform</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Badge
        </button>
      </div>

      {/* Badges List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading badges...</span>
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Badges Yet</h3>
          <p className="text-gray-500 mb-4">Create your first badge to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Badge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              {/* Badge Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {badge.icon ? (
                      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(badge.icon.trim()) ? (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                          {badge.icon}
                        </div>
                      ) : (
                        <img
                          src={badge.icon}
                          alt={badge.title}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      )
                    ) : null}
                    <div
                      className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ${badge.icon ? "hidden" : ""}`}
                    >
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{badge.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {getCategoryLabel(badge.category)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    disabled={isDeleting === badge.id}
                    className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors duration-200 disabled:opacity-50"
                    title="Delete badge"
                  >
                    {isDeleting === badge.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Badge Content */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-700">{badge.criteria}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{getCriteriaTypeLabel(badge.criteria_type)}</span>
                  </div>
                  {badge.is_auto_award ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Auto-award</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Manual</span>
                    </div>
                  )}
                </div>

                {/* Criteria Config */}
                {badge.criteria_config && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-600 space-y-1">
                      {badge.criteria_type === "ATTENDANCE" && badge.criteria_config.min_attendance && (
                        <div>
                          <span className="font-medium">Min Attendance:</span> {badge.criteria_config.min_attendance} events
                        </div>
                      )}
                      {badge.criteria_type === "QUIZ_PERFORMANCE" && (
                        <>
                          {badge.criteria_config.min_score !== undefined && (
                            <div>
                              <span className="font-medium">Min Score:</span> {badge.criteria_config.min_score}%
                            </div>
                          )}
                          {badge.criteria_config.min_passing_quizzes && (
                            <div>
                              <span className="font-medium">Min Passing Quizzes:</span> {badge.criteria_config.min_passing_quizzes}
                            </div>
                          )}
                          {badge.criteria_config.require_perfect_score && (
                            <div>
                              <span className="font-medium">Require Perfect Score:</span> Yes
                            </div>
                          )}
                        </>
                      )}
                      {badge.criteria_type === "COURSE_COMPLETION" && badge.criteria_config.min_courses && (
                        <div>
                          <span className="font-medium">Min Courses:</span> {badge.criteria_config.min_courses}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                {badge.createdAt && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Created: {formatDate(badge.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Badge Modal */}
      <CreateBadgeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleBadgeCreated}
      />
    </div>
  );
};

export default BadgeManagement;

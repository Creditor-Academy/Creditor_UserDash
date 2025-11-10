import React, { useState, useEffect } from "react";
import { X, Award, CheckCircle, Loader2 } from "lucide-react";
import { fetchAllBadges, awardBadge } from "@/services/badgeService";
import { toast } from "sonner";

const AssignBadgeModal = ({ isOpen, onClose, selectedUsers = [], onAssigned }) => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);

  // Fetch badges when modal opens
  useEffect(() => {
    if (isOpen && selectedUsers.length > 0) {
      loadBadges();
    }
  }, [isOpen, selectedUsers]);

  // Reset selected badge when badges load
  useEffect(() => {
    if (badges.length > 0 && !selectedBadgeId) {
      setSelectedBadgeId(badges[0].id);
    }
  }, [badges, selectedBadgeId]);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAllBadges();
      // Handle different response structures
      const badgesList = response?.data || response || [];
      const badgesArray = Array.isArray(badgesList) ? badgesList : [];
      setBadges(badgesArray);
      
      if (badgesArray.length > 0 && !selectedBadgeId) {
        setSelectedBadgeId(badgesArray[0].id);
      }
    } catch (error) {
      console.error("Error loading badges:", error);
      toast.error("Failed to load badges. Please try again.");
      setBadges([]);
    } finally {
      setIsLoading(false);
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
        return type || "Badge";
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
        return category || "Badge";
    }
  };

  const renderBadgeIcon = (icon) => {
    if (!icon) {
      return <Award className="w-5 h-5" />;
    }
    
    // Check if it's an emoji
    if (/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]$/u.test(icon.trim())) {
      return <span className="text-2xl">{icon}</span>;
    }
    
    // Otherwise, try to render as image
    return (
      <img
        src={icon}
        alt="Badge icon"
        className="w-5 h-5 object-contain"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "block";
        }}
      />
    );
  };

  const handleConfirm = async () => {
    if (!selectedBadgeId || selectedUsers.length === 0) {
      toast.error("Please select a badge and at least one user");
      return;
    }

    setIsAssigning(true);
    const results = {
      successful: [],
      failed: [],
      alreadyAwarded: []
    };

    try {
      // Assign badge to each selected user
      for (const user of selectedUsers) {
        // Handle both user objects and user IDs
        let userId;
        if (typeof user === 'string') {
          // If user is just an ID string
          userId = user;
        } else {
          // If user is an object, extract the ID
          userId = user.id || user.user_id || user.user?.id || user.user_id;
        }
        
        if (!userId) {
          console.error('User ID not found for user:', user);
          results.failed.push({ user, error: "User ID not found" });
          continue;
        }
        
        console.log(`[AssignBadgeModal] Awarding badge ${selectedBadgeId} to user ${userId}`);

        try {
          const response = await awardBadge(userId, selectedBadgeId);
          
          // Backend returns: { success: true, code: 200, data: {...}, message: "..." }
          if (response.success === true || response.code === 200) {
            results.successful.push({ 
              user, 
              response: response.data,
              message: response.message 
            });
          } else {
            results.failed.push({ 
              user, 
              error: response.message || "Failed to award badge" 
            });
          }
        } catch (error) {
          const errorData = error?.response?.data;
          const errorMessage = errorData?.message || error?.message || "Failed to award badge";
          const errorStatus = error?.response?.status;
          
          // Check if user already has the badge (400 status with "already has" message)
          if (errorStatus === 400 && (
            errorMessage.toLowerCase().includes("already has") || 
            errorMessage.toLowerCase().includes("already awarded")
          )) {
            results.alreadyAwarded.push({ 
              user, 
              error: errorMessage 
            });
          } else {
            results.failed.push({ 
              user, 
              error: errorMessage 
            });
          }
        }
      }

      // Show summary toast
      const total = selectedUsers.length;
      const successCount = results.successful.length;
      const alreadyCount = results.alreadyAwarded.length;
      const failedCount = results.failed.length;

      if (successCount > 0) {
        toast.success(`Badge assigned to ${successCount} user(s) successfully!`);
      }
      if (alreadyCount > 0) {
        toast.warning(`${alreadyCount} user(s) already have this badge`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to assign badge to ${failedCount} user(s)`);
      }

      // Call onAssigned callback with results
      if (onAssigned) {
        const selectedBadge = badges.find(b => b.id === selectedBadgeId);
        onAssigned({ 
          badge: selectedBadge, 
          users: selectedUsers,
          results 
        });
      }

      // Close modal if all assignments were successful or already awarded
      if (failedCount === 0) {
        onClose && onClose();
      }
    } catch (error) {
      console.error("Error assigning badges:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Badge</h3>
              <p className="text-xs text-gray-600">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" 
            aria-label="Close"
            disabled={isAssigning}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading badges...</span>
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No badges available</p>
              <p className="text-sm text-gray-500 mt-1">Create badges first to assign them to users</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Choose a badge to assign to the selected user(s).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map(badge => (
                  <label
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedBadgeId === badge.id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    } ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="badge"
                      className="sr-only"
                      checked={selectedBadgeId === badge.id}
                      onChange={() => !isAssigning && setSelectedBadgeId(badge.id)}
                      disabled={isAssigning}
                    />
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {renderBadgeIcon(badge.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {badge.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {getCategoryLabel(badge.category)} • {getCriteriaTypeLabel(badge.criteria_type)}
                      </div>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      {selectedBadgeId === badge.id ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <span className="w-5 h-5 inline-block rounded-full border border-gray-300"></span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
            disabled={isAssigning}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isAssigning || !selectedBadgeId || badges.length === 0 || selectedUsers.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Badge"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBadgeModal;
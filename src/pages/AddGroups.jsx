import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Edit, Trash2, BookOpen, MessageSquare, X, Eye, UserPlus } from "lucide-react";
import GroupInfo from "./GroupInfo";
import { createGroup, getGroups, createGroupPost, addGroupMember } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { isInstructorOrAdmin, fetchAllUsers } from "@/services/userService";

const AddGroups = () => {
  const { userProfile } = useUser();
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;

  // Add Member state variables
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteGroupId, setInviteGroupId] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Check if current user is admin or instructor
  const isAdminOrInstructor = isInstructorOrAdmin();

  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Create menu & post modal state
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({
    type: "POST", // POST | ANNOUNCEMENT
    title: "",
    content: "",
    media_url: "",
    is_pinned: false,
  });
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [selectedGroupForView, setSelectedGroupForView] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "common",
    courseName: "",
    isPrivate: false
  });

  // Sample courses for dropdown
  const availableCourses = [
    "Web Development Fundamentals",
    "Data Science Basics",
    "UI/UX Design Principles",
    "Mobile App Development",
    "Python Programming",
    "JavaScript Mastery"
  ];

  // Fetch all users for dropdown
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await fetchAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("❌ AddGroups: Error fetching users:", error);
      toast.error("Failed to load users for member selection");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      setGroupsError(null);
      
      const response = await getGroups();
      
              if (response.success && response.data) {
          // Transform API data to match our component's expected format
          const transformedGroups = response.data.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            type: "common", // Default to common since API doesn't have this field
            courseName: "", // API doesn't have course name
            isPrivate: false, // Default to false since API doesn't have this field
            createdAt: new Date(group.createdAt).toISOString().split('T')[0],
            memberCount: group.members ? group.members.length : 0,
            createdBy: group.created_by,
            members: group.members || []
          }));
          
          // Sort groups by creation date (latest first)
          const sortedGroups = transformedGroups.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setGroups(sortedGroups);
          setCurrentPage(1); // Reset to first page when fetching new data
      } else {
        throw new Error(response.message || "Failed to fetch groups");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupsError(error.message);
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Fetch groups on component mount
  React.useEffect(() => {
    fetchGroups();
    fetchUsers(); // Fetch users on mount
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email;
    }
    return `User ${user.id}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userProfile?.id) {
      toast.error("User profile not found. Please log in again.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingGroup) {
        // Update existing group (for now, just update locally)
        setGroups(prev => prev.map(group => 
          group.id === editingGroup.id 
            ? { ...group, ...formData }
            : group
        ));
        setEditingGroup(null);
        toast.success("Group updated successfully!");
      } else {
        // Create new group via API
        const groupData = {
          name: formData.name,
          description: formData.description,
          created_by: userProfile.id
        };
        
        const response = await createGroup(groupData);
        
        if (response.success && response.data) {
          // Add the new group to the local state
          const newGroup = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            type: formData.type,
            courseName: formData.courseName || "",
            isPrivate: formData.isPrivate,
            createdAt: new Date(response.data.createdAt).toISOString().split('T')[0],
            memberCount: 0
          };
          
          // Refresh the groups list to show the newly created group
          await fetchGroups();
          toast.success("Group created successfully!");
        } else {
          throw new Error(response.message || "Failed to create group");
        }
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "common",
        courseName: "",
        isPrivate: false
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      type: group.type,
      courseName: group.courseName || "",
      isPrivate: group.isPrivate
    });
    setShowModal(true);
  };

  const handleDelete = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "common",
      courseName: "",
      isPrivate: false
    });
    setEditingGroup(null);
    setShowModal(false);
    setIsSubmitting(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(groups.length / groupsPerPage);
  const startIndex = (currentPage - 1) * groupsPerPage;
  const endIndex = startIndex + groupsPerPage;
  const currentGroups = groups.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle adding member to a group
  const handleAddMember = async (groupId) => {
    if (!groupId || !inviteUserId) {
      toast.error("Please select both a group and a user.");
      return;
    }

    // Validate user permissions - allow group creators OR admins/instructors
    const selectedGroup = groups.find(g => g.id === groupId);
    if (!selectedGroup) {
      toast.error("Selected group not found.");
      return;
    }

    // Check if current user is the group creator OR admin/instructor
    const isGroupCreator = selectedGroup.createdBy === userProfile?.id;
    const hasAdminAccess = isAdminOrInstructor;
    
    if (!isGroupCreator && !hasAdminAccess) {
      toast.error("You don't have permission to add members to this group.");
      return;
    }

    // Validate user profile is loaded
    if (!userProfile?.id) {
      toast.error("User profile not loaded. Please refresh the page and try again.");
      return;
    }

    // Validate that the selected user is not already in the group
    if (selectedGroup.members) {
      const isAlreadyMember = selectedGroup.members.some(member => member.id === inviteUserId);
      if (isAlreadyMember) {
        toast.error("This user is already a member of the selected group.");
        return;
      }
    }

    try {
      setAddingMember(true);
      console.log("📤 AddGroups: Adding member to group:", groupId, "User ID:", inviteUserId);
      
      // Add more detailed logging
      console.log("📤 AddGroups: Request payload:", { groupId, userId: inviteUserId });
      console.log("📤 AddGroups: User permissions:", { isAdminOrInstructor });
      console.log("📤 AddGroups: User profile:", { 
        userId: userProfile?.id, 
        userRoles: userProfile?.user_roles,
        firstName: userProfile?.first_name,
        lastName: userProfile?.last_name
      });
      console.log("📤 AddGroups: Selected group:", selectedGroup);
      
      // Show confirmation for admins adding to groups they don't own
      if (!isGroupCreator && hasAdminAccess) {
        const confirmed = window.confirm(
          `You are adding a member to "${selectedGroup.name}" which you don't own. Are you sure you want to proceed?`
        );
        if (!confirmed) {
          setAddingMember(false);
          return;
        }
      }
      
      const result = await addGroupMember(groupId, inviteUserId);
      console.log("✅ AddGroups: API response:", result);
      
      // Get the group name for the success message
      const groupName = selectedGroup?.name || "the group";
      const userName = allUsers.find(u => u.id === inviteUserId)?.first_name || 
                      allUsers.find(u => u.id === inviteUserId)?.name || 
                      inviteUserId;
      
      toast.success(`Successfully added ${userName} to ${groupName}!`);
      setInviteUserId("");
      setInviteGroupId("");
      // Refresh groups to update member counts
      await fetchGroups();
    } catch (error) {
      console.error("❌ AddGroups: Error adding member:", error);
      console.error("❌ AddGroups: Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
             // Provide more specific error messages
       if (error.response?.status === 401) {
         toast.error("Session expired. Please refresh the page and try again.");
       } else if (error.response?.status === 403) {
         // Check the backend error message
         const backendMessage = error.response?.data?.message;
         if (backendMessage) {
           toast.error(backendMessage);
         } else {
           toast.error("You don't have permission to add members to this group. Only group creators can add members.");
         }
       } else if (error.response?.status === 404) {
        toast.error("Group not found. Please refresh and try again.");
      } else if (error.response?.status === 409) {
        toast.error("User is already a member of this group.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to add member. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Group Management</h2>
          <p className="text-gray-600">Create and manage learning communities</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Add Member section - visible to admins/instructors */}
      {isAdminOrInstructor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member to Group
          </h3>
          <p className="text-sm text-blue-600 mb-3">
            Admins and instructors can add members to any group. Group creators can add members to their own groups.
          </p>
          {isAdminOrInstructor && (
            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded mb-3">
              <strong>Your Permissions:</strong> You can add members to any group in the system.
              {groups.some(g => g.createdBy === userProfile?.id) && (
                <span className="ml-2">You also own {groups.filter(g => g.createdBy === userProfile?.id).length} group(s).</span>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-700 mb-1">Select Group</label>
              <select
                value={inviteGroupId}
                onChange={(e) => setInviteGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a group...</option>
                {groups.length === 0 ? (
                  <option value="" disabled>No groups available</option>
                ) : (
                  groups.map((group) => {
                    const isOwnedByUser = group.createdBy === userProfile?.id;
                    return (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.memberCount || 0} members)
                        {isOwnedByUser ? ' - Your Group' : ' - Other Group'}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
                          <div className="flex-1">
                <label className="block text-sm font-medium text-blue-700 mb-1">User Name</label>
                <select
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingUsers}
                >
                  <option value="">Choose a user...</option>
                  {isLoadingUsers ? (
                    <option value="">Loading users...</option>
                  ) : allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </option>
                  ))}
                </select>
                {inviteUserId && (
                  <div className="text-xs text-gray-600 mt-1">
                    {(() => {
                      const selectedUser = allUsers.find(u => u.id === inviteUserId);
                      const userGroups = groups.filter(g => 
                        g.members?.some(m => m.id === inviteUserId)
                      );
                      return (
                        <span>
                          {selectedUser ? getUserDisplayName(selectedUser) : 'User'} is currently in {userGroups.length} group(s)
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            <div className="flex items-end">
              <Button 
                onClick={() => handleAddMember(inviteGroupId)}
                disabled={addingMember || !inviteUserId || !inviteGroupId || isLoadingUsers}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addingMember ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingGroup ? "Edit Group" : "Create New Group"}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Title *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter group title"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the group's purpose"
                    rows={3}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                {/* Group Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="common"
                        checked={formData.type === "common"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Open Group</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="course"
                        checked={formData.type === "course"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Course-Related</span>
                    </label>
                  </div>
                </div>

                {/* Course Selection (if course-related) */}
                {formData.type === "course" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Course *
                    </label>
                    <select
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Choose a course</option>
                      {availableCourses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Privacy Option */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    name="isPrivate"
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Private Group (Invitation Only)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingGroup ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      editingGroup ? "Update Group" : "Create Group"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">All Groups</h3>
          <Button
            onClick={fetchGroups}
            variant="outline"
            size="sm"
            disabled={isLoadingGroups}
            className="text-gray-600 hover:text-gray-800"
          >
            <div className={`h-4 w-4 mr-2 ${isLoadingGroups ? 'animate-spin' : ''}`}>
              {isLoadingGroups ? (
                <div className="rounded-full border-2 border-gray-300 border-t-gray-600 h-full w-full"></div>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </div>
            Refresh
          </Button>
        </div>
        
        {isLoadingGroups ? (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading groups...</p>
            </CardContent>
          </Card>
        ) : groupsError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-3">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 text-sm mb-3">Error loading groups: {groupsError}</p>
              <Button onClick={fetchGroups} variant="outline" size="sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No groups found. Create your first group to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg mt-1 flex-shrink-0 bg-blue-100 text-blue-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{group.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {group.description}
                          </p>
                                                     <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                             <span className="flex items-center gap-1">
                               <Users className="h-3 w-3" />
                               {group.memberCount} members
                             </span>
                             <span className="flex items-center gap-1">
                               <MessageSquare className="h-3 w-3" />
                               Public
                             </span>
                             <span>Created: {group.createdAt}</span>
                             {group.createdBy === userProfile?.id ? (
                               <span className="text-green-600 font-medium">Your Group</span>
                             ) : (
                               <span className="text-blue-600">ID: {group.createdBy.slice(0, 8)}...</span>
                             )}
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGroupForView(group);
                            setShowGroupInfo(true);
                          }}
                          className="h-8 px-2 text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setShowCreateMenu(true);
                          }}
                          className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Create
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(group)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                                                 {isAdminOrInstructor && (
                           <>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => {
                                 setInviteGroupId(group.id);
                                 setInviteUserId("");
                               }}
                               className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                               title="Add Member"
                             >
                               <UserPlus className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => {
                                 // TODO: Implement view members modal
                                 toast.info(`Viewing members of ${group.name} (${group.memberCount} members)`);
                               }}
                               className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                               title="View Members"
                             >
                               <Users className="h-4 w-4" />
                             </Button>
                           </>
                         )}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleDelete(group.id)}
                           className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    // Show current page, first page, last page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className="px-3 py-1 min-w-[40px]"
                        >
                          {pageNumber}
                        </Button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Showing {startIndex + 1}-{Math.min(endIndex, groups.length)} of {groups.length} groups
              </div>
            )}
          </>
        )}
      </div>
      {/* Group Info Modal */}
      {showGroupInfo && selectedGroupForView && (
        <GroupInfo
          group={selectedGroupForView}
          onClose={() => { setShowGroupInfo(false); setSelectedGroupForView(null); }}
        />
      )}
      {/* Create Menu Modal */}
      {showCreateMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create</h3>
              <button
                onClick={() => { setShowCreateMenu(false); setSelectedGroupId(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => { setShowCreateMenu(false); setShowPostModal(true); }}
              >
                Create Post
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => { toast.info("Announcements coming soon"); }}
              >
                Create Announcement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create Post</h3>
              <button
                onClick={() => { setShowPostModal(false); setSelectedGroupId(null); setPostForm({ type: "POST", title: "", content: "", media_url: "", is_pinned: false }); }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedGroupId) { toast.error("No group selected"); return; }
                  setPostSubmitting(true);
                  try {
                    const payload = {
                      group_id: selectedGroupId,
                      type: postForm.type || "POST",
                      title: postForm.title ? postForm.title : null,
                      content: postForm.content,
                      media_url: postForm.media_url ? postForm.media_url : null,
                      // Send camelCase too for backend compatibility
                      mediaUrl: postForm.media_url ? postForm.media_url : null,
                      // Some backends expect "media"
                      media: postForm.media_url ? postForm.media_url : null,
                      is_pinned: !!postForm.is_pinned,
                    };
                    const res = await createGroupPost(payload);
                    if (res?.success) {
                      toast.success("Post created successfully");
                      setShowPostModal(false);
                      setSelectedGroupId(null);
                      setPostForm({ type: "POST", title: "", content: "", media_url: "", is_pinned: false });
                    } else {
                      throw new Error(res?.message || "Failed to create post");
                    }
                  } catch (err) {
                    toast.error(err?.response?.data?.message || err?.message || "Failed to create post");
                  } finally {
                    setPostSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={postForm.type}
                    onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="POST">Post</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                  <Input
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Enter a title (optional)"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <Textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder="Write something..."
                    rows={4}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media URL (optional)</label>
                  <Input
                    value={postForm.media_url}
                    onChange={(e) => setPostForm({ ...postForm, media_url: e.target.value })}
                    placeholder="https://..."
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={postForm.is_pinned}
                    onChange={(e) => setPostForm({ ...postForm, is_pinned: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Pin this post</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={postSubmitting}>
                    {postSubmitting ? 'Posting...' : 'Create Post'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowPostModal(false); setSelectedGroupId(null); }} disabled={postSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddGroups;
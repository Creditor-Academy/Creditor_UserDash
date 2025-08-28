import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Edit, Trash2, BookOpen, MessageSquare, X } from "lucide-react";

const AddGroups = () => {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Web Development Community",
      description: "A community for web developers to share knowledge and collaborate on projects",
      type: "common",
      isPrivate: false,
      createdAt: "2024-01-15",
      memberCount: 24
    },
    {
      id: 2,
      name: "Data Science Learners",
      description: "Group for data science enthusiasts to discuss algorithms and share insights",
      type: "course",
      courseName: "Data Science Fundamentals",
      isPrivate: true,
      createdAt: "2024-01-10",
      memberCount: 18
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingGroup) {
      // Update existing group
      setGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...formData }
          : group
      ));
      setEditingGroup(null);
    } else {
      // Create new group
      const newGroup = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        memberCount: 0
      };
      setGroups(prev => [newGroup, ...prev]);
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
                  >
                    {editingGroup ? "Update Group" : "Create Group"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
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
        <h3 className="text-lg font-semibold text-gray-800">Created Groups</h3>
        
        {groups.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No groups created yet. Create your first group to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg mt-1 flex-shrink-0 ${
                        group.type === 'course' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {group.type === 'course' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{group.name}</h4>
                        {group.type === 'course' && group.courseName && (
                          <p className="text-sm text-purple-600 font-medium truncate">
                            {group.courseName}
                          </p>
                        )}
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
                            {group.isPrivate ? "Private" : "Public"}
                          </span>
                          <span>Created: {group.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(group)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
        )}
      </div>
    </div>
  );
};

export default AddGroups;
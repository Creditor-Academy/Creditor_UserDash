import React, { useState, useEffect } from 'react';
import { X, Users, ChevronDown, Loader2 } from 'lucide-react';
import { getCourseGroups, addGroupMember } from '../../services/groupService';

const AddToGroupModal = ({ isOpen, onClose, selectedUsers, courseId, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [addingToGroup, setAddingToGroup] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourseGroups();
    }
  }, [isOpen, courseId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const fetchCourseGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCourseGroups(courseId);
      if (response.success && response.data) {
        setGroups(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch course groups');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch course groups');
      console.error('Error fetching course groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('No users selected');
      return;
    }

    setAddingToGroup(true);
    setError('');

    try {
      const group = groups.find(g => g.id === selectedGroup);
      if (!group) {
        throw new Error('Selected group not found');
      }

      // Add each user to the group individually (same as AddGroups.jsx)
      const addPromises = selectedUsers.map(userId => 
        addGroupMember(selectedGroup, userId)
      );

      const results = await Promise.allSettled(addPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        // Show success message
        alert(`Successfully added ${successful} user${successful !== 1 ? 's' : ''} to ${group.name}${failed > 0 ? ` (${failed} failed)` : ''}`);
        
        // Call success callback to refresh data
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal and reset
        handleClose();
      } else {
        throw new Error('Failed to add any users to the group');
      }
    } catch (err) {
      setError(err.message || 'Failed to add users to group');
      console.error('Error adding users to group:', err);
    } finally {
      setAddingToGroup(false);
    }
  };

  const handleClose = () => {
    setSelectedGroup('');
    setError('');
    setShowDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add to Group</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading groups...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Group
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    <span className={selectedGroup ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedGroup 
                        ? groups.find(g => g.id === selectedGroup)?.name || 'Select a group'
                        : 'Select a group'
                      }
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {groups.length > 0 ? (
                        groups.map(group => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setSelectedGroup(group.id);
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{group.name}</span>
                              {group.description && (
                                <span className="text-sm text-gray-500 mt-1">{group.description}</span>
                              )}
                              <span className="text-xs text-gray-400 mt-1">
                                {group.members ? group.members.length : 0} members
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No groups found for this course
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {groups.length === 0 && !loading && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    No groups available for this course. Create a group first to add users.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToGroup}
              disabled={!selectedGroup || addingToGroup || groups.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
            >
              {addingToGroup ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Group'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToGroupModal;

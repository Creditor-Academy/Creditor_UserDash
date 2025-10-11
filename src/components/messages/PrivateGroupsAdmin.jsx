import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAllPrivateGroups, getPrivateGroupMessages, getGroupMembers, deletePrivateGroup } from '@/services/privateGroupService';
import { fetchAllUsers } from '@/services/userService';
import { ArrowLeft, Users, Calendar, User, MessageSquare, Trash2 } from 'lucide-react';

const formatDate = (ts) => {
  try {
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

// Page 1: List View
function PrivateGroupsAdminList({ groups, loading, onSelectGroup, searchQuery, onSearchChange, getCreatorName }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Groups Management</h1>
          <p className="text-sm text-gray-500">Browse and manage all private groups on the platform</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search groups by name or ID..."
            className="max-w-md"
          />
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading groups...</div>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">No groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectGroup(group)}
              >
                {/* Group Thumbnail and Name */}
                <div className="flex items-start gap-3 mb-3">
                  {group.thumbnail ? (
                    <img
                      src={group.thumbnail}
                      alt={group.name}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 truncate">
                      {group.name || 'Untitled Group'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">ID: {group.id}</p>
                  </div>
                </div>

                {/* Group Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span className="truncate">
                      Created by: {getCreatorName(group.created_by) || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>{group.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>{formatDate(group.createdAt || group.created_at)}</span>
                  </div>
                </div>

                {/* View Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGroup(group);
                  }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Page 2: Details View
function PrivateGroupDetails({ group, members, onBack, getCreatorName, onDeleteGroup, isDeleting }) {
  const handleViewChatroom = () => {
    // TODO: Implement navigation to chatroom
    // This can be customized based on your routing setup
    // For example: window.location.href = `/admin/groups/${group.id}/chatroom`;
    console.log(`Navigate to chatroom for group ${group.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Group Header */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b">
            {group.thumbnail ? (
              <img
                src={group.thumbnail}
                alt={group.name}
                className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {group.name || 'Untitled Group'}
              </h1>
              <p className="text-sm text-gray-500">Group ID: {group.id}</p>
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {group.description}
              </p>
            </div>
          )}

          {/* Group Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Admin/Creator</h3>
              <p className="text-sm text-gray-600">{getCreatorName(group.created_by) || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Created Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(group.createdAt || group.created_at)}
              </p>
            </div>
          </div>

          {/* Members List */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Members ({members.length})
            </h2>
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No members found
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        S.No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Full Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        User ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member, index) => {
                      const user = member.user || {};
                      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
                      const userId = user.id || member.user_id || 'N/A';
                      const role = (member.role || member.group_role || 'MEMBER').toUpperCase();
                      
                      return (
                        <tr key={member.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{userId}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {role}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t space-y-3">
            <Button
              onClick={handleViewChatroom}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View Chatroom
            </Button>
            
            <Button
              onClick={() => onDeleteGroup(group.id)}
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function PrivateGroupsAdmin() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole('admin');

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all private groups and users on mount
  useEffect(() => {
    if (isAdmin) {
    loadGroups();
      loadAllUsers();
    }
  }, [isAdmin]);

  // Load group details when a group is selected
  useEffect(() => {
    let mounted = true;
    
      if (!selectedGroup?.id) { 
        setMembers([]); 
        return; 
      }

    (async () => {
      try {
        setLoadingDetails(true);
        const membersRes = await getGroupMembers(selectedGroup.id);

        if (!mounted) return;

        setMembers(membersRes?.data || []);
      } catch (error) {
        console.error('Failed to load group details:', error);
        toast({
          title: 'Failed to load group details',
          description: error?.message || 'Unknown error',
          variant: 'destructive'
        });
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedGroup?.id, toast]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await getAllPrivateGroups();
      
      if (!response?.success && response?.message) {
        throw new Error(response.message);
      }
      
      const groups = response?.data || response || [];
      if (!Array.isArray(groups)) {
        throw new Error('Invalid response format');
      }
      
      // Fetch member counts for each group
      const groupsWithMemberCounts = await Promise.all(
        groups.map(async (group) => {
          try {
            const membersRes = await getGroupMembers(group.id);
            const memberCount = Array.isArray(membersRes?.data) ? membersRes.data.length : 0;
            return {
              ...group,
              member_count: memberCount
            };
          } catch (error) {
            console.warn(`Failed to fetch members for group ${group.id}:`, error);
            return {
              ...group,
              member_count: 0
            };
          }
        })
      );
      
      setGroups(groupsWithMemberCounts);
    } catch (error) {
      console.error('Failed to load groups:', error);
      toast({
        title: 'Failed to load private groups',
        description: error?.message || 'Unknown error',
        variant: 'destructive',
        duration: 5000
      });
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setAllUsers([]);
    }
  };

  // Helper function to get creator's name
  const getCreatorName = (creatorId) => {
    if (!creatorId || !allUsers.length) return creatorId;
    
    const user = allUsers.find(u => u.id === creatorId || u._id === creatorId);
    if (user) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || user.name || user.email || creatorId;
    }
    
    return creatorId;
  };

  // Delete group function
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await deletePrivateGroup(groupId);
      
      // Remove the group from the list
      setGroups(prev => prev.filter(g => g.id !== groupId));
      
      // Go back to list view
      setSelectedGroup(null);
      setMembers([]);
      
      toast({
        title: 'Group deleted successfully',
        description: 'The private group has been permanently removed.',
      });
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast({
        title: 'Failed to delete group',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter(g =>
      String(g.name || '').toLowerCase().includes(query) ||
      String(g.id || '').toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setMembers([]);
  };

  // Check for admin access
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-base font-medium">Access Denied</div>
        <div className="text-gray-500 text-sm mt-2">
          Only administrators can access this page.
        </div>
      </div>
    );
  }

  // Show details view if a group is selected
  if (selectedGroup) {
    return (
      <PrivateGroupDetails
        group={selectedGroup}
        members={members}
        onBack={handleBackToList}
        getCreatorName={getCreatorName}
        onDeleteGroup={handleDeleteGroup}
        isDeleting={isDeleting}
      />
    );
  }

  // Show list view by default
  return (
    <PrivateGroupsAdminList
      groups={filteredGroups}
      loading={loading}
      onSelectGroup={handleSelectGroup}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      getCreatorName={getCreatorName}
    />
  );
}

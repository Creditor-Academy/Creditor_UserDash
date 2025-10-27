import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAllPrivateGroups, getPrivateGroupMessages, getGroupMembers, deletePrivateGroup } from '@/services/privateGroupService';
import { fetchAllUsers } from '@/services/userService';
import { ArrowLeft, Users, Calendar, User, MessageSquare, Trash2, Clock } from 'lucide-react';

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
function PrivateGroupDetails({ group, members, onBack, getCreatorName, onDeleteGroup, isDeleting, onViewChatroom }) {

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
              onClick={() => onViewChatroom(group.id)}
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

// Page 3: Admin Chatroom View
function AdminChatroomView({ group, messages, loading, onBack, getCreatorName }) {
  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return 'No date';
      
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'string') {
        // Try parsing as ISO string first
        date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          // Try parsing as Unix timestamp (seconds)
          const unixTimestamp = parseInt(timestamp);
          if (!isNaN(unixTimestamp)) {
            date = new Date(unixTimestamp * 1000);
          }
        }
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamp (could be seconds or milliseconds)
        if (timestamp < 10000000000) {
          // Likely seconds, convert to milliseconds
          date = new Date(timestamp * 1000);
        } else {
          // Likely milliseconds
          date = new Date(timestamp);
        }
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp, error);
      return 'Invalid date';
    }
  };

  const getSenderName = (senderId) => {
    if (!senderId) return 'Unknown User';
    return getCreatorName(senderId) || `User ${senderId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                {group.thumbnail ? (
                  <img
                    src={group.thumbnail}
                    alt={group.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {group.name || 'Untitled Group'}
                  </h1>
                  <p className="text-sm text-gray-500">Admin Chatroom View</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Group Messages</h2>
              <div className="flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No messages found</p>
                <p className="text-gray-400 text-xs mt-1">This group hasn't had any conversations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const senderName = getSenderName(message.sender_id);
                  const isImage = message.type === 'IMAGE' || message.type === 'image';
                  
                  return (
                    <div key={message.id} className="flex gap-3">
                      {/* Sender Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-700">
                            {senderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{senderName}</span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatMessageTime(message.createdAt || message.created_at || message.timestamp || message.timeStamp || message.sent_at)}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          {isImage ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 italic">📷 Image message</p>
                              {message.content && (
                                <img
                                  src={message.content}
                                  alt="Group message"
                                  className="max-w-xs rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {message.content || message.message || 'No content'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
  const [showChatroom, setShowChatroom] = useState(false);
  const [chatroomMessages, setChatroomMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  // Load chatroom messages
  const loadChatroomMessages = async (groupId) => {
    try {
      setLoadingMessages(true);
      const response = await getPrivateGroupMessages(groupId, 1, 100); // Get last 100 messages
      const messages = response?.data?.messages || response?.messages || [];
      
      // Debug: Log message structure to see timestamp format
      if (messages.length > 0) {
        console.log('Sample message structure:', messages[0]);
      }
      
      setChatroomMessages(messages);
    } catch (error) {
      console.error('Failed to load chatroom messages:', error);
      toast({
        title: 'Failed to load messages',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive'
      });
      setChatroomMessages([]);
    } finally {
      setLoadingMessages(false);
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
    setShowChatroom(false);
    setChatroomMessages([]);
  };

  const handleViewChatroom = async (groupId) => {
    setShowChatroom(true);
    await loadChatroomMessages(groupId);
  };

  const handleBackToDetails = () => {
    setShowChatroom(false);
    setChatroomMessages([]);
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

  // Show chatroom view if viewing chatroom
  if (showChatroom && selectedGroup) {
  return (
      <AdminChatroomView
        group={selectedGroup}
        messages={chatroomMessages}
        loading={loadingMessages}
        onBack={handleBackToDetails}
        getCreatorName={getCreatorName}
      />
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
        onViewChatroom={handleViewChatroom}
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

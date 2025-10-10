import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAllPrivateGroups, deletePrivateGroup, getPrivateGroupMessages, getGroupMembers } from '@/services/privateGroupService';

const formatTs = (ts) => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts || '');
  }
};

export default function PrivateGroupsAdmin() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole('admin');

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all private groups
  useEffect(() => {
    loadGroups();
  }, []);

  // Load group details when a group is selected
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedGroup?.id) { 
        setMessages([]); 
        setMembers([]); 
        return; 
      }

      try {
        const [messagesRes, membersRes] = await Promise.all([
          getPrivateGroupMessages(selectedGroup.id, 1, 10), // Get last 10 messages
          getGroupMembers(selectedGroup.id)
        ]);

        if (!mounted) return;

        setMessages(messagesRes?.data?.messages || []);
        setMembers(membersRes?.data || []);
      } catch (error) {
        toast({
          title: 'Failed to load group details',
          description: error?.message || 'Unknown error',
          variant: 'destructive'
        });
      }
    })();
    return () => { mounted = false; };
  }, [selectedGroup?.id, toast]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await getAllPrivateGroups();
      
      // Handle error responses
      if (!response?.success && response?.message) {
        throw new Error(response.message);
      }
      
      // Handle both response formats
      const groups = response?.data || response || [];
      if (!Array.isArray(groups)) {
        throw new Error('Invalid response format');
      }
      
      setGroups(groups);
    } catch (error) {
      // Detailed error logging
      console.error('Failed to load groups:', {
        error: error,
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method
        }
      });

      // Show error toast with more details
      toast({
        title: 'Failed to load private groups',
        description: `${error?.response?.data?.message || error?.message || 'Unknown error'} (${error?.response?.status || 'No status'})`,
        variant: 'destructive',
        duration: 5000 // Show for longer since it's an error
      });
      // Set empty array to avoid undefined errors
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group? This action is permanent.')) return;
    
    try {
      setIsDeleting(true);
      await deletePrivateGroup(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setSelectedGroup(null);
      toast({ title: 'Group deleted' });
    } catch (error) {
      toast({
        title: 'Failed to delete group',
        description: error?.message || 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g =>
      String(g.name || '').toLowerCase().includes(q) ||
      String(g.id || '').toLowerCase().includes(q)
    );
  }, [groups, query]);

  // Check for admin access
  if (!isAdmin) {
    // Show error toast for non-admin users
    useEffect(() => {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can access this page.',
        variant: 'destructive',
        duration: 5000
      });
    }, [toast]);

    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-base font-medium">Access Denied</div>
        <div className="text-gray-500 text-sm mt-2">Only administrators can access this page.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] bg-muted rounded-lg border shadow-sm overflow-hidden">
      {/* Top Search Bar */}
      <div className="bg-white border-b p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groups by name or ID"
          className="max-w-lg mx-auto"
        />
      </div>

      {/* Content: Groups List + Details */}
      <div className="flex flex-1 overflow-hidden">
        {/* Groups List */}
        <div className="w-72 bg-white border-r p-4 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-400">Loading groups...</div>
          ) : filtered.length ? (
            filtered.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                className={`w-full block text-left px-3 py-2 rounded mb-1 ${
                  selectedGroup?.id === g.id
                    ? 'bg-blue-100 border border-blue-400'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {g.thumbnail ? (
                    <img src={g.thumbnail} alt={g.name} className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-200" />
                  )}
                  <div className="flex-1 truncate">
                    <span className="font-medium text-sm">{g.name || 'Untitled'}</span>
                    <div className="text-xs text-gray-500 truncate">{g.id}</div>
                    {Array.isArray(g.members) && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        {g.members.length} members
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-xs text-gray-400">No groups found.</div>
          )}
        </div>

        {/* Group Details */}
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          {!selectedGroup ? (
            <div className="flex flex-col h-full items-center justify-center text-gray-400 text-base">
              Select a group to view details
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-4">
                  {selectedGroup.thumbnail ? (
                    <img src={selectedGroup.thumbnail} alt={selectedGroup.name} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-200" />
                  )}
                  <div>
                    <div className="text-lg font-semibold">{selectedGroup.name || 'Untitled Group'}</div>
                    <div className="text-xs text-gray-500">Created: {formatTs(selectedGroup.createdAt || selectedGroup.created_at)}</div>
                    <div className="text-xs text-gray-500">Created by: {selectedGroup.created_by}</div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => handleDeleteGroup(selectedGroup.id)}
                >
                  Delete Group
                </Button>
              </div>

              {/* Description */}
              {selectedGroup.description && (
                <div className="text-sm text-gray-600 border rounded p-3 bg-gray-50">{selectedGroup.description}</div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Admins */}
                <div>
                  <div className="text-sm font-semibold mb-2">Admins</div>
                  <div className="bg-gray-50 rounded p-2 space-y-1 max-h-32 overflow-auto text-xs">
                    {(members || []).filter(
                      m => (m.role || m.group_role || '').toUpperCase() === 'ADMIN'
                    ).map(m => (
                      <div key={m.user_id || m.id}>
                        {(m.user?.first_name || '') + ' ' + (m.user?.last_name || '')}
                        {' '}({m.user?.id || m.user_id})
                      </div>
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div>
                  <div className="text-sm font-semibold mb-2">
                    Members <span className="ml-1 text-xs text-gray-400">({members?.length || 0})</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 space-y-1 max-h-32 overflow-auto text-xs">
                    {(members || []).map(m => (
                      <div key={m.user_id || m.id}>
                        {(m.user?.first_name || '') + ' ' + (m.user?.last_name || '')}
                        {' '}({m.user?.id || m.user_id}) - {(m.role || m.group_role || '').toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <div className="text-sm font-semibold mb-2">Recent Messages</div>
                  <div className="bg-gray-50 rounded p-2 space-y-2 max-h-32 overflow-auto text-xs">
                    {(messages || []).map(msg => (
                      <div key={msg.id} className="mb-1">
                        <div className="text-[11px] text-gray-400">{formatTs(msg.createdAt)}</div>
                        {msg.type === 'image'
                          ? <a href={msg.file} target="_blank" rel="noreferrer" className="text-blue-500">Image</a>
                          : <div>{msg.text}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
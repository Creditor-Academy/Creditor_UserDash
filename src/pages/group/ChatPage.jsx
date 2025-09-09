import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { professionalAvatars } from "@/lib/avatar-utils";
import getSocket from "@/services/socketClient";

import { ChatMessagesList } from "@/components/group/ChatMessagesList";
import { ChatInput } from "@/components/group/ChatInput";
import { Users, X, Loader2, Search, Shield, GraduationCap, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getGroupById, getGroupMembers, getGroupMessages, sendGroupMessage, deleteGroupMessage, editGroupMessage } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";

const initialMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Sarah Adams",
    senderAvatar: professionalAvatars.female[0].url,
    content: "Hi everyone, let's start the call soon 😊",
    timestamp: "10:30 AM",
    type: 'text'
  },
  {
    id: 2,
    senderId: 2,
    senderName: "Kate Johnson",
    senderAvatar: professionalAvatars.male[1].url,
    content: "Recently I saw properties in a great location that I did not pay attention to before 😊",
    timestamp: "10:24 AM",
    type: 'text'
  },
  {
    id: 3,
    senderId: 3,
    senderName: "Evan Scott",
    senderAvatar: professionalAvatars.male[0].url,
    content: "Ops, why don't you say something more",
    timestamp: "10:26 AM",
    type: 'text'
  },
  {
    id: 4,
    senderId: 1,
    senderName: "Sarah Adams",
    senderAvatar: professionalAvatars.female[0].url,
    content: "@Kate 😊",
    timestamp: "10:27 AM",
    type: 'text'
  },
  {
    id: 5,
    senderId: 0,
    senderName: "You",
    senderAvatar: "",
    content: "She creates an atmosphere of mystery 😊",
    timestamp: "11:26 AM",
    type: 'text'
  },
  {
    id: 6,
    senderId: 0,
    senderName: "You",
    senderAvatar: "",
    content: "😎 😊",
    timestamp: "11:26 AM",
    type: 'text'
  },
  {
    id: 7,
    senderId: 3,
    senderName: "Evan Scott",
    senderAvatar: professionalAvatars.male[0].url,
    content: "Kate, don't be like that and say something more :) 😊",
    timestamp: "11:34 AM",
    type: 'text'
  }
];

export function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { groupId } = useParams();
  const { userProfile } = useUser();
  const currentUserId = userProfile?.id || 0;

  // Fetch group information and members on component mount
  useEffect(() => {
    fetchGroupInfo();
    // Preload members to show accurate count in header without opening the modal
    fetchGroupMembers({ openModal: false, silent: true });
    // load messages
    loadMessages();

    // If user not identified yet, skip socket room join for now
    if (!groupId || !currentUserId) {
      console.warn('[chat] skip join: missing groupId or currentUserId');
      return;
    }

    // Realtime: join group room
    const socket = getSocket();
    const uid = currentUserId;
    // Ensure we always join the latest room
    console.log('[socket][emit] joinGroup', { groupId, userId: uid });
    socket.emit('joinGroup', { groupId, userId: uid });
    // also listen for acks if backend sends any (no-op if not)
    socket.once && socket.once('joinedGroup', () => {
      console.log('[socket] joined group', groupId);
    });

    // Re-join on reconnect to handle network hiccups
    const onConnect = () => {
      console.log('[socket] connected. re-joining', { groupId, userId: uid });
      socket.emit('joinGroup', { groupId, userId: uid });
    };
    socket.on('connect', onConnect);

    const sameGroup = (gid) => String(gid) === String(groupId);
    const onNewMessage = (payload) => {
      console.log('[socket][on] newGroupMessage', payload);
      // Backend sends message with group_id field
      const inThisGroup = sameGroup(payload?.group_id ?? payload?.groupId);
      if (inThisGroup) {
        setMessages(prev => {
          // If message already exists by id, skip
          if (payload?.id && prev.some(m => m.id === payload.id)) return prev;

          const normalized = {
            id: payload.id,
            senderId: payload.sender_id ?? payload.senderId,
            senderName: payload.sender?.first_name || 'Member',
            senderAvatar: payload.sender?.image || '',
            content: payload.content,
            timestamp: payload.timeStamp ? new Date(payload.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: (payload.type || 'TEXT').toLowerCase() === 'voice' ? 'voice' : (payload.mime_type || payload.mimeType ? 'file' : 'text'),
          };

          // Try to replace a matching optimistic message (same sender and content)
          const idx = prev.findIndex(m => String(m.id).startsWith('tmp-') && m.senderId === (payload.sender_id ?? payload.senderId) && m.content === payload.content);
          if (idx !== -1) {
            const clone = [...prev];
            clone[idx] = normalized;
            return clone;
          }
          return [...prev, normalized];
        });
      }
    };
    socket.on('newGroupMessage', onNewMessage);

    // Listen for user join/leave notifications
    const onUserJoined = (data) => {
      console.log('[socket][on] userJoinedGroup', data);
      if (sameGroup(data.groupId)) {
        console.log('[socket] User joined:', data.message);
        // Optimistically refresh members count without forcing modal
        fetchGroupMembers({ openModal: false, silent: true });
      }
    };
    const onUserLeft = (data) => {
      console.log('[socket][on] userLeftGroup', data);
      if (sameGroup(data.groupId)) {
        console.log('[socket] User left:', data.message);
        fetchGroupMembers({ openModal: false, silent: true });
      }
    };
    socket.on('userJoinedGroup', onUserJoined);
    socket.on('userLeftGroup', onUserLeft);

    // Group membership and info management
    const onMemberAdded = (member) => {
      console.log('[socket][on] memberAdded', member);
      if (sameGroup(member?.group_id || member?.groupId)) {
        // Update list if visible; otherwise keep count fresh
        setGroupMembers((prev) => {
          // Avoid duplicates by id
          const exists = prev.some(m => (m.id || m.user?.id) === (member.id || member.user?.id));
          if (exists) return prev;
          return [...prev, member];
        });
      }
    };
    const onMemberRemoved = (payload) => {
      console.log('[socket][on] memberRemoved', payload);
      if (sameGroup(payload?.groupId)) {
        const removedId = payload?.userId;
        setGroupMembers((prev) => prev.filter(m => (m.user?.id ?? m.id) !== removedId));
      }
    };
    const onGroupInfoUpdated = (updated) => {
      console.log('[socket][on] groupInfoUpdated', updated);
      if (sameGroup(updated?.id)) {
        setGroupInfo((prev) => ({ ...prev, ...updated }));
      }
    };
    socket.on('memberAdded', onMemberAdded);
    socket.on('memberRemoved', onMemberRemoved);
    socket.on('groupInfoUpdated', onGroupInfoUpdated);

    // Server error channel
    const onServerError = (err) => {
      console.warn('[socket][on] error', err);
      if (!err) return;
      try {
        toast({
          title: 'Socket error',
          description: err.message || 'An error occurred',
          variant: 'destructive'
        });
      } catch {}
    };
    socket.on('error', onServerError);

    // Connection diagnostics to help identify realtime issues
    const onConnectError = (err) => {
      try {
        console.warn('[socket] connect_error', err?.message || err);
        toast({ title: 'Connection issue', description: err?.message || 'Failed to connect to realtime server', variant: 'destructive' });
      } catch {}
    };
    const onDisconnect = (reason) => {
      try {
        console.warn('[socket] disconnected', reason);
      } catch {}
    };
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.emit('leaveGroup', { groupId, userId: uid });
      socket.off('connect', onConnect);
      socket.off('newGroupMessage', onNewMessage);
      socket.off('userJoinedGroup', onUserJoined);
      socket.off('userLeftGroup', onUserLeft);
      socket.off('memberAdded', onMemberAdded);
      socket.off('memberRemoved', onMemberRemoved);
      socket.off('groupInfoUpdated', onGroupInfoUpdated);
      socket.off('error', onServerError);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
    };
  }, [groupId, currentUserId]);

  const loadMessages = async () => {
    try {
      const res = await getGroupMessages(groupId, 1, 100);
      const list = res?.data?.messages || res?.messages || [];
      const normalized = list.map(m => ({
        id: m.id,
        senderId: m.sender_id || m.senderId,
        senderName: m.sender?.first_name || m.sender?.name || 'Member',
        senderAvatar: m.sender?.image || '',
        content: m.content,
        timestamp: m.timeStamp ? new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        type: (m.type || 'TEXT').toLowerCase() === 'voice' ? 'voice' : (m.mime_type ? 'file' : 'text'),
      }));
      setMessages(normalized);
    } catch (e) {
      console.warn('Failed to load messages', e);
    }
  };

  const fetchGroupInfo = async () => {
    try {
      setLoadingGroup(true);
      // Fetch group details from backend using groupService
      const response = await getGroupById(groupId);
      if (response.success) {
        setGroupInfo(response.data);
      } else {
        console.error('Failed to fetch group info:', response.message);
        // Fallback to default group name
        setGroupInfo({ name: `Group ${groupId}` });
      }
    } catch (error) {
      console.error('Error fetching group info:', error);
      // Fallback to default group name
      setGroupInfo({ name: `Group ${groupId}` });
      
      // Show error toast only if it's not a network error
      if (error.response?.status !== 404) {
        toast({
          title: "Warning",
          description: "Could not fetch group name. Using default name.",
          variant: "default"
        });
      }
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchGroupMembers = async ({ openModal = true, silent = false } = {}) => {
    try {
      setLoadingMembers(true);
      // Fetch group members using groupService
      const response = await getGroupMembers(groupId);
      
      if (response.success) {
        setGroupMembers(response.data || []);
        if (openModal) {
          setShowMembers(true);
        }
        if (!silent) {
          toast({
            title: "Success",
            description: `Fetched ${response.data?.length || 0} group members`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch group members",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        toast({
          title: "Error",
          description: "Group not found or you don't have access to it",
          variant: "destructive"
        });
      } else if (error.response?.status === 403) {
        toast({
          title: "Error",
          description: "You don't have permission to view group members",
          variant: "destructive"
        });
      } else if (error.response?.status === 401) {
        toast({
          title: "Error",
          description: "Please log in to view group members",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch group members. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const optimistic = {
      id: `tmp-${Date.now()}`,
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    setMessages(prev => [...prev, optimistic]);
    const toSend = newMessage;
    setNewMessage("");
    try {
      // emit over socket to let backend broadcast; also call REST as fallback
      const socket = getSocket();
      const payload = {
        groupId,
        group_id: groupId,
        userId: currentUserId,
        sender_id: currentUserId,
        content: toSend,
        type: 'TEXT'
      };
      console.log('[socket][emit] sendGroupMessage', payload);
      socket.emit('sendGroupMessage', payload);

      const res = await sendGroupMessage(groupId, { content: toSend, type: 'TEXT' });
      const m = res?.data || res;
      if (m?.id) {
        setMessages(prev => prev.map(x => x.id === optimistic.id ? {
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender?.first_name || 'You',
          senderAvatar: m.sender?.image || '',
          content: m.content,
          timestamp: new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        } : x));
      }
    } catch (e) {
      // rollback
      setMessages(prev => prev.filter(x => x.id !== optimistic.id));
    }
  };

  const handleSendVoiceMessage = (audioBlob, duration) => {
    const message = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "",
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'voice',
      audioBlob,
      duration
    };

    setMessages([...messages, message]);
    setShowVoiceRecorder(false);
  };

  // Edit/Delete message handlers
  const handleEditMessage = async (messageId, newContent) => {
    const snapshot = messages;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
    try {
      await editGroupMessage(groupId, messageId, { content: newContent });
      // Note: Backend doesn't have edit/delete socket events, so we rely on REST API only
    } catch (e) {
      setMessages(snapshot);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // optimistic remove
    const snapshot = messages;
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      await deleteGroupMessage(groupId, messageId);
      // Note: Backend doesn't have edit/delete socket events, so we rely on REST API only
    } catch (e) {
      // restore on failure
      setMessages(snapshot);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const message = {
        id: Date.now(),
        senderId: currentUserId,
        senderName: "You",
        senderAvatar: "",
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'file'
      };
      setMessages([...messages, message]);
    }
  };

  const getGroupName = () => {
    if (loadingGroup) {
      return "Loading...";
    }
    return groupInfo?.name || `Group ${groupId}`;
  };

  const getMemberCount = () => {
    return groupMembers.length || 0;
  };

  const isCurrentUserAdmin = () => {
    // If groupMembers have role info, check current user or groupInfo.created_by
    try {
      const me = groupMembers.find(m => (m.user?.id ?? m.id) === currentUserId);
      if (me && me.role === 'ADMIN') return true;
      if (groupInfo?.created_by && groupInfo.created_by === currentUserId) return true;
      return false;
    } catch {
      return false;
    }
  };

  // Filter members based on search term
  const filteredMembers = groupMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = member.first_name || '';
    const lastName = member.last_name || '';
    const name = member.name || '';
    const email = member.email || '';
    
    return firstName.toLowerCase().includes(searchLower) ||
           lastName.toLowerCase().includes(searchLower) ||
           name.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower);
  });

  // Get role badge color and text
  const getRoleBadge = (member) => {
    if (member.role === "ADMIN") {
      return { color: "bg-red-100 text-red-800 border-red-200", text: "Admin", icon: <Shield className="w-3 h-3" /> };
    } else if (member.role === "INSTRUCTOR") {
      return { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Instructor", icon: <GraduationCap className="w-3 h-3" /> };
    } else if (member.role === "LEARNER") {
      return { color: "bg-green-100 text-green-800 border-green-200", text: "Learner", icon: <User className="w-3 h-3" /> };
    } else {
      return { color: "bg-gray-100 text-gray-800 border-gray-200", text: member.role || "Member", icon: <User className="w-3 h-3" /> };
    }
  };

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Recently joined";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return `Joined ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return `Joined ${date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}`;
      }
    } catch {
      return "Recently joined";
    }
  };

  // Helper functions for extracting member data from nested user object
  const getMemberDisplayName = (member) => {
    if (member.user?.first_name && member.user?.last_name) {
      return `${member.user.first_name} ${member.user.last_name}`;
    } else if (member.user?.first_name) {
      return member.user.first_name;
    } else if (member.user?.name) {
      return member.user.name;
    } else {
      return "Unknown Member";
    }
  };

  const getMemberEmail = (member) => {
    return member.user?.email || 'No email provided';
  };

  const getMemberAvatar = (member) => {
    if (member.user?.image) {
      return member.user.image;
    }
    // Generate initials from name
    const name = getMemberDisplayName(member);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return initials;
  };

  // Calculate role statistics
  const roleStats = {
    admin: groupMembers.filter(m => m.role === "ADMIN").length,
    instructor: groupMembers.filter(m => m.role === "INSTRUCTOR").length,
    learner: groupMembers.filter(m => m.role === "LEARNER").length,
    other: groupMembers.filter(m => !["ADMIN", "INSTRUCTOR", "LEARNER"].includes(m.role)).length
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-lg border-0 bg-white h-[700px] flex flex-col">

        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Single Group Information Card - NO DUPLICATES */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getGroupName()}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {getMemberCount()} participants
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchGroupMembers()}
                    disabled={loadingMembers}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    {loadingMembers ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-sm">View members</span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          <ChatMessagesList 
            messages={messages} 
            currentUserId={currentUserId}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            isAdmin={isCurrentUserAdmin()}
          />

          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            onSendVoiceMessage={handleSendVoiceMessage}
            onFileSelect={handleFileSelect}
            showVoiceRecorder={showVoiceRecorder}
            setShowVoiceRecorder={setShowVoiceRecorder}
          />
        </CardContent>
      </Card>

      {/* Enhanced Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{getGroupName()}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getMemberCount()} member{getMemberCount() !== 1 ? 's' : ''} • {roleStats.admin} admin{roleStats.admin !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMembers(false);
                  setSearchTerm("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search and Stats */}
            <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">{roleStats.admin} Admin</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700">{roleStats.instructor} Instructor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">{roleStats.learner} Learner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {searchTerm ? 'No members found' : 'No members in this group yet'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Members will appear here once they join'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMembers.map((member, index) => {
                    const roleBadge = getRoleBadge(member);
                    const memberName = getMemberDisplayName(member);
                    const memberEmail = getMemberEmail(member);
                    const memberAvatar = getMemberAvatar(member);
                    
                    return (
                      <div key={member.id || index} className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {member.user?.image ? (
                              <img 
                                src={member.user.image} 
                                alt={memberName} 
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span>{memberAvatar}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{memberName}</h4>
                            <Badge 
                              variant="outline" 
                              className={`${roleBadge.color} flex items-center gap-1 py-0.5 text-xs`}
                            >
                              {roleBadge.icon}
                              {roleBadge.text}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">{memberEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatJoinDate(member.joined_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button 
                onClick={() => {
                  setShowMembers(false);
                  setSearchTerm("");
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
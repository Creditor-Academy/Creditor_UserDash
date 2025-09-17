import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { professionalAvatars } from "@/lib/avatar-utils";
import getSocket, { reconnectSocket } from "@/services/socketClient";

import { ChatMessagesList } from "@/components/group/ChatMessagesList";
import { ChatMessage } from "@/components/group/ChatMessage";
import { ChatInput } from "@/components/group/ChatInput";
import { Users, X, Loader2, Search, Shield, GraduationCap, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getGroupById, getGroupMembers, getGroupMessages, sendGroupMessage, deleteGroupMessage, editGroupMessage, createGroupPoll, voteGroupPoll, getGroupPoll, pinGroupMessage, pinGroupPoll, getPinnedPolls } from "@/services/groupService";
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
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const seenMessageIdsRef = React.useRef(new Set());
  const pendingImageRef = React.useRef(null);
  const joinedRef = React.useRef(false);

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
    
    // Wait for socket to be connected before joining
    const joinGroupWhenReady = () => {
      if (socket.connected && !joinedRef.current) {
        console.log('[socket][emit] joinGroup', { groupId, userId: uid });
        socket.emit('joinGroup', { groupId, userId: uid });
        joinedRef.current = true;
      }
    };

    // Initial join attempt
    joinGroupWhenReady();

    // Re-join on reconnect to handle network hiccups
    const onConnect = () => {
      console.log('[socket] connected. ensuring joined', { groupId, userId: uid });
      if (!joinedRef.current) {
        socket.emit('joinGroup', { groupId, userId: uid });
        joinedRef.current = true;
      }
    };
    socket.on('connect', onConnect);

    const sameGroup = (gid) => String(gid) === String(groupId);
    
    // Handle new group messages
    const onNewMessage = (payload) => {
      console.log('[socket][on] newGroupMessage', payload);
      // Backend sends message with group_id field
      const inThisGroup = sameGroup(payload?.group_id);
      if (inThisGroup) {
        setMessages(prev => {
          // If message already exists by id, skip
          if (payload?.id && prev.some(m => m.id === payload.id)) return prev;

          const isImage = (payload?.mime_type || payload?.mimeType || '').startsWith('image/');
          const isPoll = (payload?.type || '').toLowerCase() === 'poll' || Boolean(payload?.poll_question || payload?.poll);
          const derivedImageUrl = (payload?.media_url || payload?.image_url || payload?.imageUrl || (isImage ? payload?.content : undefined));
          
          // Check if this is a duplicate of a pending image we just sent
          if (isImage && pendingImageRef.current && 
              payload.sender_id === currentUserId && 
              Date.now() - pendingImageRef.current.timestamp < 5000) {
            console.log('[socket] Ignoring duplicate image message from socket');
            return prev;
          }
          
          // Build votes map if provided
          const votesMap = (() => {
            try {
              const options = payload?.poll_options || [];
              const v = {};
              options.forEach((o, idx) => { v[idx] = (o?.votes || []).map(x => x.user_id); });
              return v;
            } catch { return {}; }
          })();

          const hasVotesMap = Object.values(votesMap || {}).some(arr => (arr || []).length > 0);
          const normalized = {
            id: payload.id,
            senderId: payload.sender_id,
            senderName: String(payload.sender_id) === String(currentUserId)
              ? 'You'
              : (payload.sender?.first_name || 'Member'),
            senderAvatar: payload.sender?.image || '',
            content: (isImage || isPoll) ? '' : payload.content,
            imageUrl: derivedImageUrl,
            timestamp: payload.timeStamp ? new Date(payload.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: isPoll ? 'poll' : ((payload.type || 'TEXT').toLowerCase() === 'voice' ? 'voice' : 
                  (isImage ? 'image' : (payload.mime_type ? 'file' : 'text'))),
            poll: isPoll ? (payload.poll || {
              question: payload.poll_question || payload.question,
              options: (payload.poll_options || payload.options || []).map(o => (o.option_text || o.text || o)),
              optionIds: (payload.poll_options || []).map(o => (o.id || o.option_id || null)),
              allowMultiple: Boolean(payload.poll_allow_multiple || payload.allowMultiple),
              votes: hasVotesMap ? votesMap : (payload.votes || {}),
              closesAt: payload.poll_expires_at || payload.closesAt,
              closedAt: payload.closedAt,
            }) : undefined,
            isPinned: Boolean(payload.is_pinned || payload.isPinned),
          };

          // Try to replace a matching optimistic message
          // For images, match by sender and imageUrl; for text, match by sender and content
          const idx = prev.findIndex(m => {
            if (!String(m.id).startsWith('tmp-') || m.senderId !== payload.sender_id) return false;
            
            if (isImage) {
              // For images, match by imageUrl or if both are images
              return m.type === 'image' && (m.imageUrl === derivedImageUrl || m.imageUrl);
            } else {
              // For text messages, match by content
              return m.content === payload.content;
            }
          });
          
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

    // Backend-specific poll events
    const onPollCreatedSocket = (payload) => {
      try {
        const poll = payload?.poll || payload?.data || payload;
        if (!poll || String(poll.group_id) !== String(groupId)) return;
        setMessages(prev => {
          // If a message with the real id already exists, do nothing
          if (prev.some(m => m.id === poll.id)) return prev;

          const normalized = {
            id: poll.id,
            senderId: poll.sender_id,
            senderName: String(poll.sender_id) === String(currentUserId)
              ? 'You'
              : (poll.sender?.first_name || 'Member'),
            senderAvatar: poll.sender?.image || '',
            content: '',
            imageUrl: undefined,
            timestamp: poll.timeStamp ? new Date(poll.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: 'poll',
            poll: {
              question: poll.poll_question || poll.content || '',
              options: (poll.poll_options || []).map(o => o.option_text),
              optionIds: (poll.poll_options || []).map(o => o.id),
              allowMultiple: Boolean(poll.poll_allow_multiple),
              votes: (() => {
                const v = {};
                (poll.poll_options || []).forEach((o, idx) => {
                  v[idx] = (o.votes || []).map(x => x.user_id);
                });
                return v;
              })(),
              closesAt: poll.poll_expires_at || null,
              closedAt: null,
            },
            isPinned: Boolean(poll.is_pinned),
          };
          // Try to replace a matching optimistic temp poll from the same sender
          const tmpIdx = prev.findIndex(m => String(m.id).startsWith('tmp-poll-') && m.type === 'poll' && m.senderId === poll.sender_id);
          if (tmpIdx !== -1) {
            const clone = [...prev];
            clone[tmpIdx] = normalized;
            return clone;
          }
          return [...prev, normalized];
        });
      } catch {}
    };
    socket.on('pollCreated', onPollCreatedSocket);

    const onPollUpdatedSocket = (evt) => {
      try {
        const pollId = evt?.pollId || evt?.id;
        if (!pollId) return;
        setMessages(prev => prev.map(m => {
          if (m.id !== pollId) return m;
          const options = (evt?.updated?.poll_options || []).map(o => o.option_text);
          const optionIds = (evt?.updated?.poll_options || []).map(o => o.id);
          const votes = {};
          (evt?.updated?.poll_options || []).forEach((o, idx) => { votes[idx] = (o.votes || []).map(v => v.user_id); });
          return {
            ...m,
            poll: {
              ...m.poll,
              options: options.length ? options : m.poll?.options,
              optionIds: optionIds.length ? optionIds : m.poll?.optionIds,
              votes: Object.keys(votes).length ? votes : m.poll?.votes,
            }
          };
        }));
      } catch {}
    };
    socket.on('pollUpdated', onPollUpdatedSocket);

    const onPollUpdated = (evt) => {
      if (!sameGroup(evt?.group_id)) return;
      setMessages(prev => prev.map(m => {
        if (m.id !== (evt.message_id || evt.id)) return m;
        return {
          ...m,
          poll: {
            ...(m.poll || {}),
            ...(evt.poll || {}),
            votes: evt.votes || evt.poll?.votes || m.poll?.votes || {},
            closedAt: evt.closedAt || evt.poll?.closedAt || m.poll?.closedAt,
            closesAt: evt.closesAt || evt.poll?.closesAt || m.poll?.closesAt,
          }
        };
      }));
    };
    socket.on('groupPollUpdated', onPollUpdated);

    const onMessagePinned = (evt) => {
      if (!sameGroup(evt?.group_id)) return;
      setMessages(prev => prev.map(m => m.id === (evt.message_id || evt.id) ? { ...m, isPinned: Boolean(evt.isPinned ?? evt.pinned ?? true) } : m));
    };
    socket.on('groupMessagePinned', onMessagePinned);

    const onPollPinned = (evt) => {
      try {
        const pollId = evt?.pollId || evt?.id;
        if (!pollId) return;
        setMessages(prev => prev.map(m => {
          if (m.id !== pollId) return m;
          return {
            ...m,
            isPinned: Boolean(evt.isPinned ?? evt.pinned ?? true),
            poll: {
              ...m.poll,
              isPinned: Boolean(evt.isPinned ?? evt.pinned ?? true)
            }
          };
        }));
        // Sync local persisted set with server event
        const set = getLocalPinnedSet();
        const isPinnedNow = Boolean(evt.isPinned ?? evt.pinned ?? true);
        if (isPinnedNow) set.add(pollId); else set.delete(pollId);
        saveLocalPinnedSet(set);
      } catch {}
    };
    socket.on('pollPinned', onPollPinned);

    // Listen for user join/leave notifications
    const onUserJoined = (data) => {
      console.log('[socket][on] userJoinedGroup', data);
      if (sameGroup(data.groupId)) {
        // Append a lightweight system message in the chat
        const systemText = (data?.message || 'A member joined the chat').replace('group', 'chat');
        setMessages(prev => ([
          ...prev,
          {
            id: `sys-join-${Date.now()}`,
            senderId: 0,
            senderName: 'System',
            senderAvatar: '',
            content: systemText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            isSystem: true,
          }
        ]));

        // Keep member count fresh without opening modal
        fetchGroupMembers({ openModal: false, silent: true });
      }
    };
    const onUserLeft = (data) => {
      console.log('[socket][on] userLeftGroup', data);
      if (sameGroup(data.groupId)) {
        const systemText = (data?.message || 'A member left the chat').replace('group', 'chat');
        setMessages(prev => ([
          ...prev,
          {
            id: `sys-leave-${Date.now()}`,
            senderId: 0,
            senderName: 'System',
            senderAvatar: '',
            content: systemText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            isSystem: true,
          }
        ]));

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
      // Don't show any socket error toasts since messages work via REST API
      // Just log for debugging
    };
    socket.on('error', onServerError);

    // Real-time edits/deletes
    const onMessageEdited = (payload) => {
      try {
        const gid = String(payload?.groupId ?? payload?.group_id ?? payload?.group?.id ?? '');
        if (gid !== String(groupId)) return;
        const messageId = payload?.messageId ?? payload?.id ?? payload?.message?.id;
        const newContent = payload?.content ?? payload?.message?.content;
        if (!messageId) return;
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
      } catch {}
    };
    const onMessageDeleted = (payload) => {
      if (!payload || String(payload.groupId) !== String(groupId)) return;
      setMessages(prev => prev.filter(m => m.id !== payload.messageId));
    };
    socket.on('groupMessageEdited', onMessageEdited);
    socket.on('groupMessageUpdated', onMessageEdited);
    socket.on('messageEdited', onMessageEdited);
    socket.on('groupMessageDeleted', onMessageDeleted);

    // Connection diagnostics to help identify realtime issues
    const onConnectError = (err) => {
      try {
        console.warn('[socket] connect_error', err?.message || err);
        // Only show toast for authentication errors, and only once
        if (err?.message?.includes('Authentication error') && !socket._authErrorShown) {
          socket._authErrorShown = true; // Prevent multiple toasts
          toast({ 
            title: 'Real-time features unavailable', 
            description: 'Socket connection failed. Messages will still work normally.', 
            variant: 'default' 
          });
        }
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
      if (joinedRef.current) {
        socket.emit('leaveGroup', { groupId, userId: uid });
        joinedRef.current = false;
      }
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
      socket.off('groupMessageEdited', onMessageEdited);
      socket.off('groupMessageUpdated', onMessageEdited);
      socket.off('messageEdited', onMessageEdited);
      socket.off('groupMessageDeleted', onMessageDeleted);
      socket.off('pollCreated', onPollCreatedSocket);
      socket.off('pollUpdated', onPollUpdatedSocket);
      socket.off('groupPollUpdated', onPollUpdated);
      socket.off('groupMessagePinned', onMessagePinned);
      socket.off('pollPinned', onPollPinned);
    };
  }, [groupId, currentUserId]);

  const loadMessages = async () => {
    try {
      const res = await getGroupMessages(groupId, 1, 100);
      const list = res?.data?.messages || res?.messages || [];
      const normalized = list.map(m => {
        const isImage = (m?.mime_type || '').startsWith('image/');
        const isPoll = (m?.type || '').toLowerCase() === 'poll' || Boolean(m?.poll_question || m?.poll);
        return ({
          id: m.id,
          senderId: m.sender_id || m.senderId,
          senderName: String(m.sender_id || m.senderId) === String(currentUserId)
            ? 'You'
            : (m.sender?.first_name || m.sender?.name || 'Member'),
          senderAvatar: m.sender?.image || '',
          content: (isImage || isPoll) ? '' : m.content,
          imageUrl: (m.media_url || m.image_url || m.imageUrl || (isImage ? m.content : undefined)),
          timestamp: m.timeStamp ? new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          type: isPoll ? 'poll' : ((m.type || 'TEXT').toLowerCase() === 'voice' ? 'voice' : 
                (isImage ? 'image' : (m.mime_type ? 'file' : 'text'))),
          poll: isPoll ? (m.poll || {
            question: m.poll_question || m.question || m.content,
            options: (m.poll_options || m.options || []).map(o => (o.option_text || o.text || o)),
            optionIds: (m.poll_options || []).map(o => (o.id || o.option_id || null)),
            allowMultiple: Boolean(m.poll_allow_multiple || m.allowMultiple),
            votes: m.votes || {},
            closesAt: m.poll_expires_at || m.closesAt,
            closedAt: m.closedAt,
          }) : undefined,
          isPinned: Boolean(m.is_pinned || m.isPinned),
        });
      });
      setMessages(normalized);

      // Background refresh for polls missing optionIds (receiver side)
      const pollsNeedingDetails = normalized.filter(x => x.type === 'poll' && (!x.poll?.optionIds || x.poll.optionIds.length === 0));
      for (const p of pollsNeedingDetails) {
        try {
          const res = await getGroupPoll(groupId, p.id);
          const data = res?.data || res;
          if (data?.id) {
            setMessages(prev => prev.map(m => {
              if (m.id !== p.id) return m;
              const options = (data.poll_options || []).map(o => o.option_text);
              const optionIds = (data.poll_options || []).map(o => o.id);
              const votes = {};
              (data.poll_options || []).forEach((o, idx) => { votes[idx] = (o.votes || []).map(v => v.user_id); });
              return { ...m, poll: { ...m.poll, options, optionIds, votes, allowMultiple: Boolean(data.poll_allow_multiple), closesAt: data.poll_expires_at || m.poll?.closesAt } };
            }));
          }
        } catch {}
      }
      // Merge pinned polls from server so pinned state persists across reloads
      try {
        const pinnedRes = await getPinnedPolls(groupId);
        const pinned = pinnedRes?.data || pinnedRes || [];
        const pinnedIds = new Set((pinned || []).map(p => p.id || p.message_id));
        // Merge local pending pins
        const localPinned = getLocalPinnedSet();
        localPinned.forEach(id => pinnedIds.add(id));
        if (pinnedIds.size > 0) {
          setMessages(prev => prev.map(m => pinnedIds.has(m.id) ? { ...m, isPinned: true, poll: { ...(m.poll || {}), isPinned: true } } : m));
          // For any pinned poll not in the list, append a normalized version
          const missing = (pinned || []).filter(p => !normalized.some(m => m.id === p.id));
          if (missing.length) {
            setMessages(prev => ([
              ...prev,
              ...missing.map(p => ({
                id: p.id,
                senderId: p.sender_id,
                senderName: (p.sender?.first_name || 'Member'),
                senderAvatar: p.sender?.image || '',
                content: '',
                imageUrl: undefined,
                timestamp: p.timeStamp ? new Date(p.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                type: 'poll',
                poll: {
                  question: p.poll_question || p.content || '',
                  options: (p.poll_options || []).map(o => o.option_text),
                  optionIds: (p.poll_options || []).map(o => o.id),
                  allowMultiple: Boolean(p.poll_allow_multiple),
                  votes: (() => { const v = {}; (p.poll_options || []).forEach((o, idx) => { v[idx] = (o.votes || []).map(x => x.user_id); }); return v; })(),
                  closesAt: p.poll_expires_at || null,
                  closedAt: null,
                  isPinned: true,
                },
                isPinned: true,
              }))
            ]));
          }
        }
      } catch {}
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
    // Check if we have an image to send
    if (selectedImage) {
      await handleSendImage(selectedImage);
      return;
    }
    
    // Handle text message
    if (!newMessage.trim()) return;
    const toSend = newMessage;
    setNewMessage("");
    setIsSending(true);

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "",
      content: toSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    
    try {
      const socket = getSocket();
      
      // Only emit via socket if connected and authenticated, otherwise rely on REST API
      if (socket.connected && !socket._authErrorShown) {
        const payload = {
          groupId, 
          userId: currentUserId, 
          content: toSend,
          type: 'TEXT'
        };
        console.log('[socket][emit] sendGroupMessage', payload);
        socket.emit('sendGroupMessage', payload);
      } else {
        console.warn('[socket] not connected or auth failed, using REST API only');
      }

      // Always call REST API as fallback/primary method
      const res = await sendGroupMessage(groupId, { content: toSend, type: 'TEXT' });
      const m = res?.data || res;
      if (m?.id) {
        if (seenMessageIdsRef.current.has(m.id)) {
          setMessages(prev => prev.filter(x => x.id !== tempId));
        } else {
          seenMessageIdsRef.current.add(m.id);
          setMessages(prev => prev.map(x => x.id === tempId ? {
            id: m.id,
            senderId: m.sender_id || currentUserId,
            senderName: m.sender?.first_name || 'You',
            senderAvatar: m.sender?.image || '',
            content: m.content,
            timestamp: m.timeStamp ? new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : optimistic.timestamp,
            type: (m.type || 'TEXT').toLowerCase() === 'voice' ? 'voice' : (m.mime_type ? 'file' : 'text'),
          } : x));
        }
      }
    } catch (e) {
      console.error('Error sending message:', e);
      // rollback optimistic update
      setMessages(prev => prev.filter(x => x.id !== tempId));
      // No toast - just log the error
    } finally {
      setIsSending(false);
    }
  };


  // Edit/Delete message handlers
  const handleEditMessage = async (messageId, newContent) => {
    const snapshot = messages;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
    try {
      await editGroupMessage(groupId, messageId, { content: newContent });
      // Notify others in real-time if backend relays socket events
      try {
        const socket = getSocket();
        socket.emit('editGroupMessage', { groupId, messageId, content: newContent });
      } catch {}
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
      try {
        const socket = getSocket();
        socket.emit('deleteGroupMessage', { groupId, messageId });
      } catch {}
    } catch (e) {
      // restore on failure
      setMessages(snapshot);
    }
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    // Just store the selected image, don't send it yet
    setSelectedImage(file);
  };

  const handleSendImage = async (file) => {
    if (!file) return;
    
    setIsSendingImage(true);
    const tempId = `tmp-${Date.now()}`;
    const imageUrl = URL.createObjectURL(file);
    
    // Track this pending image to prevent duplicates
    pendingImageRef.current = {
      tempId,
      imageUrl,
      timestamp: Date.now()
    };
    
    const optimistic = {
      id: tempId,
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "",
      imageUrl: imageUrl,
      content: '', // Don't show URL in content
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'image',
      pending: true,
    };
    
    setMessages(prev => [...prev, optimistic]);
    setSelectedImage(null); // Clear selected image

    try {
      // Create FormData for file upload (backend expects `req.file` named 'media')
      const formData = new FormData();
      formData.append('media', file);
      formData.append('type', 'IMAGE');
      
      // Send image via API
      const res = await sendGroupMessage(groupId, formData, true); // true for multipart
      const m = res?.data || res;
      
      if (m?.id) {
        if (seenMessageIdsRef.current.has(m.id)) {
          setMessages(prev => prev.filter(x => x.id !== tempId));
        } else {
          seenMessageIdsRef.current.add(m.id);
          setMessages(prev => prev.map(x => x.id === tempId ? {
            id: m.id,
            senderId: m.sender_id || currentUserId,
            senderName: m.sender?.first_name || 'You',
            senderAvatar: m.sender?.image || '',
            imageUrl: m.media_url || m.image_url || m.imageUrl || imageUrl,
            content: '', // Don't show URL in content
            timestamp: m.timeStamp ? new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : optimistic.timestamp,
            type: 'image',
          } : x));
        }
      }
    } catch (e) {
      console.error('Failed to send image:', e);
      setMessages(prev => prev.filter(x => x.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingImage(false);
      // Clear pending image after a short delay to allow socket event to be processed
      setTimeout(() => {
        pendingImageRef.current = null;
      }, 1000);
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

  const handleCreatePoll = async (poll) => {
    try {
      const tempId = `tmp-poll-${Date.now()}`;
      const optimistic = {
        id: tempId,
        senderId: currentUserId,
        senderName: "You",
        senderAvatar: "",
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'poll',
        poll: { ...poll, votes: {} },
      };
      setMessages(prev => [...prev, optimistic]);

      const res = await createGroupPoll(groupId, poll);
      const m = res?.data || res;
      if (m?.id) {
        setMessages(prev => {
          // If socket already added the poll with the real id, just drop the temp
          if (prev.some(x => x.id === m.id)) {
            return prev.filter(x => x.id === m.id || !String(x.id).startsWith('tmp-poll-'));
          }
          return prev.map(x => x.id === tempId ? {
          id: m.id,
          senderId: m.sender_id || currentUserId,
          senderName: m.sender?.first_name || 'You',
          senderAvatar: m.sender?.image || '',
          content: '',
          timestamp: m.timeStamp ? new Date(m.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : optimistic.timestamp,
          type: 'poll',
          poll: {
            question: m.poll_question || m.content || '',
            options: (m.poll_options || []).map(o => (o.option_text || o.text || o)),
            optionIds: (m.poll_options || []).map(o => (o.id || o.option_id || null)),
            allowMultiple: Boolean(m.poll_allow_multiple),
            votes: {},
            closesAt: m.poll_expires_at || null,
            closedAt: null,
          },
          isPinned: Boolean(m.is_pinned || m.isPinned),
        } : x);
        });

        // Hint backend to broadcast in real-time (mirrors text flow)
        try {
          const socket = getSocket();
          if (socket?.connected && !socket._authErrorShown) {
            socket.emit('sendGroupMessage', { groupId, userId: currentUserId, type: 'POLL', messageId: m.id });
          }
        } catch {}
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'Failed to create poll';
      console.error('Failed to create poll:', status, msg);
      toast({ title: `Create poll failed${status ? ` (${status})` : ''}`, description: msg, variant: 'destructive' });
      setMessages(prev => prev.filter(m => !String(m.id).startsWith('tmp-poll-')));
    }
  };

  const handleVotePoll = async (messageId, optionIndex, multiple) => {
    try {
      const optionId = mOptionId(messageId, optionIndex);
      if (!optionId) {
        toast({ title: 'Please wait', description: 'Poll is still loading. Try again in a moment.', variant: 'default' });
        return;
      }
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m;
        const votes = { ...(m.poll?.votes || {}) };
        if (multiple) {
          const set = new Set(votes[optionIndex] || []);
          if (set.has(currentUserId)) set.delete(currentUserId); else set.add(currentUserId);
          votes[optionIndex] = Array.from(set);
          return { ...m, poll: { ...m.poll, votes } };
        } else {
          const cleared = {};
          Object.keys(votes).forEach(k => { cleared[k] = (votes[k] || []).filter(uid => String(uid) !== String(currentUserId)); });
          cleared[optionIndex] = [ ...(cleared[optionIndex] || []), currentUserId ];
          return { ...m, poll: { ...m.poll, votes: cleared } };
        }
      }));
      // Map option index to backend option_id
      const pollId = messageId;
      const voteRes = await voteGroupPoll(groupId, pollId, { messageId, optionId });
      // Prefer immediate merge from vote API response (it returns poll_options with votes)
      try {
        const data = voteRes?.data || voteRes;
        if (data?.id) {
          setMessages(prev => prev.map(m => {
            if (m.id !== messageId) return m;
            const options = (data.poll_options || []).map(o => o.option_text);
            const optionIds = (data.poll_options || []).map(o => o.id);
            const votes = {};
            (data.poll_options || []).forEach((o, idx) => { votes[idx] = (o.votes || []).map(v => v.user_id); });
            if ((data.poll_votes || []).length && optionIds.length) {
              const byOptionId = {};
              optionIds.forEach((id, idx) => { byOptionId[id] = idx; });
              (data.poll_votes || []).forEach(v => {
                const idx = byOptionId[v.option_id];
                if (idx !== undefined) {
                  votes[idx] = votes[idx] || [];
                  votes[idx] = Array.from(new Set([...(votes[idx] || []), v.user_id]));
                }
              });
            }
            const hasVotes = Object.values(votes).some(arr => (arr || []).length > 0);
            return {
              ...m,
              poll: {
                ...m.poll,
                options: options.length ? options : (m.poll?.options || []),
                optionIds: optionIds.length ? optionIds : (m.poll?.optionIds || []),
                allowMultiple: data.poll_allow_multiple ?? m.poll?.allowMultiple,
                closesAt: data.poll_expires_at || m.poll?.closesAt || null,
                votes: hasVotes ? votes : (m.poll?.votes || {}),
              }
            };
          }));
        }
      } catch {}
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || 'Vote failed';
      console.error('Failed to vote:', status, msg);
      toast({ title: `Vote failed${status ? ` (${status})` : ''}`, description: msg, variant: 'destructive' });
    }
  };

  const mOptionId = (messageId, idx) => {
    try {
      const msg = messages.find(x => x.id === messageId);
      return msg?.poll?.optionIds?.[idx] || null;
    } catch { return null; }
  };

  const handlePinToggle = async (messageId, pinned) => {
    try {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: pinned } : m));
      await pinGroupMessage(groupId, messageId, pinned);
      
      // Emit socket event to notify other users in real-time
      try {
        const socket = getSocket();
        if (socket?.connected && !socket._authErrorShown) {
          socket.emit('pinGroupMessage', { groupId, messageId, pinned });
        }
      } catch (socketError) {
        console.warn('Socket emit failed for pin toggle:', socketError);
      }
    } catch (e) {
      console.error('Failed to pin message:', e);
      toast({ title: 'Error', description: 'Pin update failed', variant: 'destructive' });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !pinned } : m));
    }
  };

  const handlePollPinToggle = async (pollId, pinned) => {
    try {
      console.log('handlePollPinToggle called:', { pollId, pinned, groupId });
      
      setMessages(prev => prev.map(m => {
        if (m.id !== pollId) return m;
        return {
          ...m,
          isPinned: pinned,
          poll: {
            ...m.poll,
            isPinned: pinned
          }
        };
      }));
      // Persist locally so it stays pinned until explicit unpin
      const set = getLocalPinnedSet();
      if (pinned) set.add(pollId); else set.delete(pollId);
      saveLocalPinnedSet(set);
      
      await pinGroupPoll(groupId, pollId);
      
      // Emit socket event to notify other users in real-time
      try {
        const socket = getSocket();
        if (socket?.connected && !socket._authErrorShown) {
          socket.emit('pinPoll', { groupId, pollId, pinned });
        }
      } catch (socketError) {
        console.warn('Socket emit failed for poll pin toggle:', socketError);
      }
    } catch (e) {
      console.error('Failed to pin poll:', e);
      toast({ 
        title: 'Error', 
        description: `Poll pin update failed: ${e.response?.data?.message || e.message}`, 
        variant: 'destructive' 
      });
      // Keep local pin state; do not roll back UI to avoid auto-unpin
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

  // Local pinned polls persistence (to keep pin until explicit unpin)
  const localPinnedKey = React.useMemo(() => `group:${groupId}:localPinnedPolls`, [groupId]);
  const getLocalPinnedSet = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(localPinnedKey);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch { return new Set(); }
  }, [localPinnedKey]);
  const saveLocalPinnedSet = React.useCallback((set) => {
    try {
      localStorage.setItem(localPinnedKey, JSON.stringify(Array.from(set || [])));
    } catch {}
  }, [localPinnedKey]);

  // Derive pinned polls and remaining messages for display
  const pinnedPolls = React.useMemo(() => (messages || []).filter(m => m.type === 'poll' && m.isPinned), [messages]);
  const nonPinnedMessages = React.useMemo(() => (messages || []).filter(m => !(m.type === 'poll' && m.isPinned)), [messages]);

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

          {/* Pinned polls section */}
          {pinnedPolls.length > 0 && (
            <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-3">
              <div className="text-xs font-medium text-indigo-700">Pinned polls</div>
              <div className="mt-2 space-y-3">
                {pinnedPolls.map(pm => (
                  <ChatMessage
                    key={`pinned-${pm.id}`}
                    message={pm}
                    currentUserId={currentUserId}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onVotePoll={handleVotePoll}
                    onPollPinToggle={handlePollPinToggle}
                    isAdmin={isCurrentUserAdmin()}
                    groupId={groupId}
                  />
                ))}
              </div>
            </div>
          )}

          <ChatMessagesList 
            messages={nonPinnedMessages} 
            currentUserId={currentUserId}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onVotePoll={handleVotePoll}
            onPinToggle={handlePinToggle}
            onPollPinToggle={handlePollPinToggle}
            isAdmin={isCurrentUserAdmin()}
            groupId={groupId}
          />

          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
            onFileSelect={handleFileSelect}
            onImageSelect={handleImageSelect}
            onCreatePoll={handleCreatePoll}
            selectedImage={selectedImage}
            isSending={isSending || isSendingImage}
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
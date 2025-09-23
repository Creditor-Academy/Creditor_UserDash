import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Send, Smile, Paperclip, Mic, Plus, Trash2, MoreVertical, Clock, Check, CheckCheck, Loader2, ExternalLink, Globe, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
// Voice recording components - commented out
// import { VoiceRecorder } from "@/components/messages/VoiceRecorder";
// import { VoiceMessage } from "@/components/messages/VoiceMessage";
import EmojiPicker from "emoji-picker-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchAllUsers } from "@/services/userService";
import { getAllConversations, loadPreviousConversation, deleteConversationMessage, deleteConversation } from "@/services/messageService";
import getSocket from "@/services/socketClient";
import api from "@/services/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Will be loaded from backend
const initialAllUsers = [];

function getHostname(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

function extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  const regex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const matches = text.match(regex) || [];
  return matches.map(u => (u.startsWith('http') ? u : `https://${u}`));
}

function LinkCard({ url }) {
  const host = getHostname(url);
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block mt-2">
      <div className="rounded-2xl border border-muted/30 shadow-sm bg-white text-foreground overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`} alt="" className="h-4 w-4" />
            <span className="font-semibold text-sm truncate max-w-[220px]">{host || url}</span>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-t border-muted/20">
          <Globe className="h-4 w-4" />
          <span className="truncate">{host}</span>
        </div>
      </div>
    </a>
  );
}

function renderRichText(text, isOnDark = false) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <span>
      {parts.map((part, idx) => {
        if (urlRegex.test(part)) {
          const host = getHostname(part);
          return (
            <a key={idx} href={part} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 ${isOnDark ? 'text-white underline' : 'text-primary hover:underline'}`}>
              {host && (
                <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`} alt="" className={`h-4 w-4 ${isOnDark ? 'brightness-200' : ''}`} />
              )}
              {part}
            </a>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

function Messages() {
  // conversations shown in the left list (starts empty like Google Chat)
  const [friends, setFriends] = useState([]);
  // directory of all users to start a chat with (shown in + dialog)
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [convosLoaded, setConvosLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Voice recording state - commented out
  // const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [newChatUsers, setNewChatUsers] = useState([]);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [startingUserId, setStartingUserId] = useState(null);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState({ open: false, url: null });
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [deleteConversationId, setDeleteConversationId] = useState(null);
  const [showDeleteConversationDialog, setShowDeleteConversationDialog] = useState(false);
  const { toast } = useToast();

  const formatChatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isSameDay = d.toDateString() === now.toDateString();
    if (isSameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Reset local UI state when arriving at Messages route to avoid showing stale names
  useEffect(() => {
    if (location.pathname.endsWith("/messages")) {
      setSelectedFriend(null);
      setFriends([]);
      setAllUsers([]);
      setMessages([]);
      setRoomId(null);
      setConvosLoaded(false);
    }
  }, [location.pathname]);

  // Cleanup: Leave room when component unmounts or when leaving messages page
  useEffect(() => {
    return () => {
      if (roomId) {
        try {
          const socket = getSocket();
          socket.emit('leaveRoom', roomId);
        } catch (error) {
          console.warn('Failed to leave room on cleanup:', error);
        }
      }
    };
  }, [roomId]);

  // Load conversations for current user on entry; also load all users for starting new chat
  // Ensure socket connects when Messages section is opened
  useEffect(() => {
    const socket = getSocket();
    // Optional: log to verify connection lifecycle specific to Messages
    const onConnect = () => {
      console.log('[Messages] socket connected');
    };
    const onDisconnect = (reason) => console.log('[Messages] socket disconnected', reason);
    const onRoomIdForSender = ({ conversationid, roomId: serverRoomId, to }) => {
      // Clear in-flight blocker once backend responds
      setStartingUserId(null);
      setRoomId(serverRoomId);
      setConversationId(conversationid);
      setSelectedFriend(String(conversationid));
      // Clear old chat and show loading while fetching history
      setMessages([]);
      setChatLoading(true);
      console.log('room id at sender side', serverRoomId);
      // join room immediately
      try {
        // const s = getSocket();
        // s.emit('joinRoom', serverRoomId);
      } catch {}
      // After server creates/returns a room, refresh conversations from backend
      void (async () => {
        try {
          const convos = await getAllConversations();
          const normalizedFriends = (Array.isArray(convos) ? convos : []).map(c => ({
            id: String(c.id),
            name: c.title || 'User',
            avatar: c.image || '/placeholder.svg',
            lastMessage: c.lastMessage || '',
            lastMessageType: c.lastMessageType || null,
            room: c.room,
            conversationId: c.id,
            isRead: c.isRead,
            lastMessageFrom: c.lastMessageFrom,
            lastMessageAt: c.lastMessageAt,
          }));
          setFriends(normalizedFriends);
          setConvosLoaded(true);
        } catch {}
      })();
      // Load previous messages for this new conversation
      (async () => {
        try {
          const data = await loadPreviousConversation(conversationid);
          const currentUserId = localStorage.getItem('userId');
          const mapped = (data?.cov_messages || []).map(m => ({
            id: m.id,
            senderId: String(m.sender_id) === String(currentUserId) ? 0 : String(m.sender_id),
            senderImage: m?.sender?.image || null,
            text: m.type === 'IMAGE' ? null : m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: m.type === 'IMAGE' ? 'image' : 'text',
            file: m.type === 'IMAGE' ? m.content : null,
            status: String(m.sender_id) === String(currentUserId) ? 'sent' : 'delivered', // Default status for loaded messages
          }));
          setMessages(mapped);
          setChatLoading(false);
        } catch (e) {
          console.warn('Failed to load previous messages (new)', e);
          setChatLoading(false);
        }
      })();
    };

    const onReceiveMessage = ({ from, message, image, messageid, type, conversationid }) => {
      const currentUserId = localStorage.getItem('userId');
      const isSelf = String(from) === String(currentUserId);
      
      if (isSelf) {
        // This is our own message coming back from server - replace optimistic message
        setMessages(prev => {
          // Find the most recent optimistic message with 'sending' status
          const optimisticIndex = prev.findLastIndex(msg => 
            msg.senderId === 0 && msg.status === 'sending' && (
              (type === 'IMAGE' && msg.type === 'image') || (type !== 'IMAGE' && msg.text === message)
            )
          );
          
          if (optimisticIndex !== -1) {
            // Replace optimistic message with real one
            const updated = [...prev];
            updated[optimisticIndex] = {
              ...updated[optimisticIndex],
              id: messageid,
              status: 'sent', // Message sent successfully
              senderImage: image || null,
              type: type === 'IMAGE' ? 'image' : 'text',
              file: type === 'IMAGE' ? message : null,
              text: type === 'IMAGE' ? null : message,
            };
            return updated;
          } else {
            // Fallback: add as new message if optimistic message not found
            return [
              ...prev,
              {
                id: messageid,
                senderId: 0,
                text: type === 'IMAGE' ? null : message,
                senderImage: image || null,
                timestamp: new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                type: type === 'IMAGE' ? 'image' : 'text',
                file: type === 'IMAGE' ? message : null,
                status: 'sent',
              },
            ];
          }
        });
      } else {
        // Message from someone else - add as new message
        setMessages(prev => [
          ...prev,
          {
            id: messageid,
            senderId: String(from),
            text: type === 'IMAGE' ? null : message,
            senderImage: image || null,
            timestamp: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: type === 'IMAGE' ? 'image' : 'text',
            file: type === 'IMAGE' ? message : null,
            status: 'delivered', // Messages from others are considered delivered
          },
        ]);
      }

      // If the incoming message is from someone else and we're inside this conversation, mark it read
      try {
        if (!isSelf && conversationid && messageid) {
          const s = getSocket();
          setTimeout(()=>{
            s.emit('messageSeenByReceiver', { messageid, conversationid: conversationid });
          console.log("message seen by receiver", messageid, conversationid);
          }, 2000);

        }
      } catch {}
    };
    const onConversationUpdated = (updatePayload) => {
      console.log('Conversation updated:', updatePayload);
      setFriends(prev => {
        const existingIndex = prev.findIndex(f => f.id === updatePayload.id);
        const isOpen = String(updatePayload.id) === String(conversationId);

        const updatedFriend = {
          id: String(updatePayload.id),
          name: updatePayload.title || 'User',
          avatar: updatePayload.image || '/placeholder.svg',
          lastMessage: updatePayload.lastMessage || '',
          lastMessageType: updatePayload.lastMessageType || null,
          room: updatePayload.room,
          conversationId: updatePayload.id,
          // If conversation is open, force read; otherwise use server flag
          isRead: isOpen ? true : updatePayload.isRead,
          lastMessageFrom: updatePayload.lastMessageFrom,
          lastMessageAt: updatePayload.lastMessageAt,
        };
        
        if (existingIndex >= 0) {
          // Update existing conversation and move to top
          const updated = [...prev];
          updated[existingIndex] = updatedFriend;
          return [updatedFriend, ...updated.filter((_, i) => i !== existingIndex)];
        } else {
          // Add new conversation to top
          return [updatedFriend, ...prev];
        }
      });
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomidforsender', onRoomIdForSender);
    socket.on('receiveMessage', onReceiveMessage);
    const onMessagesRead = ({ conversationId: readConvId }) => {
      if (!readConvId) return;
      setFriends(prev => prev.map(f => (
        String(f.conversationId || f.id) === String(readConvId)
          ? { ...f, isRead: true } // This will remove bold styling since isRead is now true
          : f
      )));
    };
    socket.on('messagesRead', onMessagesRead);
    const onDeleteMessage = ({ messageid, conversation_id }) => {
      if (!messageid) return;
      // Only act if we're on the same conversation or if unknown treat as current
      if (!conversationId || String(conversationId) === String(conversation_id)) {
        setDeletingMessageId(messageid);
        setTimeout(() => {
          setMessages(prev => prev.filter(m => String(m.id) !== String(messageid)));
          setDeletingMessageId(null);
        }, 220);
      }
    };
    socket.on('deleteMessage', onDeleteMessage);
    socket.on('conversationUpdated', onConversationUpdated);
    const onConversationDeleted = (deletedConversationId) => {
      if (!deletedConversationId) return;
      setFriends(prev => prev.filter(f => String(f.conversationId || f.id) !== String(deletedConversationId)));
      // If the open chat is deleted, navigate back to list
      setSelectedFriend(prevSel => (String(prevSel) === String(deletedConversationId) ? null : prevSel));
    };
    socket.on('conversationdeleted', onConversationDeleted);
    
    // Handle error events from backend
    const onError = ({ message }) => {
      if (message) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
          duration: 4000,
        });
      }
    };
    socket.on('error', onError);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomidforsender', onRoomIdForSender);
      socket.off('receiveMessage', onReceiveMessage);
      socket.off('messagesRead', onMessagesRead);
      socket.off('deleteMessage', onDeleteMessage);
      socket.off('conversationUpdated', onConversationUpdated);
      socket.off('conversationdeleted', onConversationDeleted);
      socket.off('error', onError);
    };
  }, []);

  // Load conversations for current user on entry; also load all users for starting new chat
  useEffect(() => {
    (async () => {
      try {
        // Load conversations
        const convos = await getAllConversations();
        console.log('getAllConversations ->', convos);
        // If backend returns only IDs, render placeholder items directly
        if (Array.isArray(convos) && convos.every(v => typeof v === 'string')) {
          const idFriends = convos.map(id => ({
            id: String(id),
            name: `${String(id)}`,
            avatar: '/placeholder.svg',
            lastMessage: '',
          }));
          setFriends(idFriends);
        } else {
        // Normalize using backend contract (id, room, title, image, isRead, lastMessageFrom)
        const normalizedFriends = (Array.isArray(convos) ? convos : []).map(c => ({
          id: String(c.id),
          name: c.title || 'User',
          avatar: c.image || '/placeholder.svg',
          lastMessage: c.lastMessage || '',
          lastMessageType: c.lastMessageType || null,
          room: c.room,
          conversationId: c.id,
          isRead: c.isRead,
          lastMessageFrom: c.lastMessageFrom,
          lastMessageAt: c.lastMessageAt,
        }));
        setFriends(normalizedFriends);
        }

        // Load directory of all users for the + modal
        const users = await fetchAllUsers();
        // Normalize to {id, name, avatar}
        const normalized = (users || []).map(u => ({
          id: u.id || u._id || u.user_id || u.userId,
          name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.email || 'User',
          avatar: u.image || u.avatar || '/placeholder.svg',
        })).filter(u => u.id);
        setAllUsers(normalized);
        setConvosLoaded(true);
      } catch (e) {
        console.warn('Messages: failed to load users', e);
        setConvosLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !pendingImage) return;
    if (!roomId || !conversationId) {
      console.warn('Messages: cannot send, missing roomId or conversationId');
      return;
    }
    
    // If there is a pending image, send as attachment-like message first
    if (pendingImage) {
      const tempId = `img_${Date.now()}_${Math.random()}`;
      setMessages(prev => [
        ...prev,
        {
          id: tempId,
          senderId: 0,
          file: pendingImage.previewUrl,
          fileName: pendingImage.name,
          fileType: 'image',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'image',
          status: 'sending',
        },
      ]);
      const formData = new FormData();
      formData.append('media', pendingImage.file);
      formData.append('conversation_id', conversationId);
      formData.append('roomId', roomId);
      setPendingImage(null);
      (async () => {
        try {
          await api.post('/api/private-messaging/sendimage', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          });
        } catch (e) {
          setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m)));
        }
      })();
    }

    if (newMessage.trim()) {
      const messageText = newMessage.trim();
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      // Add optimistic message with sending status
      setMessages(prev => [
        ...prev,
        {
          id: tempId,
        senderId: 0,
          text: messageText,
          senderImage: null,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
          type: 'text',
          status: 'sending', // sending, sent, delivered
          tempId: tempId
      },
    ]);
      setNewMessage("");
      try {
        const socket = getSocket();
        socket.emit('sendMessage', { conversationid: conversationId, roomId, message: messageText });
      } catch (error) {
        console.warn('Messages: failed to send message', error);
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId ? { ...msg, status: 'failed' } : msg
        ));
      }
    }
  };

  // Voice message handler - commented out
  // const handleSendVoiceMessage = (audioBlob, duration) => {
  //   setMessages([
  //     ...messages,
  //     {
  //       id: messages.length + 1,
  //       senderId: 0,
  //       audioBlob,
  //       audioDuration: duration,
  //       timestamp: new Date().toLocaleTimeString([], { 
  //         hour: '2-digit', 
  //         minute: '2-digit' 
  //       }),
  //       type: 'voice',
  //     },
  //   ]);
  //   setShowVoiceRecorder(false);
  // };

  const handleSendAttachment = (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) return; // images only
    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ name: file.name, file, previewUrl });
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendAttachment(file);
    }
    e.target.value = '';
  };

  const handleDeleteMessage = (messageId) => {
    setDeleteMessageId(messageId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMessage = async () => {
    if (!deleteMessageId || !conversationId || !roomId) {
      setShowDeleteDialog(false);
      setDeleteMessageId(null);
      return;
    }
    try {
      setDeletingMessageId(deleteMessageId);
      await deleteConversationMessage({ messageid: deleteMessageId, conversation_id: conversationId, roomId });
      // Notify success
      try {
        toast({ title: 'Message Deleted Successfully', duration: 1500, className: 'text-xs py-1 px-2' });
      } catch {}
      // Delay removal slightly to allow animation
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => String(msg.id) !== String(deleteMessageId)));
        setDeletingMessageId(null);
      }, 220);
    } catch (err) {
      console.warn('Failed to delete message', err);
      setDeletingMessageId(null);
    } finally {
      setShowDeleteDialog(false);
      setDeleteMessageId(null);
    }
  };

  const cancelDeleteMessage = () => {
    setShowDeleteDialog(false);
    setDeleteMessageId(null);
  };

  const handleNewChatUserSelect = (userId) => {
    setNewChatUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateNewChat = () => {
    if (newChatUsers.length === 0) return;
    
    // Find the selected users
    const selectedUsers = allUsers.filter(user => newChatUsers.includes(user.id));
    
    // For simplicity, we'll just add the first selected user to friends
    // In a real app, you might create a group chat or handle multiple users differently
    const newFriend = selectedUsers[0];
    
    if (!friends.some(f => f.id === newFriend.id)) {
      setFriends(prev => [
        ...prev,
        {
          ...newFriend,
          lastMessage: "New conversation started",
        }
      ]);
    }
    
    setSelectedFriend(newFriend.id);
    setNewChatUsers([]);
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewChatUsers = (() => {
    const currentUserId = String(localStorage.getItem('userId') || '');
    const engagedUserIds = new Set(
      (friends || []).map(f => {
        const parts = String(f.room || '').split('_');
        if (parts.length === 2) {
          const [a, b] = parts;
          return String(a) === currentUserId ? String(b) : String(a);
        }
        // fallback: no parsable room
        return null;
      }).filter(Boolean)
    );
    return (allUsers || []).filter(user => {
      const inSearch = (user.name || '').toLowerCase().includes((newChatSearch || '').toLowerCase());
      // Exclude current user and users already in conversations
      const isSelf = String(user.id) === currentUserId;
      return inSearch && !isSelf && !engagedUserIds.has(String(user.id));
    });
  })();

  return (
    <div className="container py-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="h-[calc(100vh-120px)]">
          {/* Single-section layout: show list OR chat, not both */}
          {!selectedFriend && (
          <div className="w-full flex flex-col h-full">
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="New Chat">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Start a new chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8 h-9 text-sm"
                        value={newChatSearch}
                        onChange={(e) => setNewChatSearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredNewChatUsers.map((user) => (
                          <div 
                            key={user.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer ${startingUserId === user.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent'}`}
                            onClick={() => {
                              if (startingUserId) return; // block double clicks globally until response
                              setStartingUserId(user.id);
                              const socket = getSocket();
                              socket.emit("startConversation", { to: user.id });
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {!convosLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading conversations...</span>
                  </div>
                </div>
              ) : filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    // Open existing conversation: join its room and set IDs
                    const socket = getSocket();
                    if (friend.room) {
                      const convId = friend.conversationId || friend.id;
                      setRoomId(friend.room);
                      setConversationId(convId);
                      // Reset and show loading while fetching previous messages for this conversation
                      setMessages([]);
                      setChatLoading(true);
                      socket.emit('joinRoom', friend.room, convId);
                      // Load previous messages for this conversation
                      (async () => {
                        try {
                          const data = await loadPreviousConversation(convId);
                          const currentUserId = localStorage.getItem('userId');
                          const mapped = (data?.cov_messages || []).map(m => ({
                            id: m.id,
                            senderId: String(m.sender_id) === String(currentUserId) ? 0 : String(m.sender_id),
                            senderImage: m?.sender?.image || null,
                            text: m.type === 'IMAGE' ? null : m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: m.type === 'IMAGE' ? 'image' : 'text',
                            file: m.type === 'IMAGE' ? m.content : null,
                            status: String(m.sender_id) === String(currentUserId) ? 'sent' : 'delivered', // Default status for loaded messages
                          }));
                          setMessages(mapped);
                          setChatLoading(false);
                        } catch (e) {
                          console.warn('Failed to load previous messages', e);
                          setChatLoading(false);
                        }
                      })();
                    }
                    setSelectedFriend(friend.id);
                  }}
                  className={`group p-3 mx-1 my-1 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ease-out border border-transparent hover:border-accent/50 hover:bg-accent/40 hover:shadow-md active:scale-[0.99] ${
                    selectedFriend === friend.id ? "bg-gradient-to-r from-accent to-accent/60 border-accent/60 shadow-md" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback className="text-xs">{friend.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <p className={`font-medium text-[15px] ${(() => {
                         const currentUserId = localStorage.getItem('userId');
                         const isUnread = friend.isRead === false && 
                                         friend.lastMessageFrom && 
                                         String(friend.lastMessageFrom) !== String(currentUserId);
                         return isUnread ? 'font-bold' : '';
                       })()}`}>
                         {friend.name}
                       </p>
                       <div className="flex items-start gap-2">
                         <div className="flex flex-col items-end gap-1 min-w-[42px]">
                           <span className="text-[11px] text-muted-foreground tabular-nums">
                             {formatChatTime(friend.lastMessageAt)}
                           </span>
                           {(() => {
                             const currentUserId = localStorage.getItem('userId');
                             const isUnread = friend.isRead === false && 
                                             friend.lastMessageFrom && 
                                             String(friend.lastMessageFrom) !== String(currentUserId);
                             return isUnread ? (
                               <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_0_2px_rgba(59,130,246,0.15)] animate-pulse"></div>
                             ) : null;
                           })()}
                         </div>
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500 hover:text-red-600"
                                 title="Delete conversation"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setDeleteConversationId(friend.conversationId || friend.id);
                                   setShowDeleteConversationDialog(true);
                                 }}
                               >
                                 <Trash2 className="h-3.5 w-3.5" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>Delete conversation</TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       </div>
                    </div>
                     <p className={`text-[12px] truncate ${(() => {
                       const currentUserId = localStorage.getItem('userId');
                       const isUnread = friend.isRead === false && 
                                       friend.lastMessageFrom && 
                                       String(friend.lastMessageFrom) !== String(currentUserId);
                       return isUnread ? 'font-bold text-foreground' : 'text-muted-foreground';
                     })()}`}>
                       {(() => {
                         const currentUserId = localStorage.getItem('userId');
                         const isSentByMe = friend.lastMessageFrom && 
                                           String(friend.lastMessageFrom) === String(currentUserId);
                         
                         // If last message is an image, show icon + Image label
                         if (friend.lastMessageType === 'IMAGE') {
                           return (
                             <span className="flex items-center gap-1.5">
                               <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                               <span>Image</span>
                             </span>
                           );
                         }

                         if (isSentByMe && friend.lastMessage) {
                           return (
                             <span className="flex items-center gap-1.5">
                               <span>You:</span>
                               <Check className="h-3 w-3 text-green-500" />
                               <span>{friend.lastMessage}</span>
                             </span>
                           );
                         }
                         return friend.lastMessage || 'Start a conversation';
                       })()}
                    </p>
                  </div>
                </div>
              ))}
              {convosLoaded && filteredFriends.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">
                  No conversations yet. Click the + icon to start a chat.
                </div>
              )}
            </ScrollArea>
          </div>
          )}

          {/* Chat Area - takes full width when a chat is open */}
          {selectedFriend && (
          <div className="w-full h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b sticky top-0 z-10 bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50 border-purple-100/70">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="mr-1" onClick={() => {
                      // Leave the room when going back to chat list
                      if (roomId) {
                        try {
                          const socket = getSocket();
                          socket.emit('leaveRoom', roomId);
                        } catch (error) {
                          console.warn('Failed to leave room:', error);
                        }
                      }
                      setSelectedFriend(null);
                    }} title="Back to chats">
                      ←
                    </Button>
                    <Avatar>
                      {convosLoaded && (
                        <>
                          <AvatarImage src={friends.find((f) => f.id === selectedFriend)?.avatar} />
                      <AvatarFallback>
                            {friends.find((f) => f.id === selectedFriend)?.name?.[0] || ''}
                      </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {convosLoaded ? (friends.find((f) => f.id === selectedFriend)?.name || '') : ''}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-3 py-3 overflow-y-auto">
                  <div className="space-y-2 relative">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,_#8b5cf6_0,_transparent_40%),_radial-gradient(circle_at_80%_10%,_#a78bfa_0,_transparent_35%),_radial-gradient(circle_at_10%_80%,_#6d28d9_0,_transparent_35%),_radial-gradient(circle_at_90%_85%,_#c4b5fd_0,_transparent_40%)]" />
                    {chatLoading && (
                      <div className="h-full w-full flex items-center justify-center py-10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading conversation...</span>
                        </div>
                      </div>
                    )}
                    {!chatLoading && (
                      <div className="w-full flex justify-center py-2">
                        <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                          Chats before 7 days will be deleted automatically
                        </div>
                      </div>
                    )}
                    {!chatLoading && messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 ${
                          message.senderId === 0 ? "justify-end" : "justify-start"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {message.senderId !== 0 && (
                          <Avatar className="h-8 w-8 mt-1 ring-2 ring-white shadow-md hover:ring-purple-200 transition-all duration-200 hover:scale-110">
                            <AvatarImage src={message.senderImage || friends.find((f) => f.id === selectedFriend)?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold">
                              {friends.find((f) => f.id === selectedFriend)?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* Voice message rendering - commented out */}
                        {/* {message.type === 'voice' && message.audioBlob ? (
                          <div className="max-w-[68%]">
                            <VoiceMessage 
                              audioBlob={message.audioBlob} 
                              duration={message.audioDuration || 0}
                              isUser={message.senderId === 0}
                            />
                            <p className="text-xs mt-1 opacity-70 text-right">
                              {message.timestamp}
                            </p>
                          </div>
                        ) : */} 
                        {message.type === 'image' ? (
                          <div className={`max-w-[68%] group`}>
                            <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
                              message.senderId === 0 
                                ? "border-2 border-purple-300/30 shadow-lg shadow-purple-500/25" 
                                : "border border-gray-200/80 shadow-md shadow-gray-200/60"
                            }`}>
                                <img 
                                  src={message.file} 
                                alt={message.fileName || 'image'} 
                                 className="max-h-56 w-full object-cover cursor-pointer hover:brightness-110 transition-all duration-200"
                                onClick={() => setImagePreview({ open: true, url: message.file })}
                              />
                              {deletingMessageId === message.id && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                  <span className="text-sm text-foreground">Deleting...</span>
                                </div>
                              )}
                            </div>
                             <div className="flex justify-between items-center mt-1 gap-2">
                              <p className={`text-[11px] font-medium ${message.senderId === 0 ? "text-purple-600" : "text-gray-500"}`}>
                              {message.timestamp}
                            </p>
                              <div className="flex items-center gap-1">
                                {/* Message Status Icons for images */}
                                {message.senderId === 0 && (
                                  <div className="flex items-center">
                                    {message.status === 'sending' && (
                                      <Clock className="h-3 w-3 text-purple-500 animate-pulse" />
                                    )}
                                    {message.status === 'sent' && (
                                      <Check className="h-3 w-3 text-purple-500" />
                                    )}
                                    {message.status === 'delivered' && (
                                      <CheckCheck className="h-3 w-3 text-purple-500" />
                                    )}
                                    {message.status === 'failed' && (
                                      <div className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                        <span className="text-white text-[8px] font-bold">!</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Delete button for images - only show for own messages */}
                                {message.senderId === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0 hover:bg-red-100 text-red-500 hover:scale-110"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[68%] group relative transition-all duration-300 hover:scale-[1.02] ${
                              message.senderId === 0
                                ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40" 
                                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 shadow-md shadow-gray-200/60 hover:shadow-gray-300/60"
                            } rounded-2xl px-3 py-2.5 shadow-sm backdrop-blur-sm`}
                          >
                            <p className="leading-snug text-[13px] font-medium">{message.text && renderRichText(message.text, message.senderId === 0)}</p>
                            {message.text && extractUrls(message.text).length > 0 && (
                              <div className="mt-3">
                                {extractUrls(message.text).map((u, i) => (
                                  <LinkCard key={`${message.id}-link-${i}`} url={u} />
                                ))}
                              </div>
                            )}
                            {/* Deleting overlay only for images. None for text messages. */}
                            <div className="flex justify-between items-center mt-1 gap-2">
                              <p className={`text-[10px] font-medium ${message.senderId === 0 ? "text-white/90" : "text-gray-500"}`}>
                              {message.timestamp}
                            </p>
                              <div className="flex items-center gap-1">
                                {/* Message Status Icons */}
                                {message.senderId === 0 && (
                                  <div className="flex items-center">
                                    {message.status === 'sending' && (
                                      <Clock className="h-3 w-3 text-white/70 animate-pulse" />
                                    )}
                                    {message.status === 'sent' && (
                                      <Check className="h-3 w-3 text-white/70" />
                                    )}
                                    {message.status === 'delivered' && (
                                      <CheckCheck className="h-3 w-3 text-white/70" />
                                    )}
                                    {message.status === 'failed' && (
                                      <div className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                        <span className="text-white text-[8px] font-bold">!</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Delete button - only show for own messages */}
                                {message.senderId === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-6 w-6 p-0 hover:bg-white/20 text-white hover:scale-110"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {message.senderId === 0 && (
                          <Avatar className="h-8 w-8 mt-1 ring-2 ring-purple-200 shadow-md hover:ring-purple-300 transition-all duration-200 hover:scale-110">
                            <AvatarImage src={message.senderImage || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">Y</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50 border-purple-100/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {pendingImage && (
                    <div className="mb-3 flex items-center gap-3 p-2 rounded-md border bg-muted/40 max-w-xs">
                      <img src={pendingImage.previewUrl} alt={pendingImage.name} className="h-10 w-10 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{pendingImage.name}</p>
                        <p className="text-[11px] text-muted-foreground">Will send when you press Send</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setPendingImage(null)}>Remove</Button>
                    </div>
                  )}
                  
                  {/* Voice recorder - commented out */}
                  {/* {showVoiceRecorder ? (
                    <VoiceRecorder 
                      onSendVoiceMessage={handleSendVoiceMessage}
                      onCancel={() => setShowVoiceRecorder(false)}
                    />
                  ) : ( */}
                  {true && (
                    <div className="relative">
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-0 z-10">
                          <EmojiPicker 
                            onEmojiClick={handleEmojiClick}
                            width={300}
                            height={350}
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-3 items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:text-foreground"
                          onClick={handleAttachmentClick}
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSendMessage();
                              }
                            }}
                            className="rounded-full pl-4 pr-16 h-12 text-base bg-gray-100 border-gray-200 focus:bg-white"
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          {/* Voice recording button - commented out */}
                          {/* <Button 
                            onClick={() => setShowVoiceRecorder(true)} 
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full"
                          >
                            <Mic className="h-5 w-5" />
                          </Button> */}
                          
                          <Button 
                            onClick={handleSendMessage} 
                            className={`rounded-full h-12 w-12 transition-all ${
                              newMessage.trim() || pendingImage 
                                ? "bg-purple-500 hover:bg-purple-600 text-white" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            size="icon"
                            disabled={!newMessage.trim() && !pendingImage}
                          >
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
          </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={imagePreview.open} onOpenChange={(o) => setImagePreview(prev => ({ ...prev, open: o }))}>
        <DialogContent className="p-0 bg-white w-auto max-w-none rounded-xl shadow-2xl">
          {imagePreview.url && (
            <img 
              src={imagePreview.url} 
              alt="preview" 
              className="block h-auto w-auto max-w-[95vw] max-h-[90vh] object-contain" 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMessage}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={showDeleteConversationDialog} onOpenChange={setShowDeleteConversationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this entire conversation, including images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteConversationDialog(false); setDeleteConversationId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteConversationId) return;
                try {
                  await deleteConversation(deleteConversationId);
                  // Optimistically remove from UI; backend socket will also send confirmation
                  setFriends(prev => prev.filter(f => String(f.conversationId || f.id) !== String(deleteConversationId)));
                  if (String(selectedFriend) === String(deleteConversationId)) {
                    setSelectedFriend(null);
                  }
                  try { toast({ title: 'Conversation deleted', duration: 1400, className: 'text-xs py-1 px-2' }); } catch {}
                } catch (err) {
                  try { toast({ title: 'Failed to delete conversation', duration: 1600, className: 'text-xs py-1 px-2' }); } catch {}
                } finally {
                  setShowDeleteConversationDialog(false);
                  setDeleteConversationId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Messages;
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Send, Smile, Paperclip, Mic, Plus, Trash2, MoreVertical, Clock, Check, CheckCheck, Loader2, ExternalLink, Globe, ImageIcon, ArrowLeft, Users, Crown, X, ChevronRight, Edit3 } from "lucide-react";
import CreateGroupButton from "@/components/messages/CreateGroupButton";
import GroupInfoModal from "@/components/messages/GroupInfoModal";
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
import { fetchAllUsers, getUserRole } from "@/services/userService";
import { getAllConversations, loadPreviousConversation, deleteConversationMessage, deleteConversation } from "@/services/messageService";
import { 
  getMyPrivateGroup, 
  getMyMemberPrivateGroups, 
  createPrivateGroup, 
  addPrivateGroupMembers,
  getGroupMembers,
  getPrivateGroupMessages,
  sendPrivateGroupMessage,
  deletePrivateGroupMessage,
  editPrivateGroupMessage
} from "@/services/privateGroupService";
import getSocket from "@/services/socketClient";
import privateGroupSocket from "@/services/privateGroupSocket";
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
    <a href={url} target="_blank" rel="noreferrer" className="block mt-0.5 sm:mt-1 md:mt-1.5 lg:mt-2">
      <div className="rounded-sm sm:rounded-md md:rounded-lg lg:rounded-xl xl:rounded-2xl border border-muted/30 shadow-sm bg-white text-foreground overflow-hidden">
        <div className="flex items-center justify-between px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2">
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`} alt="" className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
            <span className="font-semibold text-[9px] sm:text-[10px] md:text-xs lg:text-sm truncate max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[220px]">{host || url}</span>
          </div>
          <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-1.5 md:px-2 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2 text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground border-t border-muted/20">
          <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />
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
    <span className="break-words">
      {parts.map((part, idx) => {
        if (urlRegex.test(part)) {
          const host = getHostname(part);
          return (
            <a key={idx} href={part} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-0.5 sm:gap-1 ${isOnDark ? 'text-white underline' : 'text-primary hover:underline'}`}>
              {host && (
                <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`} alt="" className={`h-3 w-3 sm:h-4 sm:w-4 ${isOnDark ? 'brightness-200' : ''}`} />
              )}
              <span className="break-all">{part}</span>
            </a>
          );
        }
        return <span key={idx} className="break-words">{part}</span>;
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [pendingImage, setPendingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState({ open: false, url: null });
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [deleteConversationId, setDeleteConversationId] = useState(null);
  const [showDeleteConversationDialog, setShowDeleteConversationDialog] = useState(false);
  
  // Group info modal state
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState(null);
  
  // Group creation state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [userHasGroup, setUserHasGroup] = useState(false);
  
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

  // Truncate message to a small, fixed preview with custom ellipsis for chat list
  const getHalfPreview = (text) => {
    if (!text) return '';
    const str = String(text).trim();
    const PREVIEW_LIMIT = 24; // small portion
    if (str.length <= PREVIEW_LIMIT) return str;
    return str.slice(0, PREVIEW_LIMIT).trimEnd() + '.....';
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

  // Initialize private group socket and event listeners
  useEffect(() => {
    // Initialize private group socket and ensure connection
    const initializeSocket = async () => {
      try {
        // Initialize socket
        privateGroupSocket.initialize();
        
        // Wait for socket to connect if not already connected
        if (!privateGroupSocket.connected) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Socket connection timeout'));
            }, 5000); // 5 second timeout

            const checkConnection = () => {
              if (privateGroupSocket.connected) {
                clearTimeout(timeout);
                resolve();
              } else {
                setTimeout(checkConnection, 100);
              }
            };
            checkConnection();
          });
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initializeSocket();

    // Handle private group messages
    const onPrivateGroupMessage = (event) => {
      const { groupId, message } = event.detail;
      if (!groupId || !message) {
        console.error('Invalid message data received:', event.detail);
        return;
      }
      console.log('Private group message received:', { groupId, message });
      
      // Update the group's last message in the friends list
      setFriends(prev => prev.map(f => {
        if ((f.conversationId === groupId || f.id === groupId) && f.isPrivateGroup) {
          const currentUserId = localStorage.getItem('userId');
          const isSelf = String(message.sender_id) === String(currentUserId);
          const isSystem = message.type === 'SYSTEM';
          
          let messageText = message.content;
          let messageType = message.type || 'TEXT';
          
          if (messageType === 'IMAGE') {
            messageText = 'Image';
          } else if (isSystem) {
            messageText = message.content || 'System message';
          }
          
          return {
            ...f,
            lastMessage: messageText,
            lastMessageType: messageType,
            lastMessageFrom: message.sender_id,
            lastMessageAt: message.timeStamp || message.created_at || new Date().toISOString(),
            isRead: isSelf // Mark as read if we sent it
          };
        }
        return f;
      }));

      // If we're in the conversation, add the message to the messages list
      if (String(conversationId) === String(groupId)) {
        setMessages(prev => {
          const currentUserId = localStorage.getItem('userId');
          const isSelf = String(message.sender_id) === String(currentUserId);
          const isSystem = message.type === 'SYSTEM';
          
          // Check if message already exists
          const exists = prev.some(m => String(m.id) === String(message.id));
          if (exists) return prev;

          // For own messages, update the optimistic message
          if (isSelf) {
            const updated = prev.map(m => {
              if (m.tempId || (m.status === 'sending' && m.text === message.content)) {
                return {
                  ...m,
                  id: message.id,
                  tempId: undefined,
                  status: 'sent',
                  timestamp: new Date(message.timeStamp || message.created_at || new Date()).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                };
              }
              return m;
            });
            
            // If no message was updated, add as new
            if (updated.every(m => m.id !== message.id)) {
              const mappedMessage = {
                id: message.id,
                senderId: 0,
                senderImage: message.sender?.image || null,
                text: message.type === 'IMAGE' ? null : message.content,
                image: message.type === 'IMAGE' ? message.content : null,
                timestamp: new Date(message.timeStamp || message.created_at || new Date()).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                status: 'sent'
              };
              return [...updated, mappedMessage];
            }
            return updated;
          }

          // For others' messages
          const mappedMessage = {
            id: message.id,
            senderId: isSystem ? 'system' : String(message.sender_id),
            senderImage: isSystem ? null : (message.sender?.image || null),
            text: message.type === 'IMAGE' ? null : message.content,
            image: message.type === 'IMAGE' ? message.content : null,
            timestamp: new Date(message.timeStamp || message.created_at || new Date()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: 'delivered'
          };

          // Auto-scroll to bottom for new messages
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);

          return [...prev, mappedMessage];
        });

        // Play notification sound for incoming messages
        if (String(message.sender_id) !== String(localStorage.getItem('userId'))) {
          try {
            new Audio('/message.mp3').play().catch(() => {});
          } catch (e) {}
        }
      }
    };

    // Handle member updates
    const onMemberAdded = (event) => {
      const member = event.detail;
      handlePrivateGroupMemberAdded(member);
    };

    const onMemberRemoved = (event) => {
      const { userId, groupId } = event.detail;
      handlePrivateGroupMemberRemoved(userId, groupId);
    };

    // Handle group updates
    const onGroupUpdated = (event) => {
      const { groupId, ...updates } = event.detail;
      handlePrivateGroupUpdated(groupId, updates);
    };

    // Handle message status
    const onMessageRead = (event) => {
      const { groupId, messageId } = event.detail;
      handlePrivateGroupMessageRead(groupId, messageId);
    };

    // Add event listeners
    window.addEventListener('privateGroupMessage', onPrivateGroupMessage);
    window.addEventListener('privateGroupMemberAdded', onMemberAdded);
    window.addEventListener('privateGroupMemberRemoved', onMemberRemoved);
    window.addEventListener('privateGroupUpdated', onGroupUpdated);
    window.addEventListener('privateGroupMessageRead', onMessageRead);

    // Regular socket setup
    const socket = getSocket();
    
    // Handle local custom events for immediate UI updates
    const handleLocalPrivateGroupUpdated = (event) => {
      const { groupId, updates } = event.detail;
      console.log('Local private group updated:', { groupId, updates });
      setFriends(prev => prev.map(f => {
        if (f.conversationId === groupId && f.isPrivateGroup) {
          return {
            ...f,
            name: updates.name || f.name,
            description: updates.description !== undefined ? updates.description : f.description,
            avatar: updates.thumbnail || updates.avatar || f.avatar,
            lastMessage: 'Group updated',
            lastMessageAt: new Date().toISOString(),
          };
        }
        return f;
      }));
    };
    
    const handleLocalPrivateGroupDeleted = (event) => {
      const { groupId } = event.detail;
      console.log('Local private group deleted:', groupId);
      setFriends(prev => prev.filter(f => f.conversationId !== groupId));
      if (String(conversationId) === String(groupId)) {
        setSelectedFriend(null);
        setRoomId(null);
        setConversationId(null);
        setMessages([]);
      }
      setUserHasGroup(false);
    };
    
    const handleLocalPrivateGroupMemberLeft = (event) => {
      const { groupId, userId, userName } = event.detail;
      console.log('Local private group member left:', { groupId, userId, userName });
      const currentUserId = localStorage.getItem('userId');
      
      // If the current user is leaving the group, remove it from the list
      if (String(userId) === String(currentUserId)) {
        setFriends(prev => prev.filter(f => f.conversationId !== groupId));
        // If the group chat is currently open, close it
        if (String(conversationId) === String(groupId)) {
          setSelectedFriend(null);
          setRoomId(null);
          setConversationId(null);
          setMessages([]);
        }
        setUserHasGroup(false);
      } else {
        // If another member left, just update the member count
        setFriends(prev => prev.map(f => {
          if (f.conversationId === groupId && f.isPrivateGroup) {
            return {
              ...f,
              memberCount: Math.max(0, (f.memberCount || 1) - 1),
              lastMessage: `${userName || 'A member'} left the group`,
              lastMessageAt: new Date().toISOString(),
            };
          }
          return f;
        }));
      }
    };
    
    // Add event listeners for local custom events
    window.addEventListener('privateGroupUpdated', handleLocalPrivateGroupUpdated);
    window.addEventListener('privateGroupDeleted', handleLocalPrivateGroupDeleted);
    window.addEventListener('privateGroupMemberLeft', handleLocalPrivateGroupMemberLeft);
    
    // Cleanup event listeners
    return () => {
      // Remove private group socket event listeners
      window.removeEventListener('privateGroupMessage', onPrivateGroupMessage);
      window.removeEventListener('privateGroupMemberAdded', onMemberAdded);
      window.removeEventListener('privateGroupMemberRemoved', onMemberRemoved);
      window.removeEventListener('privateGroupUpdated', onGroupUpdated);
      window.removeEventListener('privateGroupMessageRead', onMessageRead);

      // Remove local event listeners
      window.removeEventListener('privateGroupUpdated', handleLocalPrivateGroupUpdated);
      window.removeEventListener('privateGroupDeleted', handleLocalPrivateGroupDeleted);
      window.removeEventListener('privateGroupMemberLeft', handleLocalPrivateGroupMemberLeft);
    };
  }, []);
  
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

    // Handle private group room joining
    const onPrivateGroupRoomJoined = ({ groupId, roomId: serverRoomId }) => {
      console.log('Private group room joined:', { groupId, serverRoomId });
      setRoomId(serverRoomId);
      setConversationId(groupId);
      setSelectedFriend(`private_group_${groupId}`);
      setMessages([]);
      setChatLoading(true);
      
      // Load previous messages for private group
      (async () => {
        try {
          // For private groups, we might need a different API endpoint
          // For now, using the same loadPreviousConversation
          const data = await loadPreviousConversation(groupId);
          const currentUserId = localStorage.getItem('userId');
          const mapped = (data?.cov_messages || []).map(m => ({
            id: m.id,
            senderId: String(m.sender_id) === String(currentUserId) ? 0 : String(m.sender_id),
            senderImage: m?.sender?.image || null,
            text: m.type === 'IMAGE' ? null : m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: m.type === 'IMAGE' ? 'image' : 'text',
            file: m.type === 'IMAGE' ? m.content : null,
            status: String(m.sender_id) === String(currentUserId) ? 'sent' : 'delivered',
          }));
          setMessages(mapped);
          setChatLoading(false);
        } catch (e) {
          console.warn('Failed to load previous private group messages', e);
          setChatLoading(false);
        }
      })();
    };

    // Handle private group creation event
    const onPrivateGroupCreated = ({ group }) => {
      console.log('Private group created:', group);
      // Build new group entry
      const newGroup = {
        id: `private_group_${group.id}`,
        name: group.name,
        avatar: group.thumbnail || '/placeholder.svg',
        lastMessage: 'Private group created',
        lastMessageType: 'system',
        room: `private_group_${group.id}`,
        conversationId: group.id,
        isRead: true,
        lastMessageFrom: 'System',
        lastMessageAt: group.createdAt || new Date().toISOString(),
        isGroup: true,
        isPrivateGroup: true,
        isAdmin: true,
        memberCount: 1, // Will be updated when members are added
        description: group.description,
      };
      // Avoid duplicate if already present (e.g., from initial fetch)
      setFriends(prev => {
        const exists = prev.some(f => String(f.conversationId || f.id) === String(group.id));
        return exists ? prev : [newGroup, ...prev];
      });
      setUserHasGroup(true);
    };

    // Handle private group members added event
    const onPrivateGroupMembersAdded = ({ groupId, users }) => {
      console.log('Private group members added:', { groupId, users });
      // Update the group in the friends list to reflect new member count
      setFriends(prev => prev.map(f => {
        if (f.conversationId === groupId && f.isPrivateGroup) {
          return {
            ...f,
            memberCount: (f.memberCount || 1) + users.length,
            lastMessage: `${users.length} member(s) added to group`,
            lastMessageAt: new Date().toISOString(),
          };
        }
        return f;
      }));
    };

    // Handle private group updated event (name, description, avatar changes)
    const onPrivateGroupUpdated = ({ groupId, updates }) => {
      console.log('Private group updated:', { groupId, updates });
      setFriends(prev => prev.map(f => {
        if (f.conversationId === groupId && f.isPrivateGroup) {
          return {
            ...f,
            name: updates.name || f.name,
            description: updates.description !== undefined ? updates.description : f.description,
            avatar: updates.thumbnail || updates.avatar || f.avatar,
            lastMessage: 'Group updated',
            lastMessageAt: new Date().toISOString(),
          };
        }
        return f;
      }));
    };

    // Handle private group deleted event
    const onPrivateGroupDeleted = ({ groupId }) => {
      console.log('Private group deleted:', groupId);
      setFriends(prev => prev.filter(f => f.conversationId !== groupId));
      // If the deleted group is currently open, close it
      if (String(conversationId) === String(groupId)) {
        setSelectedFriend(null);
        setRoomId(null);
        setConversationId(null);
        setMessages([]);
      }
      // Update user group status
      setUserHasGroup(false);
    };

    // Handle private group member left event
    const onPrivateGroupMemberLeft = ({ groupId, userId, userName }) => {
      console.log('Private group member left:', { groupId, userId, userName });
      const currentUserId = localStorage.getItem('userId');
      
      // If the current user is leaving the group, remove it from the list
      if (String(userId) === String(currentUserId)) {
        setFriends(prev => prev.filter(f => f.conversationId !== groupId));
        // If the group chat is currently open, close it
        if (String(conversationId) === String(groupId)) {
          setSelectedFriend(null);
          setRoomId(null);
          setConversationId(null);
          setMessages([]);
        }
        setUserHasGroup(false);
      } else {
        // If another member left, just update the member count
        setFriends(prev => prev.map(f => {
          if (f.conversationId === groupId && f.isPrivateGroup) {
            return {
              ...f,
              memberCount: Math.max(0, (f.memberCount || 1) - 1),
              lastMessage: `${userName || 'A member'} left the group`,
              lastMessageAt: new Date().toISOString(),
            };
          }
          return f;
        }));
      }
    };

    // Handle private group member removed event
    const onPrivateGroupMemberRemoved = ({ groupId, userId, userName, removedBy }) => {
      console.log('Private group member removed:', { groupId, userId, userName, removedBy });
      const currentUserId = localStorage.getItem('userId');
      
      // If the current user is removed from the group, remove it from the list
      if (String(userId) === String(currentUserId)) {
        setFriends(prev => prev.filter(f => f.conversationId !== groupId));
        // If the group chat is currently open, close it
        if (String(conversationId) === String(groupId)) {
          setSelectedFriend(null);
          setRoomId(null);
          setConversationId(null);
          setMessages([]);
        }
        setUserHasGroup(false);
      } else {
        // If another member was removed, just update the member count
        setFriends(prev => prev.map(f => {
          if (f.conversationId === groupId && f.isPrivateGroup) {
            return {
              ...f,
              memberCount: Math.max(0, (f.memberCount || 1) - 1),
              lastMessage: `${userName || 'A member'} was removed from the group`,
              lastMessageAt: new Date().toISOString(),
            };
          }
          return f;
        }));
      }
    };

    // Handle private group member promoted event
    const onPrivateGroupMemberPromoted = ({ groupId, userId, userName }) => {
      console.log('Private group member promoted:', { groupId, userId, userName });
      setFriends(prev => prev.map(f => {
        if (f.conversationId === groupId && f.isPrivateGroup) {
          return {
            ...f,
            lastMessage: `${userName || 'A member'} was promoted to admin`,
            lastMessageAt: new Date().toISOString(),
          };
        }
        return f;
      }));
    };

    // Handle private group joined event (when someone joins via invitation)
    const onPrivateGroupJoined = ({ groupId, userId, userName }) => {
      console.log('Private group joined:', { groupId, userId, userName });
      setFriends(prev => prev.map(f => {
        if (f.conversationId === groupId && f.isPrivateGroup) {
          return {
            ...f,
            memberCount: (f.memberCount || 1) + 1,
            lastMessage: `${userName || 'A new member'} joined the group`,
            lastMessageAt: new Date().toISOString(),
          };
        }
        return f;
      }));
    };

    // Handle new private group message event
    const onNewGroupMessage = (data) => {
      console.log('Raw group message received:', data);
      
      // Extract data from either format
      const messageData = data?.detail || data;
      const groupId = messageData?.groupId || messageData?.group_id;
      const message = messageData?.message || messageData;
      
      // Validate message data
      if (!message || !groupId) {
        console.error('Invalid message data received:', { groupId, message, originalData: data });
        return;
      }
      
      console.log('Processed message data:', { groupId, message });

      const currentUserId = localStorage.getItem('userId');
      const isSelf = String(message.sender_id || message.senderId) === String(currentUserId);
      const isSystem = (message.type || '').toUpperCase() === 'SYSTEM';
      
      // Play notification sound for incoming messages (not for own messages or system messages)
      if (!isSelf && !isSystem) {
        try {
          new Audio('/message.mp3').play().catch(() => {});
        } catch (e) {}
      }

      // Update the group's last message in the friends list
      setFriends(prev => prev.map(f => {
        // Match by both conversationId and id since they might be used interchangeably
        if ((f.conversationId === groupId || f.id === groupId) && f.isPrivateGroup) {
          let messageText = message.content;
          let messageType = message.type || 'TEXT';
          
          // Handle different message types
          if (message.type === 'IMAGE') {
            messageText = 'Image';
            messageType = 'IMAGE';
          } else if (message.type === 'SYSTEM') {
            messageText = message.content;
            messageType = 'system';
          }
          
          return {
            ...f,
            lastMessage: messageText,
            lastMessageType: messageType,
            lastMessageFrom: isSystem ? 'System' : (isSelf ? currentUserId : message.sender_id),
            lastMessageAt: message.createdAt || message.created_at || message.timeStamp || message.timestamp || new Date().toISOString(),
            isRead: isSelf || isSystem ? true : f.isRead, // Mark as read if it's our own message or system message
          };
        }
        return f;
      }));

      // If this message is for the currently open group chat, add it to messages
      if (String(conversationId) === String(groupId)) {
        setMessages(prev => {
          // For own messages, update the optimistic message instead of adding new
          if (isSelf) {
            const updated = prev.map(m => {
              // Match by tempId or content for optimistic updates
              if (m.tempId || (m.status === 'sending' && m.text === message.content)) {
                return {
                  ...m,
                  id: message.id,
                  tempId: undefined,
                  status: 'sent',
                  timestamp: new Date(message.createdAt || message.created_at || message.timeStamp || message.timestamp || new Date()).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                };
              }
              return m;
            });
            
            // If no message was updated (no optimistic update found), add as new
            if (updated.every(m => m.id !== message.id)) {
              const mappedMessage = {
                id: message.id,
                senderId: 0,
                senderImage: message.sender?.image || null,
                text: message.type === 'IMAGE' ? null : message.content,
                timestamp: new Date(message.createdAt || message.created_at || message.timeStamp || message.timestamp || new Date()).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                type: message.type === 'IMAGE' ? 'image' : (message.type === 'SYSTEM' ? 'system' : 'text'),
                file: message.type === 'IMAGE' ? message.content : null,
                status: 'sent'
              };
              return [...updated, mappedMessage];
            }
            return updated;
          }

          // For others' messages, check for duplicates and add if new
          const exists = prev.some(m => String(m.id) === String(message.id));
          if (exists) return prev;

          const mappedMessage = {
            id: message.id,
            senderId: isSystem ? 'system' : String(message.sender_id),
            senderImage: isSystem ? null : (message.sender?.image || null),
            text: message.type === 'IMAGE' ? null : message.content,
            timestamp: new Date(message.createdAt || message.created_at || message.timeStamp || message.timestamp || new Date()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: message.type === 'IMAGE' ? 'image' : (message.type === 'SYSTEM' ? 'system' : 'text'),
            file: message.type === 'IMAGE' ? message.content : null,
            status: 'delivered'
          };

          // Auto-scroll to bottom for new messages
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);

          return [...prev, mappedMessage];
        });
      }
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
    socket.on('privateGroupRoomJoined', onPrivateGroupRoomJoined);
    socket.on('privateGroupCreated', onPrivateGroupCreated);
    socket.on('privateGroupMembersAdded', onPrivateGroupMembersAdded);
    socket.on('privateGroupUpdated', onPrivateGroupUpdated);
    socket.on('privateGroupDeleted', onPrivateGroupDeleted);
    socket.on('privateGroupMemberLeft', onPrivateGroupMemberLeft);
    socket.on('privateGroupMemberRemoved', onPrivateGroupMemberRemoved);
    socket.on('privateGroupMemberPromoted', onPrivateGroupMemberPromoted);
    socket.on('privateGroupJoined', onPrivateGroupJoined);
    // Listen for both socket and custom events
    socket.on('newGroupMessage', onNewGroupMessage);
    window.addEventListener('newGroupMessage', onNewGroupMessage);
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
      socket.off('privateGroupRoomJoined', onPrivateGroupRoomJoined);
      socket.off('privateGroupCreated', onPrivateGroupCreated);
      socket.off('privateGroupMembersAdded', onPrivateGroupMembersAdded);
      socket.off('privateGroupUpdated', onPrivateGroupUpdated);
      socket.off('privateGroupDeleted', onPrivateGroupDeleted);
      socket.off('privateGroupMemberLeft', onPrivateGroupMemberLeft);
      socket.off('privateGroupMemberRemoved', onPrivateGroupMemberRemoved);
      socket.off('privateGroupMemberPromoted', onPrivateGroupMemberPromoted);
      socket.off('privateGroupJoined', onPrivateGroupJoined);
      socket.off('newGroupMessage', onNewGroupMessage);
      window.removeEventListener('newGroupMessage', onNewGroupMessage);
      socket.off('receiveMessage', onReceiveMessage);
      socket.off('messagesRead', onMessagesRead);
      socket.off('deleteMessage', onDeleteMessage);
      socket.off('conversationUpdated', onConversationUpdated);
      socket.off('conversationdeleted', onConversationDeleted);
      socket.off('error', onError);
    };
  }, []);

  // Polling mechanism to refresh private group last messages periodically
  useEffect(() => {
    if (!convosLoaded) return;

    const refreshPrivateGroupMessages = async () => {
      const privateGroups = friends.filter(f => f.isPrivateGroup);
      if (privateGroups.length === 0) return;

      try {
        const lastMessagePromises = privateGroups.map(async (group) => {
          try {
            const messagesRes = await getPrivateGroupMessages(group.conversationId, 1, 1);
            const messages = messagesRes?.data?.messages || messagesRes?.messages || [];
            if (messages.length > 0) {
              const lastMsg = messages[0];
              const currentUserId = localStorage.getItem('userId');
              const isSelf = String(lastMsg.sender_id) === String(currentUserId);
              
              return {
                groupId: group.conversationId,
                lastMessage: lastMsg.type === 'IMAGE' ? 'Image' : lastMsg.content,
                lastMessageType: lastMsg.type || 'TEXT',
                lastMessageFrom: isSelf ? currentUserId : lastMsg.sender_id,
                lastMessageAt: lastMsg.createdAt || lastMsg.created_at || lastMsg.timeStamp || lastMsg.timestamp || new Date().toISOString(),
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to refresh last message for group ${group.conversationId}:`, error);
            return null;
          }
        });

        const lastMessages = await Promise.all(lastMessagePromises);
        
        // Update friends list with refreshed last messages
        setFriends(prev => prev.map(f => {
          if (f.isPrivateGroup) {
            const lastMsgData = lastMessages.find(lm => lm && String(lm.groupId) === String(f.conversationId));
            if (lastMsgData) {
              // Only update if the message is actually newer
              const currentTime = new Date(f.lastMessageAt).getTime();
              const newTime = new Date(lastMsgData.lastMessageAt).getTime();
              if (newTime > currentTime) {
                return {
                  ...f,
                  lastMessage: lastMsgData.lastMessage,
                  lastMessageType: lastMsgData.lastMessageType,
                  lastMessageFrom: lastMsgData.lastMessageFrom,
                  lastMessageAt: lastMsgData.lastMessageAt,
                };
              }
            }
          }
          return f;
        }));
      } catch (error) {
        console.warn('Failed to refresh private group messages:', error);
      }
    };

    // Refresh every 30 seconds
    const interval = setInterval(refreshPrivateGroupMessages, 30000);
    
    return () => clearInterval(interval);
  }, [convosLoaded, friends]);

  // Load conversations for current user on entry; also load all users for starting new chat
  useEffect(() => {
    (async () => {
      try {
        // Load conversations and private groups
        const [convos, privateGroupRes, memberGroupsRes] = await Promise.all([
          getAllConversations().catch(() => []),
          getMyPrivateGroup().catch(() => null),
          getMyMemberPrivateGroups().catch(() => [])
        ]);
        
        console.log('getAllConversations ->', convos);
        console.log('getMyPrivateGroup ->', privateGroupRes);
        console.log('getMyMemberPrivateGroups ->', memberGroupsRes);
        
        // Check if user already has a group
        const hasGroup = convos.some(convo => convo.isGroup) || 
                        (privateGroupRes?.success && privateGroupRes?.data) ||
                        (Array.isArray(memberGroupsRes?.data) && memberGroupsRes.data.length > 0);
        setUserHasGroup(hasGroup);
        
        let allConversations = [];
        
        // Add regular conversations
        if (Array.isArray(convos) && convos.every(v => typeof v === 'string')) {
          const idFriends = convos.map(id => ({
            id: String(id),
            name: `${String(id)}`,
            avatar: '/placeholder.svg',
            lastMessage: '',
          }));
          allConversations = [...allConversations, ...idFriends];
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
            isGroup: c.isGroup || false,
          }));
          allConversations = [...allConversations, ...normalizedFriends];
        }
        
        // Add private group if user owns one
        if (privateGroupRes?.success && privateGroupRes?.data) {
          const privateGroup = {
            id: `private_group_${privateGroupRes.data.id}`,
            name: privateGroupRes.data.name,
            avatar: privateGroupRes.data.thumbnail || '/placeholder.svg',
            lastMessage: 'Private group created', // Will be updated with real last message
            lastMessageType: 'system',
            room: `private_group_${privateGroupRes.data.id}`,
            conversationId: privateGroupRes.data.id,
            isRead: true,
            lastMessageFrom: 'System',
            lastMessageAt: privateGroupRes.data.createdAt || new Date().toISOString(),
            isGroup: true,
            isPrivateGroup: true,
            isAdmin: true,
            memberCount: privateGroupRes.data.member_count || 1,
            description: privateGroupRes.data.description,
          };
          allConversations = [privateGroup, ...allConversations];
        }
        
        // Add member groups (groups user is a member of but doesn't own)
        if (Array.isArray(memberGroupsRes?.data) && memberGroupsRes.data.length > 0) {
          const memberGroups = memberGroupsRes.data.map(group => ({
            id: `private_group_${group.id}`,
            name: group.name,
            avatar: group.thumbnail || '/placeholder.svg',
            lastMessage: 'Joined group', // Will be updated with real last message
            lastMessageType: 'system',
            room: `private_group_${group.id}`,
            conversationId: group.id,
            isRead: true,
            lastMessageFrom: 'System',
            lastMessageAt: group.joined_at || new Date().toISOString(),
            isGroup: true,
            isPrivateGroup: true,
            isAdmin: false,
            memberCount: group.member_count || 1,
            description: group.description,
          }));
          allConversations = [...allConversations, ...memberGroups];
        }
        
        // Deduplicate conversations by conversationId (or id fallback)
        const seenKeys = new Set();
        const dedupedConversations = [];
        for (const conv of allConversations) {
          const key = String(conv.conversationId || conv.id);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            dedupedConversations.push(conv);
          }
        }
        setFriends(dedupedConversations);

        // Fetch last messages for private groups
        const privateGroups = dedupedConversations.filter(conv => conv.isPrivateGroup);
        if (privateGroups.length > 0) {
          // Fetch last messages for each private group
          const lastMessagePromises = privateGroups.map(async (group) => {
            try {
              const messagesRes = await getPrivateGroupMessages(group.conversationId, 1, 1);
              const messages = messagesRes?.data?.messages || messagesRes?.messages || [];
              if (messages.length > 0) {
                const lastMsg = messages[0]; // Most recent message
                const currentUserId = localStorage.getItem('userId');
                const isSelf = String(lastMsg.sender_id) === String(currentUserId);
                
                return {
                  groupId: group.conversationId,
                  lastMessage: lastMsg.type === 'IMAGE' ? 'Image' : lastMsg.content,
                  lastMessageType: lastMsg.type || 'TEXT',
                  lastMessageFrom: isSelf ? currentUserId : lastMsg.sender_id,
                  lastMessageAt: lastMsg.createdAt || lastMsg.created_at || lastMsg.timeStamp || lastMsg.timestamp || new Date().toISOString(),
                };
              }
              return null;
            } catch (error) {
              console.warn(`Failed to fetch last message for group ${group.conversationId}:`, error);
              return null;
            }
          });

          const lastMessages = await Promise.all(lastMessagePromises);
          
          // Update friends list with real last messages
          setFriends(prev => prev.map(f => {
            if (f.isPrivateGroup) {
              const lastMsgData = lastMessages.find(lm => lm && String(lm.groupId) === String(f.conversationId));
              if (lastMsgData) {
                return {
                  ...f,
                  lastMessage: lastMsgData.lastMessage,
                  lastMessageType: lastMsgData.lastMessageType,
                  lastMessageFrom: lastMsgData.lastMessageFrom,
                  lastMessageAt: lastMsgData.lastMessageAt,
                };
              }
            }
            return f;
          }));
        }

        // Load directory of all users for the + modal
        const users = await fetchAllUsers();
        // Normalize to {id, name, avatar, role}
        const normalized = (users || []).map(u => {
          // Extract user role from user_roles array
          let userRole = 'User';
          if (u.user_roles && Array.isArray(u.user_roles) && u.user_roles.length > 0) {
            const roles = u.user_roles.map(r => r.role);
            // Priority order: admin > instructor > user
            if (roles.includes('admin')) {
              userRole = 'Admin';
            } else if (roles.includes('instructor')) {
              userRole = 'Instructor';
            } else {
              userRole = roles[0] || 'User';
            }
          }
          
          return {
            id: u.id || u._id || u.user_id || u.userId,
            name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.email || 'User',
            avatar: u.image || u.avatar || '/placeholder.svg',
            role: userRole,
          };
        }).filter(u => u.id);
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

  const handleSendMessage = async () => {
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
          const selectedFriendData = friends.find(f => f.id === selectedFriend);
          
          // Handle private groups differently for image sending
          if (selectedFriendData?.isPrivateGroup) {
            const groupId = selectedFriendData.conversationId || selectedFriendData.id;
            const response = await sendPrivateGroupMessage(groupId, formData, true);
            // Update the optimistic message with the real message data
            if (response?.success && response?.data) {
              setMessages(prev => prev.map(msg => 
                msg.id === tempId ? { 
                  ...msg, 
                  id: response.data.id,
                  status: 'sent',
                  file: response.data.content || response.data.url || msg.file
                } : msg
              ));
              
              // Update the group's last message in the friends list
              setFriends(prev => prev.map(f => {
                if ((f.conversationId === groupId || f.id === groupId) && f.isPrivateGroup) {
                  return {
                    ...f,
                    lastMessage: 'Image',
                    lastMessageType: 'IMAGE',
                    lastMessageFrom: localStorage.getItem('userId'),
                    lastMessageAt: response.data.createdAt || response.data.created_at || response.data.timeStamp || response.data.timestamp || new Date().toISOString(),
                    isRead: true,
                  };
                }
                return f;
              }));

              // Emit via socket for real-time
              privateGroupSocket.sendMessage(
                groupId,
                response.data.content || response.data.url,
                'IMAGE'
              );
            }
          } else {
            await api.post('/api/private-messaging/sendimage', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true,
            });
          }
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
        const selectedFriendData = friends.find(f => f.id === selectedFriend);
        
        // Handle private groups: send via REST API; others via socket
        if (selectedFriendData?.isPrivateGroup) {
          try {
            // Get the correct group ID
            const groupId = selectedFriendData.conversationId || selectedFriendData.id;
            
            // Send via REST API
            const response = await sendPrivateGroupMessage(groupId, { content: messageText });
            
            // Update the optimistic message with the real message data
            if (response?.success && response?.data) {
              setMessages(prev => prev.map(msg => 
                msg.tempId === tempId ? { 
                  ...msg, 
                  id: response.data.id,
                  status: 'sent',
                  tempId: undefined // Remove tempId since we have real ID
                } : msg
              ));
              
              // Update the group's last message in the friends list
              setFriends(prev => prev.map(f => {
                if ((f.conversationId === groupId || f.id === groupId) && f.isPrivateGroup) {
                  return {
                    ...f,
                    lastMessage: messageText,
                    lastMessageType: 'TEXT',
                    lastMessageFrom: localStorage.getItem('userId'),
                    lastMessageAt: response.data.createdAt || response.data.created_at || response.data.timeStamp || response.data.timestamp || new Date().toISOString(),
                    isRead: true,
                  };
                }
                return f;
              }));

              // Emit via socket for real-time
              privateGroupSocket.sendMessage(
                groupId,
                messageText,
                'TEXT'
              );
            }
          } catch (e) {
            throw e;
          }
        } else {
          socket.emit('sendMessage', { 
            conversationid: conversationId, 
            roomId, 
            message: messageText 
          });
        }
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
      const selectedFriendData = friends.find(f => f.id === selectedFriend);
      if (selectedFriendData?.isPrivateGroup) {
        await deletePrivateGroupMessage(conversationId, deleteMessageId);
      } else {
      await deleteConversationMessage({ messageid: deleteMessageId, conversation_id: conversationId, roomId });
      }
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

  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingText.trim() || !conversationId) {
      setEditingMessageId(null);
      setEditingText("");
      return;
    }

    try {
      const selectedFriendData = friends.find(f => f.id === selectedFriend);
      if (selectedFriendData?.isPrivateGroup) {
        await editPrivateGroupMessage(conversationId, editingMessageId, { content: editingText.trim() });
      }
      
      // Update the message in the UI
      setMessages(prev => prev.map(msg => 
        String(msg.id) === String(editingMessageId) 
          ? { ...msg, text: editingText.trim() }
          : msg
      ));
      
      toast({ title: 'Message updated successfully', duration: 1500, className: 'text-xs py-1 px-2' });
    } catch (err) {
      console.warn('Failed to edit message', err);
      toast({ title: 'Failed to update message', variant: 'destructive', duration: 1500, className: 'text-xs py-1 px-2' });
    } finally {
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
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

  // Private Group creation handlers
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a group name and select at least one member",
        variant: "destructive",
      });
      return;
    }

    if (userHasGroup) {
      toast({
        title: "Error",
        description: "You can only create one private group",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGroup(true);
    try {
      // Create the private group
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        invited_user_ids: selectedGroupMembers,
      };

      const response = await createPrivateGroup(groupData);
      
      if (response?.success && response?.data) {
        const groupId = response.data.id;
        
        // Add selected members to the group
        if (selectedGroupMembers.length > 0) {
          try {
            await addPrivateGroupMembers(groupId, selectedGroupMembers);
          } catch (error) {
            console.warn(`Failed to add some members to group:`, error);
          }
        }

        // Add private group to friends list
        const newGroup = {
          id: `private_group_${groupId}`,
          name: response.data.name,
          avatar: response.data.thumbnail || '/placeholder.svg',
          lastMessage: "Private group created",
          lastMessageType: 'system',
          room: `private_group_${groupId}`,
          conversationId: groupId,
          isRead: true,
          lastMessageFrom: 'System',
          lastMessageAt: response.data.createdAt || new Date().toISOString(),
          isGroup: true,
          isPrivateGroup: true,
          memberCount: selectedGroupMembers.length + 1, // +1 for creator
          isAdmin: true,
          description: response.data.description,
        };

        // Avoid duplicate if group already exists
        setFriends(prev => {
          const exists = prev.some(f => String(f.conversationId || f.id) === String(groupId));
          return exists ? prev : [newGroup, ...prev];
        });
        setUserHasGroup(true);
        
        toast({
          title: "Success",
          description: "Private group created successfully!",
        });

        // Reset form and close modal
        setGroupName("");
        setGroupDescription("");
        setSelectedGroupMembers([]);
        setGroupSearchQuery("");
        setShowCreateGroupModal(false);
      } else {
        throw new Error(response?.message || "Failed to create private group");
      }
    } catch (error) {
      console.error("Error creating private group:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create private group",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupMemberSelect = (userId) => {
    setSelectedGroupMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) &&
    !selectedGroupMembers.includes(user.id)
  );

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
    <div className="container py-2 sm:py-4 px-2 sm:px-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)]">
          {/* Single-section layout: show list OR chat, not both */}
          {!selectedFriend && (
          <div className="w-full flex flex-col h-full">
            <div className="p-2 sm:p-3 border-b flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold">Messages</h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <CreateGroupButton
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onCreated={(created) => {
                    try { setFriends(prev => [created, ...prev]); } catch {}
                    try { setUserHasGroup(true); } catch {}
                    try { setSelectedFriend(created.id); } catch {}
                    try { setRoomId(created.room); } catch {}
                    try { setConversationId(created.conversationId); } catch {}
                  }}
                />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" title="New Chat">
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="text-sm sm:text-base">Start a new chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-7 sm:pl-8 h-8 sm:h-9 text-xs sm:text-sm"
                        value={newChatSearch}
                        onChange={(e) => setNewChatSearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-48 sm:h-64 overflow-x-hidden">
                      <div className="space-y-2">
                        {filteredNewChatUsers.map((user) => (
                          <div 
                            key={user.id}
                            className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded cursor-pointer ${startingUserId === user.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent'}`}
                            onClick={() => {
                              if (startingUserId) return; // block double clicks globally until response
                              setStartingUserId(user.id);
                              const socket = getSocket();
                              socket.emit("startConversation", { to: user.id });
                            }}
                          >
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-xs sm:text-sm truncate">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
            <div className="p-2 sm:p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-7 sm:pl-8 h-8 sm:h-9 text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-x-hidden">
              {!convosLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Loading conversations...</span>
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
                      
                      // Handle private groups differently
                      if (friend.isPrivateGroup) {
                        // Use private group socket handler to join the room
                        privateGroupSocket.joinGroup(convId);
                        
                        // Refresh the last message for this group when opening
                        (async () => {
                          try {
                            const messagesRes = await getPrivateGroupMessages(convId, 1, 1);
                            const messages = messagesRes?.data?.messages || messagesRes?.messages || [];
                            if (messages.length > 0) {
                              const lastMsg = messages[0];
                              const currentUserId = localStorage.getItem('userId');
                              const isSelf = String(lastMsg.sender_id) === String(currentUserId);
                              
                              // Update the group's last message in the friends list
                              setFriends(prev => prev.map(f => {
                                if (f.conversationId === convId && f.isPrivateGroup) {
                                  return {
                                    ...f,
                                    lastMessage: lastMsg.type === 'IMAGE' ? 'Image' : lastMsg.content,
                                    lastMessageType: lastMsg.type || 'TEXT',
                                    lastMessageFrom: isSelf ? currentUserId : lastMsg.sender_id,
                                    lastMessageAt: lastMsg.createdAt || lastMsg.created_at || lastMsg.timeStamp || lastMsg.timestamp || new Date().toISOString(),
                                  };
                                }
                                return f;
                              }));
                            }
                          } catch (error) {
                            console.warn(`Failed to refresh last message for group ${convId}:`, error);
                          }
                        })();
                      } else {
                        // For regular conversations
                        socket.emit('joinRoom', friend.room, convId);
                      }
                      
                      // Load previous messages for this conversation
                      (async () => {
                        try {
                          // Use private group API for private groups; fallback to conversation API otherwise
                          const currentUserId = localStorage.getItem('userId');
                          let mapped = [];
                          if (friend.isPrivateGroup) {
                            const res = await getPrivateGroupMessages(convId, 1, 50);
                            const list = res?.data?.messages || res?.messages || [];
                            mapped = list.map(m => {
                              const created = m.createdAt || m.created_at || m.timeStamp || m.timestamp || null;
                              const ts = created ? new Date(created) : new Date();
                              return {
                                id: m.id,
                                senderId: String(m.sender_id) === String(currentUserId) ? 0 : String(m.sender_id),
                                senderImage: m?.sender?.image || null,
                                text: (m.type || m.message_type) === 'IMAGE' ? null : (m.content || m.message || ''),
                                timestamp: isNaN(ts.getTime()) 
                                  ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                type: (m.type || m.message_type) === 'IMAGE' ? 'image' : 'text',
                                file: (m.type || m.message_type) === 'IMAGE' ? (m.content || m.url) : null,
                                status: String(m.sender_id) === String(currentUserId) ? 'sent' : 'delivered',
                              };
                            });
                          } else {
                            const data = await loadPreviousConversation(convId);
                            mapped = (data?.cov_messages || []).map(m => ({
                            id: m.id,
                            senderId: String(m.sender_id) === String(currentUserId) ? 0 : String(m.sender_id),
                            senderImage: m?.sender?.image || null,
                            text: m.type === 'IMAGE' ? null : m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: m.type === 'IMAGE' ? 'image' : 'text',
                            file: m.type === 'IMAGE' ? m.content : null,
                              status: String(m.sender_id) === String(currentUserId) ? 'sent' : 'delivered',
                          }));
                          }
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
                  className={`group p-2 sm:p-3 mx-0.5 sm:mx-1 my-0.5 sm:my-1 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-200 ease-out border border-transparent hover:border-accent/50 hover:bg-accent/40 hover:shadow-md active:scale-[0.99] ${
                    selectedFriend === friend.id ? "bg-gradient-to-r from-accent to-accent/60 border-accent/60 shadow-md" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback className="text-xs">{friend.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <p className={`font-medium text-sm sm:text-[15px] ${(() => {
                         const currentUserId = localStorage.getItem('userId');
                         const isUnread = friend.isRead === false && 
                                         friend.lastMessageFrom && 
                                         String(friend.lastMessageFrom) !== String(currentUserId);
                         return isUnread ? 'font-bold' : '';
                       })()}`}>
                         {friend.name}
                       </p>
                       <div className="flex items-start gap-1 sm:gap-2">
                         <div className="flex flex-col items-end gap-0.5 sm:gap-1 min-w-[36px] sm:min-w-[42px]">
                           <span className="text-[10px] sm:text-[11px] text-muted-foreground tabular-nums">
                             {formatChatTime(friend.lastMessageAt)}
                           </span>
                           {(() => {
                             const currentUserId = localStorage.getItem('userId');
                             const isUnread = friend.isRead === false && 
                                             friend.lastMessageFrom && 
                                             String(friend.lastMessageFrom) !== String(currentUserId);
                             return isUnread ? (
                               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full shadow-[0_0_0_2px_rgba(59,130,246,0.15)] animate-pulse"></div>
                             ) : null;
                           })()}
                    </div>
                          <div className="flex items-center gap-1">
                            {/* Delete/Leave Button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500 hover:text-red-600"
                                    title="Delete conversation"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConversationId(friend.conversationId || friend.id);
                                      setShowDeleteConversationDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{friend.isGroup ? "Leave group" : "Delete conversation"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                       </div>
                    </div>
                     <p className={`text-[11px] sm:text-[12px] truncate ${(() => {
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
                             <span className="flex items-center gap-1 sm:gap-1.5">
                               <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                               <span>Image</span>
                             </span>
                           );
                         }

                         if (isSentByMe && friend.lastMessage) {
                           return (
                             <span className="flex items-center gap-1 sm:gap-1.5">
                               <span>You:</span>
                               <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                                <span>{getHalfPreview(friend.lastMessage)}</span>
                             </span>
                           );
                         }
                          return getHalfPreview(friend.lastMessage || 'Start a conversation');
                       })()}
                    </p>
                  </div>
                </div>
              ))}
              {convosLoaded && filteredFriends.length === 0 && (
                <div className="p-4 sm:p-6 text-xs sm:text-sm text-muted-foreground text-center">
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
                <div className="p-3 sm:p-4 border-b sticky top-0 z-10 bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50 border-purple-100/70">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="ghost" size="icon" className="mr-0.5 sm:mr-1 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/70 hover:bg-white shadow-sm hover:shadow transition-all" onClick={() => {
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
                      <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-purple-700" />
                    </Button>
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      {convosLoaded && (
                        <>
                          <AvatarImage src={friends.find((f) => f.id === selectedFriend)?.avatar} />
                      <AvatarFallback className="text-xs sm:text-sm">
                            {friends.find((f) => f.id === selectedFriend)?.name?.[0] || ''}
                      </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {convosLoaded ? (friends.find((f) => f.id === selectedFriend)?.name || '') : ''}
                      </h3>
                      {convosLoaded && friends.find((f) => f.id === selectedFriend)?.isGroup && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/70 hover:bg-white shadow-sm hover:shadow transition-all"
                                title="Group information"
                                onClick={() => {
                                  const currentFriend = friends.find((f) => f.id === selectedFriend);
                                  console.log('Opening group info for:', {
                                    selectedFriend,
                                    currentFriend,
                                    conversationId: currentFriend?.conversationId,
                                    isGroup: currentFriend?.isGroup,
                                    isPrivateGroup: currentFriend?.isPrivateGroup
                                  });
                                  setSelectedGroupInfo(currentFriend);
                                  setShowGroupInfoModal(true);
                                }}
                              >
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Group information</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-0 py-1 sm:py-2 md:py-3 overflow-y-auto overflow-x-hidden">
                  <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 relative min-h-0 w-full">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,_#8b5cf6_0,_transparent_40%),_radial-gradient(circle_at_80%_10%,_#a78bfa_0,_transparent_35%),_radial-gradient(circle_at_10%_80%,_#6d28d9_0,_transparent_35%),_radial-gradient(circle_at_90%_85%,_#c4b5fd_0,_transparent_40%)]" />
                    {chatLoading && (
                      <div className="h-full w-full flex items-center justify-center py-8 sm:py-10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          <span className="text-xs sm:text-sm">Loading conversation...</span>
                        </div>
                      </div>
                    )}
                    {!chatLoading && (
                      <div className="w-full flex justify-center py-1 sm:py-2">
                        <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                          Chats before 7 days will be deleted automatically
                        </div>
                      </div>
                    )}
                    {!chatLoading && messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-0 sm:gap-0.5 md:gap-1 lg:gap-1.5 xl:gap-2 motion-safe:animate-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 w-full px-1 sm:px-2 min-w-0 ${
                          message.senderId === 0 ? "justify-end" : "justify-start"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {message.senderId !== 0 && (
                          <Avatar className="h-3 w-3 sm:h-4 md:h-5 lg:h-6 xl:h-8 w-3 sm:w-4 md:w-5 lg:w-6 xl:w-8 mt-1 ring-1 sm:ring-2 ring-white shadow-md hover:ring-purple-200 transition-all duration-200 hover:scale-110 flex-shrink-0">
                            <AvatarImage src={message.senderImage || friends.find((f) => f.id === selectedFriend)?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-semibold text-[10px] sm:text-xs md:text-sm">
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
                          <div className={`max-w-[95%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[68%] group flex-shrink-0 w-fit min-w-0`}>
                            <div className={`relative rounded-sm sm:rounded-md md:rounded-lg lg:rounded-xl xl:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
                              message.senderId === 0 
                                ? "border-2 border-purple-300/30 shadow-lg shadow-purple-500/25" 
                                : "border border-gray-200/80 shadow-md shadow-gray-200/60"
                            }`}>
                                <img 
                                  src={message.file} 
                                alt={message.fileName || 'image'} 
                                 className="max-h-28 sm:max-h-32 md:max-h-40 lg:max-h-48 xl:max-h-56 w-full object-cover cursor-pointer hover:brightness-110 transition-all duration-200"
                                onClick={() => setImagePreview({ open: true, url: message.file })}
                              />
                              {deletingMessageId === message.id && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center gap-1 sm:gap-2">
                                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-purple-600" />
                                  <span className="text-xs sm:text-sm text-foreground">Deleting...</span>
                                </div>
                              )}
                            </div>
                             <div className="flex justify-between items-center mt-0.5 sm:mt-1 gap-0.5 sm:gap-1 md:gap-2">
                              <p className={`text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-[11px] font-medium ${message.senderId === 0 ? "text-purple-600" : "text-gray-500"}`}>
                              {message.timestamp}
                            </p>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                                {/* Message Status Icons for images */}
                                {message.senderId === 0 && (
                                  <div className="flex items-center">
                                    {message.status === 'sending' && (
                                      <Clock className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-purple-500 animate-pulse" />
                                    )}
                                    {message.status === 'sent' && (
                                      <Check className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-purple-500" />
                                    )}
                                    {message.status === 'delivered' && (
                                      <CheckCheck className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-purple-500" />
                                    )}
                                    {message.status === 'failed' && (
                                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                        <span className="text-white text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] font-bold">!</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Delete button for images - only show for own messages */}
                                {message.senderId === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 p-0 hover:bg-red-100 text-red-500 hover:scale-110"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[95%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[68%] group relative transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-fit min-w-0 ${
                              message.senderId === 0
                                ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40" 
                                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 shadow-md shadow-gray-200/60 hover:shadow-gray-300/60"
                            } rounded-sm sm:rounded-md md:rounded-lg lg:rounded-xl xl:rounded-2xl px-1 sm:px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2 xl:py-2.5 shadow-sm backdrop-blur-sm`}
                          >
                            {editingMessageId === message.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] bg-white/10 border-white/20 text-white placeholder-white/70"
                                  placeholder="Edit message..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="h-5 px-2 text-[8px] sm:text-[9px] bg-white/20 hover:bg-white/30 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-5 px-2 text-[8px] sm:text-[9px] border-white/20 text-white hover:bg-white/10"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                            <p className="leading-snug text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] font-medium break-words break-all whitespace-pre-wrap min-w-0">{message.text && renderRichText(message.text, message.senderId === 0)}</p>
                            )}
                            {message.text && extractUrls(message.text).length > 0 && (
                              <div className="mt-0.5 sm:mt-1 md:mt-1.5 lg:mt-2 xl:mt-3">
                                {extractUrls(message.text).map((u, i) => (
                                  <LinkCard key={`${message.id}-link-${i}`} url={u} />
                                ))}
                              </div>
                            )}
                            {/* Deleting overlay only for images. None for text messages. */}
                            <div className="flex justify-between items-center mt-0.5 sm:mt-1 gap-0.5 sm:gap-1 md:gap-2">
                              <p className={`text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] font-medium ${message.senderId === 0 ? "text-white/90" : "text-gray-500"}`}>
                              {message.timestamp}
                            </p>
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                {/* Message Status Icons */}
                                {message.senderId === 0 && (
                                  <div className="flex items-center">
                                    {message.status === 'sending' && (
                                      <Clock className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-white/70 animate-pulse" />
                                    )}
                                    {message.status === 'sent' && (
                                      <Check className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-white/70" />
                                    )}
                                    {message.status === 'delivered' && (
                                      <CheckCheck className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 text-white/70" />
                                    )}
                                    {message.status === 'failed' && (
                                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                        <span className="text-white text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] font-bold">!</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Edit and Delete buttons - only show for own messages in private groups */}
                                {message.senderId === 0 && friends.find(f => f.id === selectedFriend)?.isPrivateGroup && (
                                  <>
                                    {/* Edit button - disabled until backend implements PUT /api/private-groups/:groupId/messages/:messageId */}
                                    {/* <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 p-0 hover:bg-white/20 text-white hover:scale-110"
                                      onClick={() => handleEditMessage(message.id, message.text)}
                                    >
                                      <Edit3 className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" />
                                    </Button> */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 p-0 hover:bg-white/20 text-white hover:scale-110"
                                      onClick={() => handleDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" />
                                    </Button>
                                  </>
                                )}
                                {/* Delete button for non-private groups */}
                                {message.senderId === 0 && !friends.find(f => f.id === selectedFriend)?.isPrivateGroup && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 p-0 hover:bg-white/20 text-white hover:scale-110"
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {message.senderId === 0 && (
                            <Avatar className="h-3 w-3 sm:h-4 md:h-5 lg:h-6 xl:h-8 w-3 sm:w-4 md:w-5 lg:w-6 xl:w-8 mt-1 ring-1 sm:ring-2 ring-purple-200 shadow-md hover:ring-purple-300 transition-all duration-200 hover:scale-110 flex-shrink-0 overflow-visible">
                            <AvatarImage src={message.senderImage || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold text-[10px] sm:text-xs md:text-sm">Y</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50 border-purple-100/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {pendingImage && (
                    <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-md border bg-muted/40 max-w-xs">
                      <img src={pendingImage.previewUrl} alt={pendingImage.name} className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{pendingImage.name}</p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground">Will send when you press Send</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs" onClick={() => setPendingImage(null)}>Remove</Button>
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
                        <div className="absolute bottom-14 sm:bottom-16 left-0 z-10">
                          <EmojiPicker 
                            onEmojiClick={handleEmojiClick}
                            width={280}
                            height={320}
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-2 sm:gap-3 items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground"
                          onClick={handleAttachmentClick}
                        >
                          <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
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
                            className="rounded-full pl-3 sm:pl-4 pr-12 sm:pr-16 h-10 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-200 focus:bg-white break-words break-all whitespace-pre-wrap"
                          />
                        </div>
                        
                        <div className="flex gap-2 sm:gap-3">
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
                            className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 transition-all ${
                              newMessage.trim() || pendingImage 
                                ? "bg-purple-500 hover:bg-purple-600 text-white" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            size="icon"
                            disabled={!newMessage.trim() && !pendingImage}
                          >
                            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
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

      {/* Image Preview Modal new */}
      <Dialog open={imagePreview.open} onOpenChange={(o) => setImagePreview(prev => ({ ...prev, open: o }))}>
        <DialogContent className="p-0 bg-white w-auto max-w-none rounded-lg sm:rounded-xl shadow-2xl">
          {imagePreview.url && (
            <img 
              src={imagePreview.url} 
              alt="preview" 
              className="block h-auto w-auto max-w-[98vw] sm:max-w-[95vw] max-h-[85vh] sm:max-h-[90vh] object-contain" 
            />
          )}
        </DialogContent>
      </Dialog>

      

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95vw] sm:w-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteMessage} className="text-xs sm:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Confirmation Dialog */}
      <AlertDialog open={showDeleteConversationDialog} onOpenChange={setShowDeleteConversationDialog}>
        <AlertDialogContent className="w-[95vw] sm:w-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will permanently delete this entire conversation, including images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteConversationDialog(false); setDeleteConversationId(null); }} className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm"
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

      {/* Group Info Modal */}
      <GroupInfoModal
        isOpen={showGroupInfoModal}
        onClose={() => {
          setShowGroupInfoModal(false);
          setSelectedGroupInfo(null);
        }}
        groupId={selectedGroupInfo?.conversationId}
        groupInfo={selectedGroupInfo}
        isAdmin={selectedGroupInfo?.isAdmin || false}
      />
    </div>
  );
}

export default Messages;
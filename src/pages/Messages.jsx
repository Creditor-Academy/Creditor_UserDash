import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Send, Smile, Paperclip, Mic, Plus, Trash2, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { VoiceRecorder } from "@/components/messages/VoiceRecorder";
import { VoiceMessage } from "@/components/messages/VoiceMessage";
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
import { getAllConversations, loadPreviousConversation } from "@/services/messageService";
import getSocket from "@/services/socketClient";

// Will be loaded from backend
const initialAllUsers = [];

function Messages() {
  // conversations shown in the left list (starts empty like Google Chat)
  const [friends, setFriends] = useState([]);
  // directory of all users to start a chat with (shown in + dialog)
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [convosLoaded, setConvosLoaded] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [newChatUsers, setNewChatUsers] = useState([]);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

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
      setRoomId(serverRoomId);
      setConversationId(conversationid);
      setSelectedFriend(String(conversationid));
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
            room: c.room,
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
            text: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
          }));
          setMessages(mapped);
        } catch (e) {
          console.warn('Failed to load previous messages (new)', e);
        }
      })();
    };

    const onReceiveMessage = ({ from, message, image, messageid, conversationid }) => {
      const currentUserId = localStorage.getItem('userId');
      const isSelf = String(from) === String(currentUserId);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          senderId: isSelf ? 0 : String(from),
          text: message,
          senderImage: image || null,
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'text',
        },
      ]);

      // If the incoming message is from someone else and we're inside this conversation, mark it read
      try {
        console.log("conversation id:", conversationid);
        
        if (!isSelf && conversationid && messageid) {
          const s = getSocket();
          s.emit('messageSeenByReceiver', { messageid, conversationid: conversationid });
          console.log("message seen by receiver", messageid, conversationid);
          
        }
      } catch {}
    };

    const onConversationUpdated = (updatePayload) => {
      console.log('Conversation updated:', updatePayload);
      setFriends(prev => {
        const existingIndex = prev.findIndex(f => f.id === updatePayload.id);
        const updatedFriend = {
          id: String(updatePayload.id),
          name: updatePayload.title || 'User',
          avatar: updatePayload.image || '/placeholder.svg',
          lastMessage: updatePayload.lastMessage || '',
          room: updatePayload.room,
          conversationId: updatePayload.id,
          isRead: updatePayload.isRead,
          lastMessageFrom: updatePayload.lastMessageFrom,
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
          ? { ...f, isRead: true }
          : f
      )));
    };
    socket.on('messagesRead', onMessagesRead);
    socket.on('conversationUpdated', onConversationUpdated);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomidforsender', onRoomIdForSender);
      socket.off('receiveMessage', onReceiveMessage);
      socket.off('messagesRead', onMessagesRead);
      socket.off('conversationUpdated', onConversationUpdated);
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
          room: c.room,
          conversationId: c.id,
          isRead: c.isRead,
          lastMessageFrom: c.lastMessageFrom,
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
    if (!newMessage.trim()) return;
    if (!roomId || !conversationId) {
      console.warn('Messages: cannot send, missing roomId or conversationId');
      return;
    }
    try {
      const socket = getSocket();
      socket.emit('sendMessage', { conversationid: conversationId, roomId, message: newMessage });
      setNewMessage("");
    } catch (error) {
      console.warn('Messages: failed to send message', error);
    }
  };

  const handleSendVoiceMessage = (audioBlob, duration) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: 0,
        audioBlob,
        audioDuration: duration,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'voice',
      },
    ]);
    setShowVoiceRecorder(false);
  };

  const handleSendAttachment = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          senderId: 0,
          file: e.target.result,
          fileName: file.name,
          fileType: file.type.startsWith('image/') ? 'image' : 'video',
          timestamp: new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'attachment',
        },
      ]);
    };
    
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
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

  const confirmDeleteMessage = () => {
    if (deleteMessageId) {
      setMessages(prev => prev.filter(msg => msg.id !== deleteMessageId));
      // TODO: Emit socket event to delete message on backend
      // socket.emit('deleteMessage', { messageId: deleteMessageId, conversationId, roomId });
    }
    setShowDeleteDialog(false);
    setDeleteMessageId(null);
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
      return inSearch && !engagedUserIds.has(String(user.id));
    });
  })();

  return (
    <div className="container py-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="h-[calc(100vh-160px)]">
          {/* Single-section layout: show list OR chat, not both */}
          {!selectedFriend && (
          <div className="w-full flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Messages</h2>
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
                        className="pl-8"
                        value={newChatSearch}
                        onChange={(e) => setNewChatSearch(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredNewChatUsers.map((user) => (
                          <div 
                            key={user.id}
                            className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                            onClick={() => {
                              // Do not optimistically mutate list; rely on backend fetch
                              const socket = getSocket();
                              socket.emit("startConversation", { to: user.id });
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    // Open existing conversation: join its room and set IDs
                    const socket = getSocket();
                    if (friend.room) {
                      const convId = friend.conversationId || friend.id;
                      setRoomId(friend.room);
                      setConversationId(convId);
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
                            text: m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: 'text',
                          }));
                          setMessages(mapped);
                        } catch (e) {
                          console.warn('Failed to load previous messages', e);
                        }
                      })();
                    }
                    setSelectedFriend(friend.id);
                  }}
                  className={`p-4 flex items-center gap-3 hover:bg-accent cursor-pointer transition-colors border-b ${
                    selectedFriend === friend.id ? "bg-accent" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center">
                       <p className="font-medium">{friend.name}</p>
                       {(() => {
                         const currentUserId = localStorage.getItem('userId');
                         const isUnread = friend.isRead === false && 
                                         friend.lastMessageFrom && 
                                         String(friend.lastMessageFrom) !== String(currentUserId);
                         return isUnread ? (
                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                         ) : null;
                       })()}
                     </div>
                     <p className="text-sm text-muted-foreground truncate">
                       {friend.lastMessage || 'Start a conversation'}
                     </p>
                   </div>
                </div>
              ))}
              {filteredFriends.length === 0 && (
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
                <div className="p-4 border-b bg-muted/30 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="mr-1" onClick={() => setSelectedFriend(null)} title="Back to chats">
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
                <ScrollArea className="flex-1 px-4 py-6 overflow-y-auto">
                  <div className="space-y-5">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          message.senderId === 0 ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.senderId !== 0 && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.senderImage || friends.find((f) => f.id === selectedFriend)?.avatar} />
                            <AvatarFallback>
                              {friends.find((f) => f.id === selectedFriend)?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {message.type === 'voice' && message.audioBlob ? (
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
                        ) : message.type === 'attachment' ? (
                          <div className="max-w-[68%]">
                            <div className={`rounded-xl overflow-hidden shadow-sm ${
                              message.senderId === 0 
                                ? "border border-primary/20" 
                                : "border border-muted"
                            }`}>
                              {message.fileType === 'image' ? (
                                <img 
                                  src={message.file} 
                                  alt={message.fileName} 
                                  className="max-h-64 object-cover"
                                />
                              ) : (
                                <video 
                                  src={message.file} 
                                  controls 
                                  className="max-h-64"
                                />
                              )}
                            </div>
                            <p className="text-xs mt-1 opacity-70 text-right">
                              {message.timestamp}
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`max-w-[68%] group relative ${
                              message.senderId === 0 ? "bg-gradient-to-tr from-purple-500 to-purple-600 text-white" : "bg-white border border-muted/60"
                            } rounded-2xl px-4 py-3 shadow-sm`}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                            <div className="flex justify-between items-center mt-1 gap-3">
                              <p className={`text-[11px] ${message.senderId === 0 ? "text-white/80" : "text-muted-foreground"}`}>
                                {message.timestamp}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${message.senderId === 0 ? "hover:bg-white/15 text-white" : "hover:bg-destructive hover:text-destructive-foreground"}`}
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {message.senderId === 0 && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.senderImage || undefined} />
                            <AvatarFallback>Y</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*, video/*"
                    className="hidden"
                  />
                  
                  {showVoiceRecorder ? (
                    <VoiceRecorder 
                      onSendVoiceMessage={handleSendVoiceMessage}
                      onCancel={() => setShowVoiceRecorder(false)}
                    />
                  ) : (
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
                            className="rounded-full pl-4 pr-20 h-12 text-base bg-gray-100 border-gray-200 focus:bg-white"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setShowVoiceRecorder(true)} 
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full"
                          >
                            <Mic className="h-5 w-5" />
                          </Button>
                          
                          <Button 
                            onClick={handleSendMessage} 
                            className={`rounded-full h-12 w-12 transition-all ${
                              newMessage.trim() 
                                ? "bg-purple-500 hover:bg-purple-600 text-white" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                            size="icon"
                            disabled={!newMessage.trim()}
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
    </div>
  );
}

export default Messages;
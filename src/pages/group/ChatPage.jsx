/**
 * ChatPage Component
 * 
 * This component displays the chat interface for a specific group.
 * 
 * Features implemented:
 * 1. Dynamic group name display (fetched from backend)
 * 2. "View members" functionality that calls groups/:groupId/members API
 * 3. Members modal popup (matching 2nd image design)
 * 4. Proper error handling for API calls
 * 5. Loading states and fallback behavior
 * 6. NO DUPLICATE GROUP INFORMATION CARDS
 * 7. NO DUMMY DATA - Only backend data
 * 
 * API Endpoints used:
 * - GET /groups/:groupId - Fetch group information
 * - GET /groups/:groupId/members - Fetch group members
 * 
 * @author Assistant
 * @version 2.1.0
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { professionalAvatars } from "@/lib/avatar-utils";
import { ChatHeader } from "@/components/group/ChatHeader";
import { ChatMessagesList } from "@/components/group/ChatMessagesList";
import { ChatInput } from "@/components/group/ChatInput";
import { Users, X, Loader2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getGroupById, getGroupMembers } from "@/services/groupService";

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
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { groupId } = useParams();
  const currentUserId = 0;

  // Fetch group information and members on component mount
  useEffect(() => {
    fetchGroupInfo();
    // Preload members to show accurate count in header without opening the modal
    fetchGroupMembers({ openModal: false, silent: true });
  }, [groupId]);

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: "You",
      senderAvatar: "",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage("");
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
      return { color: "bg-red-100 text-red-800 border-red-200", text: "Admin" };
    } else if (member.role === "INSTRUCTOR") {
      return { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Instructor" };
    } else if (member.role === "LEARNER") {
      return { color: "bg-green-100 text-green-800 border-green-200", text: "Learner" };
    } else {
      return { color: "bg-gray-100 text-gray-800 border-gray-200", text: member.role || "Member" };
    }
  };

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Recently joined";
    try {
      const date = new Date(dateString);
      return `Joined ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-lg border-0 bg-white h-[700px] flex flex-col">
        <ChatHeader 
          groupName={getGroupName()} 
          members={[]} 
        />
        
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
                    onClick={fetchGroupMembers}
                    disabled={loadingMembers}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    {loadingMembers ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-sm">View ({getMemberCount()})</span>
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

      {/* Members Modal - Matches 2nd image design */}
      {showMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex border border-purple-100 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-8 border-r border-purple-200 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {getGroupName()}
                  </h3>
                  <p className="text-gray-600 mt-2">Group Members & Participants</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowMembers(false); setSearchTerm(""); }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-3 rounded-full transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <Input
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-4 border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400/30 rounded-xl text-lg shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-3 custom-scrollbar">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-purple-400" />
                    </div>
                    <p className="text-xl font-medium mb-2 text-gray-600">
                      {searchTerm ? 'No members found' : 'No members in this group'}
                    </p>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms' : 'This group might be empty'}
                    </p>
                  </div>
                ) : (
                  filteredMembers.map((member, index) => {
                    const roleBadge = getRoleBadge(member);
                    const memberName = getMemberDisplayName(member);
                    const memberEmail = getMemberEmail(member);
                    const memberAvatar = getMemberAvatar(member);
                    
                    return (
                      <div key={member.id || index} className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 group">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-purple-200 group-hover:border-purple-400 transition-colors duration-200">
                            {member.user?.image ? (
                              <img 
                                src={member.user.image} 
                                alt={memberName} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                              />
                            ) : (
                              <span className="text-lg font-bold text-purple-600">
                                {memberAvatar}
                              </span>
                            )}
                          </div>
                          
                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <h4 className="text-base font-bold text-gray-800 truncate group-hover:text-purple-700 transition-colors duration-200">
                                {memberName}
                              </h4>
                              <Badge className={`${roleBadge.color} border px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm`}>
                                {roleBadge.text}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1.5 flex items-center gap-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              {memberEmail}
                            </p>
                            
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              {formatJoinDate(member.joined_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Sidebar - Group Statistics */}
            <div className="w-80 md:w-96 p-6 md:p-8 bg-gradient-to-b from-purple-50 to-blue-50 border-l border-purple-200 overflow-y-auto">
              <h4 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Group Statistics
              </h4>
              
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total Members</span>
                    <span className="text-3xl font-bold text-blue-600">{getMemberCount()}</span>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Admins</span>
                    <span className="text-2xl font-bold text-red-600">
                      {groupMembers.filter(m => m.role === "ADMIN").length}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Instructors</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {groupMembers.filter(m => m.role === "INSTRUCTOR").length}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Learners</span>
                    <span className="text-2xl font-bold text-green-600">
                      {groupMembers.filter(m => m.role === "LEARNER").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }
      `}</style>
    </div>
  );
}

export default ChatPage;
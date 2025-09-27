import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  Plus, 
  Search, 
  Crown,
  Trash2,
  Loader2,
  Check,
  ArrowLeft,
  Edit3,
  Save,
  Upload,
  Link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Private group APIs will be added separately
import { fetchAllUsers } from "@/services/userService";
import { toast } from "sonner";

export default function GroupInfoModal({ isOpen, onClose, groupId, groupInfo, isAdmin = false }) {
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(groupInfo || null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [removing, setRemoving] = useState(null);
  const [promoting, setPromoting] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  
  // Editing states
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempAvatarUrl, setTempAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupData();
    }
  }, [isOpen, groupId]);

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with private group APIs
      // const [groupRes, membersRes] = await Promise.all([
      //   getPrivateGroupById(groupId),
      //   getPrivateGroupMembers(groupId)
      // ]);
      
      // Mock data for now
      setGroup(groupInfo || null);
      setMembers([]); // TODO: Load from private group API
      
      // Initialize temp values for editing
      setTempName(groupInfo?.name || "");
      setTempDescription(groupInfo?.description || "");
      setTempAvatarUrl(groupInfo?.thumbnail || "");
    } catch (error) {
      console.error("Error loading group data:", error);
      toast.error("Failed to load group information");
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!isAdmin) return;
    
    try {
      setRemoving(memberId);
      // TODO: Replace with private group API
      // await removePrivateGroupMember(groupId, memberId);
      console.log("Remove member from private group:", { groupId, memberId, memberName });
      setMembers(prev => prev.filter(m => (m.user?.id || m.user_id || m.id) !== memberId));
      toast.success(`${memberName} removed from group`);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setRemoving(null);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    try {
      setPromoting(userId);
      // TODO: Replace with private group API
      // await promotePrivateGroupAdmin({ groupId, userId });
      console.log("Promote to admin in private group:", { groupId, userId });
      setMembers(prev => prev.map(m => 
        (m.user?.id || m.user_id || m.id) === userId 
          ? { ...m, role: 'ADMIN', is_admin: true }
          : m
      ));
      toast.success("User promoted to admin");
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    } finally {
      setPromoting(null);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.size === 0) return;
    
    try {
      setAdding(true);
      // TODO: Replace with private group API
      // await addPrivateGroupMembers(groupId, Array.from(selectedUsers));
      console.log("Add members to private group:", { groupId, userIds: Array.from(selectedUsers) });
      
      // Refresh members list
      // const membersRes = await getPrivateGroupMembers(groupId);
      // const membersData = membersRes?.data || membersRes || [];
      // setMembers(Array.isArray(membersData) ? membersData : (membersData.members || []));
      
      setSelectedUsers(new Set());
      setShowAddMembers(false);
      setSearchTerm("");
      toast.success(`${selectedUsers.size} members added to group`);
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) return;
    
    try {
      setDeletingGroup(true);
      // TODO: Replace with private group API
      // await deletePrivateGroup(groupId);
      console.log("Delete private group:", { groupId });
      toast.success("Group deleted successfully");
      onClose();
      // You might want to add a callback to refresh the parent component
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setDeletingGroup(false);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    
    try {
      setSaving(true);
      // TODO: Replace with private group API
      // await updatePrivateGroup(groupId, { name: tempName.trim() });
      console.log("Update private group name:", { groupId, name: tempName.trim() });
      setGroup(prev => ({ ...prev, name: tempName.trim() }));
      setEditingName(false);
      toast.success("Group name updated successfully");
    } catch (error) {
      console.error("Error updating group name:", error);
      toast.error("Failed to update group name");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    try {
      setSaving(true);
      // TODO: Replace with private group API
      // await updatePrivateGroup(groupId, { description: tempDescription.trim() });
      console.log("Update private group description:", { groupId, description: tempDescription.trim() });
      setGroup(prev => ({ ...prev, description: tempDescription.trim() }));
      setEditingDescription(false);
      toast.success("Group description updated successfully");
    } catch (error) {
      console.error("Error updating group description:", error);
      toast.error("Failed to update group description");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      setSaving(true);
      const updateData = {};
      
      if (avatarFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('thumbnail', avatarFile);
        formData.append('banner', avatarFile);
        formData.append('image_url', avatarFile);
        formData.append('imageUrl', avatarFile);
        formData.append('image', avatarFile);
        
        // TODO: Replace with private group API
        // const response = await updatePrivateGroup(groupId, formData);
        console.log("Update private group avatar (file):", { groupId, formData });
        setGroup(prev => ({ ...prev, thumbnail: URL.createObjectURL(avatarFile) }));
      } else if (tempAvatarUrl.trim()) {
        // Handle URL
        updateData.thumbnail = tempAvatarUrl.trim();
        updateData.banner = tempAvatarUrl.trim();
        updateData.image_url = tempAvatarUrl.trim();
        updateData.imageUrl = tempAvatarUrl.trim();
        updateData.image = tempAvatarUrl.trim();
        
        // TODO: Replace with private group API
        // await updatePrivateGroup(groupId, updateData);
        console.log("Update private group avatar (URL):", { groupId, updateData });
        setGroup(prev => ({ ...prev, thumbnail: tempAvatarUrl.trim() }));
      }
      
      setEditingAvatar(false);
      setAvatarFile(null);
      setAvatarPreview("");
      setTempAvatarUrl("");
      toast.success("Group avatar updated successfully");
    } catch (error) {
      console.error("Error updating group avatar:", error);
      toast.error("Failed to update group avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setTempAvatarUrl("");
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '';
    const email = user.email || '';
    const search = searchTerm.toLowerCase();
    return (name.toLowerCase().includes(search) || email.toLowerCase().includes(search)) &&
           !members.some(m => (m.user?.id || m.user_id || m.id) === user.id);
  });

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Group Info</h2>
                <p className="text-sm text-gray-500">View group details and manage members</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading group info...</span>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Group Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-500 text-2xl font-bold">
                      {editingAvatar ? (
                        avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Preview"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : group?.thumbnail ? (
                          <img 
                            src={group.thumbnail} 
                            alt={group.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-12 w-12 text-gray-400" />
                        )
                      ) : group?.thumbnail ? (
                        <img 
                          src={group.thumbnail} 
                          alt={group.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
                        onClick={() => setEditingAvatar(!editingAvatar)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Group Name and Description */}
                <div className="text-center space-y-2">
                  {editingName ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="text-center text-2xl font-bold max-w-xs"
                        placeholder="Group name"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={saving || !tempName.trim()}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingName(false);
                          setTempName(group?.name || "");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-2xl font-bold text-gray-900">{group?.name || "Unnamed Group"}</h3>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingName(true)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {editingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        placeholder="Group description"
                        className="text-center resize-none max-w-md mx-auto"
                        rows={2}
                      />
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveDescription}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDescription(false);
                            setTempDescription(group?.description || "");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {group?.description ? (
                        <p className="text-gray-600">{group.description}</p>
                      ) : (
                        <p className="text-gray-400 italic">No description</p>
                      )}
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingDescription(true)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Avatar Editing Section */}
                {editingAvatar && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Update Group Avatar</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("avatar-file-input")?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Choose File
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview("");
                          }}
                          className="flex items-center gap-2"
                        >
                          <Link className="h-4 w-4" />
                          Use URL
                        </Button>
                      </div>
                      
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      
                      {!avatarFile && (
                        <Input
                          placeholder="Enter image URL"
                          value={tempAvatarUrl}
                          onChange={(e) => setTempAvatarUrl(e.target.value)}
                        />
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveAvatar}
                          disabled={saving || (!avatarFile && !tempAvatarUrl.trim())}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAvatar(false);
                            setAvatarFile(null);
                            setAvatarPreview("");
                            setTempAvatarUrl("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Members ({members.length})</h3>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleDeleteGroup}
                          disabled={deletingGroup}
                          className="flex items-center gap-2"
                        >
                          {deletingGroup ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete Group
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowAddMembers(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Members
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Add Members Modal */}
                  {showAddMembers && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Add Members</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setShowAddMembers(false);
                              setSelectedUsers(new Set());
                              setSearchTerm("");
                            }}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="flex-1"
                          />
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white rounded">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.image || user.avatar} />
                                  <AvatarFallback className="text-sm">
                                    {(user.first_name?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleUserSelection(user.id)}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                  selectedUsers.has(user.id)
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-300'
                                }`}
                              >
                                {selectedUsers.has(user.id) && <Check className="h-4 w-4" />}
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddMembers}
                            disabled={adding || selectedUsers.size === 0}
                          >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add {selectedUsers.size} Members
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddMembers(false);
                              setSelectedUsers(new Set());
                              setSearchTerm("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members List */}
                  <div className="space-y-2">
                    {members.map((member) => {
                      const user = member.user || member;
                      const memberIsAdmin = member.role === 'ADMIN' || member.is_admin === true;
                      const memberId = user.id || member.user_id || member.id;
                      const memberName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || user.email || 'Unknown User';
                      
                      return (
                        <div key={memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image || user.avatar} />
                              <AvatarFallback className="text-sm">
                                {(user.first_name?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{memberName}</p>
                                {memberIsAdmin && (
                                  <Crown className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isAdmin && !memberIsAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveMember(memberId, memberName)}
                                disabled={removing === memberId}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {removing === memberId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

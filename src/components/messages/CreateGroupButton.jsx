import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchAllUsers } from "@/services/userService";
import { getAllConversations } from "@/services/messageService";
import { createGroup, addGroupMember } from "@/services/groupService";

/**
 * CreateGroupButton
 * - Self-contained button + modal to create a messaging group
 * - Enforces one-group-per-user rule via conversations check
 * - On success, invokes optional onCreated callback with { id, name, memberCount, ... }
 */
export default function CreateGroupButton({ className = "h-8 w-8", onCreated }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loadingInit, setLoadingInit] = useState(false);
  const [userHasGroup, setUserHasGroup] = useState(false);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [useUrl, setUseUrl] = useState(false);

  // Directory state
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'admin' | 'instructor'

  // Derived
  const filteredUsers = useMemo(() => {
    const q = (search || "").toLowerCase();
    const roleMatches = (u) => {
      if (roleFilter === "all") return true;
      const role = String(u.role || "").toLowerCase();
      if (roleFilter === "admin") return role.includes("admin");
      if (roleFilter === "instructor") return role.includes("instructor");
      return true;
    };
    return (allUsers || [])
      .filter(u => roleMatches(u))
      .filter(u => (u.name || "").toLowerCase().includes(q) && !selectedMemberIds.includes(u.id));
  }, [allUsers, search, selectedMemberIds, roleFilter]);

  // Initialize on first open: fetch conversations + users
  const handleOpen = async (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) return;
    setLoadingInit(true);
    try {
      const [convos, users] = await Promise.all([
        getAllConversations().catch(() => []),
        fetchAllUsers().catch(() => []),
      ]);
      // Heuristic: mark hasGroup if conversation objects include isGroup truthy
      const hasGroup = Array.isArray(convos) && convos.some(c => c?.isGroup);
      setUserHasGroup(Boolean(hasGroup));
      const currentUserId = String(localStorage.getItem('userId') || '');
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
          name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.name || u.email || "User",
          avatar: u.image || u.avatar || "/placeholder.svg",
          role: userRole,
        };
      }).filter(u => u.id && String(u.id) !== currentUserId); // Exclude current user
      setAllUsers(normalized);
    } finally {
      setLoadingInit(false);
    }
  };

  const toggleMember = (userId) => {
    setSelectedMemberIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMemberIds([]);
    setSearch("");
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageDataUrl("");
    setImageUrl("");
    setUseUrl(false);
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMemberIds.length === 0) {
      toast({ title: "Error", description: "Add a name and at least one member", variant: "destructive" });
      return;
    }
    if (userHasGroup) {
      toast({ title: "Limit reached", description: "You can only create one group", variant: "destructive" });
      return;
    }
    setIsCreatingGroup(true);
    try {
      const payload = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        type: "messaging",
        is_private: false,
        ...(useUrl && imageUrl.trim() ? { thumbnail: imageUrl.trim() } : {}),
        ...(!useUrl && imageDataUrl ? { thumbnail: imageDataUrl } : {}),
      };
      const res = await createGroup(payload);
      if (!(res?.success && res?.data?.id)) throw new Error(res?.message || "Failed to create group");
      const groupId = res.data.id;
      for (const uid of selectedMemberIds) {
        try { await addGroupMember(groupId, uid); } catch {}
      }
      const created = {
        id: `group_${groupId}`,
        name: groupName.trim(),
        memberCount: selectedMemberIds.length + 1,
        isGroup: true,
        isAdmin: true,
        conversationId: groupId,
        room: groupId,
        lastMessage: "Group created",
        lastMessageType: "system",
        lastMessageFrom: "System",
        lastMessageAt: new Date().toISOString(),
        avatar: "/placeholder.svg",
      };
      toast({ title: "Group created" });
      if (typeof onCreated === "function") {
        try { onCreated(created); } catch {}
      }
      resetForm();
      setOpen(false);
    } catch (err) {
      toast({ title: "Error", description: err?.message || "Failed to create group", variant: "destructive" });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`${className} ${userHasGroup ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Create Group"
              onClick={() => !userHasGroup && handleOpen(true)}
              disabled={userHasGroup}
            >
              <Users className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userHasGroup ? "You can only create one group" : "Create Group"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[720px] max-w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create New Group
            </DialogTitle>
          </DialogHeader>

          {loadingInit ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name *</label>
                <Input
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Group Image Upload Section (Always visible) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Image (Optional)</label>
                
                {/* Toggle between URL and File Upload */}
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    type="button"
                    variant={!useUrl ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => {
                      setUseUrl(false);
                      setImageUrl("");
                    }}
                  >
                    Choose File
                  </Button>
                  <Button
                    type="button"
                    variant={useUrl ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => {
                      setUseUrl(true);
                      // Clear file upload when switching to URL
                      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                      setImageFile(null);
                      setImagePreviewUrl("");
                      setImageDataUrl("");
                      const el = document.getElementById("group-image-input");
                      if (el) { try { el.value = ""; } catch {} }
                    }}
                  >
                    Use URL
                  </Button>
                </div>

                <input
                  id="group-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageFile(file);
                    const objectUrl = URL.createObjectURL(file);
                    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                    setImagePreviewUrl(objectUrl);
                    const reader = new FileReader();
                    reader.onload = () => {
                      try { setImageDataUrl(String(reader.result || "")); } catch {}
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                
                {!useUrl ? (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => document.getElementById("group-image-input")?.click()}
                    className="w-full"
                  >
                    Choose File
                  </Button>
                ) : (
                  <Input
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-9"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  placeholder="Enter group description..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Add Members *</label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant={roleFilter === "admin" ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setRoleFilter(prev => prev === "admin" ? "all" : "admin")}
                      title="Show only Admins"
                    >
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant={roleFilter === "instructor" ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setRoleFilter(prev => prev === "instructor" ? "all" : "instructor")}
                      title="Show only Instructors"
                    >
                      Instructors
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={roleFilter === "all" ? "Search users to add..." : `Search ${roleFilter}s...`}
                    className="pl-8 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Selected Members - Scrollable */}
              {selectedMemberIds.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Members ({selectedMemberIds.length})</label>
                  <div className="max-h-[92px] overflow-y-auto no-scrollbar border rounded p-1 flex flex-wrap gap-2">
                    {selectedMemberIds.map((memberId) => {
                      const m = allUsers.find(u => u.id === memberId);
                      if (!m) return null;
                      return (
                        <div key={memberId} className="flex-shrink-0 flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback className="text-xs">{m.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <span>{m.name}</span>
                          <button onClick={() => toggleMember(memberId)} className="text-primary/70 hover:text-primary">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Available Users</label>
                <ScrollArea className="h-48 border rounded-md">
                  <div className="space-y-1 p-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent"
                        onClick={() => toggleMember(user.id)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.role || "User"}</div>
                        </div>
                        <Checkbox
                          checked={selectedMemberIds.includes(user.id)}
                          onChange={() => toggleMember(user.id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => { resetForm(); setOpen(false); }}
                  disabled={isCreatingGroup}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreatingGroup || !groupName.trim() || selectedMemberIds.length === 0}
                  className="flex items-center gap-2"
                >
                  {isCreatingGroup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Create Group
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

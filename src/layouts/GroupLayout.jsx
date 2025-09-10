import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Bell, MessageCircle, Users, ArrowLeft, Plus, User as UserIcon, X, Upload, File as FileIcon, Image as ImageIcon, Video as VideoIcon, FileText as FileTextIcon, Eye, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getGroupById } from "@/services/groupService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createGroupPost, createAnnouncement, deleteGroupById, isUserGroupAdmin } from "@/services/groupService";
import GroupAdminModal from "@/components/modals/GroupAdminModal";

export function GroupLayout() {
  const location = useLocation();
  const { groupId } = useParams();
  const currentPath = location.pathname;
  const activeTab = currentPath.split('/').pop() || 'news';
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const { isInstructorOrAdmin } = useAuth();
  const plusBtnRef = useRef(null);
  const [originOffset, setOriginOffset] = useState({ x: 120, y: 120 });
  const [showProfileActions, setShowProfileActions] = useState(false);
  const profileHoverTimerRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [postForm, setPostForm] = useState({
    type: "POST",
    title: "",
    content: "",
    media_url: "",
    is_pinned: false,
  });
  const [createType, setCreateType] = useState('POST'); // POST | ANNOUNCEMENT
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'text/plain', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported. Please upload images, videos, or documents.');
      return;
    }

    setIsUploading(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFile({ file, url: fileUrl, name: file.name, size: file.size, type: file.type });
      toast.success('File selected successfully!');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Fetch group details to get the actual name
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        const response = await getGroupById(groupId);
        if (response.success && response.data) {
          setGroupName(response.data.name);
        } else {
          setGroupName(`Group ${groupId}`);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setGroupName(`Group ${groupId}`);
        toast.error("Failed to load group details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupDetails();
  }, [groupId]);
  
  const tabs = [
    { 
      label: "News", 
      icon: MessageSquare, 
      path: `/dashboard/groups/${groupId}/news` 
    },
    {
      label: "Members",
      icon: Users,
      path: `/dashboard/groups/${groupId}/members`
    },
    { 
      label: "Chat", 
      icon: MessageCircle, 
      path: `/dashboard/groups/${groupId}/chat` 
    },
    { 
      label: "Announcements", 
      icon: Bell, 
      path: `/dashboard/groups/${groupId}/announcements` 
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-gray-600 hover:text-gray-800"
            >
              <Link to="/dashboard/groups">
                <ArrowLeft className="h-4 w-4" />
                Back to Groups
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {loading ? "Loading..." : groupName}
              </h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-4">
        {/* Sub navigation tabs */}
        <Tabs value={activeTab} className="mb-6">
          <TabsList className="w-full inline-flex gap-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.path}
                value={tab.path.split('/').pop() || ''}
                className={cn(
                  "flex items-center gap-2 flex-1 justify-center",
                  currentPath === tab.path ? "bg-primary text-primary-foreground" : ""
                )}
                asChild
              >
                <Link to={tab.path}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Content area */}
        <div className="bg-card rounded-lg p-4 shadow-sm min-h-[80vh]">
          <Outlet />
        </div>
      </div>

      {/* Floating controls (visible only to instructors/admins) */}
      {isInstructorOrAdmin() && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center rounded-full bg-white border border-gray-200 shadow-2xl px-2 py-2 gap-2">
            <button
              type="button"
              className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow flex items-center justify-center"
              aria-label="Create"
              ref={plusBtnRef}
              onClick={() => { 
                setSelectedGroupId(groupId || null); 
                try {
                  const rect = plusBtnRef.current?.getBoundingClientRect();
                  if (rect) {
                    const btnCx = rect.left + rect.width / 2;
                    const btnCy = rect.top + rect.height / 2;
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    setOriginOffset({ x: btnCx - centerX, y: btnCy - centerY });
                  }
                } catch {}
                setShowCreateModal(true); 
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
            <div 
              className="relative"
              onMouseEnter={() => {
                if (profileHoverTimerRef.current) clearTimeout(profileHoverTimerRef.current);
                setShowProfileActions(true);
              }}
              onMouseLeave={() => {
                if (profileHoverTimerRef.current) clearTimeout(profileHoverTimerRef.current);
                profileHoverTimerRef.current = setTimeout(() => setShowProfileActions(false), 120);
              }}
            >
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex flex-col items-center gap-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-200 ${showProfileActions ? 'opacity-100 translate-y-0 pointer-events-auto' : ''}`}>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
                  aria-label="View group admin"
                  onClick={() => setShowAdminModal(true)}
                >
                  <Eye className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow hover:bg-red-50 flex items-center justify-center"
                  aria-label="Delete group"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <button
                type="button"
                className="h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-inner flex items-center justify-center"
                aria-label="Profile"
              >
                <UserIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <GroupAdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} groupId={groupId} />

      {/* Delete Group Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h4 className="text-sm font-semibold text-gray-900">Delete Group</h4>
              </div>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 text-sm text-gray-700">
              Are you sure you want to delete this group? This action cannot be undone. Only group admins or instructors can delete a group.
            </div>
            <div className="p-4 pt-0 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-gray-300" disabled={isDeleting}>Cancel</Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  try {
                    const id = groupId;
                    if (!id) { toast.error('Group id not found'); return; }
                    setIsDeleting(true);
                    // permission check: instructor/admin or group admin
                    const allowed = isInstructorOrAdmin() || await isUserGroupAdmin(id);
                    if (!allowed) {
                      toast.error("You don't have permission to delete this group.");
                      return;
                    }
                    await deleteGroupById(id);
                    toast.success('Group deleted');
                    window.location.href = '/dashboard/groups';
                  } catch (err) {
                    if (err?.response?.status === 403) {
                      toast.error("Forbidden: Only group admins or instructors can delete this group.");
                    } else {
                      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete group');
                    }
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Single Create Modal (Post or Announcement) */}
      <AnimatePresence>
      {showCreateModal && (
        <motion.div 
          className="fixed inset-0 z-[60] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200/60 ring-1 ring-black/5 w-full max-w-md max-h-[90vh] overflow-y-auto origin-bottom-right"
              initial={{ opacity: 0, scale: 0.5, y: originOffset.y, x: originOffset.x }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: originOffset.y, x: originOffset.x }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                {createType === 'POST' ? (
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Bell className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">Create {createType === 'POST' ? 'Post' : 'Announcement'}</h3>
                  <p className="text-xs text-gray-500">Share updates with your group</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setPostForm({ type: "POST", title: "", content: "", media_url: "", is_pinned: false });
                  if (uploadedFile?.url) URL.revokeObjectURL(uploadedFile.url);
                  setUploadedFile(null);
                  setCreateType('POST');
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              {/* Type Switcher */}
              <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-5 border border-gray-200">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${createType === 'POST' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-700'}`}
                  onClick={() => setCreateType('POST')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Post
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${createType === 'ANNOUNCEMENT' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-700'}`}
                  onClick={() => setCreateType('ANNOUNCEMENT')}
                >
                  <Bell className="h-4 w-4" />
                  Announcement
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedGroupId) { toast.error("No group selected"); return; }
                  setPostSubmitting(true);
                  try {
                    if (createType === 'POST') {
                      let payload;
                      if (uploadedFile) {
                        const formData = new FormData();
                        formData.append('group_id', selectedGroupId);
                        formData.append('type', 'POST');
                        if (postForm.title) formData.append('title', postForm.title);
                        formData.append('content', postForm.content);
                        formData.append('media', uploadedFile.file);
                        formData.append('is_pinned', postForm.is_pinned);
                        payload = formData;
                      } else {
                        payload = {
                          group_id: selectedGroupId,
                          type: 'POST',
                          title: postForm.title ? postForm.title : null,
                          content: postForm.content,
                          media_url: postForm.media_url ? postForm.media_url : null,
                          is_pinned: !!postForm.is_pinned,
                        };
                      }
                      const res = await createGroupPost(payload);
                      if (!res?.success) throw new Error(res?.message || 'Failed to create post');
                      toast.success('Post created successfully');
                    } else {
                      // Announcement path
                      const announcementData = {
                        title: postForm.title,
                        content: postForm.content,
                        media: uploadedFile?.file || null,
                      };
                      const res = await createAnnouncement(selectedGroupId, announcementData);
                      if (!res?.success) throw new Error(res?.message || 'Failed to create announcement');
                      toast.success('Announcement created successfully');
                    }
                    setShowCreateModal(false);
                    setPostForm({ type: 'POST', title: '', content: '', media_url: '', is_pinned: false });
                    if (uploadedFile?.url) URL.revokeObjectURL(uploadedFile.url);
                    setUploadedFile(null);
                    setCreateType('POST');
                  } catch (err) {
                    toast.error(err?.response?.data?.message || err?.message || 'Failed to create post');
                  } finally {
                    setPostSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Title (optional)</label>
                  <Input
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder={createType === 'POST' ? 'Enter a post title (optional)' : 'Enter an announcement title (optional)'}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Content *</label>
                  <Textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder={createType === 'POST' ? 'Write your post...' : 'Write your announcement...'}
                    rows={4}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Attach File (optional)</label>
                  {!uploadedFile ? (
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files.length > 0) handleFileUpload(files[0]);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                      onClick={() => document.getElementById('gl-file-upload')?.click()}
                    >
                      <input
                        id="gl-file-upload"
                        type="file"
                        onChange={(e) => { const files = e.target.files; if (files && files.length > 0) handleFileUpload(files[0]); }}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                        disabled={isUploading}
                      />
                      <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">Images, videos, PDFs, documents (max 10MB)</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">
                            {getFileIcon(uploadedFile.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[220px]">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.type.startsWith('image/') && (
                            <img src={uploadedFile.url} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { if (uploadedFile?.url) URL.revokeObjectURL(uploadedFile.url); setUploadedFile(null); }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {createType === 'POST' && (
                    <div className="mt-3">
                      <details className="group">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Or enter URL manually</summary>
                        <div className="mt-2">
                          <Input
                            value={postForm.media_url}
                            onChange={(e) => setPostForm({ ...postForm, media_url: e.target.value })}
                            placeholder="https://..."
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                          />
                        </div>
                      </details>
                    </div>
                  )}
                </div>
                {createType === 'POST' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postForm.is_pinned}
                      onChange={(e) => setPostForm({ ...postForm, is_pinned: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm text-gray-700">Pin this post</label>
                  </div>
                )}
                <div className="flex gap-3 pt-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" disabled={postSubmitting}>
                    {postSubmitting ? (createType === 'POST' ? 'Posting...' : 'Saving...') : (createType === 'POST' ? 'Create Post' : 'Create Announcement')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); }} disabled={postSubmitting} className="border-gray-300">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}

// Helpers for file rendering
function getFileIcon(fileType) {
  if (!fileType) return <FileIcon className="h-4 w-4" />;
  if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
  if (fileType.startsWith('video/')) return <VideoIcon className="h-4 w-4" />;
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return <FileTextIcon className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// removed unused placeholder

export default GroupLayout;
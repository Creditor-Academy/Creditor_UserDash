import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, MessageSquare, Bell, Crown, Loader2, Shield, Search, CheckSquare, Square, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getGroupById, 
  getGroupMembers, 
  getGroupPosts, 
  getAnnouncements,
  makeGroupAdmin,
  deleteGroupMember
} from "@/services/groupService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function MediaTile({ url, title }) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Detect video by mime hints if present
  const lowerUrl = (url || '').toLowerCase();
  const urlWithoutQuery = (lowerUrl.split('?')[0] || '');
  const isLikelyVideoByExt = /\.(mp4|webm|ogg|mov|m4v)$/.test(urlWithoutQuery);

  // If extension suggests video, try video first; otherwise try image first
  const tryVideoFirst = isLikelyVideoByExt;

  return (
    <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
      {!tryVideoFirst && !imageError && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={url}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      )}
      {(tryVideoFirst || imageError) && !videoError && (
        <video
          src={url}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          onError={() => setVideoError(true)}
        />
      )}
      {(tryVideoFirst && videoError) || (!tryVideoFirst && imageError && videoError) ? (
        <div className="flex flex-col items-center justify-center text-gray-600 text-xs gap-2">
          <File className="h-5 w-5 text-gray-400" />
          <span className="truncate max-w-[90%]">{title || 'View file'}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function GroupAdminModal({ isOpen, onClose, groupId }) {
  const { isInstructorOrAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [promoting, setPromoting] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPromoting, setBulkPromoting] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    if (!isOpen || !groupId) return;
    const load = async () => {
      try {
        setLoading(true);
        
        // Load each API call individually to identify which one fails
        let gRes, mRes, pRes, aRes;
        
        try {
          console.log(`[GroupAdminModal] Loading group data for groupId: ${groupId}`);
          gRes = await getGroupById(groupId);
          console.log('[GroupAdminModal] Group data loaded successfully:', gRes);
        } catch (error) {
          console.error('[GroupAdminModal] Failed to load group data:', error);
          toast.error(`Failed to load group data: ${error?.response?.data?.message || error?.message}`);
        }
        
        try {
          console.log(`[GroupAdminModal] Loading members for groupId: ${groupId}`);
          mRes = await getGroupMembers(groupId);
          console.log('[GroupAdminModal] Members loaded successfully:', mRes);
        } catch (error) {
          console.error('[GroupAdminModal] Failed to load group members:', error);
          toast.error(`Failed to load group members: ${error?.response?.data?.message || error?.message}`);
        }
        
        try {
          console.log(`[GroupAdminModal] Loading posts for groupId: ${groupId}`);
          pRes = await getGroupPosts(groupId);
          console.log('[GroupAdminModal] Posts loaded successfully:', pRes);
        } catch (error) {
          console.error('[GroupAdminModal] Failed to load group posts:', error);
          toast.error(`Failed to load group posts: ${error?.response?.data?.message || error?.message}`);
        }
        
        try {
          console.log(`[GroupAdminModal] Loading announcements for groupId: ${groupId}`);
          aRes = await getAnnouncements(groupId);
          console.log('[GroupAdminModal] Announcements loaded successfully:', aRes);
        } catch (error) {
          console.error('[GroupAdminModal] Failed to load announcements:', error);
          toast.error(`Failed to load announcements: ${error?.response?.data?.message || error?.message}`);
        }
        
        // Process the data
        setGroup(gRes?.data || gRes);
        const membersData = mRes?.data || mRes || [];
        setMembers(Array.isArray(membersData) ? membersData : (membersData.members || []));
        const postsData = pRes?.data || pRes || [];
        const postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || []);
        setPostsCount(Array.isArray(postsArray) ? postsArray.length : 0);
        const mediaItems = (postsArray || []).filter((p) => p?.media_url).map((p) => ({
          id: p.id,
          url: p.media_url,
          title: p.title || '',
          created_at: p.created_at || p.createdAt || null,
        }));
        setAttachments(mediaItems);
        const annData = aRes?.data || aRes || [];
        setAnnouncementsCount(Array.isArray(annData) ? annData.length : (annData.count || 0));
        
      } catch (e) {
        console.error("GroupAdminModal: Unexpected error", e);
        toast.error(e?.response?.data?.message || e?.message || "Failed to load group info");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, groupId]);

  const handleMakeAdmin = async (userId) => {
    try {
      setPromoting(userId);
      await makeGroupAdmin({ groupId, userId });
      toast.success("User promoted to group admin");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to make admin");
    } finally {
      setPromoting(null);
    }
  };

  const handleDeleteClick = (memberId, memberName) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      setDeleting(memberToDelete.id);
      await deleteGroupMember(groupId, memberToDelete.id);
      toast.success("Member removed from group");
      
      // Refresh members list
      const mRes = await getGroupMembers(groupId);
      const membersData = mRes?.data || mRes || [];
      setMembers(Array.isArray(membersData) ? membersData : (membersData.members || []));
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to remove member");
    } finally {
      setDeleting(null);
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMemberToDelete(null);
  };

  const filteredMembers = (members || []).filter((m) => {
    const user = m.user || m;
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '';
    const email = user.email || '';
    const hay = (name + ' ' + email).toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const toggleSelect = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  const allVisibleSelected = filteredMembers.length > 0 && filteredMembers.every((m) => {
    const u = m.user || m; const uid = u.id || m.user_id || m.id; return selectedIds.has(uid);
  });

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredMembers.forEach((m) => { const u = m.user || m; const uid = u.id || m.user_id || m.id; next.delete(uid); });
      } else {
        filteredMembers.forEach((m) => { const u = m.user || m; const uid = u.id || m.user_id || m.id; next.add(uid); });
      }
      return next;
    });
  };

  const handleBulkMakeAdmin = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkPromoting(true);
      await Promise.all(Array.from(selectedIds).map((userId) => makeGroupAdmin({ groupId, userId })));
      toast.success("Selected users promoted to admin");
      setSelectedIds(new Set());
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to promote some users");
    } finally {
      setBulkPromoting(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] p-4 overflow-y-auto"
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
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200/60 ring-1 ring-black/5 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">Group Admin</h3>
                    <p className="text-xs text-gray-500">Manage and view insights</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-5 overflow-y-auto">
                {/* Overview */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                    {group?.name ? group.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-gray-900">{group?.name || `Group ${groupId}`}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{group?.description || 'No description'}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-600 text-sm"><MessageSquare className="h-4 w-4" /> Posts</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{postsCount}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-600 text-sm"><Bell className="h-4 w-4" /> Announcements</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{announcementsCount}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-600 text-sm"><Users className="h-4 w-4" /> Members</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{members?.length || 0}</div>
                  </div>
                </div>

                {/* Members list */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-800">Members</div>
                      <div className="text-sm text-gray-500">{members?.length || 0} total</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search members..."
                          className="pl-7 h-8 w-56"
                        />
                      </div>
                      {isInstructorOrAdmin() && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={toggleSelectAllVisible}
                        >
                          {allVisibleSelected ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                          {allVisibleSelected ? 'Unselect all' : 'Select all'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {loading ? (
                      <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading members...
                      </div>
                    ) : filteredMembers.map((m, idx) => {
                      const user = m.user || m;
                      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || user.email || `User ${idx+1}`;
                      const isAdmin = m.role === 'ADMIN' || m.is_admin === true;
                      const uid = user.id || m.user_id || m.id;
                      return (
                        <div key={uid || idx} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            {isInstructorOrAdmin() && (
                              <button
                                type="button"
                                className={`h-5 w-5 rounded border ${selectedIds.has(uid) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'} flex items-center justify-center text-white`}
                                onClick={() => toggleSelect(uid)}
                                aria-label={selectedIds.has(uid) ? 'Unselect' : 'Select'}
                              >
                                {selectedIds.has(uid) && <CheckSquare className="h-3 w-3 text-white" />}
                                {!selectedIds.has(uid) && <Square className="h-3 w-3 text-gray-400" />}
                              </button>
                            )}
                            <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-medium">
                              {(user.first_name?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                              <div className="text-xs text-gray-500 truncate">{user.email || '—'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                <Crown className="h-3 w-3" /> Admin
                              </span>
                            )}
                            {isInstructorOrAdmin() && (
                              <button
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                onClick={() => handleDeleteClick(uid, name)}
                                disabled={deleting === uid}
                                title="Remove member from group"
                              >
                                {deleting === uid ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!loading && (!members || members.length === 0) && (
                      <div className="p-6 text-center text-gray-500">No members found</div>
                    )}
                  </div>
                  {isInstructorOrAdmin() && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">{selectedIds.size} selected</div>
                      <Button
                        size="sm"
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleBulkMakeAdmin}
                        disabled={selectedIds.size === 0 || bulkPromoting}
                      >
                        {bulkPromoting ? (
                          <span className="inline-flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Making admins...</span>
                        ) : (
                          <span className="inline-flex items-center gap-1"><Crown className="h-4 w-4" /> Make admin ({selectedIds.size})</span>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Attachments grid */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-800">Attachments</div>
                      <div className="text-sm text-gray-500">{attachments?.length || 0} media</div>
                    </div>
                  </div>
                  <div className="p-4">
                    {/* helpers for media type */}
                    {/**/}
                    {/**/}
                    {/**/}
                    {/**/}
                    {/* Inline helpers */}
                    {(() => {
                      // no-op to allow function declarations inside JSX scope
                      return null;
                    })()}
                    {
                      /* eslint-disable no-unused-vars */
                    }
                    { /* helpers defined in render scope */ }
                    {(() => {
                      return null;
                    })()}
                    {loading ? (
                      <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading attachments...
                      </div>
                    ) : (attachments && attachments.length > 0) ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {attachments.map((att) => {
                          const url = att.url || '';
                          return (
                            <a
                              key={att.id || att.url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block group"
                              title={att.title || 'Attachment'}
                            >
                              <MediaTile url={url} title={att.title} />
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">No attachments</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleDeleteCancel}
            />
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Remove Member</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to remove <span className="font-medium">{memberToDelete?.name}</span> from this group?
                </p>
                
                <div className="flex items-center gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleDeleteCancel}
                    disabled={deleting === memberToDelete?.id}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteConfirm}
                    disabled={deleting === memberToDelete?.id}
                  >
                    {deleting === memberToDelete?.id ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Removing...
                      </span>
                    ) : (
                      'Remove Member'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}



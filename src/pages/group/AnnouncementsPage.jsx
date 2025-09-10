import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Search, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EditAnnouncementModal from "@/components/modals/EditAnnouncementModal";
import { getAnnouncements, deleteAnnouncement, isUserGroupAdmin } from "@/services/groupService";
import { } from "@/services/socketClient";
import { useAnnouncementsSocket } from "@/hooks/useAnnouncementsSocket";
import { useParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { isInstructorOrAdmin } from "@/services/userService";
// Removed create announcement feature

export function AnnouncementsPage() {
  const { groupId } = useParams();
  const { userProfile } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  const isAdminOrInstructor = isInstructorOrAdmin();
  const currentUserId = userProfile?.id;

  useEffect(() => {
    loadAnnouncements();
    checkGroupAdminStatus();
  }, [groupId]);

  useAnnouncementsSocket({
    groupId,
    onNew: (payload) => {
      if (!payload || String(payload.group_id || payload.groupId) !== String(groupId)) return;
      setAnnouncements(prev => [payload, ...(prev || [])]);
    }
  });

  // Lightweight auto-refresh every 2s without toggling the loading state
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const response = await getAnnouncements(groupId);
        if (cancelled) return;
        const announcementsData = response?.data || response || [];
        setAnnouncements(announcementsData);
      } catch {}
    };
    const intervalId = setInterval(tick, 2000);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [groupId]);

  const checkGroupAdminStatus = async () => {
    if (!groupId) return;
    try {
      setCheckingPermissions(true);
      const adminStatus = await isUserGroupAdmin(groupId);
      setIsGroupAdmin(adminStatus);
    } catch (error) {
      console.error("Error checking group admin status:", error);
      setIsGroupAdmin(false);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const loadAnnouncements = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      console.log("📥 AnnouncementsPage: Fetching announcements for group:", groupId);
      const response = await getAnnouncements(groupId);
      console.log("✅ AnnouncementsPage: Announcements response:", response);
      
      const announcementsData = response?.data || response || [];
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("❌ AnnouncementsPage: Error loading announcements:", error);
      toast({ 
        title: "Failed to load announcements", 
        description: error?.response?.data?.message || error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      setDeletingId(announcementId);
      await deleteAnnouncement(announcementId);
      
      // Remove from local state
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });
    } catch (error) {
      console.error("❌ Error deleting announcement:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete announcement",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Creation flow removed

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getAuthorName = (user) => {
    if (!user) return "Unknown";
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Unknown";
  };

  const getAuthorInitials = (user) => {
    if (!user) return "U";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  // Determine media type from url extension
  const getMediaType = (url) => {
    if (!url || typeof url !== 'string') return 'other';
    const lower = url.split('?')[0].toLowerCase();
    if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp)$/.test(lower)) return 'image';
    if (/(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/.test(lower)) return 'video';
    if (/(\.pdf)$/.test(lower)) return 'pdf';
    return 'other';
  };

  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getAuthorName(announcement.user)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Group Announcements
                </h1>
                <p className="text-gray-600">Stay updated with important group information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          {/* Create announcement button removed */}
        </div>
      </div>

      {/* Search */}
      <div className="flex w-full items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Announcements List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading announcements...</p>
          </CardContent>
        </Card>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={announcement.user?.image} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getAuthorInitials(announcement.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>{getAuthorName(announcement.user)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(announcement.createdAt)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(announcement.priority)}
                    {isGroupAdmin && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-600 hover:text-blue-600"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-600 hover:text-red-600"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          disabled={deletingId === announcement.id}
                        >
                          {deletingId === announcement.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none space-y-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>

                  {/* Inline media rendering */}
                  {announcement.media_url && (
                    (() => {
                      const mediaType = getMediaType(announcement.media_url);
                      if (mediaType === 'image') {
                        return (
                          <div className="rounded-lg overflow-hidden border">
                            <img src={announcement.media_url} alt="Announcement media" className="w-full h-auto" />
                          </div>
                        );
                      }
                      if (mediaType === 'video') {
                        return (
                          <div className="rounded-lg overflow-hidden border">
                            <video
                              src={announcement.media_url}
                              controls
                              preload="metadata"
                              className="w-full h-auto"
                            />
                          </div>
                        );
                      }
                      if (mediaType === 'pdf') {
                        return (
                          <div className="rounded-lg overflow-hidden border">
                            <iframe
                              src={`${announcement.media_url}#toolbar=0`}
                              className="w-full h-[480px]"
                              title="Announcement PDF"
                            />
                          </div>
                        );
                      }
                      return (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Attachment:</span>
                            <a
                              href={announcement.media_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View/Download
                            </a>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? "No announcements match your search criteria" 
                : "Group admins can create announcements to share important information"
              }
            </p>
            {/* Create first announcement button removed */}
          </CardContent>
        </Card>
      )}

      {/* Create announcement modal removed */}
      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <EditAnnouncementModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          announcement={editingAnnouncement}
          onUpdated={(updated) => {
            setAnnouncements(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
          }}
        />
      )}
    </div>
  );
}

export default AnnouncementsPage;

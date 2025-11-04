import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateAnnouncement } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { Bell, Loader2, AlertCircle } from "lucide-react";

/**
 * EditAnnouncementModal
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - announcement: object (must include id, title, content, media_url?)
 * - onUpdated: (updatedAnnouncement) => void
 */
const EditAnnouncementModal = ({ isOpen, onClose, announcement, onUpdated }) => {
  const { userProfile } = useUser();

  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || "");
      setContent(announcement.content || "");
      setFile(null);
    }
  }, [announcement]);

  const canSubmit = useMemo(() => {
    return !!title.trim() && !!content.trim();
  }, [title, content]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!announcement?.id) return;
    if (!canSubmit) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (file) {
        formData.append("media", file);
      }

      const updated = await updateAnnouncement(announcement.id, formData);

      // Some backends return different shapes; normalize conservatively
      const raw = updated?.data?.announcement || updated?.data || updated;
      const normalized = {
        id: raw?.id || announcement.id,
        title: raw?.title ?? title.trim(),
        content: raw?.content ?? content.trim(),
        media_url: raw?.media_url ?? announcement.media_url,
        user: raw?.user || announcement.user,
        createdAt: raw?.createdAt || announcement.createdAt,
        priority: raw?.priority || announcement.priority,
      };
      onUpdated?.(normalized);
      toast({ title: "Announcement updated" });
      onClose();
    } catch (err) {
      console.error("Error updating announcement", err);
      toast({
        title: "Failed to update announcement",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!announcement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Edit Announcement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header / Context */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile?.image} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {userProfile?.first_name?.[0]}
                    {userProfile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Editing an existing announcement</p>
                </div>
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Announcement
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write announcement content..."
              rows={6}
            />
          </div>

          {/* Media */}
          <div className="space-y-2">
            <Label htmlFor="media" className="text-sm font-medium">
              Replace media (optional)
            </Label>
            <Input id="media" type="file" onChange={handleFileChange} />
            {announcement?.media_url && (
              <p className="text-xs text-gray-500">
                Current media attached. Uploading a new file will replace it.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canSubmit} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnnouncementModal;



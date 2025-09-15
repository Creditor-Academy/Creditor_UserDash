import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Loader2, Bell, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createAnnouncement, isUserGroupAdmin } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";

export function CreateAnnouncementModal({ isOpen, onClose, groupId, groupName, onAnnouncementCreated }) {
  const { userProfile } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  // Check group admin permissions when modal opens
  useEffect(() => {
    const checkPermissions = async () => {
      if (isOpen && groupId) {
        setCheckingPermissions(true);
        try {
          const adminStatus = await isUserGroupAdmin(groupId);
          setIsGroupAdmin(adminStatus);
          
          if (!adminStatus) {
            toast({
              title: "Access Denied",
              description: "Only group admins can create announcements. Contact your group admin for access.",
              variant: "destructive"
            });
            // Close modal if user is not admin
            setTimeout(() => onClose(), 3000);
          }
        } catch (error) {
          console.error("Error checking group admin status:", error);
          toast({
            title: "Error",
            description: "Failed to verify permissions",
            variant: "destructive"
          });
          onClose();
        } finally {
          setCheckingPermissions(false);
        }
      }
    };

    checkPermissions();
  }, [isOpen, groupId, onClose]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        media: media
      };

      const response = await createAnnouncement(groupId, announcementData);
      
      toast({
        title: "Success",
        description: "Announcement created successfully"
      });

      // Reset form
      setTitle("");
      setContent("");
      setMedia(null);
      setMediaPreview(null);
      
      // Close modal and refresh announcements
      onClose();
      if (onAnnouncementCreated) {
        onAnnouncementCreated(response.data);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create announcement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setContent("");
      setMedia(null);
      setMediaPreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Create Announcement
          </DialogTitle>
        </DialogHeader>

        {checkingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Checking permissions...</p>
            </div>
          </div>
        ) : !isGroupAdmin ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">Only group admins can create announcements.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Group Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile?.image} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Posting to {groupName}</p>
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
              placeholder="Enter announcement title..."
              className="w-full"
              disabled={loading}
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
              placeholder="Write your announcement content..."
              className="min-h-[120px] resize-none"
              disabled={loading}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Media (Optional)</Label>
            <div className="space-y-3">
              {!media ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload an image or document</p>
                  <input
                    type="file"
                    onChange={handleMediaChange}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="media-upload"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('media-upload').click()}
                    disabled={loading}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">{media.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeMedia}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {mediaPreview && (
                    <div className="mt-2">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Create Announcement
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateAnnouncementModal;

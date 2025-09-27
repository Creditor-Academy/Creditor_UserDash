import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Youtube, Loader2 } from 'lucide-react';

const YouTubeComponent = ({
  showYouTubeDialog,
  setShowYouTubeDialog,
  onYouTubeUpdate,
  editingYouTubeBlock = null
}) => {
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [youTubeTitle, setYouTubeTitle] = useState('');
  const [youTubeDescription, setYouTubeDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (showYouTubeDialog) {
      if (editingYouTubeBlock) {
        // Load existing YouTube data for editing
        const content = editingYouTubeBlock.content ? JSON.parse(editingYouTubeBlock.content) : {};
        setYouTubeTitle(content.title || '');
        setYouTubeDescription(content.description || '');
        setYouTubeUrl(content.url || '');
      } else {
        // Reset for new YouTube video
        resetForm();
      }
    }
  }, [showYouTubeDialog, editingYouTubeBlock]);

  const resetForm = () => {
    setYouTubeUrl('');
    setYouTubeTitle('');
    setYouTubeDescription('');
    setIsProcessing(false);
  };

  const handleYouTubeDialogClose = () => {
    setShowYouTubeDialog(false);
    resetForm();
  };

  const validateForm = () => {
    if (!youTubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return false;
    }

    // Validate YouTube URL
    const getVideoId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(youTubeUrl);
    if (!videoId) {
      toast.error('Please enter a valid YouTube URL');
      return false;
    }

    return true;
  };

  const handleSaveYouTube = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // Extract video ID from URL
      const getVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const videoId = getVideoId(youTubeUrl);
      if (!videoId) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }

      // Create YouTube content
      const youTubeContent = {
        title: youTubeTitle.trim() || 'YouTube Video',
        description: youTubeDescription.trim(),
        url: youTubeUrl.trim(),
        videoId: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        createdAt: new Date().toISOString()
      };

      // Generate HTML for the YouTube block
      const youTubeHtml = generateYouTubeHTML(youTubeContent);

      // Create or update the YouTube block (provide html_css for preview section)
      const youTubeBlock = {
        id: editingYouTubeBlock?.id || `youtube_${Date.now()}`,
        block_id: editingYouTubeBlock?.block_id || `youtube_${Date.now()}`,
        type: 'youtube',
        title: youTubeContent.title,
        content: JSON.stringify(youTubeContent),
        html_css: youTubeHtml, // Provide HTML for preview section
        order: editingYouTubeBlock?.order || Date.now()
      };

      // Call the callback to update the lesson
      onYouTubeUpdate(youTubeBlock);

      // Close dialog and reset form
      handleYouTubeDialogClose();
      toast.success(editingYouTubeBlock ? 'YouTube video updated successfully!' : 'YouTube video added successfully!');
      
    } catch (error) {
      console.error('Error saving YouTube video:', error);
      toast.error('Failed to save YouTube video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateYouTubeHTML = (content) => {
    return `
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div class="space-y-4">
          ${content.title ? `<h3 class="text-lg font-semibold text-gray-900">${content.title}</h3>` : ''}
          ${content.description ? `<p class="text-sm text-gray-600">${content.description}</p>` : ''}
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
              <iframe
                class="absolute top-0 left-0 w-full h-full"
                src="${content.embedUrl}"
                title="${content.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={showYouTubeDialog} onOpenChange={handleYouTubeDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            {editingYouTubeBlock ? 'Edit YouTube Video' : 'Add YouTube Video'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL *
            </label>
            <input
              type="url"
              value={youTubeUrl}
              onChange={(e) => setYouTubeUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the full YouTube video URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={youTubeTitle}
              onChange={(e) => setYouTubeTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              placeholder="Video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={youTubeDescription}
              onChange={(e) => setYouTubeDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
              rows={3}
              placeholder="Video description"
            />
          </div>

          {youTubeUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={youTubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="YouTube video preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleYouTubeDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveYouTube}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Youtube className="h-4 w-4 mr-2" />
                {editingYouTubeBlock ? 'Update Video' : 'Add Video'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeComponent;

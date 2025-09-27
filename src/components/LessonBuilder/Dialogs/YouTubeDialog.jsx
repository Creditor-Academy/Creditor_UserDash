import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const YouTubeDialog = ({
  isOpen,
  onClose,
  youtubeTitle,
  setYoutubeTitle,
  youtubeDescription,
  setYoutubeDescription,
  youtubeUrl,
  setYoutubeUrl,
  youtubeError,
  setYoutubeError,
  onAddYoutube
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setYoutubeTitle('');
    setYoutubeDescription('');
    setYoutubeUrl('');
    setYoutubeError('');
    onClose();
  };

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    if (url && !validateYouTubeUrl(url)) {
      setYoutubeError('Please enter a valid YouTube URL');
    } else {
      setYoutubeError('');
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add YouTube Video</DialogTitle>
          <p className="text-sm text-gray-500">Add a YouTube video to your lesson</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={youtubeTitle}
              onChange={(e) => setYoutubeTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={handleUrlChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                youtubeError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            {youtubeError && (
              <p className="text-sm text-red-600 mt-1">{youtubeError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </p>
          </div>

          {/* YouTube Preview */}
          {videoId && !youtubeError && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview:
              </label>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video preview"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={youtubeDescription}
              onChange={(e) => setYoutubeDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a description for the video (optional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddYoutube}
            disabled={!youtubeTitle || !youtubeUrl || youtubeError}
            className="bg-red-600 hover:bg-red-700"
          >
            Add YouTube Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeDialog;
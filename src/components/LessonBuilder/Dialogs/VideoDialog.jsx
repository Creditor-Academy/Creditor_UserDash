import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const VideoDialog = ({
  isOpen,
  onClose,
  videoTitle,
  setVideoTitle,
  videoDescription,
  setVideoDescription,
  videoUploadMethod,
  setVideoUploadMethod,
  videoFile,
  videoUrl,
  setVideoUrl,
  videoPreview,
  isUploading,
  onVideoFileChange,
  onAddVideo
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setVideoTitle('');
    setVideoDescription('');
    setVideoUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
          <p className="text-sm text-gray-500">Upload a video file or provide a video URL</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Upload Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Method <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="file"
                  checked={videoUploadMethod === 'file'}
                  onChange={(e) => setVideoUploadMethod(e.target.value)}
                  className="mr-2"
                />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={videoUploadMethod === 'url'}
                  onChange={(e) => setVideoUploadMethod(e.target.value)}
                  className="mr-2"
                />
                Video URL
              </label>
            </div>
          </div>

          {/* File Upload Section */}
          {videoUploadMethod === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video File <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="video-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="video-upload"
                        name="file"
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        className="sr-only"
                        onChange={onVideoFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, or OGG up to 50MB
                  </p>
                </div>
              </div>
              {videoPreview && videoUploadMethod === 'file' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Input Section */}
          {videoUploadMethod === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/video.mp4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </p>
              {videoUrl && videoUploadMethod === 'url' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    onError={() => console.log('Video URL may be invalid or not accessible')}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a description for your video (optional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddVideo}
            disabled={!videoTitle || (videoUploadMethod === 'file' && !videoFile) || (videoUploadMethod === 'url' && !videoUrl)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Add Video'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDialog;
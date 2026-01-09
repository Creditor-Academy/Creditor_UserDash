import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadVideo as uploadVideoResource } from '@/services/videoUploadService';
import { toast } from 'react-hot-toast';
import devLogger from '@lessonbuilder/utils/devLogger';
import { Video, Upload, Link2, X, Play, Pause, Loader2 } from 'lucide-react';

const VideoComponent = ({
  showVideoDialog,
  setShowVideoDialog,
  onVideoUpdate,
  editingVideoBlock = null,
}) => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUploadMethod, setVideoUploadMethod] = useState('file');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (showVideoDialog) {
      if (editingVideoBlock) {
        // Load existing video data for editing
        const content = editingVideoBlock.content
          ? JSON.parse(editingVideoBlock.content)
          : {};
        setVideoTitle(content.title || editingVideoBlock.videoTitle || '');
        setVideoDescription(
          content.description || editingVideoBlock.videoDescription || ''
        );
        setVideoUploadMethod(
          content.uploadMethod || editingVideoBlock.uploadMethod || 'file'
        );
        setVideoUrl(content.url || editingVideoBlock.videoUrl || '');
        setVideoPreview(content.url || editingVideoBlock.videoUrl || '');
      } else {
        // Reset for new video
        resetForm();
      }
    }
  }, [showVideoDialog, editingVideoBlock]);

  const resetForm = () => {
    setVideoTitle('');
    setVideoDescription('');
    setVideoUploadMethod('file');
    setVideoFile(null);
    setVideoUrl('');
    setVideoPreview('');
    setIsUploading(false);
    setIsPlaying(false);
    if (videoRef) {
      videoRef.pause();
      videoRef.currentTime = 0;
    }
  };

  const handleVideoDialogClose = () => {
    setShowVideoDialog(false);
    resetForm();
  };

  const handleVideoInputChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate video file
      const validVideoTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
      ];
      if (!validVideoTypes.includes(file.type)) {
        toast.error(
          'Please upload a valid video file (MP4, WebM, OGG, AVI, MOV)'
        );
        return;
      }

      // Check file size (3GB limit)
      if (file.size > 3072 * 1024 * 1024) {
        toast.error('Video file size should be less than 3GB');
        return;
      }

      setVideoFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const handleUrlChange = e => {
    const url = e.target.value;
    setVideoUrl(url);

    // Check if it's a YouTube URL
    if (isYouTubeUrl(url)) {
      // For YouTube URLs, we'll use the embed URL for preview
      const embedUrl = getYouTubeEmbedUrl(url);
      setVideoPreview(embedUrl);
    } else {
      setVideoPreview(url);
    }

    // Validate URL format in real-time
    if (url.trim()) {
      try {
        new URL(url.trim());
        // URL is valid
      } catch (e) {
        // URL is invalid, but we'll let the user continue typing
      }
    }
  };

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = url => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = url => {
    if (!url) return '';

    let videoId = '';

    // Extract video ID from different YouTube URL formats
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url; // Return original URL if we can't extract video ID
  };

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
        setIsPlaying(false);
      } else {
        videoRef.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoLoadedData = video => {
    setVideoRef(video);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const validateForm = () => {
    if (videoUploadMethod === 'file' && !videoFile && !editingVideoBlock) {
      toast.error('Please select a video file');
      return false;
    }

    if (videoUploadMethod === 'url') {
      if (!videoUrl.trim()) {
        toast.error('Please enter a video URL');
        return false;
      }

      // Validate URL format
      try {
        new URL(videoUrl.trim());

        // Additional validation for YouTube URLs
        if (isYouTubeUrl(videoUrl.trim())) {
          // YouTube URLs are valid
        } else {
          // For non-YouTube URLs, check if it looks like a video file
          const url = videoUrl.trim().toLowerCase();
          const videoExtensions = [
            '.mp4',
            '.webm',
            '.ogg',
            '.avi',
            '.mov',
            '.mkv',
          ];
          const hasVideoExtension = videoExtensions.some(ext =>
            url.includes(ext)
          );

          if (!hasVideoExtension && !url.includes('video/')) {
            toast.warning(
              "URL doesn't appear to be a direct video file. YouTube URLs are supported."
            );
          }
        }
      } catch (e) {
        toast.error(
          'Please enter a valid URL (e.g., https://example.com/video.mp4 or YouTube URL)'
        );
        return false;
      }
    }

    return true;
  };

  // Function to remove emojis from text
  const removeEmojis = text => {
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        ''
      )
      .trim();
  };

  const handleSaveVideo = async () => {
    if (!validateForm()) return;

    setIsUploading(true);

    try {
      let finalVideoUrl;
      let uploadedData = null;

      // Handle URL method
      if (videoUploadMethod === 'url') {
        if (isYouTubeUrl(videoUrl.trim())) {
          // For YouTube URLs, store both the original URL and embed URL
          finalVideoUrl = getYouTubeEmbedUrl(videoUrl.trim());
          devLogger.debug(
            'YouTube URL method - original:',
            videoUrl.trim(),
            'embed:',
            finalVideoUrl
          );
        } else {
          finalVideoUrl = videoUrl.trim();
          devLogger.debug(
            'Direct video URL method - finalVideoUrl:',
            finalVideoUrl
          );
        }
      } else {
        // Upload file if method is file and we have a new file
        finalVideoUrl = videoPreview;
        devLogger.debug('Video file method - finalVideoUrl:', finalVideoUrl);
      }

      // Upload file if method is file and we have a new file
      if (videoUploadMethod === 'file' && videoFile) {
        try {
          const uploadResult = await uploadVideoResource(videoFile, {
            folder: 'lesson-videos',
            public: true,
            type: 'video',
          });

          if (uploadResult.success) {
            finalVideoUrl = uploadResult.videoUrl;
            uploadedData = {
              fileName: uploadResult.fileName,
              fileSize: uploadResult.fileSize,
              uploadedAt: new Date().toISOString(),
            };
            toast.success('Video uploaded successfully!');
          } else {
            throw new Error('Upload failed');
          }
        } catch (uploadError) {
          devLogger.warn(
            'Cloud upload failed, using local preview:',
            uploadError
          );
          toast.warning(
            'Using local preview - video may not persist after page refresh'
          );
          // Continue with local preview URL
        }
      }

      // Create video block content with emoji removed from title
      const cleanTitle = removeEmojis(videoTitle.trim());
      const videoContent = {
        title: cleanTitle,
        description: videoDescription.trim(),
        uploadMethod: videoUploadMethod,
        url: finalVideoUrl,
        originalUrl: videoUploadMethod === 'url' ? videoUrl.trim() : null,
        isYouTube:
          videoUploadMethod === 'url' ? isYouTubeUrl(videoUrl.trim()) : false,
        uploadedData: uploadedData,
        createdAt: new Date().toISOString(),
      };

      // Generate HTML for the video block
      const videoHtml = generateVideoHTML(videoContent);

      // Create or update the video block
      const videoBlock = {
        id: editingVideoBlock?.id || `video_${Date.now()}`,
        block_id: editingVideoBlock?.block_id || `video_${Date.now()}`,
        type: 'video',
        title: cleanTitle,
        videoTitle: cleanTitle,
        videoDescription: videoDescription.trim(),
        videoUrl: finalVideoUrl,
        uploadMethod: videoUploadMethod,
        originalUrl: videoUploadMethod === 'url' ? videoUrl : null,
        content: JSON.stringify(videoContent),
        html_css: videoHtml,
        order: editingVideoBlock?.order || Date.now(),
      };

      devLogger.debug('Created video block:', videoBlock);

      // Call the callback to update the lesson
      onVideoUpdate(videoBlock);

      // Close dialog and reset form
      handleVideoDialogClose();
      toast.success(
        editingVideoBlock
          ? 'Video updated successfully!'
          : 'Video added successfully!'
      );
    } catch (error) {
      devLogger.error('Error saving video:', error);
      toast.error('Failed to save video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const generateVideoHTML = content => {
    return `
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div class="space-y-4">
          <div class="flex items-start space-x-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">${content.title}</h3>
              ${content.description ? `<p class="text-sm text-gray-600 mb-3">${content.description}</p>` : ''}
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            ${
              content.isYouTube
                ? `
              <iframe 
                src="${content.url}" 
                title="${content.title}"
                class="w-full max-w-full" 
                style="height: 400px; border-radius: 8px;" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            `
                : `
              <video controls class="w-full max-w-full" style="max-height: 400px; border-radius: 8px;" preload="metadata">
                <source src="${content.url}" type="video/mp4">
                <source src="${content.url}" type="video/webm">
                <source src="${content.url}" type="video/ogg">
                Your browser does not support the video element.
              </video>
            `
            }
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={showVideoDialog} onOpenChange={handleVideoDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-600" />
            <span>{editingVideoBlock ? 'Edit Video' : 'Add Video'}</span>
          </DialogTitle>
          <DialogDescription>
            {editingVideoBlock
              ? 'Update the video details and settings.'
              : 'Upload a video file or provide a video URL to add it to your lesson.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title (Optional)
            </label>
            <input
              type="text"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video title"
            />
          </div>

          {/* Video Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={videoDescription}
              onChange={e => setVideoDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video description"
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
                  onChange={e => setVideoUploadMethod(e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={videoUploadMethod === 'url'}
                  onChange={e => setVideoUploadMethod(e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
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
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
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
                        accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
                        className="sr-only"
                        onChange={handleVideoInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, OGG, AVI, MOV up to 3GB
                  </p>
                </div>
              </div>
              {videoPreview && videoUploadMethod === 'file' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  <div className="relative">
                    <video
                      ref={handleVideoLoadedData}
                      src={videoPreview}
                      className="w-full rounded-lg border border-gray-200"
                      style={{ maxHeight: '300px' }}
                      onEnded={handleVideoEnded}
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={togglePlayPause}
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
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
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/video.mp4"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Direct video file URL (MP4, WebM, OGG, etc.) or YouTube URL
              </p>
              {videoUrl && videoUploadMethod === 'url' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  {isYouTubeUrl(videoUrl) ? (
                    <iframe
                      src={videoPreview}
                      title="Video Preview"
                      className="w-full rounded-lg border border-gray-200"
                      style={{ height: '300px' }}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg border border-gray-200"
                      style={{ maxHeight: '300px' }}
                      onError={() =>
                        devLogger.debug(
                          'Video URL may be invalid or not accessible'
                        )
                      }
                      preload="metadata"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleVideoDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveVideo}
            disabled={
              (videoUploadMethod === 'file' &&
                !videoFile &&
                !editingVideoBlock) ||
              (videoUploadMethod === 'url' && !videoUrl) ||
              isUploading
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {videoUploadMethod === 'file' ? 'Uploading...' : 'Saving...'}
              </>
            ) : editingVideoBlock ? (
              'Update Video'
            ) : (
              'Add Video'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoComponent;

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
import { uploadAudio } from '@/services/audioUploadService';
import { toast } from 'react-hot-toast';
import { Volume2, Upload, Link2, X, Play, Pause, Loader2 } from 'lucide-react';

const AudioComponent = ({
  showAudioDialog,
  setShowAudioDialog,
  onAudioUpdate,
  editingAudioBlock = null,
}) => {
  const [audioTitle, setAudioTitle] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioUploadMethod, setAudioUploadMethod] = useState('file');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioPreview, setAudioPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  // Helper function to reset form
  const resetForm = () => {
    setAudioTitle('');
    setAudioDescription('');
    setAudioUploadMethod('file');
    setAudioFile(null);
    setAudioUrl('');
    setAudioPreview('');
    setIsUploading(false);
    setIsPlaying(false);
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  };

  // Helper function to extract audio data from HTML
  const extractAudioFromHTML = htmlContent => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      const titleElement = tempDiv.querySelector('h3');
      const title = titleElement ? titleElement.textContent.trim() : '';

      const descElement = tempDiv.querySelector('p.text-gray-600');
      const description = descElement ? descElement.textContent.trim() : '';

      const audioElement = tempDiv.querySelector('audio source');
      const url = audioElement ? audioElement.getAttribute('src') : '';

      console.log('Extracted from HTML:', { title, description, url });

      return {
        title,
        description,
        url,
        uploadMethod: url ? 'file' : 'file', // Default to file method
      };
    } catch (error) {
      console.error('Error extracting audio from HTML:', error);
      return {};
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (showAudioDialog && editingAudioBlock) {
      console.log('=== Audio Edit Dialog Opened ===');
      console.log('Editing block:', editingAudioBlock);

      // Load existing audio data for editing
      try {
        let content = {};

        // Try to parse JSON content first
        if (editingAudioBlock.content) {
          try {
            content = JSON.parse(editingAudioBlock.content);
            console.log('✅ Parsed audio content from JSON:', content);
          } catch (e) {
            console.log(
              '❌ Could not parse audio content as JSON, trying HTML extraction'
            );
          }
        }

        // If no JSON content or incomplete data, try to extract from HTML
        if ((!content.title || !content.url) && editingAudioBlock.html_css) {
          console.log('Extracting audio data from HTML...');
          const htmlExtracted = extractAudioFromHTML(
            editingAudioBlock.html_css
          );
          console.log('HTML extracted data:', htmlExtracted);

          // Merge with any existing content
          content = {
            ...htmlExtracted,
            ...content, // JSON content takes priority
          };
        }

        // Also check block properties directly as fallback
        if (!content.title && editingAudioBlock.title) {
          content.title = editingAudioBlock.title;
        }
        if (!content.description && editingAudioBlock.description) {
          content.description = editingAudioBlock.description;
        }

        console.log('✅ Final audio data for editing:', content);
        setAudioTitle(content.title || '');
        setAudioDescription(content.description || '');
        setAudioUploadMethod(content.uploadMethod || 'file');
        setAudioUrl(content.url || '');
        setAudioPreview(content.url || '');
      } catch (error) {
        console.error('❌ Error loading audio data:', error);
        // Don't reset on error, just use empty values
        setAudioTitle('');
        setAudioDescription('');
        setAudioUrl('');
        setAudioPreview('');
      }
    } else if (showAudioDialog && !editingAudioBlock) {
      // Reset for new audio
      console.log('Opening new audio dialog');
      resetForm();
    } else if (!showAudioDialog) {
      // Dialog closed, reset form
      resetForm();
    }
  }, [showAudioDialog, editingAudioBlock]);

  const handleAudioDialogClose = () => {
    setShowAudioDialog(false);
    resetForm();
  };

  const handleAudioInputChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate audio file
      const validAudioTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp3',
        'audio/m4a',
      ];
      if (!validAudioTypes.includes(file.type)) {
        toast.error('Please upload a valid audio file (MP3, WAV, OGG, M4A)');
        return;
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Audio file size should be less than 50MB');
        return;
      }

      setAudioFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAudioPreview(previewUrl);
    }
  };

  const handleUrlChange = e => {
    const url = e.target.value;
    setAudioUrl(url);
    setAudioPreview(url);
  };

  const togglePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioLoadedData = audio => {
    setAudioRef(audio);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const validateForm = () => {
    if (!audioTitle.trim()) {
      toast.error('Please enter an audio title');
      return false;
    }

    if (audioUploadMethod === 'file' && !audioFile && !editingAudioBlock) {
      toast.error('Please select an audio file');
      return false;
    }

    if (audioUploadMethod === 'url' && !audioUrl.trim()) {
      toast.error('Please enter an audio URL');
      return false;
    }

    return true;
  };

  const handleSaveAudio = async () => {
    if (!validateForm()) return;

    setIsUploading(true);

    try {
      let finalAudioUrl = audioPreview;
      let uploadedData = null;

      // Upload file if method is file and we have a new file
      if (audioUploadMethod === 'file' && audioFile) {
        try {
          const uploadResult = await uploadAudio(audioFile, {
            folder: 'lesson-audio',
            public: true,
            type: 'audio',
          });

          if (uploadResult.success) {
            finalAudioUrl = uploadResult.audioUrl;
            uploadedData = {
              fileName: uploadResult.fileName,
              fileSize: uploadResult.fileSize,
              uploadedAt: new Date().toISOString(),
            };
            toast.success('Audio uploaded successfully!');
          } else {
            throw new Error('Upload failed');
          }
        } catch (uploadError) {
          console.warn(
            'Cloud upload failed, using local preview:',
            uploadError
          );
          toast.warning(
            'Using local preview - audio may not persist after page refresh'
          );
          // Continue with local preview URL
        }
      }

      // Create audio block content
      const audioContent = {
        title: audioTitle.trim(),
        description: audioDescription.trim(),
        uploadMethod: audioUploadMethod,
        url: finalAudioUrl,
        uploadedData: uploadedData,
        createdAt: new Date().toISOString(),
      };

      // Generate HTML for the audio block
      const audioHtml = generateAudioHTML(audioContent);

      // Create or update the audio block
      const audioBlock = {
        id: editingAudioBlock?.id || `audio_${Date.now()}`,
        block_id: editingAudioBlock?.block_id || `audio_${Date.now()}`,
        type: 'audio',
        title: audioTitle.trim(),
        content: JSON.stringify(audioContent),
        html_css: audioHtml,
        order: editingAudioBlock?.order || Date.now(),
      };

      // Call the callback to update the lesson
      onAudioUpdate(audioBlock);

      // Close dialog and reset form
      handleAudioDialogClose();
      toast.success(
        editingAudioBlock
          ? 'Audio updated successfully!'
          : 'Audio added successfully!'
      );
    } catch (error) {
      console.error('Error saving audio:', error);
      toast.error('Failed to save audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const generateAudioHTML = content => {
    return `
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div class="space-y-4">
          <div class="mb-3">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">${content.title}</h3>
            ${content.description ? `<p class="text-sm text-gray-600">${content.description}</p>` : ''}
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <audio controls class="w-full" preload="metadata">
              <source src="${content.url}" type="audio/mpeg">
              <source src="${content.url}" type="audio/wav">
              <source src="${content.url}" type="audio/ogg">
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Dialog open={showAudioDialog} onOpenChange={handleAudioDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            <span>{editingAudioBlock ? 'Edit Audio' : 'Add Audio'}</span>
          </DialogTitle>
          <DialogDescription>
            {editingAudioBlock
              ? 'Update the audio details and settings.'
              : 'Upload an audio file or provide an audio URL to add it to your lesson.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Audio Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={audioTitle}
              onChange={e => setAudioTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter audio title"
              required
            />
          </div>

          {/* Audio Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={audioDescription}
              onChange={e => setAudioDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter audio description"
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
                  checked={audioUploadMethod === 'file'}
                  onChange={e => setAudioUploadMethod(e.target.value)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <Upload className="h-4 w-4 mr-1" />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={audioUploadMethod === 'url'}
                  onChange={e => setAudioUploadMethod(e.target.value)}
                  className="mr-2 text-purple-600 focus:ring-purple-500"
                />
                <Link2 className="h-4 w-4 mr-1" />
                Audio URL
              </label>
            </div>
          </div>

          {/* File Upload Section */}
          {audioUploadMethod === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Volume2 className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="audio-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="audio-upload"
                        name="file"
                        type="file"
                        accept="audio/mp3,audio/wav,audio/ogg,audio/mpeg,audio/m4a"
                        className="sr-only"
                        onChange={handleAudioInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP3, WAV, OGG, M4A up to 50MB
                  </p>
                </div>
              </div>

              {/* Audio Preview */}
              {audioPreview && audioUploadMethod === 'file' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Preview:
                    </p>
                    {audioFile && (
                      <span className="text-xs text-gray-500">
                        {audioFile.name} (
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                  <audio
                    src={audioPreview}
                    controls
                    className="w-full"
                    onLoadedData={e => handleAudioLoadedData(e.target)}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Input Section */}
          {audioUploadMethod === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={handleUrlChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com/audio.mp3"
                required
              />

              {/* URL Audio Preview */}
              {audioPreview && audioUploadMethod === 'url' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  <audio
                    src={audioPreview}
                    controls
                    className="w-full"
                    onLoadedData={e => handleAudioLoadedData(e.target)}
                    onEnded={handleAudioEnded}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleAudioDialogClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAudio}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {audioUploadMethod === 'file' ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                {editingAudioBlock ? 'Update Audio' : 'Add Audio'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioComponent;

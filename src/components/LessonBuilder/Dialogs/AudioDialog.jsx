import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AudioDialog = ({
  isOpen,
  onClose,
  audioTitle,
  setAudioTitle,
  audioDescription,
  setAudioDescription,
  audioUploadMethod,
  setAudioUploadMethod,
  audioFile,
  audioUrl,
  setAudioUrl,
  audioPreview,
  isUploading,
  onAudioInputChange,
  onAddAudio
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setAudioTitle('');
    setAudioDescription('');
    setAudioUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Audio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={audioTitle}
              onChange={onAudioInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter audio title"
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
                  name="audioUploadMethod"
                  value="file"
                  checked={audioUploadMethod === 'file'}
                  onChange={(e) => setAudioUploadMethod(e.target.value)}
                  className="mr-2"
                />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="audioUploadMethod"
                  value="url"
                  checked={audioUploadMethod === 'url'}
                  onChange={(e) => setAudioUploadMethod(e.target.value)}
                  className="mr-2"
                />
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
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        name="file"
                        className="sr-only"
                        accept="audio/mpeg,audio/wav,audio/ogg"
                        onChange={onAudioInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP3, WAV, or OGG up to 20MB
                  </p>
                </div>
              </div>
              {audioPreview && audioUploadMethod === 'file' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <audio
                    src={audioPreview}
                    controls
                    className="w-full rounded-lg border border-gray-200"
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
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/audio.mp3"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Direct link to audio file
              </p>
              {audioUrl && audioUploadMethod === 'url' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                    onError={() => console.log('Audio URL may be invalid or not accessible')}
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
              value={audioDescription}
              onChange={(e) => setAudioDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a description for your audio (optional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddAudio}
            disabled={!audioTitle || (audioUploadMethod === 'file' && !audioFile) || (audioUploadMethod === 'url' && !audioUrl)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Add Audio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioDialog;
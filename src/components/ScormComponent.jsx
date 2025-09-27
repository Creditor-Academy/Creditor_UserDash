import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Loader2, Box } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ScormService from '@/services/scormService';

const ScormComponent = ({ 
  isOpen, 
  onClose, 
  onSave, 
  lessonId,
  moduleId 
}) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if it's a zip file
      if (file.type !== 'application/zip' && !file.name.toLowerCase().endsWith('.zip')) {
        toast.error('Please select a ZIP file only');
        return;
      }
      
      // Check file size (limit to 1GB)
      const maxFileSize = 1024 * 1024 * 1024; // 1GB
      if (file.size > maxFileSize) {
        toast.error(`File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed size of 1GB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the SCORM package');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a ZIP file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload the SCORM package
      const uploadResult = await ScormService.uploadScorm({
        moduleId: moduleId,
        lessonId: lessonId,
        file: selectedFile,
        uploadedBy: localStorage.getItem('userId') || 'anonymous',
        description: title,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });

      // Create the SCORM block data
      const scormBlockData = {
        id: uploadResult.data?.id || `scorm_${Date.now()}`,
        type: 'scorm',
        title: title,
        content: {
          title: title,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          uploadResult: uploadResult,
          scormUrl: uploadResult.data?.url || uploadResult.data?.launchUrl || uploadResult.url,
          resourceId: uploadResult.data?.resourceId || uploadResult.data?.id,
          scormId: uploadResult.data?.id,
          moduleId: moduleId,
          lessonId: lessonId
        },
        order: Date.now()
      };

      // Call the onSave callback with the block data
      onSave(scormBlockData);

      toast.success('SCORM package uploaded successfully!');
      handleClose();
    } catch (error) {
      console.error('Error uploading SCORM package:', error);
      toast.error(error.message || 'Failed to upload SCORM package');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-600" />
            Add SCORM Package
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="scorm-title">Title</Label>
            <Input
              id="scorm-title"
              placeholder="Enter SCORM package title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>SCORM Package (ZIP file only)</Label>
            
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload ZIP file
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 1GB
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {uploadProgress < 100 ? 'Uploading...' : 'Processing SCORM package...'}
                      </span>
                      <span className="text-gray-600">
                        {uploadProgress < 100 ? `${uploadProgress}%` : 'Please wait'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadProgress < 100 ? 'bg-blue-600' : 'bg-green-600 animate-pulse'
                        }`}
                        style={{ width: uploadProgress < 100 ? `${uploadProgress}%` : '100%' }}
                      />
                    </div>
                    {uploadProgress >= 100 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Large files may take several minutes to process. Please don't close this dialog.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScormComponent;

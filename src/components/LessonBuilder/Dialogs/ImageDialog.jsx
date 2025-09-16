import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ImageDialog = ({
  isOpen,
  onClose,
  imageTitle,
  setImageTitle,
  imageTemplateText,
  setImageTemplateText,
  imageFile,
  imagePreview,
  mainImageUploading,
  onImageInputChange,
  onAddImage
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setImageTitle('');
    setImageTemplateText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={imageTitle}
              onChange={onImageInputChange}
              className="w-full p-2 border rounded"
              placeholder="Enter image title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text on/with Image
            </label>
            <ReactQuill
              theme="snow"
              value={imageTemplateText}
              onChange={setImageTemplateText}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ align: [] }],
                  ['clean']
                ]
              }}
              style={{ minHeight: '120px' }}
              placeholder="Enter text to show with or on the image"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      name="file"
                      className="sr-only"
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={onImageInputChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={onAddImage} 
            disabled={!imageTitle || (!imageFile && !imagePreview) || mainImageUploading}
          >
            {mainImageUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Add Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDialog;
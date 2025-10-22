import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const PDFDialog = ({
  isOpen,
  onClose,
  pdfTitle,
  setPdfTitle,
  pdfDescription,
  setPdfDescription,
  pdfUploadMethod,
  setPdfUploadMethod,
  pdfFile,
  pdfUrl,
  setPdfUrl,
  pdfPreview,
  isUploading,
  currentBlock,
  onPdfInputChange,
  onAddPdf
}) => {
  const handleDialogClose = () => {
    // Reset form state
    setPdfTitle('');
    setPdfDescription('');
    setPdfUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{currentBlock ? 'Edit PDF' : 'Add PDF'}</DialogTitle>
          <p className="text-sm text-gray-500">Upload a PDF file or provide a PDF URL</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={pdfTitle}
              onChange={onPdfInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter PDF title"
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
                  name="pdfUploadMethod"
                  value="file"
                  checked={pdfUploadMethod === 'file'}
                  onChange={(e) => setPdfUploadMethod(e.target.value)}
                  className="mr-2"
                />
                Upload File
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="pdfUploadMethod"
                  value="url"
                  checked={pdfUploadMethod === 'url'}
                  onChange={(e) => setPdfUploadMethod(e.target.value)}
                  className="mr-2"
                />
                PDF URL
              </label>
            </div>
          </div>

          {/* File Upload Section */}
          {pdfUploadMethod === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File <span className="text-red-500">*</span>
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
                        accept="application/pdf"
                        onChange={onPdfInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF up to 20MB
                  </p>
                </div>
              </div>
              {pdfPreview && pdfUploadMethod === 'file' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <embed
                    src={pdfPreview}
                    type="application/pdf"
                    width="100%"
                    height="500"
                    className="rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Input Section */}
          {pdfUploadMethod === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Direct link to PDF file
              </p>
              {pdfUrl && pdfUploadMethod === 'url' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <embed
                    src={pdfUrl}
                    type="application/pdf"
                    width="100%"
                    height="500"
                    className="rounded-lg border border-gray-200"
                    onError={() => alert('Could not load PDF. Please check the URL and try again.')}
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
              name="description"
              value={pdfDescription}
              onChange={onPdfInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a description for your PDF (optional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddPdf}
            disabled={!pdfTitle || (pdfUploadMethod === 'file' && !pdfFile) || (pdfUploadMethod === 'url' && !pdfUrl)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              currentBlock ? 'Update PDF' : 'Add PDF'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFDialog;
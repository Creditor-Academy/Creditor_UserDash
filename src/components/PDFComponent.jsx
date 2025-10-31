import React, { useState, useEffect } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { uploadImage } from '@/services/imageUploadService';

const PDFComponent = ({
  showPdfDialog,
  setShowPdfDialog,
  onPdfUpdate,
  editingPdfBlock
}) => {
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUploadMethod, setPdfUploadMethod] = useState('file');
  const [mainPdfUploading, setMainPdfUploading] = useState(false);

  // Reset form when dialog opens/closes or when editing a different block
  useEffect(() => {
    if (showPdfDialog && editingPdfBlock) {
      // Editing mode - populate with existing data
      setPdfTitle(editingPdfBlock.pdfTitle || '');
      setPdfDescription(editingPdfBlock.pdfDescription || '');
      setPdfUrl(editingPdfBlock.pdfUrl || editingPdfBlock.details?.pdf_url || '');
      setPdfUploadMethod(editingPdfBlock.uploadMethod || 'file');
      setPdfPreview(editingPdfBlock.pdfUrl || editingPdfBlock.details?.pdf_url || '');
    } else if (showPdfDialog && !editingPdfBlock) {
      // New PDF mode - reset form
      resetForm();
    }
  }, [showPdfDialog, editingPdfBlock]);

  const resetForm = () => {
    setPdfTitle('');
    setPdfDescription('');
    setPdfFile(null);
    setPdfPreview('');
    setPdfUrl('');
    setPdfUploadMethod('file');
  };

  const handlePdfDialogClose = () => {
    setShowPdfDialog(false);
    resetForm();
  };

  const handlePdfInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      setPdfFile(files[0]);
      setPdfPreview(URL.createObjectURL(files[0]));
    } else if (name === 'title') {
      setPdfTitle(value);
    } else if (name === 'description') {
      setPdfDescription(value);
    } else if (name === 'url') {
      setPdfUrl(value);
    }
  };

  const handleAddPdf = async () => {
    // Validate required fields based on upload method
    if (!pdfTitle) {
      alert('Please enter a PDF title');
      return;
    }
   
    if (pdfUploadMethod === 'file' && !pdfFile) {
      alert('Please select a PDF file');
      return;
    }
   
    if (pdfUploadMethod === 'url' && !pdfUrl) {
      alert('Please enter a PDF URL');
      return;
    }

    setMainPdfUploading(true);

    try {
      // Create PDF URL based on upload method
      let finalPdfUrl = '';
      let uploadedPdfData = null;
      
      if (pdfUploadMethod === 'file') {
        try {
          const result = await uploadImage(pdfFile, { 
            fieldName: 'resource', 
            folder: 'lesson-resources', 
            public: true, 
            type: 'pdf' 
          });
          
          if (result?.success && result?.imageUrl) {
            finalPdfUrl = result.imageUrl;
            uploadedPdfData = result;
            toast.success('PDF uploaded successfully!');
          } else {
            throw new Error('Upload failed - no URL returned');
          }
        } catch (err) {
          console.error('PDF upload error:', err);
          toast.error(err.message || 'Failed to upload PDF. Using local preview.');
          finalPdfUrl = URL.createObjectURL(pdfFile);
        }
      } else {
        finalPdfUrl = pdfUrl;
      }

      const pdfBlock = {
        id: editingPdfBlock?.id || `pdf-${Date.now()}`,
        block_id: editingPdfBlock?.id || `pdf-${Date.now()}`,
        type: 'pdf',
        title: 'PDF',
        pdfTitle: pdfTitle,
        pdfDescription: pdfDescription,
        pdfFile: pdfUploadMethod === 'file' ? pdfFile : null,
        pdfUrl: finalPdfUrl,
        uploadMethod: pdfUploadMethod,
        originalUrl: pdfUploadMethod === 'url' ? pdfUrl : null,
        uploadedPdfData,
        timestamp: new Date().toISOString(),
        details: {
          pdf_url: finalPdfUrl,
          caption: pdfTitle,
          description: pdfDescription,
        },
        html_css: `
          <div class="lesson-pdf">
            ${pdfTitle ? `<h3 class="pdf-title">${pdfTitle}</h3>` : ''}
            ${pdfDescription ? `<p class="pdf-description">${pdfDescription}</p>` : ''}
            <iframe src="${finalPdfUrl}" class="pdf-iframe" style="width: 100%; height: 600px; border: none; border-radius: 12px;"></iframe>
          </div>
        `
      };

      // Call the parent's onPdfUpdate callback
      onPdfUpdate(pdfBlock);
      
      // Close dialog and reset
      handlePdfDialogClose();
    } catch (error) {
      console.error('Error in handleAddPdf:', error);
      toast.error('Failed to add PDF. Please try again.');
    } finally {
      setMainPdfUploading(false);
    }
  };

  return (
    <>
      {/* PDF Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={handlePdfDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPdfBlock ? 'Edit PDF' : 'Add PDF'}</DialogTitle>
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
                onChange={handlePdfInputChange}
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
                          onChange={handlePdfInputChange}
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
                onChange={handlePdfInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your PDF (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handlePdfDialogClose} disabled={mainPdfUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPdf}
              disabled={mainPdfUploading || !pdfTitle || (pdfUploadMethod === 'file' && !pdfFile) || (pdfUploadMethod === 'url' && !pdfUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mainPdfUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {pdfUploadMethod === 'file' ? 'Uploading PDF...' : 'Adding PDF...'}
                </>
              ) : (
                editingPdfBlock ? 'Update PDF' : 'Add PDF'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

PDFComponent.displayName = 'PDFComponent';

export default PDFComponent;

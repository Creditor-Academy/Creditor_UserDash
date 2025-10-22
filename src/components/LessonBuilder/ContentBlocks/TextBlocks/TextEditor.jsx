import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import { getToolbarModules } from '@/utils/LessonBuilder/quillConfig';
import { textTypes } from '@/constants/LessonBuilder/textTypes';
import 'react-quill/dist/quill.snow.css';

const TextEditor = ({
  isOpen,
  onClose,
  currentTextBlockId,
  currentTextType,
  editorHtml,
  editorHeading,
  editorSubheading,
  editorContent,
  onEditorHtmlChange,
  onEditorHeadingChange,
  onEditorSubheadingChange,
  onEditorContentChange,
  onSave,
  contentBlocks
}) => {
  const getCurrentTextType = () => {
    const currentBlock = contentBlocks.find(b => b.id === currentTextBlockId);
    return currentTextType || currentBlock?.textType;
  };

  const getTextTypeTitle = () => {
    const textType = getCurrentTextType();
    if (textType) {
      const textTypeObj = textTypes.find(t => t.id === textType);
      return textTypeObj ? ` (${textTypeObj.title})` : '';
    }
    return '';
  };

  const textType = getCurrentTextType();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {currentTextBlockId ? 'Edit' : 'Add'} Text Block{getTextTypeTitle()}
          </DialogTitle>
        </DialogHeader>
       
        <div className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
          <div className="pr-4">
            {/* Heading only */}
            {textType === 'heading' && (
              <div className="flex-1 flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading Content
                </label>
                <div className="flex-1 min-h-[200px]">
                  <ReactQuill
                    theme="snow"
                    value={editorHtml}
                    onChange={onEditorHtmlChange}
                    modules={getToolbarModules('heading')}
                    className="h-full"
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            )}

            {/* Master Heading only */}
            {textType === 'master_heading' && (
              <div className="flex-1 flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Master Heading Content (Text Only)
                </label>
                <div className="flex-1 min-h-[100px]">
                  <input
                    type="text"
                    value={editorHtml}
                    onChange={(e) => onEditorHtmlChange(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-xl font-bold"
                    placeholder="Enter master heading text..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This will be displayed with a gradient background automatically
                  </p>
                </div>
              </div>
            )}

            {/* Subheading only */}
            {textType === 'subheading' && (
              <div className="flex-1 flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading Content
                </label>
                <div className="flex-1 min-h-[200px]">
                  <ReactQuill
                    theme="snow"
                    value={editorHtml}
                    onChange={onEditorHtmlChange}
                    modules={getToolbarModules('subheading')}
                    className="h-full"
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            )}

            {/* Paragraph only */}
            {textType === 'paragraph' && (
              <div className="flex-1 flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paragraph Content
                </label>
                <div className="flex-1 min-h-[300px]">
                  <ReactQuill
                    theme="snow"
                    value={editorHtml}
                    onChange={onEditorHtmlChange}
                    modules={getToolbarModules('full')}
                    className="h-full"
                    style={{ height: '300px' }}
                  />
                </div>
              </div>
            )}

            {/* Heading + Paragraph */}
            {textType === 'heading_paragraph' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heading
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editorHeading}
                    onChange={onEditorHeadingChange}
                    modules={getToolbarModules('heading')}
                    style={{ height: '120px' }}
                  />
                </div>
                <div className="mt-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paragraph Content
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={onEditorContentChange}
                    modules={getToolbarModules('full')}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            )}

            {/* Subheading + Paragraph */}
            {textType === 'subheading_paragraph' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subheading
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editorSubheading}
                    onChange={onEditorSubheadingChange}
                    modules={getToolbarModules('subheading')}
                    style={{ height: '120px' }}
                  />
                </div>
                <div className="mt-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paragraph Content
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={onEditorContentChange}
                    modules={getToolbarModules('full')}
                    style={{ height: '200px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-20">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {currentTextBlockId ? 'Update' : 'Add'} Text Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextEditor;
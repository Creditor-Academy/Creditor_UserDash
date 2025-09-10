import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  FileText, X, ChevronRight, MessageSquare, AlertCircle, Info, CheckCircle, 
  FileTextIcon, Type, Heading1, Heading2, Text
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Statement types with their specific styling and content
const statementTypes = [
  {
    id: 'statement-a',
    title: 'Bordered Quote',
    icon: <FileText className="h-5 w-5" />,
    preview: (
      <div className="border-t border-b border-gray-800 py-8 px-6">
        <p className="text-gray-900 text-2xl leading-relaxed text-center font-bold">
          You're the master of your life, the captain of your ship. 
        </p>
      </div>
    ),
    defaultContent: "You're the master of your life, the captain of your ship. Steer it with intention. Will you skirt the coast from one safe harbor to the next? Or will you sail into the vast open blue? Every day you get to decide anew what course to chart."
  },
  {
    id: 'statement-b',
    title: 'Elegant Quote',
    icon: <FileText className="h-5 w-5" />,
    preview: (
      <div className="relative pt-8 pb-8 px-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        <p className="text-gray-800 text-3xl leading-relaxed text-center font-light">
          You're the master of your life, the captain of your ship. Steer it with intention.
        </p>
      </div>
    ),
    defaultContent: "You're the master of your life, the captain of your ship. Steer it with intention. Will you skirt the coast from one safe harbor to the next? Or will you sail into the vast open blue? Every day you get to decide anew what course to chart."
  },
  {
    id: 'statement-c',
    title: 'Highlighted Text',
    icon: <FileText className="h-5 w-5" />,
    preview: (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-8 px-6 border-l-4 border-orange-500">
        <p className="text-gray-700 text-xl leading-relaxed">
          Stop chasing <span className="font-bold text-gray-900 bg-orange-100 px-1 rounded">your thoughts</span> in circles. <span className="font-bold text-gray-900 bg-orange-100 px-1 rounded">Open your eyes</span>, breathe deeply, and then <span className="font-bold text-gray-900 bg-orange-100 px-1 rounded">pay attention</span>. The air is sweet. <span className="font-bold text-gray-900 bg-orange-100 px-1 rounded">The sun is warm</span>. There's a path ahead.
        </p>
      </div>
    ),
    defaultContent: "Stop chasing <strong>your thoughts</strong> in circles. <strong>Open your eyes</strong>, breathe deeply, and then <strong>pay attention</strong>. The air is sweet. <strong>The sun is warm</strong>. There's a path ahead."
  },
  {
    id: 'statement-d',
    title: 'Corner Border Quote',
    icon: <FileText className="h-5 w-5" />,
    preview: (
      <div className="relative bg-white py-6 px-6">
        <div className="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
        <p className="text-gray-900 text-lg leading-relaxed font-bold">
          You're the master of your life, the captain of your ship.
        </p>
      </div>
    ),
    defaultContent: "You're the master of your life, the captain of your ship. Steer it with intention. Will you skirt the coast from one safe harbor to the next? Or will you sail into the vast open blue? Every day you get to decide anew what course to chart."
  },
  {
    id: 'note',
    title: 'Note',
    icon: <Info className="h-5 w-5" />,
    preview: (
      <div className="border border-orange-300 bg-orange-50 p-4 rounded">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <Info className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-sm leading-relaxed">
              When you're on a new path but aren't sure where it leads, keep putting one foot in front of the other. It's the only way you'll arrive.
            </p>
          </div>
        </div>
      </div>
    ),
    defaultContent: "When you're on a new path but aren't sure where it leads, keep putting one foot in front of the other. It's the only way you'll arrive."
  }
];

// Import Quill and register font families
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'impact', 'roboto'];
ReactQuill.Quill.register(Font, true);

const Size = ReactQuill.Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
ReactQuill.Quill.register(Size, true);

// Comprehensive toolbar configuration for statement editor
const statementToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': Size.whitelist }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['clean']
];

const getStatementToolbarModules = () => ({
  toolbar: statementToolbar
});

const StatementComponent = React.forwardRef(({ 
  showStatementSidebar, 
  setShowStatementSidebar, 
  onStatementSelect,
  sidebarCollapsed,
  setSidebarCollapsed,
  onStatementEdit // Add this prop to handle statement editing from parent
}, ref) => {
  const [showStatementEditorDialog, setShowStatementEditorDialog] = useState(false);
  const [currentStatementType, setCurrentStatementType] = useState(null);
  const [statementContent, setStatementContent] = useState('');
  const [currentStatementBlockId, setCurrentStatementBlockId] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

  // Expose handleEditStatement to parent component
  React.useImperativeHandle(ref, () => ({
    handleEditStatement
  }));

  const handleStatementTypeSelect = (statementType) => {
    // Generate HTML content with proper styling to match the preview exactly
    let htmlContent = '';
    
    if (statementType.id === 'statement-a') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="border-t border-b border-gray-800 py-8 px-6">
              <p class="text-gray-900 text-2xl leading-relaxed text-center font-bold">
                ${statementType.defaultContent}
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (statementType.id === 'statement-b') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="relative pt-8 pb-8 px-6 bg-gradient-to-br from-gray-50 to-white shadow-sm rounded-lg">
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
              <p class="text-gray-800 text-3xl leading-relaxed text-center font-light">
                ${statementType.defaultContent}
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (statementType.id === 'statement-c') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 py-8 px-6 border-l-4 border-orange-500 rounded-lg">
              <p class="text-gray-700 text-xl leading-relaxed">
                ${statementType.defaultContent}
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (statementType.id === 'statement-d') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="relative bg-white py-6 px-6 border rounded-lg">
              <div class="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
              <p class="text-gray-900 text-lg leading-relaxed font-bold">
                ${statementType.defaultContent}
              </p>
            </div>
          </div>
        </div>
      `;
    } else if (statementType.id === 'statement-e') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="border border-orange-300 bg-white p-4 rounded">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 text-base leading-relaxed">
                    ${statementType.defaultContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (statementType.id === 'note') {
      htmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
          <div class="pl-4">
            <div class="border border-orange-300 bg-orange-50 p-4 rounded">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 text-sm leading-relaxed">
                    ${statementType.defaultContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'statement',
      title: statementType.title,
      statementType: statementType.id,
      content: statementType.defaultContent,
      html_css: htmlContent,
      order: 1
    };

    // Call the parent's onStatementSelect function
    if (onStatementSelect) {
      onStatementSelect(newBlock);
    }

    // Close the sidebar
    setShowStatementSidebar(false);
    setSidebarCollapsed(true);
  };

  const handleEditStatement = (blockId, statementType, content, htmlContent = null) => {
    setCurrentStatementBlockId(blockId);
    
    // If statementType is not provided, try to detect it from htmlContent
    let detectedStatementType = statementType;
    if (!detectedStatementType && htmlContent) {
      if (htmlContent.includes('border-t border-b border-gray-800')) {
        detectedStatementType = 'statement-a';
      } else if (htmlContent.includes('absolute top-0 left-1/2')) {
        detectedStatementType = 'statement-b';
      } else if (htmlContent.includes('bg-gray-100')) {
        detectedStatementType = 'statement-c';
      } else if (htmlContent.includes('absolute top-0 left-0 w-16 h-1')) {
        detectedStatementType = 'statement-d';
      } else if (htmlContent.includes('border-orange-300 bg-orange-50')) {
        detectedStatementType = 'note';
      }
    }
    
    setCurrentStatementType(detectedStatementType);
    
    // Always prioritize the content parameter if it exists and has meaningful content
    let actualContent = '';
    
    if (content && content.trim() !== '') {
      // Use the content parameter directly - this is the saved/updated content
      actualContent = content;
    } else if (htmlContent) {
      // Only extract from HTML if no content parameter exists
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Find the content within the statement structure - prioritize <p> tags
      let contentElement = tempDiv.querySelector('p');
      if (!contentElement) {
        // Fallback to any element that contains actual text content
        const allElements = tempDiv.querySelectorAll('*');
        for (let element of allElements) {
          // Skip structural elements and find elements with meaningful text
          if (element.children.length === 0 && element.textContent.trim().length > 0) {
            contentElement = element;
            break;
          }
        }
      }
      
      if (contentElement) {
        actualContent = contentElement.innerHTML;
      } else {
        // Final fallback: get all text content and preserve basic formatting
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        actualContent = textContent.trim();
      }
    }
    
    // Only use default content as absolute last resort
    if (!actualContent || actualContent.trim() === '') {
      const defaultStatementType = statementTypes.find(st => st.id === detectedStatementType);
      actualContent = defaultStatementType?.defaultContent || '';
    }
    
    setStatementContent(actualContent);
    setPreviewContent(actualContent);
    setShowStatementEditorDialog(true);
  };

  // Handle content changes and update preview
  const handleContentChange = (content) => {
    setStatementContent(content);
    setPreviewContent(content);
  };

  // Generate preview HTML based on statement type and content
  const generatePreviewHtml = (statementType, content) => {
    const cleanContent = content || '';
    
    if (statementType === 'statement-a') {
      return (
        <div className="border-t border-b border-gray-800 py-8 px-6">
          <div className="text-gray-900 text-2xl leading-relaxed text-center font-bold" dangerouslySetInnerHTML={{ __html: cleanContent }} />
        </div>
      );
    } else if (statementType === 'statement-b') {
      return (
        <div className="relative pt-8 pb-6 px-6">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-orange-500"></div>
          <div className="text-gray-800 text-3xl leading-relaxed text-center font-light" dangerouslySetInnerHTML={{ __html: cleanContent }} />
        </div>
      );
    } else if (statementType === 'statement-c') {
      return (
        <div className="bg-gray-100 py-8 px-6">
          <div className="text-gray-700 text-xl leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanContent }} />
        </div>
      );
    } else if (statementType === 'statement-d') {
      return (
        <div className="relative bg-white py-6 px-6">
          <div className="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
          <div className="text-gray-900 text-lg leading-relaxed font-bold" dangerouslySetInnerHTML={{ __html: cleanContent }} />
        </div>
      );
    } else if (statementType === 'note') {
      return (
        <div className="border border-orange-300 bg-orange-50 p-4 rounded">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Info className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-gray-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanContent }} />
            </div>
          </div>
        </div>
      );
    }
    
    return <div dangerouslySetInnerHTML={{ __html: cleanContent }} />;
  };

  const handleSaveStatement = () => {
    if (onStatementEdit && currentStatementBlockId) {
      // Generate updated HTML content with the new formatted content
      let htmlContent = '';
      
      if (currentStatementType === 'statement-a') {
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <div class="border-t border-b border-gray-800 py-8 px-6">
                <p class="text-gray-900 text-2xl leading-relaxed text-center font-bold">
                  ${statementContent}
                </p>
              </div>
            </div>
          </div>
        `;
      } else if (currentStatementType === 'statement-b') {
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <div class="relative pt-8 pb-8 px-6 bg-gradient-to-br from-gray-50 to-white shadow-sm rounded-lg">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
                <p class="text-gray-800 text-3xl leading-relaxed text-center font-light">
                  ${statementContent}
                </p>
              </div>
            </div>
          </div>
        `;
      } else if (currentStatementType === 'statement-c') {
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 py-8 px-6 border-l-4 border-orange-500 rounded-lg">
                <p class="text-gray-700 text-xl leading-relaxed">
                  ${statementContent}
                </p>
              </div>
            </div>
          </div>
        `;
      } else if (currentStatementType === 'statement-d') {
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <div class="relative bg-white py-6 px-6 border rounded-lg">
                <div class="absolute top-0 left-0 w-16 h-1 bg-orange-500"></div>
                <p class="text-gray-900 text-lg leading-relaxed font-bold">
                  ${statementContent}
                </p>
              </div>
            </div>
          </div>
        `;
      } else if (currentStatementType === 'note') {
        htmlContent = `
          <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
            <div class="pl-4">
              <div class="border border-orange-300 bg-orange-50 p-4 rounded">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-800 text-sm leading-relaxed">
                      ${statementContent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      
      // Call parent's edit handler with updated content
      onStatementEdit(currentStatementBlockId, statementContent, htmlContent);
    }
    
    setShowStatementEditorDialog(false);
    setCurrentStatementBlockId(null);
    setCurrentStatementType(null);
    setStatementContent('');
    setPreviewContent('');
  };

  return (
    <>
      {/* Statement Type Sidebar */}
      {showStatementSidebar && (
        <div className="fixed inset-0 z-[9999] flex">
          <div className="w-[480px] bg-white shadow-2xl animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Statement Types</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Choose a statement type to add to your lesson
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStatementSidebar(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              {statementTypes.map((statementType) => (
                <div 
                  key={statementType.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-gray-300 overflow-hidden"
                  onClick={() => handleStatementTypeSelect(statementType)}
                >
                  <div className="p-0">
                    {statementType.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setShowStatementSidebar(false)} />
        </div>
      )}

      {/* Statement Editor Dialog */}
      <Dialog open={showStatementEditorDialog} onOpenChange={setShowStatementEditorDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Statement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <ReactQuill
                value={statementContent}
                onChange={handleContentChange}
                modules={getStatementToolbarModules()}
                theme="snow"
                placeholder="Enter your statement content..."
                style={{ height: '250px', marginBottom: '50px' }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatementEditorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatement}>
              Save Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default StatementComponent;
export { statementTypes };

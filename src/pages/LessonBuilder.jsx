import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VideoComponent from '@/components/VideoComponent';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
  Image,
  Video,
  FileText as FileTextIcon,
  Link as LinkIcon,
  List,
  Table,
  Loader2,
  MessageSquare,
  Quote,
  Layers,
  Sparkles,
  Minus,
  Volume2,
  Youtube,
  CheckCircle,
  X,
} from 'lucide-react';
import AIEnhancementPanel from '@/components/courses/AILessonContentGenerator';
import { toast } from 'react-hot-toast';
import QuoteComponent from '@/components/QuoteComponent';
import TableComponent from '@/components/TableComponent';
import ListComponent from '@/components/ListComponent';
import InteractiveComponent from '@/components/InteractiveComponent';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import StatementComponent from '@/components/statement';
import DividerComponent from '@/components/DividerComponent';
import AudioComponent from '@/components/AudioComponent';
import YouTubeComponent from '@/components/YouTubeComponent';
import PDFComponent from '@/components/PDFComponent';
import LinkComponent from '@/components/LinkComponent';
import ImageBlockComponent from '@/components/ImageBlockComponent';
import TextBlockComponent from '@/components/TextBlockComponent';
import InteractiveListRenderer from '@/components/InteractiveListRenderer';
import {
  injectStyles,
  initializeGlobalFunctions,
} from '@/utils/LessonBuilder/styleSheets';
import '@/utils/LessonBuilder/quillConfig';
import { getToolbarModules } from '@/utils/LessonBuilder/quillConfig';
import { textTypes } from '@/constants/LessonBuilder/textTypesConfig';
import { getPlainText } from '@/utils/LessonBuilder/blockHelpers';

// Initialize styles and global functions
injectStyles();
initializeGlobalFunctions();

function LessonBuilder() {
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(SidebarContext);
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(
    location.state?.lessonData || null
  );
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState({});
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [editingVideoBlock, setEditingVideoBlock] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTextEditorDialog, setShowTextEditorDialog] = useState(false);
  const [currentTextBlockId, setCurrentTextBlockId] = useState(null);
  const [currentTextType, setCurrentTextType] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editingLinkBlock, setEditingLinkBlock] = useState(null);
  const [showImageTemplateSidebar, setShowImageTemplateSidebar] =
    useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTextTypeSidebar, setShowTextTypeSidebar] = useState(false);
  const [showStatementSidebar, setShowStatementSidebar] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [editingPdfBlock, setEditingPdfBlock] = useState(null);
  const [showQuoteTemplateSidebar, setShowQuoteTemplateSidebar] =
    useState(false);
  const [showQuoteEditDialog, setShowQuoteEditDialog] = useState(false);
  const [editingQuoteBlock, setEditingQuoteBlock] = useState(null);
  const [showListTemplateSidebar, setShowListTemplateSidebar] = useState(false);
  const [showListEditDialog, setShowListEditDialog] = useState(false);
  const [editingListBlock, setEditingListBlock] = useState(null);
  const [showTableComponent, setShowTableComponent] = useState(false);
  const [editingTableBlock, setEditingTableBlock] = useState(null);
  const [showInteractiveTemplateSidebar, setShowInteractiveTemplateSidebar] =
    useState(false);
  const [showInteractiveEditDialog, setShowInteractiveEditDialog] =
    useState(false);
  const [editingInteractiveBlock, setEditingInteractiveBlock] = useState(null);
  const [showDividerTemplateSidebar, setShowDividerTemplateSidebar] =
    useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [editingAudioBlock, setEditingAudioBlock] = useState(null);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [editingYouTubeBlock, setEditingYouTubeBlock] = useState(null);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Inline block insertion state
  const [insertionPosition, setInsertionPosition] = useState(null);
  const [showInsertBlockDialog, setShowInsertBlockDialog] = useState(false); // Show insert block dialog

  // Editor state for edit modal
  const [editorContent, setEditorContent] = useState('');
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');

  // Content block types with icons for the sidebar
  const contentBlockTypes = [
    {
      id: 'text',
      title: 'Text',
      icon: <FileTextIcon className="h-5 w-5" />,
    },
    {
      id: 'statement',
      title: 'Statement',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: 'quote',
      title: 'Quote',
      icon: <Quote className="h-5 w-5" />,
    },
    {
      id: 'image',
      title: 'Image',
      icon: <Image className="h-5 w-5" />,
    },
    {
      id: 'youtube',
      title: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
    },
    {
      id: 'video',
      title: 'Video',
      icon: <Video className="h-5 w-5" />,
    },
    {
      id: 'audio',
      title: 'Audio',
      icon: <Volume2 className="h-5 w-5" />,
    },
    {
      id: 'link',
      title: 'Link',
      icon: <LinkIcon className="h-5 w-5" />,
    },
    {
      id: 'pdf',
      title: 'PDF',
      icon: <FileTextIcon className="h-5 w-5" />,
    },
    {
      id: 'list',
      title: 'List',
      icon: <List className="h-5 w-5" />,
    },
    {
      id: 'tables',
      title: 'Tables',
      icon: <Table className="h-5 w-5" />,
    },
    {
      id: 'interactive',
      title: 'Interactive',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      id: 'divider',
      title: 'Divider',
      icon: <Minus className="h-5 w-5" />,
    },
  ];

  const statementComponentRef = React.useRef();
  const listComponentRef = React.useRef();
  const quoteComponentRef = React.useRef();
  const dividerComponentRef = React.useRef();
  const imageBlockComponentRef = React.useRef();

  // Warn user before leaving page with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = e => {
      if (hasUnsavedChanges || autoSaveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSaveStatus]);

  // Track previous contentBlocks to detect actual changes
  const prevContentBlocksRef = React.useRef([]);
  const prevLessonContentRef = React.useRef(null);
  const isInitialLoadRef = React.useRef(true);

  const handleBlockClick = (blockType, position = null) => {
    // Store the insertion position for use in subsequent handlers
    if (position !== null) {
      setInsertionPosition(position);
    }

    if (blockType.id === 'text') {
      setShowTextTypeSidebar(true);
    } else if (blockType.id === 'statement') {
      setShowStatementSidebar(true);
    } else if (blockType.id === 'quote') {
      setShowQuoteTemplateSidebar(true);
    } else if (blockType.id === 'list') {
      setShowListTemplateSidebar(true);
    } else if (blockType.id === 'video') {
      setShowVideoDialog(true);
    } else if (blockType.id === 'youtube') {
      setShowYouTubeDialog(true);
    } else if (blockType.id === 'audio') {
      setShowAudioDialog(true);
    } else if (blockType.id === 'image') {
      setShowImageTemplateSidebar(true);
    } else if (blockType.id === 'tables') {
      setShowTableComponent(true);
    } else if (blockType.id === 'link') {
      setShowLinkDialog(true);
    } else if (blockType.id === 'pdf') {
      setShowPdfDialog(true);
    } else if (blockType.id === 'interactive') {
      setShowInteractiveTemplateSidebar(true);
    } else if (blockType.id === 'divider') {
      setShowDividerTemplateSidebar(true);
    } else {
      // For simple blocks that don't need dialogs, insert immediately
      if (position !== null) {
        insertContentBlockAt(blockType, position);
        setInsertionPosition(null);
      } else {
        addContentBlock(blockType);
      }
    }
  };

  const addContentBlock = (blockType, textType = null) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order:
        (lessonContent?.data?.content
          ? lessonContent.data.content.length
          : contentBlocks.length) + 1,
    };

    // If we have existing lesson content, add to that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock],
        },
      }));
    } else {
      // For new lessons, add to contentBlocks
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  // Insert block at a specific position
  const insertContentBlockAt = (blockType, position, textType = null) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: position + 1,
    };

    // If we have existing lesson content, insert into that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => {
        const newContent = [...prevLessonContent.data.content];
        newContent.splice(position, 0, newBlock);
        return {
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: newContent,
          },
        };
      });
    } else {
      // For new lessons, insert into contentBlocks
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(position, 0, newBlock);
        return newBlocks;
      });
    }
  };

  const handleStatementSelect = statementBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, statementBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, statementBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Only add to contentBlocks - this is the primary state for managing blocks
      setContentBlocks(prevBlocks => [...prevBlocks, statementBlock]);
    }
  };

  const handleStatementEdit = (blockId, content, htmlContent) => {
    // Detect statement type from HTML content to preserve it
    let detectedStatementType = 'statement-a'; // default fallback
    if (htmlContent) {
      if (htmlContent.includes('border-t border-b border-gray-800')) {
        detectedStatementType = 'statement-a';
      } else if (
        htmlContent.includes('absolute top-0 left-1/2') &&
        htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')
      ) {
        detectedStatementType = 'statement-b';
      } else if (
        htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') &&
        htmlContent.includes('border-l-4 border-orange-500')
      ) {
        detectedStatementType = 'statement-c';
      } else if (htmlContent.includes('absolute top-0 left-0 w-16 h-1')) {
        detectedStatementType = 'statement-d';
      } else if (htmlContent.includes('border-orange-300 bg-orange-50')) {
        detectedStatementType = 'note';
      }
    }

    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              statementType: detectedStatementType, // Preserve statement type
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  statementType: detectedStatementType, // Preserve statement type
                  // Also update details if they exist
                  details: {
                    ...block.details,
                    content,
                    statement_type: detectedStatementType,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  // Quote component callbacks
  const handleQuoteTemplateSelect = newBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Only add to contentBlocks - this is the primary state for managing blocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
  };

  // Table component callbacks
  const handleTableTemplateSelect = newBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Only add to contentBlocks - this is the primary state for managing blocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
  };

  // Interactive component callbacks
  const handleInteractiveTemplateSelect = newBlock => {
    const interactiveBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'interactive',
      title: 'Interactive',
      content: newBlock.content,
      html_css: newBlock.html_css,
      order: contentBlocks.length + 1,
    };

    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, interactiveBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, interactiveBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      setContentBlocks(prevBlocks => [...prevBlocks, interactiveBlock]);
    }
  };

  const handleInteractiveUpdate = (blockId, updatedContent) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              type: 'interactive', // Ensure type remains interactive
              subtype: updatedContent.subtype || block.subtype || 'accordion', // Preserve subtype
              content: updatedContent.content,
              html_css: updatedContent.html_css,
            }
          : block
      )
    );
    setEditingInteractiveBlock(null);
  };

  // Divider component callbacks
  const handleDividerTemplateSelect = newBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Only add to contentBlocks - this is the primary state for managing blocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
    setShowDividerTemplateSidebar(false);
  };

  const handleDividerUpdate = (blockId, updatedContent) => {
    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content: updatedContent.content,
              html_css: updatedContent.html_css,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content: updatedContent.content,
                  html_css: updatedContent.html_css,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  // List component callbacks
  const handleListTemplateSelect = newBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Only add to contentBlocks - this is the primary state for managing blocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
  };

  const handleListUpdate = (blockId, content, updatedHtml = null) => {
    // Use provided HTML if available, otherwise regenerate
    let htmlContent = updatedHtml || '';
    let extractedListType = 'bulleted';

    if (content && !updatedHtml) {
      try {
        const parsedContent = JSON.parse(content);
        extractedListType = parsedContent.listType || 'bulleted';
        const items = parsedContent.items || [];
        const checkedItems = parsedContent.checkedItems || {};
        const numberingStyle = parsedContent.numberingStyle || 'decimal';

        // Helper function to get numbering based on style (same as ListComponent)
        const getNumbering = (index, style) => {
          const num = index + 1;
          switch (style) {
            case 'upper-roman':
              return toRoman(num).toUpperCase();
            case 'lower-roman':
              return toRoman(num).toLowerCase();
            case 'upper-alpha':
              return String.fromCharCode(64 + num); // A, B, C...
            case 'lower-alpha':
              return String.fromCharCode(96 + num); // a, b, c...
            case 'decimal':
            default:
              return num.toString();
          }
        };

        // Convert number to Roman numerals
        const toRoman = num => {
          const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
          const symbols = [
            'M',
            'CM',
            'D',
            'CD',
            'C',
            'XC',
            'L',
            'XL',
            'X',
            'IX',
            'V',
            'IV',
            'I',
          ];
          let result = '';

          for (let i = 0; i < values.length; i++) {
            while (num >= values[i]) {
              result += symbols[i];
              num -= values[i];
            }
          }
          return result;
        };

        // Generate HTML based on list type with original styled format
        if (extractedListType === 'numbered') {
          htmlContent = `
            <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <ol class="space-y-4 list-none">
                ${items
                  .map(
                    (item, index) => `
                  <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
                    <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      ${getNumbering(index, numberingStyle)}
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed">
                      ${item}
                    </div>
                  </li>
                `
                  )
                  .join('')}
              </ol>
            </div>`;
        } else if (extractedListType === 'checkbox') {
          htmlContent = `
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
              <div class="space-y-4">
                ${items
                  .map(
                    (item, index) => `
                  <div class="checkbox-container flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-pink-300/50 hover:shadow-md transition-all duration-200 cursor-pointer" data-index="${index}">
                    <div class="flex-shrink-0 mt-1">
                      <div class="checkbox-wrapper w-5 h-5 border-2 border-pink-400 rounded bg-white flex items-center justify-center hover:border-pink-500 transition-colors">
                        <input type="checkbox" ${checkedItems[index] ? 'checked' : ''} class="hidden checkbox-item" data-index="${index}" />
                        <div class="checkbox-visual w-3 h-3 bg-pink-500 rounded-sm ${checkedItems[index] ? 'opacity-100' : 'opacity-0'} transition-opacity"></div>
                      </div>
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed ${checkedItems[index] ? 'line-through text-gray-500' : ''}">
                      ${item}
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>`;
        } else {
          // bulleted list
          htmlContent = `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <ul class="space-y-4 list-none">
                ${items
                  .map(
                    item => `
                  <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                    <div class="flex-shrink-0 mt-2">
                      <div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed">
                      ${item}
                    </div>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </div>`;
        }
      } catch (e) {
        console.error('Error parsing list content:', e);
        extractedListType = 'bulleted';
        htmlContent = `<div class="list-block"><ul class="list-disc list-inside"><li>Error loading list</li></ul></div>`;
      }
    }

    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              listType: extractedListType,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  listType: extractedListType,
                  // Also update details if they exist
                  details: {
                    ...block.details,
                    list_type: extractedListType,
                    listType: extractedListType,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    setEditingListBlock(null);
    setShowListEditDialog(false);
  };

  // Handle checkbox toggle for interactive lists
  const handleCheckboxToggle = async (blockId, itemIndex, checked) => {
    console.log('handleCheckboxToggle called:', {
      blockId,
      itemIndex,
      checked,
    });

    try {
      // Find the block in contentBlocks or lessonContent
      let targetBlock = contentBlocks.find(
        block => block.id === blockId || block.block_id === blockId
      );
      if (!targetBlock && lessonContent?.data?.content) {
        targetBlock = lessonContent.data.content.find(
          block => block.id === blockId || block.block_id === blockId
        );
      }

      if (!targetBlock) {
        console.error('Block not found for checkbox toggle:', blockId);
        return;
      }

      console.log('Found target block:', targetBlock);

      // Parse the current HTML to update checkbox state
      const parser = new DOMParser();
      const doc = parser.parseFromString(targetBlock.html_css, 'text/html');
      const checkboxContainers = doc.querySelectorAll('.checkbox-container');

      if (checkboxContainers[itemIndex]) {
        const container = checkboxContainers[itemIndex];
        const hiddenCheckbox = container.querySelector('.checkbox-item');
        const visualCheckbox = container.querySelector('.checkbox-visual');
        const textElement = container.querySelector('.flex-1');

        if (hiddenCheckbox && visualCheckbox) {
          // Update the hidden checkbox
          hiddenCheckbox.checked = checked;
          if (checked) {
            hiddenCheckbox.setAttribute('checked', 'checked');
          } else {
            hiddenCheckbox.removeAttribute('checked');
          }

          // Update the visual checkbox
          if (checked) {
            visualCheckbox.classList.remove('opacity-0');
            visualCheckbox.classList.add('opacity-100');
          } else {
            visualCheckbox.classList.remove('opacity-100');
            visualCheckbox.classList.add('opacity-0');
          }

          // Update text styling based on checkbox state
          if (textElement) {
            if (checked) {
              // Add line-through and gray text for checked items
              if (!textElement.classList.contains('line-through')) {
                textElement.classList.add('line-through', 'text-gray-500');
              }
              // Remove normal text color classes
              textElement.classList.remove('text-gray-800');
            } else {
              // Remove line-through and gray text for unchecked items
              textElement.classList.remove('line-through', 'text-gray-500');
              // Add back normal text color
              if (!textElement.classList.contains('text-gray-800')) {
                textElement.classList.add('text-gray-800');
              }
            }
          }

          console.log('Updated checkbox state in DOM');
        }
      }

      // Get the updated HTML
      const updatedHtml = doc.body.innerHTML;
      console.log('Updated HTML:', updatedHtml.substring(0, 200));

      // Update the content JSON to reflect checkbox state changes
      let updatedContent = targetBlock.content;
      try {
        if (targetBlock.content) {
          const contentObj = JSON.parse(targetBlock.content);
          if (contentObj.checkedItems) {
            contentObj.checkedItems[itemIndex] = checked;
            updatedContent = JSON.stringify(contentObj);
          }
        }
      } catch (e) {
        console.log('Could not update content JSON:', e);
      }

      // Update the block in state
      const updatedBlock = {
        ...targetBlock,
        content: updatedContent,
        html_css: updatedHtml,
        updatedAt: new Date().toISOString(),
      };

      // Update contentBlocks if the block exists there
      if (
        contentBlocks.find(
          block => block.id === blockId || block.block_id === blockId
        )
      ) {
        setContentBlocks(prevBlocks =>
          prevBlocks.map(block =>
            block.id === blockId || block.block_id === blockId
              ? updatedBlock
              : block
          )
        );
      }

      // Update lessonContent if the block exists there
      if (
        lessonContent?.data?.content?.find(
          block => block.id === blockId || block.block_id === blockId
        )
      ) {
        setLessonContent(prevContent => ({
          ...prevContent,
          data: {
            ...prevContent.data,
            content: prevContent.data.content.map(block =>
              block.id === blockId || block.block_id === blockId
                ? updatedBlock
                : block
            ),
          },
        }));
      }

      // Save to server
      console.log('Saving checkbox state to server...');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}/blocks/${blockId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            html_css: updatedHtml,
            content: updatedContent,
            type: targetBlock.type,
            listType:
              targetBlock.listType ||
              targetBlock.details?.listType ||
              'checkbox',
            details: {
              ...targetBlock.details,
              listType: 'checkbox',
              list_type: 'checkbox',
            },
          }),
        }
      );

      if (response.ok) {
        console.log('Checkbox state saved successfully');
        toast.success('Checkbox state saved');
      } else {
        console.error('Failed to save checkbox state:', response.status);
        toast.error('Failed to save checkbox state');
      }
    } catch (error) {
      console.error('Error in handleCheckboxToggle:', error);
      toast.error('Error updating checkbox');
    }
  };

  const handleQuoteUpdate = (blockId, updatedContentString) => {
    // Find the block being edited
    const editingBlock =
      contentBlocks.find(block => block.id === blockId) ||
      lessonContent?.data?.content?.find(
        block => block.block_id === blockId || block.id === blockId
      );

    if (!editingBlock) {
      console.error('Block not found for update:', blockId);
      return;
    }

    // Parse the updated content
    let updatedQuoteContent;
    try {
      updatedQuoteContent = JSON.parse(updatedContentString);
    } catch (e) {
      console.error('Error parsing updated content:', e);
      return;
    }

    // Generate new HTML content based on quote type and updated content
    let newHtmlContent = '';
    const quoteType =
      editingBlock.textType ||
      editingBlock.details?.quoteType ||
      editingBlock.quoteType;

    switch (quoteType) {
      case 'quote_a':
        newHtmlContent = `
          <div class="relative bg-gradient-to-br from-gray-50 to-white p-12 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-100">
            <div class="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg"></div>
            <div class="relative z-10">
              <div class="w-16 h-px bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
              <div class="text-center">
                <svg class="w-8 h-8 text-blue-500/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-xl text-gray-700 mb-8 leading-relaxed font-light italic tracking-wide">
                  "${updatedQuoteContent.quote}"
                </blockquote>
                <cite class="text-sm font-semibold text-gray-600 not-italic uppercase tracking-wider letter-spacing-wide">— ${updatedQuoteContent.author}</cite>
              </div>
              <div class="w-16 h-px bg-gradient-to-r from-purple-600 to-blue-500 mx-auto mt-8"></div>
            </div>
          </div>
        `;
        break;
      case 'quote_b':
        newHtmlContent = `
          <div class="relative bg-white py-16 px-8 max-w-5xl mx-auto">
            <div class="text-center">
              <blockquote class="text-3xl md:text-4xl text-gray-800 mb-12 leading-relaxed font-thin tracking-wide">
                ${updatedQuoteContent.quote}
              </blockquote>
              <cite class="text-lg font-medium text-orange-500 not-italic tracking-wider">${updatedQuoteContent.author}</cite>
            </div>
          </div>
        `;
        break;
      case 'quote_c':
        newHtmlContent = `
          <div class="relative bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto border border-gray-100">
            <div class="flex items-center space-x-8">
              <div class="flex-shrink-0">
                <img src="${updatedQuoteContent.authorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&h=687&q=80'}" alt="${updatedQuoteContent.author}" class="w-32 h-32 rounded-full object-cover shadow-md" />
              </div>
              <div class="flex-1">
                <blockquote class="text-xl text-gray-700 mb-4 leading-relaxed font-normal italic">
                  "${updatedQuoteContent.quote}"
                </blockquote>
                <cite class="text-base font-semibold text-gray-600 not-italic">— ${updatedQuoteContent.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_d':
        newHtmlContent = `
          <div class="relative bg-gradient-to-br from-slate-50 to-gray-50 py-20 px-12 max-w-4xl mx-auto">
            <div class="text-left max-w-3xl">
              <div class="mb-8">
                <svg class="w-12 h-12 text-slate-300 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
                <blockquote class="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light mb-8">
                  ${updatedQuoteContent.quote}
                </blockquote>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-px bg-slate-400 mr-4"></div>
                <cite class="text-sm font-medium text-slate-600 not-italic uppercase tracking-widest">${updatedQuoteContent.author}</cite>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_on_image':
        newHtmlContent = `
          <div class="relative rounded-3xl overflow-hidden shadow-2xl max-w-6xl mx-auto min-h-[600px]" style="background-image: url('${updatedQuoteContent.backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}'); background-size: cover; background-position: center;">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
            <div class="relative z-10 flex items-center justify-center h-full p-16">
              <div class="text-center max-w-4xl">
                <div class="mb-8">
                  <svg class="w-16 h-16 text-white/30 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                  <blockquote class="text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-extralight mb-12 tracking-wide">
                    ${updatedQuoteContent.quote}
                  </blockquote>
                </div>
                <div class="flex items-center justify-center">
                  <div class="w-12 h-px bg-white/60 mr-6"></div>
                  <cite class="text-xl font-light text-white/95 not-italic uppercase tracking-[0.2em]">${updatedQuoteContent.author}</cite>
                  <div class="w-12 h-px bg-white/60 ml-6"></div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      case 'quote_carousel':
        const quotes = updatedQuoteContent.quotes || [updatedQuoteContent];
        newHtmlContent = `
        <div class="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl shadow-lg border border-slate-200/50 p-6 max-w-2xl mx-auto overflow-hidden backdrop-blur-sm">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
          <div class="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-br from-indigo-200/20 via-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
          <div class="absolute top-1/2 right-8 w-16 h-16 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-xl"></div>
          
          <div class="quote-carousel-${Date.now()} relative z-10" data-current="0">
            ${quotes
              .map(
                (q, index) => `
              <div class="quote-slide ${index === 0 ? 'block' : 'hidden'} transition-all duration-700 ease-in-out transform" data-index="${index}">
                <div class="text-center py-8 px-6">
                  <div class="flex justify-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <svg class="w-6 h-6 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <blockquote class="text-lg md:text-xl text-slate-800 mb-6 leading-relaxed font-light italic min-h-[80px] flex items-center justify-center tracking-wide">
                    <span class="relative">
                      "${q.quote}"
                      <div class="absolute -left-4 -top-2 text-6xl text-blue-200/30 font-serif">"</div>
                      <div class="absolute -right-4 -bottom-6 text-6xl text-purple-200/30 font-serif">"</div>
                    </span>
                  </blockquote>
                  
                  <div class="flex items-center justify-center space-x-4">
                    <div class="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-slate-400"></div>
                    <cite class="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text not-italic tracking-wider uppercase text-sm letter-spacing-widest">${q.author}</cite>
                    <div class="w-12 h-px bg-gradient-to-r from-slate-400 via-slate-400 to-transparent"></div>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
            
            <div class="flex justify-center items-center space-x-6 mt-6 pt-4 border-t border-slate-200/60">
              <button onclick="window.carouselPrev && window.carouselPrev(this)" class="carousel-prev group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <div class="flex space-x-2">
                ${quotes
                  .map(
                    (_, index) => `
                  <button onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" class="carousel-dot w-3 h-3 rounded-full transition-all duration-300 transform ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-md' : 'bg-slate-300 hover:bg-slate-400 hover:scale-105'}" data-index="${index}"></button>
                `
                  )
                  .join('')}
              </div>
              
              <button onclick="window.carouselNext && window.carouselNext(this)" class="carousel-next group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
        break;
      default:
        newHtmlContent = `
        <div class="relative bg-white rounded-2xl shadow-md p-6 border">
          <blockquote class="text-lg italic text-gray-700 mb-3">
            "${updatedQuoteContent.quote}"
          </blockquote>
          <cite class="text-sm font-medium text-gray-500">— ${updatedQuoteContent.author}</cite>
        </div>
      `;
    }

    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content: JSON.stringify(updatedQuoteContent),
              html_css: newHtmlContent,
              details: {
                ...block.details,
                quote:
                  updatedQuoteContent.quote ||
                  updatedQuoteContent.quotes?.[0]?.quote ||
                  '',
                author:
                  updatedQuoteContent.author ||
                  updatedQuoteContent.quotes?.[0]?.author ||
                  '',
                authorImage: updatedQuoteContent.authorImage || '',
                backgroundImage: updatedQuoteContent.backgroundImage || '',
              },
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Update lessonContent for fetched lessons
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content: JSON.stringify(updatedQuoteContent),
                  html_css: newHtmlContent,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    // Reset editing state
    setEditingQuoteBlock(null);
  };

  const handleAudioUpdate = audioBlock => {
    if (editingAudioBlock) {
      // Update existing audio block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingAudioBlock.id
            ? {
                ...block,
                ...audioBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingAudioBlock.id ||
              block.id === editingAudioBlock.id
                ? {
                    ...block,
                    ...audioBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        // Insert at specific position in contentBlocks (always update this for immediate UI)
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, audioBlock);
          return newBlocks;
        });

        // Also update lessonContent if it exists
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, audioBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new audio block - only add to contentBlocks like other block handlers
        setContentBlocks(prevBlocks => [...prevBlocks, audioBlock]);
      }
    }

    // Reset editing state
    setEditingAudioBlock(null);
  };

  const handleYouTubeUpdate = youTubeBlock => {
    if (editingYouTubeBlock) {
      // Update existing YouTube block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingYouTubeBlock.id
            ? {
                ...block,
                ...youTubeBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingYouTubeBlock.id ||
              block.id === editingYouTubeBlock.id
                ? {
                    ...block,
                    ...youTubeBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        // Insert at specific position in contentBlocks (always update this for immediate UI)
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, youTubeBlock);
          return newBlocks;
        });

        // Also update lessonContent if it exists
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, youTubeBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new YouTube block - only add to contentBlocks like other block handlers
        setContentBlocks(prevBlocks => [...prevBlocks, youTubeBlock]);
      }
    }

    // Reset editing state
    setEditingYouTubeBlock(null);
  };

  const handleVideoUpdate = videoBlock => {
    console.log('handleVideoUpdate called with:', videoBlock);
    console.log('editingVideoBlock:', editingVideoBlock);

    if (editingVideoBlock) {
      // Update existing video block
      console.log('Updating existing video block');
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingVideoBlock.id
            ? {
                ...block,
                ...videoBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingVideoBlock.id ||
              block.id === editingVideoBlock.id
                ? {
                    ...block,
                    ...videoBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        console.log(
          'Inserting new video block at position:',
          insertionPosition
        );
        // Insert at specific position in contentBlocks (always update this for immediate UI)
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, videoBlock);
          return newBlocks;
        });

        // Also update lessonContent if it exists
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, videoBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new video block
        console.log('Adding new video block');
        setContentBlocks(prevBlocks => [...prevBlocks, videoBlock]);
      }
    }

    // Reset editing state
    setEditingVideoBlock(null);
  };

  const handleTableUpdate = (blockId, content, htmlContent, templateId) => {
    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              html_css: htmlContent,
              templateId: templateId,
              tableType: templateId,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId || block.id === blockId
              ? {
                  ...block,
                  content,
                  html_css: htmlContent,
                  templateId: templateId,
                  tableType: templateId,
                  // Also update details if they exist
                  details: {
                    ...block.details,
                    templateId: templateId,
                    tableType: templateId,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }

    setEditingTableBlock(null);
    setShowTableComponent(false);
  };

  const removeContentBlock = blockId => {
    // Remove from contentBlocks
    setContentBlocks(contentBlocks.filter(block => block.id !== blockId));

    // Also remove from lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.filter(
            block => block.block_id !== blockId && block.id !== blockId
          ),
        },
      }));
    }
  };

  const updateBlockContent = (
    blockId,
    content,
    heading = null,
    subheading = null
  ) => {
    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              heading,
              subheading,
              updatedAt: new Date().toISOString(),
            }
          : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId
              ? {
                  ...block,
                  content,
                  heading,
                  subheading,
                  updatedAt: new Date().toISOString(),
                }
              : block
          ),
        },
      }));
    }
  };

  const handleEditBlock = blockId => {
    // First try to find block in contentBlocks (for new lessons)
    let block = contentBlocks.find(b => b.id === blockId);

    // If not found, try to find in lessonContent (for fetched lessons)
    if (!block && lessonContent?.data?.content) {
      block = lessonContent.data.content.find(b => b.block_id === blockId);
    }

    if (!block) return;

    // Enhanced quote block detection - check content structure and HTML patterns
    const isQuoteBlock =
      block.type === 'quote' ||
      (block.textType && block.textType.startsWith('quote_')) ||
      block.details?.quote_type ||
      // Check if content has quote structure (JSON with quote/author)
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return content.quote && content.author;
        } catch {
          return false;
        }
      })() ||
      // Check HTML patterns for quote blocks
      (block.html_css &&
        (block.html_css.includes('quote-carousel') ||
          block.html_css.includes('carousel-dot') ||
          block.html_css.includes('blockquote') ||
          block.html_css.includes('<cite') ||
          (block.html_css.includes('background-image:') &&
            block.html_css.includes('bg-gradient-to-t from-black')) ||
          (block.html_css.includes('flex items-center space-x-8') &&
            block.html_css.includes('rounded-full object-cover')) ||
          (block.html_css.includes('text-left max-w-3xl') &&
            block.html_css.includes('bg-gradient-to-br from-slate-50')) ||
          (block.html_css.includes('text-3xl md:text-4xl') &&
            block.html_css.includes('font-thin')) ||
          (block.html_css.includes('bg-gradient-to-br from-gray-50') &&
            block.html_css.includes('backdrop-blur-sm'))));

    if (isQuoteBlock) {
      // Handle quote block editing with proper type detection
      // For fetched content, detect quoteType from HTML content if not available
      let quoteType =
        block.textType || block.details?.quote_type || block.details?.quoteType;

      // Override block type to ensure it's treated as a quote
      block = { ...block, type: 'quote' };

      // If quoteType is not available, detect it from HTML content with improved patterns
      if (!quoteType && block.html_css) {
        const htmlContent = block.html_css;

        // Quote Carousel - has carousel controls and multiple quotes
        if (
          htmlContent.includes('quote-carousel') ||
          htmlContent.includes('carousel-dot') ||
          htmlContent.includes('carousel-prev') ||
          htmlContent.includes('carousel-next')
        ) {
          quoteType = 'quote_carousel';
        }
        // Quote on Image - has background image with overlay
        else if (
          htmlContent.includes('background-image:') ||
          (htmlContent.includes('bg-gradient-to-t from-black') &&
            htmlContent.includes('absolute inset-0'))
        ) {
          quoteType = 'quote_on_image';
        }
        // Quote C - has author image with horizontal layout
        else if (
          htmlContent.includes('flex items-center space-x-8') ||
          (htmlContent.includes('rounded-full object-cover') &&
            htmlContent.includes('w-16 h-16'))
        ) {
          quoteType = 'quote_c';
        }
        // Quote D - has specific styling with slate background
        else if (
          htmlContent.includes('text-left max-w-3xl') ||
          htmlContent.includes('bg-gradient-to-br from-slate-50')
        ) {
          quoteType = 'quote_d';
        }
        // Quote B - has large text and thin font
        else if (
          htmlContent.includes('text-3xl md:text-4xl') ||
          htmlContent.includes('font-thin') ||
          htmlContent.includes('text-center bg-gray-50')
        ) {
          quoteType = 'quote_b';
        }
        // Quote A - default style with author image on left
        else if (
          htmlContent.includes('flex items-start space-x-4') ||
          htmlContent.includes('w-12 h-12 rounded-full') ||
          htmlContent.includes('bg-gradient-to-br from-gray-50')
        ) {
          quoteType = 'quote_a';
        }
        // Additional fallback detection based on structure
        else if (
          htmlContent.includes('blockquote') &&
          htmlContent.includes('cite')
        ) {
          // Try to detect based on layout structure
          if (htmlContent.includes('text-center')) {
            quoteType = 'quote_b';
          } else if (htmlContent.includes('space-x-4')) {
            quoteType = 'quote_a';
          } else {
            quoteType = 'quote_a'; // default fallback
          }
        } else {
          quoteType = 'quote_a'; // fallback
        }
      } else if (!quoteType) {
        quoteType = 'quote_a'; // fallback
      }

      // Debug logging to verify quote type detection
      console.log('Quote block detected:', {
        originalType: block.type,
        originalTextType: block.textType,
        detectedQuoteType: quoteType,
        hasHtmlCss: !!block.html_css,
        blockContent: block.content,
        htmlPreview: block.html_css
          ? block.html_css.substring(0, 200) + '...'
          : 'No HTML',
      });

      // Parse and prepare quote content for the editor
      let quoteContent = {};
      try {
        if (block.content) {
          quoteContent = JSON.parse(block.content);
        }
      } catch (e) {
        console.log(
          'Could not parse quote content as JSON, extracting from HTML'
        );
        // Extract quote and author from HTML if JSON parsing fails
        if (block.html_css) {
          const htmlContent = block.html_css;

          // Extract quote text
          const quoteMatch = htmlContent.match(
            /<blockquote[^>]*>(.*?)<\/blockquote>/s
          );
          const quoteText = quoteMatch
            ? quoteMatch[1].replace(/"/g, '').trim()
            : '';

          // Extract author
          const authorMatch = htmlContent.match(
            /<cite[^>]*>.*?—\s*(.*?)<\/cite>/s
          );
          const authorText = authorMatch ? authorMatch[1].trim() : '';

          // Extract author image
          const imgMatch = htmlContent.match(
            /<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"[^>]*class="[^"]*rounded-full[^"]*"/
          );
          const authorImage = imgMatch ? imgMatch[1] : '';

          // Extract background image
          const bgMatch = htmlContent.match(
            /background-image:\s*url\(['"]([^'"]*)['"]\)/
          );
          const backgroundImage = bgMatch ? bgMatch[1] : '';

          quoteContent = {
            quote: quoteText,
            author: authorText,
            authorImage: authorImage,
            backgroundImage: backgroundImage,
          };
        } else {
          quoteContent = {
            quote: block.content || '',
            author: '',
            authorImage: '',
            backgroundImage: '',
          };
        }
      }

      // Set the textType to ensure proper editor opens
      const blockWithType = {
        ...block,
        type: 'quote',
        textType: quoteType,
        quoteType: quoteType,
        content: JSON.stringify(quoteContent),
      };
      setEditingQuoteBlock(blockWithType);

      // For quote carousel, initialize carousel state
      if (quoteType === 'quote_carousel') {
        try {
          if (quoteContent.quotes && Array.isArray(quoteContent.quotes)) {
            quoteComponentRef.current?.setCarouselQuotes(quoteContent.quotes);
            quoteComponentRef.current?.setActiveCarouselTab(0);
          }
        } catch (e) {
          console.error('Error setting carousel content:', e);
        }
      }

      setShowQuoteEditDialog(true);
      return;
    }

    if (block.type === 'statement') {
      // Handle statement editing with the StatementComponent
      // For fetched content, detect statementType from HTML content if not available
      let statementType =
        block.statementType ||
        block.details?.statement_type ||
        block.details?.statementType;

      // If statementType is not available, detect it from HTML content
      if (!statementType && block.html_css) {
        const htmlContent = block.html_css;
        if (htmlContent.includes('border-t border-b border-gray-800')) {
          statementType = 'statement-a';
        } else if (
          htmlContent.includes('absolute top-0 left-1/2') &&
          htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')
        ) {
          statementType = 'statement-b';
        } else if (
          htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') &&
          htmlContent.includes('border-l-4 border-orange-500')
        ) {
          statementType = 'statement-c';
        } else if (htmlContent.includes('absolute top-0 left-0 w-16 h-1')) {
          statementType = 'statement-d';
        } else if (htmlContent.includes('border-orange-300 bg-orange-50')) {
          statementType = 'note';
        } else {
          statementType = 'statement-a'; // fallback
        }
      } else if (!statementType) {
        statementType = 'statement-c'; // fallback
      }

      const content = block.content || block.details?.content || '';
      const htmlCss = block.html_css || '';

      statementComponentRef.current?.handleEditStatement(
        blockId,
        statementType,
        content,
        htmlCss
      );
      return;
    }

    // Enhanced list block detection - check content structure and HTML patterns
    const isListBlock =
      block.type === 'list' ||
      block.details?.list_type ||
      block.details?.listType ||
      // Check if content has list structure (JSON with items array)
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return content.items && Array.isArray(content.items);
        } catch {
          return false;
        }
      })() ||
      // Check HTML patterns for list blocks
      (block.html_css &&
        (block.html_css.includes(
          'bg-gradient-to-br from-orange-50 to-red-50'
        ) ||
          block.html_css.includes(
            'bg-gradient-to-br from-pink-50 to-rose-50'
          ) ||
          block.html_css.includes(
            'bg-gradient-to-br from-blue-50 to-indigo-50'
          ) ||
          block.html_css.includes('checkbox-item') ||
          block.html_css.includes('list-none') ||
          (block.html_css.includes('<ol') &&
            block.html_css.includes('space-y-4')) ||
          (block.html_css.includes('<ul') &&
            block.html_css.includes('space-y-4'))));

    if (isListBlock) {
      // Handle list block editing with proper type detection
      // For fetched content, detect listType from HTML content if not available
      let listType =
        block.listType || block.details?.list_type || block.details?.listType;

      // Override block type to ensure it's treated as a list
      block = { ...block, type: 'list' };

      // If listType is not available, detect it from HTML content
      if (!listType && block.html_css) {
        const htmlContent = block.html_css;

        // Numbered list - has numbered items with gradient orange background
        if (
          htmlContent.includes('bg-gradient-to-br from-orange-50 to-red-50') ||
          htmlContent.includes('from-orange-500 to-red-500') ||
          htmlContent.includes('<ol')
        ) {
          listType = 'numbered';
        }
        // Checkbox list - has checkbox items with pink background
        else if (
          htmlContent.includes('bg-gradient-to-br from-pink-50 to-rose-50') ||
          htmlContent.includes('checkbox-item') ||
          htmlContent.includes('border-pink-400')
        ) {
          listType = 'checkbox';
        }
        // Bulleted list - has bullet points with blue background
        else if (
          htmlContent.includes('bg-gradient-to-br from-blue-50 to-indigo-50') ||
          htmlContent.includes('from-blue-500 to-indigo-500') ||
          htmlContent.includes('rounded-full shadow-sm')
        ) {
          listType = 'bulleted';
        }
        // Fallback detection based on HTML structure
        else if (htmlContent.includes('<ol')) {
          listType = 'numbered';
        } else if (
          htmlContent.includes('checkbox') ||
          htmlContent.includes('input type="checkbox"')
        ) {
          listType = 'checkbox';
        } else {
          listType = 'bulleted'; // default fallback
        }
      } else if (!listType) {
        listType = 'bulleted'; // fallback
      }

      // Debug logging to verify list type detection
      console.log('List block detected:', {
        originalType: block.type,
        detectedListType: listType,
        hasHtmlCss: !!block.html_css,
        blockContent: block.content,
        htmlPreview: block.html_css
          ? block.html_css.substring(0, 200) + '...'
          : 'No HTML',
      });

      // Parse and prepare list content for the editor
      let listContent = {};
      try {
        if (block.content) {
          listContent = JSON.parse(block.content);
        }
      } catch (e) {
        console.log(
          'Could not parse list content as JSON, extracting from HTML'
        );
        // Extract list items from HTML if JSON parsing fails
        if (block.html_css) {
          const htmlContent = block.html_css;
          const items = [];

          // Extract items from different list types
          if (listType === 'numbered') {
            const matches = htmlContent.match(
              /<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else if (listType === 'checkbox') {
            const matches = htmlContent.match(
              /<div[^>]*class="flex items-start space-x-4[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/div>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else {
            // Bulleted list
            const matches = htmlContent.match(
              /<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs
            );
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(
                  /<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s
                );
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          }

          listContent = {
            items: items.length > 0 ? items : [''],
            listType: listType,
            checkedItems: {},
          };
        } else {
          listContent = {
            items: [''],
            listType: listType,
            checkedItems: {},
          };
        }
      }

      // Set the listType to ensure proper editor opens
      const blockWithType = {
        ...block,
        type: 'list',
        listType: listType,
        content: JSON.stringify(listContent),
      };
      setEditingListBlock(blockWithType);

      // Initialize list component state
      if (listComponentRef.current) {
        listComponentRef.current.setListItems(listContent.items || ['']);
        listComponentRef.current.setListType(listType);
        listComponentRef.current.setCheckedItems(
          listContent.checkedItems || {}
        );
        listComponentRef.current.setNumberingStyle(
          listContent.numberingStyle || 'decimal'
        );
      }

      setShowListEditDialog(true);
      return;
    }

    // Enhanced interactive block detection - check subtype, content structure and HTML patterns
    const isInteractiveBlock =
      block.type === 'interactive' ||
      // Check subtype for accordion or tabs
      (block.subtype &&
        (block.subtype === 'accordion' ||
          block.subtype === 'tabs' ||
          block.subtype === 'labeled-graphic')) ||
      // Check if content has interactive structure (JSON with template)
      (() => {
        try {
          const content = JSON.parse(block.content || '{}');
          return (
            content.template &&
            (content.tabsData ||
              content.accordionData ||
              content.labeledGraphicData)
          );
        } catch {
          return false;
        }
      })() ||
      // Check HTML patterns for interactive blocks
      (block.html_css &&
        (block.html_css.includes('interactive-tabs') ||
          block.html_css.includes('interactive-accordion') ||
          block.html_css.includes('accordion-content') ||
          block.html_css.includes('tab-button') ||
          block.html_css.includes('accordion-header') ||
          block.html_css.includes('data-template="tabs"') ||
          block.html_css.includes('data-template="accordion"') ||
          block.html_css.includes('data-template="labeled-graphic"') ||
          block.html_css.includes('labeled-graphic-container')));

    if (isInteractiveBlock) {
      // Handle interactive block editing
      console.log('Interactive block detected for editing:', block);

      // Override block type to ensure it's treated as interactive
      block = { ...block, type: 'interactive' };

      // Set the editing interactive block and show the interactive edit dialog
      setEditingInteractiveBlock(block);
      setShowInteractiveEditDialog(true);
      return;
    }

    if (block.type === 'text') {
      // Handle text block editing - delegate to TextBlockComponent
      setCurrentTextBlockId(blockId);
      setCurrentTextType(block.textType || 'paragraph');
      setShowTextEditorDialog(true);
      return;
    } else if (block.type === 'table') {
      // Handle table block editing - open edit dialog directly
      console.log('Table block detected for editing:', block);

      // Detect table type from existing block data
      let tableType =
        block.tableType ||
        block.templateId ||
        block.details?.table_type ||
        block.details?.templateId;

      // If table type is not available, try to detect from content
      if (!tableType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          tableType =
            parsedContent.templateId ||
            parsedContent.tableType ||
            'two_columns';
        } catch (e) {
          // If content parsing fails, try to detect from HTML structure
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (
              htmlContent.includes('grid') &&
              htmlContent.includes('md:grid-cols-2')
            ) {
              tableType = 'two_columns';
            } else if (
              htmlContent.includes('grid') &&
              htmlContent.includes('md:grid-cols-3')
            ) {
              tableType = 'three_columns';
            } else if (
              htmlContent.includes('<table') ||
              htmlContent.includes('divide-y')
            ) {
              tableType = 'responsive_table';
            } else {
              tableType = 'two_columns'; // fallback
            }
          } else {
            tableType = 'two_columns'; // fallback
          }
        }
      } else if (!tableType) {
        tableType = 'two_columns'; // fallback
      }

      // Ensure the block has the table type information
      const blockWithType = {
        ...block,
        tableType: tableType,
        templateId: tableType,
      };

      // Set the editing table block and show the table component in edit mode
      setEditingTableBlock(blockWithType);
      setShowTableComponent(true);
    } else if (block.type === 'list') {
      // Handle list block editing - open edit dialog directly
      console.log('List block detected for editing:', block);

      // Detect list type from existing block data
      let listType =
        block.listType || block.details?.list_type || block.details?.listType;

      // If list type is not available, try to detect from content or HTML
      if (!listType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          listType = parsedContent.listType || 'bulleted';
        } catch (e) {
          // If content is not JSON, try to detect from HTML
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (
              htmlContent.includes('<ol') ||
              htmlContent.includes('list-decimal')
            ) {
              listType = 'numbered';
            } else if (
              htmlContent.includes('type="checkbox"') ||
              htmlContent.includes('input[type="checkbox"]')
            ) {
              listType = 'checkbox';
            } else {
              listType = 'bulleted';
            }
          } else {
            listType = 'bulleted'; // fallback
          }
        }
      } else if (!listType) {
        listType = 'bulleted'; // fallback
      }

      // Ensure the block has the list type information
      const blockWithType = {
        ...block,
        listType: listType,
      };

      // Set the editing list block and show the list edit dialog
      setEditingListBlock(blockWithType);
      setShowListEditDialog(true);
    } else if (block.type === 'audio') {
      // Handle audio block editing
      console.log('Audio block detected for editing:', block);
      setEditingAudioBlock(block);
      setShowAudioDialog(true);
    } else if (block.type === 'youtube') {
      // Handle YouTube block editing
      console.log('YouTube block detected for editing:', block);
      setEditingYouTubeBlock(block);
      setShowYouTubeDialog(true);
    } else if (block.type === 'video') {
      // Handle video block editing
      console.log('Video block detected for editing:', block);
      setEditingVideoBlock(block);
      setShowVideoDialog(true);
    } else if (block.type === 'divider') {
      // Handle divider block editing
      console.log('Divider block detected for editing:', block);
      if (dividerComponentRef.current) {
        dividerComponentRef.current.editDivider(block);
      }
    } else if (block.type === 'link') {
      // Handle link block editing
      console.log('Link block detected for editing:', block);
      setEditingLinkBlock(block);
      setShowLinkDialog(true);
    } else if (block.type === 'pdf') {
      // Handle PDF block editing
      console.log('PDF block detected for editing:', block);
      setEditingPdfBlock(block);
      setShowPdfDialog(true);
    }
  };

  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';

    // Add a class to the dragged element for visual feedback
    const element = e.target;
    element.classList.add('dragging');

    // Set custom ghost image
    const ghost = element.cloneNode(true);
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);

    // Clean up ghost element after drag starts
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  // Add dragend handler to clean up styles
  const handleDragEnd = () => {
    // Reset all block transforms
    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.classList.remove('dragging');
    });
    setDraggedBlockId(null);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Find the dragged element and potential drop target
    const draggedElement = document.querySelector(
      `[data-block-id="${draggedBlockId}"]`
    );
    if (!draggedElement) return;

    const dropTarget = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-block-id]');
    if (!dropTarget || dropTarget === draggedElement) return;

    // Get all blocks
    const blocks = Array.from(document.querySelectorAll('[data-block-id]'));
    const draggedIndex = blocks.indexOf(draggedElement);
    const dropIndex = blocks.indexOf(dropTarget);

    // Reset all transformations first
    blocks.forEach(block => {
      if (block !== draggedElement) {
        block.style.transform = '';
      }
    });

    // Apply transform to drop target
    const moveUp = draggedIndex > dropIndex;
    dropTarget.style.transform = `translateY(${moveUp ? '40px' : '-40px'})`;
    dropTarget.style.transition = 'transform 0.2s ease';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    if (draggedBlockId === null || draggedBlockId === targetBlockId) return;

    // Update lesson content order - handle both lessonContent and contentBlocks
    if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
      const content = lessonContent.data.content;
      const sourceIndex = content.findIndex(
        b => (b.block_id || b.id) === draggedBlockId
      );
      const targetIndex = content.findIndex(
        b => (b.block_id || b.id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedContent = [...content];
      const [moved] = updatedContent.splice(sourceIndex, 1);
      updatedContent.splice(targetIndex, 0, moved);

      // Update the state with new order
      setLessonContent({
        ...lessonContent,
        data: {
          ...lessonContent.data,
          content: updatedContent.map((block, index) => ({
            ...block,
            order: index + 1,
          })),
        },
      });
    } else {
      // Handle contentBlocks drag and drop
      const sourceIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === draggedBlockId
      );
      const targetIndex = contentBlocks.findIndex(
        b => (b.id || b.block_id) === targetBlockId
      );

      if (sourceIndex === -1 || targetIndex === -1) return;

      const updatedBlocks = [...contentBlocks];
      const [moved] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.splice(targetIndex, 0, moved);

      setContentBlocks(updatedBlocks);
    }

    // Reset drag state
    setDraggedBlockId(null);

    // Reset any visual transformations
    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.style.transition = '';
    });
  };

  const handlePreview = () => {
    // Navigate to the new lesson preview page
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`
    );
  };

  // Convert blocks to HTML/CSS format
  const convertBlocksToHtml = blocks => {
    return blocks.map(block => {
      let html = '';
      let css = '';
      let js = '';

      if (block.type === 'text') {
        const textType = textTypes.find(t => t.id === block.textType);
        const style = block.style || textType?.style || {};
        const styleString = Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');

        html = `<div class="lesson-block text-block" style="${styleString}">${block.content}</div>`;
      } else if (block.type === 'image') {
        // Prefer saved html_css if available (preserves exact sizing/styles)
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: reconstruct based on layout from block or details
          const imageUrl = block.imageUrl || block.details?.image_url || '';
          const layout = block.layout || block.details?.layout || 'centered';
          const caption = (
            block.text ||
            block.imageDescription ||
            block.details?.caption ||
            ''
          ).toString();
          const title = block.imageTitle || block.details?.alt_text || 'Image';
          if (layout === 'side-by-side') {
            const alignment = block.alignment || 'left';
            const imageFirst = alignment === 'left';
            const imageOrder = imageFirst ? 'order-1' : 'order-2';
            const textOrder = imageFirst ? 'order-2' : 'order-1';

            html = `
              <div class="lesson-image side-by-side">
                <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                  <div class="${imageOrder}">
                    <img src="${imageUrl}" alt="${title}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
                  </div>
                  <div class="${textOrder}">
                    ${caption ? `<span class="text-gray-700 text-lg leading-relaxed">${caption}</span>` : ''}
                  </div>
                </div>
              </div>`;
          } else if (layout === 'overlay') {
            html = `
              <div class="lesson-image overlay">
                <div class="relative rounded-xl overflow-hidden">
                  <img src="${imageUrl}" alt="${title}" class="w-full h-96 object-cover" />
                  ${caption ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full"><span class="text-xl font-medium leading-relaxed">${caption}</span></div></div>` : ''}
                </div>
              </div>`;
          } else if (layout === 'full-width') {
            html = `
              <div class="lesson-image full-width">
                <div class="space-y-3">
                  <img src="${imageUrl}" alt="${title}" class="w-full max-h-[28rem] object-contain rounded" />
                  ${caption ? `<p class="text-sm text-gray-600">${caption}</p>` : ''}
                </div>
              </div>`;
          } else {
            html = `
              <div class="lesson-image centered">
                <div class="text-center">
                  <img src="${imageUrl}" alt="${title}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg mx-auto" />
                  ${caption ? `<span class="text-gray-600 mt-4 italic text-lg">${caption}</span>` : ''}
                </div>
              </div>`;
          }
        }
      } else if (block.type === 'quote') {
        // For quote blocks, ALWAYS use the saved html_css to prevent extra container wrapping
        // This preserves the exact design sent to the backend
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from quote content
          const quoteContent = JSON.parse(block.content || '{}');
          const quoteType = block.quoteType || 'quote_a';

          switch (quoteType) {
            case 'quote_a':
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div class="flex-1">
                      <blockquote class="text-lg italic text-gray-700 mb-3">
                        "${quoteContent.quote || ''}"
                      </blockquote>
                      <cite class="text-sm font-medium text-gray-500">— ${quoteContent.author || ''}</cite>
                    </div>
                  </div>
                </div>
              `;
              break;
            case 'quote_b':
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="bg-gray-50 rounded-xl p-6">
                    <div class="flex items-center space-x-4 mb-4">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg" />
                      <div>
                        <cite class="text-lg font-semibold text-gray-800">${quoteContent.author || ''}</cite>
                      </div>
                    </div>
                    <blockquote class="text-xl italic text-gray-700 leading-relaxed">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                  </div>
                </div>
              `;
              break;
            case 'quote_c':
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="text-center">
                    <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-gray-100 shadow-lg" />
                    <blockquote class="text-2xl italic text-gray-700 mb-4 leading-relaxed">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                    <cite class="text-lg font-medium text-gray-600">— ${quoteContent.author || ''}</cite>
                  </div>
                </div>
              `;
              break;
            case 'quote_d':
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="border-l-4 border-blue-500 pl-4">
                    <blockquote class="text-lg text-gray-700 mb-2">
                      "${quoteContent.quote || ''}"
                    </blockquote>
                    <div class="flex items-center space-x-3">
                      <img src="${quoteContent.authorImage || ''}" alt="${quoteContent.author || ''}" class="w-8 h-8 rounded-full object-cover" />
                      <cite class="text-sm font-medium text-gray-500">${quoteContent.author || ''}</cite>
                    </div>
                  </div>
                </div>
              `;
              break;
            case 'quote_on_image':
              html = `
                <div class="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="relative">
                    <img src="${quoteContent.backgroundImage || ''}" alt="Quote background" class="w-full h-64 object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                      <div class="p-8 text-white w-full">
                        <blockquote class="text-xl italic mb-3 leading-relaxed">
                          "${quoteContent.quote || ''}"
                        </blockquote>
                        <cite class="text-lg font-medium opacity-90">— ${quoteContent.author || ''}</cite>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              break;
            case 'quote_carousel':
              const quotes = quoteContent.quotes || [];
              const quotesHtml = quotes
                .map(
                  (q, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : 'hidden'}" data-index="${index}">
                  <blockquote class="text-xl italic text-gray-700 mb-4 text-center leading-relaxed">
                    "${q.quote || ''}"
                  </blockquote>
                  <cite class="text-lg font-medium text-gray-600 text-center block">— ${q.author || ''}</cite>
                </div>
              `
                )
                .join('');

              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="quote-carousel relative bg-gray-50 rounded-xl p-8 min-h-[200px] flex flex-col justify-center">
                    ${quotesHtml}
                    <div class="flex justify-center space-x-2 mt-6">
                      ${quotes
                        .map(
                          (_, index) => `
                        <button class="carousel-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}" data-index="${index}"></button>
                      `
                        )
                        .join('')}
                    </div>
                    <div class="flex justify-between items-center mt-4">
                      <button class="carousel-prev text-gray-500 hover:text-gray-700 p-2">‹</button>
                      <button class="carousel-next text-gray-500 hover:text-gray-700 p-2">›</button>
                    </div>
                  </div>
                </div>
              `;

              // Add carousel JavaScript
              js = `
                document.addEventListener('DOMContentLoaded', function() {
                  const carousel = document.querySelector('.quote-carousel');
                  if (carousel) {
                    const items = carousel.querySelectorAll('.carousel-item');
                    const dots = carousel.querySelectorAll('.carousel-dot');
                    const prevBtn = carousel.querySelector('.carousel-prev');
                    const nextBtn = carousel.querySelector('.carousel-next');
                    let currentIndex = 0;

                    function showItem(index) {
                      items.forEach((item, i) => {
                        item.classList.toggle('hidden', i !== index);
                        item.classList.toggle('active', i === index);
                      });
                      dots.forEach((dot, i) => {
                        dot.classList.toggle('bg-blue-500', i === index);
                        dot.classList.toggle('bg-gray-300', i !== index);
                      });
                      currentIndex = index;
                    }

                    dots.forEach((dot, index) => {
                      dot.addEventListener('click', () => showItem(index));
                    });

                    prevBtn.addEventListener('click', () => {
                      const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                      showItem(newIndex);
                    });

                    nextBtn.addEventListener('click', () => {
                      const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                      showItem(newIndex);
                    });
                  }
                });
              `;
              break;
            default:
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <blockquote class="text-lg italic text-gray-700 mb-3">
                    "${quoteContent.quote || ''}"
                  </blockquote>
                  <cite class="text-sm font-medium text-gray-500">— ${quoteContent.author || ''}</cite>
                </div>
              `;
          }
        }
      } else if (block.type === 'list') {
        // Prefer saved html_css if available (preserves exact styling)
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from list content
          try {
            const listContent = JSON.parse(block.content || '{}');
            const listType =
              listContent.listType || block.listType || 'bulleted';
            const items = listContent.items || [];
            const checkedItems = listContent.checkedItems || {};

            if (listType === 'numbered') {
              html = `
                <div class="list-block numbered-list">
                  <ol class="list-decimal list-inside space-y-2 text-gray-800">
                    ${items.map(item => `<li class="leading-relaxed">${item}</li>`).join('')}
                  </ol>
                </div>`;
            } else if (listType === 'checkbox') {
              html = `
                <div class="list-block checkbox-list">
                  <div class="space-y-3">
                    ${items
                      .map(
                        (item, index) => `
                      <label class="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" ${checkedItems[index] ? 'checked' : ''} 
                               class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="text-gray-800 leading-relaxed ${checkedItems[index] ? 'line-through text-gray-500' : ''}">${item}</span>
                      </label>
                    `
                      )
                      .join('')}
                  </div>
                </div>`;
            } else {
              // bulleted list
              html = `
                <div class="list-block bulleted-list">
                  <ul class="list-disc list-inside space-y-2 text-gray-800">
                    ${items.map(item => `<li class="leading-relaxed">${item}</li>`).join('')}
                  </ul>
                </div>`;
            }
          } catch (e) {
            console.error('Error parsing list content:', e);
            html = `<div class="list-block"><ul class="list-disc list-inside"><li>Error loading list</li></ul></div>`;
          }
        }
      } else if (block.type === 'pdf') {
        // Prefer saved html_css to keep consistent embedding
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          const url = block.pdfUrl || block.details?.pdf_url || '';
          const title =
            block.pdfTitle || block.details?.caption || 'PDF Document';
          const description =
            block.pdfDescription || block.details?.description || '';
          html = `
            <div class="lesson-pdf">
              ${title ? `<h3 class="pdf-title">${title}</h3>` : ''}
              ${description ? `<p class="pdf-description">${description}</p>` : ''}
              <iframe src="${url}" class="pdf-iframe" style="width: 100%; height: 600px; border: none; border-radius: 12px;"></iframe>
            </div>
          `;
        }
      } else if (block.type === 'interactive') {
        // For interactive blocks, use the saved html_css content
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from interactive content
          try {
            const interactiveContent = JSON.parse(block.content || '{}');
            const template = interactiveContent.template;
            const data =
              interactiveContent[
                template === 'tabs' ? 'tabsData' : 'accordionData'
              ] || [];

            if (template === 'tabs') {
              const tabsId = `tabs-${Date.now()}`;
              html = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-blue-500 to-purple-600">
                  <div class="interactive-tabs" data-template="tabs" id="${tabsId}">
                    <div class="flex border-b border-gray-200 mb-4" role="tablist">
                      ${data
                        .map(
                          (tab, index) => `
                        <button class="tab-button px-4 py-2 text-sm font-medium transition-colors duration-200 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" 
                                role="tab" 
                                data-tab="${index}"
                                data-container="${tabsId}"
                                onclick="window.switchTab('${tabsId}', ${index})">
                          ${tab.title}
                        </button>
                      `
                        )
                        .join('')}
                    </div>
                    <div class="tab-content">
                      ${data
                        .map(
                          (tab, index) => `
                        <div class="tab-panel ${index === 0 ? 'block' : 'hidden'}" 
                             role="tabpanel" 
                             data-tab="${index}">
                          <div class="text-gray-700 leading-relaxed">${tab.content}</div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              `;
            } else if (template === 'accordion') {
              const accordionId = `accordion-${Date.now()}`;
              html = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-green-500 to-blue-600">
                  <div class="interactive-accordion" data-template="accordion" id="${accordionId}">
                    <div class="space-y-3">
                      ${data
                        .map(
                          (item, index) => `
                        <div class="accordion-item border border-gray-200 rounded-lg">
                          <button class="accordion-header w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between rounded-lg"
                                  data-accordion="${index}"
                                  data-container="${accordionId}"
                                  onclick="window.toggleAccordion('${accordionId}', ${index})">
                            <span class="font-medium text-gray-800">${item.title}</span>
                            <svg class="accordion-icon w-5 h-5 text-gray-500 transition-transform duration-200" 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                          <div class="accordion-content hidden px-4 py-3 text-gray-700 leading-relaxed border-t border-gray-200">
                            ${item.content}
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              `;
            }
          } catch (error) {
            console.error('Error parsing interactive content:', error);
            html =
              '<div class="text-red-500">Error loading interactive content</div>';
          }
        }
      } else if (block.type === 'audio') {
        // For audio blocks, use the saved html_css content if available
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from audio content
          try {
            const audioContent = JSON.parse(block.content || '{}');
            html = `
              <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                <div class="space-y-4">
                  <div class="mb-3">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${audioContent.title || 'Audio'}</h3>
                    ${audioContent.description ? `<p class="text-sm text-gray-600">${audioContent.description}</p>` : ''}
                  </div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <audio controls class="w-full" preload="metadata">
                      <source src="${audioContent.url}" type="audio/mpeg">
                      <source src="${audioContent.url}" type="audio/wav">
                      <source src="${audioContent.url}" type="audio/ogg">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            `;
          } catch (error) {
            console.error('Error parsing audio content:', error);
            html =
              '<div class="text-red-500">Error loading audio content</div>';
          }
        }
      } else if (block.type === 'video') {
        // For video blocks, use the saved html_css content if available
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from video block properties
          const videoUrl = block.videoUrl || block.details?.video_url || '';
          const videoTitle = (
            block.videoTitle ||
            block.details?.caption ||
            'Video'
          )
            .replace(
              /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
              ''
            )
            .trim();
          const videoDescription =
            block.videoDescription || block.details?.description || '';

          html = `
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div class="space-y-4">
                ${videoTitle ? `<h3 class="text-lg font-semibold text-gray-900">${videoTitle}</h3>` : ''}
                ${videoDescription ? `<p class="text-sm text-gray-600">${videoDescription}</p>` : ''}
                <div class="bg-gray-50 rounded-lg p-4">
                  <video controls style="width: 100%; height: auto; border-radius: 8px;">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          `;
        }
      } else if (block.type === 'youtube') {
        // Skip YouTube blocks in convertBlocksToHtml to prevent duplication
        // YouTube blocks are handled by their own custom rendering logic
        html = '';
      }

      return { html, css, js };
    });
  };

  const handleUpdate = async () => {
    // ... (rest of the code remains the same)
    if (!lessonId) {
      toast.error('No lesson ID found. Please save the lesson first.');
      return;
    }

    try {
      setIsUploading(true);
      setAutoSaveStatus('saving');

      // Merge contentBlocks (newly added) with lessonContent (existing/updated)
      // For existing lessons, we need to use the updated lessonContent.data.content
      // For new lessons, we use contentBlocks
      let blocksToUpdate = [];

      // Use a single source of truth - prioritize contentBlocks for new content
      // and merge with existing lessonContent only when necessary
      if (
        lessonContent?.data?.content &&
        lessonContent.data.content.length > 0
      ) {
        console.log('Existing lesson - merging content');

        // Start with existing lesson content
        const existingBlocks = lessonContent.data.content;
        const existingBlockIds = new Set(
          existingBlocks.map(b => b.block_id || b.id)
        );

        // Only add truly new blocks from contentBlocks
        const newBlocks = contentBlocks.filter(
          b => !existingBlockIds.has(b.id)
        );

        console.log('Content merge analysis:', {
          existingBlocks: existingBlocks.length,
          newBlocks: newBlocks.length,
          existingIds: Array.from(existingBlockIds),
          newIds: newBlocks.map(b => b.id),
        });

        // Combine existing and new blocks
        blocksToUpdate = [...existingBlocks, ...newBlocks];
      } else {
        // For new lessons, use contentBlocks as the single source
        console.log('New lesson - using contentBlocks:', {
          totalBlocks: contentBlocks.length,
        });
        blocksToUpdate = contentBlocks;
      }

      // Remove any duplicate blocks based on ID
      const uniqueBlocks = [];
      const seenIds = new Set();
      blocksToUpdate.forEach(block => {
        const blockId = block.block_id || block.id;
        if (!seenIds.has(blockId)) {
          uniqueBlocks.push(block);
          seenIds.add(blockId);
        } else {
          console.warn(
            'Removing duplicate block during update:',
            blockId,
            block.type
          );
        }
      });

      if (uniqueBlocks.length !== blocksToUpdate.length) {
        console.warn(
          `Removed ${blocksToUpdate.length - uniqueBlocks.length} duplicate blocks during update`
        );
        blocksToUpdate = uniqueBlocks;
      }

      // Allow empty content blocks for deletion operations
      // Convert content blocks to the required format
      const content = blocksToUpdate.map((block, index) => {
        const blockId = block.block_id || `block_${index + 1}`;

        // For quote blocks, always preserve the exact html_css to maintain design consistency
        if (
          block.type === 'quote' &&
          block.html_css &&
          block.html_css.trim() !== ''
        ) {
          return {
            type: block.type,
            textType: block.textType,
            script: block.script || '',
            block_id: blockId,
            html_css: block.html_css,
            content: block.content,
            ...(block.details && { details: block.details }),
          };
        }

        // For other blocks, preserve existing html_css to avoid wrapping in new containers
        if (block.html_css && block.html_css.trim() !== '') {
          const blockData = {
            type: block.type,
            script: block.script || '',
            block_id: blockId,
            html_css: block.html_css,
            ...(block.details && { details: block.details }),
          };

          // For text blocks, include textType to differentiate between heading, paragraph, master heading, etc.
          if (block.type === 'text' && block.textType) {
            blockData.textType = block.textType;
          }

          // For statement blocks, include explicit statement type metadata
          if (block.type === 'statement') {
            blockData.statementType = block.statementType || 'statement-a';
            blockData.details = {
              ...blockData.details,
              statement_type: block.statementType || 'statement-a',
              content: block.content || '',
            };
          }

          // For divider blocks, include explicit divider type metadata
          if (block.type === 'divider') {
            blockData.dividerType = block.subtype || 'continue';
            blockData.details = {
              ...blockData.details,
              divider_type: block.subtype || 'continue',
              content: block.content || '',
            };
          }

          // For table blocks, include explicit table type metadata
          if (block.type === 'table') {
            blockData.tableType =
              block.tableType || block.templateId || 'two_columns';
            blockData.details = {
              ...blockData.details,
              table_type: block.tableType || block.templateId || 'two_columns',
              templateId: block.tableType || block.templateId || 'two_columns',
              content: block.content || '',
            };
          }

          return blockData;
        }

        // Generate HTML content for blocks without html_css
        let details = {};
        let script = '';
        let htmlContent = '';

        // Extract content from different possible sources
        const blockContent = block.content || '';
        const blockType = block.type;
        const textType = block.textType;

        switch (blockType) {
          case 'quote':
            // For quote blocks, include explicit quote type metadata
            details = {
              quote_type: block.textType || block.quoteType || 'quote_a',
              content: blockContent,
            };
            htmlContent = block.html_css || blockContent;
            break;

          case 'text':
            // Handle different text types
            if (textType === 'heading') {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <article class="prose prose-gray max-w-none">
                    <h1 class="text-2xl font-bold text-gray-800">${blockContent}</h1>
                  </article>
                </div>`;
            } else if (textType === 'subheading') {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <article class="prose prose-gray max-w-none">
                    <h2 class="text-xl font-semibold text-gray-800">${blockContent}</h2>
                  </article>
                </div>`;
            } else if (textType === 'master_heading') {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="rounded-xl p-4 text-white" style="background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);">
                    <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">${blockContent}</h1>
                  </div>
                </div>`;
            } else if (textType === 'heading_paragraph') {
              const heading = block.heading || '';
              const content = block.content || '';
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <article class="prose prose-gray max-w-none">
                    <h1 class="text-2xl font-bold text-gray-800">${heading}</h1>
                    <p class="text-gray-600 leading-relaxed">${content}</p>
                  </article>
                </div>`;
            } else if (textType === 'subheading_paragraph') {
              const subheading = block.subheading || '';
              const content = block.content || '';
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <article class="prose prose-gray max-w-none">
                    <h2 class="text-xl font-semibold text-gray-800">${subheading}</h2>
                    <p class="text-gray-600 leading-relaxed">${content}</p>
                  </article>
                </div>`;
            } else {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <article class="prose prose-gray max-w-none">
                    <p class="text-gray-600 leading-relaxed">${blockContent}</p>
                  </article>
                </div>`;
            }
            break;

          case 'image':
            // Preserve layout-specific HTML so sizes/styles remain consistent after reload
            {
              const layout = block.layout || 'centered';
              const textContent = (
                block.text ||
                block.imageDescription ||
                ''
              ).toString();
              details = {
                image_url: block.imageUrl,
                caption: textContent,
                alt_text: block.imageTitle || '',
                layout: layout,
                template: block.templateType || block.template || undefined,
                alignment: block.alignment || 'left', // Include alignment in details
              };

              if (layout === 'side-by-side') {
                const alignment = block.alignment || 'left';
                const imageFirst = alignment === 'left';
                const imageOrder = imageFirst ? 'order-1' : 'order-2';
                const textOrder = imageFirst ? 'order-2' : 'order-1';

                htmlContent = `
                  <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                    <div class="${imageOrder}">
                      <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
                    </div>
                    <div class="${textOrder}">
                      ${textContent ? `<span class="text-gray-700 text-lg leading-relaxed">${textContent}</span>` : ''}
                    </div>
                  </div>
                `;
              } else if (layout === 'overlay') {
                htmlContent = `
                  <div class="relative rounded-xl overflow-hidden">
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-96 object-cover" />
                    ${textContent ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full"><span class="text-xl font-medium leading-relaxed">${textContent}</span></div></div>` : ''}
                  </div>
                `;
              } else if (layout === 'full-width') {
                htmlContent = `
                  <div class="space-y-3">
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded" />
                    ${textContent ? `<p class="text-sm text-gray-600">${textContent}</p>` : ''}
                  </div>
                `;
              } else {
                // centered or default
                // Handle standalone image alignment
                const alignment = block.alignment || 'center';
                let alignmentClass = 'text-center'; // default
                if (alignment === 'left') {
                  alignmentClass = 'text-left';
                } else if (alignment === 'right') {
                  alignmentClass = 'text-right';
                }

                htmlContent = `
                  <div class="${alignmentClass}">
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg ${alignment === 'center' ? 'mx-auto' : ''}" />
                    ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
                  </div>
                `;
              }
            }
            break;

          case 'statement':
            // For statement blocks, include explicit type metadata
            details = {
              statement_type: block.statementType || 'statement-a',
              content: blockContent,
            };
            htmlContent = block.html_css || blockContent;
            break;

          case 'divider':
            // For divider blocks, include explicit type metadata
            details = {
              divider_type: block.subtype || 'continue',
              content: blockContent,
            };
            htmlContent = block.html_css || blockContent;
            break;

          case 'audio':
            // For audio blocks, extract details from content JSON
            try {
              const audioContent = JSON.parse(blockContent || '{}');
              details = {
                audioTitle: audioContent.title || 'Audio',
                audioDescription: audioContent.description || '',
                audioUrl: audioContent.url || '',
                audio_url: audioContent.url || '', // Alternative field name
                uploadMethod: audioContent.uploadMethod || 'url',
                uploadedData: audioContent.uploadedData || null,
                title: audioContent.title || 'Audio',
              };
            } catch (e) {
              console.warn('Could not parse audio content for saving:', e);
              details = {
                audioTitle: 'Audio',
                audioDescription: '',
                audioUrl: '',
                audio_url: '',
                uploadMethod: 'url',
                uploadedData: null,
                title: 'Audio',
              };
            }
            htmlContent = block.html_css || blockContent;
            break;

          case 'youtube':
            // For YouTube blocks, extract details from content JSON
            try {
              const youTubeContent = JSON.parse(blockContent || '{}');
              details = {
                youTubeTitle: youTubeContent.title || 'YouTube Video',
                youTubeDescription: youTubeContent.description || '',
                youTubeUrl: youTubeContent.url || '',
                youtube_url: youTubeContent.url || '', // Alternative field name
                videoId: youTubeContent.videoId || '',
                embedUrl: youTubeContent.embedUrl || '',
                title: youTubeContent.title || 'YouTube Video',
              };
            } catch (e) {
              console.warn('Could not parse YouTube content for saving:', e);
              details = {
                youTubeTitle: 'YouTube Video',
                youTubeDescription: '',
                youTubeUrl: '',
                youtube_url: '',
                videoId: '',
                embedUrl: '',
                title: 'YouTube Video',
              };
            }
            htmlContent = block.html_css || blockContent;
            break;

          case 'video':
            // For video blocks, extract details from block properties
            details = {
              video_url: block.videoUrl || '',
              caption: block.videoTitle || 'Video',
              description: block.videoDescription || '',
              videoTitle: block.videoTitle || 'Video',
              videoDescription: block.videoDescription || '',
              videoUrl: block.videoUrl || '',
              uploadMethod: block.uploadMethod || 'url',
              originalUrl: block.originalUrl || '',
              title: block.videoTitle || 'Video',
            };
            htmlContent = block.html_css || blockContent;
            break;

          default:
            htmlContent = block.html_css || block.content || '';
            break;
        }

        return {
          id: block.id,
          type: block.type,
          textType: block.textType,
          title: block.title || '',
          content: block.content || '',
          html_css: htmlContent,
          order: block.order || 0,
          ...(Object.keys(details).length > 0 && { details }),
        };
      });

      // Convert blocks to HTML/CSS/JS format
      const convertedBlocks = convertBlocksToHtml(blocksToUpdate);

      // Combine all blocks
      const combinedContent = {
        html: convertedBlocks.map(block => block.html).join('\\n'),
        css: convertedBlocks.map(block => block.css).join('\\n'),
        js: convertedBlocks
          .map(block => block.js)
          .filter(js => js)
          .join('\\n'),
      };

      // Optimize: Remove redundant combined content if blocks already have html_css
      // This significantly reduces payload size
      const shouldIncludeCombinedContent = blocksToUpdate.some(
        block => !block.html_css || block.html_css.trim() === ''
      );

      // Format content blocks into a simpler structure
      const formattedContent = blocksToUpdate.map(block => {
        let htmlContent = '';
        let styles = '';

        // For quote blocks, use the exact html_css to prevent extra wrapping
        if (block.type === 'quote' && block.html_css && block.html_css.trim()) {
          return {
            html_css: block.html_css,
            styles: '',
          };
        }

        // Extract content from different possible sources
        const blockContent = block.content || block.html_css || '';
        const blockType = block.type;
        const textType = block.textType;

        if (blockType === 'text') {
          switch (textType) {
            case 'heading': {
              htmlContent = `<h1 class="lesson-heading">${blockContent}</h1>`;
              styles =
                '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; }';
              break;
            }
            case 'master_heading': {
              htmlContent = `<div class="lesson-master-heading"><h1>${blockContent}</h1></div>`;
              styles =
                '.lesson-master-heading h1 { font-size: 40px; font-weight: 600; margin: 0; line-height: 1.2; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; }';
              break;
            }
            case 'subheading': {
              htmlContent = `<h4 class="lesson-subheading">${blockContent}</h4>`;
              styles =
                '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; }';
              break;
            }
            case 'heading_paragraph': {
              const headingText = block.heading || '';
              const paragraphText = block.content || '';
              htmlContent = `<h1 class="lesson-heading">${headingText}</h1><p class="lesson-paragraph">${paragraphText}</p>`;
              styles =
                '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
            case 'subheading_paragraph': {
              const subheadingText = block.subheading || '';
              const paragraphText2 = block.content || '';
              htmlContent = `<h4 class="lesson-subheading">${subheadingText}</h4><p class="lesson-paragraph">${paragraphText2}</p>`;
              styles =
                '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
            default: {
              htmlContent = `<p class="lesson-paragraph">${blockContent}</p>`;
              styles =
                '.lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
          }
        } else if (blockType === 'image') {
          const layout = block.layout || 'centered';
          const textContent = (
            block.text ||
            block.imageDescription ||
            ''
          ).toString();
          if (layout === 'side-by-side') {
            const alignment = block.alignment || 'left';
            const imageFirst = alignment === 'left';
            const imageOrder = imageFirst ? 'order-1' : 'order-2';
            const textOrder = imageFirst ? 'order-2' : 'order-1';

            htmlContent = `
              <div class="lesson-image side-by-side">
                <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                  <div class="${imageOrder}">
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                  <div class="${textOrder}">
                    ${textContent ? `<span class="text-gray-700 text-lg leading-relaxed">${textContent}</span>` : ''}
                  </div>
                </div>
              </div>`;
          } else if (layout === 'overlay') {
            htmlContent = `
              <div class="lesson-image overlay">
                <div class="relative rounded-xl overflow-hidden">
                  <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-96 object-cover" />
                  ${textContent ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full"><span class="text-xl font-medium leading-relaxed">${textContent}</span></div></div>` : ''}
                </div>
              </div>`;
          } else if (layout === 'full-width') {
            htmlContent = `
              <div class="lesson-image full-width">
                <div class="space-y-3">
                  <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-auto rounded" />
                  ${textContent ? `<p class="text-sm text-gray-600">${textContent}</p>` : ''}
                </div>
              </div>`;
          } else {
            // Handle standalone image alignment
            const alignment = block.alignment || 'center';
            let alignmentClass = 'text-center'; // default
            if (alignment === 'left') {
              alignmentClass = 'text-left';
            } else if (alignment === 'right') {
              alignmentClass = 'text-right';
            }

            htmlContent = `
              <div class="lesson-image centered">
                <div class="${alignmentClass}">
                  <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="max-w-full h-auto rounded-xl shadow-lg ${alignment === 'center' ? 'mx-auto' : ''}" />
                  ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
                </div>
              </div>`;
          }
        }

        return {
          html_css: htmlContent,
          css: styles,
          script: '', // Empty string if no JavaScript is needed
        };
      });

      // Debug: Log the data being sent
      console.log('Blocks to update:', blocksToUpdate);
      console.log('Processed content:', content);
      console.log('Formatted content:', formattedContent);

      // Optimize payload: remove unnecessary whitespace from HTML to reduce size
      const optimizeHtml = html => {
        if (!html) return '';
        // Remove excessive whitespace while preserving structure
        return html
          .replace(/\n\s+/g, '\n') // Remove leading whitespace on each line
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .replace(/>\s+</g, '><') // Remove spaces between tags
          .trim();
      };

      // Update the lesson content with optimized payload
      const lessonDataToUpdate = {
        lesson_id: lessonId,
        content: content,
        // Optimize html_css by removing excessive whitespace
        html_css: formattedContent
          .map(content => optimizeHtml(content.html_css))
          .filter(html => html) // Remove empty strings
          .join('\n'),
        css: formattedContent
          .map(content => content.css)
          .filter(css => css) // Remove empty strings
          .join('\n'),
        script: '', // Add script if needed in the future
      };

      console.log('Payload being sent to backend:', lessonDataToUpdate);

      // Log payload size for debugging
      const payloadSize = JSON.stringify(lessonDataToUpdate).length;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      console.log('Payload size:', payloadSizeMB, 'MB');

      // Warn user if payload is getting large
      if (payloadSize > 10 * 1024 * 1024) {
        // > 10MB - Critical
        toast.warning(
          `⚠️ Large content detected (${payloadSizeMB}MB). If save fails, contact your administrator to increase server limits.`,
          { duration: 6000 }
        );
        console.warn(
          '⚠️ CRITICAL: Large payload detected:',
          payloadSizeMB,
          'MB'
        );
      } else if (payloadSize > 5 * 1024 * 1024) {
        // > 5MB - Warning
        console.warn(
          '⚠️ Large payload detected:',
          payloadSizeMB,
          'MB - May need higher backend limits'
        );
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/update/${lessonId}`,
        lessonDataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // Log the full response for debugging
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Check if response is HTML (error page) instead of JSON
      const isHtmlError =
        typeof response.data === 'string' &&
        response.data.trim().startsWith('<!DOCTYPE html>');

      if (isHtmlError) {
        // Parse HTML error message
        if (
          response.data.includes('PayloadTooLargeError') ||
          response.data.includes('request entity too large')
        ) {
          throw new Error('PAYLOAD_TOO_LARGE');
        }
        throw new Error('Server returned an error page. Please try again.');
      }

      // Check for any error indicators in the response
      const hasError =
        response.status < 200 ||
        response.status >= 300 ||
        !response.data ||
        response.data.error ||
        response.data.errorMessage ||
        response.data.message?.toLowerCase().includes('error') ||
        response.data.message?.toLowerCase().includes('failed') ||
        response.data.message?.toLowerCase().includes('too large') ||
        response.data.message?.toLowerCase().includes('413') ||
        response.data.success === false ||
        (response.data.success === undefined && response.data.error);

      if (hasError) {
        let errorMessage = 'Failed to update lesson content';

        // Check HTTP status codes first
        if (response.status === 413) {
          errorMessage =
            'Content is too large. Please reduce the size of your content and try again.';
        } else if (response.status === 400) {
          errorMessage =
            'Invalid content format. Please check your content and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to update this lesson.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status < 200 || response.status >= 300) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
        }
        // Check response body for error messages
        else if (response.data?.errorMessage) {
          errorMessage = response.data.errorMessage;
        } else if (response.data?.message) {
          errorMessage = response.data.message;
        } else if (response.data?.error) {
          errorMessage = response.data.error;
        }

        console.error('Auto-save failed with error:', errorMessage);
        throw new Error(errorMessage);
      }

      // If we get here, the save was successful
      const isManualSave = autoSaveStatus === 'error';
      toast.success(
        isManualSave
          ? 'Changes saved successfully!'
          : 'Lesson updated successfully!'
      );
      setAutoSaveStatus('saved');
      setHasUnsavedChanges(false);

      // Reset to neutral after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 2000);
    } catch (error) {
      console.error('Error updating lesson:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config,
      });

      // Handle different error types
      let errorMessage = 'Failed to update lesson. Please try again.';

      // Check for custom PAYLOAD_TOO_LARGE error
      if (error.message === 'PAYLOAD_TOO_LARGE') {
        errorMessage =
          '⚠️ Content size exceeds server limit. The backend server needs to increase its payload limit. Please contact your system administrator to increase the Express body parser limit (typically in server configuration: app.use(express.json({ limit: "50mb" }))).';
        console.error('PAYLOAD TOO LARGE - Backend configuration needed');
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const responseData = error.response.data;

        console.log('Server error response:', { status, data: responseData });

        // Check if response is HTML error page
        const isHtmlError =
          typeof responseData === 'string' &&
          responseData.trim().startsWith('<!DOCTYPE html>');

        if (isHtmlError) {
          if (
            responseData.includes('PayloadTooLargeError') ||
            responseData.includes('request entity too large')
          ) {
            errorMessage =
              '⚠️ Content size exceeds server limit. The backend server needs to increase its payload limit. Please contact your system administrator to increase the Express body parser limit.';
            console.error('413 Payload Too Large - HTML error page received');
          } else {
            errorMessage = 'Server error. Please try again later.';
          }
        } else if (status === 413) {
          errorMessage =
            '⚠️ Content size exceeds server limit. The backend server needs to increase its payload limit. Please contact your system administrator.';
          console.log('Setting 413 error message:', errorMessage);
        } else if (status === 400) {
          errorMessage =
            'Invalid content format. Please check your content and try again.';
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to update this lesson.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (responseData?.errorMessage) {
          errorMessage = responseData.errorMessage;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else {
          errorMessage = `HTTP ${status}: ${error.response.statusText || 'Request failed'}`;
        }
      } else if (error.request) {
        // Network error
        console.log('Network error - no response received:', error.request);
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message) {
        // Other error (including our custom thrown errors)
        console.log('Other error:', error.message);
        errorMessage = error.message;
      }

      console.error('Final error message:', errorMessage);
      console.log('Setting auto-save status to error and showing toast');
      toast.error(errorMessage);
      setAutoSaveStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Debounced auto-save function with useRef to maintain timeout across renders
  const autoSaveTimeoutRef = React.useRef(null);
  const handleUpdateRef = React.useRef(handleUpdate);

  // Keep handleUpdate reference up to date
  React.useEffect(() => {
    handleUpdateRef.current = handleUpdate;
  }, [handleUpdate]);

  const debouncedAutoSave = React.useCallback(
    content => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (!lessonId || !content || content.length === 0) {
          return;
        }

        try {
          console.log('💾 Auto-save executing for', content.length, 'blocks');
          setAutoSaveStatus('saving');
          await handleUpdateRef.current();
          // handleUpdate() will set the status to 'saved' on success
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
          // handleUpdate() will set the status to 'error' and show the specific error message
        }
      }, 2000); // 2 second debounce for better stability
    },
    [lessonId]
  );

  // Auto-save when content blocks change
  React.useEffect(() => {
    // Don't auto-save on initial load or when loading lesson content
    if (loading || fetchingContent) return;

    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevContentBlocksRef.current = [...contentBlocks];
      prevLessonContentRef.current = lessonContent
        ? JSON.parse(JSON.stringify(lessonContent))
        : null;
      return;
    }

    // Check if contentBlocks actually changed
    const contentBlocksChanged =
      JSON.stringify(prevContentBlocksRef.current) !==
      JSON.stringify(contentBlocks);

    // Check if lessonContent changed
    const lessonContentChanged =
      JSON.stringify(prevLessonContentRef.current) !==
      JSON.stringify(lessonContent);

    // Trigger auto-save if either changed
    const hasChanged = contentBlocksChanged || lessonContentChanged;

    if (hasChanged && contentBlocks.length > 0) {
      // Detailed logging for debugging
      const changedBlocks = contentBlocks.filter((block, index) => {
        const prevBlock = prevContentBlocksRef.current[index];
        if (!prevBlock) return true; // New block
        return JSON.stringify(prevBlock) !== JSON.stringify(block);
      });

      console.log('🔄 Auto-save triggered:', {
        contentBlocksChanged,
        lessonContentChanged,
        totalBlocks: contentBlocks.length,
        previousBlocks: prevContentBlocksRef.current.length,
        changedBlocks: changedBlocks.map(b => ({
          id: b.id || b.block_id,
          type: b.type,
          textType: b.textType,
          hasContent: !!b.content,
          hasHtmlCss: !!b.html_css,
        })),
        blockTypes: contentBlocks.map(b => b.type),
        source: lessonContent?.data?.content
          ? 'lessonContent'
          : 'contentBlocks',
      });

      setHasUnsavedChanges(true);
      debouncedAutoSave(contentBlocks);
      prevContentBlocksRef.current = [...contentBlocks];
      prevLessonContentRef.current = lessonContent
        ? JSON.parse(JSON.stringify(lessonContent))
        : null;
    }
  }, [
    contentBlocks,
    lessonContent,
    loading,
    fetchingContent,
    debouncedAutoSave,
  ]);

  const handleImageTemplateSelect = newBlock => {
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks
      setContentBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Add to contentBlocks
      setContentBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleImageUpdate = (newBlock, currentBlock) => {
    // Check if we're inserting at a specific position first (highest priority)
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks
      setContentBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(insertionPosition, 0, newBlock);
        return newBlocks;
      });

      // Also update lessonContent if it exists
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => {
          const newContent = [...prevLessonContent.data.content];
          newContent.splice(insertionPosition, 0, newBlock);
          return {
            ...prevLessonContent,
            data: {
              ...prevLessonContent.data,
              content: newContent,
            },
          };
        });
      }
      setInsertionPosition(null);
    } else if (
      currentBlock &&
      contentBlocks.find(b => b.id === currentBlock.id)
    ) {
      // Update existing block locally (edit mode)
      const getPlainText = html => {
        const temp =
          typeof document !== 'undefined'
            ? document.createElement('div')
            : null;
        if (!temp) return html || '';
        temp.innerHTML = html || '';
        return temp.textContent || temp.innerText || '';
      };

      setContentBlocks(prev =>
        prev.map(block =>
          block.id === currentBlock.id
            ? {
                ...newBlock,
                text: getPlainText(newBlock.text || ''),
                imageDescription: getPlainText(newBlock.imageDescription || ''),
              }
            : block
        )
      );

      // If lessonContent exists, also sync the fetched content block
      if (lessonContent?.data?.content) {
        setLessonContent(prev => ({
          ...prev,
          data: {
            ...prev.data,
            content: prev.data.content.map(b =>
              b.block_id === currentBlock.id
                ? {
                    ...b,
                    html_css: newBlock.html_css,
                    details: newBlock.details,
                    imageUrl: newBlock.imageUrl,
                    imageTitle: newBlock.imageTitle,
                    imageDescription: getPlainText(
                      newBlock.imageDescription || ''
                    ),
                    text: getPlainText(newBlock.text || ''),
                    layout: newBlock.layout,
                    templateType: newBlock.templateType,
                  }
                : b
            ),
          },
        }));
      }
    } else {
      // Add new block to local edit list immediately
      setContentBlocks(prev => [...prev, newBlock]);
    }
  };

  const toggleImageBlockEditing = blockId => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, isEditing: !block.isEditing } : block
      )
    );
  };

  const handleImageFileUpload = async (blockId, file, retryCount = 0) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleImageFileUpload
    ) {
      await imageBlockComponentRef.current.handleImageFileUpload(
        blockId,
        file,
        retryCount
      );
    }
  };

  const handleImageBlockEdit = (blockId, field, value) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleImageBlockEdit
    ) {
      imageBlockComponentRef.current.handleImageBlockEdit(
        blockId,
        field,
        value
      );
    }
  };

  const saveImageTemplateChanges = blockId => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.saveImageTemplateChanges
    ) {
      imageBlockComponentRef.current.saveImageTemplateChanges(blockId);
    }
  };

  const handleInlineImageFileUpload = (blockId, file) => {
    if (
      imageBlockComponentRef.current &&
      imageBlockComponentRef.current.handleInlineImageFileUpload
    ) {
      imageBlockComponentRef.current.handleInlineImageFileUpload(blockId, file);
    }
  };

  const handleLinkUpdate = linkBlock => {
    if (editingLinkBlock) {
      // Update existing link block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingLinkBlock.id
            ? {
                ...block,
                ...linkBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingLinkBlock.id ||
              block.id === editingLinkBlock.id
                ? {
                    ...block,
                    ...linkBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        // Insert at specific position in contentBlocks (always update this for immediate UI)
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, linkBlock);
          return newBlocks;
        });

        // Also update lessonContent if it exists
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, linkBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new link block - only add to contentBlocks like other block handlers
        setContentBlocks(prevBlocks => [...prevBlocks, linkBlock]);
      }
    }

    // Reset editing state
    setEditingLinkBlock(null);
  };

  const handlePdfUpdate = pdfBlock => {
    if (editingPdfBlock) {
      // Update existing PDF block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingPdfBlock.id
            ? {
                ...block,
                ...pdfBlock,
                updatedAt: new Date().toISOString(),
              }
            : block
        )
      );

      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === editingPdfBlock.id ||
              block.id === editingPdfBlock.id
                ? {
                    ...block,
                    ...pdfBlock,
                    updatedAt: new Date().toISOString(),
                  }
                : block
            ),
          },
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        // Insert at specific position in contentBlocks (always update this for immediate UI)
        setContentBlocks(prevBlocks => {
          const newBlocks = [...prevBlocks];
          newBlocks.splice(insertionPosition, 0, pdfBlock);
          return newBlocks;
        });

        // Also update lessonContent if it exists
        if (lessonContent?.data?.content) {
          setLessonContent(prevLessonContent => {
            const newContent = [...prevLessonContent.data.content];
            newContent.splice(insertionPosition, 0, pdfBlock);
            return {
              ...prevLessonContent,
              data: {
                ...prevLessonContent.data,
                content: newContent,
              },
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new PDF block - only add to contentBlocks like other block handlers
        setContentBlocks(prevBlocks => [...prevBlocks, pdfBlock]);
      }
    }

    // Reset editing state
    setEditingPdfBlock(null);
  };

  useEffect(() => {
    const collapseSidebar = () => {
      if (setSidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    collapseSidebar();

    return () => {
      if (setSidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    };
  }, [setSidebarCollapsed]);

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        setFetchingContent(true);

        if (location.state?.lessonData) {
          const { title, contentBlocks } = location.state.lessonData;
          setLessonTitle(title);
          setContentBlocks(contentBlocks || []);
          setLessonData(location.state.lessonData);

          // Fetch lesson content
          try {
            const lessonId = location.state.lessonData.id;
            console.log('Fetching lesson content for:', lessonId);

            // Get the token
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No authentication token found');
            }

            // Make the API call
            const contentResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/${lessonId}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!contentResponse.ok) {
              throw new Error(`HTTP error! status: ${contentResponse.status}`);
            }

            const contentData = await contentResponse.json();
            console.log('Content response:', contentData);

            if (contentData) {
              console.log('Setting lesson content:', contentData);
              setLessonContent(contentData);

              // Mirror fetched content into edit-mode blocks so newly added blocks append after existing ones
              try {
                const fetchedBlocks = Array.isArray(contentData?.data?.content)
                  ? contentData.data.content
                  : [];
                const mappedEditBlocks = fetchedBlocks.map((b, i) => {
                  const base = {
                    id: b.block_id || `block_${i + 1}`,
                    block_id: b.block_id || `block_${i + 1}`,
                    type: b.type,
                    order: i + 1,
                    html_css: b.html_css || '',
                    details: b.details || {},
                    isEditing: false,
                    timestamp: new Date().toISOString(),
                  };
                  if (b.type === 'image') {
                    return {
                      ...base,
                      title: 'Image',
                      layout: b.details?.layout || 'centered',
                      templateType: b.details?.template || undefined,
                      alignment: b.details?.alignment || 'left', // Extract alignment from details
                      imageUrl: b.details?.image_url || '',
                      imageTitle: b.details?.alt_text || 'Image',
                      imageDescription: b.details?.caption || '',
                      text: b.details?.caption || '',
                    };
                  }

                  if (b.type === 'pdf') {
                    return {
                      ...base,
                      type: 'pdf',
                      pdfUrl: b.details?.pdf_url || '',
                      pdfTitle: b.details?.caption || 'PDF Document',
                      pdfDescription: b.details?.description || '',
                    };
                  }
                  if (b.type === 'video') {
                    return {
                      ...base,
                      type: 'video',
                      videoUrl: b.details?.video_url || '',
                      videoTitle: b.details?.caption || '',
                    };
                  }
                  if (b.type === 'statement') {
                    return {
                      ...base,
                      type: 'statement',
                      title: b.details?.title || 'Statement',
                      statementType:
                        b.details?.statement_type ||
                        b.details?.statementType ||
                        'statement-a',
                      content: b.details?.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'table') {
                    return {
                      ...base,
                      type: 'table',
                      title: b.details?.title || 'Table',
                      tableType:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      templateId:
                        b.details?.table_type ||
                        b.details?.templateId ||
                        b.tableType ||
                        'two_columns',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'quote') {
                    return {
                      ...base,
                      type: 'quote',
                      title: b.details?.title || 'Quote',
                      textType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      quoteType:
                        b.details?.quote_type ||
                        b.details?.quoteType ||
                        b.textType ||
                        'quote_a',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'divider') {
                    // Determine divider subtype from details, subtype, or HTML
                    let dividerSubtype = b.details?.divider_type || b.subtype;
                    if (!dividerSubtype && typeof b.html_css === 'string') {
                      const html = b.html_css;
                      if (
                        (html.includes('cursor-pointer') ||
                          html.includes('letter-spacing')) &&
                        (html.includes('background-color') ||
                          html.includes('bg-blue'))
                      ) {
                        dividerSubtype = 'continue';
                      } else if (
                        (html.includes('rounded-full') ||
                          html.includes('border-radius: 50%')) &&
                        (html.includes('<hr') || html.includes('border-top'))
                      ) {
                        dividerSubtype = 'numbered_divider';
                      } else if (html.includes('<hr')) {
                        dividerSubtype = 'divider';
                      } else {
                        dividerSubtype = 'continue';
                      }
                    }
                    return {
                      ...base,
                      type: 'divider',
                      title: 'Divider',
                      subtype: dividerSubtype || 'continue',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'interactive') {
                    // Detect interactive template type from subtype, content, or HTML patterns
                    let template = b.subtype || b.details?.template;

                    // If no template found, try parsing content
                    if (!template && b.content) {
                      try {
                        const content = JSON.parse(b.content);
                        template = content.template;
                      } catch (error) {
                        console.log(
                          'Could not parse interactive content as JSON'
                        );
                      }
                    }

                    // If still no template, detect from HTML patterns
                    if (!template && b.html_css) {
                      const htmlContent = b.html_css;
                      if (
                        htmlContent.includes('data-template="accordion"') ||
                        htmlContent.includes('accordion-header') ||
                        htmlContent.includes('accordion-content') ||
                        htmlContent.includes('interactive-accordion')
                      ) {
                        template = 'accordion';
                      } else if (
                        htmlContent.includes('data-template="tabs"') ||
                        htmlContent.includes('tab-button') ||
                        htmlContent.includes('interactive-tabs')
                      ) {
                        template = 'tabs';
                      } else if (
                        htmlContent.includes(
                          'data-template="labeled-graphic"'
                        ) ||
                        htmlContent.includes('labeled-graphic-container')
                      ) {
                        template = 'labeled-graphic';
                      }
                    }

                    return {
                      ...base,
                      type: 'interactive',
                      title: b.details?.title || 'Interactive Content',
                      subtype: template || 'accordion',
                      template: template || 'accordion',
                      content: b.content || '',
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'audio') {
                    // Reconstruct audio content JSON from database fields
                    let audioContent = {};

                    // Try to parse existing content first
                    if (b.content) {
                      try {
                        audioContent = JSON.parse(b.content);
                      } catch (e) {
                        console.log(
                          'Could not parse existing audio content, reconstructing from details'
                        );
                      }
                    }

                    // If content is empty or parsing failed, reconstruct from details
                    if (!audioContent.title && !audioContent.url) {
                      audioContent = {
                        title:
                          b.details?.audioTitle ||
                          b.details?.title ||
                          b.title ||
                          'Audio',
                        description:
                          b.details?.audioDescription ||
                          b.details?.description ||
                          '',
                        uploadMethod: b.details?.uploadMethod || 'url',
                        url: b.details?.audioUrl || b.details?.audio_url || '',
                        uploadedData: b.details?.uploadedData || null,
                        createdAt: b.createdAt || new Date().toISOString(),
                      };
                    }

                    return {
                      ...base,
                      type: 'audio',
                      title: audioContent.title || 'Audio',
                      content: JSON.stringify(audioContent),
                      html_css: b.html_css || '',
                    };
                  }
                  if (b.type === 'youtube') {
                    // Reconstruct YouTube content JSON from database fields
                    let youTubeContent = {};

                    // Try to parse existing content first
                    if (b.content) {
                      try {
                        youTubeContent = JSON.parse(b.content);
                      } catch (e) {
                        console.log(
                          'Could not parse existing YouTube content, reconstructing from details'
                        );
                      }
                    }

                    // If content is empty or parsing failed, reconstruct from details
                    if (
                      !youTubeContent.url ||
                      youTubeContent.url.trim() === ''
                    ) {
                      console.log(
                        'Reconstructing YouTube content from details:',
                        b.details
                      );
                      console.log('Available block data:', {
                        details: b.details,
                        content: b.content,
                        html_css: b.html_css ? 'Present' : 'Missing',
                      });

                      youTubeContent = {
                        title:
                          b.details?.youTubeTitle ||
                          b.details?.title ||
                          b.title ||
                          'YouTube Video',
                        description:
                          b.details?.youTubeDescription ||
                          b.details?.description ||
                          '',
                        url:
                          b.details?.youTubeUrl || b.details?.youtube_url || '',
                        videoId: b.details?.videoId || '',
                        embedUrl: b.details?.embedUrl || '',
                        createdAt: b.createdAt || new Date().toISOString(),
                      };

                      // If still no URL found, try to extract from html_css as last resort
                      if (!youTubeContent.url && b.html_css) {
                        const srcMatch =
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/embed\/[^"]*)"/
                          ) ||
                          b.html_css.match(/src="([^"]*youtu\.be\/[^"]*)"/) ||
                          b.html_css.match(
                            /src="([^"]*youtube\.com\/watch\?v=[^"]*)"/
                          );
                        if (srcMatch) {
                          const extractedUrl = srcMatch[1];
                          console.log(
                            'Extracted URL from html_css:',
                            extractedUrl
                          );

                          // Convert embed URL back to watch URL if needed
                          let watchUrl = extractedUrl;
                          if (extractedUrl.includes('/embed/')) {
                            const videoId = extractedUrl
                              .split('/embed/')[1]
                              .split('?')[0];
                            watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                            youTubeContent.videoId = videoId;
                            youTubeContent.embedUrl = extractedUrl;
                          }
                          youTubeContent.url = watchUrl;
                        }
                      }
                    }

                    console.log('YouTube block loading result:', {
                      blockId: b.id,
                      finalContent: youTubeContent,
                      hasUrl: !!youTubeContent.url,
                    });

                    return {
                      ...base,
                      type: 'youtube',
                      title: youTubeContent.title || 'YouTube Video',
                      content: JSON.stringify(youTubeContent),
                      html_css: b.html_css || '',
                    };
                  }
                  // Default map to text block with preserved HTML
                  {
                    const html = b.html_css || '';
                    const lowered = html.toLowerCase();
                    const hasH1 = lowered.includes('<h1');
                    const hasH2 = lowered.includes('<h2');
                    const hasP = lowered.includes('<p');
                    // Check for master heading first (has gradient background)
                    const isMasterHeading =
                      hasH1 &&
                      (lowered.includes('linear-gradient') ||
                        lowered.includes('gradient'));

                    const detectedType = isMasterHeading
                      ? 'master_heading'
                      : hasH1 && hasP
                        ? 'heading_paragraph'
                        : hasH2 && hasP
                          ? 'subheading_paragraph'
                          : hasH1
                            ? 'heading'
                            : hasH2
                              ? 'subheading'
                              : 'paragraph';
                    return {
                      ...base,
                      type: 'text',
                      title: 'Text Block',
                      textType: detectedType,
                      content: html,
                    };
                  }
                });
                if (mappedEditBlocks.length > 0) {
                  setContentBlocks(mappedEditBlocks);
                  // Clear lessonContent completely to prevent duplicate rendering in edit mode
                  setLessonContent(null);
                }
              } catch (e) {
                console.warn(
                  'Failed to map fetched content to edit blocks:',
                  e
                );
              }
            } else {
              console.log('No content found for this lesson');
            }
          } catch (contentError) {
            console.error('Error fetching lesson content:', contentError);
            console.error(
              'Error details:',
              contentError.response?.data || contentError.message
            );
          }

          setLoading(false);
          setFetchingContent(false);
          return;
        }

        if (lessonId) {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch lesson data');
          }

          const lessonData = await response.json();
          setLessonData(lessonData);
          setLessonTitle(lessonData.title || 'Untitled Lesson');
          setContentBlocks(lessonData.contentBlocks || []);
        } else {
          setLessonTitle('New Lesson');
          setLessonData({
            id: null,
            title: 'New Lesson',
            description: '',
            contentBlocks: [],
            status: 'DRAFT',
          });
          setContentBlocks([]);
        }
      } catch (error) {
        console.error('Error loading lesson data:', error);
        setLessonTitle('Untitled Lesson');
        if (error.message.includes('token') || error.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadLessonData();
  }, [courseId, moduleId, lessonId, navigate, location.state]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-white overflow-hidden">
        {/* Shimmer Content Library Sidebar */}
        <div
          className="fixed top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
          style={{
            left: sidebarCollapsed ? '4.5rem' : '17rem',
          }}
        >
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Shimmer Header */}
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>

            {/* Shimmer Content Block Grid */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                  <Card key={index} className="border border-gray-200 h-28">
                    <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shimmer Main Content */}
        <div
          className={`flex-1 transition-all duration-300 relative ${
            sidebarCollapsed
              ? 'ml-[calc(4.5rem+16rem)]'
              : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          {/* Shimmer Fixed Header */}
          <div
            className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30"
            style={{
              left: sidebarCollapsed
                ? 'calc(4.5rem + 16rem)'
                : 'calc(17rem + 16rem)',
            }}
          >
            <div className="max-w-[800px] mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Shimmer Main Content Canvas */}
          <div className="w-full h-full bg-[#fafafa] pt-20">
            <div className="py-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Shimmer Content Blocks */}
                {[1, 2, 3].map(index => (
                  <div key={index} className="relative bg-white rounded-lg p-6">
                    {/* Master Heading Shimmer */}
                    {index === 1 && (
                      <div className="mb-8">
                        <div className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
                      </div>
                    )}

                    {/* Regular Heading Shimmer */}
                    {index === 2 && (
                      <div className="mb-8 space-y-3">
                        <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      </div>
                    )}

                    {/* Paragraph Shimmer */}
                    {index === 3 && (
                      <div className="mb-8 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full bg-white overflow-hidden">
        {/* Content Blocks Sidebar */}
        <div
          className="fixed top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
          style={{
            left: sidebarCollapsed ? '4.5rem' : '17rem',
          }}
        >
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                Content Library
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop content blocks to build your lesson
              </p>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 gap-3">
                {contentBlockTypes.map(blockType => (
                  <Card
                    key={blockType.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 h-28 flex flex-col group hover:border-indigo-200 hover:bg-indigo-50"
                    onClick={() => handleBlockClick(blockType)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-3 h-full">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-200 transition-colors">
                        {blockType.icon}
                      </div>
                      <h3 className="text-xs font-medium text-gray-800 text-center">
                        {blockType.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 text-center mt-1 line-clamp-1">
                        {blockType.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 relative ${
            sidebarCollapsed
              ? 'ml-[calc(4.5rem+16rem)]'
              : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          {/* Fixed Header */}
          <div
            className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30"
            style={{
              left: sidebarCollapsed
                ? 'calc(4.5rem + 16rem)'
                : 'calc(17rem + 16rem)',
            }}
          >
            <div className="max-w-[800px] mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <h1 className="text-lg font-bold">
                  {lessonData?.title || lessonTitle || 'Untitled Lesson'}
                </h1>
              </div>

              <div className="flex items-center space-x-3">
                {/* Auto-save status indicator */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-sm">
                    {autoSaveStatus === 'saving' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-blue-600 font-medium">
                          Auto-saving...
                        </span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' &&
                      hasUnsavedChanges === false && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Auto-saved
                          </span>
                        </>
                      )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          Auto-save failed
                        </span>
                      </>
                    )}
                  </div>
                  {autoSaveStatus !== 'saving' && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      Auto-save enabled
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUploading || autoSaveStatus === 'saving'}
                  title={
                    autoSaveStatus === 'error'
                      ? 'Auto-save failed - click to save manually'
                      : 'Manually save changes now'
                  }
                  variant={
                    autoSaveStatus === 'error' ? 'destructive' : 'default'
                  }
                >
                  {isUploading || autoSaveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : autoSaveStatus === 'error' ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Save Now
                    </>
                  ) : (
                    'Save Now'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Canvas with top padding for fixed header */}
          <div className="w-full h-full bg-[#fafafa] pt-20">
            <div className="py-4">
              <div>
                {/* Always show edit interface since View mode is replaced by Modern Preview */}
                {(() => {
                  // Get all blocks from single source of truth
                  const allBlocks =
                    lessonContent?.data?.content &&
                    lessonContent.data.content.length > 0
                      ? lessonContent.data.content
                      : contentBlocks;
                  return allBlocks.length === 0;
                })() ? (
                  <div className="h-[calc(100vh-8rem)] flex items-center justify-center px-4 overflow-hidden">
                    <div className="max-w-2xl mx-auto text-center">
                      {/* Beautiful gradient background */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 rounded-3xl transform rotate-1"></div>
                        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                          {/* Animated icon */}
                          <div className="mb-4 relative">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div
                              className="absolute -bottom-1 -left-3 w-4 h-4 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.5s' }}
                            ></div>
                          </div>

                          {/* Main heading */}
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                            Ready to Create Something Amazing?
                          </h2>

                          {/* Subtitle */}
                          <p className="text-base text-gray-600 mb-6 leading-relaxed">
                            Your lesson canvas is waiting! Start building
                            engaging content by adding blocks from the sidebar.
                          </p>

                          {/* Feature highlights */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                  />
                                </svg>
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                Rich Content
                              </h4>
                              <p className="text-sm text-gray-600 text-center">
                                Add text, images, videos & more
                              </p>
                            </div>

                            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                                  />
                                </svg>
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                Interactive
                              </h4>
                              <p className="text-sm text-gray-600 text-center">
                                Drag & drop to organize
                              </p>
                            </div>

                            <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl border border-pink-100">
                              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-3">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                Fast & Easy
                              </h4>
                              <p className="text-sm text-gray-600 text-center">
                                Build lessons in minutes
                              </p>
                            </div>
                          </div>
                          {/* Decorative elements */}
                          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                          <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-60"></div>
                          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {(() => {
                      // Use single source of truth for rendering
                      const blocksToRender =
                        lessonContent?.data?.content &&
                        lessonContent.data.content.length > 0
                          ? lessonContent.data.content
                          : contentBlocks;

                      console.log('Rendering blocks from single source:', {
                        source:
                          lessonContent?.data?.content?.length > 0
                            ? 'lessonContent'
                            : 'contentBlocks',
                        totalBlocks: blocksToRender.length,

                        blockIds: blocksToRender.map(b => b.id || b.block_id),
                      });

                      return blocksToRender.map((block, index) => {
                        const blockId = block.id || block.block_id;
                        return (
                          <div
                            key={blockId}
                            data-block-id={blockId}
                            className="relative group bg-white rounded-lg"
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, blockId)}
                          >
                            <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              {!block.isEditing && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                                  onClick={() => {
                                    // Always use handleEditBlock for proper type detection
                                    if (
                                      block.type === 'image' &&
                                      block.layout
                                    ) {
                                      toggleImageBlockEditing(block.id);
                                    } else {
                                      handleEditBlock(block.id);
                                    }
                                  }}
                                  title={`Edit ${block.type}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                                onClick={() => removeContentBlock(block.id)}
                                title={`Remove ${block.type}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                              <div
                                className="h-8 w-8 flex items-center justify-center text-gray-400 cursor-move"
                                draggable
                                onDragStart={e => handleDragStart(e, blockId)}
                                onDragEnd={handleDragEnd}
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="p-6">
                              {block.type === 'text' && (
                                <div className="mb-8">
                                  {block.html_css ? (
                                    <div
                                      className="max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="max-w-none text-gray-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {block.type === 'statement' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Statement
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Statement
                                    </Badge>
                                  </div>

                                  {block.html_css ? (
                                    <div
                                      className="max-w-none text-gray-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="max-w-none text-gray-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {block.type === 'interactive' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Interactive
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Interactive
                                    </Badge>
                                  </div>

                                  {block.html_css ? (
                                    <div
                                      className="max-w-none text-gray-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="max-w-none text-gray-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {block.type === 'link' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.linkTitle}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Link
                                    </Badge>
                                  </div>

                                  {block.linkDescription && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {block.linkDescription}
                                    </p>
                                  )}

                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <button
                                      onClick={() =>
                                        window.open(
                                          block.linkUrl,
                                          '_blank',
                                          'noopener,noreferrer'
                                        )
                                      }
                                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        block.linkButtonStyle === 'primary'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : block.linkButtonStyle ===
                                              'secondary'
                                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                                            : block.linkButtonStyle ===
                                                'success'
                                              ? 'bg-green-600 text-white hover:bg-green-700'
                                              : block.linkButtonStyle ===
                                                  'warning'
                                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                                : block.linkButtonStyle ===
                                                    'danger'
                                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                                  : block.linkButtonStyle ===
                                                      'outline'
                                                    ? 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      {block.linkButtonText || 'Visit Link'}
                                      <svg
                                        className="ml-2 h-3 w-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {block.type === 'video' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title
                                        ?.replace(
                                          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
                                          ''
                                        )
                                        .trim() || 'Video'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Video
                                    </Badge>
                                  </div>

                                  {(() => {
                                    // First try to get video URL from block properties (for newly created blocks)
                                    let videoUrl =
                                      block.videoUrl ||
                                      block.details?.video_url ||
                                      '';
                                    let videoTitle = (
                                      block.videoTitle ||
                                      block.details?.caption ||
                                      'Video'
                                    )
                                      .replace(
                                        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
                                        ''
                                      )
                                      .trim();
                                    let videoDescription =
                                      block.videoDescription ||
                                      block.details?.description ||
                                      '';

                                    console.log('Video block edit rendering:', {
                                      blockId: block.id,
                                      videoUrl,
                                      videoTitle,
                                      videoDescription,
                                      blockDetails: block.details,
                                      hasUrl: !!videoUrl,
                                    });

                                    // Check if we have a valid video URL
                                    if (videoUrl && videoUrl.trim()) {
                                      // Check if it's a YouTube URL by looking at the content or checking if it's an embed URL
                                      const isYouTubeVideo =
                                        videoUrl.includes(
                                          'youtube.com/embed'
                                        ) ||
                                        (block.content &&
                                          JSON.parse(block.content)
                                            .isYouTube) ||
                                        (block.details &&
                                          block.details.isYouTube);

                                      return (
                                        <>
                                          {videoDescription && (
                                            <p className="text-sm text-gray-600 mb-3">
                                              {videoDescription}
                                            </p>
                                          )}

                                          <div className="bg-gray-50 rounded-lg p-4">
                                            {isYouTubeVideo ? (
                                              <iframe
                                                src={videoUrl}
                                                title={videoTitle}
                                                className="w-full max-w-full"
                                                style={{
                                                  height: '400px',
                                                  borderRadius: '8px',
                                                }}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              />
                                            ) : (
                                              <video
                                                controls
                                                className="w-full max-w-full"
                                                style={{ maxHeight: '400px' }}
                                                preload="metadata"
                                              >
                                                <source
                                                  src={videoUrl}
                                                  type="video/mp4"
                                                />
                                                <source
                                                  src={videoUrl}
                                                  type="video/webm"
                                                />
                                                <source
                                                  src={videoUrl}
                                                  type="video/ogg"
                                                />
                                                Your browser does not support
                                                the video element.
                                              </video>
                                            )}
                                          </div>
                                        </>
                                      );
                                    } else {
                                      // Fallback: Use html_css if video URL not found
                                      console.log(
                                        'No URL in video block, falling back to html_css'
                                      );
                                      if (
                                        block.html_css &&
                                        block.html_css.trim()
                                      ) {
                                        return (
                                          <div
                                            className="max-w-none"
                                            dangerouslySetInnerHTML={{
                                              __html: block.html_css,
                                            }}
                                          />
                                        );
                                      } else {
                                        return (
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              Video URL not found
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                              Block details:{' '}
                                              {JSON.stringify(block.details)}
                                            </p>
                                          </div>
                                        );
                                      }
                                    }
                                  })()}
                                </div>
                              )}

                              {block.type === 'audio' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title || 'Audio'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Audio
                                    </Badge>
                                  </div>

                                  {(() => {
                                    try {
                                      const audioContent = JSON.parse(
                                        block.content || '{}'
                                      );
                                      console.log(
                                        'Audio block edit rendering:',
                                        {
                                          blockId: block.id,
                                          audioContent,
                                          hasUrl: !!audioContent.url,
                                          url: audioContent.url,
                                        }
                                      );

                                      // Check if we have a valid audio URL
                                      if (
                                        audioContent.url &&
                                        audioContent.url.trim()
                                      ) {
                                        return (
                                          <>
                                            {audioContent.description && (
                                              <p className="text-sm text-gray-600 mb-3">
                                                {audioContent.description}
                                              </p>
                                            )}

                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <audio
                                                controls
                                                className="w-full"
                                                preload="metadata"
                                              >
                                                <source
                                                  src={audioContent.url}
                                                  type="audio/mpeg"
                                                />
                                                <source
                                                  src={audioContent.url}
                                                  type="audio/wav"
                                                />
                                                <source
                                                  src={audioContent.url}
                                                  type="audio/ogg"
                                                />
                                                Your browser does not support
                                                the audio element.
                                              </audio>

                                              {audioContent.uploadedData && (
                                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                  <Volume2 className="h-3 w-3 mr-1" />
                                                  <span>
                                                    {
                                                      audioContent.uploadedData
                                                        .fileName
                                                    }
                                                  </span>
                                                  <span className="ml-2">
                                                    (
                                                    {(
                                                      audioContent.uploadedData
                                                        .fileSize /
                                                      (1024 * 1024)
                                                    ).toFixed(2)}{' '}
                                                    MB)
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </>
                                        );
                                      } else {
                                        // Fallback: Use html_css if JSON doesn't have URL
                                        console.log(
                                          'No URL in audio content, falling back to html_css'
                                        );
                                        if (
                                          block.html_css &&
                                          block.html_css.trim()
                                        ) {
                                          return (
                                            <div
                                              className="max-w-none"
                                              dangerouslySetInnerHTML={{
                                                __html: block.html_css,
                                              }}
                                            />
                                          );
                                        } else {
                                          return (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <p className="text-sm text-gray-500">
                                                Audio URL not found
                                              </p>
                                              <p className="text-xs text-gray-400 mt-1">
                                                Content:{' '}
                                                {JSON.stringify(audioContent)}
                                              </p>
                                            </div>
                                          );
                                        }
                                      }
                                    } catch (e) {
                                      console.error(
                                        'Error parsing audio content in edit mode:',
                                        e
                                      );
                                      // Fallback: Use html_css if JSON parsing fails
                                      if (
                                        block.html_css &&
                                        block.html_css.trim()
                                      ) {
                                        return (
                                          <div
                                            className="max-w-none"
                                            dangerouslySetInnerHTML={{
                                              __html: block.html_css,
                                            }}
                                          />
                                        );
                                      } else {
                                        return (
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              Audio content could not be loaded
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                              Error: {e.message}
                                            </p>
                                          </div>
                                        );
                                      }
                                    }
                                  })()}
                                </div>
                              )}

                              {block.type === 'youtube' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title || 'YouTube Video'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      YouTube
                                    </Badge>
                                  </div>

                                  {(() => {
                                    try {
                                      const youTubeContent = JSON.parse(
                                        block.content || '{}'
                                      );
                                      console.log(
                                        'YouTube block edit rendering:',
                                        {
                                          blockId: block.id,
                                          youTubeContent,
                                          hasUrl: !!youTubeContent.url,
                                          url: youTubeContent.url,
                                        }
                                      );

                                      // Check if we have a valid YouTube URL
                                      if (
                                        youTubeContent.url &&
                                        youTubeContent.url.trim()
                                      ) {
                                        return (
                                          <>
                                            {youTubeContent.description && (
                                              <p className="text-sm text-gray-600 mb-3">
                                                {youTubeContent.description}
                                              </p>
                                            )}

                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                                                <iframe
                                                  className="absolute top-0 left-0 w-full h-full"
                                                  src={
                                                    youTubeContent.embedUrl ||
                                                    youTubeContent.url
                                                      .replace(
                                                        'watch?v=',
                                                        'embed/'
                                                      )
                                                      .replace(
                                                        'youtu.be/',
                                                        'youtube.com/embed/'
                                                      )
                                                  }
                                                  title={
                                                    youTubeContent.title ||
                                                    'YouTube Video'
                                                  }
                                                  frameBorder="0"
                                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                  allowFullScreen
                                                />
                                              </div>

                                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                <Youtube className="h-3 w-3 mr-1 text-red-600" />
                                                <span>YouTube Video</span>
                                              </div>
                                            </div>
                                          </>
                                        );
                                      } else {
                                        // No fallback to html_css to prevent duplication
                                        return (
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">
                                              YouTube URL not found
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                              Content:{' '}
                                              {JSON.stringify(youTubeContent)}
                                            </p>
                                          </div>
                                        );
                                      }
                                    } catch (e) {
                                      console.error(
                                        'Error parsing YouTube content in edit mode:',
                                        e
                                      );
                                      // No fallback to html_css to prevent duplication
                                      return (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">
                                            YouTube content could not be loaded
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            Error: {e.message}
                                          </p>
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              )}

                              {block.type === 'quote' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title || 'Quote'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Quote
                                    </Badge>
                                  </div>

                                  {block.html_css ? (
                                    <div
                                      className="max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                      <blockquote className="text-lg italic text-gray-700 mb-3">
                                        "
                                        {(() => {
                                          try {
                                            const content = JSON.parse(
                                              block.content || '{}'
                                            );
                                            return (
                                              content.quote ||
                                              'Sample quote text'
                                            );
                                          } catch {
                                            return 'Sample quote text';
                                          }
                                        })()}
                                        "
                                      </blockquote>
                                      <cite className="text-sm font-medium text-gray-500">
                                        —{' '}
                                        {(() => {
                                          try {
                                            const content = JSON.parse(
                                              block.content || '{}'
                                            );
                                            return (
                                              content.author || 'Author Name'
                                            );
                                          } catch {
                                            return 'Author Name';
                                          }
                                        })()}
                                      </cite>
                                    </div>
                                  )}
                                </div>
                              )}

                              {block.type === 'table' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title || 'Table'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Table
                                    </Badge>
                                  </div>

                                  {block.html_css ? (
                                    <div
                                      className="max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                      <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{
                                          __html: block.content,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {block.type === 'list' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.title || 'List'}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      List
                                    </Badge>
                                  </div>

                                  {(() => {
                                    // Check if this is a checkbox list
                                    const isCheckboxList =
                                      block.listType === 'checkbox' ||
                                      (block.details &&
                                        block.details.listType ===
                                          'checkbox') ||
                                      (block.details &&
                                        block.details.list_type ===
                                          'checkbox') ||
                                      (block.html_css &&
                                        block.html_css.includes(
                                          'checkbox-container'
                                        ));

                                    console.log('List block debug:', {
                                      blockId: block.id,
                                      listType: block.listType,
                                      details: block.details,
                                      hasHtmlCss: !!block.html_css,
                                      isCheckboxList,
                                      htmlCssSnippet: block.html_css
                                        ? block.html_css.substring(0, 100)
                                        : 'none',
                                    });

                                    if (isCheckboxList && block.html_css) {
                                      console.log(
                                        'Using InteractiveListRenderer for block:',
                                        block.id
                                      );
                                      return (
                                        <InteractiveListRenderer
                                          block={block}
                                          onCheckboxToggle={(
                                            blockId,
                                            itemIndex,
                                            checked
                                          ) =>
                                            handleCheckboxToggle(
                                              blockId,
                                              itemIndex,
                                              checked
                                            )
                                          }
                                        />
                                      );
                                    } else if (block.html_css) {
                                      return (
                                        <div
                                          className="max-w-none"
                                          dangerouslySetInnerHTML={{
                                            __html: block.html_css,
                                          }}
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                          <div
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{
                                              __html: block.content,
                                            }}
                                          />
                                        </div>
                                      );
                                    }
                                  })()}
                                </div>
                              )}

                              {block.type === 'pdf' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {block.pdfTitle}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      PDF
                                    </Badge>
                                  </div>

                                  {block.pdfDescription && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {block.pdfDescription}
                                    </p>
                                  )}

                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="w-full border rounded-lg overflow-hidden">
                                      <iframe
                                        src={
                                          block.pdfUrl || block.details?.pdf_url
                                        }
                                        className="w-full h-[400px]"
                                        title={block.pdfTitle || 'PDF Document'}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {block.type === 'image' &&
                                (block.imageUrl ||
                                  block.defaultContent?.imageUrl) && (
                                  <>
                                    <div className="flex items-center gap-2 mb-3">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {block.title}
                                      </h3>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {block.layout === 'side-by-side'
                                          ? 'Image & text'
                                          : block.layout === 'overlay'
                                            ? 'Text on image'
                                            : block.layout === 'full-width'
                                              ? 'Image full width'
                                              : 'Image centered'}
                                      </Badge>
                                    </div>

                                    {block.isEditing ? (
                                      /* Edit Mode */
                                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Image
                                          </label>
                                          <div className="space-y-3">
                                            {/* Image Upload */}
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                disabled={
                                                  imageUploading[block.id]
                                                }
                                                onChange={e => {
                                                  const file =
                                                    e.target.files[0];
                                                  if (file) {
                                                    handleInlineImageFileUpload(
                                                      block.id,
                                                      file
                                                    );
                                                  }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                              />
                                              {imageUploading[block.id] && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                  <span>Uploading...</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* OR divider */}
                                            <div className="flex items-center">
                                              <div className="flex-1 border-t border-gray-300"></div>
                                              <span className="px-3 text-sm text-gray-500">
                                                OR
                                              </span>
                                              <div className="flex-1 border-t border-gray-300"></div>
                                            </div>

                                            {/* Image URL */}
                                            <input
                                              type="url"
                                              value={block.imageUrl}
                                              onChange={e =>
                                                handleImageBlockEdit(
                                                  block.id,
                                                  'imageUrl',
                                                  e.target.value
                                                )
                                              }
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                              placeholder="Enter image URL"
                                            />

                                            {/* Image Preview */}
                                            {(block.imageUrl ||
                                              block.defaultContent
                                                ?.imageUrl) && (
                                              <div className="mt-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <span className="text-sm font-medium text-gray-700">
                                                    Current Image:
                                                  </span>
                                                </div>
                                                <img
                                                  src={
                                                    block.imageUrl ||
                                                    block.defaultContent
                                                      ?.imageUrl
                                                  }
                                                  alt="Preview"
                                                  className="mt-2 max-h-48 w-auto rounded-md border border-gray-300"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Text Content
                                          </label>
                                          <ReactQuill
                                            theme="snow"
                                            value={block.text}
                                            onChange={value =>
                                              handleImageBlockEdit(
                                                block.id,
                                                'text',
                                                value
                                              )
                                            }
                                            modules={getToolbarModules('full')}
                                            style={{ minHeight: '100px' }}
                                          />
                                        </div>

                                        {/* Image Alignment Options for side-by-side layout */}
                                        {block.layout === 'side-by-side' && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                              Image Alignment
                                            </label>
                                            <div className="flex gap-4">
                                              <label className="flex items-center">
                                                <input
                                                  type="radio"
                                                  name={`alignment-${block.id}`}
                                                  value="left"
                                                  checked={
                                                    block.alignment === 'left'
                                                  }
                                                  onChange={e =>
                                                    handleImageBlockEdit(
                                                      block.id,
                                                      'alignment',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="mr-2"
                                                />
                                                <span className="text-sm">
                                                  Image Left, Text Right
                                                </span>
                                              </label>
                                              <label className="flex items-center">
                                                <input
                                                  type="radio"
                                                  name={`alignment-${block.id}`}
                                                  value="right"
                                                  checked={
                                                    block.alignment === 'right'
                                                  }
                                                  onChange={e =>
                                                    handleImageBlockEdit(
                                                      block.id,
                                                      'alignment',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="mr-2"
                                                />
                                                <span className="text-sm">
                                                  Image Right, Text Left
                                                </span>
                                              </label>
                                            </div>
                                          </div>
                                        )}

                                        {/* Save and Cancel Buttons */}
                                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              toggleImageBlockEditing(block.id)
                                            }
                                            className="px-4"
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              saveImageTemplateChanges(block.id)
                                            }
                                            disabled={imageUploading[block.id]}
                                            className="px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {imageUploading[block.id] ? (
                                              <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Uploading...
                                              </>
                                            ) : (
                                              'Save Changes'
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Display Mode - smaller preview for edit mode */
                                      <div>
                                        {block.layout === 'side-by-side' && (
                                          <div className="flex gap-3 items-start">
                                            {block.alignment === 'right' ? (
                                              // Image Right, Text Left
                                              <>
                                                <div className="w-1/2">
                                                  <p className="text-sm text-gray-600 line-clamp-4">
                                                    {getPlainText(
                                                      block.text || ''
                                                    ).substring(0, 60)}
                                                    ...
                                                  </p>
                                                </div>
                                                <div className="w-1/2">
                                                  <img
                                                    src={block.imageUrl}
                                                    alt="Image"
                                                    className="w-full h-20 object-cover rounded"
                                                  />
                                                </div>
                                              </>
                                            ) : (
                                              // Image Left, Text Right (default)
                                              <>
                                                <div className="w-1/2">
                                                  <img
                                                    src={block.imageUrl}
                                                    alt="Image"
                                                    className="w-full h-20 object-cover rounded"
                                                  />
                                                </div>
                                                <div className="w-1/2">
                                                  <p className="text-sm text-gray-600 line-clamp-4">
                                                    {getPlainText(
                                                      block.text || ''
                                                    ).substring(0, 60)}
                                                    ...
                                                  </p>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                        {block.layout === 'overlay' && (
                                          <div className="relative">
                                            <img
                                              src={block.imageUrl}
                                              alt="Image"
                                              className="w-full h-24 object-cover rounded"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded flex items-center justify-center p-2">
                                              <p className="text-white text-sm text-center line-clamp-3">
                                                {getPlainText(
                                                  block.text || ''
                                                ).substring(0, 50)}
                                                ...
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                        {block.layout === 'centered' && (
                                          <div
                                            className={`space-y-3 ${block.alignment === 'left' ? 'text-left' : block.alignment === 'right' ? 'text-right' : 'text-center'}`}
                                          >
                                            <img
                                              src={block.imageUrl}
                                              alt="Image"
                                              className={`h-20 object-cover rounded ${block.alignment === 'center' ? 'mx-auto' : ''}`}
                                            />
                                            <p className="text-sm text-gray-600 italic line-clamp-2">
                                              {getPlainText(
                                                block.text || ''
                                              ).substring(0, 40)}
                                              ...
                                            </p>
                                          </div>
                                        )}
                                        {block.layout === 'full-width' && (
                                          <div className="space-y-3">
                                            <img
                                              src={block.imageUrl}
                                              alt="Image"
                                              className="w-full h-24 object-cover rounded"
                                            />
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                              {getPlainText(
                                                block.text || ''
                                              ).substring(0, 60)}
                                              ...
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}

                              {/* Divider Content */}
                              {block.type === 'divider' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Divider
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {block.subtype || 'Divider'}
                                    </Badge>
                                  </div>

                                  {block.html_css ? (
                                    <div
                                      className="max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: block.html_css,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: block.content,
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Inline Block Insertion - Plus Button */}
                            <div className="flex justify-center items-center py-1">
                              <button
                                onClick={() => {
                                  setInsertionPosition(index + 1);
                                  setShowInsertBlockDialog(true);
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                title="Insert block here"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <VideoComponent
        showVideoDialog={showVideoDialog}
        setShowVideoDialog={setShowVideoDialog}
        onVideoUpdate={handleVideoUpdate}
        editingVideoBlock={editingVideoBlock}
      />

      {/* Table Component */}
      {showTableComponent && (
        <TableComponent
          onTemplateSelect={handleTableTemplateSelect}
          onClose={() => {
            setShowTableComponent(false);
            setEditingTableBlock(null);
          }}
          editingBlock={editingTableBlock}
          isEditing={!!editingTableBlock}
          onTableUpdate={handleTableUpdate}
        />
      )}

      {/* List Component */}
      <ListComponent
        ref={listComponentRef}
        showListTemplateSidebar={showListTemplateSidebar}
        setShowListTemplateSidebar={setShowListTemplateSidebar}
        showListEditDialog={showListEditDialog}
        setShowListEditDialog={setShowListEditDialog}
        onListTemplateSelect={handleListTemplateSelect}
        onListUpdate={handleListUpdate}
        editingListBlock={editingListBlock}
      />

      {/* Quote Component */}
      <QuoteComponent
        showQuoteTemplateSidebar={showQuoteTemplateSidebar}
        setShowQuoteTemplateSidebar={setShowQuoteTemplateSidebar}
        showQuoteEditDialog={showQuoteEditDialog}
        setShowQuoteEditDialog={setShowQuoteEditDialog}
        onQuoteTemplateSelect={handleQuoteTemplateSelect}
        onQuoteUpdate={handleQuoteUpdate}
        editingQuoteBlock={editingQuoteBlock}
      />

      {/* Audio Component */}
      <AudioComponent
        showAudioDialog={showAudioDialog}
        setShowAudioDialog={setShowAudioDialog}
        onAudioUpdate={handleAudioUpdate}
        editingAudioBlock={editingAudioBlock}
      />

      {/* YouTube Component */}
      <YouTubeComponent
        showYouTubeDialog={showYouTubeDialog}
        setShowYouTubeDialog={setShowYouTubeDialog}
        onYouTubeUpdate={handleYouTubeUpdate}
        editingYouTubeBlock={editingYouTubeBlock}
      />

      {/* Interactive Component */}
      <InteractiveComponent
        showInteractiveTemplateSidebar={showInteractiveTemplateSidebar}
        setShowInteractiveTemplateSidebar={setShowInteractiveTemplateSidebar}
        showInteractiveEditDialog={showInteractiveEditDialog}
        setShowInteractiveEditDialog={setShowInteractiveEditDialog}
        onInteractiveTemplateSelect={handleInteractiveTemplateSelect}
        onInteractiveUpdate={handleInteractiveUpdate}
        editingInteractiveBlock={editingInteractiveBlock}
      />

      {/* Divider Component */}
      <DividerComponent
        ref={dividerComponentRef}
        showDividerTemplateSidebar={showDividerTemplateSidebar}
        setShowDividerTemplateSidebar={setShowDividerTemplateSidebar}
        onDividerTemplateSelect={handleDividerTemplateSelect}
        editingDividerBlock={null}
        onDividerUpdate={handleDividerUpdate}
      />

      {/* Image Block Component */}
      <ImageBlockComponent
        ref={imageBlockComponentRef}
        showImageTemplateSidebar={showImageTemplateSidebar}
        setShowImageTemplateSidebar={setShowImageTemplateSidebar}
        showImageDialog={showImageDialog}
        setShowImageDialog={setShowImageDialog}
        onImageTemplateSelect={handleImageTemplateSelect}
        onImageUpdate={handleImageUpdate}
        editingImageBlock={null}
        imageUploading={imageUploading}
        setImageUploading={setImageUploading}
        contentBlocks={contentBlocks}
        setContentBlocks={setContentBlocks}
      />

      {/* Link Component */}
      <LinkComponent
        showLinkDialog={showLinkDialog}
        setShowLinkDialog={setShowLinkDialog}
        onLinkUpdate={handleLinkUpdate}
        editingLinkBlock={editingLinkBlock}
      />

      {/* PDF Component */}
      <PDFComponent
        showPdfDialog={showPdfDialog}
        setShowPdfDialog={setShowPdfDialog}
        onPdfUpdate={handlePdfUpdate}
        editingPdfBlock={editingPdfBlock}
      />

      {/* Statement Component */}
      <StatementComponent
        ref={statementComponentRef}
        showStatementSidebar={showStatementSidebar}
        setShowStatementSidebar={setShowStatementSidebar}
        onStatementSelect={handleStatementSelect}
        onStatementEdit={handleStatementEdit}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Text Block Component */}
      <TextBlockComponent
        showTextTypeSidebar={showTextTypeSidebar}
        setShowTextTypeSidebar={setShowTextTypeSidebar}
        showTextEditorDialog={showTextEditorDialog}
        setShowTextEditorDialog={setShowTextEditorDialog}
        currentTextBlockId={currentTextBlockId}
        setCurrentTextBlockId={setCurrentTextBlockId}
        currentTextType={currentTextType}
        setCurrentTextType={setCurrentTextType}
        contentBlocks={contentBlocks}
        setContentBlocks={setContentBlocks}
        lessonContent={lessonContent}
        setLessonContent={setLessonContent}
        insertionPosition={insertionPosition}
        setInsertionPosition={setInsertionPosition}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Insert Block Dialog */}
      <Dialog
        open={showInsertBlockDialog}
        onOpenChange={setShowInsertBlockDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Insert Content Block
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Choose a block type to insert at this position
            </p>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {contentBlockTypes.map(blockType => (
              <button
                key={blockType.id}
                onClick={() => {
                  handleBlockClick(blockType, insertionPosition);
                  setShowInsertBlockDialog(false);
                }}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-600 group-hover:text-blue-600 mb-3 transition-colors">
                  {blockType.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 text-center transition-colors">
                  {blockType.title}
                </h3>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInsertBlockDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LessonBuilder;

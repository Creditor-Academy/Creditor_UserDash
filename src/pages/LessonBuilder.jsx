import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAuthHeader } from '@/services/authHeader';
import { uploadImage } from '@/services/imageUploadService';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft, Plus, FileText, Eye, Pencil, Trash2, GripVertical,
  Volume2, Play, Youtube, Link2, File, BookOpen, Image, Video,
  HelpCircle, FileText as FileTextIcon, File as FileIcon, Box, Link as LinkIcon,
  Type,
  Heading1,
  Heading2,
  Text,
  List,
  ListOrdered,
  Table,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import StatementComponent from '@/components/statement';

// Add custom CSS for slide animation and font families
const slideInLeftStyle = `
  @keyframes slide-in-left {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-left {
    animation: slide-in-left 0.3s ease-out;
  }
  
  /* Font family CSS for Quill editor */
  .ql-font-arial {
    font-family: Arial, sans-serif;
  }
  .ql-font-helvetica {
    font-family: Helvetica, sans-serif;
  }
  .ql-font-times {
    font-family: Times, serif;
  }
  .ql-font-courier {
    font-family: Courier, monospace;
  }
  .ql-font-verdana {
    font-family: Verdana, sans-serif;
  }
  .ql-font-georgia {
    font-family: Georgia, serif;
  }
  .ql-font-impact {
    font-family: Impact, sans-serif;
  }
  .ql-font-roboto {
    font-family: Roboto, sans-serif;
  }
  
  /* Fix font picker to show actual font names */
  .ql-picker.ql-font .ql-picker-item[data-value=""]::before {
    content: "Sans Serif" !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
    content: "Arial" !important;
    font-family: Arial, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="helvetica"]::before {
    content: "Helvetica" !important;
    font-family: Helvetica, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="times"]::before {
    content: "Times New Roman" !important;
    font-family: Times, serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="courier"]::before {
    content: "Courier New" !important;
    font-family: Courier, monospace !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="verdana"]::before {
    content: "Verdana" !important;
    font-family: Verdana, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
    content: "Georgia" !important;
    font-family: Georgia, serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="impact"]::before {
    content: "Impact" !important;
    font-family: Impact, sans-serif !important;
  }
  .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
    content: "Roboto" !important;
    font-family: Roboto, sans-serif !important;
  }
  
  /* Hide original text and show only ::before content */
  .ql-picker.ql-font .ql-picker-item {
    font-size: 0 !important;
    position: relative !important;
    height: 32px !important;
  }
  
  .ql-picker.ql-font .ql-picker-item::before {
    font-size: 14px !important;
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
  }
  
  /* Fix size picker to show actual size names */
  .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
    content: "Small" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value=""]::before {
    content: "Normal" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
    content: "Large" !important;
  }
  .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
    content: "Huge" !important;
  }
  
  .ql-picker.ql-size .ql-picker-item {
    font-size: 0 !important;
    position: relative !important;
    height: 32px !important;
  }
  
  .ql-picker.ql-size .ql-picker-item::before {
    font-size: 14px !important;
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    white-space: nowrap !important;
  }
  
  /* Ensure dropdown positioning works properly */
  .ql-picker-options {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    z-index: 10000 !important;
    background: white !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    min-width: 120px !important;
  }
  
  .ql-picker-item {
    padding: 8px 12px !important;
    cursor: pointer !important;
    white-space: nowrap !important;
  }
  
  .ql-picker-item:hover {
    background-color: #f5f5f5 !important;
  }
  
  /* Font size CSS for Quill editor */
  .ql-size-small {
    font-size: 0.75em;
  }
  .ql-size-large {
    font-size: 1.5em;
  }
  .ql-size-huge {
    font-size: 2.5em;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = slideInLeftStyle;
  document.head.appendChild(styleSheet);
}


// Register font families with proper display names
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'impact', 'roboto'];
Quill.register(Font, true);


// Register font sizes - simplified to 4 options
const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

// Universal toolbar for paragraph/content
const paragraphToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': Size.whitelist }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']
];

// Simplified toolbar for heading/subheading
const headingToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': Size.whitelist }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['clean']
];

// Comprehensive toolbar modules for all text types
const getToolbarModules = (type = 'full') => {
  const baseToolbar = [
    [{ 'font': Font.whitelist }],
    [{ 'size': Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }]
  ];
  
  if (type === 'full') {
    return {
      toolbar: [
        ...baseToolbar,
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    };
  }
  
  return {
    toolbar: [
      ...baseToolbar,
      ['clean']
    ]
  };
};

function LessonBuilder({ viewMode: initialViewMode = false }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useOutletContext();
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(location.state?.lessonData || null);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState({});
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [showTextTypeModal, setShowTextTypeModal] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(initialViewMode);
  const [lessonContent, setLessonContent] = useState(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploadMethod, setVideoUploadMethod] = useState('file'); // 'file' or 'url'
  const [isUploading, setIsUploading] = useState(false);
  const [showTextEditorDialog, setShowTextEditorDialog] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [currentTextBlockId, setCurrentTextBlockId] = useState(null);
  const [currentTextType, setCurrentTextType] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioUploadMethod, setAudioUploadMethod] = useState('file'); // 'file' or 'url'
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  const [currentYoutubeBlock, setCurrentYoutubeBlock] = useState(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkButtonText, setLinkButtonText] = useState('Visit Link');
  const [linkButtonStyle, setLinkButtonStyle] = useState('primary');
  const [linkError, setLinkError] = useState('');
  const [currentLinkBlock, setCurrentLinkBlock] = useState(null);
  const [showImageTemplateSidebar, setShowImageTemplateSidebar] = useState(false);
  const [showTableTemplateSidebar, setShowTableTemplateSidebar] = useState(false);
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [currentImageBlock, setCurrentImageBlock] = useState(null);
  const [imageTemplateText, setImageTemplateText] = useState('');
  const [imageTemplateUrl, setImageTemplateUrl] = useState('');
  const [selectedImageTemplate, setSelectedImageTemplate] = useState(null);
  const [showTextTypeSidebar, setShowTextTypeSidebar] = useState(false);
  const [showStatementSidebar, setShowStatementSidebar] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUploadMethod, setPdfUploadMethod] = useState('file');
  const [mainPdfUploading, setMainPdfUploading] = useState(false);

  // Image block templates
  const imageTemplates = [
    {
      id: 'image-text',
      title: 'Image & text',
      description: 'Image with text content side by side',
      icon: <Image className="h-6 w-6" />,
      layout: 'side-by-side',
      defaultContent: {
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        text: 'When we show up to the present moment with all of our senses, we invite the world to fill us with joy. The pains of the past are behind us. The future has yet to unfold. But the now is full of beauty always waiting for our attention.'
      }
    },
    {
      id: 'text-on-image',
      title: 'Text on image',
      description: 'Text overlay on background image',
      icon: <Image className="h-6 w-6" />,
      layout: 'overlay',
      defaultContent: {
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        text: 'Daylight in the forest. Light filters through the trees and the forest. Every step is filled with the sounds of nature, and the scent of pine and earth fills the air. This is where peace begins.'
      }
    },
    {
      id: 'image-centered',
      title: 'Image centered',
      description: 'Centered image with optional caption',
      icon: <Image className="h-6 w-6" />,
      layout: 'centered',
      defaultContent: {
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        text: 'A peaceful moment captured in time'
      }
    },
    {
      id: 'image-full-width',
      title: 'Image full width',
      description: 'Full width image with text below',
      icon: <Image className="h-6 w-6" />,
      layout: 'full-width',
      defaultContent: {
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        text: 'When we show up to the present moment with all of our senses, we invite the world to fill us with joy.'
      }
    }
  ];

  // Table/Columns templates
  const tableTemplates = [
    {
      id: 'two_columns',
      title: 'Two Columns',
      description: 'Responsive two-column layout for side-by-side content',
      icon: <Table className="h-6 w-6" />,
      defaultContent: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 rounded-lg border bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-2">Left Column</h3>
            <p class="text-gray-600">Add your content here. You can include text, lists, or images.</p>
          </div>
          <div class="p-4 rounded-lg border bg-white shadow-sm">
            <h3 class="text-lg font-semibold mb-2">Right Column</h3>
            <p class="text-gray-600">Add your content here. You can include text, lists, or images.</p>
          </div>
        </div>`
    },
    {
      id: 'three_columns',
      title: 'Three Columns',
      description: 'Balanced three-column layout for features or highlights',
      icon: <Table className="h-6 w-6" />,
      defaultContent: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-4 rounded-lg border bg-white shadow-sm">
            <h3 class="text-base font-semibold mb-2">Column One</h3>
            <p class="text-gray-600">Add your content here.</p>
          </div>
          <div class="p-4 rounded-lg border bg-white shadow-sm">
            <h3 class="text-base font-semibold mb-2">Column Two</h3>
            <p class="text-gray-600">Add your content here.</p>
          </div>
          <div class="p-4 rounded-lg border bg-white shadow-sm">
            <h3 class="text-base font-semibold mb-2">Column Three</h3>
            <p class="text-gray-600">Add your content here.</p>
          </div>
        </div>`
    },
    {
      id: 'simple_table',
      title: 'Simple Table',
      description: 'Clean table with header and rows',
      icon: <Table className="h-6 w-6" />,
      defaultContent: `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header 1</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header 2</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Header 3</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr>
                <td class="px-4 py-2 text-gray-700">Row 1, Col 1</td>
                <td class="px-4 py-2 text-gray-700">Row 1, Col 2</td>
                <td class="px-4 py-2 text-gray-700">Row 1, Col 3</td>
              </tr>
              <tr>
                <td class="px-4 py-2 text-gray-700">Row 2, Col 1</td>
                <td class="px-4 py-2 text-gray-700">Row 2, Col 2</td>
                <td class="px-4 py-2 text-gray-700">Row 2, Col 3</td>
              </tr>
            </tbody>
          </table>
        </div>`
    }
  ];

  const contentBlockTypes = [
    {
      id: 'text',
      title: 'Text',
      icon: <FileTextIcon className="h-5 w-5" />
    },
    {
      id: 'statement',
      title: 'Statement',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'image',
      title: 'Image',
      icon: <Image className="h-5 w-5" />
    },
    {
      id: 'video',
      title: 'Video',
      icon: <Video className="h-5 w-5" />
    },
    {
      id: 'audio',
      title: 'Audio',
      icon: <Volume2 className="h-5 w-5" />
    },
    {
      id: 'youtube',
      title: 'YouTube',
      icon: <Youtube className="h-5 w-5" />
    },
    {
      id: 'link',
      title: 'Link',
      icon: <LinkIcon className="h-5 w-5" />
    },
    {
      id: 'pdf',
      title: 'PDF',
      icon: <FileTextIcon className="h-5 w-5" />
    },
    {
      id: 'tables',
      title: 'Tables',
      icon: <Table className="h-5 w-5" />
    },
    {
      id: 'scorm',
      title: 'SCORM',
      icon: <Box className="h-5 w-5" />
    }
  ];

  // Modify the text types array to include specific styles
  const textTypes = [
    {
      id: 'heading',
      icon: <Heading1 className="h-5 w-5" />,
      preview: <h1 className="text-2xl font-bold mb-2">Heading</h1>,
      defaultContent: '<h1 class="text-2xl font-bold text-gray-800">Heading</h1>',
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1F2937'
      }
    },
    {
      id: 'subheading',
      icon: <Heading2 className="h-5 w-5" />,
      preview: <h2 className="text-xl font-semibold mb-2">Subheading</h2>,
      defaultContent: '<h2 class="text-xl font-semibold text-gray-800">Subheading</h2>',
      style: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#374151'
      }
    },
    {
      id: 'paragraph',
      icon: <Text className="h-5 w-5" />,
      preview: <p className="text-gray-700">This is a paragraph of text.</p>,
      defaultContent: '<p class="text-base text-gray-700">Start typing your text here...</p>',
      style: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#4B5563'
      }
    },
    {
      id: 'heading_paragraph',
      icon: <Type className="h-5 w-5" />,
      preview: (
        <div>
          <h1 className="text-2xl font-bold mb-2">Heading</h1>
          <p className="text-gray-700">This is a paragraph below the heading.</p>
          </div>
      ),
      defaultContent: '<h1>Heading</h1><p>This is a paragraph below the heading.</p>'
    },
    {
      id: 'subheading_paragraph',
      icon: <Type className="h-5 w-5" />,
      preview: (
        <div>
          <h2 className="text-xl font-semibold mb-2">Subheading</h2>
          <p className="text-gray-700">This is a paragraph below the subheading.</p>
        </div>
      ),
      defaultContent: '<h2>Subheading</h2><p>This is a paragraph below the subheading.</p>'
    }
   
  ];

  const blockRefs = React.useRef({});
  const statementComponentRef = React.useRef();

  const handleBlockClick = (blockType) => {
    if (blockType.id === 'text') {
      setShowTextTypeSidebar(true);
    } else if (blockType.id === 'statement') {
      setShowStatementSidebar(true);
    } else if (blockType.id === 'video') {
      setShowVideoDialog(true);
    } else if (blockType.id === 'image') {
      setShowImageTemplateSidebar(true);
    } else if (blockType.id === 'tables') {
      setShowTableTemplateSidebar(true);
    } else if (blockType.id === 'audio') {
      setShowAudioDialog(true);
    } else if (blockType.id === 'youtube') {
      setShowYoutubeDialog(true);
    } else if (blockType.id === 'link') {
      setShowLinkDialog(true);
    } else if (blockType.id === 'pdf') {
      setShowPdfDialog(true);
    } else {
      addContentBlock(blockType);
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
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };
   
    // If we have existing lesson content, add to that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock]
        }
      }));
    } else {
      // For new lessons, add to contentBlocks
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  const handleTextTypeSelect = (textType) => {
    // Check if the block is already being added
    if (contentBlocks.some(block => block.id === `block_${Date.now()}`)) {
      return;
    }

    // For combined templates, split heading/subheading from paragraph so preview styles apply
    let heading = null;
    let subheading = null;
    let contentHtml = textType.defaultContent || '';

    if (textType.id === 'heading_paragraph' || textType.id === 'subheading_paragraph') {
      try {
        const temp = document.createElement('div');
        temp.innerHTML = contentHtml;
        const h1 = temp.querySelector('h1');
        const h2 = temp.querySelector('h2');
        const p = temp.querySelector('p');
        if (textType.id === 'heading_paragraph') {
          heading = h1 ? h1.innerHTML : '';
        } else if (textType.id === 'subheading_paragraph') {
          subheading = h2 ? h2.innerHTML : '';
        }
        contentHtml = p ? p.innerHTML : '';
      } catch (e) {
        // ignore parsing errors and keep contentHtml as-is
      }
    }

    // Generate proper HTML content with exact same container structure as existing blocks
    let innerContent = '';
    if (textType.id === 'heading_paragraph') {
      innerContent = `<h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 1rem;">${heading || 'Heading'}</h1><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the heading.'}</p>`;
    } else if (textType.id === 'subheading_paragraph') {
      innerContent = `<h2 style="font-size: 20px; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">${subheading || 'Subheading'}</h2><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the subheading.'}</p>`;
    } else {
      innerContent = textType.defaultContent || contentHtml;
    }

    // Generate HTML content with proper card styling to match existing blocks
    const htmlContent = `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
        <div class="pl-4">
          ${innerContent}
        </div>
      </div>
    `;

    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'text',
      title: textType.title || 'Text Block',
      textType: textType.id,
      content: contentHtml,
      html_css: htmlContent,
      ...(heading !== null && { heading }),
      ...(subheading !== null && { subheading }),
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    // If we have existing lesson content, add to that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock]
        }
      }));
    } else {
      // For new lessons, add to contentBlocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
   
    // Close the sidebar
    setShowTextTypeSidebar(false);
    setSidebarCollapsed(true);
  };

  const handleTableTemplateSelect = (template) => {
    // Generate HTML content with proper card styling to match existing blocks
    const htmlContent = `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
        <div class="pl-4">
          ${template.defaultContent}
        </div>
      </div>
    `;
   
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'text',
      title: template.title,
      textType: 'table',
      content: template.defaultContent,
      html_css: htmlContent,
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };
   
    // If we have existing lesson content, add to that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock]
        }
      }));
    } else {
      // For new lessons, add to contentBlocks
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
    setShowTableTemplateSidebar(false);
  };

  const handleStatementSelect = (statementBlock) => {
    // If we have existing lesson content, add to that structure
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, statementBlock]
        }
      }));
    } else {
      // For new lessons, add to contentBlocks
      setContentBlocks(prevBlocks => [...prevBlocks, statementBlock]);
    }
  };

  const handleStatementEdit = (blockId, content, htmlContent) => {
    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? {
          ...block,
          content,
          html_css: htmlContent,
          updatedAt: new Date().toISOString()
        } : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            (block.block_id === blockId || block.id === blockId) ? {
              ...block,
              content,
              html_css: htmlContent,
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
  };

  const removeContentBlock = (blockId) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== blockId));
  };

  const updateBlockContent = (blockId, content, heading = null, subheading = null) => {
    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? {
          ...block,
          content,
          heading,
          subheading,
          updatedAt: new Date().toISOString()
        } : block
      )
    );

    // Also update lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            block.block_id === blockId ? {
              ...block,
              content,
              heading,
              subheading,
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
  };

  const handleEditBlock = (blockId) => {
    // First try to find block in contentBlocks (for new lessons)
    let block = contentBlocks.find(b => b.id === blockId);
   
    // If not found, try to find in lessonContent (for fetched lessons)
    if (!block && lessonContent?.data?.content) {
      block = lessonContent.data.content.find(b => b.block_id === blockId);
    }
   
    if (!block) return;
   
    if (block.type === 'statement') {
      // Handle statement editing with the StatementComponent
      // Pass both content and html_css to extract content from HTML if needed
      statementComponentRef.current?.handleEditStatement(blockId, block.statementType, block.content, block.html_css);
      return;
    }
   
    if (block.type === 'text') {
      setCurrentTextBlockId(blockId);
      setCurrentTextType(block.textType);
      setShowTextEditorDialog(true);

      // Reset editors
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
     
      // Set content based on block type
      if (block.textType === 'heading-paragraph') {
        const parts = block.content ? block.content.split('|||') : ['', ''];
        setEditorHeading(parts[0] || '');
        setEditorContent(parts[1] || '');
      } else if (block.textType === 'subheading-paragraph') {
        const parts = block.content ? block.content.split('|||') : ['', ''];
        setEditorSubheading(parts[0] || '');
        setEditorContent(parts[1] || '');
      } else {
        setEditorContent(block.content || '');
        setEditorHtml(block.content || '');
      }
    } else {
      setCurrentBlock(block);
      setEditModalOpen(true);
     
      // Reset editors
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
     
      // Set content based on block type
      if (block.textType === 'heading-paragraph') {
        const parts = block.content ? block.content.split('|||') : ['', ''];
        setEditorHeading(parts[0] || '');
        setEditorContent(parts[1] || '');
      } else if (block.textType === 'subheading-paragraph') {
        const parts = block.content ? block.content.split('|||') : ['', ''];
        setEditorSubheading(parts[0] || '');
        setEditorContent(parts[1] || '');
      } else {
        setEditorContent(block.content || '');
      }
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
   
    // Find the dragged element and potential drop target
    const draggedElement = document.querySelector(`[data-block-id="${draggedBlockId}"]`);
    if (!draggedElement) return;

    const dropTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-block-id]');
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

    // Update lesson content order
    const content = lessonContent.data.content;
    const sourceIndex = content.findIndex(b => b.block_id === draggedBlockId);
    const targetIndex = content.findIndex(b => b.block_id === targetBlockId);
   
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
          order: index + 1
        }))
      }
    });

    // Reset drag state
    setDraggedBlockId(null);
   
    // Reset any visual transformations
    document.querySelectorAll('[data-block-id]').forEach(block => {
      block.style.transform = '';
      block.style.transition = '';
    });
  };

  const handleSave = async () => {
    const lessonDataToSave = {
      title: lessonTitle,
      contentBlocks,
      status: 'DRAFT',
      lastModified: new Date().toISOString()
    };

    // Determine if this is a new lesson or an update
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/course`;
    const apiUrl = lessonId
      ? `${baseUrl}/${courseId}/modules/${moduleId}/lesson/${lessonId}`
      : `${baseUrl}/${courseId}/modules/${moduleId}/lesson/create-lesson`;

    try {
      const response = lessonId
        ? await axios.put(apiUrl, lessonDataToSave)
        : await axios.post(apiUrl, lessonDataToSave);
     
      toast.success('Lesson saved successfully!');
    } catch (error) {
      toast.error('Error saving lesson!');
      console.error(error);
    }
  };

  const handlePreview = () => {
    console.log('Previewing lesson:', { lessonTitle, contentBlocks });
    alert('Preview functionality coming soon!');
  };

  // Convert blocks to HTML/CSS format
  const convertBlocksToHtml = (blocks) => {
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
          const caption = (block.text || block.imageDescription || block.details?.caption || '').toString();
          const title = block.imageTitle || block.details?.alt_text || 'Image';
          if (layout === 'side-by-side') {
            html = `
              <div class="lesson-image side-by-side">
                <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                  <div>
                    <img src="${imageUrl}" alt="${title}" class="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                  <div>
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
                  <img src="${imageUrl}" alt="${title}" class="w-full h-auto rounded" />
                  ${caption ? `<p class="text-sm text-gray-600">${caption}</p>` : ''}
                </div>
              </div>`;
          } else {
            html = `
              <div class="lesson-image centered">
                <div class="text-center">
                  <img src="${imageUrl}" alt="${title}" class="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
                  ${caption ? `<span class="text-gray-600 mt-4 italic text-lg">${caption}</span>` : ''}
                </div>
              </div>`;
          }
        }
      } else if (block.type === 'pdf') {
        // Prefer saved html_css to keep consistent embedding
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          const url = block.pdfUrl || block.details?.pdf_url || '';
          const title = block.pdfTitle || block.details?.caption || 'PDF Document';
          const description = block.pdfDescription || block.details?.description || '';
          html = `
            <div class="lesson-pdf">
              ${title ? `<h3 class="pdf-title">${title}</h3>` : ''}
              ${description ? `<p class="pdf-description">${description}</p>` : ''}
              <iframe src="${url}" class="pdf-iframe" style="width: 100%; height: 600px; border: none; border-radius: 12px;"></iframe>
            </div>
          `;
        }
      }

      return { html, css, js };
    });
  };

  const handleUpdate = async () => {
    if (!lessonId) {
      toast.error('No lesson ID found. Please save the lesson first.');
      return;
    }

    try {
      setIsUploading(true);

      // Use contentBlocks if it has data (newly added content), otherwise use lessonContent (fetched content)
      // This ensures newly added content takes priority over fetched content
      const blocksToUpdate = contentBlocks.length > 0 ? contentBlocks : (lessonContent?.data?.content || []);

      // Allow empty content blocks for deletion operations
      /*if (!blocksToUpdate || blocksToUpdate.length === 0) {
        toast.error('Please add some content before updating');
        return;
      }*/

      // Convert content blocks to the required format
      const content = blocksToUpdate.map((block, index) => {
        const blockId = block.block_id || `block_${index + 1}`;
       
        // If block already has html_css (fetched content), preserve it to avoid wrapping in new containers
        if (block.html_css && block.html_css.trim() !== '') {
          return {
            type: block.type,
            script: block.script || '',
            block_id: blockId,
            html_css: block.html_css,
            ...(block.details && { details: block.details })
          };
        }

        // Only generate new HTML for newly created blocks without existing html_css
        let htmlContent = '';
        let details = {};
        let script = '';

        // Extract content from different possible sources
        const blockContent = block.content || '';
        const blockType = block.type;
        const textType = block.textType;

        switch (blockType) {
          case 'text':
            // Handle different text types
            if (textType === 'heading') {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <article class="prose prose-gray max-w-none pl-4">
                    <h1 class="text-2xl font-bold text-gray-800">${blockContent}</h1>
                  </article>
                </div>`;
            } else if (textType === 'subheading') {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <article class="prose prose-gray max-w-none pl-4">
                    <h2 class="text-xl font-semibold text-gray-800">${blockContent}</h2>
                  </article>
                </div>`;
            } else if (textType === 'heading_paragraph') {
              const heading = block.heading || '';
              const content = block.content || '';
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <article class="prose prose-gray max-w-none pl-4">
                    <h1 class="text-2xl font-bold text-gray-800">${heading}</h1>
                    <p class="text-gray-600 leading-relaxed">${content}</p>
                  </article>
                </div>`;
            } else if (textType === 'subheading_paragraph') {
              const subheading = block.subheading || '';
              const content = block.content || '';
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <article class="prose prose-gray max-w-none pl-4">
                    <h2 class="text-xl font-semibold text-gray-800">${subheading}</h2>
                    <p class="text-gray-600 leading-relaxed">${content}</p>
                  </article>
                </div>`;
            } else {
              htmlContent = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                  <article class="prose prose-gray max-w-none pl-4">
                    <p class="text-gray-600 leading-relaxed">${blockContent}</p>
                  </article>
                </div>`;
            }
            break;

          case 'image':
            // Preserve layout-specific HTML so sizes/styles remain consistent after reload
            {
              const layout = block.layout || 'centered';
              const textContent = (block.text || block.imageDescription || '').toString();
              details = {
                image_url: block.imageUrl,
                caption: textContent,
                alt_text: block.imageTitle || '',
                layout: layout,
                template: block.templateType || block.template || undefined,
              };

              if (layout === 'side-by-side') {
                htmlContent = `
                  <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                    <div>
                      <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-auto rounded-lg shadow-lg" />
                    </div>
                    <div>
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
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-auto rounded" />
                    ${textContent ? `<p class="text-sm text-gray-600">${textContent}</p>` : ''}
                  </div>
                `;
              } else { // centered or default
                htmlContent = `
                  <div class="text-center">
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
                    ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
                  </div>
                `;
              }
            }
            break;

          case 'video':
            details = {
              video_url: block.videoUrl,
              caption: block.videoTitle || ''
            };
            htmlContent = `
              <div style='margin: 20px 0; text-align: center;'>
                <video controls style='max-width: 100%; border-radius: 8px;'>
                  <source src='${block.videoUrl}' type='video/mp4'>
                  Your browser does not support the video tag.
                </video>
                ${block.videoTitle ?
                  `<p style='font-size: 14px; color: #666; margin-top: 8px;'>${block.videoTitle}</p>`
                  : ''}
              </div>`;
            break;

          // Add other cases as needed for different block types
        }

        return {
          type: block.type,
          script: script,
          block_id: blockId,
          html_css: htmlContent,
          ...(Object.keys(details).length > 0 && { details })
        };
      });

      // Convert blocks to HTML/CSS/JS format
      const convertedBlocks = convertBlocksToHtml(blocksToUpdate);

      // Combine all blocks
      const combinedContent = {
        html: convertedBlocks.map(block => block.html).join('\\n'),
        css: convertedBlocks.map(block => block.css).join('\\n'),
        js: convertedBlocks.map(block => block.js).filter(js => js).join('\\n')
      };

      // Format content blocks into a simpler structure
      const formattedContent = blocksToUpdate.map(block => {
        let htmlContent = '';
        let styles = '';

        // Extract content from different possible sources
        const blockContent = block.content || block.html_css || '';
        const blockType = block.type;
        const textType = block.textType;

        if (blockType === 'text') {
          switch (textType) {
            case 'heading':
              htmlContent = `<h1 class="lesson-heading">${blockContent}</h1>`;
              styles = '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; }';
              break;
            case 'subheading':
              htmlContent = `<h4 class="lesson-subheading">${blockContent}</h4>`;
              styles = '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; }';
              break;
            case 'heading_paragraph':
              const heading = block.heading || '';
              const content = block.content || '';
              htmlContent = `<h1 class="lesson-heading">${heading}</h1><p class="lesson-paragraph">${content}</p>`;
              styles = '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            case 'subheading_paragraph':
              const subheading = block.subheading || '';
              const paragraphContent = block.content || '';
              htmlContent = `<h4 class="lesson-subheading">${subheading}</h4><p class="lesson-paragraph">${paragraphContent}</p>`;
              styles = '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            default:
              htmlContent = `<p class="lesson-paragraph">${blockContent}</p>`;
              styles = '.lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
          }
        } else if (blockType === 'image') {
          const layout = block.layout || 'centered';
          const textContent = (block.text || block.imageDescription || '').toString();
          if (layout === 'side-by-side') {
            htmlContent = `
              <div class="lesson-image side-by-side">
                <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                  <div>
                    <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="w-full h-auto rounded-lg shadow-lg" />
                  </div>
                  <div>
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
            htmlContent = `
              <div class="lesson-image centered">
                <div class="text-center">
                  <img src="${block.imageUrl}" alt="${block.imageTitle || 'Image'}" class="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
                  ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
                </div>
              </div>`;
          }
        }

        return {
          html_css: htmlContent,
          css: styles,
          script: '' // Empty string if no JavaScript is needed
        };
      });

      // Debug: Log the data being sent
      console.log('Blocks to update:', blocksToUpdate);
      console.log('Processed content:', content);
      console.log('Formatted content:', formattedContent);

      // Update the lesson content
      const lessonDataToUpdate = {
        lesson_id: lessonId,
        content: content,
        html_css: formattedContent.map(content => content.html_css).join('\\n'),
        css: formattedContent.map(content => content.css).join('\\n'),
        script: '' // Add script if needed in the future
      };

      console.log('Payload being sent to backend:', lessonDataToUpdate);

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessoncontent/update/${lessonId}`,
        lessonDataToUpdate,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        toast.success('Lesson updated successfully!');
      } else {
        throw new Error(response.data?.errorMessage || 'Failed to update lesson content');
      }
     
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error(error.response?.data?.errorMessage || 'Failed to update lesson. Please try again.');
    } finally {
      setIsUploading(false);
    }
    alert('Lesson updated successfully!');
  };

  const toggleViewMode = () => {
    setIsViewMode(!isViewMode);
  };

  const handleVideoDialogClose = () => {
    setShowVideoDialog(false);
    setVideoTitle('');
    setVideoDescription('');
    setVideoFile(null);
    setVideoPreview('');
    setVideoUrl('');
    setVideoUploadMethod('file');
    setCurrentBlock(null);
  };

  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'file') {
      setVideoFile(e.target.files[0]);
      setVideoPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      if (name === 'title') {
        setVideoTitle(value);
      } else if (name === 'description') {
        setVideoDescription(value);
      } else if (name === 'url') {
        setVideoUrl(value);
      }
    }
  };

  const handleAddVideo = () => {
    // Validate required fields based on upload method
    if (!videoTitle) {
      alert('Please enter a video title');
      return;
    }
   
    if (videoUploadMethod === 'file' && !videoFile) {
      alert('Please select a video file');
      return;
    }
   
    if (videoUploadMethod === 'url' && !videoUrl) {
      alert('Please enter a video URL');
      return;
    }

    // Create video URL based on upload method
    let finalVideoUrl = '';
    if (videoUploadMethod === 'file') {
      finalVideoUrl = URL.createObjectURL(videoFile);
    } else {
      finalVideoUrl = videoUrl;
    }

    // Generate HTML content for display
    const htmlContent = `
      <video controls style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
        <source src="${finalVideoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      ${videoTitle ? `<p style="font-size: 14px; color: #666; margin-top: 8px;">${videoTitle}</p>` : ''}
      ${videoDescription ? `<p style="font-size: 12px; color: #888; margin-top: 4px;">${videoDescription}</p>` : ''}
    `;

    const videoBlock = {
      id: currentBlock?.id || `video-${Date.now()}`,
      block_id: currentBlock?.id || `video-${Date.now()}`,
      type: 'video',
      title: 'Video',
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      videoFile: videoUploadMethod === 'file' ? videoFile : null,
      videoUrl: finalVideoUrl,
      uploadMethod: videoUploadMethod,
      originalUrl: videoUploadMethod === 'url' ? videoUrl : null,
      timestamp: new Date().toISOString(),
      html_css: htmlContent,
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev =>
        prev.map(block => block.id === currentBlock.id ? videoBlock : block)
      );
    } else {
      // Add new block
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, videoBlock]
          }
        }));
      } else {
        setContentBlocks(prev => [...prev, videoBlock]);
      }
    }
   
    handleVideoDialogClose();
  };

  const handleImageTemplateSelect = (template) => {
    const imageUrl = template.defaultContent?.imageUrl || '';
    const imageTitle = template.title;
    const imageText = template.defaultContent?.text || '';
   
    const newBlock = {
      id: `image-${Date.now()}`,
      block_id: `image-${Date.now()}`,
      type: 'image',
      title: template.title,
      layout: template.layout,
      templateType: template.id,
      imageUrl: imageUrl,
      imageTitle: imageTitle,
      imageDescription: '',
      text: imageText,
      isEditing: false,
      timestamp: new Date().toISOString(),
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1,
      details: {
        image_url: imageUrl,
        caption: imageText,
        alt_text: imageTitle,
        layout: template.layout,
        template: template.id
      },
      html_css: `
        <div class="image-block" style="${template.layout ? `display: flex; flex-direction: ${template.layout.includes('left') ? 'row' : 'column'}; gap: 1rem;` : ''}">
          <img
            src="${imageUrl}"
            alt="${imageTitle}"
            style="max-width: 100%; height: auto; border-radius: 0.5rem; ${template.layout?.includes('full') ? 'width: 100%;' : ''}"
          />
          ${imageText ? `
            <span class="mt-2 text-sm text-gray-600">${getPlainText(imageText)}</span>
          ` : ''}
        </div>
      `
    };
   
    // Always add to local edit list so it appears immediately in edit mode
    setContentBlocks(prev => [...prev, newBlock]);
    setShowImageTemplateSidebar(false);
  };

  const handleImageBlockEdit = (blockId, field, value) => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, [field]: value }
          : block
      )
    );
  };

  const handleImageFileUpload = async (blockId, file) => {
    if (!file) return;

    // Set loading state for this specific block
    setImageUploading(prev => ({ ...prev, [blockId]: true }));

    try {
      // Upload image to API
      const uploadResult = await uploadImage(file, {
        folder: 'lesson-images', // Optional: organize images in a specific folder
        public: true // Make images publicly accessible
      });

      if (uploadResult.success && uploadResult.imageUrl) {
        // Update the block with the uploaded image URL
        handleImageBlockEdit(blockId, 'imageUrl', uploadResult.imageUrl);
        handleImageBlockEdit(blockId, 'imageFile', file);
        handleImageBlockEdit(blockId, 'uploadedImageData', uploadResult);
        
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed - no image URL returned');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
      
      // Fallback to local URL for immediate preview (optional)
      const localImageUrl = URL.createObjectURL(file);
      handleImageBlockEdit(blockId, 'imageUrl', localImageUrl);
      handleImageBlockEdit(blockId, 'imageFile', file);
    } finally {
      // Clear loading state
      setImageUploading(prev => ({ ...prev, [blockId]: false }));
    }
  };

  const saveImageTemplateChanges = (blockId) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        if (block.type === 'image') {
          const captionPlainText = getPlainText(block.text || '');
          const updatedDetails = {
            ...(block.details || {}),
            image_url: block.imageUrl || block.details?.image_url || '',
            caption: (captionPlainText || block.details?.caption || ''),
            alt_text: block.imageTitle || block.details?.alt_text || '',
            layout: block.layout || block.details?.layout,
            template: block.templateType || block.details?.template,
          };
          // Clear html_css so the save/update pipeline regenerates with the latest URL
          return { ...block, isEditing: false, html_css: '', imageDescription: captionPlainText, details: updatedDetails };
        }
        return { ...block, isEditing: false };
      })
    );
    console.log('Image template changes saved for block:', blockId);
  };

  const toggleImageBlockEditing = (blockId) => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, isEditing: !block.isEditing }
          : block
      )
    );
  };

  const handleTextEditorOpen = (block = null) => {
    setShowTextEditorDialog(true);
    if (block) {
      setEditorTitle(block.title || '');
      setEditorHtml(block.content || '');
      setCurrentTextBlockId(block.id);
    } else {
      setEditorTitle('');
      setEditorHtml('');
      setCurrentTextBlockId(null);
    }
  };

  const handleTextEditorSave = () => {
    // First try to find block in contentBlocks (for new lessons)
    let blockToUpdate = contentBlocks.find(b => b.id === currentTextBlockId);
   
    // If not found, try to find in lessonContent (for fetched lessons)
    if (!blockToUpdate && lessonContent?.data?.content) {
      blockToUpdate = lessonContent.data.content.find(b => b.block_id === currentTextBlockId);
    }

    if (blockToUpdate) {
      let updatedContent = '';
     
      // Use currentTextType (detected type) or fallback to blockToUpdate.textType
      const effectiveTextType = currentTextType || blockToUpdate.textType;
     
      // For fetched lessons, preserve original HTML structure and only update content
      if (blockToUpdate.html_css && lessonContent?.data?.content) {
        // Use original HTML structure and replace only the text content
        updatedContent = blockToUpdate.html_css;
       
        // Replace the text content while preserving HTML structure
       
        if (effectiveTextType === 'heading_paragraph') {
          // Update heading and paragraph content within existing structure
          updatedContent = updatedContent.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i, (match, p1) => {
            return match.replace(p1, editorHeading);
          });
          updatedContent = updatedContent.replace(/<p[^>]*>(.*?)<\/p>/i, (match, p1) => {
            return match.replace(p1, editorContent);
          });
        } else if (effectiveTextType === 'subheading_paragraph') {
          // Update subheading and paragraph content within existing structure
          updatedContent = updatedContent.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i, (match, p1) => {
            return match.replace(p1, editorSubheading);
          });
          updatedContent = updatedContent.replace(/<p[^>]*>(.*?)<\/p>/i, (match, p1) => {
            return match.replace(p1, editorContent);
          });
        } else {
          // For single content blocks, preserve both original HTML structure AND rich text formatting
          // Extract plain text from rich text content for cases where we need to maintain original styling
          const richTextContent = editorHtml.trim();
          const plainTextContent = editorHtml.replace(/<[^>]*>/g, '').trim();
         
          // Check if the original content has specific heading/paragraph structure that should be preserved
          if (updatedContent.includes('<h1')) {
            // For headings, we want to preserve the heading tag but allow rich text formatting inside
            updatedContent = updatedContent.replace(/<h1([^>]*)>(.*?)<\/h1>/i, (match, attributes, content) => {
              // If rich text content has formatting tags, use it; otherwise use plain text to preserve heading styling
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h1${attributes}>${richTextContent}</h1>`;
              } else {
                return `<h1${attributes}>${plainTextContent}</h1>`;
              }
            });
          } else if (updatedContent.includes('<h2')) {
            updatedContent = updatedContent.replace(/<h2([^>]*)>(.*?)<\/h2>/i, (match, attributes, content) => {
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h2${attributes}>${richTextContent}</h2>`;
              } else {
                return `<h2${attributes}>${plainTextContent}</h2>`;
              }
            });
          } else if (updatedContent.includes('<h3')) {
            updatedContent = updatedContent.replace(/<h3([^>]*)>(.*?)<\/h3>/i, (match, attributes, content) => {
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h3${attributes}>${richTextContent}</h3>`;
              } else {
                return `<h3${attributes}>${plainTextContent}</h3>`;
              }
            }); 
          } else if (updatedContent.includes('<h4')) {
            updatedContent = updatedContent.replace(/<h4([^>]*)>(.*?)<\/h4>/i, (match, attributes, content) => {
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h4${attributes}>${richTextContent}</h4>`;
              } else {
                return `<h4${attributes}>${plainTextContent}</h4>`;
              }
            });
          } else if (updatedContent.includes('<h5')) {
            updatedContent = updatedContent.replace(/<h5([^>]*)>(.*?)<\/h5>/i, (match, attributes, content) => {
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h5${attributes}>${richTextContent}</h5>`;
              } else {
                return `<h5${attributes}>${plainTextContent}</h5>`;
              }
            });
          } else if (updatedContent.includes('<h6')) {
            updatedContent = updatedContent.replace(/<h6([^>]*)>(.*?)<\/h6>/i, (match, attributes, content) => {
              if (richTextContent.includes('<') && richTextContent !== plainTextContent) {
                return `<h6${attributes}>${richTextContent}</h6>`;
              } else {
                return `<h6${attributes}>${plainTextContent}</h6>`;
              }
            });
          } else if (updatedContent.includes('<p')) {
            // For paragraphs, always use rich text content as paragraphs are more flexible
            updatedContent = updatedContent.replace(/<p([^>]*)>(.*?)<\/p>/i, (match, attributes, content) => {
              return `<p${attributes}>${richTextContent}</p>`;
            });
          } else {
            // Fallback: replace text content within the first text node
            updatedContent = updatedContent.replace(/>([^<]+)</i, (match, textContent) => {
              if (textContent.trim() && !textContent.includes('<')) {
                return `>${richTextContent}<`;
              }
              return match;
            });
          }
        }
      } else {
        // For new blocks, generate HTML structure
        const textType = textTypes.find(t => t.id === blockToUpdate.textType);
       
       
        if (effectiveTextType === 'heading_paragraph') {
          updatedContent = `
            <div class="content-block">
              <h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 1rem;">
                ${editorHeading}
              </h1>
              <div style="font-size: 16px; line-height: 1.6; color: #4B5563;">
                ${editorContent}
              </div>
            </div>
          `;
        } else if (effectiveTextType === 'subheading_paragraph') {
          updatedContent = `
            <div class="content-block">
              <h2 style="font-size: 20px; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">
                ${editorSubheading}
              </h2>
              <div style="font-size: 16px; line-height: 1.6; color: #4B5563;">
                ${editorContent}
              </div>
            </div>
          `;
        } else {
          // For single content blocks (heading, subheading, paragraph)
          const style = textType?.style || {};
          const styleString = Object.entries(style)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

          updatedContent = `
            <div class="content-block" style="${styleString}">
              ${editorHtml}
            </div>
          `;
        }
      }

      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === currentTextBlockId
            ? {
                ...block,
                content: updatedContent,
                heading: effectiveTextType === 'heading_paragraph' ? editorHeading : block.heading,
                subheading: effectiveTextType === 'subheading_paragraph' ? editorSubheading : block.subheading,
                updatedAt: new Date().toISOString(),
                style: textType?.style || {},
                textType: effectiveTextType || block.textType
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
              block.block_id === currentTextBlockId ? {
                ...block,
                content: updatedContent,
                html_css: updatedContent,
                heading: effectiveTextType === 'heading_paragraph' ? editorHeading : block.heading,
                subheading: effectiveTextType === 'subheading_paragraph' ? editorSubheading : block.subheading,
                textType: effectiveTextType || block.textType,
                updatedAt: new Date().toISOString()
              } : block
            )
          }
        }));
      }
    } else {
      // For new blocks
      const newBlock = {
        id: `text_${Date.now()}`,
        block_id: `text_${Date.now()}`,
        type: 'text',
        title: editorTitle,
        content: `
          <div class="content-block" style="font-size: 16px; line-height: 1.6; color: #4B5563;">
            ${editorHtml}
          </div>
        `,
        textType: 'paragraph',
        style: textTypes.find(t => t.id === 'paragraph')?.style || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
      };
      // If we have existing lesson content, add to that structure
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, newBlock]
          }
        }));
      } else {
        setContentBlocks(prev => [...prev, newBlock]);
      }
    }
   
    // Close the dialog and reset form
    handleTextEditorClose();
  };

  const handleTextEditorClose = () => {
    setShowTextEditorDialog(false);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
    setCurrentTextType(null);
  };

  const handleEditorSave = () => {
    if (!currentBlock) return;

    let updatedContent = '';
    const effectiveTextType = currentBlock.textType;

    // Generate updated content based on text type
    if (effectiveTextType === 'heading-paragraph') {
      updatedContent = `${editorHeading}|||${editorContent}`;
    } else if (effectiveTextType === 'subheading-paragraph') {
      updatedContent = `${editorSubheading}|||${editorContent}`;
    } else {
      updatedContent = editorContent;
    }

    // Update contentBlocks for new lessons
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === currentBlock.id
          ? {
              ...block,
              content: updatedContent,
              heading: effectiveTextType === 'heading-paragraph' ? editorHeading : block.heading,
              subheading: effectiveTextType === 'subheading-paragraph' ? editorSubheading : block.subheading,
              updatedAt: new Date().toISOString()
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
            block.block_id === currentBlock.id ? {
              ...block,
              content: updatedContent,
              heading: effectiveTextType === 'heading-paragraph' ? editorHeading : block.heading,
              subheading: effectiveTextType === 'subheading-paragraph' ? editorSubheading : block.subheading,
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }

    // Close the modal and reset
    setEditModalOpen(false);
    setCurrentBlock(null);
    setEditorHeading('');
    setEditorSubheading('');
    setEditorContent('');
  };

  const handleImageDialogClose = () => {
    setShowImageDialog(false);
    setImageTitle('');
    setImageDescription('');
    setImageFile(null);
    setImagePreview('');
    setImageTemplateText('');
    setCurrentBlock(null);
  };

  const handleImageInputChange = (e) => {
    const { name, value, files } = e.target;
   
    if (name === 'file' && files && files[0]) {
      const file = files[0];
     
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only JPG or PNG images');
        return;
      }
     
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
     
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (name === 'title') {
      setImageTitle(value);
    } else if (name === 'description') {
      setImageDescription(value);
    }
  };

  const handleAddImage = async () => {
    if (!imageTitle || (!imageFile && !imagePreview)) {
      alert('Please fill in all required fields');
      return;
    }

    // Set loading state
    setMainImageUploading(true);

    try {
    // Handle both File object and string URL cases
    let imageUrl = '';
      let uploadedImageData = null;
      
    if (imageFile && typeof imageFile === 'object' && 'name' in imageFile) {
        // It's a File object - upload to API
        try {
          const uploadResult = await uploadImage(imageFile, {
            folder: 'lesson-images',
            public: true
          });
          
          if (uploadResult.success && uploadResult.imageUrl) {
            imageUrl = uploadResult.imageUrl;
            uploadedImageData = uploadResult;
            toast.success('Image uploaded successfully!');
          } else {
            throw new Error('Upload failed - no image URL returned');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error(error.message || 'Failed to upload image. Please try again.');
          
          // Fallback to local URL for immediate preview
      imageUrl = URL.createObjectURL(imageFile);
        }
    } else if (typeof imageFile === 'string') {
      // It's already a URL string
      imageUrl = imageFile;
    } else if (imagePreview) {
      // Fallback to imagePreview if available
      imageUrl = imagePreview;
    }

    const layout = currentBlock?.layout || null;
    const templateType = currentBlock?.templateType || null;
    const textContent = getPlainText(imageTemplateText || '').trim();

    // Build HTML based on layout when applicable
    let htmlContent = '';
    if (layout === 'side-by-side') {
      htmlContent = `
        <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
          <div>
            <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-auto rounded-lg shadow-lg" />
          </div>
          <div>
            ${textContent ? `<span class="text-gray-700 text-lg leading-relaxed">${textContent}</span>` : ''}
          </div>
        </div>
      `;
    } else if (layout === 'overlay') {
      htmlContent = `
        <div class="relative rounded-xl overflow-hidden">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-96 object-cover" />
          ${textContent ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full"><span class="text-xl font-medium leading-relaxed">${textContent}</span></div></div>` : ''}
        </div>
      `;
    } else if (layout === 'centered') {
      htmlContent = `
        <div class="text-center">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="max-w-full h-auto rounded-xl shadow-lg mx-auto" />
          ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
        </div>
      `;
    } else if (layout === 'full-width') {
      htmlContent = `
        <div class="space-y-3">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-auto rounded" />
          ${textContent ? `<p class="text-sm text-gray-600">${textContent}</p>` : ''}
        </div>
      `;
    } else {
      htmlContent = `
        <div class="image-block">
          <img
            src="${imageUrl}"
            alt="${imageTitle || 'Image'}"
            style="max-width: 100%; height: auto; border-radius: 0.5rem;"
          />
          ${textContent ? `
            <span class="mt-2 text-sm text-gray-600">${textContent}</span>
          ` : ''}
        </div>
      `;
    }

    const newBlock = {
      id: currentBlock?.id || `image-${Date.now()}`,
      block_id: currentBlock?.id || `image-${Date.now()}`,
      type: 'image',
      title: imageTitle,
      layout: layout || undefined,
      templateType: templateType || undefined,
      details: {
        image_url: imageUrl,
        caption: textContent || '',
        alt_text: imageTitle,
        layout: layout || undefined,
        template: templateType || undefined
      },
      html_css: htmlContent,
      imageTitle: imageTitle,
      imageDescription: textContent,
      text: textContent,
      imageFile: imageFile,
      imageUrl: imageUrl,
      uploadedImageData: uploadedImageData,
      timestamp: new Date().toISOString(),
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    if (currentBlock) {
      // Update existing block locally (edit mode), but ensure we strip tags from text first
      setContentBlocks(prev => prev.map(block => block.id === currentBlock.id ? { ...newBlock, text: getPlainText(newBlock.text || ''), imageDescription: getPlainText(newBlock.imageDescription || '') } : block));
      // If lessonContent exists, also sync the fetched content block
      if (lessonContent?.data?.content) {
        setLessonContent(prev => ({
          ...prev,
          data: {
            ...prev.data,
            content: prev.data.content.map(b => b.block_id === currentBlock.id ? {
              ...b,
              html_css: htmlContent,
              details: { ...(b.details || {}), image_url: imageUrl, caption: textContent, alt_text: imageTitle, layout: layout || b.details?.layout, template: templateType || b.details?.template },
              imageUrl: imageUrl,
              imageTitle: imageTitle,
              imageDescription: getPlainText(textContent || ''),
              text: getPlainText(textContent || ''),
              layout: layout || b.layout,
              templateType: templateType || b.templateType
            } : b)
          }
        }));
      }
      setCurrentBlock(null);
    } else {
      // Add new block to local edit list immediately
      setContentBlocks(prev => [...prev, newBlock]);
    }
   
    handleImageDialogClose();
    } finally {
      // Clear loading state
      setMainImageUploading(false);
    }
  };

  const handleEditImage = (blockId) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block) {
      setCurrentBlock(block);
      setImageTitle(block.imageTitle);
      setImageDescription(block.imageDescription || '');
      setImageFile(block.imageFile);
      setImagePreview(block.imageUrl);
      setImageTemplateText(block.text || block.details?.caption || '');
      setShowImageDialog(true);
    }
  };

  const handleAudioDialogClose = () => {
    setShowAudioDialog(false);
    setAudioTitle('');
    setAudioDescription('');
    setAudioFile(null);
    setAudioPreview('');
    setAudioUrl('');
    setAudioUploadMethod('file');
    setCurrentBlock(null);
  };

  const handleAudioInputChange = (e) => {
    const { name, value, files } = e.target;
   
    if (name === 'file' && files && files[0]) {
      const file = files[0];
     
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only MP3, WAV, or OGG audio files');
        return;
      }
     
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        alert('Audio size should be less than 20MB');
        return;
      }
     
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    } else if (name === 'title') {
      setAudioTitle(value);
    } else if (name === 'description') {
      setAudioDescription(value);
    } else if (name === 'url') {
      setAudioUrl(value);
    }
  };

  const handleAddAudio = () => {
    // Validate required fields based on upload method
    if (!audioTitle) {
      alert('Please enter an audio title');
      return;
    }
   
    if (audioUploadMethod === 'file' && !audioFile) {
      alert('Please select an audio file');
      return;
    }
   
    if (audioUploadMethod === 'url' && !audioUrl) {
      alert('Please enter an audio URL');
      return;
    }

    // Create audio URL based on upload method
    let finalAudioUrl = '';
    if (audioUploadMethod === 'file') {
      finalAudioUrl = URL.createObjectURL(audioFile);
    } else {
      finalAudioUrl = audioUrl;
    }

    // Generate HTML content for display
    const htmlContent = `
      <audio controls style="width: 100%; max-width: 400px;">
        <source src="${finalAudioUrl}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      ${audioTitle ? `<p style="font-size: 14px; color: #666; margin-top: 8px;">${audioTitle}</p>` : ''}
      ${audioDescription ? `<p style="font-size: 12px; color: #888; margin-top: 4px;">${audioDescription}</p>` : ''}
    `;

    const audioBlock = {
      id: currentBlock?.id || `audio-${Date.now()}`,
      block_id: currentBlock?.id || `audio-${Date.now()}`,
      type: 'audio',
      title: 'Audio',
      audioTitle: audioTitle,
      audioDescription: audioDescription,
      audioFile: audioUploadMethod === 'file' ? audioFile : null,
      audioUrl: finalAudioUrl,
      uploadMethod: audioUploadMethod,
      originalUrl: audioUploadMethod === 'url' ? audioUrl : null,
      timestamp: new Date().toISOString(),
      html_css: htmlContent,
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev =>
        prev.map(block => block.id === currentBlock.id ? audioBlock : block)
      );
    } else {
      // Add new block
      // If we have existing lesson content, add to that structure
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, audioBlock]
          }
        }));
      } else {
        setContentBlocks(prev => [...prev, audioBlock]);
      }
    }
   
    handleAudioDialogClose();
  };

  const handleEditAudio = (blockId) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block) {
      setCurrentBlock(block);
      setAudioTitle(block.audioTitle);
      setAudioDescription(block.audioDescription || '');
      setAudioFile(block.audioFile);
      setAudioPreview(block.audioUrl);
      setShowAudioDialog(true);
    }
  };

  const handleAddYoutubeVideo = () => {
    if (!youtubeTitle || !youtubeUrl) {
      setYoutubeError('Please fill in all required fields');
      return;
    }

    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      setYoutubeError('Please enter a valid YouTube URL');
      return;
    }

    // Generate HTML content for display
    const htmlContent = `
      <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 8px;">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          title="${youtubeTitle || 'YouTube video'}"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
        ></iframe>
      </div>
      ${youtubeTitle ? `<p style="font-size: 14px; color: #666; margin-top: 8px;">${youtubeTitle}</p>` : ''}
      ${youtubeDescription ? `<p style="font-size: 12px; color: #888; margin-top: 4px;">${youtubeDescription}</p>` : ''}
    `;

    const newBlock = {
      id: currentYoutubeBlock?.id || `youtube-${Date.now()}`,
      block_id: currentYoutubeBlock?.id || `youtube-${Date.now()}`,
      type: 'youtube',
      title: 'YouTube Video',
      youtubeTitle: youtubeTitle,
      youtubeDescription: youtubeDescription,
      youtubeUrl: youtubeUrl,
      youtubeId: videoId,
      timestamp: new Date().toISOString(),
      html_css: htmlContent,
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    if (currentYoutubeBlock) {
      setContentBlocks(prev =>
        prev.map(block => block.id === currentYoutubeBlock.id ? newBlock : block)
      );
    } else {
      // Add new block
      // If we have existing lesson content, add to that structure
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, newBlock]
          }
        }));
      } else {
        setContentBlocks(prev => [...prev, newBlock]);
      }
    }
   
    handleYoutubeDialogClose();
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeDialogClose = () => {
    setShowYoutubeDialog(false);
    setYoutubeTitle('');
    setYoutubeDescription('');
    setYoutubeUrl('');
    setYoutubeError('');
    setCurrentYoutubeBlock(null);
  };

  const handleEditYoutubeVideo = (block) => {
    setCurrentYoutubeBlock(block);
    setYoutubeTitle(block.youtubeTitle);
    setYoutubeDescription(block.youtubeDescription || '');
    setYoutubeUrl(block.youtubeUrl);
    setShowYoutubeDialog(true);
  };

  const handleLinkDialogClose = () => {
    setShowLinkDialog(false);
    setLinkTitle('');
    setLinkUrl('');
    setLinkDescription('');
    setLinkButtonText('Visit Link');
    setLinkButtonStyle('primary');
    setLinkError('');
    setCurrentLinkBlock(null);
  };

  const handleLinkInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setLinkTitle(value);
    } else if (name === 'url') {
      setLinkUrl(value);
    } else if (name === 'description') {
      setLinkDescription(value);
    } else if (name === 'buttonText') {
      setLinkButtonText(value);
    } else if (name === 'buttonStyle') {
      setLinkButtonStyle(value);
    }
  };

  const handleAddLink = () => {
    if (!linkTitle || !linkUrl || !linkButtonText) {
      setLinkError('Please fill in all required fields');
      return;
    }

    try {
      // This will throw if URL is invalid
      new URL(linkUrl);
    } catch (e) {
      setLinkError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    // Generate HTML content for display
    const buttonStyles = {
      primary: 'background-color: #3B82F6; color: white; border: none;',
      secondary: 'background-color: #6B7280; color: white; border: none;',
      outline: 'background-color: transparent; color: #3B82F6; border: 2px solid #3B82F6;'
    };

    const htmlContent = `
      <div style="padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px; background-color: #F9FAFB;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1F2937;">${linkTitle}</h3>
        ${linkDescription ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #6B7280;">${linkDescription}</p>` : ''}
        <a href="${linkUrl}" target="_blank" rel="noopener noreferrer"
           style="display: inline-block; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; ${buttonStyles[linkButtonStyle] || buttonStyles.primary}">
          ${linkButtonText}
        </a>
      </div>
    `;

    const newBlock = {
      id: currentLinkBlock?.id || `link-${Date.now()}`,
      block_id: currentLinkBlock?.id || `link-${Date.now()}`,
      type: 'link',
      title: 'Link',
      linkTitle: linkTitle,
      linkUrl: linkUrl,
      linkDescription: linkDescription,
      linkButtonText: linkButtonText,
      linkButtonStyle: linkButtonStyle,
      timestamp: new Date().toISOString(),
      html_css: htmlContent,
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    if (currentLinkBlock) {
      setContentBlocks(prev =>
        prev.map(block => block.id === currentLinkBlock.id ? newBlock : block)
      );
    } else {
      // Add new block
      // If we have existing lesson content, add to that structure
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, newBlock]
          }
        }));
      } else {
        setContentBlocks(prev => [...prev, newBlock]);
      }
    }
   
    handleLinkDialogClose();
  };

  const handlePdfDialogClose = () => {
    setShowPdfDialog(false);
    setPdfTitle('');
    setPdfDescription('');
    setPdfFile(null);
    setPdfPreview('');
    setPdfUrl('');
    setPdfUploadMethod('file');
    setCurrentBlock(null);
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

    // Create PDF URL based on upload method
    let finalPdfUrl = '';
    let uploadedPdfData = null;
    if (pdfUploadMethod === 'file') {
      try {
        const result = await uploadImage(pdfFile, { fieldName: 'resource', folder: 'lesson-resources', public: true, type: 'pdf' });
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
      id: currentBlock?.id || `pdf-${Date.now()}`,
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

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev =>
        prev.map(block => block.id === currentBlock.id ? pdfBlock : block)
      );
    } else {
      // Add new block
      setContentBlocks(prev => [...prev, pdfBlock]);
    }
   
    handlePdfDialogClose();
    setMainPdfUploading(false);
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
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
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
            } else {
              console.log('No content found for this lesson');
            }
          } catch (contentError) {
            console.error('Error fetching lesson content:', contentError);
            console.error('Error details:', contentError.response?.data || contentError.message);
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
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
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
            status: 'DRAFT'
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
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const getPlainText = (html) => {
    const temp = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (!temp) return html || '';
    temp.innerHTML = html || '';
    return temp.textContent || temp.innerText || '';
  };

  return (
    <>
      <div className="flex min-h-screen w-full bg-white overflow-hidden">
        {/* Content Blocks Sidebar - Only show in edit mode */}
        {!isViewMode && (
          <div
            className="fixed top-16 h-[calc(100vh-4rem)] z-20 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
            style={{
              left: sidebarCollapsed ? "4.5rem" : "17rem"
            }}
          >
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                 
                  Content Library
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop content blocks to build your lesson
                </p>
              </div>
             
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {contentBlockTypes.map((blockType) => (
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

              {/* Footer */}
              {/* <div className="p-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Drag blocks to the right to build your lesson
                </p>
              </div> */}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 relative ${
            isViewMode
              ? 'ml-0'
              : sidebarCollapsed
                ? 'ml-[calc(4.5rem+16rem)]'
                : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          <div className="w-full h-full bg-[#fafafa]">
            {/* Lesson Builder Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
              <div className="max-w-[800px] mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {!isViewMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                  )}
                  <h1 className="text-lg font-bold">{lessonData?.title || lessonTitle || 'Untitled Lesson'}</h1>
                </div>
               
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleViewMode}
                    className="flex items-center gap-1"
                  >
                    {isViewMode ? (
                      <>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </>
                    )}
                  </Button>
                 
                  {!isViewMode && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        Save as Draft
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdate}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          'Update'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Canvas */}
            <div className="py-4">
                <div>
                  {isViewMode ? (
                        <div className="min-h-screen bg-white overflow-hidden relative">
                          {/* Course Header with Gradient */}
                          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-black opacity-10"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative z-10 text-center">
                              <h1 className="text-4xl font-bold mb-3">
                                {lessonData?.title || lessonTitle || 'Untitled Lesson'}
                              </h1>
                              <div className="w-32 h-1 bg-white bg-opacity-30 mx-auto rounded-full"></div>
                            </div>
                          </div>

                          {/* Course Content - All in one flowing container */}
                          <div className="p-8 bg-gradient-to-b from-gray-50 to-white">
                            {(() => {
                              // Combine both contentBlocks and lessonContent blocks
                              const allBlocks = [];
                             
                              // Add blocks from lessonContent (existing lesson)
                              if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
                                allBlocks.push(...lessonContent.data.content);
                              }
                             
                              // Add blocks from contentBlocks (new blocks)
                              if (contentBlocks && contentBlocks.length > 0) {
                                allBlocks.push(...contentBlocks);
                              }
                             
                              // Sort by order if available
                              allBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));
                             
                              if (allBlocks.length === 0) {
                                return (
                                  <div className="text-center py-16">
                                    <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                                      No Content Available
                                    </h3>
                                    <p className="text-gray-500 text-lg">
                                      This lesson doesn't have any content yet. Switch to edit mode to start adding content.
                                    </p>
                                  </div>
                                );
                              }
                             
                              return (
                                <div className="prose prose-xl max-w-none space-y-8">
                                  {allBlocks.map((block, index) => {
                                    const blockId = block.id || block.block_id;
                                   
                                    return (
                                      <div key={blockId} className="relative">
                                        {/* Text Content */}
                                        {block.type === 'text' && (
                                          <div className="mb-8">
                                            {block.html_css ? (
                                              <div
                                                className="prose prose-xl max-w-none text-gray-800 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: block.html_css }}
                                              />
                                            ) : (
                                              <div
                                                className="prose prose-xl max-w-none text-gray-800 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: block.content }}
                                              />
                                            )}
                                          </div>
                                        )}
                                       
                                        {/* Statement Content */}
                                        {block.type === 'statement' && (
                                          <div className="mb-8">
                                            {block.html_css ? (
                                              <div
                                                className="prose prose-xl max-w-none"
                                                dangerouslySetInnerHTML={{ __html: block.html_css }}
                                              />
                                            ) : (
                                              <div
                                                className="prose prose-xl max-w-none"
                                                dangerouslySetInnerHTML={{ __html: block.content }}
                                              />
                                            )}
                                          </div>
                                        )}
                                       
                                        {/* Image Content */}
                                        {block.type === 'image' && (
                                          <div className="mb-8">
                                            {(block.html_css || block.imageUrl || block.defaultContent?.imageUrl || block.details?.image_url) && (
                                              <div>
                                                {block.html_css && block.html_css.trim() ? (
                                                  <div
                                                    className="prose max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                                  />
                                                ) : ((block.layout || block.details?.layout) === 'side-by-side' ? (
                                                  <div className="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
                                                    <div>
                                                      <img
                                                        src={block.imageUrl || block.defaultContent?.imageUrl || block.details?.image_url}
                                                        alt={block.imageTitle || block.defaultContent?.text || block.details?.caption || 'Image'}
                                                        className="w-full h-auto rounded-lg shadow-lg"
                                                      />
                                                    </div>
                                                    <div>
                                                      <p className="text-gray-700 text-lg leading-relaxed">
                                                        {getPlainText(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption || '')}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ) : ((block.layout || block.details?.layout) === 'overlay') ? (
                                                  <div className="relative rounded-xl overflow-hidden">
                                                    <img
                                                      src={block.imageUrl || block.defaultContent?.imageUrl || block.details?.image_url}
                                                      alt={block.imageTitle || block.defaultContent?.text || block.details?.caption || 'Image'}
                                                      className="w-full h-96 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
                                                      <div className="text-white p-8 w-full">
                                                        <p className="text-xl font-medium leading-relaxed">
                                                          {getPlainText(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption || '')}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ) : ((block.layout || block.details?.layout) === 'centered') ? (
                                                  <div className="text-center">
                                                    <img
                                                      src={block.imageUrl || block.defaultContent?.imageUrl || block.details?.image_url}
                                                      alt={block.imageTitle || block.defaultContent?.text || block.details?.caption || 'Image'}
                                                      className="mx-auto w-full max-w-[720px] h-auto rounded-xl shadow-lg"
                                                    />
                                                    {(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption) && (
                                                      <p className="text-gray-600 mt-3 italic text-base">
                                                        {getPlainText(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption || '')}
                                                      </p>
                                                    )}
                                                  </div>
                                                ) : ((block.layout || block.details?.layout) === 'full-width') ? (
                                                  <div className="w-full">
                                                    <img
                                                      src={block.imageUrl || block.defaultContent?.imageUrl || block.details?.image_url}
                                                      alt={block.imageTitle || block.defaultContent?.text || block.details?.caption || 'Image'}
                                                      className="w-full max-h-[28rem] object-cover rounded-xl shadow-lg"
                                                    />
                                                    {(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption) && (
                                                      <p className="text-gray-700 mt-4 text-lg">
                                                        {getPlainText(block.text || block.defaultContent?.text || block.imageDescription || block.details?.caption || '')}
                                                      </p>
                                                    )}
                                                  </div>
                                                ) : null)}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                       
                                        {/* Video Content */}
                                        {block.type === 'video' && (block.videoUrl || block.details?.video_url) && (
                                          <div className="mb-8">
                                            <div className="bg-gray-900 rounded-xl p-6">
                                              <video
                                                src={block.videoUrl || block.details?.video_url}
                                                controls
                                                className="w-full h-96 rounded-lg"
                                              >
                                                Your browser does not support the video tag.
                                              </video>
                                              {(block.videoTitle || block.details?.caption) && (
                                                <h3 className="text-xl font-semibold text-white mt-4 mb-2">
                                                  {block.videoTitle || block.details?.caption}
                                                </h3>
                                              )}
                                              {(block.videoDescription || block.details?.description) && (
                                                <p className="text-gray-300 text-lg">
                                                  {block.videoDescription || block.details?.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                       
                                        {/* YouTube Content */}
                                        {block.type === 'youtube' && (block.youtubeId || block.youtubeUrl || block.details?.url) && (
                                          <div className="mb-8">
                                            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                              <iframe
                                                src={`https://www.youtube.com/embed/${block.youtubeId || (block.youtubeUrl || block.details?.url)?.split('v=')[1]?.split('&')[0]}`}
                                                title={block.youtubeTitle || block.details?.caption || 'YouTube video'}
                                                allowFullScreen
                                                className="w-full h-96 rounded-lg"
                                              />
                                              {(block.youtubeTitle || block.details?.caption) && (
                                                <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                                                  {block.youtubeTitle || block.details?.caption}
                                                </h3>
                                              )}
                                              {(block.youtubeDescription || block.details?.description) && (
                                                <p className="text-gray-700 text-lg">
                                                  {block.youtubeDescription || block.details?.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                       
                                        {/* Audio Content */}
                                        {block.type === 'audio' && (block.audioUrl || block.details?.audio_url) && (
                                          <div className="mb-8">
                                            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                              <audio
                                                src={block.audioUrl || block.details?.audio_url}
                                                controls
                                                className="w-full mb-4"
                                              >
                                                Your browser does not support the audio tag.
                                              </audio>
                                              {(block.audioTitle || block.details?.caption) && (
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                  {block.audioTitle || block.details?.caption}
                                                </h3>
                                              )}
                                              {(block.audioDescription || block.details?.description) && (
                                                <p className="text-gray-700 text-lg">
                                                  {block.audioDescription || block.details?.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                       
                                        {/* Link Content */}
                                        {block.type === 'link' && (block.linkUrl || block.details?.url) && (
                                          <div className="mb-8">
                                            <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
                                              {(block.linkTitle || block.details?.caption) && (
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                  {block.linkTitle || block.details?.caption}
                                                </h3>
                                              )}
                                              {(block.linkDescription || block.details?.description) && (
                                                <p className="text-gray-700 mb-6 text-lg">
                                                  {block.linkDescription || block.details?.description}
                                                </p>
                                              )}
                                              <a
                                                href={block.linkUrl || block.details?.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                                                  block.linkButtonStyle === 'secondary'
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                                                }`}
                                              >
                                                <Link2 className="h-5 w-5 mr-3" />
                                                {block.linkButtonText || 'Visit Link'}
                                              </a>
                                            </div>
                                          </div>
                                        )}
                                       
                                        {/* PDF Content */}
                                        {block.type === 'pdf' && (block.pdfUrl || block.details?.pdf_url) && (
                                          <div className="mb-8">
                                            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                                              {(block.pdfTitle || block.details?.caption) && (
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                  {block.pdfTitle || block.details?.caption}
                                                </h3>
                                              )}
                                              {(block.pdfDescription || block.details?.description) && (
                                                <p className="text-gray-700 mb-4 text-lg">
                                                  {block.pdfDescription || block.details?.description}
                                                </p>
                                              )}
                                              <div className="w-full rounded-xl overflow-hidden border border-orange-200 bg-white">
                                                <iframe
                                                  src={block.pdfUrl || block.details?.pdf_url}
                                                  className="w-full h-[600px]"
                                                  title={block.pdfTitle || 'PDF Document'}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                         
                          {/* Course Footer */}
                          <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 text-center border-t">
                            <div className="flex items-center justify-center space-x-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-gray-600 font-medium">Lesson Complete</span>
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                  ) : contentBlocks.length === 0 ? (
                    <div>
                      <div >
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {fetchingContent ? "Loading Lesson Content..." : lessonContent ? "" : ""}
                          </h2>
                          {fetchingContent ? (
                            <div >
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : lessonContent?.data?.content && lessonContent.data.content.length > 0 ? (
                            <div >
                              <div >
                                {lessonContent.data.content.map((block, index) => (
                                  <div
                                    key={block.block_id}
                                    className="relative w-full  mb-4 group"
                                    draggable="true"
                                    data-block-id={block.block_id}
                                    onDragStart={(e) => handleDragStart(e, block.block_id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, block.block_id)}
                                    onDragEnd={handleDragEnd}
                                  >
                                    {/* Edit/Delete Controls */}
                                    {!isViewMode && (
                                      <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                          onClick={() => {
                                            const blockType = block.type || 'text';
                                            switch(blockType) {
                                              case 'text':
                                                // Detect textType from HTML content structure
                                                let detectedTextType = 'paragraph'; // default
                                                const htmlContent = block.html_css || '';
                                               
                                                // Check for heading + paragraph combination
                                                if (htmlContent.includes('<h1') && htmlContent.includes('<p')) {
                                                  detectedTextType = 'heading_paragraph';
                                                } else if (htmlContent.includes('<h2') && htmlContent.includes('<p')) {
                                                  detectedTextType = 'subheading_paragraph';
                                                } else if (htmlContent.includes('<h1')) {
                                                  detectedTextType = 'heading';
                                                } else if (htmlContent.includes('<h2')) {
                                                  detectedTextType = 'subheading';
                                                } else if (htmlContent.includes('<table') || htmlContent.includes('grid')) {
                                                  detectedTextType = 'table';
                                                }
                                               
                                                // Set the appropriate editor state based on detected type
                                                setCurrentTextBlockId(block.block_id);
                                               
                                                // Reset all editor states first
                                                setEditorHtml('');
                                                setEditorHeading('');
                                                setEditorSubheading('');
                                                setEditorContent('');
                                               
                                                // Set content based on detected type
                                                if (detectedTextType === 'heading_paragraph') {
                                                  // Extract heading and paragraph content
                                                  const tempDiv = document.createElement('div');
                                                  tempDiv.innerHTML = htmlContent;
                                                 
                                                  // Try multiple selectors for heading
                                                  const h1 = tempDiv.querySelector('h1') || tempDiv.querySelector('[class*="heading"]') || tempDiv.querySelector('h2, h3, h4, h5, h6');
                                                  // Try multiple selectors for paragraph - look for p tags or div with paragraph content
                                                  const p = tempDiv.querySelector('p') || tempDiv.querySelector('div:not([class*="content-block"]):not([class*="prose"])') || tempDiv.querySelector('[class*="paragraph"]');
                                                 
                                                  // Extract text content, preserving rich text formatting
                                                  let headingContent = '';
                                                  let paragraphContent = '';
                                                 
                                                  if (h1) {
                                                    headingContent = h1.innerHTML || '';
                                                  }
                                                 
                                                  if (p) {
                                                    paragraphContent = p.innerHTML || '';
                                                  }
                                                 
                                                  // If we couldn't find structured content, try to parse manually while preserving HTML
                                                  if (!headingContent && !paragraphContent) {
                                                    const fullHTML = tempDiv.innerHTML || '';
                                                   
                                                    // Try to find heading and paragraph content in the HTML
                                                    // Look for heading patterns first
                                                    const headingMatch = fullHTML.match(/<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/i);
                                                    if (headingMatch) {
                                                      headingContent = headingMatch[2] || '';
                                                      // Remove the heading from HTML and get remaining content
                                                      const remainingHTML = fullHTML.replace(headingMatch[0], '').trim();
                                                      if (remainingHTML) {
                                                        // Clean up remaining content - remove wrapper divs but keep inner formatting
                                                        const cleanedContent = remainingHTML
                                                          .replace(/^<div[^>]*>/, '')
                                                          .replace(/<\/div>$/, '')
                                                          .trim();
                                                        paragraphContent = cleanedContent || remainingHTML;
                                                      }
                                                    } else {
                                                      // Look for strong/bold text as potential heading
                                                      const boldMatch = fullHTML.match(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/i);
                                                      if (boldMatch) {
                                                        headingContent = boldMatch[2] || '';
                                                        // Get content after the bold text
                                                        const afterBold = fullHTML.substring(fullHTML.indexOf(boldMatch[0]) + boldMatch[0].length).trim();
                                                        if (afterBold) {
                                                          paragraphContent = afterBold;
                                                        }
                                                      } else {
                                                        // Last resort: try to split by line breaks or common patterns
                                                        const textContent = tempDiv.textContent || '';
                                                        const htmlContent = tempDiv.innerHTML || '';
                                                       
                                                        // If there's formatted content, try to detect heading vs paragraph
                                                        if (htmlContent.includes('<') && textContent) {
                                                          // Split by common separators and take first part as heading
                                                          const parts = textContent.split(/[\n\r]+/).filter(part => part.trim());
                                                          if (parts.length >= 2) {
                                                            headingContent = parts[0].trim();
                                                            paragraphContent = parts.slice(1).join(' ').trim();
                                                          } else {
                                                            headingContent = htmlContent;
                                                          }
                                                        } else {
                                                          headingContent = htmlContent || textContent;
                                                        }
                                                      }
                                                    }
                                                  }
                                                 
                                                  setEditorHeading(headingContent);
                                                  setEditorContent(paragraphContent);
                                                } else if (detectedTextType === 'subheading_paragraph') {
                                                  // Extract subheading and paragraph content
                                                  const tempDiv = document.createElement('div');
                                                  tempDiv.innerHTML = htmlContent;
                                                 
                                                  // Try multiple selectors for subheading
                                                  const h2 = tempDiv.querySelector('h2') || tempDiv.querySelector('[class*="subheading"]') || tempDiv.querySelector('h3, h4, h5, h6, h1');
                                                  // Try multiple selectors for paragraph
                                                  const p = tempDiv.querySelector('p') || tempDiv.querySelector('div:not([class*="content-block"]):not([class*="prose"])') || tempDiv.querySelector('[class*="paragraph"]');
                                                 
                                                  // Extract text content, preserving rich text formatting
                                                  let subheadingContent = '';
                                                  let paragraphContent = '';
                                                 
                                                  if (h2) {
                                                    subheadingContent = h2.innerHTML || '';
                                                  }
                                                 
                                                  if (p) {
                                                    paragraphContent = p.innerHTML || '';
                                                  }
                                                 
                                                  // If we couldn't find structured content, try to parse manually while preserving HTML
                                                  if (!subheadingContent && !paragraphContent) {
                                                    const fullHTML = tempDiv.innerHTML || '';
                                                   
                                                    // Try to find subheading and paragraph content in the HTML
                                                    // Look for subheading patterns first
                                                    const subheadingMatch = fullHTML.match(/<(h[2-6])[^>]*>(.*?)<\/h[2-6]>/i);
                                                    if (subheadingMatch) {
                                                      subheadingContent = subheadingMatch[2] || '';
                                                      // Remove the subheading from HTML and get remaining content
                                                      const remainingHTML = fullHTML.replace(subheadingMatch[0], '').trim();
                                                      if (remainingHTML) {
                                                        // Clean up remaining content - remove wrapper divs but keep inner formatting
                                                        const cleanedContent = remainingHTML
                                                          .replace(/^<div[^>]*>/, '')
                                                          .replace(/<\/div>$/, '')
                                                          .trim();
                                                        paragraphContent = cleanedContent || remainingHTML;
                                                      }
                                                    } else {
                                                      // Look for strong/bold text as potential subheading
                                                      const boldMatch = fullHTML.match(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/i);
                                                      if (boldMatch) {
                                                        subheadingContent = boldMatch[2] || '';
                                                        // Get content after the bold text
                                                        const afterBold = fullHTML.substring(fullHTML.indexOf(boldMatch[0]) + boldMatch[0].length).trim();
                                                        if (afterBold) {
                                                          paragraphContent = afterBold;
                                                        }
                                                      } else {
                                                        // Last resort: try to split by line breaks or common patterns
                                                        const textContent = tempDiv.textContent || '';
                                                        const htmlContent = tempDiv.innerHTML || '';
                                                       
                                                        // If there's formatted content, try to detect subheading vs paragraph
                                                        if (htmlContent.includes('<') && textContent) {
                                                          // Split by common separators and take first part as subheading
                                                          const parts = textContent.split(/[\n\r]+/).filter(part => part.trim());
                                                          if (parts.length >= 2) {
                                                            subheadingContent = parts[0].trim();
                                                            paragraphContent = parts.slice(1).join(' ').trim();
                                                          } else {
                                                            subheadingContent = htmlContent;
                                                          }
                                                        } else {
                                                          subheadingContent = htmlContent || textContent;
                                                        }
                                                      }
                                                    }
                                                  }
                                                 
                                                  setEditorSubheading(subheadingContent);
                                                  setEditorContent(paragraphContent);
                                                } else {
                                                  // For single content blocks, extract the inner content
                                                  const tempDiv = document.createElement('div');
                                                  tempDiv.innerHTML = htmlContent;
                                                  const contentElement = tempDiv.querySelector('h1, h2, h3, h4, h5, h6, p') || tempDiv;
                                                  setEditorHtml(contentElement.innerHTML || htmlContent);
                                                }
                                               
                                                // Store the detected textType for the save function
                                                const blockWithTextType = { ...block, textType: detectedTextType };
                                                setCurrentBlock(blockWithTextType);
                                                setCurrentTextType(detectedTextType);
                                                setCurrentTextBlockId(block.block_id);
                                               
                                                setShowTextEditorDialog(true);
                                                break;
                                              case 'image':
                                                // Open image dialog in edit mode with existing data populated
                                                setCurrentBlock({
                                                  id: block.block_id,
                                                  layout: block.layout || block.details?.layout,
                                                  templateType: block.templateType || block.details?.template
                                                });
                                                setImageTitle(block.details?.alt_text || block.imageTitle || '');
                                                setImageDescription(block.details?.caption || block.imageDescription || '');
                                                setImageFile(null);
                                                setImagePreview(block.details?.image_url || '');
                                                setImageTemplateText(block.text || block.details?.caption || '');
                                                setShowImageDialog(true);
                                                break;
                                              case 'video':
                                                setCurrentBlock({
                                                  id: block.block_id,
                                                  videoUrl: block.details?.video_url,
                                                  videoTitle: block.details?.caption
                                                });
                                                setShowVideoDialog(true);
                                                break;
                                              case 'youtube':
                                                setCurrentYoutubeBlock({
                                                  id: block.block_id,
                                                  youtubeUrl: block.details?.url,
                                                  youtubeTitle: block.details?.caption
                                                });
                                                setShowYoutubeDialog(true);
                                                break;
                                              default:
                                                handleEditBlock(block.block_id);
                                            }
                                          }}
                                          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm"
                                          title="Edit"
                                        >
                                          <Pencil className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const updatedContent = lessonContent.data.content.filter(
                                              b => b.block_id !== block.block_id
                                            );
                                            setLessonContent({
                                              ...lessonContent,
                                              data: {
                                                ...lessonContent.data,
                                                content: updatedContent
                                              }
                                            });
                                            setContentBlocks(prevBlocks =>
                                              prevBlocks.filter(b => b.id !== block.block_id)
                                            );
                                          }}
                                          className="p-2 bg-white hover:bg-red-50 rounded-full shadow-sm"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                        <div
                                          className="p-2 bg-white hover:bg-gray-100 rounded-full shadow-sm cursor-move"
                                          title="Drag to reorder"
                                        >
                                          <GripVertical className="h-4 w-4 text-gray-500" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="p-0">
                                      {block.html_css ? (
                                        <div dangerouslySetInnerHTML={{ __html: block.html_css }} />
                                      ) : (
                                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                      )}
                                      {block.script && (
                                        <script dangerouslySetInnerHTML={{ __html: block.script }} />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="max-w-2xl mx-auto text-center py-12">
                              <div className="mb-8">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                  No Content Available
                                </h3>
                                <p className="text-gray-500 mb-6">
                                  This lesson doesn't have any content yet. Start building your lesson by adding content blocks from the Content Library.
                                </p>
                              </div>
                             
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">
                                  💡 Getting Started
                                </h4>
                                <p className="text-sm text-blue-700 mb-4">
                                  Use the <strong>Content Library</strong> on the left to add text, images, videos, and other interactive elements to your lesson.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  <Button
                                    onClick={() => setShowTextTypeSidebar(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Text
                                  </Button>
                                  <Button
                                    onClick={() => setShowImageTemplateSidebar(true)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Image
                                  </Button>
                                  <Button
                                    onClick={() => setShowVideoDialog(true)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Video
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-3xl mx-auto">
                      {contentBlocks.map((block, index) => (
                        <div
                          key={block.id}
                          className="relative group bg-white rounded-lg"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, block.id)}
                        >
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {!block.isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                                onClick={() => {
                                  if (block.type === 'text') {
                                    handleTextEditorOpen(block);
                                  } else if (block.type === 'image' && block.layout) {
                                    toggleImageBlockEditing(block.id);
                                  } else if (block.type === 'pdf') {
                                    handleEditBlock(block.id);
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
                              onDragStart={(e) => handleDragStart(e, block.id)}
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                          </div>
                         
                          <div className="p-6">
                            {block.type === 'text' && (
                              <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-pink-500 to-orange-500 rounded-l-2xl"></div>
                                <div className="pl-4">
                                  {block.textType === 'heading' && (
                                    <h1 className="text-3xl font-bold text-gray-800">{getPlainText(block.content)}</h1>
                                  )}
                                  {block.textType === 'subheading' && (
                                    <h2 className="text-xl font-semibold text-gray-800">{getPlainText(block.content)}</h2>
                                  )}
                                  {block.textType === 'paragraph' && (
                                    <p className="text-base text-gray-700 leading-relaxed">{getPlainText(block.content)}</p>
                                  )}
                                  {block.textType === 'heading_paragraph' && (
                                    <div className="space-y-2">
                                      <h1 className="text-3xl font-bold text-gray-800">{getPlainText(block.heading || '')}</h1>
                                      <p className="text-base text-gray-700 leading-relaxed">{getPlainText(block.content)}</p>
                                    </div>
                                  )}
                                  {block.textType === 'subheading_paragraph' && (
                                    <div className="space-y-2">
                                      <h2 className="text-xl font-semibold text-gray-800">{getPlainText(block.subheading || '')}</h2>
                                      <p className="text-base text-gray-700 leading-relaxed">{getPlainText(block.content)}</p>
                                    </div>
                                  )}
                                  {block.textType === 'table' && (
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                  )}
                                  {!block.textType && (
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                  )}
                                </div>
                              </div>
                            )}
                           
                            {block.type === 'link' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.linkTitle}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Link
                                  </Badge>
                                </div>
                               
                                {block.linkDescription && (
                                  <p className="text-sm text-gray-600 mb-3">{block.linkDescription}</p>
                                )}
                               
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <button
                                    onClick={() => window.open(block.linkUrl, '_blank', 'noopener,noreferrer')}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                      block.linkButtonStyle === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                      block.linkButtonStyle === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                                      block.linkButtonStyle === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                      block.linkButtonStyle === 'warning' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                                      block.linkButtonStyle === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                      block.linkButtonStyle === 'outline' ? 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' :
                                      'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {block.linkButtonText || 'Visit Link'}
                                    <svg className="ml-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                           
                            {block.type === 'video' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.videoTitle}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Video
                                  </Badge>
                                </div>
                               
                                {block.videoDescription && (
                                  <p className="text-sm text-gray-600 mb-3">{block.videoDescription}</p>
                                )}
                               
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                                    <video
                                      className="absolute top-0 left-0 w-full h-full"
                                      controls
                                      controlsList="nodownload"
                                      preload="metadata"
                                      key={block.id}
                                    >
                                      <source src={block.videoUrl} type={block.videoFile?.type || 'video/mp4'} />
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'audio' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.audioTitle}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Audio
                                  </Badge>
                                </div>
                               
                                {block.audioDescription && (
                                  <p className="text-sm text-gray-600 mb-3">{block.audioDescription}</p>
                                )}
                               
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <audio
                                    src={block.audioUrl}
                                    controls
                                    className="w-full rounded-lg border border-gray-200"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'youtube' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.youtubeTitle}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    YouTube
                                  </Badge>
                                </div>
                               
                                {block.youtubeDescription && (
                                  <p className="text-sm text-gray-600 mb-3">{block.youtubeDescription}</p>
                                )}
                               
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${block.youtubeId}?rel=0&showinfo=0`}
                                      className="absolute top-0 left-0 w-full h-full"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title={block.youtubeTitle || 'YouTube video player'}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'pdf' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.pdfTitle}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    PDF
                                  </Badge>
                                </div>
                               
                                {block.pdfDescription && (
                                  <p className="text-sm text-gray-600 mb-3">{block.pdfDescription}</p>
                                )}
                               
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="w-full border rounded-lg overflow-hidden">
                                    <iframe
                                      src={block.pdfUrl || block.details?.pdf_url}
                                      className="w-full h-[400px]"
                                      title={block.pdfTitle || 'PDF Document'}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'image' && (block.imageUrl || block.defaultContent?.imageUrl) && (
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {imageTemplates.find(t => t.id === block.templateType)?.title || block.templateType}
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
                                            disabled={imageUploading[block.id]}
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                handleImageFileUpload(block.id, file);
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
                                          <span className="px-3 text-sm text-gray-500">OR</span>
                                          <div className="flex-1 border-t border-gray-300"></div>
                                        </div>
                                       
                                        {/* Image URL */}
                                        <input
                                          type="url"
                                          value={block.imageUrl}
                                          onChange={(e) => handleImageBlockEdit(block.id, 'imageUrl', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                          placeholder="Enter image URL"
                                        />
                                       
                                        {/* Image Preview */}
                                        {(block.imageUrl || block.defaultContent?.imageUrl) && (
                                          <div className="mt-3">
                                            <img
                                            src={block.imageUrl || block.defaultContent?.imageUrl}
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
                                        onChange={(value) => handleImageBlockEdit(block.id, 'text', value)}
                                        modules={getToolbarModules('full')}
                                        style={{ minHeight: '100px' }}
                                      />
                                    </div>
                                   
                                    {/* Save and Cancel Buttons */}
                                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleImageBlockEditing(block.id)}
                                        className="px-4"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => saveImageTemplateChanges(block.id)}
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
                                        <div className="w-1/2">
                                          <img
                                            src={block.imageUrl}
                                            alt="Image"
                                            className="w-full h-20 object-cover rounded"
                                          />
                                        </div>
                                        <div className="w-1/2">
                                          <p className="text-sm text-gray-600 line-clamp-4">
                                            {getPlainText(block.text || '').substring(0, 60)}...
                                          </p>
                                        </div>
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
                                            {getPlainText(block.text || '').substring(0, 50)}...
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    {block.layout === 'centered' && (
                                      <div className="text-center space-y-3">
                                        <img
                                          src={block.imageUrl}
                                          alt="Image"
                                          className="mx-auto h-20 object-cover rounded"
                                        />
                                        <p className="text-sm text-gray-600 italic line-clamp-2">
                                          {getPlainText(block.text || '').substring(0, 40)}...
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
                                          {getPlainText(block.text || '').substring(0, 60)}...
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={handleVideoDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
            <p className="text-sm text-gray-500">Upload a video file or provide a video URL</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video title"
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
                    name="uploadMethod"
                    value="file"
                    checked={videoUploadMethod === 'file'}
                    onChange={(e) => setVideoUploadMethod(e.target.value)}
                    className="mr-2"
                  />
                  Upload File
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="url"
                    checked={videoUploadMethod === 'url'}
                    onChange={(e) => setVideoUploadMethod(e.target.value)}
                    className="mr-2"
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
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
                          accept="video/mp4,video/webm,video/ogg"
                          className="sr-only"
                          onChange={handleVideoInputChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP4, WebM, or OGG up to 50MB
                    </p>
                  </div>
                </div>
                {videoPreview && videoUploadMethod === 'file' && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg border border-gray-200"
                    />
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
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/video.mp4"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
                </p>
                {videoUrl && videoUploadMethod === 'url' && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg border border-gray-200"
                      onError={() => console.log('Video URL may be invalid or not accessible')}
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
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your video (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleVideoDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddVideo}
              disabled={!videoTitle || (videoUploadMethod === 'file' && !videoFile) || (videoUploadMethod === 'url' && !videoUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Editor Dialog */}
      <Dialog open={showTextEditorDialog} onOpenChange={handleTextEditorClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col" style={{ overflow: 'visible' }}>
          <DialogHeader>
            <DialogTitle>
              {currentTextBlockId ? 'Edit' : 'Add'} Text Block
              {(() => {
                const currentBlock = contentBlocks.find(b => b.id === currentTextBlockId);
                const textType = currentTextType || currentBlock?.textType;
                if (textType) {
                  const textTypeObj = textTypes.find(t => t.id === textType);
                  return textTypeObj ? ` (${textTypeObj.title})` : '';
                }
                return '';
              })()}
            </DialogTitle>
          </DialogHeader>
         
          <div className="flex-1 overflow-visible px-1" style={{ maxHeight: 'calc(90vh - 140px)', overflow: 'visible' }}>
            <div className="pr-4">
              {(() => {
                const currentBlock = contentBlocks.find(b => b.id === currentTextBlockId);
                const textType = currentTextType || currentBlock?.textType;
               
                // Heading only
                if (textType === 'heading') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heading
                      </label>
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white" style={{ height: '350px' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('heading')}
                          placeholder="Enter your heading text..."
                          style={{ height: '300px' }}
                        />
                      </div>
                    </div>
                  );
                }
               
                // Subheading only
                if (textType === 'subheading') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subheading
                      </label>
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white" style={{ height: '35px' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('heading')}
                          placeholder="Enter your subheading text..."
                          style={{ height: '300px' }}
                        />
                      </div>
                    </div>
                  );
                }
               
                // Paragraph only
                if (textType === 'paragraph') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paragraph
                      </label>
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white" style={{ height: '350px' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('full')}
                          placeholder="Enter your paragraph text..."
                          style={{ height: '300px' }}
                        />
                      </div>
                    </div>
                  );
                }
               
                // Heading with Paragraph
                if (textType === 'heading_paragraph') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heading
                        </label>
                        <div className="border rounded-md bg-white" style={{ height: '120px', overflow: 'visible' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorHeading}
                            onChange={setEditorHeading}
                            modules={getToolbarModules('heading')}
                            placeholder="Type and format your heading here"
                            style={{ height: '80px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div className="border rounded-md bg-white" style={{ height: '230px', overflow: 'visible' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={getToolbarModules('full')}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '180px' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
               
                // Subheading with Paragraph
                if (textType === 'subheading_paragraph') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subheading
                        </label>
                        <div className="border rounded-md bg-white" style={{ height: '120px', overflow: 'visible' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorSubheading}
                            onChange={setEditorSubheading}
                            modules={getToolbarModules('heading')}
                            placeholder="Type and format your subheading here"
                            style={{ height: '80px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div className="border rounded-md bg-white" style={{ height: '230px', overflow: 'visible' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={getToolbarModules('full')}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '180px' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
               
                // Table
                if (textType === 'table') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Content
                      </label>
                      <div className="flex-1 flex flex-col border rounded-md bg-white" style={{ overflow: 'visible' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('full')}
                          placeholder="Edit your table content..."
                          className="flex-1"
                        />
                      </div>
                    </div>
                  );
                }
               
                // Default fallback for new blocks or unknown types
                return (
                  <div className="flex-1 flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading
                    </label>
                    <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white">
                      <ReactQuill
                        theme="snow"
                        value={editorHtml}
                        onChange={setEditorHtml}
                        modules={getToolbarModules('heading')}
                        placeholder="Enter your heading text..."
                        className="flex-1"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
         
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleTextEditorClose}>
              Cancel
            </Button>
            <Button
              onClick={handleTextEditorSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentTextBlockId ? 'Update' : 'Add'} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Block Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {currentBlock?.title}
            </DialogTitle>
          </DialogHeader>
          {currentBlock && (
            <div className="space-y-4 overflow-y-auto pr-2">
              {/* Heading + Paragraph */}
              {currentBlock.type === 'text' && currentBlock.textType === 'heading-paragraph' && (
                <>
                  <label className="block font-medium mb-2">Heading</label>
                  <div style={{ height: '120px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorHeading}
                      onChange={setEditorHeading}
                      theme="snow"
                      modules={getToolbarModules('heading')}
                      placeholder="Type and format your heading here"
                      style={{ height: '80px' }}
                    />
                  </div>
                  <label className="block font-medium mb-2 mt-4">Paragraph</label>
                  <div style={{ height: '230px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      modules={getToolbarModules('full')}
                      placeholder="Type and format your content here"
                      style={{ height: '180px' }}
                    />
                  </div>
                </>
              )}

              {/* Subheading + Paragraph */}
              {currentBlock.type === 'text' && currentBlock.textType === 'subheading-paragraph' && (
                <>
                  <label className="block font-medium mb-2">Subheading</label>
                  <div style={{ height: '120px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorSubheading}
                      onChange={setEditorSubheading}
                      theme="snow"
                      modules={getToolbarModules('heading')}
                      placeholder="Type and format your subheading here"
                      style={{ height: '80px' }}
                    />
                  </div>
                  <label className="block font-medium mb-2 mt-4">Paragraph</label>
                  <div style={{ height: '230px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      modules={getToolbarModules('full')}
                      placeholder="Type and format your content here"
                      style={{ height: '180px' }}
                    />
                  </div>
                </>
              )}

              {/* Paragraph only */}
              {currentBlock.type === 'text' && currentBlock.textType === 'paragraph' && (
                <>
                  <label className="block font-medium mb-2">Paragraph</label>
                  <div style={{ height: '350px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      modules={getToolbarModules('full')}
                      placeholder="Type and format your content here"
                      style={{ height: '300px' }}
                    />
                  </div>
                </>
              )}

              {/* Other block types */}
              {(currentBlock.type === 'statement' || currentBlock.type === 'quote') && (
                <>
                  <label className="block font-medium mb-2">{currentBlock.type === 'statement' ? 'Statement' : 'Quote'}</label>
                  <div style={{ height: '350px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      modules={getToolbarModules('full')}
                      placeholder={`Type and format your ${currentBlock.type} here`}
                      style={{ height: '300px' }}
                    />
                  </div>
                </>
              )}

              {/* List block type */}
              {currentBlock.type === 'list' && (
                <>
                  <label className="block font-medium mb-2">List Items</label>
                  <div style={{ height: '350px', overflowY: 'auto' }}>
                    <ReactQuill
                      value={editorContent}
                      onChange={setEditorContent}
                      theme="snow"
                      modules={getToolbarModules('full')}
                      placeholder="Type and format your list here"
                      style={{ height: '300px' }}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleEditorSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Template Sidebar */}
      {showImageTemplateSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            onClick={() => setShowImageTemplateSidebar(false)}
          />
         
          {/* Sidebar */}
          <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Image className="h-6 w-6" />
                  Image Templates
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageTemplateSidebar(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a template to add to your lesson
              </p>
            </div>
           
            <div className="p-6 space-y-4">
              {imageTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleImageTemplateSelect(template)}
                  className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">{template.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                 
                  {/* Mini Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    {template.layout === 'side-by-side' && (
                      <div className="flex gap-3 items-start">
                        <div className="w-1/2">
                          <img
                            src={template.defaultContent.imageUrl}
                            alt="Preview"
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                        <div className="w-1/2">
                          <p className="text-xs text-gray-600 line-clamp-4">
                            {template.defaultContent.text.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    )}
                    {template.layout === 'overlay' && (
                      <div className="relative">
                        <img
                          src={template.defaultContent.imageUrl}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded flex items-center justify-center p-2">
                          <p className="text-white text-sm text-center line-clamp-3">
                            {template.defaultContent.text.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    )}
                    {template.layout === 'centered' && (
                      <div className="text-center space-y-2">
                        <img
                          src={template.defaultContent.imageUrl}
                          alt="Preview"
                          className="mx-auto h-20 object-cover rounded"
                        />
                        <p className="text-xs text-gray-600 italic line-clamp-2">
                          {template.defaultContent.text.substring(0, 40)}...
                        </p>
                      </div>
                    )}
                    {template.layout === 'full-width' && (
                      <div className="space-y-2">
                        <img
                          src={template.defaultContent.imageUrl}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded"
                        />
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {template.defaultContent.text.substring(0, 60)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Template Sidebar */}
      {showTableTemplateSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            onClick={() => setShowTableTemplateSidebar(false)}
          />
         
          {/* Sidebar */}
          <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Table className="h-6 w-6" />
                  Table Templates
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTableTemplateSidebar(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a table/column template to add to your lesson
              </p>
            </div>
           
            <div className="p-6 space-y-4">
              {tableTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTableTemplateSelect(template)}
                  className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">{template.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                 
                  {/* Mini Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: template.defaultContent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Type Sidebar */}
      {showTextTypeSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300"
            onClick={() => setShowTextTypeSidebar(false)}
          />
         
          {/* Sidebar */}
          <div className="relative bg-white w-96 h-full shadow-xl overflow-y-auto animate-slide-in-left">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileTextIcon className="h-6 w-6" />
                  Text Types
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextTypeSidebar(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ×
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a text type to add to your lesson
              </p>
            </div>
           
            <div className="p-6 space-y-4">
              {textTypes.map((textType) => (
                <div
                  key={textType.id}
                  onClick={() => handleTextTypeSelect(textType)}
                  className="p-5 border rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-blue-600 mt-1 group-hover:text-blue-700">
                      {textType.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-900 text-base">{textType.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{textType.description}</p>
                    </div>
                  </div>
                 
                  {/* Mini Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    {textType.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={handleImageDialogClose}>
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
                onChange={handleImageInputChange}
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
                        onChange={handleImageInputChange}
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
            <Button variant="outline" onClick={handleImageDialogClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddImage} 
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

      {/* Audio Dialog */}
      <Dialog open={showAudioDialog} onOpenChange={handleAudioDialogClose}>
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
                onChange={handleAudioInputChange}
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
                          onChange={handleAudioInputChange}
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
                  placeholder="Enter audio URL (e.g., https://example.com/audio.mp3)"
                  required
                />
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
                name="description"
                value={audioDescription}
                onChange={handleAudioInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your audio (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAudioDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAudio}
              disabled={!audioTitle || (audioUploadMethod === 'file' && !audioFile) || (audioUploadMethod === 'url' && !audioUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Audio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={showYoutubeDialog} onOpenChange={handleYoutubeDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={youtubeTitle}
                onChange={(e) => setYoutubeTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </p>
              {youtubeError && (
                <p className="text-sm text-red-500 mt-1">{youtubeError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={youtubeDescription}
                onChange={(e) => setYoutubeDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your video (optional)"
              />
            </div>

            {youtubeUrl && extractYoutubeId(youtubeUrl) && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(youtubeUrl)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleYoutubeDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddYoutubeVideo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={handleLinkDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={linkTitle}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter link title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="url"
                value={linkUrl}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: https://www.example.com
              </p>
              {linkError && (
                <p className="text-sm text-red-500 mt-1">{linkError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={linkDescription}
                onChange={handleLinkInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a description for your link (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buttonText"
                value={linkButtonText}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Visit Link"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Style
              </label>
              <select
                name="buttonStyle"
                value={linkButtonStyle}
                onChange={handleLinkInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="primary">Primary (Blue)</option>
                <option value="secondary">Secondary (Gray)</option>
                <option value="success">Success (Green)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="danger">Danger (Red)</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLinkDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLink}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      

      {/* PDF Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={handlePdfDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentBlock ? 'Edit PDF' : 'Add PDF'}</DialogTitle>
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
            <Button variant="outline" onClick={handlePdfDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPdf}
              disabled={!pdfTitle || (pdfUploadMethod === 'file' && !pdfFile) || (pdfUploadMethod === 'url' && !pdfUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentBlock ? 'Update PDF' : 'Add PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

    </>
  );
}

export default LessonBuilder;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Table
} from 'lucide-react';
import axios from 'axios';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add custom CSS for slide animation
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
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = slideInLeftStyle;
  document.head.appendChild(styleSheet);
}

// Register font sizes
const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

// Register font families
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'times-new-roman', 'courier-new', 'roboto', 'serif', 'sans-serif'];
Quill.register(Font, true);

// Font size whitelist for px values
const PxSize = Quill.import('formats/size');
PxSize.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
Quill.register(PxSize, true);

// Universal toolbar for paragraph/content (no header, px size)
const paragraphToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': PxSize.whitelist }],
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
  [{ 'size': PxSize.whitelist }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['clean']
];

const LessonBuilder = ({ viewMode: initialViewMode = false }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useOutletContext();
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [contentBlocks, setContentBlocks] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(location.state?.lessonData || null);
  const [loading, setLoading] = useState(true);
  const [showTextTypeModal, setShowTextTypeModal] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(initialViewMode);
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
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [currentImageBlock, setCurrentImageBlock] = useState(null);
  const [imageTemplateText, setImageTemplateText] = useState('');
  const [imageTemplateUrl, setImageTemplateUrl] = useState('');
  const [selectedImageTemplate, setSelectedImageTemplate] = useState(null);
  const [showTextTypeSidebar, setShowTextTypeSidebar] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUploadMethod, setPdfUploadMethod] = useState('file');

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

  const contentBlockTypes = [
    {
      id: 'text',
      title: 'Text',
      icon: <FileTextIcon className="h-5 w-5" />
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
      id: 'scorm',
      title: 'SCORM',
      icon: <Box className="h-5 w-5" />
    }
  ];

  const textTypes = [
    {
      id: 'heading',
      // title: 'Heading',
      // description: 'Large section heading',
      icon: <Heading1 className="h-5 w-5" />,
      preview: <h1 className="text-2xl font-bold mb-2">Heading</h1>,
      defaultContent: '<h1>Heading</h1>'
    },
    {
      id: 'subheading',
      // title: 'Subheading',
      // description: 'Medium section heading',
      icon: <Heading2 className="h-5 w-5" />,
      preview: <h2 className="text-xl font-semibold mb-2">Subheading</h2>,
      defaultContent: '<h2>Subheading</h2>'
    },
    {
      id: 'paragraph',
      // title: 'Paragraph',
      // description: 'Regular text content',  
      icon: <Text className="h-5 w-5" />,
      preview: <p className="text-gray-700">This is a paragraph of text. You can add your content here.</p>,
      defaultContent: '<p>Start typing your text here...</p>'
    },
    {
      id: 'heading_paragraph',
      // title: 'Heading with Paragraph',
      // description: 'Heading followed by text',
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
      // title: 'Subheading with Paragraph',
      // description: 'Subheading followed by text',
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

  const handleBlockClick = (blockType) => {
    if (blockType.id === 'text') {
      setShowTextTypeSidebar(true);
    } else if (blockType.id === 'video') {
      setShowVideoDialog(true);
    } else if (blockType.id === 'image') {
      setShowImageTemplateSidebar(true);
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
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: contentBlocks.length + 1
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const handleTextTypeSelect = (textType) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type: 'text',
      title: textType.title,
      textType: textType.id,
      content: textType.defaultContent || '',
      order: contentBlocks.length + 1
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setShowTextTypeModal(false);
    setShowTextTypeSidebar(false);
    setSidebarCollapsed(true);
  };

  const removeContentBlock = (blockId) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== blockId));
  };

  const updateBlockContent = (blockId, content, heading = null, subheading = null) => {
    setContentBlocks(blocks =>
      blocks.map(block =>
        block.id === blockId ? {
          ...block,
          content,
          ...(heading !== null && { heading }),
          ...(subheading !== null && { subheading })
        } : block
      )
    );
  };

  const handleEditBlock = (blockId) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (!block) return;
   
    if (block.type === 'text') {
      setCurrentTextBlockId(blockId);
      setShowTextEditorDialog(true);

      // Reset editors
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');

      if (block.textType === 'heading_paragraph') {
        setEditorHeading(block.heading || '');
        setEditorContent(block.content || '');
      } else if (block.textType === 'subheading_paragraph') {
        setEditorSubheading(block.subheading || '');
        setEditorContent(block.content || '');
      } else {
        setEditorHtml(block.content || '');
      }
    } else if (block.type === 'video') {
      setCurrentBlock(block);
      setVideoTitle(block.videoTitle);
      setVideoDescription(block.videoDescription || '');
      setVideoUploadMethod(block.uploadMethod || 'file');
      if (block.uploadMethod === 'url') {
        setVideoUrl(block.originalUrl || block.videoUrl);
        setVideoFile(null);
        setVideoPreview('');
      } else {
        setVideoFile(block.videoFile);
        setVideoPreview(block.videoUrl);
        setVideoUrl('');
      }
      setShowVideoDialog(true);
    } else if (block.type === 'audio') {
      setCurrentBlock(block);
      setAudioTitle(block.audioTitle);
      setAudioDescription(block.audioDescription || '');
      setAudioUploadMethod(block.uploadMethod || 'file');
      if (block.uploadMethod === 'url') {
        setAudioUrl(block.originalUrl || block.audioUrl);
        setAudioFile(null);
        setAudioPreview('');
      } else {
        setAudioFile(block.audioFile);
        setAudioPreview(block.audioUrl);
        setAudioUrl('');
      }
      setShowAudioDialog(true);
    } else if (block.type === 'youtube') {
      setCurrentYoutubeBlock(block);
      setYoutubeTitle(block.youtubeTitle);
      setYoutubeDescription(block.youtubeDescription || '');
      setYoutubeUrl(block.youtubeUrl);
      setShowYoutubeDialog(true);
    } else if (block.type === 'link') {
      setCurrentLinkBlock(block);
      setLinkTitle(block.linkTitle);
      setLinkUrl(block.linkUrl);
      setLinkDescription(block.linkDescription || '');
      setLinkButtonText(block.linkButtonText || 'Visit Link');
      setLinkButtonStyle(block.linkButtonStyle || 'primary');
      setShowLinkDialog(true);
    } else if (block.type === 'image' && block.layout) {
      // Handle image template editing
      setCurrentImageBlock(block);
      setImageTemplateText(block.text || '');
      setImageTemplateUrl(block.imageUrl || '');
      setShowImageEditDialog(true);
    } else if (block.type === 'pdf') {
      setCurrentBlock(block);
      setPdfTitle(block.pdfTitle);
      setPdfDescription(block.pdfDescription || '');
      setPdfUploadMethod(block.uploadMethod || 'file');
      if (block.uploadMethod === 'url') {
        setPdfUrl(block.originalUrl || block.pdfUrl);
        setPdfFile(null);
        setPdfPreview('');
      } else {
        setPdfFile(block.pdfFile);
        setPdfPreview(block.pdfUrl);
        setPdfUrl('');
      }
      setShowPdfDialog(true);
    } else {
      setCurrentBlock(block);
      setEditorContent(block.content || '');
      setEditorHeading(block.heading || '');
      setEditorSubheading(block.subheading || '');
      setEditModalOpen(true);
    }
  };

  const handleEditorSave = () => {
    if (!currentBlock) return;

    let newContent = editorContent;
    if (currentBlock.textType === 'heading-paragraph') {
      newContent = editorHeading + editorContent;
    } else if (currentBlock.textType === 'subheading-paragraph') {
      newContent = editorSubheading + editorContent;
    }

    updateBlockContent(
      currentBlock.id,
      newContent,
      currentBlock.textType === 'heading-paragraph' ? editorHeading : null,
      currentBlock.textType === 'subheading-paragraph' ? editorSubheading : null
    );
    setEditModalOpen(false);
    setCurrentBlock(null);
    setEditorContent('');
    setEditorHeading('');
    setEditorSubheading('');
  };

  const handleDragStart = (e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    if (draggedBlockId === null || draggedBlockId === targetBlockId) return;
    const sourceIndex = contentBlocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = contentBlocks.findIndex(b => b.id === targetBlockId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const updated = [...contentBlocks];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setContentBlocks(updated.map((b, i) => ({ ...b, order: i + 1 })));
    setDraggedBlockId(null);
  };

  const handleSave = async () => {
    const lessonDataToSave = {
      title: lessonTitle,
      contentBlocks,
      status: 'DRAFT',
      lastModified: new Date().toISOString()
    };

    const apiUrl = `https://creditor-backend-testing-branch.onrender.com/api/course/${courseId}/modules/${moduleId}/lesson/create-lesson`;

    try {
      const response = await axios.post(apiUrl, lessonDataToSave);
      alert('Lesson saved as draft successfully!');
    } catch (error) {
      alert('Error saving lesson!');
      console.error(error);
    }
  };

  const handlePreview = () => {
    console.log('Previewing lesson:', { lessonTitle, contentBlocks });
    alert('Preview functionality coming soon!');
  };

  const handleUpdate = () => {
    const lessonDataToUpdate = {
      ...lessonData,
      title: lessonTitle,
      contentBlocks,
      status: 'PUBLISHED',
      lastModified: new Date().toISOString()
    };
   
    console.log('Updating lesson:', lessonDataToUpdate);
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

    const videoBlock = {
      id: currentBlock?.id || `video-${Date.now()}`,
      type: 'video',
      title: 'Video',
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      videoFile: videoUploadMethod === 'file' ? videoFile : null,
      videoUrl: finalVideoUrl,
      uploadMethod: videoUploadMethod,
      originalUrl: videoUploadMethod === 'url' ? videoUrl : null,
      timestamp: new Date().toISOString()
    };

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev => 
        prev.map(block => block.id === currentBlock.id ? videoBlock : block)
      );
    } else {
      // Add new block
      setContentBlocks(prev => [...prev, videoBlock]);
    }
    
    handleVideoDialogClose();
  };

  const handleImageTemplateSelect = (template) => {
    const newBlock = {
      id: `image-${Date.now()}`,
      type: 'image',
      title: template.title,
      layout: template.layout,
      templateType: template.id,
      imageUrl: template.defaultContent.imageUrl,
      text: template.defaultContent.text,
      isEditing: false,
      timestamp: new Date().toISOString()
    };
   
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

  const handleImageFileUpload = (blockId, file) => {
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload only JPG, PNG, GIF, or WebP images');
        return;
      }
     
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
     
      const imageUrl = URL.createObjectURL(file);
      handleImageBlockEdit(blockId, 'imageUrl', imageUrl);
      handleImageBlockEdit(blockId, 'imageFile', file);
    }
  };

  const saveImageTemplateChanges = (blockId) => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, isEditing: false }
          : block
      )
    );
    // You can add additional save logic here (e.g., API call)
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
    const blockToUpdate = contentBlocks.find(b => b.id === currentTextBlockId);

    if (blockToUpdate) {
      let updatedContent = editorHtml;
      if (blockToUpdate.textType === 'heading_paragraph') {
        updatedContent = editorHeading + editorContent;
      } else if (blockToUpdate.textType === 'subheading_paragraph') {
        updatedContent = editorSubheading + editorContent;
      }

      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === currentTextBlockId
            ? {
                ...block,
                title: editorTitle,
                content: updatedContent,
                heading: blockToUpdate.textType === 'heading_paragraph' ? editorHeading : block.heading,
                subheading: blockToUpdate.textType === 'subheading_paragraph' ? editorSubheading : block.subheading,
                updatedAt: new Date().toISOString()
              }
            : block
        )
      );
    } else {
      // This part remains the same for adding new blocks
      const newBlock = {
        id: `text_${Date.now()}`,
        type: 'text',
        title: editorTitle,
        content: editorHtml,
        textType: 'paragraph', // Or determine based on how you add new blocks
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContentBlocks(prev => [...prev, newBlock]);
    }
   
    // Close the dialog and reset form
    handleTextEditorClose();
  };

  const handleTextEditorClose = () => {
    setShowTextEditorDialog(false);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
  };

  const handleImageDialogClose = () => {
    setShowImageDialog(false);
    setImageTitle('');
    setImageDescription('');
    setImageFile(null);
    setImagePreview('');
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

  const handleAddImage = () => {
    if (!imageTitle || !imageFile) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle both File object and string URL cases
    let imageUrl = '';
    if (imageFile && typeof imageFile === 'object' && 'name' in imageFile) {
      // It's a File object
      imageUrl = URL.createObjectURL(imageFile);
    } else if (typeof imageFile === 'string') {
      // It's already a URL string
      imageUrl = imageFile;
    } else if (imagePreview) {
      // Fallback to imagePreview if available
      imageUrl = imagePreview;
    }

    const newBlock = {
      id: currentBlock?.id || `image-${Date.now()}`,
      type: 'image',
      title: 'Image',
      imageTitle: imageTitle,
      imageDescription: imageDescription,
      imageFile: imageFile,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString()
    };

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev =>
        prev.map(block => block.id === currentBlock.id ? newBlock : block)
      );
      setCurrentBlock(null);
    } else {
      // Add new block
      setContentBlocks(prev => [...prev, newBlock]);
    }
   
    handleImageDialogClose();
  };

  const handleEditImage = (blockId) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block) {
      setCurrentBlock(block);
      setImageTitle(block.imageTitle);
      setImageDescription(block.imageDescription || '');
      setImageFile(block.imageFile);
      setImagePreview(block.imageUrl);
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

    const audioBlock = {
      id: currentBlock?.id || `audio-${Date.now()}`,
      type: 'audio',
      title: 'Audio',
      audioTitle: audioTitle,
      audioDescription: audioDescription,
      audioFile: audioUploadMethod === 'file' ? audioFile : null,
      audioUrl: finalAudioUrl,
      uploadMethod: audioUploadMethod,
      originalUrl: audioUploadMethod === 'url' ? audioUrl : null,
      timestamp: new Date().toISOString()
    };

    if (currentBlock) {
      // Update existing block
      setContentBlocks(prev => 
        prev.map(block => block.id === currentBlock.id ? audioBlock : block)
      );
    } else {
      // Add new block
      setContentBlocks(prev => [...prev, audioBlock]);
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

    const newBlock = {
      id: currentYoutubeBlock?.id || `youtube-${Date.now()}`,
      type: 'youtube',
      title: 'YouTube Video',
      youtubeTitle: youtubeTitle,
      youtubeDescription: youtubeDescription,
      youtubeUrl: youtubeUrl,
      youtubeId: videoId,
      timestamp: new Date().toISOString()
    };

    if (currentYoutubeBlock) {
      setContentBlocks(prev =>
        prev.map(block => block.id === currentYoutubeBlock.id ? newBlock : block)
      );
    } else {
      setContentBlocks(prev => [...prev, newBlock]);
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

    const newBlock = {
      id: currentLinkBlock?.id || `link-${Date.now()}`,
      type: 'link',
      title: 'Link',
      linkTitle: linkTitle,
      linkUrl: linkUrl,
      linkDescription: linkDescription,
      linkButtonText: linkButtonText,
      linkButtonStyle: linkButtonStyle,
      timestamp: new Date().toISOString()
    };

    if (currentLinkBlock) {
      setContentBlocks(prev =>
        prev.map(block => block.id === currentLinkBlock.id ? newBlock : block)
      );
    } else {
      setContentBlocks(prev => [...prev, newBlock]);
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

  const handleAddPdf = () => {
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

    // Create PDF URL based on upload method
    let finalPdfUrl = '';
    if (pdfUploadMethod === 'file') {
      finalPdfUrl = URL.createObjectURL(pdfFile);
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
      timestamp: new Date().toISOString()
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
       
        if (location.state?.lessonData) {
          const { title, contentBlocks } = location.state.lessonData;
          setLessonTitle(title);
          setContentBlocks(contentBlocks || []);
          setLessonData(location.state.lessonData);
          setLoading(false);
          return;
        }

        if (lessonId) {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await fetch(
            `https://sharebackend-sdkp.onrender.com/api/course/${courseId}/modules/${moduleId}/lesson/${lessonId}`,
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
          className={`flex-1 transition-all duration-300 ${
            isViewMode
              ? 'ml-0'
              : sidebarCollapsed
                ? 'ml-[calc(4.5rem+16rem)]'
                : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          <div className="w-full max-w-4xl mx-auto px-4 py-4">
            {/* Lesson Builder Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
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
                      <Button size="sm" onClick={handleUpdate}>
                        Update
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Canvas */}
            <div className="py-4">
              {isViewMode ? (
                // View Mode Content
                <div className="max-w-4xl mx-auto">
                  {contentBlocks.map((block, index) => (
                    <div key={block.id} className="mb-8">
                      {block.type === 'text' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                          <div
                            className="prose max-w-none text-gray-700"
                            dangerouslySetInnerHTML={{ __html: block.content }}
                          />
                        </div>
                      )}
                      {block.type === 'video' && (
                        <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200">
                          {/* Video Info and Actions */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{block.videoTitle}</h3>
                                {block.videoDescription && (
                                  <p className="text-gray-600 mt-1 text-sm">{block.videoDescription}</p>
                                )}
                              </div>
                             
                              {!isViewMode && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditBlock(block.id)}
                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                    title="Edit Video"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeContentBlock(block.id)}
                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <div
                                    className="h-8 w-8 flex items-center justify-center text-gray-400 cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, block.id)}
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                         
                          {/* Video Player */}
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
                      )}
                      {block.type === 'pdf' && (
                        <div className="my-6 w-full">
                          <h3 className="text-xl font-semibold mb-2">{block.pdfTitle}</h3>
                          {block.pdfDescription && (
                            <p className="text-gray-600 mb-4">{block.pdfDescription}</p>
                          )}
                          <div className="w-full max-w-4xl mx-auto border rounded-lg overflow-hidden">
                            <iframe
                              src={block.pdfUrl}
                              className="w-full h-[600px]"
                              title={block.pdfTitle || 'PDF Document'}
                            />
                          </div>
                        </div>
                      )}
                      {block.type === 'image' && (
                        <div className="relative group">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditBlock(block.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => removeContentBlock(block.id)}
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
                         
                          {/* Render based on template layout */}
                          {block.layout === 'side-by-side' && (
                            <div className="flex gap-6 items-start">
                              <div className="w-1/2">
                                <img
                                  src={block.imageUrl}
                                  alt="Image"
                                  className="w-full h-auto object-cover rounded-lg"
                                />
                              </div>
                              <div className="w-1/2">
                                <div
                                  className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                                  dangerouslySetInnerHTML={{ __html: block.text }}
                                />
                              </div>
                            </div>
                          )}
                          {block.layout === 'overlay' && (
                            <div className="relative">
                              <img
                                src={block.imageUrl}
                                alt="Image"
                                className="w-full h-96 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center p-8">
                                <div
                                  className="text-white text-center leading-relaxed prose prose-lg max-w-none prose-invert"
                                  dangerouslySetInnerHTML={{ __html: block.text }}
                                />
                              </div>
                            </div>
                          )}
                          {block.layout === 'centered' && (
                            <div className="text-center space-y-6">
                              <img
                                src={block.imageUrl}
                                alt="Image"
                                className="mx-auto h-auto max-w-full object-cover rounded-lg"
                              />
                              <div
                                className="text-gray-600 italic prose prose-lg max-w-none mx-auto"
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            </div>
                          )}
                          {block.layout === 'full-width' && (
                            <div className="space-y-6">
                              <img
                                src={block.imageUrl}
                                alt="Image"
                                className="w-full h-96 object-cover rounded-lg"
                              />
                              <div
                                className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: block.text }}
                              />
                            </div>
                          )}
                         
                          {/* Fallback for old image blocks without layout */}
                          {!block.layout && (
                            <div>
                              <h3 className="text-lg font-semibold mb-2">{block.imageTitle}</h3>
                              {block.imageDescription && (
                                <p className="text-gray-600 mb-4">{block.imageDescription}</p>
                              )}
                              {block.imageUrl && (
                                <div className="mt-2">
                                  <img
                                    src={block.imageUrl}
                                    alt={block.imageTitle}
                                    className="max-w-full h-auto rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {block.type === 'audio' && (
                        <div className="relative group my-6 w-full">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditAudio(block.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => removeContentBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200 cursor-move"
                            >
                              <GripVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{block.audioTitle}</h3>
                          {block.audioDescription && (
                            <p className="text-gray-600 mb-4">{block.audioDescription}</p>
                          )}
                          {block.audioUrl && (
                            <div className="mt-2">
                              <audio
                                src={block.audioUrl}
                                controls
                                className="w-full rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {block.type === 'youtube' && (
                        <div className="relative group my-6 w-full">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditYoutubeVideo(block)}
                              title="Edit Video"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => removeContentBlock(block.id)}
                              title="Remove Video"
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
                         
                          <h3 className="text-xl font-semibold mb-2">{block.youtubeTitle}</h3>
                          {block.youtubeDescription && (
                            <p className="text-gray-600 mb-4">{block.youtubeDescription}</p>
                          )}
                         
                          <div className="w-full max-w-4xl mx-auto">
                            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg">
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
                      {block.type === 'link' && (
                        <div className="relative group my-6 w-full">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditBlock(block.id)}
                              title="Edit Link"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => removeContentBlock(block.id)}
                              title="Remove Link"
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
                         
                          <h3 className="text-xl font-semibold mb-2">{block.linkTitle}</h3>
                          {block.linkDescription && (
                            <p className="text-gray-600 mb-4">{block.linkDescription}</p>
                          )}
                         
                          <div className="w-full max-w-4xl mx-auto">
                            <button
                              onClick={() => window.open(block.linkUrl, '_blank', 'noopener,noreferrer')}
                              className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                block.linkButtonStyle === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                block.linkButtonStyle === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                                block.linkButtonStyle === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                block.linkButtonStyle === 'warning' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                                block.linkButtonStyle === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                block.linkButtonStyle === 'outline' ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' :
                                'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {block.linkButtonText || 'Visit Link'}
                              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      {block.type === 'pdf' && (
                        <div className="relative group my-6 w-full">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditBlock(block.id)}
                              title="Edit PDF"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => removeContentBlock(block.id)}
                              title="Remove PDF"
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
                          
                          <h3 className="text-xl font-semibold mb-2">{block.pdfTitle}</h3>
                          {block.pdfDescription && (
                            <p className="text-gray-600 mb-4">{block.pdfDescription}</p>
                          )}
                          
                          <div className="w-full max-w-4xl mx-auto border rounded-lg overflow-hidden">
                            <iframe
                              src={block.pdfUrl}
                              className="w-full h-[600px]"
                              title={block.pdfTitle || 'PDF Document'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Edit Mode Content
                <div className="space-y-4">
                  {contentBlocks.length === 0 ? (
                    <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                      <div className="text-center">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-2xl">
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Start Building Your Lesson
                          </h2>
                          <p className="text-gray-600 mb-6">
                            Choose content blocks from the sidebar to create engaging learning content.
                          </p>
                          <Button
                            onClick={() => setShowTextTypeModal(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Text Block
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contentBlocks.map((block, index) => (
                        <div
                          key={block.id}
                          className="relative group my-6 border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
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
                         
                          <div className="p-4">
                            {block.type === 'text' && (
                              <div
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: block.content }}
                              />
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

                            {block.type === 'image' && block.layout && (
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
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                handleImageFileUpload(block.id, file);
                                              }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                          />
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
                                        {block.imageUrl && (
                                          <div className="mt-3">
                                            <img
                                              src={block.imageUrl}
                                              alt="Preview"
                                              className="max-w-full h-32 object-cover rounded-md border"
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
                                        modules={{
                                          toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            [{ 'align': [] }],
                                            ['clean']
                                          ]
                                        }}
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
                                        className="px-4 bg-blue-600 hover:bg-blue-700"
                                      >
                                        Save Changes
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
                                            {block.text.substring(0, 60)}...
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
                                            {block.text.substring(0, 50)}...
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
                                          {block.text.substring(0, 40)}...
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
                                          {block.text.substring(0, 60)}...
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
              )}
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
                  placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                  required
                />
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
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {currentTextBlockId ? 'Edit' : 'Add'} Text Block
              {(() => {
                const currentBlock = contentBlocks.find(b => b.id === currentTextBlockId);
                const textType = currentBlock?.textType;
                if (textType) {
                  const textTypeObj = textTypes.find(t => t.id === textType);
                  return textTypeObj ? ` (${textTypeObj.title})` : '';
                }
                return '';
              })()}
            </DialogTitle>
          </DialogHeader>
         
          <div className="flex-1 overflow-y-auto px-1" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="pr-4">
              {(() => {
                const currentBlock = contentBlocks.find(b => b.id === currentTextBlockId);
                const textType = currentBlock?.textType;
               
                // Heading only
                if (textType === 'heading') {
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
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'align': [] }],
                              ['clean']
                            ]
                          }}
                          placeholder="Enter your heading text..."
                          className="flex-1"
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
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white">
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={{
                            toolbar: [
                              [{ 'header': [2, 3, 4, false] }],
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'align': [] }],
                              ['clean']
                            ]
                          }}
                          placeholder="Enter your subheading text..."
                          className="flex-1"
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
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white">
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              [{ 'align': [] }],
                              ['link', 'image'],
                              ['clean']
                            ]
                          }}
                          placeholder="Enter your paragraph text..."
                          className="flex-1"
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
                        <div className="border rounded-md overflow-hidden bg-white" style={{ height: '150px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorHeading}
                            onChange={setEditorHeading}
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'align': [] }],
                                ['clean']
                              ]
                            }}
                            placeholder="Type and format your heading here"
                            style={{ height: '80px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div className="border rounded-md overflow-hidden bg-white" style={{ height: '200px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'align': [] }],
                                ['link', 'image'],
                                ['clean']
                              ]
                            }}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '150px' }}
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
                        <div className="border rounded-md overflow-hidden bg-white" style={{ height: '150px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorSubheading}
                            onChange={setEditorSubheading}
                            modules={{
                              toolbar: [
                                [{ 'header': [2, 3, 4, false] }],
                                ['bold', 'italic', 'underline'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'align': [] }],
                                ['clean']
                              ]
                            }}
                            placeholder="Type and format your subheading here"
                            style={{ height: '80px' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div className="border rounded-md overflow-hidden bg-white" style={{ height: '200px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                [{ 'align': [] }],
                                ['link', 'image'],
                                ['clean']
                              ]
                            }}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '150px' }}
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
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white">
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'align': [] }],
                              ['clean']
                            ]
                          }}
                          placeholder="Edit your table content..."
                          className="flex-1"
                        />
                      </div>
                    </div>
                  );
                }
               
                // Default fallback for new blocks or unknown types
                return (
                  <div className="flex-1 flex flex-col gap-4 h-full">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter block title"
                        required
                      />
                    </div>
                   
                    <div className="flex-1 flex flex-col h-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-white">
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'image'],
                              ['clean']
                            ]
                          }}
                          className="flex-1"
                        />
                      </div>
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
                      modules={{ toolbar: headingToolbar }}
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
                      modules={{ toolbar: paragraphToolbar }}
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
                      modules={{ toolbar: headingToolbar }}
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
                      modules={{ toolbar: paragraphToolbar }}
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
                      modules={{ toolbar: paragraphToolbar }}
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
                      modules={{ toolbar: paragraphToolbar }}
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
                      modules={{ toolbar: paragraphToolbar }}
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
                          <p className="text-white text-xs text-center line-clamp-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={imageDescription}
                onChange={handleImageInputChange}
                className="w-full p-2 border rounded h-24"
                placeholder="Enter image description"
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
                    className="max-w-full h-auto max-h-64 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleImageDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleAddImage} disabled={!imageTitle || !imageFile}>
              Add Image
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
    </>
  );
};

export default LessonBuilder;
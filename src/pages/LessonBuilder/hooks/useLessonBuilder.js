import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { generateBlockId, convertToUnifiedFormat, detectTextType, extractTextContent } from '@/utils/LessonBuilder/blockHelpers';
import { textTypes } from '@/constants/LessonBuilder/textTypes';

export const useLessonBuilder = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Core state
  const [contentBlocks, setContentBlocks] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('Untitled Lesson');
  const [lessonData, setLessonData] = useState(location.state?.lessonData || null);
  const [loading, setLoading] = useState(true);
  const [lessonContent, setLessonContent] = useState(null);
  const [fetchingContent, setFetchingContent] = useState(false);

  // Upload states
  const [imageUploading, setImageUploading] = useState({});
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mainPdfUploading, setMainPdfUploading] = useState(false);

  // Modal states
  const [showTextTypeModal, setShowTextTypeModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showTextEditorDialog, setShowTextEditorDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [showAiImageDialog, setShowAiImageDialog] = useState(false);
  const [showUnifiedPreview, setShowUnifiedPreview] = useState(false);

  // Sidebar states
  const [showImageTemplateSidebar, setShowImageTemplateSidebar] = useState(false);
  const [showTextTypeSidebar, setShowTextTypeSidebar] = useState(false);
  const [showStatementSidebar, setShowStatementSidebar] = useState(false);
  const [showQuoteTemplateSidebar, setShowQuoteTemplateSidebar] = useState(false);

  // Edit states
  const [showImageEditDialog, setShowImageEditDialog] = useState(false);
  const [showQuoteEditDialog, setShowQuoteEditDialog] = useState(false);
  const [showTableComponent, setShowTableComponent] = useState(false);

  // Text editor states
  const [editorTitle, setEditorTitle] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [currentTextBlockId, setCurrentTextBlockId] = useState(null);
  const [currentTextType, setCurrentTextType] = useState(null);

  // Block states
  const [currentBlock, setCurrentBlock] = useState(null);
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [editingQuoteBlock, setEditingQuoteBlock] = useState(null);
  const [editingTableBlock, setEditingTableBlock] = useState(null);
  const [currentImageBlock, setCurrentImageBlock] = useState(null);
  const [currentYoutubeBlock, setCurrentYoutubeBlock] = useState(null);
  const [currentLinkBlock, setCurrentLinkBlock] = useState(null);

  // Media states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploadMethod, setVideoUploadMethod] = useState('file');

  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageTemplateText, setImageTemplateText] = useState('');
  const [imageTemplateUrl, setImageTemplateUrl] = useState('');
  const [selectedImageTemplate, setSelectedImageTemplate] = useState(null);

  const [audioTitle, setAudioTitle] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioUploadMethod, setAudioUploadMethod] = useState('file');

  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkButtonText, setLinkButtonText] = useState('Visit Link');
  const [linkButtonStyle, setLinkButtonStyle] = useState('primary');
  const [linkError, setLinkError] = useState('');

  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUploadMethod, setPdfUploadMethod] = useState('file');

  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [aiImageGenerating, setAiImageGenerating] = useState(false);
  const [generatedAiImage, setGeneratedAiImage] = useState('');

  // Refs
  const blockRefs = useRef({});
  const statementComponentRef = useRef();

  // Block management functions
  const addContentBlock = (blockType, textType = null) => {
    const newBlock = {
      id: generateBlockId(),
      block_id: generateBlockId(),
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };
   
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: [...prevLessonContent.data.content, newBlock]
        }
      }));
    } else {
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  const removeContentBlock = (blockId) => {
    setContentBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    
    if (lessonContent?.data?.content) {
      setLessonContent(prev => ({
        ...prev,
        data: {
          ...prev.data,
          content: prev.data.content.filter(block => block.id !== blockId && block.block_id !== blockId)
        }
      }));
    }
  };

  // Text handling functions
  const handleTextTypeSelect = (textType) => {
    if (contentBlocks.some(block => block.id === generateBlockId())) {
      return;
    }

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

    let innerContent = '';
    if (textType.id === 'heading_paragraph') {
      innerContent = `<h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin-bottom: 1rem;">${heading || 'Heading'}</h1><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the heading.'}</p>`;
    } else if (textType.id === 'subheading_paragraph') {
      innerContent = `<h2 style="font-size: 20px; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">${subheading || 'Subheading'}</h2><p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">${contentHtml || 'This is a paragraph below the subheading.'}</p>`;
    } else if (textType.id === 'master_heading') {
      innerContent = `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 0; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px;">${'Master Heading'}</h1>`;
    } else {
      innerContent = textType.defaultContent || contentHtml;
    }

    const htmlContent = textType.id === 'master_heading' ? innerContent : `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div class="pl-4">
          ${innerContent}
        </div>
      </div>
    `;

    const newBlock = {
      id: generateBlockId(),
      block_id: generateBlockId(),
      type: 'text',
      title: textType.title || 'Text Block',
      textType: textType.id,
      content: contentHtml,
      html_css: htmlContent,
      ...(heading !== null && { heading }),
      ...(subheading !== null && { subheading }),
      order: (lessonContent?.data?.content ? lessonContent.data.content.length : contentBlocks.length) + 1
    };

    setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setShowTextTypeSidebar(false);
  };

  // Conversion functions
  const convertToUnifiedFormatWrapper = () => {
    return convertToUnifiedFormat(contentBlocks, lessonContent, lessonTitle, lessonData);
  };

  // Handle block updates from the unified preview
  const handleBlockUpdate = (blockId, updatedBlock) => {
    console.log('Updating block:', blockId, updatedBlock);
    
    if (contentBlocks && contentBlocks.length > 0) {
      setContentBlocks(prevBlocks => 
        prevBlocks.map(block => 
          (block.id || block.block_id) === blockId 
            ? { ...block, ...updatedBlock }
            : block
        )
      );
    }
    
    if (lessonContent?.data?.content) {
      setLessonContent(prev => ({
        ...prev,
        data: {
          ...prev.data,
          content: prev.data.content.map(block => 
            (block.id || block.block_id) === blockId 
              ? { ...block, ...updatedBlock }
              : block
          )
        }
      }));
    }
  };

  // Handle view action
  const handleView = () => {
    console.log('Viewing lesson:', { lessonTitle, contentBlocks });
    setShowUnifiedPreview(true);
  };

  // Navigation
  const handleBack = () => navigate(-1);

  return {
    // Core state
    contentBlocks,
    setContentBlocks,
    lessonTitle,
    setLessonTitle,
    lessonData,
    setLessonData,
    loading,
    setLoading,
    lessonContent,
    setLessonContent,
    fetchingContent,
    setFetchingContent,

    // Upload states
    imageUploading,
    setImageUploading,
    mainImageUploading,
    setMainImageUploading,
    isUploading,
    setIsUploading,
    mainPdfUploading,
    setMainPdfUploading,

    // Modal states
    showTextTypeModal,
    setShowTextTypeModal,
    editModalOpen,
    setEditModalOpen,
    showTextEditorDialog,
    setShowTextEditorDialog,
    showVideoDialog,
    setShowVideoDialog,
    showImageDialog,
    setShowImageDialog,
    showAudioDialog,
    setShowAudioDialog,
    showYoutubeDialog,
    setShowYoutubeDialog,
    showLinkDialog,
    setShowLinkDialog,
    showPdfDialog,
    setShowPdfDialog,
    showAiImageDialog,
    setShowAiImageDialog,
    showUnifiedPreview,
    setShowUnifiedPreview,

    // Sidebar states
    showImageTemplateSidebar,
    setShowImageTemplateSidebar,
    showTextTypeSidebar,
    setShowTextTypeSidebar,
    showStatementSidebar,
    setShowStatementSidebar,
    showQuoteTemplateSidebar,
    setShowQuoteTemplateSidebar,

    // Edit states
    showImageEditDialog,
    setShowImageEditDialog,
    showQuoteEditDialog,
    setShowQuoteEditDialog,
    showTableComponent,
    setShowTableComponent,

    // Text editor states
    editorTitle,
    setEditorTitle,
    editorHtml,
    setEditorHtml,
    editorHeading,
    setEditorHeading,
    editorSubheading,
    setEditorSubheading,
    editorContent,
    setEditorContent,
    currentTextBlockId,
    setCurrentTextBlockId,
    currentTextType,
    setCurrentTextType,

    // Block states
    currentBlock,
    setCurrentBlock,
    draggedBlockId,
    setDraggedBlockId,
    editingQuoteBlock,
    setEditingQuoteBlock,
    editingTableBlock,
    setEditingTableBlock,
    currentImageBlock,
    setCurrentImageBlock,
    currentYoutubeBlock,
    setCurrentYoutubeBlock,
    currentLinkBlock,
    setCurrentLinkBlock,

    // Media states
    videoTitle,
    setVideoTitle,
    videoDescription,
    setVideoDescription,
    videoFile,
    setVideoFile,
    videoPreview,
    setVideoPreview,
    videoUrl,
    setVideoUrl,
    videoUploadMethod,
    setVideoUploadMethod,

    imageTitle,
    setImageTitle,
    imageDescription,
    setImageDescription,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    imageTemplateText,
    setImageTemplateText,
    imageTemplateUrl,
    setImageTemplateUrl,
    selectedImageTemplate,
    setSelectedImageTemplate,

    audioTitle,
    setAudioTitle,
    audioDescription,
    setAudioDescription,
    audioFile,
    setAudioFile,
    audioPreview,
    setAudioPreview,
    audioUrl,
    setAudioUrl,
    audioUploadMethod,
    setAudioUploadMethod,

    youtubeTitle,
    setYoutubeTitle,
    youtubeDescription,
    setYoutubeDescription,
    youtubeUrl,
    setYoutubeUrl,
    youtubeError,
    setYoutubeError,

    linkTitle,
    setLinkTitle,
    linkUrl,
    setLinkUrl,
    linkDescription,
    setLinkDescription,
    linkButtonText,
    setLinkButtonText,
    linkButtonStyle,
    setLinkButtonStyle,
    linkError,
    setLinkError,

    pdfTitle,
    setPdfTitle,
    pdfDescription,
    setPdfDescription,
    pdfFile,
    setPdfFile,
    pdfPreview,
    setPdfPreview,
    pdfUrl,
    setPdfUrl,
    pdfUploadMethod,
    setPdfUploadMethod,

    aiImagePrompt,
    setAiImagePrompt,
    aiImageGenerating,
    setAiImageGenerating,
    generatedAiImage,
    setGeneratedAiImage,

    // Refs
    blockRefs,
    statementComponentRef,

    // Functions
    addContentBlock,
    removeContentBlock,
    handleTextTypeSelect,
    convertToUnifiedFormatWrapper,
    handleBlockUpdate,
    handleView,
    handleBack,

    // Route params
    courseId,
    moduleId,
    lessonId
  };
};
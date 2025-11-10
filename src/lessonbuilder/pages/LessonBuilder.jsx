import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VideoComponent from '@lessonbuilder/components/blocks/MediaBlocks/VideoComponent';
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
import AIEnhancementPanel from '@lessonbuilder/components/ai/AILessonContentGenerator';
import { toast } from 'react-hot-toast';
import QuoteComponent from '@lessonbuilder/components/blocks/QuoteBlock/QuoteComponent';
import TableComponent from '@lessonbuilder/components/blocks/TableBlock/TableComponent';
import ListComponent from '@lessonbuilder/components/blocks/ListBlock/ListComponent';
import InteractiveComponent from '@lessonbuilder/components/blocks/InteractiveBlock/InteractiveComponent';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import StatementComponent from '@lessonbuilder/components/blocks/StatementBlock/StatementComponent';
import {
  generateLessonContent,
  generateImage,
  enhanceLessonContent,
  generateQuizQuestions,
} from '@/services/openAIService';
import DividerComponent from '@lessonbuilder/components/blocks/Shared/DividerComponent';
import AudioComponent from '@lessonbuilder/components/blocks/MediaBlocks/AudioComponent';
import YouTubeComponent from '@lessonbuilder/components/blocks/MediaBlocks/YouTubeComponent';
import PDFComponent from '@lessonbuilder/components/blocks/DocumentBlocks/PDFComponent';
import LinkComponent from '@lessonbuilder/components/blocks/DocumentBlocks/LinkComponent';
import ImageBlockComponent from '@lessonbuilder/components/blocks/MediaBlocks/ImageBlockComponent';
import TextBlockComponent from '@lessonbuilder/components/blocks/TextBlock/TextBlockComponent';
import InteractiveListRenderer from '@lessonbuilder/components/blocks/ListBlock/InteractiveListRenderer';
import useLessonBlocks from '@lessonbuilder/hooks/useLessonBlocks';
import useLessonDialogs from '@lessonbuilder/hooks/useLessonDialogs';
import useLessonLoader from '@lessonbuilder/hooks/useLessonLoader';
import useLessonAutosave from '@lessonbuilder/hooks/useLessonAutosave';
import {
  injectStyles,
  initializeGlobalFunctions,
} from '@lessonbuilder/utils/styleSheets';
import '@lessonbuilder/utils/quillConfig';
import { getToolbarModules } from '@lessonbuilder/utils/quillConfig';
import { textTypes } from '@lessonbuilder/constants/textTypesConfig';
import { getPlainText } from '@lessonbuilder/utils/blockHelpers';
import { buildLessonUpdatePayload } from '@lessonbuilder/utils/payloadUtils';

// Initialize styles and global functions
injectStyles();
initializeGlobalFunctions();

function LessonBuilder() {
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(SidebarContext);
  const { courseId, moduleId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    contentBlocks,
    setContentBlocks,
    lessonTitle,
    lessonData,
    lessonContent,
    setLessonContent,
    loading,
    fetchingContent,
  } = useLessonLoader({
    courseId,
    moduleId,
    lessonId,
    location,
    navigate,
  });
  const [imageUploading, setImageUploading] = useState({});
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {
    showVideoDialog,
    setShowVideoDialog,
    editingVideoBlock,
    setEditingVideoBlock,
    showTextEditorDialog,
    setShowTextEditorDialog,
    currentTextBlockId,
    setCurrentTextBlockId,
    currentTextType,
    setCurrentTextType,
    showLinkDialog,
    setShowLinkDialog,
    editingLinkBlock,
    setEditingLinkBlock,
    showImageTemplateSidebar,
    setShowImageTemplateSidebar,
    showImageDialog,
    setShowImageDialog,
    showTextTypeSidebar,
    setShowTextTypeSidebar,
    showStatementSidebar,
    setShowStatementSidebar,
    showPdfDialog,
    setShowPdfDialog,
    editingPdfBlock,
    setEditingPdfBlock,
    showQuoteTemplateSidebar,
    setShowQuoteTemplateSidebar,
    showQuoteEditDialog,
    setShowQuoteEditDialog,
    editingQuoteBlock,
    setEditingQuoteBlock,
    showListTemplateSidebar,
    setShowListTemplateSidebar,
    showListEditDialog,
    setShowListEditDialog,
    editingListBlock,
    setEditingListBlock,
    showTableComponent,
    setShowTableComponent,
    editingTableBlock,
    setEditingTableBlock,
    showInteractiveTemplateSidebar,
    setShowInteractiveTemplateSidebar,
    showInteractiveEditDialog,
    setShowInteractiveEditDialog,
    editingInteractiveBlock,
    setEditingInteractiveBlock,
    showDividerTemplateSidebar,
    setShowDividerTemplateSidebar,
    showAudioDialog,
    setShowAudioDialog,
    editingAudioBlock,
    setEditingAudioBlock,
    showYouTubeDialog,
    setShowYouTubeDialog,
    editingYouTubeBlock,
    setEditingYouTubeBlock,
    showInsertBlockDialog,
    setShowInsertBlockDialog,
    editorContent,
    setEditorContent,
    editorHeading,
    setEditorHeading,
    editorSubheading,
    setEditorSubheading,
  } = useLessonDialogs();

  // Inline block insertion state
  const [insertionPosition, setInsertionPosition] = useState(null);

  const listComponentRef = React.useRef();
  const statementComponentRef = React.useRef();
  const quoteComponentRef = React.useRef();
  const dividerComponentRef = React.useRef();
  const imageBlockComponentRef = React.useRef();

  const contentBlockTypes = [
    { id: 'text', title: 'Text', icon: <FileTextIcon className="h-5 w-5" /> },
    {
      id: 'statement',
      title: 'Statement',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    { id: 'quote', title: 'Quote', icon: <Quote className="h-5 w-5" /> },
    { id: 'image', title: 'Image', icon: <Image className="h-5 w-5" /> },
    { id: 'youtube', title: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
    { id: 'video', title: 'Video', icon: <Video className="h-5 w-5" /> },
    { id: 'audio', title: 'Audio', icon: <Volume2 className="h-5 w-5" /> },
    { id: 'link', title: 'Link', icon: <LinkIcon className="h-5 w-5" /> },
    { id: 'pdf', title: 'PDF', icon: <FileTextIcon className="h-5 w-5" /> },
    { id: 'list', title: 'List', icon: <List className="h-5 w-5" /> },
    { id: 'tables', title: 'Tables', icon: <Table className="h-5 w-5" /> },
    {
      id: 'interactive',
      title: 'Interactive',
      icon: <Layers className="h-5 w-5" />,
    },
    { id: 'divider', title: 'Divider', icon: <Minus className="h-5 w-5" /> },
  ];

  const {
    addContentBlock,
    insertContentBlockAt,
    handleStatementSelect,
    handleStatementEdit,
    handleQuoteTemplateSelect,
    handleTableTemplateSelect,
    handleInteractiveTemplateSelect,
    handleInteractiveUpdate,
    handleDividerTemplateSelect,
    handleDividerUpdate,
    handleListTemplateSelect,
    handleListUpdate,
    handleCheckboxToggle,
    handleQuoteUpdate,
    handleAudioUpdate,
    handleYouTubeUpdate,
    handleVideoUpdate,
    handleTableUpdate,
    removeContentBlock,
    updateBlockContent,
    handleEditBlock,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleImageTemplateSelect,
    handleImageUpdate,
    toggleImageBlockEditing,
    handleImageFileUpload,
    handleImageBlockEdit,
    saveImageTemplateChanges,
    handleInlineImageFileUpload,
    handleLinkUpdate,
    handlePdfUpdate,
  } = useLessonBlocks({
    contentBlocks,
    setContentBlocks,
    lessonContent,
    setLessonContent,
    insertionPosition,
    setInsertionPosition,
    editingAudioBlock,
    setEditingAudioBlock,
    editingVideoBlock,
    setEditingVideoBlock,
    editingYouTubeBlock,
    setEditingYouTubeBlock,
    editingTableBlock,
    setEditingTableBlock,
    editingListBlock,
    setEditingListBlock,
    editingQuoteBlock,
    setEditingQuoteBlock,
    editingInteractiveBlock,
    setEditingInteractiveBlock,
    editingLinkBlock,
    setEditingLinkBlock,
    editingPdfBlock,
    setEditingPdfBlock,
    setShowDividerTemplateSidebar,
    setShowTableComponent,
    setShowListEditDialog,
    setShowQuoteEditDialog,
    setShowInteractiveEditDialog,
    setShowAudioDialog,
    setShowYouTubeDialog,
    setShowVideoDialog,
    setShowPdfDialog,
    setShowLinkDialog,
    setShowListTemplateSidebar,
    setShowQuoteTemplateSidebar,
    setShowInteractiveTemplateSidebar,
    setShowImageTemplateSidebar,
    setShowImageDialog,
    setShowStatementSidebar,
    setShowTextTypeSidebar,
    setShowTextEditorDialog,
    setCurrentTextBlockId,
    setCurrentTextType,
    listComponentRef,
    statementComponentRef,
    quoteComponentRef,
    dividerComponentRef,
    imageBlockComponentRef,
    imageUploading,
    setImageUploading,
    draggedBlockId,
    setDraggedBlockId,
  });

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

  const handlePreview = () => {
    navigate(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`
    );
  };

  const handleUpdate = async () => {
    if (!lessonId) {
      toast.error('No lesson ID found. Please save the lesson first.');
      return;
    }

    try {
      setIsUploading(true);
      setAutoSaveStatus('saving');

      const { lessonDataToUpdate, payloadSize, blocksCount } =
        buildLessonUpdatePayload({
          lessonId,
          contentBlocks,
          lessonContent,
        });

      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);

      if (payloadSize > 10 * 1024 * 1024) {
        toast.warning(
          `⚠️ Large content detected (${payloadSizeMB}MB). If save fails, contact your administrator to increase server limits.`,
          { duration: 6000 }
        );
      } else if (payloadSize > 5 * 1024 * 1024) {
        console.warn(
          '⚠️ Large payload detected:',
          payloadSizeMB,
          'MB - May need higher backend limits'
        );
      }

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `${baseUrl}/api/lessoncontent/update/${lessonId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lessonDataToUpdate),
        }
      );

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.warn('Response body was not JSON:', jsonError);
      }

      if (!response.ok) {
        let errorMessage = 'Failed to update lesson content';

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
        } else if (responseData?.errorMessage) {
          errorMessage = responseData.errorMessage;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (response.statusText) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      console.debug('Lesson content updated', {
        lessonId,
        payloadSizeMB,
        blocksCount,
      });

      const isManualSave = autoSaveStatus === 'error';
      toast.success(
        isManualSave
          ? 'Changes saved successfully!'
          : 'Lesson updated successfully!'
      );
      setAutoSaveStatus('saved');
      setHasUnsavedChanges(false);

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

      let errorMessage = 'Failed to update lesson. Please try again.';

      if (error.message === 'PAYLOAD_TOO_LARGE') {
        errorMessage =
          '⚠️ Content size exceeds server limit. The backend server needs to increase its payload limit. Please contact your system administrator to increase the Express body parser limit (typically in server configuration: app.use(express.json({ limit: "50mb" }))).';
        console.error('PAYLOAD TOO LARGE - Backend configuration needed');
      } else if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        console.log('Server error response:', { status, data: responseData });

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
        console.log('Network error - no response received:', error.request);
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message) {
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

  useLessonAutosave({
    lessonId,
    contentBlocks,
    lessonContent,
    loading,
    fetchingContent,
    handleUpdate,
    setAutoSaveStatus,
    setHasUnsavedChanges,
  });

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
                                (() => {
                                  // Debug logging for image blocks
                                  console.log('🖼️ Image block detected:', {
                                    id: block.id || block.block_id,
                                    hasImageUrl: !!block.imageUrl,
                                    imageUrl: block.imageUrl,
                                    hasDefaultContent:
                                      !!block.defaultContent?.imageUrl,
                                    title: block.title,
                                    alignment: block.alignment,
                                    layout: block.layout,
                                  });
                                  return (
                                    block.imageUrl ||
                                    block.defaultContent?.imageUrl
                                  );
                                })() && (
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
                                            modules={getToolbarModules('image')}
                                            formats={[
                                              'font',
                                              'size',
                                              'bold',
                                              'italic',
                                              'underline',
                                              'color',
                                              'list',
                                            ]}
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
                                      /* Display Mode */
                                      (() => {
                                        const rawCaptionHtml =
                                          (block.text &&
                                            block.text.toString()) ||
                                          (block.details?.caption_html &&
                                            block.details.caption_html.toString()) ||
                                          '';
                                        const fallbackCaption =
                                          (block.imageDescription &&
                                            block.imageDescription.toString()) ||
                                          (block.details?.caption &&
                                            block.details.caption.toString()) ||
                                          '';
                                        const captionMarkup =
                                          rawCaptionHtml &&
                                          rawCaptionHtml.trim()
                                            ? rawCaptionHtml
                                            : fallbackCaption;

                                        const captionElement = (
                                          <div
                                            className="text-sm text-gray-600 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                                            dangerouslySetInnerHTML={{
                                              __html: captionMarkup,
                                            }}
                                          />
                                        );

                                        if (block.layout === 'side-by-side') {
                                          return (
                                            <div className="flex gap-3 items-start">
                                              {block.alignment === 'right' ? (
                                                <>
                                                  <div className="w-1/2">
                                                    {captionElement}
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
                                                <>
                                                  <div className="w-1/2">
                                                    <img
                                                      src={block.imageUrl}
                                                      alt="Image"
                                                      className="w-full h-20 object-cover rounded"
                                                    />
                                                  </div>
                                                  <div className="w-1/2">
                                                    {captionElement}
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          );
                                        }

                                        if (block.layout === 'overlay') {
                                          return (
                                            <div className="relative">
                                              <img
                                                src={block.imageUrl}
                                                alt="Image"
                                                className="w-full h-24 object-cover rounded"
                                              />
                                              {captionMarkup && (
                                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded flex items-center justify-center p-2 text-white text-sm text-center">
                                                  <div
                                                    className="space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                                                    dangerouslySetInnerHTML={{
                                                      __html: captionMarkup,
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }

                                        if (block.layout === 'centered') {
                                          return (
                                            <div
                                              className={`space-y-3 ${block.alignment === 'left' ? 'text-left' : block.alignment === 'right' ? 'text-right' : 'text-center'}`}
                                            >
                                              <img
                                                src={block.imageUrl}
                                                alt="Image"
                                                className={`h-20 object-cover rounded ${block.alignment === 'center' ? 'mx-auto' : ''}`}
                                              />
                                              {captionMarkup && (
                                                <div
                                                  className="text-sm text-gray-600 italic leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                                                  dangerouslySetInnerHTML={{
                                                    __html: captionMarkup,
                                                  }}
                                                />
                                              )}
                                            </div>
                                          );
                                        }

                                        return (
                                          <div className="space-y-3">
                                            <img
                                              src={block.imageUrl}
                                              alt="Image"
                                              className="w-full h-24 object-cover rounded"
                                            />
                                            {captionMarkup && (
                                              <div
                                                className="text-sm text-gray-600 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                                                dangerouslySetInnerHTML={{
                                                  __html: captionMarkup,
                                                }}
                                              />
                                            )}
                                          </div>
                                        );
                                      })()
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

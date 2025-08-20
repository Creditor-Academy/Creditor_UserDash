import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowLeft, Plus, FileText, Eye, Pencil, Trash2, GripVertical, 
  Volume2, Play, Youtube, Link2, File, BookOpen, Image, Video, 
  HelpCircle, FileText as FileTextIcon, File as FileIcon, Box, Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeDescription, setYoutubeDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState('');
  const [currentYoutubeBlock, setCurrentYoutubeBlock] = useState(null);

  const blockRefs = React.useRef({});

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

  const handleBlockClick = (blockType) => {
    if (blockType.id === 'text') {
      handleTextEditorOpen();
    } else if (blockType.id === 'video') {
      setShowVideoDialog(true);
    } else if (blockType.id === 'image') {
      setShowImageDialog(true);
    } else if (blockType.id === 'audio') {
      setShowAudioDialog(true);
    } else if (blockType.id === 'youtube') {
      setShowYoutubeDialog(true);
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
    addContentBlock({ id: 'text', title: 'Text' }, textType.id);
    setShowTextTypeModal(false);
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
      setEditorTitle(block.title);
      setEditorHtml(block.content);
      setShowTextEditorDialog(true);
    } else if (block.type === 'youtube') {
      setCurrentYoutubeBlock(block);
      setYoutubeTitle(block.youtubeTitle);
      setYoutubeDescription(block.youtubeDescription || '');
      setYoutubeUrl(block.youtubeUrl);
      setShowYoutubeDialog(true);
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
    updateBlockContent(
      currentBlock.id,
      editorContent,
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
      }
    }
  };

  const handleAddVideo = () => {
    if (!videoTitle || !videoFile) {
      alert('Please fill in all required fields');
      return;
    }

    // Create a URL for the video file
    const videoUrl = URL.createObjectURL(videoFile);

    const newBlock = {
      id: `video-${Date.now()}`,
      type: 'video',
      title: 'Video',
      videoTitle: videoTitle,
      videoDescription: videoDescription,
      videoFile: videoFile,
      videoUrl: videoUrl, // Add the object URL for preview
      timestamp: new Date().toISOString()
    };

    setContentBlocks(prev => [...prev, newBlock]);
    handleVideoDialogClose();
  };

  const handleTextEditorOpen = () => {
    setShowTextEditorDialog(true);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
  };

  const handleTextEditorClose = () => {
    setShowTextEditorDialog(false);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
  };

  const handleTextEditorSave = () => {
    if (!editorTitle.trim()) {
      alert('Please enter a title for the text block');
      return;
    }

    if (currentTextBlockId) {
      // Update existing block
      setContentBlocks(blocks => 
        blocks.map(block => 
          block.id === currentTextBlockId 
            ? { ...block, title: editorTitle, content: editorHtml }
            : block
        )
      );
    } else {
      // Add new block
      const newBlock = {
        id: `block_${Date.now()}`,
        type: 'text',
        title: editorTitle,
        content: editorHtml,
        order: contentBlocks.length + 1
      };
      setContentBlocks([...contentBlocks, newBlock]);
    }
    
    handleTextEditorClose();
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
    }
  };

  const handleAddAudio = () => {
    if (!audioTitle || !audioFile) {
      alert('Please fill in all required fields');
      return;
    }

    // Handle both File object and string URL cases
    let audioUrl = '';
    if (audioFile && typeof audioFile === 'object' && 'name' in audioFile) {
      // It's a File object
      audioUrl = URL.createObjectURL(audioFile);
    } else if (typeof audioFile === 'string') {
      // It's already a URL string
      audioUrl = audioFile;
    } else if (audioPreview) {
      // Fallback to audioPreview if available
      audioUrl = audioPreview;
    }

    const newBlock = {
      id: currentBlock?.id || `audio-${Date.now()}`,
      type: 'audio',
      title: 'Audio',
      audioTitle: audioTitle,
      audioDescription: audioDescription,
      audioFile: audioFile,
      audioUrl: audioUrl,
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
                      {block.type === 'text' && block.textType === 'heading-paragraph' && block.heading && (
                        <h1 className="text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: block.heading }} />
                      )}
                      {block.type === 'text' && block.textType === 'subheading-paragraph' && block.subheading && (
                        <h2 className="text-2xl font-semibold mb-3" dangerouslySetInnerHTML={{ __html: block.subheading }} />
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
                                    title="Remove Video"
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
                          <div className="relative pt-[56.25%] bg-black">
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
                      {block.type === 'image' && (
                        <div className="relative group">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                              onClick={() => handleEditImage(block.id)}
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
                      {block.type === 'audio' && (
                        <div className="relative group">
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      {block.content && (
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Edit Mode Content
                <>
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
                        <Card 
                          key={block.id} 
                          className="border border-gray-200"
                          draggable
                          onDragStart={(e) => handleDragStart(e, block.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, block.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {block.title}
                                </Badge>
                                <span className="text-sm text-gray-500">Block {index + 1}</span>
                              </div>
                              {/* <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="cursor-move"
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditBlock(block.id)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeContentBlock(block.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Remove"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div> */}
                            </div>
                            
                            {block.type && (
                              <div>
                                {block.textType === 'heading-paragraph' && block.heading && (
                                  <div className="space-y-3">
                                    <div
                                      className="prose"
                                      dangerouslySetInnerHTML={{ __html: block.heading }}
                                    />
                                    <div
                                      className="prose"
                                      dangerouslySetInnerHTML={{ __html: block.content }}
                                    />
                                  </div>
                                )}
                                {block.textType === 'subheading-paragraph' && block.subheading && (
                                  <div className="space-y-3">
                                    <div
                                      className="prose"
                                      dangerouslySetInnerHTML={{ __html: block.subheading }}
                                    />
                                    <div
                                      className="prose"
                                      dangerouslySetInnerHTML={{ __html: block.content }}
                                    />
                                  </div>
                                )}
                                {block.textType === 'paragraph' && (
                                  <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
                                )}
                                {(block.type === 'statement' || block.type === 'quote') && (
                                  <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
                                )}
                                {block.type === 'list' && (
                                  <div
                                    className="prose"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
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
                                              title="Remove Video"
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
                                    <div className="relative pt-[56.25%] bg-black">
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
                                {block.type === 'image' && (
                                  <div className="relative group">
                                    <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                                        onClick={() => handleEditImage(block.id)}
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
                                {block.type === 'audio' && (
                                  <div className="relative group">
                                    <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                  <div className="relative group my-6">
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
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
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
            <p className="text-sm text-gray-500">Upload a video file (MP4, WebM, or OGG, max 50MB)</p>
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
                  <p className="text-xs text-gray-500">MP4, WebM, or OGG up to 50MB</p>
                </div>
              </div>
              {videoPreview && (
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
              disabled={!videoTitle || !videoFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Editor Dialog */}
      <Dialog open={showTextEditorDialog} onOpenChange={handleTextEditorClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTextBlockId ? 'Edit Text Block' : 'Add Text Block'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a title for this text block"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <div className="border border-gray-300 rounded-md">
                <ReactQuill
                  theme="snow"
                  value={editorHtml}
                  onChange={setEditorHtml}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'indent': '-1'}, { 'indent': '+1' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  placeholder="Start typing your content here..."
                  style={{ height: '300px' }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleTextEditorClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleTextEditorSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!editorTitle.trim()}
            >
              {currentTextBlockId ? 'Update' : 'Add'} Text Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Block Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {currentBlock?.title}
            </DialogTitle>
          </DialogHeader>
          {currentBlock && (
            <div className="space-y-4">
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
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Audio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={audioTitle}
                onChange={handleAudioInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter audio title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={audioDescription}
                onChange={handleAudioInputChange}
                className="w-full p-2 border rounded h-24"
                placeholder="Enter audio description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File <span className="text-red-500">*</span>
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
                        accept="audio/mpeg, audio/wav, audio/ogg"
                        onChange={handleAudioInputChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP3, WAV, OGG up to 20MB
                  </p>
                </div>
              </div>
              {audioPreview && (
                <div className="mt-4">
                  <audio 
                    src={audioPreview}
                    controls
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAudioDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleAddAudio} disabled={!audioTitle || !audioFile}>
              Add Audio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={showYoutubeDialog} onOpenChange={handleYoutubeDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
            <p className="text-sm text-gray-500">Add a YouTube video by pasting its URL</p>
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
    </>
  );
};

export default LessonBuilder;
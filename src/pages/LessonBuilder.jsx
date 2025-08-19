import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, FileText, Eye, Pencil, Trash2, GripVertical, Volume2, Play, Youtube, Link2, Package } from 'lucide-react';
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

  const blockRefs = React.useRef({});

  // const textTypeOptions = [
  //   {
  //     id: 'paragraph',
  //     title: 'Paragraph',
  //     description: 'Simple text paragraph',
  //     icon: <FileText className="h-6 w-6 text-blue-600" />,
  //     preview: 'This is a sample paragraph text that would appear in your lesson content.'
  //   },
  //   {
  //     id: 'heading-paragraph',
  //     title: 'Heading + Paragraph',
  //     description: 'Main heading with content',
  //     icon: <div className="h-6 w-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">H1</div>,
  //     preview: (
  //       <div>
  //         <div className="text-xl font-bold mb-2">Main Heading</div>
  //         <div>Content paragraph goes here.</div>
  //       </div>
  //     )
  //   },
  //   {
  //     id: 'subheading-paragraph',
  //     title: 'Subheading + Paragraph',
  //     description: 'Subheading with content',
  //     icon: <div className="h-6 w-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">H2</div>,
  //     preview: (
  //       <div>
  //         <div className="text-lg font-semibold mb-2">Subheading</div>
  //         <div>Content paragraph goes here.</div>
  //       </div>
  //     )
  //   }
  // ];

  const contentBlockTypes = [
    {
      id: 'text',
      title: 'Text/HTML',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'image',
      title: 'Image',
      icon: <Volume2 className="h-5 w-5" />
    },
    {
      id: 'video',
      title: 'Video',
      icon: <Play className="h-5 w-5" />
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
      id: 'pdf',
      title: 'PDF',
      icon: <Package className="h-5 w-5" />
    },
    {
      id: 'link',
      title: 'Link',
      icon: <Link2 className="h-5 w-5" />
    },
    {
      id: 'scorm',
      title: 'Scorm',
      icon: <Package className="h-5 w-5" />
    }
  ];

  const handleBlockClick = (blockType) => {
    if (blockType.id === 'text') {
      setShowTextTypeModal(true);
    } else if (blockType.id === 'video') {
      setShowVideoDialog(true);
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
    setCurrentBlock(block);
    setEditorContent(block.content || '');
    setEditorHeading(block.heading || '');
    setEditorSubheading(block.subheading || '');
    setEditModalOpen(true);
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
            className="fixed top-16 h-[calc(100vh-4rem)] z-20 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-64 flex-shrink-0"
            style={{
              left: sidebarCollapsed ? "4.5rem" : "17rem"
            }}
          >
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h1 className="text-lg font-semibold text-gray-900">Content Library</h1>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {contentBlockTypes.map((blockType) => (
                  <Card 
                    key={blockType.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 h-24 flex flex-col"
                    onClick={() => handleBlockClick(blockType)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-2 h-full">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                        {blockType.icon}
                      </div>
                      <h3 className="text-xs font-medium text-gray-900 text-center">{blockType.title}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

      {/* Text Type Selection Modal */}
      {/* <Dialog open={showTextTypeModal} onOpenChange={setShowTextTypeModal}> */}
        {/* <DialogContent className="sm:max-w-2xl"> */}
          {/* <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Choose Text Type</DialogTitle>
            </div>
          </DialogHeader> */}
          
          {/* <div className="grid gap-4 mt-4">
            {textTypeOptions.map((option) => (
              <Card 
                key={option.id}
                className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                onClick={() => handleTextTypeSelect(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{option.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                        {option.preview}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div> */}
        {/* </DialogContent> */}
      {/* </Dialog> */}

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
    </>
  );
};

export default LessonBuilder;
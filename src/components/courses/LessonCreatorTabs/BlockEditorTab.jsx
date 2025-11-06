import React, { useState, useEffect } from 'react';
import {
  Square,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Type,
  Image as ImageIcon,
  Video,
  AudioLines,
  Link as LinkIcon,
  Table,
  Quote,
  FileText,
  Youtube,
  Box,
  Layers,
  RefreshCw,
  Heading1,
  AlertCircle,
  List,
  CheckSquare,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { contentBlockTypes } from '@/constants/LessonBuilder/blockTypes';

// Icon mapping helper
const getIconComponent = iconName => {
  const iconMap = {
    Type: Type,
    Heading1: Heading1,
    FileText: FileText,
    Quote: Quote,
    Image: ImageIcon,
    Video: Video,
    AudioLines: AudioLines,
    Youtube: Youtube,
    Link: LinkIcon,
    Table: Table,
    Box: Box,
    AlertCircle: AlertCircle,
    List: List,
    CheckSquare: CheckSquare,
  };

  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
};

const BlockEditorTab = ({
  lessons,
  contentBlocks,
  setContentBlocks,
  editingLessonId,
  setEditingLessonId,
  onContentSync = () => {},
  syncSettings = { syncAcrossModules: false },
}) => {
  const [selectedBlockType, setSelectedBlockType] = useState(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(true);
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const currentLesson = lessons.find(l => l.id === editingLessonId);
  const currentBlocks = contentBlocks[editingLessonId] || [];

  // Auto-initialize content blocks when a lesson is selected
  useEffect(() => {
    if (editingLessonId && currentLesson) {
      if (currentBlocks.length === 0) {
        // Initialize with a default text block if no blocks exist
        const defaultBlock = {
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'text',
          content:
            currentLesson.content || 'Start adding your lesson content here...',
          order: 1,
          settings: {},
        };

        setContentBlocks(prev => ({
          ...prev,
          [editingLessonId]: [defaultBlock],
        }));

        console.log(
          '🧩 Initialized default block for lesson:',
          currentLesson.title
        );
      } else {
        console.log(
          '📝 Editing lesson with',
          currentBlocks.length,
          'existing blocks:',
          currentLesson.title
        );
      }
    }
  }, [editingLessonId, currentLesson, currentBlocks.length, setContentBlocks]);

  // Add a content block to the current lesson
  const addContentBlock = blockType => {
    if (!editingLessonId) {
      console.warn('⚠️ Cannot add block: No lesson selected');
      return;
    }

    const newBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: blockType.id,
      content: getDefaultContent(blockType.id),
      order: currentBlocks.length + 1,
      settings: {},
      createdAt: new Date().toISOString(),
    };

    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: [...currentBlocks, newBlock],
    }));

    setSelectedBlockType(null);

    console.log('➕ Added new block:', {
      type: blockType.id,
      lessonId: editingLessonId,
      totalBlocks: currentBlocks.length + 1,
    });

    // Trigger content sync callback
    if (onContentSync) {
      onContentSync({
        type: 'block_add',
        lessonId: editingLessonId,
        blockType: blockType.id,
        blockId: newBlock.id,
      });
    }
  };

  // Get default content for a block type
  const getDefaultContent = type => {
    switch (type) {
      case 'text':
        return '<p>Start typing your content here...</p>';
      case 'heading':
        return '<h2>Your Heading Here</h2>';
      case 'statement':
        return '<div class="bg-blue-50 border-l-4 border-blue-400 p-4"><p><strong>Important:</strong> Add your key statement here.</p></div>';
      case 'quote':
        return '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">"Add your quote here..."</blockquote>';
      case 'image':
        return { url: '', alt: 'Image', caption: '', width: '100%' };
      case 'video':
        return { url: '', title: 'Video', autoplay: false, controls: true };
      case 'audio':
        return { url: '', title: 'Audio', controls: true };
      case 'youtube':
        return {
          url: '',
          title: 'YouTube Video',
          width: '100%',
          height: '315',
        };
      case 'link':
        return {
          url: '',
          text: 'Link text',
          description: '',
          openInNewTab: true,
        };
      case 'pdf':
        return { url: '', title: 'PDF Document', height: '600px' };
      case 'table':
        return '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Header 1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Header 2</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><tr><td class="px-6 py-4">Cell 1</td><td class="px-6 py-4">Cell 2</td></tr></tbody></table>';
      case 'scorm':
        return {
          packageUrl: '',
          title: 'SCORM Package',
          width: '100%',
          height: '600px',
        };
      default:
        return '';
    }
  };

  // Update a content block
  const updateContentBlock = (blockId, content, settings = {}) => {
    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: prev[editingLessonId].map(block =>
        block.id === blockId
          ? {
              ...block,
              content,
              settings: { ...block.settings, ...settings },
              updatedAt: new Date().toISOString(),
            }
          : block
      ),
    }));

    // Trigger content sync callback if provided
    if (onContentSync) {
      onContentSync({
        type: 'block_update',
        lessonId: editingLessonId,
        blockId,
        content,
        settings,
      });
    }
  };

  // Delete a content block with professional confirmation
  const deleteContentBlock = blockId => {
    const block = currentBlocks.find(b => b.id === blockId);
    setBlockToDelete({ id: blockId, type: block?.type || 'block' });
    setShowDeleteDialog(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (blockToDelete) {
      setContentBlocks(prev => ({
        ...prev,
        [editingLessonId]: prev[editingLessonId].filter(
          block => block.id !== blockToDelete.id
        ),
      }));
      setSelectedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockToDelete.id);
        return newSet;
      });
    }
    setShowDeleteDialog(false);
    setBlockToDelete(null);
  };

  // Bulk delete selected blocks
  const bulkDeleteBlocks = () => {
    if (selectedBlocks.size === 0) return;

    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: prev[editingLessonId].filter(
        block => !selectedBlocks.has(block.id)
      ),
    }));

    setSelectedBlocks(new Set());
    setBulkDeleteMode(false);
  };

  // Toggle block selection
  const toggleBlockSelection = blockId => {
    setSelectedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  // Select all blocks
  const selectAllBlocks = () => {
    setSelectedBlocks(new Set(currentBlocks.map(block => block.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedBlocks(new Set());
    setBulkDeleteMode(false);
  };

  // Duplicate content block
  const duplicateContentBlock = blockId => {
    const blockToDuplicate = currentBlocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}-${Math.random()}`,
        order: currentBlocks.length + 1,
      };

      setContentBlocks(prev => ({
        ...prev,
        [editingLessonId]: [...prev[editingLessonId], duplicatedBlock],
      }));
    }
  };

  // Move content block up/down
  const moveContentBlock = (blockId, direction) => {
    const currentIndex = currentBlocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentBlocks.length) return;

    const newBlocks = [...currentBlocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[currentIndex],
    ];

    setContentBlocks(prev => ({
      ...prev,
      [editingLessonId]: newBlocks,
    }));
  };

  // Render content block based on type
  const renderContentBlock = block => {
    switch (block.type) {
      case 'text':
        return (
          <div className="p-4 space-y-3">
            <div>
              <Label
                htmlFor={`text-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Text Content
              </Label>
              <Textarea
                id={`text-${block.id}`}
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '')
                    : ''
                }
                onChange={e => updateContentBlock(block.id, e.target.value)}
                className="w-full min-h-[120px] mt-1 resize-none"
                placeholder="Enter your text content here. You can use rich formatting..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`bold-${block.id}`}
                checked={block.settings?.bold || false}
                onCheckedChange={checked =>
                  updateContentBlock(block.id, block.content, { bold: checked })
                }
              />
              <Label htmlFor={`bold-${block.id}`} className="text-sm">
                Bold text
              </Label>
            </div>
          </div>
        );
      case 'heading':
        return (
          <div className="p-4 space-y-3">
            <div>
              <Label
                htmlFor={`heading-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Heading Text
              </Label>
              <Input
                id={`heading-${block.id}`}
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '')
                    : ''
                }
                onChange={e => updateContentBlock(block.id, e.target.value)}
                className="w-full mt-1 text-lg font-semibold"
                placeholder="Enter your heading..."
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor={`level-${block.id}`} className="text-sm">
                  Level:
                </Label>
                <select
                  id={`level-${block.id}`}
                  value={block.settings?.level || 'h2'}
                  onChange={e =>
                    updateContentBlock(block.id, block.content, {
                      level: e.target.value,
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="h1">H1</option>
                  <option value="h2">H2</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`center-${block.id}`}
                  checked={block.settings?.centered || false}
                  onCheckedChange={checked =>
                    updateContentBlock(block.id, block.content, {
                      centered: checked,
                    })
                  }
                />
                <Label htmlFor={`center-${block.id}`} className="text-sm">
                  Center align
                </Label>
              </div>
            </div>
          </div>
        );
      case 'statement':
        return (
          <div className="p-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <textarea
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '')
                    : ''
                }
                onChange={e =>
                  updateContentBlock(
                    block.id,
                    `<div class="bg-blue-50 border-l-4 border-blue-400 p-4"><p><strong>Important:</strong> ${e.target.value}</p></div>`
                  )
                }
                className="w-full min-h-[60px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
                placeholder="Enter your important statement..."
              />
            </div>
          </div>
        );
      case 'quote':
        return (
          <div className="p-4">
            <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
              <textarea
                value={
                  typeof block.content === 'string'
                    ? block.content.replace(/<[^>]*>/g, '').replace(/"/g, '')
                    : ''
                }
                onChange={e =>
                  updateContentBlock(
                    block.id,
                    `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">"${e.target.value}"</blockquote>`
                  )
                }
                className="w-full min-h-[60px] p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white italic resize-none"
                placeholder="Enter your quote..."
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor={`img-url-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Image URL
                  </Label>
                  <Input
                    id={`img-url-${block.id}`}
                    type="url"
                    value={block.content?.url || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        url: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`img-alt-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Alt Text (for accessibility)
                  </Label>
                  <Input
                    id={`img-alt-${block.id}`}
                    value={block.content?.alt || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        alt: e.target.value,
                      })
                    }
                    placeholder="Describe the image"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`img-caption-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Caption (optional)
                  </Label>
                  <Input
                    id={`img-caption-${block.id}`}
                    value={block.content?.caption || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        caption: e.target.value,
                      })
                    }
                    placeholder="Image caption"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label
                      htmlFor={`img-width-${block.id}`}
                      className="text-sm"
                    >
                      Width:
                    </Label>
                    <select
                      id={`img-width-${block.id}`}
                      value={block.content?.width || '100%'}
                      onChange={e =>
                        updateContentBlock(block.id, {
                          ...block.content,
                          width: e.target.value,
                        })
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="25%">25%</option>
                      <option value="50%">50%</option>
                      <option value="75%">75%</option>
                      <option value="100%">100%</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`img-center-${block.id}`}
                      checked={block.settings?.centered || false}
                      onCheckedChange={checked =>
                        updateContentBlock(block.id, block.content, {
                          centered: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor={`img-center-${block.id}`}
                      className="text-sm"
                    >
                      Center image
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {block.content?.url ? (
                  <div className="text-center">
                    <img
                      src={block.content.url}
                      alt={block.content.alt || 'Preview'}
                      className="max-w-full max-h-48 rounded border shadow-sm"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-gray-500 text-sm mt-2">
                      Failed to load image
                    </div>
                    {block.content.caption && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {block.content.caption}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Image preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'video':
      case 'youtube':
        return (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor={`video-url-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {block.type === 'youtube' ? 'YouTube URL' : 'Video URL'}
                  </Label>
                  <Input
                    id={`video-url-${block.id}`}
                    type="url"
                    value={block.content?.url || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        url: e.target.value,
                      })
                    }
                    placeholder={
                      block.type === 'youtube'
                        ? 'https://youtube.com/watch?v=...'
                        : 'https://example.com/video.mp4'
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`video-title-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Video Title
                  </Label>
                  <Input
                    id={`video-title-${block.id}`}
                    value={block.content?.title || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter video title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`video-desc-${block.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Description (optional)
                  </Label>
                  <Textarea
                    id={`video-desc-${block.id}`}
                    value={block.content?.description || ''}
                    onChange={e =>
                      updateContentBlock(block.id, {
                        ...block.content,
                        description: e.target.value,
                      })
                    }
                    placeholder="Video description"
                    className="mt-1 min-h-[60px] resize-none"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`video-autoplay-${block.id}`}
                      checked={block.content?.autoplay || false}
                      onCheckedChange={checked =>
                        updateContentBlock(block.id, {
                          ...block.content,
                          autoplay: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor={`video-autoplay-${block.id}`}
                      className="text-sm"
                    >
                      Autoplay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`video-controls-${block.id}`}
                      checked={block.content?.controls !== false}
                      onCheckedChange={checked =>
                        updateContentBlock(block.id, {
                          ...block.content,
                          controls: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor={`video-controls-${block.id}`}
                      className="text-sm"
                    >
                      Show controls
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                {block.content?.url ? (
                  <div className="w-full">
                    {block.type === 'youtube' ? (
                      <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                        <Youtube className="w-12 h-12 text-gray-400" />
                        <span className="ml-2 text-gray-500">
                          YouTube Preview
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-400" />
                        <span className="ml-2 text-gray-500">
                          Video Preview
                        </span>
                      </div>
                    )}
                    {block.content.title && (
                      <p className="text-sm font-medium text-gray-700 mt-2">
                        {block.content.title}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg p-8 w-full">
                    {block.type === 'youtube' ? (
                      <Youtube className="w-12 h-12 mx-auto mb-2" />
                    ) : (
                      <Video className="w-12 h-12 mx-auto mb-2" />
                    )}
                    <p className="text-sm">Video preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="p-4 space-y-3">
            <div>
              <Label
                htmlFor={`list-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                List Items (one per line)
              </Label>
              <Textarea
                id={`list-${block.id}`}
                value={typeof block.content === 'string' ? block.content : ''}
                onChange={e => updateContentBlock(block.id, e.target.value)}
                className="w-full min-h-[120px] mt-1 resize-none"
                placeholder="• First item&#10;• Second item&#10;• Third item"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor={`list-type-${block.id}`} className="text-sm">
                  Type:
                </Label>
                <select
                  id={`list-type-${block.id}`}
                  value={block.settings?.listType || 'bulleted'}
                  onChange={e =>
                    updateContentBlock(block.id, block.content, {
                      listType: e.target.value,
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="bulleted">Bulleted</option>
                  <option value="numbered">Numbered</option>
                  <option value="checklist">Checklist</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="p-4 space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Table Content
              </Label>
              <div className="mt-2 text-sm text-gray-600">
                Use the table editor below to create your table structure.
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-center text-gray-500">
                <Table className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Advanced table editor coming soon</p>
                <p className="text-xs text-gray-400 mt-1">
                  For now, you can add simple tables using HTML
                </p>
              </div>
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="p-4 space-y-3">
            <div>
              <Label
                htmlFor={`link-url-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Link URL
              </Label>
              <Input
                id={`link-url-${block.id}`}
                type="url"
                value={block.content?.url || ''}
                onChange={e =>
                  updateContentBlock(block.id, {
                    ...block.content,
                    url: e.target.value,
                  })
                }
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor={`link-text-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Link Text
              </Label>
              <Input
                id={`link-text-${block.id}`}
                value={block.content?.text || ''}
                onChange={e =>
                  updateContentBlock(block.id, {
                    ...block.content,
                    text: e.target.value,
                  })
                }
                placeholder="Click here to visit"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor={`link-desc-${block.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Description (optional)
              </Label>
              <Textarea
                id={`link-desc-${block.id}`}
                value={block.content?.description || ''}
                onChange={e =>
                  updateContentBlock(block.id, {
                    ...block.content,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of the link"
                className="mt-1 min-h-[60px] resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`link-newtab-${block.id}`}
                checked={block.content?.openInNewTab !== false}
                onCheckedChange={checked =>
                  updateContentBlock(block.id, {
                    ...block.content,
                    openInNewTab: checked,
                  })
                }
              />
              <Label htmlFor={`link-newtab-${block.id}`} className="text-sm">
                Open in new tab
              </Label>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Content editor for {block.type} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Block Library Sidebar */}
      {showBlockLibrary && (
        <div className="w-80 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Blocks
            </h3>
            <Button
              onClick={() => setShowBlockLibrary(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Click on any block to add it to your lesson content.
          </p>

          {/* Block Categories */}
          <div className="space-y-4">
            {/* Content Blocks */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Content
              </h4>
              <div className="space-y-2">
                {contentBlockTypes
                  .filter(block =>
                    ['text', 'heading', 'statement', 'quote', 'list'].includes(
                      block.id
                    )
                  )
                  .map(blockType => (
                    <Card
                      key={blockType.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                      onClick={() => addContentBlock(blockType)}
                    >
                      <CardContent className="flex items-center p-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          {getIconComponent(blockType.iconName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {blockType.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {blockType.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Media Blocks */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Media
              </h4>
              <div className="space-y-2">
                {contentBlockTypes
                  .filter(block =>
                    ['image', 'video', 'youtube', 'audio'].includes(block.id)
                  )
                  .map(blockType => (
                    <Card
                      key={blockType.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                      onClick={() => addContentBlock(blockType)}
                    >
                      <CardContent className="flex items-center p-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          {getIconComponent(blockType.iconName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {blockType.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {blockType.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Interactive Blocks */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Interactive
              </h4>
              <div className="space-y-2">
                {contentBlockTypes
                  .filter(block =>
                    ['link', 'table', 'checklist', 'pdf', 'scorm'].includes(
                      block.id
                    )
                  )
                  .map(blockType => (
                    <Card
                      key={blockType.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                      onClick={() => addContentBlock(blockType)}
                    >
                      <CardContent className="flex items-center p-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          {getIconComponent(blockType.iconName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {blockType.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {blockType.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Lesson Selector */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {currentLesson ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Block Editor: {currentLesson.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">
                      Module: {currentLesson.moduleId || 'Unknown'}
                    </p>
                    <p className="text-sm text-purple-600">
                      {currentBlocks.length} blocks
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Select a Lesson to Edit
                  </h3>
                  <div className="mt-2">
                    <select
                      value={editingLessonId || ''}
                      onChange={e => {
                        setEditingLessonId(e.target.value);
                        console.log(
                          '🎯 Selected lesson for editing:',
                          e.target.value
                        );
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[200px]"
                    >
                      <option value="">Choose a lesson...</option>
                      {lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title} (
                          {contentBlocks[lesson.id]?.length || 0} blocks)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!showBlockLibrary && (
                <Button
                  onClick={() => setShowBlockLibrary(true)}
                  variant="outline"
                  size="sm"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Show Blocks
                </Button>
              )}

              {syncSettings.syncAcrossModules && currentLesson && (
                <Button
                  onClick={() => {
                    onContentSync({
                      type: 'lesson',
                      lessonId: editingLessonId,
                      blocks: currentBlocks,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  variant="outline"
                  size="sm"
                  title="Sync content across modules"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Content
                </Button>
              )}

              {currentBlocks.length > 0 && (
                <Button
                  onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
                  variant={bulkDeleteMode ? 'default' : 'outline'}
                  size="sm"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {bulkDeleteMode ? 'Exit Selection' : 'Select Multiple'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Operations Toolbar */}
        {bulkDeleteMode && currentBlocks.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedBlocks.size} of {currentBlocks.length} blocks
                  selected
                </span>
                <Button
                  onClick={selectAllBlocks}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-900"
                >
                  Select All
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-900"
                >
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={bulkDeleteBlocks}
                  disabled={selectedBlocks.size === 0}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedBlocks.size})
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Blocks */}
        <div className="flex-1 overflow-y-auto p-6">
          {!editingLessonId ? (
            <div className="text-center py-12">
              <Square className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Lesson Selected
              </h3>
              <p className="text-gray-600 mb-4">
                Select a lesson from the dropdown above or from the
                outline/lessons tab to start editing its content blocks.
              </p>
              {lessons.length > 0 && (
                <Button
                  onClick={() => setEditingLessonId(lessons[0].id)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Edit First Lesson
                </Button>
              )}
            </div>
          ) : currentBlocks.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Content Blocks
              </h3>
              <p className="text-gray-600 mb-4">
                Add content blocks from the sidebar to start building your
                lesson content. You can add text, images, videos, and more.
              </p>
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={() => setShowBlockLibrary(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Block
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Lesson: {currentLesson?.title}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lesson Info Header */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-900">
                      Editing: {currentLesson?.title}
                    </h4>
                    <p className="text-sm text-purple-700 mt-1">
                      {currentBlocks.length} content blocks • Last updated:{' '}
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const textBlock = contentBlockTypes.find(
                          b => b.id === 'text'
                        );
                        if (textBlock) addContentBlock(textBlock);
                      }}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Text
                    </Button>
                    <Button
                      onClick={() => setShowBlockLibrary(true)}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Layers className="w-4 h-4 mr-1" />
                      More Blocks
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Blocks */}
              {currentBlocks.map((block, index) => (
                <Card
                  key={block.id}
                  className={`border transition-all duration-200 hover:shadow-md ${
                    selectedBlocks.has(block.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bulkDeleteMode && (
                          <Checkbox
                            checked={selectedBlocks.has(block.id)}
                            onCheckedChange={() =>
                              toggleBlockSelection(block.id)
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        )}
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {block.type} Block
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!bulkDeleteMode && (
                          <>
                            <Button
                              onClick={() => moveContentBlock(block.id, 'up')}
                              disabled={index === 0}
                              variant="ghost"
                              size="sm"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => moveContentBlock(block.id, 'down')}
                              disabled={index === currentBlocks.length - 1}
                              variant="ghost"
                              size="sm"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => duplicateContentBlock(block.id)}
                              variant="ghost"
                              size="sm"
                              title="Duplicate block"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteContentBlock(block.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {renderContentBlock(block)}
                  </CardContent>
                </Card>
              ))}

              {/* Quick Add Block Footer */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  Add another content block
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {['text', 'heading', 'image', 'video', 'list'].map(
                    blockTypeId => {
                      const blockType = contentBlockTypes.find(
                        b => b.id === blockTypeId
                      );
                      if (!blockType) return null;

                      return (
                        <Button
                          key={blockTypeId}
                          onClick={() => addContentBlock(blockType)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          {getIconComponent(blockType.iconName)}
                          <span className="ml-1">{blockType.title}</span>
                        </Button>
                      );
                    }
                  )}
                  <Button
                    onClick={() => setShowBlockLibrary(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    All Blocks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Delete Content Block
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this {blockToDelete?.type} block?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">This will permanently remove:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>All content in this block</li>
                  <li>Any custom settings or formatting</li>
                  <li>Associated media or links</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockEditorTab;

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactQuill, { Quill } from 'react-quill';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Text, 
  List, 
  ListOrdered, 
  Table, 
  Quote,
  Image as ImageIcon,
  Video,
  Link,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Register font families with proper display names
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'impact', 'roboto'];
Quill.register(Font, true);

// Register font sizes - comprehensive options
const Size = Quill.import('formats/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
Quill.register(Size, true);

// Text type options for AI course editing
const textTypes = [
  {
    id: 'heading',
    title: 'Heading',
    icon: <Heading1 className="h-5 w-5" />,
    description: 'Large heading text',
    preview: <h1 className="text-2xl font-bold mb-2">Sample Heading</h1>,
    defaultContent: '<h1 class="text-2xl font-bold text-gray-800">Your Heading Here</h1>'
  },
  {
    id: 'subheading',
    title: 'Subheading',
    icon: <Heading2 className="h-5 w-5" />,
    description: 'Medium heading text',
    preview: <h2 className="text-xl font-semibold mb-2">Sample Subheading</h2>,
    defaultContent: '<h2 class="text-xl font-semibold text-gray-800">Your Subheading Here</h2>'
  },
  {
    id: 'paragraph',
    title: 'Paragraph',
    icon: <Text className="h-5 w-5" />,
    description: 'Regular body text',
    preview: <p className="text-gray-700">Sample paragraph text content.</p>,
    defaultContent: '<p class="text-base text-gray-700">Start typing your content here...</p>'
  },
  {
    id: 'list',
    title: 'Bullet List',
    icon: <List className="h-5 w-5" />,
    description: 'Unordered list items',
    preview: (
      <ul className="list-disc list-inside text-gray-700">
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    ),
    defaultContent: '<ul><li>List item 1</li><li>List item 2</li><li>List item 3</li></ul>'
  },
  {
    id: 'numbered_list',
    title: 'Numbered List',
    icon: <ListOrdered className="h-5 w-5" />,
    description: 'Ordered list items',
    preview: (
      <ol className="list-decimal list-inside text-gray-700">
        <li>First item</li>
        <li>Second item</li>
      </ol>
    ),
    defaultContent: '<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>'
  },
  {
    id: 'quote',
    title: 'Quote Block',
    icon: <Quote className="h-5 w-5" />,
    description: 'Highlighted quote text',
    preview: (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
        "Sample quote text"
      </blockquote>
    ),
    defaultContent: '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600">"Your quote here"</blockquote>'
  }
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

  if (type === 'heading' || type === 'subheading') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': Size.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
      ]
    };
  }
  
  if (type === 'full' || type === 'paragraph') {
    return {
      toolbar: [
        ...baseToolbar,
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ]
    };
  }

  if (type === 'list' || type === 'numbered_list') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': Size.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['clean']
      ]
    };
  }

  if (type === 'quote') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': Size.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote'],
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

const AITextEditor = ({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  initialType = 'paragraph',
  title = 'Text Editor'
}) => {
  const [selectedType, setSelectedType] = useState(initialType);
  const [content, setContent] = useState(initialContent);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      setContent(initialContent);
    }
  }, [isOpen, initialType, initialContent]);

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    const typeConfig = textTypes.find(t => t.id === type.id);
    if (typeConfig && !content.trim()) {
      setContent(typeConfig.defaultContent);
    }
    setShowTypeSelector(false);
  };

  const handleSave = () => {
    const typeConfig = textTypes.find(t => t.id === selectedType);
    onSave({
      type: selectedType,
      content: content,
      typeConfig: typeConfig
    });
    onClose();
  };

  const currentType = textTypes.find(t => t.id === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {currentType?.icon}
            {title} - {currentType?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Type Selector Sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Content Types</h3>
            <div className="space-y-2">
              {textTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon}
                    <span className="font-medium text-sm">{type.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">{type.description}</p>
                  <div className="mt-2 text-xs">
                    {type.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Editing: {currentType?.title}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Bold className="w-3 h-3" />
                  <Italic className="w-3 h-3" />
                  <Underline className="w-3 h-3" />
                  <Palette className="w-3 h-3" />
                  <AlignLeft className="w-3 h-3" />
                  <Link className="w-3 h-3" />
                  <ImageIcon className="w-3 h-3" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Use the toolbar below to format your content. All formatting options are available.
              </p>
            </div>

            <div className="flex-1 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={getToolbarModules(selectedType)}
                className="h-full"
                style={{ height: 'calc(100% - 42px)' }}
                placeholder={`Start typing your ${currentType?.title.toLowerCase()} here...`}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            Save Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITextEditor;

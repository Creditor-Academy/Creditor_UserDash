import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SidebarContext } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAuthHeader } from '@/services/authHeader';
import { uploadImage } from '@/services/imageUploadService';
import { uploadVideo as uploadVideoResource } from '@/services/videoUploadService';
import VideoComponent from '@/components/VideoComponent';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { convertToModernLessonFormat } from '@/utils/lessonDataConverter.ts';
import {
  ArrowLeft, Plus, FileText, Eye, Pencil, Trash2, GripVertical,
  Play, Link2, File, BookOpen, Image, Video,
  HelpCircle, FileText as FileTextIcon, File as FileIcon, Box, Link as LinkIcon,
  Type,
  Heading1,
  Heading2,
  Text,
  List,
  ListOrdered,
  Table,
  Loader2,
  MessageSquare,
  Quote,
  Layers,
  Minus,
  Volume2,
  Youtube,
  Crop,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import QuoteComponent from '@/components/QuoteComponent';
import TableComponent from '@/components/TableComponent';
import ListComponent from '@/components/ListComponent';
import InteractiveComponent from '@/components/InteractiveComponent';
import axios from 'axios';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import StatementComponent from '@/components/statement';
import DividerComponent from '@/components/DividerComponent';
import AudioComponent from '@/components/AudioComponent';
import YouTubeComponent from '@/components/YouTubeComponent';
import ImageEditor from '@/components/ImageEditor';

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
    font-size: 3em;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = slideInLeftStyle;
  document.head.appendChild(styleSheet);
}

// Global functions for interactive components
if (typeof window !== 'undefined') {
  window.switchTab = function(containerId, activeIndex) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');
    
    tabButtons.forEach((button, index) => {
      if (index === activeIndex) {
        button.classList.add('border-b-2', 'border-blue-500', 'text-blue-600', 'bg-blue-50');
        button.classList.remove('text-gray-500');
      } else {
        button.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600', 'bg-blue-50');
        button.classList.add('text-gray-500');
      }
    });
    
    tabPanels.forEach((panel, index) => {
      if (index === activeIndex) {
        panel.classList.remove('hidden');
        panel.classList.add('block');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('block');
      }
    });
  };

  window.toggleAccordion = function(containerId, index) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const content = container.querySelector(`[data-content="${index}"]`);
    const icon = container.querySelector(`[data-icon="${index}"]`);
    
    if (!content || !icon) return;
    
    if (content.classList.contains('max-h-0')) {
      content.classList.remove('max-h-0');
      content.classList.add('max-h-96', 'pb-4');
      icon.classList.add('rotate-180');
    } else {
      content.classList.add('max-h-0');
      content.classList.remove('max-h-96', 'pb-4');
      icon.classList.remove('rotate-180');
    }
  };

  // Labeled Graphic functions
  window.toggleHotspotContent = function(containerId, hotspotId) {
    // Hide all other content overlays in this container
    const container = document.getElementById(containerId);
    if (container) {
      const allContents = container.querySelectorAll('.hotspot-content');
      allContents.forEach(content => {
        if (content.id !== 'content-' + containerId + '-' + hotspotId) {
          content.classList.add('hidden');
        }
      });
    }
    
    // Toggle the clicked hotspot content
    const contentElement = document.getElementById('content-' + containerId + '-' + hotspotId);
    if (contentElement) {
      if (contentElement.classList.contains('hidden')) {
        contentElement.classList.remove('hidden');
        // Add fade-in animation
        contentElement.style.opacity = '0';
        contentElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
          contentElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          contentElement.style.opacity = '1';
          contentElement.style.transform = 'scale(1)';
        }, 10);
      } else {
        contentElement.classList.add('hidden');
      }
    }
  };
  
  window.hideHotspotContent = function(containerId, hotspotId) {
    const contentElement = document.getElementById('content-' + containerId + '-' + hotspotId);
    if (contentElement) {
      contentElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      contentElement.style.opacity = '0';
      contentElement.style.transform = 'scale(0.9)';
      setTimeout(() => {
        contentElement.classList.add('hidden');
      }, 200);
    }
  };
  
  // Close hotspot content when clicking outside (only add once)
  if (!window.labeledGraphicClickHandler) {
    window.labeledGraphicClickHandler = function(event) {
      if (!event.target.closest('.hotspot') && !event.target.closest('.hotspot-content')) {
        const allContents = document.querySelectorAll('.hotspot-content');
        allContents.forEach(content => {
          content.classList.add('hidden');
        });
      }
    };
    document.addEventListener('click', window.labeledGraphicClickHandler);
  }
}

// Register font families with proper display names
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'impact', 'roboto'];
Quill.register(Font, true);

// Override font display names for better readability
const fontNames = {
  'arial': 'Arial',
  'helvetica': 'Helvetica', 
  'times': 'Times Roman',
  'courier': 'Courier New',
  'verdana': 'Verdana',
  'georgia': 'Georgia',
  'impact': 'Impact',
  'roboto': 'Roboto'
};

// Apply custom font names and override Quill's font labels
if (typeof document !== 'undefined') {
  const fontCSS = Object.entries(fontNames).map(([key, value]) => 
    `.ql-font-${key} { font-family: "${value}"; }`
  ).join('\n');
  
  if (!document.getElementById('custom-font-names')) {
    const style = document.createElement('style');
    style.id = 'custom-font-names';
    style.textContent = fontCSS + `
      /* Override dropdown options text only - not content */
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="arial"]::before { content: "Arial"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="helvetica"]::before { content: "Helvetica"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="times"]::before { content: "Times Roman"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="courier"]::before { content: "Courier New"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="verdana"]::before { content: "Verdana"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="georgia"]::before { content: "Georgia"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="impact"]::before { content: "Impact"; }
      .ql-toolbar .ql-font .ql-picker-options .ql-picker-item[data-value="roboto"]::before { content: "Roboto"; }
      
      /* Ensure font names don't appear in content area */
      .ql-editor .ql-font-arial::before,
      .ql-editor .ql-font-helvetica::before,
      .ql-editor .ql-font-times::before,
      .ql-editor .ql-font-courier::before,
      .ql-editor .ql-font-verdana::before,
      .ql-editor .ql-font-georgia::before,
      .ql-editor .ql-font-impact::before,
      .ql-editor .ql-font-roboto::before {
        content: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}


// Register font sizes - simplified to 4 options
const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

// Add CSS for Quill editor overflow handling and improved alignment display
const quillOverflowCSS = `
  .quill-editor-overflow-visible .ql-toolbar {
    overflow: visible !important;
  }
  .quill-editor-overflow-visible .ql-toolbar .ql-picker {
    overflow: visible !important;
  }
  .quill-editor-overflow-visible .ql-toolbar .ql-picker-options {
    z-index: 9999 !important;
    position: absolute !important;
    overflow: visible !important;
    min-width: 180px !important;
    max-width: 250px !important;
  }
  .quill-editor-overflow-visible .ql-toolbar .ql-picker-label {
    overflow: visible !important;
  }
  .quill-editor-overflow-visible .ql-toolbar .ql-picker-options .ql-picker-item {
    white-space: nowrap !important;
    overflow: visible !important;
    padding: 5px 10px !important;
    min-width: 160px !important;
  }
  .quill-editor-overflow-visible .ql-toolbar .ql-font .ql-picker-options {
    min-width: 200px !important;
    max-width: 300px !important;
  }
  
  /* Improve alignment picker display */
  .ql-align .ql-picker-options .ql-picker-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 8px 12px !important;
    font-size: 14px !important;
    position: relative !important;
  }
  
  /* Completely hide all horizontal line icons and replace with text */
  .ql-align .ql-picker-options .ql-picker-item {
    position: relative !important;
    min-height: 32px !important;
    display: flex !important;
    align-items: center !important;
  }
  
  .ql-align .ql-picker-options .ql-picker-item svg,
  .ql-align .ql-picker-options .ql-picker-item .ql-stroke,
  .ql-align .ql-picker-options .ql-picker-item .ql-stroke-miter,
  .ql-align .ql-picker-options .ql-picker-item .ql-fill {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
  }
  
  /* Replace with clear text labels */
  .ql-align .ql-picker-options .ql-picker-item[data-value=""] {
    background-image: none !important;
  }
  .ql-align .ql-picker-options .ql-picker-item[data-value=""]:after {
    content: "⬅️ Left Align";
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    font-size: 14px !important;
    color: #333 !important;
    padding: 6px 8px !important;
  }
  
  .ql-align .ql-picker-options .ql-picker-item[data-value="center"] {
    background-image: none !important;
  }
  .ql-align .ql-picker-options .ql-picker-item[data-value="center"]:after {
    content: "↔️ Center Align";
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    font-size: 14px !important;
    color: #333 !important;
    padding: 6px 8px !important;
  }
  
  .ql-align .ql-picker-options .ql-picker-item[data-value="right"] {
    background-image: none !important;
  }
  .ql-align .ql-picker-options .ql-picker-item[data-value="right"]:after {
    content: "➡️ Right Align";
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    font-size: 14px !important;
    color: #333 !important;
    padding: 6px 8px !important;
  }
  
  .ql-align .ql-picker-options .ql-picker-item[data-value="justify"] {
    background-image: none !important;
  }
  .ql-align .ql-picker-options .ql-picker-item[data-value="justify"]:after {
    content: "⬌ Justify";
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    font-size: 14px !important;
    color: #333 !important;
    padding: 6px 8px !important;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined' && !document.getElementById('quill-overflow-css')) {
  const style = document.createElement('style');
  style.id = 'quill-overflow-css';
  style.textContent = quillOverflowCSS;
  document.head.appendChild(style);
}

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

// Custom alignment toolbar with clear labels
const customAlignToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': Size.whitelist }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [
    { 'align': '' },
    { 'align': 'center' },
    { 'align': 'right' },
    { 'align': 'justify' }
  ],
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
  // Default base toolbar (includes size picker)
  const baseToolbar = [
    [{ 'font': Font.whitelist }],
    [{ 'size': Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }]
  ];

  // For heading-only and subheading-only editors, include size picker and custom alignment
  if (type === 'heading' || type === 'subheading') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': Size.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        [
          { 'align': '' },
          { 'align': 'center' },
          { 'align': 'right' },
          { 'align': 'justify' }
        ]
      ]
    };
  }
  
  // Simplified toolbar for paragraph blocks (no alignment, lists, links, images, clean)
  if (type === 'paragraph') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        [{ 'size': Size.whitelist }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }]
      ]
    };
  }
  
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

// Interactive List Renderer Component
const InteractiveListRenderer = ({ block, onCheckboxToggle }) => {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    console.log('InteractiveListRenderer useEffect triggered for block:', block.id);
    if (!containerRef.current) {
      console.log('No containerRef.current found');
      return;
    }

    const handleCheckboxClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Checkbox click detected:', e.target);
      
      // Find the checkbox container - could be the clicked element or a parent
      let checkboxContainer = e.target.closest('.checkbox-container');
      
      // If not found, try looking for checkbox wrapper or checkbox item
      if (!checkboxContainer) {
        const checkboxWrapper = e.target.closest('.checkbox-wrapper');
        if (checkboxWrapper) {
          checkboxContainer = checkboxWrapper.closest('.checkbox-container');
        }
      }
      
      if (!checkboxContainer) {
        console.log('No checkbox-container found');
        return;
      }

      const itemIndex = parseInt(checkboxContainer.dataset.index);
      const hiddenCheckbox = checkboxContainer.querySelector('.checkbox-item');
      const visualCheckbox = checkboxContainer.querySelector('.checkbox-visual');
      const textElement = checkboxContainer.querySelector('.flex-1');

      console.log('Checkbox elements found:', {
        itemIndex,
        hiddenCheckbox: !!hiddenCheckbox,
        visualCheckbox: !!visualCheckbox,
        textElement: !!textElement
      });

      if (hiddenCheckbox && visualCheckbox) {
        const newChecked = !hiddenCheckbox.checked;
        
        // Update visual state immediately for better UX
        if (newChecked) {
          visualCheckbox.classList.remove('opacity-0');
          visualCheckbox.classList.add('opacity-100');
          if (textElement) {
            textElement.classList.add('line-through', 'text-gray-500');
          }
        } else {
          visualCheckbox.classList.remove('opacity-100');
          visualCheckbox.classList.add('opacity-0');
          if (textElement) {
            textElement.classList.remove('line-through', 'text-gray-500');
          }
        }

        console.log('Calling onCheckboxToggle:', {
          blockId: block.id || block.block_id,
          itemIndex,
          newChecked
        });

        // Call the callback to update the block state
        onCheckboxToggle(block.id || block.block_id, itemIndex, newChecked);
      }
    };

    // Add click event listeners to all checkbox containers and their children
    const checkboxContainers = containerRef.current.querySelectorAll('.checkbox-container');
    const checkboxWrappers = containerRef.current.querySelectorAll('.checkbox-wrapper');
    
    console.log('Found checkbox containers:', checkboxContainers.length);
    console.log('Found checkbox wrappers:', checkboxWrappers.length);
    
    // Add listeners to containers
    checkboxContainers.forEach((container, index) => {
      console.log(`Adding listener to container ${index}:`, container);
      container.addEventListener('click', handleCheckboxClick);
    });

    // Add listeners to wrappers for more precise clicking
    checkboxWrappers.forEach((wrapper, index) => {
      console.log(`Adding listener to wrapper ${index}:`, wrapper);
      wrapper.addEventListener('click', handleCheckboxClick);
    });

    // Cleanup
    return () => {
      checkboxContainers.forEach(container => {
        container.removeEventListener('click', handleCheckboxClick);
      });
      checkboxWrappers.forEach(wrapper => {
        wrapper.removeEventListener('click', handleCheckboxClick);
      });
    };
  }, [block.html_css, onCheckboxToggle, block.id, block.block_id]);

  console.log('InteractiveListRenderer rendering with HTML:', block.html_css?.substring(0, 200));

  return (
    <div 
      ref={containerRef}
      className="max-w-none"
      dangerouslySetInnerHTML={{ __html: block.html_css }}
    />
  );
};

function LessonBuilder() {
  const { sidebarCollapsed, setSidebarCollapsed } = useContext(SidebarContext);
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
  const [lessonContent, setLessonContent] = useState(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [editingVideoBlock, setEditingVideoBlock] = useState(null);
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
  const [editorHeading, setEditorHeading] = useState('');
  const [editorSubheading, setEditorSubheading] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [masterHeadingGradient, setMasterHeadingGradient] = useState('gradient1');
  
  // Gradient color options for master heading
  const gradientOptions = [
    {
      id: 'gradient1',
      name: 'Purple to Blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      preview: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'gradient2', 
      name: 'Blue to Pink',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      preview: 'from-blue-500 via-purple-500 to-pink-500'
    },
    {
      id: 'gradient3',
      name: 'Green to Blue',
      gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      preview: 'from-emerald-500 to-blue-500'
    },
    {
      id: 'gradient4',
      name: 'Orange to Red',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      preview: 'from-amber-500 to-red-500'
    },
    {
      id: 'gradient5',
      name: 'Pink to Purple',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      preview: 'from-pink-500 to-purple-500'
    },
    {
      id: 'gradient6',
      name: 'Teal to Cyan',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
      preview: 'from-teal-500 to-cyan-500'
    }
  ];
  const [currentTextBlockId, setCurrentTextBlockId] = useState(null);
  const [currentTextType, setCurrentTextType] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
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
  const [showStatementSidebar, setShowStatementSidebar] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfUploadMethod, setPdfUploadMethod] = useState('file');
  const [mainPdfUploading, setMainPdfUploading] = useState(false);
  const [showQuoteTemplateSidebar, setShowQuoteTemplateSidebar] = useState(false);
  const [showQuoteEditDialog, setShowQuoteEditDialog] = useState(false);
  const [editingQuoteBlock, setEditingQuoteBlock] = useState(null);
  const [showListTemplateSidebar, setShowListTemplateSidebar] = useState(false);
  const [showListEditDialog, setShowListEditDialog] = useState(false);
  const [editingListBlock, setEditingListBlock] = useState(null);
  const [showTableComponent, setShowTableComponent] = useState(false);
  const [editingTableBlock, setEditingTableBlock] = useState(null);
  const [showInteractiveTemplateSidebar, setShowInteractiveTemplateSidebar] = useState(false);
  const [showInteractiveEditDialog, setShowInteractiveEditDialog] = useState(false);
  const [editingInteractiveBlock, setEditingInteractiveBlock] = useState(null);
  const [showDividerTemplateSidebar, setShowDividerTemplateSidebar] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [editingAudioBlock, setEditingAudioBlock] = useState(null);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [youTubeTitle, setYouTubeTitle] = useState('');
  const [youTubeDescription, setYouTubeDescription] = useState('');
  const [editingYouTubeBlock, setEditingYouTubeBlock] = useState(null);
  const [imageAlignment, setImageAlignment] = useState('left'); // 'left' or 'right' for image & text blocks
  const [standaloneImageAlignment, setStandaloneImageAlignment] = useState('center'); // 'left', 'center', 'right' for standalone images
  
  // Image Editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);
  const [imageEditorTitle, setImageEditorTitle] = useState('Edit Image');
  
  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'changes_detected'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = React.useRef(null);
  
  // Inline block insertion state
  const [insertionPosition, setInsertionPosition] = useState(null);
  const [showInsertDropdown, setShowInsertDropdown] = useState(null); // block index where dropdown is shown
  const [showInsertBlockDialog, setShowInsertBlockDialog] = useState(false); // Show insert block dialog
  


  // Image block templates
  const imageTemplates = [
    {
      id: 'image-text',
      title: 'Image & text',
      description: 'Image with text content side by side',
      icon: <Image className="h-6 w-6" />,
      layout: 'side-by-side',
      alignment: 'left', // Default alignment
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
      alignment: 'center', // Default alignment
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
      id: 'statement',
      title: 'Statement',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'quote',
      title: 'Quote',
      icon: <Quote className="h-5 w-5" />
    },
    {
      id: 'image',
      title: 'Image',
      icon: <Image className="h-5 w-5" />
    },
    {
      id: 'youtube',
      title: 'YouTube',
      icon: <Youtube className="h-5 w-5" />
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
      id: 'list',
      title: 'List',
      icon: <List className="h-5 w-5" />
    },
    {
      id: 'tables',
      title: 'Tables',
      icon: <Table className="h-5 w-5" />
    },
    {
      id: 'interactive',
      title: 'Interactive',
      icon: <Layers className="h-5 w-5" />
    },
    {
      id: 'divider',
      title: 'Divider',
      icon: <Minus className="h-5 w-5" />
    }
  ];


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
      id: 'master_heading',
      icon: <Heading1 className="h-5 w-5" />,
      preview: (
        <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Master Heading</h1>
        </div>
      ),
      defaultContent:
        '<div class="rounded-xl p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"><h1 class="text-4xl font-extrabold tracking-tight">Master Heading</h1></div>',
      style: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#FFFFFF',
        background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        padding: '16px',
        borderRadius: '12px'
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
  const listComponentRef = React.useRef();
  const quoteComponentRef = React.useRef();
  const dividerComponentRef = React.useRef();


  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Warn user before leaving page with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
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
  const isInitialLoadRef = React.useRef(true);



  const handleBlockClick = (blockType, position = null) => {
    // Store the insertion position for use in subsequent handlers
    if (position !== null) {
      setInsertionPosition(position);
      setShowInsertDropdown(null); // Close the dropdown
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

  // Insert block at a specific position
  const insertContentBlockAt = (blockType, position, textType = null) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: blockType.id,
      title: blockType.title,
      textType: textType,
      content: '',
      order: position + 1
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
            content: newContent
          }
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
    } else if (textType.id === 'master_heading') {
      innerContent = `<h1 style="font-size: 40px; font-weight: 600; line-height: 1.2; margin: 0; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px;">${'Master Heading'}</h1>`;
    } else {
      innerContent = textType.defaultContent || contentHtml;
    }

    // Generate HTML content with proper card styling to match existing blocks
    const htmlContent = textType.id === 'master_heading' ? innerContent : `
      <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
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
              content: newContent
            }
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Always add to local edit list so it appears immediately in edit mode
      setContentBlocks(prevBlocks => [...prevBlocks, newBlock]);
    }
   
    // Close the sidebar
    setShowTextTypeSidebar(false);
    setSidebarCollapsed(true);
  };

  const handleStatementSelect = (statementBlock) => {
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
              content: newContent
            }
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
      } else if (htmlContent.includes('absolute top-0 left-1/2') && htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')) {
        detectedStatementType = 'statement-b';
      } else if (htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') && htmlContent.includes('border-l-4 border-orange-500')) {
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
        block.id === blockId ? {
          ...block,
          content,
          html_css: htmlContent,
          statementType: detectedStatementType, // Preserve statement type
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
              statementType: detectedStatementType, // Preserve statement type
              // Also update details if they exist
              details: {
                ...block.details,
                content,
                statement_type: detectedStatementType
              },
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
  };

  // Quote component callbacks
  const handleQuoteTemplateSelect = (newBlock) => {
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
              content: newContent
            }
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
  const handleTableTemplateSelect = (newBlock) => {
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
              content: newContent
            }
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
  // const handleInteractiveTemplateSelect = (newBlock) => {
  //   const interactiveBlock = {
  //     id: `block_${Date.now()}`,
  //     block_id: `block_${Date.now()}`,
  //     type: 'interactive',
  //     title: 'Interactive',
  //     content: newBlock.content,
  //     html_css: newBlock.html_css,
  //     order: contentBlocks.length + 1
  //   };
  //   setContentBlocks(prevBlocks => [...prevBlocks, interactiveBlock]);
  // };

  // const handleInteractiveUpdate = (blockId, updatedContent) => {
  //   setContentBlocks(prevBlocks =>
  //     prevBlocks.map(block =>
  //       block.id === blockId
  //         ? { 
  //             ...block, 
  //             type: 'interactive', // Ensure type remains interactive
  //             subtype: updatedContent.subtype || block.subtype || 'accordion', // Preserve subtype
  //             content: updatedContent.content, 
  //             html_css: updatedContent.html_css 
  //           }
  //         : block
  //     )
  //   );
  //   setEditingInteractiveBlock(null);
  // };

  // Interactive component callbacks
  const handleInteractiveTemplateSelect = (newBlock) => {
    const interactiveBlock = {
      id: `block_${Date.now()}`,
      block_id: `block_${Date.now()}`,
      type: 'interactive',
      title: 'Interactive',
      content: newBlock.content,
      html_css: newBlock.html_css,
      order: contentBlocks.length + 1
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
              content: newContent
            }
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
              html_css: updatedContent.html_css 
            }
          : block
      )
    );
    setEditingInteractiveBlock(null);
  };

  // Divider component callbacks
  const handleDividerTemplateSelect = (newBlock) => {
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
              content: newContent
            }
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
        block.id === blockId ? {
          ...block,
          content: updatedContent.content,
          html_css: updatedContent.html_css,
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
              content: updatedContent.content,
              html_css: updatedContent.html_css,
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
  };


  // List component callbacks
  const handleListTemplateSelect = (newBlock) => {
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
              content: newContent
            }
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
        const toRoman = (num) => {
          const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
          const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
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
                ${items.map((item, index) => `
                  <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-orange-300/50 hover:shadow-md transition-all duration-200">
                    <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      ${getNumbering(index, numberingStyle)}
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed">
                      ${item}
                    </div>
                  </li>
                `).join('')}
              </ol>
            </div>`;
        } else if (extractedListType === 'checkbox') {
          htmlContent = `
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
              <div class="space-y-4">
                ${items.map((item, index) => `
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
                `).join('')}
              </div>
            </div>`;
        } else {
          // bulleted list
          htmlContent = `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <ul class="space-y-4 list-none">
                ${items.map((item) => `
                  <li class="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-300/50 hover:shadow-md transition-all duration-200">
                    <div class="flex-shrink-0 mt-2">
                      <div class="w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                    </div>
                    <div class="flex-1 text-gray-800 leading-relaxed">
                      ${item}
                    </div>
                  </li>
                `).join('')}
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
        block.id === blockId ? {
          ...block,
          content,
          html_css: htmlContent,
          listType: extractedListType,
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
              listType: extractedListType,
              // Also update details if they exist
              details: {
                ...block.details,
                list_type: extractedListType,
                listType: extractedListType
              },
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
    
    setEditingListBlock(null);
    setShowListEditDialog(false);
  };

  // Handle checkbox toggle for interactive lists
  const handleCheckboxToggle = async (blockId, itemIndex, checked) => {
    console.log('handleCheckboxToggle called:', { blockId, itemIndex, checked });
    
    try {
      // Find the block in contentBlocks or lessonContent
      let targetBlock = contentBlocks.find(block => block.id === blockId || block.block_id === blockId);
      if (!targetBlock && lessonContent?.data?.content) {
        targetBlock = lessonContent.data.content.find(block => block.id === blockId || block.block_id === blockId);
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
        updatedAt: new Date().toISOString()
      };
      
      // Update contentBlocks if the block exists there
      if (contentBlocks.find(block => block.id === blockId || block.block_id === blockId)) {
        setContentBlocks(prevBlocks => 
          prevBlocks.map(block => 
            (block.id === blockId || block.block_id === blockId) ? updatedBlock : block
          )
        );
      }
      
      // Update lessonContent if the block exists there
      if (lessonContent?.data?.content?.find(block => block.id === blockId || block.block_id === blockId)) {
        setLessonContent(prevContent => ({
          ...prevContent,
          data: {
            ...prevContent.data,
            content: prevContent.data.content.map(block =>
              (block.id === blockId || block.block_id === blockId) ? updatedBlock : block
            )
          }
        }));
      }
      
      // Save to server
      console.log('Saving checkbox state to server...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          html_css: updatedHtml,
          content: updatedContent,
          type: targetBlock.type,
          listType: targetBlock.listType || targetBlock.details?.listType || 'checkbox',
          details: {
            ...targetBlock.details,
            listType: 'checkbox',
            list_type: 'checkbox'
          }
        })
      });
      
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
    const editingBlock = contentBlocks.find(block => block.id === blockId) || 
                        lessonContent?.data?.content?.find(block => block.block_id === blockId || block.id === blockId);
    
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
    const quoteType = editingBlock.textType || editingBlock.details?.quoteType || editingBlock.quoteType;
    
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
            ${quotes.map((q, index) => `
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
            `).join('')}
            
            <div class="flex justify-center items-center space-x-6 mt-6 pt-4 border-t border-slate-200/60">
              <button onclick="window.carouselPrev && window.carouselPrev(this)" class="carousel-prev group bg-white/80 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-full p-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <div class="flex space-x-2">
                ${quotes.map((_, index) => `
                  <button onclick="window.carouselGoTo && window.carouselGoTo(this, ${index})" class="carousel-dot w-3 h-3 rounded-full transition-all duration-300 transform ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-md' : 'bg-slate-300 hover:bg-slate-400 hover:scale-105'}" data-index="${index}"></button>
                `).join('')}
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
        block.id === blockId ? {
          ...block,
          content: JSON.stringify(updatedQuoteContent),
          html_css: newHtmlContent,
          details: {
            ...block.details,
            quote: updatedQuoteContent.quote || updatedQuoteContent.quotes?.[0]?.quote || '',
            author: updatedQuoteContent.author || updatedQuoteContent.quotes?.[0]?.author || '',
            authorImage: updatedQuoteContent.authorImage || '',
            backgroundImage: updatedQuoteContent.backgroundImage || ''
          },
          updatedAt: new Date().toISOString()
        } : block
      )
    );

    // Update lessonContent for fetched lessons
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.map(block =>
            (block.block_id === blockId || block.id === blockId) ? {
              ...block,
              content: JSON.stringify(updatedQuoteContent),
              html_css: newHtmlContent,
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }

    // Reset editing state
    setEditingQuoteBlock(null);
  };

  const handleAudioUpdate = (audioBlock) => {
    if (editingAudioBlock) {
      // Update existing audio block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingAudioBlock.id ? {
            ...block,
            ...audioBlock,
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
              (block.block_id === editingAudioBlock.id || block.id === editingAudioBlock.id) ? {
                ...block,
                ...audioBlock,
                updatedAt: new Date().toISOString()
              } : block
            )
          }
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
                content: newContent
              }
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

  const handleYouTubeUpdate = (youTubeBlock) => {
    if (editingYouTubeBlock) {
      // Update existing YouTube block
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingYouTubeBlock.id ? {
            ...block,
            ...youTubeBlock,
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
              (block.block_id === editingYouTubeBlock.id || block.id === editingYouTubeBlock.id) ? {
                ...block,
                ...youTubeBlock,
                updatedAt: new Date().toISOString()
              } : block
            )
          }
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
                content: newContent
              }
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

  const handleVideoUpdate = (videoBlock) => {
    console.log('handleVideoUpdate called with:', videoBlock);
    console.log('editingVideoBlock:', editingVideoBlock);
    
    if (editingVideoBlock) {
      // Update existing video block
      console.log('Updating existing video block');
      setContentBlocks(blocks =>
        blocks.map(block =>
          block.id === editingVideoBlock.id ? {
            ...block,
            ...videoBlock,
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
              (block.block_id === editingVideoBlock.id || block.id === editingVideoBlock.id) ? {
                ...block,
                ...videoBlock,
                updatedAt: new Date().toISOString()
              } : block
            )
          }
        }));
      }
    } else {
      // Check if we're inserting at a specific position
      if (insertionPosition !== null) {
        console.log('Inserting new video block at position:', insertionPosition);
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
                content: newContent
              }
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
        block.id === blockId ? {
          ...block,
          content,
          html_css: htmlContent,
          templateId: templateId,
          tableType: templateId,
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
              templateId: templateId,
              tableType: templateId,
              // Also update details if they exist
              details: {
                ...block.details,
                templateId: templateId,
                tableType: templateId
              },
              updatedAt: new Date().toISOString()
            } : block
          )
        }
      }));
    }
    
    setEditingTableBlock(null);
    setShowTableComponent(false);
  };

  const removeContentBlock = (blockId) => {
    // Remove from contentBlocks
    setContentBlocks(contentBlocks.filter(block => block.id !== blockId));
    
    // Also remove from lessonContent if it exists (for fetched lessons)
    if (lessonContent?.data?.content) {
      setLessonContent(prevLessonContent => ({
        ...prevLessonContent,
        data: {
          ...prevLessonContent.data,
          content: prevLessonContent.data.content.filter(block => 
            block.block_id !== blockId && block.id !== blockId
          )
        }
      }));
    }
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

    // Enhanced quote block detection - check content structure and HTML patterns
    const isQuoteBlock = block.type === 'quote' || 
                        (block.textType && block.textType.startsWith('quote_')) ||
                        (block.details?.quote_type) ||
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
                        (block.html_css && (
                          block.html_css.includes('quote-carousel') ||
                          block.html_css.includes('carousel-dot') ||
                          block.html_css.includes('blockquote') ||
                          block.html_css.includes('<cite') ||
                          block.html_css.includes('background-image:') && block.html_css.includes('bg-gradient-to-t from-black') ||
                          block.html_css.includes('flex items-center space-x-8') && block.html_css.includes('rounded-full object-cover') ||
                          block.html_css.includes('text-left max-w-3xl') && block.html_css.includes('bg-gradient-to-br from-slate-50') ||
                          block.html_css.includes('text-3xl md:text-4xl') && block.html_css.includes('font-thin') ||
                          block.html_css.includes('bg-gradient-to-br from-gray-50') && block.html_css.includes('backdrop-blur-sm')
                        ));

    if (isQuoteBlock) {
      // Handle quote block editing with proper type detection
      // For fetched content, detect quoteType from HTML content if not available
      let quoteType = block.textType || block.details?.quote_type || block.details?.quoteType;
      
      // Override block type to ensure it's treated as a quote
      block = { ...block, type: 'quote' };
      
      // If quoteType is not available, detect it from HTML content with improved patterns
      if (!quoteType && block.html_css) {
        const htmlContent = block.html_css;
        
        // Quote Carousel - has carousel controls and multiple quotes
        if (htmlContent.includes('quote-carousel') || 
            htmlContent.includes('carousel-dot') || 
            htmlContent.includes('carousel-prev') || 
            htmlContent.includes('carousel-next')) {
          quoteType = 'quote_carousel';
        }
        // Quote on Image - has background image with overlay
        else if (htmlContent.includes('background-image:') || 
                 (htmlContent.includes('bg-gradient-to-t from-black') && htmlContent.includes('absolute inset-0'))) {
          quoteType = 'quote_on_image';
        }
        // Quote C - has author image with horizontal layout
        else if (htmlContent.includes('flex items-center space-x-8') || 
                 (htmlContent.includes('rounded-full object-cover') && htmlContent.includes('w-16 h-16'))) {
          quoteType = 'quote_c';
        }
        // Quote D - has specific styling with slate background
        else if (htmlContent.includes('text-left max-w-3xl') || 
                 htmlContent.includes('bg-gradient-to-br from-slate-50')) {
          quoteType = 'quote_d';
        }
        // Quote B - has large text and thin font
        else if (htmlContent.includes('text-3xl md:text-4xl') || 
                 htmlContent.includes('font-thin') || 
                 htmlContent.includes('text-center bg-gray-50')) {
          quoteType = 'quote_b';
        }
        // Quote A - default style with author image on left
        else if (htmlContent.includes('flex items-start space-x-4') || 
                 htmlContent.includes('w-12 h-12 rounded-full') || 
                 htmlContent.includes('bg-gradient-to-br from-gray-50')) {
          quoteType = 'quote_a';
        }
        // Additional fallback detection based on structure
        else if (htmlContent.includes('blockquote') && htmlContent.includes('cite')) {
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
        htmlPreview: block.html_css ? block.html_css.substring(0, 200) + '...' : 'No HTML'
      });
      
      // Parse and prepare quote content for the editor
      let quoteContent = {};
      try {
        if (block.content) {
          quoteContent = JSON.parse(block.content);
        }
      } catch (e) {
        console.log('Could not parse quote content as JSON, extracting from HTML');
        // Extract quote and author from HTML if JSON parsing fails
        if (block.html_css) {
          const htmlContent = block.html_css;
          
          // Extract quote text
          const quoteMatch = htmlContent.match(/<blockquote[^>]*>(.*?)<\/blockquote>/s);
          const quoteText = quoteMatch ? quoteMatch[1].replace(/"/g, '').trim() : '';
          
          // Extract author
          const authorMatch = htmlContent.match(/<cite[^>]*>.*?—\s*(.*?)<\/cite>/s);
          const authorText = authorMatch ? authorMatch[1].trim() : '';
          
          // Extract author image
          const imgMatch = htmlContent.match(/<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"[^>]*class="[^"]*rounded-full[^"]*"/);
          const authorImage = imgMatch ? imgMatch[1] : '';
          
          // Extract background image
          const bgMatch = htmlContent.match(/background-image:\s*url\(['"]([^'"]*)['"]\)/);
          const backgroundImage = bgMatch ? bgMatch[1] : '';
          
          quoteContent = {
            quote: quoteText,
            author: authorText,
            authorImage: authorImage,
            backgroundImage: backgroundImage
          };
        } else {
          quoteContent = {
            quote: block.content || '',
            author: '',
            authorImage: '',
            backgroundImage: ''
          };
        }
      }
      
      // Set the textType to ensure proper editor opens
      const blockWithType = { 
        ...block, 
        type: 'quote', 
        textType: quoteType,
        quoteType: quoteType,
        content: JSON.stringify(quoteContent)
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
      let statementType = block.statementType || block.details?.statement_type || block.details?.statementType;
      
      // If statementType is not available, detect it from HTML content
      if (!statementType && block.html_css) {
        const htmlContent = block.html_css;
        if (htmlContent.includes('border-t border-b border-gray-800')) {
          statementType = 'statement-a';
        } else if (htmlContent.includes('absolute top-0 left-1/2') && htmlContent.includes('bg-gradient-to-r from-orange-400 to-orange-600')) {
          statementType = 'statement-b';
        } else if (htmlContent.includes('bg-gradient-to-r from-gray-50 to-gray-100') && htmlContent.includes('border-l-4 border-orange-500')) {
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
      
      statementComponentRef.current?.handleEditStatement(blockId, statementType, content, htmlCss);
      return;
    }

    // Enhanced list block detection - check content structure and HTML patterns
    const isListBlock = block.type === 'list' || 
                       (block.details?.list_type) ||
                       (block.details?.listType) ||
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
                       (block.html_css && (
                         block.html_css.includes('bg-gradient-to-br from-orange-50 to-red-50') ||
                         block.html_css.includes('bg-gradient-to-br from-pink-50 to-rose-50') ||
                         block.html_css.includes('bg-gradient-to-br from-blue-50 to-indigo-50') ||
                         block.html_css.includes('checkbox-item') ||
                         block.html_css.includes('list-none') ||
                         (block.html_css.includes('<ol') && block.html_css.includes('space-y-4')) ||
                         (block.html_css.includes('<ul') && block.html_css.includes('space-y-4'))
                       ));

    if (isListBlock) {
      // Handle list block editing with proper type detection
      // For fetched content, detect listType from HTML content if not available
      let listType = block.listType || block.details?.list_type || block.details?.listType;
      
      // Override block type to ensure it's treated as a list
      block = { ...block, type: 'list' };
      
      // If listType is not available, detect it from HTML content
      if (!listType && block.html_css) {
        const htmlContent = block.html_css;
        
        // Numbered list - has numbered items with gradient orange background
        if (htmlContent.includes('bg-gradient-to-br from-orange-50 to-red-50') || 
            htmlContent.includes('from-orange-500 to-red-500') ||
            htmlContent.includes('<ol')) {
          listType = 'numbered';
        }
        // Checkbox list - has checkbox items with pink background
        else if (htmlContent.includes('bg-gradient-to-br from-pink-50 to-rose-50') || 
                 htmlContent.includes('checkbox-item') ||
                 htmlContent.includes('border-pink-400')) {
          listType = 'checkbox';
        }
        // Bulleted list - has bullet points with blue background
        else if (htmlContent.includes('bg-gradient-to-br from-blue-50 to-indigo-50') || 
                 htmlContent.includes('from-blue-500 to-indigo-500') ||
                 htmlContent.includes('rounded-full shadow-sm')) {
          listType = 'bulleted';
        }
        // Fallback detection based on HTML structure
        else if (htmlContent.includes('<ol')) {
          listType = 'numbered';
        } else if (htmlContent.includes('checkbox') || htmlContent.includes('input type="checkbox"')) {
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
        htmlPreview: block.html_css ? block.html_css.substring(0, 200) + '...' : 'No HTML'
      });
      
      // Parse and prepare list content for the editor
      let listContent = {};
      try {
        if (block.content) {
          listContent = JSON.parse(block.content);
        }
      } catch (e) {
        console.log('Could not parse list content as JSON, extracting from HTML');
        // Extract list items from HTML if JSON parsing fails
        if (block.html_css) {
          const htmlContent = block.html_css;
          const items = [];
          
          // Extract items from different list types
          if (listType === 'numbered') {
            const matches = htmlContent.match(/<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs);
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(/<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s);
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else if (listType === 'checkbox') {
            const matches = htmlContent.match(/<div[^>]*class="flex items-start space-x-4[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/div>/gs);
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(/<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s);
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          } else {
            // Bulleted list
            const matches = htmlContent.match(/<li[^>]*>.*?<div[^>]*class="flex-1[^>]*>(.*?)<\/div>.*?<\/li>/gs);
            if (matches) {
              matches.forEach(match => {
                const textMatch = match.match(/<div[^>]*class="flex-1[^>]*>(.*?)<\/div>/s);
                if (textMatch) {
                  items.push(textMatch[1].trim());
                }
              });
            }
          }
          
          listContent = {
            items: items.length > 0 ? items : [''],
            listType: listType,
            checkedItems: {}
          };
        } else {
          listContent = {
            items: [''],
            listType: listType,
            checkedItems: {}
          };
        }
      }
      
      // Set the listType to ensure proper editor opens
      const blockWithType = { 
        ...block, 
        type: 'list', 
        listType: listType,
        content: JSON.stringify(listContent)
      };
      setEditingListBlock(blockWithType);
      
      // Initialize list component state
      if (listComponentRef.current) {
        listComponentRef.current.setListItems(listContent.items || ['']);
        listComponentRef.current.setListType(listType);
        listComponentRef.current.setCheckedItems(listContent.checkedItems || {});
        listComponentRef.current.setNumberingStyle(listContent.numberingStyle || 'decimal');
      }
      
      setShowListEditDialog(true);
      return;
    }
   
    // Enhanced interactive block detection - check subtype, content structure and HTML patterns
    const isInteractiveBlock = block.type === 'interactive' || 
                              // Check subtype for accordion or tabs
                              (block.subtype && (block.subtype === 'accordion' || block.subtype === 'tabs' || block.subtype === 'labeled-graphic')) ||
                              // Check if content has interactive structure (JSON with template)
                              (() => {
                                try {
                                  const content = JSON.parse(block.content || '{}');
                                  return content.template && (content.tabsData || content.accordionData || content.labeledGraphicData);
                                } catch {
                                  return false;
                                }
                              })() ||
                              // Check HTML patterns for interactive blocks
                              (block.html_css && (
                                block.html_css.includes('interactive-tabs') ||
                                block.html_css.includes('interactive-accordion') ||
                                block.html_css.includes('accordion-content') ||
                                block.html_css.includes('tab-button') ||
                                block.html_css.includes('accordion-header') ||
                                block.html_css.includes('data-template="tabs"') ||
                                block.html_css.includes('data-template="accordion"') ||
                                block.html_css.includes('data-template="labeled-graphic"') ||
                                block.html_css.includes('labeled-graphic-container')
                              ));

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
      setCurrentTextBlockId(blockId);
      setCurrentTextType(block.textType);
      setShowTextEditorDialog(true);

      // Reset editors
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
     
      // Set content based on block type
      if (block.textType === 'heading_paragraph') {
        // Parse existing content to extract heading and paragraph
        if (block.heading !== undefined && block.content !== undefined) {
          setEditorHeading(block.heading || '');
          setEditorContent(block.content || '');
        } else {
          // Fallback: try to parse from HTML content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = block.html_css || block.content || '';
          const h1 = tempDiv.querySelector('h1');
          const p = tempDiv.querySelector('p');
          setEditorHeading(h1 ? h1.innerHTML : '');
          setEditorContent(p ? p.innerHTML : '');
        }
      } else if (block.textType === 'subheading_paragraph') {
        // Parse existing content to extract subheading and paragraph
        if (block.subheading !== undefined && block.content !== undefined) {
          setEditorSubheading(block.subheading || '');
          setEditorContent(block.content || '');
        } else {
          // Fallback: try to parse from HTML content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = block.html_css || block.content || '';
          const h2 = tempDiv.querySelector('h2');
          const p = tempDiv.querySelector('p');
          setEditorSubheading(h2 ? h2.innerHTML : '');
          setEditorContent(p ? p.innerHTML : '');
        }
      } else {
        setEditorContent(block.content || '');
        setEditorHtml(block.content || '');
      }
    } else if (block.type === 'table') {
      // Handle table block editing - open edit dialog directly
      console.log('Table block detected for editing:', block);
      
      // Detect table type from existing block data
      let tableType = block.tableType || block.templateId || block.details?.table_type || block.details?.templateId;
      
      // If table type is not available, try to detect from content
      if (!tableType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          tableType = parsedContent.templateId || parsedContent.tableType || 'two_columns';
        } catch (e) {
          // If content parsing fails, try to detect from HTML structure
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (htmlContent.includes('grid') && htmlContent.includes('md:grid-cols-2')) {
              tableType = 'two_columns';
            } else if (htmlContent.includes('grid') && htmlContent.includes('md:grid-cols-3')) {
              tableType = 'three_columns';
            } else if (htmlContent.includes('<table') || htmlContent.includes('divide-y')) {
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
        templateId: tableType
      };
      
      // Set the editing table block and show the table component in edit mode
      setEditingTableBlock(blockWithType);
      setShowTableComponent(true);

      

    } else if (block.type === 'list') {
      // Handle list block editing - open edit dialog directly
      console.log('List block detected for editing:', block);
      
      // Detect list type from existing block data
      let listType = block.listType || block.details?.list_type || block.details?.listType;
      
      // If list type is not available, try to detect from content or HTML
      if (!listType && block.content) {
        try {
          const parsedContent = JSON.parse(block.content);
          listType = parsedContent.listType || 'bulleted';
        } catch (e) {
          // If content is not JSON, try to detect from HTML
          if (block.html_css) {
            const htmlContent = block.html_css;
            if (htmlContent.includes('<ol') || htmlContent.includes('list-decimal')) {
              listType = 'numbered';
            } else if (htmlContent.includes('type="checkbox"') || htmlContent.includes('input[type="checkbox"]')) {
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
        listType: listType
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
      setCurrentLinkBlock(block);
      setLinkTitle(block.linkTitle || '');
      setLinkUrl(block.linkUrl || '');
      setLinkDescription(block.linkDescription || '');
      setLinkButtonText(block.linkButtonText || 'Visit Link');
      setLinkButtonStyle(block.linkButtonStyle || 'primary');
      setLinkError('');
      setShowLinkDialog(true);
    } else {
      setCurrentBlock(block);
      setEditModalOpen(true);
     
      // Reset editors
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
     
      // Set content based on block type
      if (block.textType === 'heading_paragraph') {
        const parts = block.content ? block.content.split('|||') : ['', ''];
        setEditorHeading(parts[0] || '');
        setEditorContent(parts[1] || '');
      } else if (block.textType === 'subheading_paragraph') {
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

    // Update lesson content order - handle both lessonContent and contentBlocks
    if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
      const content = lessonContent.data.content;
      const sourceIndex = content.findIndex(b => (b.block_id || b.id) === draggedBlockId);
      const targetIndex = content.findIndex(b => (b.block_id || b.id) === targetBlockId);
   
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
    } else {
      // Handle contentBlocks drag and drop
      const sourceIndex = contentBlocks.findIndex(b => (b.id || b.block_id) === draggedBlockId);
      const targetIndex = contentBlocks.findIndex(b => (b.id || b.block_id) === targetBlockId);
      
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
    // Navigate to the new lesson preview page
    navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/preview`);
  };

  // Convert LessonBuilder content blocks to Modern format
  const convertToModernFormat = () => {
    // Create lesson data object
    const currentLessonData = {
      id: lessonId || Math.random().toString(36).substr(2, 9),
      title: lessonTitle || 'Untitled Lesson',
      description: lessonData?.description || 'No description available',
      duration: '30 min',
      author: 'Course Creator',
      difficulty: 'Intermediate'
    };

    // Use contentBlocks if available, otherwise fall back to lessonContent
    const sourceBlocks = (contentBlocks && contentBlocks.length > 0) 
      ? contentBlocks 
      : (lessonContent?.data?.content || []);

    return convertToModernLessonFormat(currentLessonData, sourceBlocks, false);
  };

  // Handle block updates from the unified preview
  const handleBlockUpdate = (blockId, updatedBlock) => {
    console.log('Updating block:', blockId, updatedBlock);
    
    // Update contentBlocks if they exist
    if (contentBlocks && contentBlocks.length > 0) {
      setContentBlocks(prevBlocks => 
        prevBlocks.map(block => 
          (block.id || block.block_id) === blockId 
            ? { ...block, ...updatedBlock }
            : block
        )
      );
    }
    
    // Also update lessonContent if it exists
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
              const quotesHtml = quotes.map((q, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : 'hidden'}" data-index="${index}">
                  <blockquote class="text-xl italic text-gray-700 mb-4 text-center leading-relaxed">
                    "${q.quote || ''}"
                  </blockquote>
                  <cite class="text-lg font-medium text-gray-600 text-center block">— ${q.author || ''}</cite>
                </div>
              `).join('');
              
              html = `
                <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                  <div class="quote-carousel relative bg-gray-50 rounded-xl p-8 min-h-[200px] flex flex-col justify-center">
                    ${quotesHtml}
                    <div class="flex justify-center space-x-2 mt-6">
                      ${quotes.map((_, index) => `
                        <button class="carousel-dot w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}" data-index="${index}"></button>
                      `).join('')}
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
            const listType = listContent.listType || block.listType || 'bulleted';
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
                    ${items.map((item, index) => `
                      <label class="flex items-start space-x-3 cursor-pointer group">
                        <input type="checkbox" ${checkedItems[index] ? 'checked' : ''} 
                               class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span class="text-gray-800 leading-relaxed ${checkedItems[index] ? 'line-through text-gray-500' : ''}">${item}</span>
                      </label>
                    `).join('')}
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
      } else if (block.type === 'interactive') {
        // For interactive blocks, use the saved html_css content
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from interactive content
          try {
            const interactiveContent = JSON.parse(block.content || '{}');
            const template = interactiveContent.template;
            const data = interactiveContent[template === 'tabs' ? 'tabsData' : 'accordionData'] || [];
            
            if (template === 'tabs') {
              const tabsId = `tabs-${Date.now()}`;
              html = `
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gradient-to-r from-blue-500 to-purple-600">
                  <div class="interactive-tabs" data-template="tabs" id="${tabsId}">
                    <div class="flex border-b border-gray-200 mb-4" role="tablist">
                      ${data.map((tab, index) => `
                        <button class="tab-button px-4 py-2 text-sm font-medium transition-colors duration-200 ${index === 0 ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" 
                                role="tab" 
                                data-tab="${index}"
                                data-container="${tabsId}"
                                onclick="window.switchTab('${tabsId}', ${index})">
                          ${tab.title}
                        </button>
                      `).join('')}
                    </div>
                    <div class="tab-content">
                      ${data.map((tab, index) => `
                        <div class="tab-panel ${index === 0 ? 'block' : 'hidden'}" 
                             role="tabpanel" 
                             data-tab="${index}">
                          <div class="text-gray-700 leading-relaxed">${tab.content}</div>
                        </div>
                      `).join('')}
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
                      ${data.map((item, index) => `
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
                      `).join('')}
                    </div>
                  </div>
                </div>
              `;
            }
          } catch (error) {
            console.error('Error parsing interactive content:', error);
            html = '<div class="text-red-500">Error loading interactive content</div>';
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
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 01-1-1V9a1 1 0 011-1h1a1 1 0 011 1v2a1 1 0 01-1 1H9z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
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
                      ${audioContent.uploadedData ? `
                        <div class="mt-2 text-xs text-gray-500">
                          <span class="inline-flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${audioContent.uploadedData.fileName}
                          </span>
                          <span class="ml-2">${(audioContent.uploadedData.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            `;
          } catch (error) {
            console.error('Error parsing audio content:', error);
            html = '<div class="text-red-500">Error loading audio content</div>';
          }
        }
      } else if (block.type === 'video') {
        // For video blocks, use the saved html_css content if available
        if (block.html_css && block.html_css.trim()) {
          html = block.html_css;
        } else {
          // Fallback: generate HTML from video block properties
          const videoUrl = block.videoUrl || block.details?.video_url || '';
          const videoTitle = (block.videoTitle || block.details?.caption || 'Video').replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
          const videoDescription = block.videoDescription || block.details?.description || '';
          
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
      if (lessonContent?.data?.content && lessonContent.data.content.length > 0) {
        console.log('Existing lesson - merging content');
        
        // Start with existing lesson content
        const existingBlocks = lessonContent.data.content;
        const existingBlockIds = new Set(existingBlocks.map(b => b.block_id || b.id));
        
        // Only add truly new blocks from contentBlocks
        const newBlocks = contentBlocks.filter(b => !existingBlockIds.has(b.id));
        
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
          console.warn('Removing duplicate block during update:', blockId, block.type);
        }
      });
      
      if (uniqueBlocks.length !== blocksToUpdate.length) {
        console.warn(`Removed ${blocksToUpdate.length - uniqueBlocks.length} duplicate blocks during update`);
        blocksToUpdate = uniqueBlocks;
      }

      // Allow empty content blocks for deletion operations
      // Convert content blocks to the required format
      const content = blocksToUpdate.map((block, index) => {
        const blockId = block.block_id || `block_${index + 1}`;
       
        // For quote blocks, always preserve the exact html_css to maintain design consistency
        if (block.type === 'quote' && block.html_css && block.html_css.trim() !== '') {
          return {
            type: block.type,
            textType: block.textType,
            script: block.script || '',
            block_id: blockId,
            html_css: block.html_css,
            content: block.content,
            ...(block.details && { details: block.details })
          };
        }
        
        // For other blocks, preserve existing html_css to avoid wrapping in new containers
        if (block.html_css && block.html_css.trim() !== '') {
          const blockData = {
            type: block.type,
            script: block.script || '',
            block_id: blockId,
            html_css: block.html_css,
            ...(block.details && { details: block.details })
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
              content: block.content || ''
            };
          }
          
          // For divider blocks, include explicit divider type metadata
          if (block.type === 'divider') {
            blockData.dividerType = block.subtype || 'continue';
            blockData.details = {
              ...blockData.details,
              divider_type: block.subtype || 'continue',
              content: block.content || ''
            };
          }
          
          // For table blocks, include explicit table type metadata
          if (block.type === 'table') {
            blockData.tableType = block.tableType || block.templateId || 'two_columns';
            blockData.details = {
              ...blockData.details,
              table_type: block.tableType || block.templateId || 'two_columns',
              templateId: block.tableType || block.templateId || 'two_columns',
              content: block.content || ''
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
              content: blockContent
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
              const textContent = (block.text || block.imageDescription || '').toString();
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
              } else { // centered or default
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
              content: blockContent
            };
            htmlContent = block.html_css || blockContent;
            break;

          case 'divider':
            // For divider blocks, include explicit type metadata
            details = {
              divider_type: block.subtype || 'continue',
              content: blockContent
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
                title: audioContent.title || 'Audio'
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
                title: 'Audio'
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
                title: youTubeContent.title || 'YouTube Video'
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
                title: 'YouTube Video'
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
              title: block.videoTitle || 'Video'
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

        // For quote blocks, use the exact html_css to prevent extra wrapping
        if (block.type === 'quote' && block.html_css && block.html_css.trim()) {
          return {
            html_css: block.html_css,
            styles: ''
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
              styles = '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; }';
              break;
            }
            case 'master_heading': {
              htmlContent = `<div class="lesson-master-heading"><h1>${blockContent}</h1></div>`;
              styles = '.lesson-master-heading h1 { font-size: 40px; font-weight: 600; margin: 0; line-height: 1.2; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; }';
              break;
            }
            case 'subheading': {
              htmlContent = `<h4 class="lesson-subheading">${blockContent}</h4>`;
              styles = '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; }';
              break;
            }
            case 'heading_paragraph': {
              const headingText = block.heading || '';
              const paragraphText = block.content || '';
              htmlContent = `<h1 class="lesson-heading">${headingText}</h1><p class="lesson-paragraph">${paragraphText}</p>`;
              styles = '.lesson-heading { font-size: 24px; font-weight: bold; margin-bottom: 16px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
            case 'subheading_paragraph': {
              const subheadingText = block.subheading || '';
              const paragraphText2 = block.content || '';
              htmlContent = `<h4 class="lesson-subheading">${subheadingText}</h4><p class="lesson-paragraph">${paragraphText2}</p>`;
              styles = '.lesson-subheading { font-size: 20px; font-weight: 600; margin-bottom: 12px; } .lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
            default: {
              htmlContent = `<p class="lesson-paragraph">${blockContent}</p>`;
              styles = '.lesson-paragraph { font-size: 16px; line-height: 1.6; margin-bottom: 12px; }';
              break;
            }
          }
        } else if (blockType === 'image') {
          const layout = block.layout || 'centered';
          const textContent = (block.text || block.imageDescription || '').toString();
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
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Reset to neutral after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('saved');
        }, 2000);
      } else {
        throw new Error(response.data?.errorMessage || 'Failed to update lesson content');
      }
     
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error(error.response?.data?.errorMessage || 'Failed to update lesson. Please try again.');
      setAutoSaveStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-save function with optimized debounce
  const triggerAutoSave = React.useCallback(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (800ms debounce for faster response)
    autoSaveTimerRef.current = setTimeout(async () => {
      // Only save if we have unsaved changes and a lesson ID
      if (!lessonId || !hasUnsavedChanges) {
        return;
      }

      try {
        setAutoSaveStatus('saving');
        await handleUpdate();
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Reset to neutral state after 1.5 seconds
        setTimeout(() => {
          setAutoSaveStatus('saved');
        }, 1500);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
        toast.error('Auto-save failed. Please try saving manually.');
      }
    }, 800); // 800ms debounce for faster response
  }, [lessonId, hasUnsavedChanges, handleUpdate]);

  // Auto-save when content blocks change
  React.useEffect(() => {
    // Don't auto-save on initial load or when loading lesson content
    if (loading || fetchingContent) return;

    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevContentBlocksRef.current = [...contentBlocks];
      return;
    }

    // Check if contentBlocks actually changed
    const hasChanged = JSON.stringify(prevContentBlocksRef.current) !== JSON.stringify(contentBlocks);
    
    if (hasChanged && contentBlocks.length > 0) {
      setHasUnsavedChanges(true);
      // Show immediate feedback that changes are detected
      setAutoSaveStatus('changes_detected');
      triggerAutoSave();
      prevContentBlocksRef.current = [...contentBlocks];
    }
  }, [contentBlocks, loading, fetchingContent, triggerAutoSave]);

  const toggleViewMode = () => {
    // View mode functionality removed - now using Modern Preview only
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
      alignment: template.alignment || 'left', // Include alignment from template
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
        template: template.id,
        alignment: template.alignment || 'left'
      }
    };

    // Generate HTML content immediately for the new block
    newBlock.html_css = generateImageBlockHtml(newBlock);
   
    // Check if we're inserting at a specific position
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
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
              content: newContent
            }
          };
        });
      }
      setInsertionPosition(null);
    } else {
      // Always add to local edit list so it appears immediately in edit mode
      setContentBlocks(prev => [...prev, newBlock]);
    }
    setShowImageTemplateSidebar(false);
  };

  const handleImageBlockEdit = (blockId, field, value) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        
        const updatedBlock = { ...block, [field]: value };
        
        // If alignment is being changed, regenerate the HTML
        if (field === 'alignment') {
          updatedBlock.html_css = generateImageBlockHtml(updatedBlock);
        }
        
        return updatedBlock;
      })
    );
  };

  const handleImageFileUpload = async (blockId, file, retryCount = 0) => {
    if (!file) return;

    // Set loading state for this specific block
    setImageUploading(prev => ({ ...prev, [blockId]: true }));

    try {
      console.log('Attempting to upload image to AWS S3:', {
        blockId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        retryCount
      });

      // Upload image to API
      const uploadResult = await uploadImage(file, {
        folder: 'lesson-images', // Optional: organize images in a specific folder
        public: true // Make images publicly accessible
      });

      if (uploadResult.success && uploadResult.imageUrl) {
        // Update the block with the uploaded AWS S3 image URL
        handleImageBlockEdit(blockId, 'imageUrl', uploadResult.imageUrl);
        handleImageBlockEdit(blockId, 'imageFile', file);
        handleImageBlockEdit(blockId, 'uploadedImageData', uploadResult);
        
        // Clear any local URL flag
        handleImageBlockEdit(blockId, 'isUsingLocalUrl', false);
        
        console.log('Image uploaded successfully to AWS S3:', {
          blockId,
          awsUrl: uploadResult.imageUrl,
          uploadResult
        });
        
        toast.success('Image uploaded successfully to AWS S3!');
      } else {
        throw new Error('Upload failed - no image URL returned');
      }
    } catch (error) {
      console.error('Error uploading image to AWS S3:', error);
      console.error('Upload error details:', {
        blockId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: error.message,
        retryCount
      });
      
      // Retry up to 2 times for network errors
      if (retryCount < 2 && (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('fetch'))) {
        console.log(`Retrying upload (attempt ${retryCount + 1}/2)...`);
        // Don't clear loading state, keep it active for retry
        setTimeout(() => {
          handleImageFileUpload(blockId, file, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return; // Exit early, don't execute finally block
      }
      
      toast.error(`Failed to upload image to AWS S3: ${error.message || 'Unknown error'}. Using local preview.`);
      
      // Fallback to local URL for immediate preview (but warn user)
      const localImageUrl = URL.createObjectURL(file);
      handleImageBlockEdit(blockId, 'imageUrl', localImageUrl);
      handleImageBlockEdit(blockId, 'imageFile', file);
      
      // Mark that this is using local URL so save function can warn
      handleImageBlockEdit(blockId, 'isUsingLocalUrl', true);
      
      console.warn('Using local blob URL as fallback:', localImageUrl);
    } finally {
      // Clear loading state
      setImageUploading(prev => ({ ...prev, [blockId]: false }));
    }
  };

  // Generate HTML content for image blocks
  const generateImageBlockHtml = (block) => {
    const layout = block.layout || 'centered';
    const textContent = (block.text || block.imageDescription || '').toString();
    const imageUrl = block.imageUrl || '';
    const imageTitle = block.imageTitle || '';
    const alignment = block.alignment || block.details?.alignment || 'left';

    if (!imageUrl) return '';

    if (layout === 'side-by-side') {
      const imageFirst = alignment === 'left';
      const imageOrder = imageFirst ? 'order-1' : 'order-2';
      const textOrder = imageFirst ? 'order-2' : 'order-1';
      
      return `
        <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
          <div class="${imageOrder}">
            <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
          </div>
          <div class="${textOrder}">
            ${textContent ? `<span class="text-gray-700 text-lg leading-relaxed">${textContent}</span>` : ''}
          </div>
        </div>
      `;
    } else if (layout === 'overlay') {
      return `
        <div class="relative rounded-xl overflow-hidden">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full h-96 object-cover" />
          ${textContent ? `<div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end"><div class="text-white p-8 w-full"><span class="text-xl font-medium leading-relaxed">${textContent}</span></div></div>` : ''}
        </div>
      `;
    } else if (layout === 'full-width') {
      return `
        <div class="space-y-3">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded" />
          ${textContent ? `<p class="text-sm text-gray-600">${textContent}</p>` : ''}
        </div>
      `;
    } else { // centered or default
      // Handle standalone image alignment
      let alignmentClass = 'text-center'; // default
      if (alignment === 'left') {
        alignmentClass = 'text-left';
      } else if (alignment === 'right') {
        alignmentClass = 'text-right';
      }
      
      return `
        <div class="${alignmentClass}">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg ${alignment === 'center' ? 'mx-auto' : ''}" />
          ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
        </div>
      `;
    }
  };

  const saveImageTemplateChanges = (blockId) => {
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        if (block.type === 'image') {
          const captionPlainText = getPlainText(block.text || '');
          
          // Ensure we're using the uploaded AWS URL, not local URL
          let finalImageUrl = block.imageUrl || block.details?.image_url || '';
          
          // If imageUrl is a local blob URL, try to get the uploaded URL from uploadedImageData
          if (finalImageUrl.startsWith('blob:') && block.uploadedImageData?.imageUrl) {
            finalImageUrl = block.uploadedImageData.imageUrl;
            console.log('Using uploaded AWS URL instead of local blob URL:', finalImageUrl);
          }
          
          const updatedDetails = {
            ...(block.details || {}),
            image_url: finalImageUrl,
            caption: (captionPlainText || block.details?.caption || ''),
            alt_text: block.imageTitle || block.details?.alt_text || '',
            layout: block.layout || block.details?.layout,
            template: block.templateType || block.details?.template,
            alignment: block.alignment || block.details?.alignment || 'left',
          };
          
          // Create updated block with final image URL for HTML generation
          const updatedBlock = {
            ...block,
            imageUrl: finalImageUrl,
            details: updatedDetails
          };
          
          // Generate HTML content with the correct AWS URL
          const htmlContent = generateImageBlockHtml(updatedBlock);
          
          console.log('Saving image block:', {
            blockId,
            layout: block.layout,
            originalUrl: block.imageUrl,
            finalUrl: finalImageUrl,
            isLocalUrl: finalImageUrl.startsWith('blob:'),
            hasUploadedData: !!block.uploadedImageData,
            isUsingLocalUrl: block.isUsingLocalUrl
          });
          
          // Warn if still using local URL
          if (finalImageUrl.startsWith('blob:') || block.isUsingLocalUrl) {
            console.warn('WARNING: Image block is using local URL instead of AWS S3 URL');
            toast.warning('Warning: Image is stored locally and may not be accessible after page refresh. Please re-upload the image.');
          }
          
          return { 
            ...updatedBlock,
            isEditing: false, 
            html_css: htmlContent, 
            imageDescription: captionPlainText, 
            details: updatedDetails 
          };
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
      
      // Properly detect and set the text type
      let detectedTextType = block.textType || 'paragraph';
      
      // If textType is not set or unreliable, detect from HTML content
      if (!block.textType || block.textType === 'heading') {
        const htmlContent = block.html_css || block.content || '';
        
        // Check for master heading first (has gradient background)
        if (htmlContent.includes('linear-gradient') && htmlContent.includes('<h1')) {
          detectedTextType = 'master_heading';
        } else if (htmlContent.includes('<h1') && htmlContent.includes('<p')) {
          detectedTextType = 'heading_paragraph';
        } else if (htmlContent.includes('<h2') && htmlContent.includes('<p')) {
          detectedTextType = 'subheading_paragraph';
        } else if (htmlContent.includes('<h1')) {
          detectedTextType = 'heading';
        } else if (htmlContent.includes('<h2')) {
          detectedTextType = 'subheading';
        }
      }
      
      setCurrentTextType(detectedTextType);
      setCurrentTextBlockId(block.id || block.block_id);
      
      // Reset all editors first
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
      
      // Set content based on the detected text type
      if (detectedTextType === 'heading_paragraph') {
        // For heading + paragraph, try to get from stored properties first
        if (block.heading !== undefined && block.content !== undefined) {
          setEditorHeading(block.heading || 'Heading');
          // Extract paragraph content from the stored content or html_css
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const proseDiv = tempDiv.querySelector('.prose');
          if (proseDiv) {
            setEditorContent(proseDiv.innerHTML || 'Enter your content here...');
          } else {
            setEditorContent(block.content || 'Enter your content here...');
          }
        } else {
          // Fallback: parse from HTML
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          
          const h1Element = tempDiv.querySelector('h1');
          const proseDiv = tempDiv.querySelector('.prose');
          
          setEditorHeading(h1Element ? h1Element.innerHTML : 'Heading');
          setEditorContent(proseDiv ? proseDiv.innerHTML : 'Enter your content here...');
        }
      } else if (detectedTextType === 'subheading_paragraph') {
        // For subheading + paragraph, try to get from stored properties first
        if (block.subheading !== undefined && block.content !== undefined) {
          setEditorSubheading(block.subheading || 'Subheading');
          // Extract paragraph content from the stored content or html_css
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const proseDiv = tempDiv.querySelector('.prose');
          if (proseDiv) {
            setEditorContent(proseDiv.innerHTML || 'Enter your content here...');
          } else {
            setEditorContent(block.content || 'Enter your content here...');
          }
        } else {
          // Fallback: parse from HTML
          const htmlContent = block.html_css || block.content || '';
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          
          const h2Element = tempDiv.querySelector('h2');
          const proseDiv = tempDiv.querySelector('.prose');
          
          setEditorSubheading(h2Element ? h2Element.innerHTML : 'Subheading');
          setEditorContent(proseDiv ? proseDiv.innerHTML : 'Enter your content here...');
        }
      } else {
        // For single content blocks (heading, subheading, paragraph)
        const htmlContent = block.html_css || block.content || '';
        
        // Special handling for master heading to preserve text content only
        if (detectedTextType === 'master_heading') {
          if (htmlContent.includes('<h1')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const h1Element = tempDiv.querySelector('h1');
            if (h1Element) {
              // Extract only the text content, not the styling
              setEditorHtml(h1Element.textContent || h1Element.innerText || 'Master Heading');
            } else {
              setEditorHtml('Master Heading');
            }
            
            // Detect gradient from existing content
            const gradientDiv = tempDiv.querySelector('div[style*="linear-gradient"]');
            if (gradientDiv) {
              const style = gradientDiv.getAttribute('style') || '';
              // Try to match with our gradient options
              const matchedGradient = gradientOptions.find(option => 
                style.includes(option.gradient.replace('linear-gradient(', '').replace(')', ''))
              );
              if (matchedGradient) {
                setMasterHeadingGradient(matchedGradient.id);
              } else {
                setMasterHeadingGradient('gradient1'); // Default fallback
              }
            } else {
              setMasterHeadingGradient('gradient1'); // Default
            }
          } else {
            setEditorHtml(htmlContent || 'Master Heading');
            setMasterHeadingGradient('gradient1'); // Default
          }
        } else {
          // Extract the inner content while preserving rich text formatting for other types
          if (htmlContent.includes('<')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            
            // Find the main content element
            const contentElement = tempDiv.querySelector('h1, h2, h3, h4, h5, h6, p, div');
            if (contentElement) {
              setEditorHtml(contentElement.innerHTML);
            } else {
              setEditorHtml(htmlContent);
            }
          } else {
            setEditorHtml(htmlContent);
          }
        }
      }
    } else {
      setEditorTitle('');
      setEditorHtml('');
      setEditorHeading('');
      setEditorSubheading('');
      setEditorContent('');
      setCurrentTextBlockId(null);
      setCurrentTextType(null);
    }
  };

  const handleTextEditorSave = () => {
    try {
      // First try to find block in contentBlocks (for new lessons)
      let blockToUpdate = contentBlocks.find(b => b.id === currentTextBlockId);
     
      // If not found, try to find in lessonContent (for fetched lessons)
      if (!blockToUpdate && lessonContent?.data?.content) {
        blockToUpdate = lessonContent.data.content.find(b => b.block_id === currentTextBlockId);
      }

      if (blockToUpdate) {
        let updatedContent = '';
       
        // Use currentTextType (detected type) or fallback to blockToUpdate.textType
        let effectiveTextType = currentTextType || blockToUpdate.textType;
        
        // Double-check for master heading if textType seems wrong
        if (effectiveTextType === 'heading' && blockToUpdate.html_css) {
          const htmlContent = blockToUpdate.html_css || '';
          if (htmlContent.includes('linear-gradient') && htmlContent.includes('<h1')) {
            effectiveTextType = 'master_heading';
          }
        }
       
        // Always use consistent HTML generation for all text types to avoid double-update issues
        const textType = textTypes.find(t => t.id === effectiveTextType);
        
        if (effectiveTextType === 'heading_paragraph' || effectiveTextType === 'subheading_paragraph') {
          // For compound templates, combine heading/subheading with paragraph in styled container
          const headingTag = effectiveTextType === 'heading_paragraph' ? 'h1' : 'h2';
          const headingFontSize = effectiveTextType === 'heading_paragraph' ? '24px' : '20px';
          const headingFontWeight = effectiveTextType === 'heading_paragraph' ? 'bold' : '600';
          
          // Use the correct content variables for each template type
          let headingContent = effectiveTextType === 'heading_paragraph' ? editorHeading : editorSubheading;
          let paragraphContent = editorContent;
          
          console.log(`${effectiveTextType} - Original heading content:`, headingContent);
          console.log(`${effectiveTextType} - Original paragraph content:`, paragraphContent);
          
          // Process heading content for alignment
          if (headingContent) {
            const hasHeadingAlignment = headingContent.includes('ql-align-center') || 
                                      headingContent.includes('ql-align-right') || 
                                      headingContent.includes('ql-align-justify') ||
                                      headingContent.includes('text-align: center') ||
                                      headingContent.includes('text-align: right') ||
                                      headingContent.includes('text-align: justify');
            
            console.log(`${effectiveTextType} - Has heading alignment classes:`, hasHeadingAlignment);
            
            if (hasHeadingAlignment) {
              headingContent = headingContent
                .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
                .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
                .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
                .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
            }
          }
          
          // Process paragraph content for alignment
          if (paragraphContent) {
            const hasParagraphAlignment = paragraphContent.includes('ql-align-center') || 
                                        paragraphContent.includes('ql-align-right') || 
                                        paragraphContent.includes('ql-align-justify') ||
                                        paragraphContent.includes('text-align: center') ||
                                        paragraphContent.includes('text-align: right') ||
                                        paragraphContent.includes('text-align: justify');
            
            console.log(`${effectiveTextType} - Has paragraph alignment classes:`, hasParagraphAlignment);
            
            if (hasParagraphAlignment) {
              paragraphContent = paragraphContent
                .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
                .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
                .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
                .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
            }
          }
          
          console.log(`${effectiveTextType} - Final heading content:`, headingContent);
          console.log(`${effectiveTextType} - Final paragraph content:`, paragraphContent);
          
          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                <${headingTag} style="font-size: ${headingFontSize} !important; font-weight: ${headingFontWeight}; color: #1F2937; margin: 0 0 16px 0; line-height: 1.2;">${headingContent || (effectiveTextType === 'heading_paragraph' ? 'Heading' : 'Subheading')}</${headingTag}>
                <div class="prose prose-lg max-w-none text-gray-700">
                  ${paragraphContent || 'Start typing your content here...'}
                </div>
              </article>
            </div>
          `;
        } else if (effectiveTextType === 'heading') {
          // For heading blocks, preserve Quill editor styling including alignment
          let styledContent = editorHtml || '<h1>Heading</h1>';
          
          console.log('Original editorHtml:', editorHtml);
          
          // If the content doesn't have proper heading tags, wrap it in h1 with default styling
          if (!styledContent.includes('<h1') && !styledContent.includes('<h2') && !styledContent.includes('<h3')) {
            styledContent = `<h1 style="font-size: 24px; font-weight: bold; margin: 0;">${styledContent}</h1>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment = styledContent.includes('ql-align-center') || 
                               styledContent.includes('ql-align-right') || 
                               styledContent.includes('ql-align-justify') ||
                               styledContent.includes('text-align: center') ||
                               styledContent.includes('text-align: right') ||
                               styledContent.includes('text-align: justify');
            
            console.log('Has alignment classes:', hasAlignment);
            console.log('Styled content before processing:', styledContent);
            
            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
                .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
                .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
                .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
            }
            
            // Preserve existing styles but ensure proper default size if no size is specified
            styledContent = styledContent.replace(/<h1([^>]*?)>/g, (match, attrs) => {
              // Check if style attribute exists
              if (attrs.includes('style=')) {
                // Extract existing styles and add default size if not present
                const styleMatch = attrs.match(/style="([^"]*)"/);
                if (styleMatch) {
                  let existingStyles = styleMatch[1];
                  // Only add font-size if it's not already present
                  if (!existingStyles.includes('font-size')) {
                    existingStyles += '; font-size: 24px';
                  }
                  if (!existingStyles.includes('font-weight')) {
                    existingStyles += '; font-weight: bold';
                  }
                  if (!existingStyles.includes('color')) {
                    existingStyles += '; color: #1F2937';
                  }
                  if (!existingStyles.includes('margin')) {
                    existingStyles += '; margin: 0';
                  }
                  if (!existingStyles.includes('line-height')) {
                    existingStyles += '; line-height: 1.2';
                  }
                  return `<h1${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                }
              } else {
                // No style attribute, add default styles
                return `<h1${attrs} style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">`;
              }
              return match;
            });
          }
          
          console.log('Final styled content:', styledContent);
          
          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                  ${styledContent}
              </article>
            </div>
          `;
        } else if (effectiveTextType === 'subheading') {
          // For subheading blocks, preserve Quill editor styling including alignment
          let styledContent = editorHtml || '<h2>Subheading</h2>';
          
          console.log('Subheading - Original editorHtml:', editorHtml);
          
          // If the content doesn't have proper heading tags, wrap it in h2 with default styling
          if (!styledContent.includes('<h1') && !styledContent.includes('<h2') && !styledContent.includes('<h3')) {
            styledContent = `<h2 style="font-size: 20px; font-weight: 600; margin: 0;">${styledContent}</h2>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment = styledContent.includes('ql-align-center') || 
                               styledContent.includes('ql-align-right') || 
                               styledContent.includes('ql-align-justify') ||
                               styledContent.includes('text-align: center') ||
                               styledContent.includes('text-align: right') ||
                               styledContent.includes('text-align: justify');
            
            console.log('Subheading - Has alignment classes:', hasAlignment);
            console.log('Subheading - Styled content before processing:', styledContent);
            
            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
                .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
                .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
                .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
            }
            
            // Preserve existing styles but ensure proper default size if no size is specified
            styledContent = styledContent.replace(/<h2([^>]*?)>/g, (match, attrs) => {
              // Check if style attribute exists
              if (attrs.includes('style=')) {
                // Extract existing styles and add default size if not present
                const styleMatch = attrs.match(/style="([^"]*)"/);
                if (styleMatch) {
                  let existingStyles = styleMatch[1];
                  // Only add font-size if it's not already present
                  if (!existingStyles.includes('font-size')) {
                    existingStyles += '; font-size: 20px';
                  }
                  if (!existingStyles.includes('font-weight')) {
                    existingStyles += '; font-weight: 600';
                  }
                  if (!existingStyles.includes('color')) {
                    existingStyles += '; color: #1F2937';
                  }
                  if (!existingStyles.includes('margin')) {
                    existingStyles += '; margin: 0';
                  }
                  if (!existingStyles.includes('line-height')) {
                    existingStyles += '; line-height: 1.2';
                  }
                  return `<h2${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                }
              } else {
                // No style attribute, add default styles
                return `<h2${attrs} style="font-size: 20px; font-weight: 600; color: #1F2937; margin: 0; line-height: 1.2;">`;
              }
              return match;
            });
          }
          
          console.log('Subheading - Final styled content:', styledContent);
          
          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                  ${styledContent}
              </article>
            </div>`;
        } else if (effectiveTextType === 'master_heading') {
          // For master heading, preserve Quill editor styling including alignment and use selected gradient
          let styledContent = editorHtml || 'Master Heading';
          
          // Get the selected gradient
          const selectedGradient = gradientOptions.find(g => g.id === masterHeadingGradient) || gradientOptions[0];
          
          console.log('Master Heading - Original editorHtml:', editorHtml);
          console.log('Master Heading - Selected gradient:', selectedGradient.name);
          
          // Ensure master heading has proper size if no size is specified
          if (!styledContent.includes('<h1') && !styledContent.includes('<h2') && !styledContent.includes('<h3')) {
            styledContent = `<h1 style="font-size: 40px; font-weight: 600; margin: 0;">${styledContent}</h1>`;
          } else {
            // Check if content has alignment classes from Quill
            const hasAlignment = styledContent.includes('ql-align-center') || 
                               styledContent.includes('ql-align-right') || 
                               styledContent.includes('ql-align-justify') ||
                               styledContent.includes('text-align: center') ||
                               styledContent.includes('text-align: right') ||
                               styledContent.includes('text-align: justify');
            
            console.log('Master Heading - Has alignment classes:', hasAlignment);
            console.log('Master Heading - Styled content before processing:', styledContent);
            
            // If content has Quill alignment classes, convert them to inline styles
            if (hasAlignment) {
              styledContent = styledContent
                .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
                .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
                .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
                .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
            }
            
            // Ensure h1 tags have proper default size for master heading if no size is specified
            styledContent = styledContent.replace(/<h1([^>]*?)>/g, (match, attrs) => {
              // Check if style attribute exists
              if (attrs.includes('style=')) {
                // Extract existing styles and add default size if not present
                const styleMatch = attrs.match(/style="([^"]*)"/);
                if (styleMatch) {
                  let existingStyles = styleMatch[1];
                  // Only add font-size if it's not already present
                  if (!existingStyles.includes('font-size')) {
                    existingStyles += '; font-size: 40px';
                  }
                  if (!existingStyles.includes('font-weight')) {
                    existingStyles += '; font-weight: 600';
                  }
                  if (!existingStyles.includes('color')) {
                    existingStyles += '; color: white';
                  }
                  if (!existingStyles.includes('margin')) {
                    existingStyles += '; margin: 0';
                  }
                  if (!existingStyles.includes('line-height')) {
                    existingStyles += '; line-height: 1.2';
                  }
                  return `<h1${attrs.replace(/style="[^"]*"/, `style="${existingStyles}"`)}>`;
                }
              } else {
                // No style attribute, add default styles
                return `<h1${attrs} style="font-size: 40px; font-weight: 600; color: white; margin: 0; line-height: 1.2;">`;
              }
              return match;
            });
          }
          
          console.log('Master Heading - Final styled content:', styledContent);
          
          updatedContent = `<div style="background: ${selectedGradient.gradient}; padding: 20px; border-radius: 8px; color: white;">${styledContent}</div>`;
        } else {
          // For paragraph and other single content blocks - preserve alignment
          let styledContent = editorHtml || 'Enter your content here...';
          
          console.log('Paragraph - Original editorHtml:', editorHtml);
          
          // Check if content has alignment classes from Quill
          const hasAlignment = styledContent.includes('ql-align-center') || 
                             styledContent.includes('ql-align-right') || 
                             styledContent.includes('ql-align-justify') ||
                             styledContent.includes('text-align: center') ||
                             styledContent.includes('text-align: right') ||
                             styledContent.includes('text-align: justify');
          
          console.log('Paragraph - Has alignment classes:', hasAlignment);
          console.log('Paragraph - Styled content before processing:', styledContent);
          
          // If content has Quill alignment classes, convert them to inline styles
          if (hasAlignment) {
            styledContent = styledContent
              .replace(/class="[^"]*ql-align-center[^"]*"/g, 'style="text-align: center"')
              .replace(/class="[^"]*ql-align-right[^"]*"/g, 'style="text-align: right"')
              .replace(/class="[^"]*ql-align-justify[^"]*"/g, 'style="text-align: justify"')
              .replace(/class="[^"]*ql-align-left[^"]*"/g, 'style="text-align: left"');
          }
          
          console.log('Paragraph - Final styled content:', styledContent);
          
          updatedContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                <div class="prose prose-lg max-w-none text-gray-700">
                  ${styledContent}
                </div>
              </article>
            </div>
          `;
        }

        // Ensure updatedContent is never empty
        if (!updatedContent || updatedContent.trim() === '') {
          updatedContent = `
            <div class="content-block" style="font-size: 16px; line-height: 1.6; color: #4B5563;">
              Enter your content here...
            </div>
          `;
        }

        // Update contentBlocks with error handling
        setContentBlocks(blocks => {
          try {
            return blocks.map(block =>
              block.id === currentTextBlockId
                ? {
                    ...block,
                    content: updatedContent,
                    html_css: updatedContent,
                    heading: effectiveTextType === 'heading_paragraph' ? (editorHeading || block.heading) : block.heading,
                    subheading: effectiveTextType === 'subheading_paragraph' ? (editorSubheading || block.subheading) : block.subheading,
                    updatedAt: new Date().toISOString(),
                    textType: effectiveTextType || block.textType
                  }
                : block
            );
          } catch (error) {
            console.error('Error updating contentBlocks:', error);
            toast.error('Failed to update content blocks');
            return blocks;
          }
        });

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
                  heading: effectiveTextType === 'heading_paragraph' ? (editorHeading || block.heading) : block.heading,
                  subheading: effectiveTextType === 'subheading_paragraph' ? (editorSubheading || block.subheading) : block.subheading,
                  updatedAt: new Date().toISOString(),
                  textType: effectiveTextType || block.textType
                } : block
              )
            }
          }));
        }
      } else {
        // For new blocks
        const effectiveTextTypeForNew = currentTextType || 'paragraph';
        let newBlockContent = '';
        
        // Generate content based on textType
        if (effectiveTextTypeForNew === 'heading_paragraph' || effectiveTextTypeForNew === 'subheading_paragraph') {
          const headingTag = effectiveTextTypeForNew === 'heading_paragraph' ? 'h1' : 'h2';
          const headingClass = effectiveTextTypeForNew === 'heading_paragraph' ? 'text-2xl font-bold' : 'text-xl font-semibold';
          
          newBlockContent = `
            <div class="content-block">
              <${headingTag} class="${headingClass} text-gray-800 mb-4">${editorHeading || (effectiveTextTypeForNew === 'heading_paragraph' ? 'Heading' : 'Subheading')}</${headingTag}>
              <div class="prose prose-lg max-w-none text-gray-700">
                ${editorHtml || 'Start typing your content here...'}
              </div>
            </div>
          `;
        } else if (effectiveTextTypeForNew === 'heading') {
          // Preserve Quill editor styling including alignment
          let styledContent = editorHtml || 'Heading';
          
          // If the content doesn't have proper heading tags, wrap it in h1 with default styling
          if (!styledContent.includes('<h1') && !styledContent.includes('<h2') && !styledContent.includes('<h3')) {
            styledContent = `<h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">${styledContent}</h1>`;
          } else {
            // Ensure h1 tags have proper default size if no size is specified, but preserve alignment
            styledContent = styledContent.replace(/<h1([^>]*?)>/g, (match, attrs) => {
              if (!attrs.includes('style') || !attrs.includes('font-size')) {
                return `<h1${attrs} style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0; line-height: 1.2;">`;
              }
              return match;
            });
          }
          
          newBlockContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                ${styledContent}
              </article>
            </div>`;
        } else if (effectiveTextTypeForNew === 'subheading') {
          // Preserve Quill editor styling including alignment
          let styledContent = editorHtml || 'Subheading';
          
          // If the content doesn't have proper heading tags, wrap it in h2 with default styling
          if (!styledContent.includes('<h1') && !styledContent.includes('<h2') && !styledContent.includes('<h3')) {
            styledContent = `<h2 style="font-size: 20px; font-weight: 600; margin: 0;">${styledContent}</h2>`;
          } else {
            // Ensure h2 tags have proper default size if no size is specified, but preserve alignment
            styledContent = styledContent.replace(/<h2([^>]*?)>/g, (match, attrs) => {
              if (!attrs.includes('style') || !attrs.includes('font-size')) {
                return `<h2${attrs} style="font-size: 20px; font-weight: 600; margin: 0;">`;
              }
              return match;
            });
          }
          
          newBlockContent = `
            <div class="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <article class="max-w-none">
                <div class="prose prose-lg max-w-none">
                  ${styledContent}
                </div>
              </article>
            </div>`;
        }
        
        const newBlock = {
          id: `text_${Date.now()}`,
          block_id: `text_${Date.now()}`,
          type: 'text',
          title: editorTitle || 'Text Block',
          content: newBlockContent,
          html_css: newBlockContent,
          textType: effectiveTextTypeForNew,
          heading: effectiveTextTypeForNew === 'heading_paragraph' ? editorHeading : undefined,
          subheading: effectiveTextTypeForNew === 'subheading_paragraph' ? editorSubheading : undefined,
          style: textTypes.find(t => t.id === effectiveTextTypeForNew)?.style || {},
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
      
      // Show success message
      toast.success('Text block updated successfully');
      
    } catch (error) {
      console.error('Error in handleTextEditorSave:', error);
      toast.error('Failed to save text block. Please try again.');
    }
  };

  const handleTextEditorClose = () => {
    setShowTextEditorDialog(false);
    setEditorTitle('');
    setEditorHtml('');
    setCurrentTextBlockId(null);
    setCurrentTextType(null);
    setEditorHeading('');
    setEditorSubheading('');
    setEditorContent('');
    setMasterHeadingGradient('gradient1');
  };

  const handleEditorSave = () => {
    if (!currentBlock) return;

    let updatedContent = '';
    const effectiveTextType = currentBlock.textType;

    // Generate updated content based on text type
    if (effectiveTextType === 'heading_paragraph' || effectiveTextType === 'heading-paragraph') {
      updatedContent = `${editorHeading}|||${editorContent}`;
    } else if (effectiveTextType === 'subheading_paragraph' || effectiveTextType === 'subheading-paragraph') {
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
              heading: (effectiveTextType === 'heading_paragraph' || effectiveTextType === 'heading-paragraph') ? editorHeading : block.heading,
              subheading: (effectiveTextType === 'subheading_paragraph' || effectiveTextType === 'subheading-paragraph') ? editorSubheading : block.subheading,
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
              heading: (effectiveTextType === 'heading_paragraph' || effectiveTextType === 'heading-paragraph') ? editorHeading : block.heading,
              subheading: (effectiveTextType === 'subheading_paragraph' || effectiveTextType === 'subheading-paragraph') ? editorSubheading : block.subheading,
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
     
      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        alert('Image size should be less than 50MB');
        return;
      }
     
      // Show image editor instead of directly setting the file
      setImageToEdit(file);
      setImageEditorTitle('Edit Image');
      setShowImageEditor(true);
    } else if (name === 'title') {
      setImageTitle(value);
    } else if (name === 'description') {
      setImageDescription(value);
    }
  };

  // Image Editor callbacks
  const handleImageEditorSave = (editedFile) => {
    // Check if this is inline editing (currentBlock has an id)
    if (currentBlock && currentBlock.id) {
      // Inline editing - upload the edited file directly
      handleImageFileUpload(currentBlock.id, editedFile);
    } else {
      // Regular image dialog editing
      setImageFile(editedFile);
      setImagePreview(URL.createObjectURL(editedFile));
    }
    
    setShowImageEditor(false);
    setImageToEdit(null);
    setCurrentBlock(null);
  };

  const handleImageEditorClose = () => {
    setShowImageEditor(false);
    setImageToEdit(null);
  };

  // Inline image editing with image editor
  const handleInlineImageFileUpload = (blockId, file) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPG or PNG images');
      return;
    }
   
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('Image size should be less than 50MB');
      return;
    }

    // Show image editor for inline editing
    setImageToEdit(file);
    setImageEditorTitle('Edit Image');
    setShowImageEditor(true);
    
    // Store the block ID for when the editor saves
    setCurrentBlock({ id: blockId });
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
      const alignment = currentBlock?.alignment || 'left';
      const imageFirst = alignment === 'left';
      const imageOrder = imageFirst ? 'order-1' : 'order-2';
      const textOrder = imageFirst ? 'order-2' : 'order-1';
      
      htmlContent = `
        <div class="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-6">
          <div class="${imageOrder}">
            <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded-lg shadow-lg" />
          </div>
          <div class="${textOrder}">
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
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="max-w-full max-h-[28rem] object-contain rounded-xl shadow-lg mx-auto" />
          ${textContent ? `<span class="text-gray-600 mt-4 italic text-lg">${textContent}</span>` : ''}
        </div>
      `;
    } else if (layout === 'full-width') {
      htmlContent = `
        <div class="space-y-3">
          <img src="${imageUrl}" alt="${imageTitle || 'Image'}" class="w-full max-h-[28rem] object-contain rounded" />
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

    // Determine which alignment to use based on layout
    const finalAlignment = layout === 'side-by-side' ? imageAlignment : standaloneImageAlignment;

    const newBlock = {
      id: currentBlock?.id || `image-${Date.now()}`,
      block_id: currentBlock?.id || `image-${Date.now()}`,
      type: 'image',
      title: imageTitle,
      layout: layout || undefined,
      templateType: templateType || undefined,
      alignment: finalAlignment, // Include appropriate alignment
      details: {
        image_url: imageUrl,
        caption: textContent || '',
        alt_text: imageTitle,
        layout: layout || undefined,
        template: templateType || undefined,
        alignment: finalAlignment
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

    // Check if we're inserting at a specific position first (highest priority)
    if (insertionPosition !== null) {
      // Insert at specific position in contentBlocks (always update this for immediate UI)
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
              content: newContent
            }
          };
        });
      }
      setInsertionPosition(null);
      setCurrentBlock(null);
    } else if (currentBlock && contentBlocks.find(b => b.id === currentBlock.id)) {
      // Update existing block locally (edit mode) - only if the block actually exists in contentBlocks
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
      setCurrentBlock(null);
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
      
      // Set appropriate alignment based on layout
      const blockAlignment = block.alignment || 'left';
      if (block.layout === 'side-by-side') {
        setImageAlignment(blockAlignment);
      } else {
        setStandaloneImageAlignment(blockAlignment);
      }
      
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

  const handleAddAudio = async () => {
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
      try {
        setIsUploading(true);
        const upload = await uploadAudioResource(audioFile, { folder: 'lesson-audio', public: true, type: 'audio' });
        if (!upload?.success || !upload?.audioUrl) {
          throw new Error('Audio upload failed');
        }
        finalAudioUrl = upload.audioUrl;
      } catch (e) {
        setIsUploading(false);
        toast.error(e.message || 'Audio upload failed');
        return;
      } finally {
        setIsUploading(false);
      }
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
      
      // Also update lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: prevLessonContent.data.content.map(block =>
              block.block_id === currentBlock.id ? {
                ...audioBlock,
                block_id: currentBlock.id,
                details: {
                  audio_url: finalAudioUrl,
                  caption: audioTitle,
                  description: audioDescription
                }
              } : block
            )
          }
        }));
      }
    } else {
      // Add new block to local edit list
      setContentBlocks(prev => [...prev, audioBlock]);
      
      // Also add to lessonContent if it exists (for fetched lessons)
      if (lessonContent?.data?.content) {
        const newAudioBlock = {
          ...audioBlock,
          details: {
            audio_url: finalAudioUrl,
            caption: audioTitle,
            description: audioDescription
          }
        };
        setLessonContent(prevLessonContent => ({
          ...prevLessonContent,
          data: {
            ...prevLessonContent.data,
            content: [...prevLessonContent.data.content, newAudioBlock]
          }
        }));
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
                content: newContent
              }
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new link block - only add to contentBlocks like other block handlers
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
                content: newContent
              }
            };
          });
        }
        setInsertionPosition(null);
      } else {
        // Add new block
        setContentBlocks(prev => [...prev, pdfBlock]);
      }
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

              // Mirror fetched content into edit-mode blocks so newly added blocks append after existing ones
              try {
                const fetchedBlocks = Array.isArray(contentData?.data?.content) ? contentData.data.content : [];
                const mappedEditBlocks = fetchedBlocks.map((b, i) => {
                  const base = {
                    id: b.block_id || `block_${i + 1}`,
                    block_id: b.block_id || `block_${i + 1}`,
                    type: b.type,
                    order: i + 1,
                    html_css: b.html_css || '',
                    details: b.details || {},
                    isEditing: false,
                    timestamp: new Date().toISOString()
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
                      text: b.details?.caption || ''
                    };
                  }
                  
                  if (b.type === 'pdf') {
                    return {
                      ...base,
                      type: 'pdf',
                      pdfUrl: b.details?.pdf_url || '',
                      pdfTitle: b.details?.caption || 'PDF Document',
                      pdfDescription: b.details?.description || ''
                    };
                  }
                  if (b.type === 'video') {
                    return {
                      ...base,
                      type: 'video',
                      videoUrl: b.details?.video_url || '',
                      videoTitle: b.details?.caption || ''
                    };
                  }
                  if (b.type === 'statement') {
                    return {
                      ...base,
                      type: 'statement',
                      title: b.details?.title || 'Statement',
                      statementType: b.details?.statement_type || b.details?.statementType || 'statement-a',
                      content: b.details?.content || '',
                      html_css: b.html_css || ''
                    };
                  }
                  if (b.type === 'table') {
                    return {
                      ...base,
                      type: 'table',
                      title: b.details?.title || 'Table',
                      tableType: b.details?.table_type || b.details?.templateId || b.tableType || 'two_columns',
                      templateId: b.details?.table_type || b.details?.templateId || b.tableType || 'two_columns',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || ''
                    };
                  }
                  if (b.type === 'quote') {
                    return {
                      ...base,
                      type: 'quote',
                      title: b.details?.title || 'Quote',
                      textType: b.details?.quote_type || b.details?.quoteType || b.textType || 'quote_a',
                      quoteType: b.details?.quote_type || b.details?.quoteType || b.textType || 'quote_a',
                      content: b.details?.content || b.content || '',
                      html_css: b.html_css || ''
                    };
                  }
                  if (b.type === 'divider') {
                    // Determine divider subtype from details, subtype, or HTML
                    let dividerSubtype = b.details?.divider_type || b.subtype;
                    if (!dividerSubtype && typeof b.html_css === 'string') {
                      const html = b.html_css;
                      if ((html.includes('cursor-pointer') || html.includes('letter-spacing')) && (html.includes('background-color') || html.includes('bg-blue'))) {
                        dividerSubtype = 'continue';
                      } else if ((html.includes('rounded-full') || html.includes('border-radius: 50%')) && (html.includes('<hr') || html.includes('border-top'))) {
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
                      html_css: b.html_css || ''
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
                        console.log('Could not parse interactive content as JSON');
                      }
                    }
                    
                    // If still no template, detect from HTML patterns
                    if (!template && b.html_css) {
                      const htmlContent = b.html_css;
                      if (htmlContent.includes('data-template="accordion"') || 
                          htmlContent.includes('accordion-header') || 
                          htmlContent.includes('accordion-content') ||
                          htmlContent.includes('interactive-accordion')) {
                        template = 'accordion';
                      } else if (htmlContent.includes('data-template="tabs"') || 
                                 htmlContent.includes('tab-button') ||
                                 htmlContent.includes('interactive-tabs')) {
                        template = 'tabs';
                      } else if (htmlContent.includes('data-template="labeled-graphic"') || 
                                 htmlContent.includes('labeled-graphic-container')) {
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
                      html_css: b.html_css || ''
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
                        console.log('Could not parse existing audio content, reconstructing from details');
                      }
                    }
                    
                    // If content is empty or parsing failed, reconstruct from details
                    if (!audioContent.title && !audioContent.url) {
                      audioContent = {
                        title: b.details?.audioTitle || b.details?.title || b.title || 'Audio',
                        description: b.details?.audioDescription || b.details?.description || '',
                        uploadMethod: b.details?.uploadMethod || 'url',
                        url: b.details?.audioUrl || b.details?.audio_url || '',
                        uploadedData: b.details?.uploadedData || null,
                        createdAt: b.createdAt || new Date().toISOString()
                      };
                    }
                    
                    return {
                      ...base,
                      type: 'audio',
                      title: audioContent.title || 'Audio',
                      content: JSON.stringify(audioContent),
                      html_css: b.html_css || ''
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
                        console.log('Could not parse existing YouTube content, reconstructing from details');
                      }
                    }
                    
                    // If content is empty or parsing failed, reconstruct from details
                    if (!youTubeContent.url || youTubeContent.url.trim() === '') {
                      console.log('Reconstructing YouTube content from details:', b.details);
                      console.log('Available block data:', {
                        details: b.details,
                        content: b.content,
                        html_css: b.html_css ? 'Present' : 'Missing'
                      });
                      
                      youTubeContent = {
                        title: b.details?.youTubeTitle || b.details?.title || b.title || 'YouTube Video',
                        description: b.details?.youTubeDescription || b.details?.description || '',
                        url: b.details?.youTubeUrl || b.details?.youtube_url || '',
                        videoId: b.details?.videoId || '',
                        embedUrl: b.details?.embedUrl || '',
                        createdAt: b.createdAt || new Date().toISOString()
                      };
                      
                      // If still no URL found, try to extract from html_css as last resort
                      if (!youTubeContent.url && b.html_css) {
                        const srcMatch = b.html_css.match(/src="([^"]*youtube\.com\/embed\/[^"]*)"/) || 
                                        b.html_css.match(/src="([^"]*youtu\.be\/[^"]*)"/) ||
                                        b.html_css.match(/src="([^"]*youtube\.com\/watch\?v=[^"]*)"/) ;
                        if (srcMatch) {
                          const extractedUrl = srcMatch[1];
                          console.log('Extracted URL from html_css:', extractedUrl);
                          
                          // Convert embed URL back to watch URL if needed
                          let watchUrl = extractedUrl;
                          if (extractedUrl.includes('/embed/')) {
                            const videoId = extractedUrl.split('/embed/')[1].split('?')[0];
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
                      hasUrl: !!youTubeContent.url
                    });
                    
                    return {
                      ...base,
                      type: 'youtube',
                      title: youTubeContent.title || 'YouTube Video',
                      content: JSON.stringify(youTubeContent),
                      html_css: b.html_css || ''
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
                    const isMasterHeading = hasH1 && (lowered.includes('linear-gradient') || lowered.includes('gradient'));
                    
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
                console.warn('Failed to map fetched content to edit blocks:', e);
              }
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
        {/* Content Blocks Sidebar */}
        <div
          className="fixed top-16 h-[calc(100vh-4rem)] z-40 bg-white shadow-sm border-r border-gray-200 overflow-y-auto w-72 flex-shrink-0"
          style={{
            left: sidebarCollapsed ? "4.5rem" : "17rem"
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

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 relative ${
            sidebarCollapsed
              ? 'ml-[calc(4.5rem+16rem)]'
              : 'ml-[calc(17rem+16rem)]'
          }`}
        >
          {/* Fixed Header */}
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30"
               style={{
                 left: sidebarCollapsed ? "calc(4.5rem + 16rem)" : "calc(17rem + 16rem)"
               }}>
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
                <h1 className="text-lg font-bold">{lessonData?.title || lessonTitle || 'Untitled Lesson'}</h1>
              </div>
             
              <div className="flex items-center space-x-3">
                {/* Auto-save status indicator */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-sm">
                    {autoSaveStatus === 'changes_detected' && (
                      <>
                        <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse"></div>
                        <span className="text-yellow-600 font-medium">Changes detected...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saving' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-blue-600 font-medium">Saving...</span>
                      </>
                    )}
                    {autoSaveStatus === 'saved' && hasUnsavedChanges === false && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">All changes saved</span>
                      </>
                    )}
                    {autoSaveStatus === 'error' && (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Save failed</span>
                      </>
                    )}
                  </div>
                  {autoSaveStatus !== 'saving' && autoSaveStatus !== 'changes_detected' && (
                    <span className="text-xs text-gray-500 mt-0.5">Auto-save enabled</span>
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
                  title="Manually save changes now"
                >
                  {isUploading || autoSaveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
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
                    const allBlocks = (lessonContent?.data?.content && lessonContent.data.content.length > 0)
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
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              {/* Floating elements */}
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                            </div>

                            {/* Main heading */}
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
                              Ready to Create Something Amazing?
                            </h2>
                            
                            {/* Subtitle */}
                            <p className="text-base text-gray-600 mb-6 leading-relaxed">
                              Your lesson canvas is waiting! Start building engaging content by adding blocks from the sidebar.
                            </p>

                            {/* Feature highlights */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                  </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Rich Content</h4>
                                <p className="text-sm text-gray-600 text-center">Add text, images, videos & more</p>
                              </div>
                              
                              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                  </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Interactive</h4>
                                <p className="text-sm text-gray-600 text-center">Drag & drop to organize</p>
                              </div>
                              
                              <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl border border-pink-100">
                                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-3">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-1">Fast & Easy</h4>
                                <p className="text-sm text-gray-600 text-center">Build lessons in minutes</p>
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
                        const blocksToRender = (lessonContent?.data?.content && lessonContent.data.content.length > 0)
                          ? lessonContent.data.content
                          : contentBlocks;
                        
                        console.log('Rendering blocks from single source:', {
                          source: lessonContent?.data?.content?.length > 0 ? 'lessonContent' : 'contentBlocks',
                          totalBlocks: blocksToRender.length,

                          blockIds: blocksToRender.map(b => b.id || b.block_id)
                        });
                        
                        return blocksToRender.map((block, index) => {
                          const blockId = block.id || block.block_id;
                          return (
                        <div
                          key={blockId}
                          data-block-id={blockId}
                          className="relative group bg-white rounded-lg"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, blockId)}
                        >
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {!block.isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 hover:bg-gray-200"
                                onClick={() => {
                                  // Always use handleEditBlock for proper type detection
                                  if (block.type === 'image' && block.layout) {
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
                              onDragStart={(e) => handleDragStart(e, blockId)}
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
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div
                                    className="max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
                                )}
                              </div>
                            )}

                            {block.type === 'statement' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">Statement</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Statement
                                  </Badge>
                                </div>
                                
                                {block.html_css ? (
                                  <div
                                    className="max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div
                                    className="max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
                                )}
                              </div>
                            )}
                           
                            {block.type === 'interactive' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">Interactive</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Interactive
                                  </Badge>
                                </div>
                                
                                {block.html_css ? (
                                  <div
                                    className="max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div
                                    className="max-w-none text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
                                  />
                                )}
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
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title?.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim() || 'Video'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Video
                                  </Badge>
                                </div>
                                
                                {(() => {
                                  // First try to get video URL from block properties (for newly created blocks)
                                  let videoUrl = block.videoUrl || block.details?.video_url || '';
                                  let videoTitle = (block.videoTitle || block.details?.caption || 'Video').replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                                  let videoDescription = block.videoDescription || block.details?.description || '';
                                  
                                  console.log('Video block edit rendering:', {
                                    blockId: block.id,
                                    videoUrl,
                                    videoTitle,
                                    videoDescription,
                                    blockDetails: block.details,
                                    hasUrl: !!videoUrl
                                  });
                                  
                                  // Check if we have a valid video URL
                                  if (videoUrl && videoUrl.trim()) {
                                    // Check if it's a YouTube URL by looking at the content or checking if it's an embed URL
                                    const isYouTubeVideo = videoUrl.includes('youtube.com/embed') || 
                                                          (block.content && JSON.parse(block.content).isYouTube) ||
                                                          (block.details && block.details.isYouTube);
                                    
                                    return (
                                      <>
                                        {videoDescription && (
                                          <p className="text-sm text-gray-600 mb-3">{videoDescription}</p>
                                        )}
                                        
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          {isYouTubeVideo ? (
                                            <iframe
                                              src={videoUrl}
                                              title={videoTitle}
                                              className="w-full max-w-full"
                                              style={{ height: '400px', borderRadius: '8px' }}
                                              frameBorder="0"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                            />
                                          ) : (
                                            <video controls className="w-full max-w-full" style={{ maxHeight: '400px' }} preload="metadata">
                                              <source src={videoUrl} type="video/mp4" />
                                              <source src={videoUrl} type="video/webm" />
                                              <source src={videoUrl} type="video/ogg" />
                                              Your browser does not support the video element.
                                            </video>
                                          )}
                                          
                                        </div>
                                      </>
                                    );
                                  } else {
                                    // Fallback: Use html_css if video URL not found
                                    console.log('No URL in video block, falling back to html_css');
                                    if (block.html_css && block.html_css.trim()) {
                                      return (
                                        <div
                                          className="max-w-none"
                                          dangerouslySetInnerHTML={{ __html: block.html_css }}
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">Video URL not found</p>
                                          <p className="text-xs text-gray-400 mt-1">Block details: {JSON.stringify(block.details)}</p>
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
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title || 'Audio'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Audio
                                  </Badge>
                                </div>
                                
                                {(() => {
                                  try {
                                    const audioContent = JSON.parse(block.content || '{}');
                                    console.log('Audio block edit rendering:', {
                                      blockId: block.id,
                                      audioContent,
                                      hasUrl: !!audioContent.url,
                                      url: audioContent.url
                                    });
                                    
                                    // Check if we have a valid audio URL
                                    if (audioContent.url && audioContent.url.trim()) {
                                      return (
                                        <>
                                          {audioContent.description && (
                                            <p className="text-sm text-gray-600 mb-3">{audioContent.description}</p>
                                          )}
                                          
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <audio controls className="w-full" preload="metadata">
                                              <source src={audioContent.url} type="audio/mpeg" />
                                              <source src={audioContent.url} type="audio/wav" />
                                              <source src={audioContent.url} type="audio/ogg" />
                                              Your browser does not support the audio element.
                                            </audio>
                                            
                                            {audioContent.uploadedData && (
                                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                <Volume2 className="h-3 w-3 mr-1" />
                                                <span>{audioContent.uploadedData.fileName}</span>
                                                <span className="ml-2">({(audioContent.uploadedData.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      );
                                    } else {
                                      // Fallback: Use html_css if JSON doesn't have URL
                                      console.log('No URL in audio content, falling back to html_css');
                                      if (block.html_css && block.html_css.trim()) {
                                        return (
                                          <div
                                            className="max-w-none"
                                            dangerouslySetInnerHTML={{ __html: block.html_css }}
                                          />
                                        );
                                      } else {
                                        return (
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">Audio URL not found</p>
                                            <p className="text-xs text-gray-400 mt-1">Content: {JSON.stringify(audioContent)}</p>
                                          </div>
                                        );
                                      }
                                    }
                                  } catch (e) {
                                    console.error('Error parsing audio content in edit mode:', e);
                                    // Fallback: Use html_css if JSON parsing fails
                                    if (block.html_css && block.html_css.trim()) {
                                      return (
                                        <div
                                          className="max-w-none"
                                          dangerouslySetInnerHTML={{ __html: block.html_css }}
                                        />
                                      );
                                    } else {
                                      return (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                          <p className="text-sm text-gray-500">Audio content could not be loaded</p>
                                          <p className="text-xs text-gray-400 mt-1">Error: {e.message}</p>
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
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title || 'YouTube Video'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    YouTube
                                  </Badge>
                                </div>
                                
                                {(() => {
                                  try {
                                    const youTubeContent = JSON.parse(block.content || '{}');
                                    console.log('YouTube block edit rendering:', {
                                      blockId: block.id,
                                      youTubeContent,
                                      hasUrl: !!youTubeContent.url,
                                      url: youTubeContent.url
                                    });
                                    
                                    // Check if we have a valid YouTube URL
                                    if (youTubeContent.url && youTubeContent.url.trim()) {
                                      return (
                                        <>
                                          {youTubeContent.description && (
                                            <p className="text-sm text-gray-600 mb-3">{youTubeContent.description}</p>
                                          )}
                                          
                                          <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                                              <iframe
                                                className="absolute top-0 left-0 w-full h-full"
                                                src={youTubeContent.embedUrl || youTubeContent.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                title={youTubeContent.title || 'YouTube Video'}
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
                                          <p className="text-sm text-gray-500">YouTube URL not found</p>
                                          <p className="text-xs text-gray-400 mt-1">Content: {JSON.stringify(youTubeContent)}</p>
                                        </div>
                                      );
                                    }
                                  } catch (e) {
                                    console.error('Error parsing YouTube content in edit mode:', e);
                                    // No fallback to html_css to prevent duplication
                                    return (
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500">YouTube content could not be loaded</p>
                                        <p className="text-xs text-gray-400 mt-1">Error: {e.message}</p>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            )}

                            {block.type === 'quote' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title || 'Quote'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Quote
                                  </Badge>
                                </div>
                                
                                {block.html_css ? (
                                  <div
                                    className="max-w-none"
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                    <blockquote className="text-lg italic text-gray-700 mb-3">
                                      "{(() => {
                                        try {
                                          const content = JSON.parse(block.content || '{}');
                                          return content.quote || 'Sample quote text';
                                        } catch {
                                          return 'Sample quote text';
                                        }
                                      })()}"
                                    </blockquote>
                                    <cite className="text-sm font-medium text-gray-500">
                                      — {(() => {
                                        try {
                                          const content = JSON.parse(block.content || '{}');
                                          return content.author || 'Author Name';
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
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title || 'Table'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    Table
                                  </Badge>
                                </div>
                                
                                {block.html_css ? (
                                  <div
                                    className="max-w-none"
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                  </div>
                                )}
                              </div>
                            )}

                            {block.type === 'list' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">{block.title || 'List'}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    List
                                  </Badge>
                                </div>
                                
                                {(() => {
                                  // Check if this is a checkbox list
                                  const isCheckboxList = block.listType === 'checkbox' || 
                                    (block.details && block.details.listType === 'checkbox') ||
                                    (block.details && block.details.list_type === 'checkbox') ||
                                    (block.html_css && block.html_css.includes('checkbox-container'));
                                  
                                  console.log('List block debug:', {
                                    blockId: block.id,
                                    listType: block.listType,
                                    details: block.details,
                                    hasHtmlCss: !!block.html_css,
                                    isCheckboxList,
                                    htmlCssSnippet: block.html_css ? block.html_css.substring(0, 100) : 'none'
                                  });
                                  
                                  if (isCheckboxList && block.html_css) {
                                    console.log('Using InteractiveListRenderer for block:', block.id);
                                    return (
                                      <InteractiveListRenderer 
                                        block={block}
                                        onCheckboxToggle={(blockId, itemIndex, checked) => handleCheckboxToggle(blockId, itemIndex, checked)}
                                      />
                                    );
                                  } else if (block.html_css) {
                                    return (
                                      <div
                                        className="max-w-none"
                                        dangerouslySetInnerHTML={{ __html: block.html_css }}
                                      />
                                    );
                                  } else {
                                    return (
                                      <div className="relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                      </div>
                                    );
                                  }
                                })()}
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
                                                handleInlineImageFileUpload(block.id, file);
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
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm font-medium text-gray-700">Current Image:</span>
                                              
                                            </div>
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
                                              checked={block.alignment === 'left'}
                                              onChange={(e) => handleImageBlockEdit(block.id, 'alignment', e.target.value)}
                                              className="mr-2"
                                            />
                                            <span className="text-sm">Image Left, Text Right</span>
                                          </label>
                                          <label className="flex items-center">
                                            <input
                                              type="radio"
                                              name={`alignment-${block.id}`}
                                              value="right"
                                              checked={block.alignment === 'right'}
                                              onChange={(e) => handleImageBlockEdit(block.id, 'alignment', e.target.value)}
                                              className="mr-2"
                                            />
                                            <span className="text-sm">Image Right, Text Left</span>
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                   
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
                                        {block.alignment === 'right' ? (
                                          // Image Right, Text Left
                                          <>
                                            <div className="w-1/2">
                                              <p className="text-sm text-gray-600 line-clamp-4">
                                                {getPlainText(block.text || '').substring(0, 60)}...
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
                                            {getPlainText(block.text || '').substring(0, 60)}...
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
                                            {getPlainText(block.text || '').substring(0, 50)}...
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    {block.layout === 'centered' && (
                                      <div className={`space-y-3 ${block.alignment === 'left' ? 'text-left' : block.alignment === 'right' ? 'text-right' : 'text-center'}`}>
                                        <img
                                          src={block.imageUrl}
                                          alt="Image"
                                          className={`h-20 object-cover rounded ${block.alignment === 'center' ? 'mx-auto' : ''}`}
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

                            {/* Divider Content */}
                            {block.type === 'divider' && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-lg font-semibold text-gray-900">Divider</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {block.subtype || 'Divider'}
                                  </Badge>
                                </div>
                                
                                {block.html_css ? (
                                  <div
                                    className="max-w-none"
                                    dangerouslySetInnerHTML={{ __html: block.html_css }}
                                  />
                                ) : (
                                  <div
                                    className="max-w-none"
                                    dangerouslySetInnerHTML={{ __html: block.content }}
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
                        })
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
       

      {/* Text Editor Dialog */}
      <Dialog open={showTextEditorDialog} onOpenChange={handleTextEditorClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
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
         
          <div className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
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
                      <div className="flex-1 flex flex-col border rounded-md overflow-visible bg-white" style={{ height: '350px' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('heading')}
                          placeholder="Enter your heading text..."
                          style={{ height: '300px' }}
                          className="quill-editor-overflow-visible"
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
                      <div className="flex-1 flex flex-col border rounded-md overflow-visible bg-white" style={{ height: '350px' }}>
                        <ReactQuill
                          theme="snow"
                          value={editorHtml}
                          onChange={setEditorHtml}
                          modules={getToolbarModules('heading')}
                          placeholder="Enter your subheading text..."
                          style={{ height: '300px' }}
                          className="quill-editor-overflow-visible"
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
                          modules={getToolbarModules('paragraph')}
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
                        <div className="border rounded-md bg-white overflow-visible" style={{ height: '120px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorHeading}
                            onChange={setEditorHeading}
                            modules={getToolbarModules('heading')}
                            placeholder="Type and format your heading here"
                            style={{ height: '80px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paragraph
                        </label>
                        <div className="border rounded-md bg-white overflow-visible" style={{ height: '230px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorContent}
                            onChange={setEditorContent}
                            modules={getToolbarModules('paragraph')}
                            placeholder="Type and format your paragraph text here"
                            style={{ height: '180px' }}
                            className="quill-editor-overflow-visible"
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
                            modules={getToolbarModules('paragraph')}
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
               
                // Master Heading with gradient options
                if (textType === 'master_heading') {
                  return (
                    <div className="flex-1 flex flex-col gap-4 h-full">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Master Heading
                        </label>
                        <div className="border rounded-md bg-white overflow-visible" style={{ height: '120px' }}>
                          <ReactQuill
                            theme="snow"
                            value={editorHtml}
                            onChange={setEditorHtml}
                            modules={getToolbarModules('heading')}
                            placeholder="Enter your master heading text..."
                            style={{ height: '80px' }}
                            className="quill-editor-overflow-visible"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gradient Color
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {gradientOptions.map((option) => (
                            <div
                              key={option.id}
                              className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                masterHeadingGradient === option.id
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setMasterHeadingGradient(option.id)}
                            >
                              <div 
                                className={`h-8 w-full rounded bg-gradient-to-r ${option.preview} mb-2`}
                                style={{ background: option.gradient }}
                              />
                              <p className="text-xs text-center text-gray-600 font-medium">
                                {option.name}
                              </p>
                              {masterHeadingGradient === option.id && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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
                    <div className="flex-1 flex flex-col border rounded-md overflow-visible bg-white">
                      <ReactQuill
                        theme="snow"
                        value={editorHtml}
                        onChange={setEditorHtml}
                        modules={getToolbarModules('heading')}
                        placeholder="Enter your heading text..."
                        className="flex-1 quill-editor-overflow-visible"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
         
          <DialogFooter className="border-t pt-4 flex justify-end gap-2 px-6 pb-4">
            <Button variant="outline" onClick={handleTextEditorClose} className="min-w-[80px]">
              Cancel
            </Button>
            <Button
              onClick={handleTextEditorSave}
              className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
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
                      modules={getToolbarModules('paragraph')}
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
            
            {/* Image Alignment Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Alignment
              </label>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">For Image & Text blocks:</div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageAlignment"
                      value="left"
                      checked={imageAlignment === 'left'}
                      onChange={(e) => setImageAlignment(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Image Left, Text Right</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageAlignment"
                      value="right"
                      checked={imageAlignment === 'right'}
                      onChange={(e) => setImageAlignment(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Image Right, Text Left</span>
                  </label>
                </div>
                
                <div className="text-sm text-gray-600 mb-2 mt-4">For standalone images:</div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="standaloneImageAlignment"
                      value="left"
                      checked={standaloneImageAlignment === 'left'}
                      onChange={(e) => setStandaloneImageAlignment(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Left Aligned</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="standaloneImageAlignment"
                      value="center"
                      checked={standaloneImageAlignment === 'center'}
                      onChange={(e) => setStandaloneImageAlignment(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Center Aligned</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="standaloneImageAlignment"
                      value="right"
                      checked={standaloneImageAlignment === 'right'}
                      onChange={(e) => setStandaloneImageAlignment(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Right Aligned</span>
                  </label>
                </div>
              </div>
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
                    JPG, PNG up to 50MB
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
      
      {/* Image Editor */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={handleImageEditorClose}
        imageFile={imageToEdit}
        onSave={handleImageEditorSave}
        title={imageEditorTitle}
      />


      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={handleLinkDialogClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentLinkBlock ? 'Edit Link' : 'Add Link'}</DialogTitle>
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
              {currentLinkBlock ? 'Save' : 'Add Link'}
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
            <Button variant="outline" onClick={handlePdfDialogClose} disabled={mainPdfUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPdf}
              disabled={mainPdfUploading || !pdfTitle || (pdfUploadMethod === 'file' && !pdfFile) || (pdfUploadMethod === 'url' && !pdfUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mainPdfUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {pdfUploadMethod === 'file' ? 'Uploading PDF...' : 'Adding PDF...'}
                </>
              ) : (
                currentBlock ? 'Update PDF' : 'Add PDF'
              )}
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

      {/* Insert Block Dialog */}
      <Dialog open={showInsertBlockDialog} onOpenChange={setShowInsertBlockDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Insert Content Block</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Choose a block type to insert at this position
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {contentBlockTypes.map((blockType) => (
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
            <Button variant="outline" onClick={() => setShowInsertBlockDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

export default LessonBuilder;
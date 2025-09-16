import { Quill } from 'react-quill';

// Register font families with proper display names
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'impact', 'roboto'];
Quill.register(Font, true);

// Register font sizes - simplified to 4 options
const Size = Quill.import('formats/size');
Size.whitelist = ['small', 'normal', 'large', 'huge'];
Quill.register(Size, true);

// Universal toolbar for paragraph/content
export const paragraphToolbar = [
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
export const headingToolbar = [
  [{ 'font': Font.whitelist }],
  [{ 'size': Size.whitelist }],
  ['bold', 'italic', 'underline'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['clean']
];

// Comprehensive toolbar modules for all text types
export const getToolbarModules = (type = 'full') => {
  // Default base toolbar (includes size picker)
  const baseToolbar = [
    [{ 'font': Font.whitelist }],
    [{ 'size': Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }]
  ];

  // For heading-only and subheading-only editors, REMOVE size picker
  if (type === 'heading' || type === 'subheading') {
    return {
      toolbar: [
        [{ 'font': Font.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
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
import Quill from 'quill';

// Register font families with proper display names
const Font = Quill.import('formats/font');
Font.whitelist = [
  'arial',
  'helvetica',
  'times',
  'courier',
  'verdana',
  'georgia',
  'impact',
  'roboto',
];
Quill.register(Font, true);

// Register custom font sizes with expanded options
const Size = Quill.import('formats/size');
Size.whitelist = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '48px',
  '56px',
  '64px',
  '72px',
];
Quill.register(Size, true);

// Add custom CSS for Quill picker dropdowns to prevent overflow issues
const quillOverflowCSS = `
  .quill-editor-overflow-visible .ql-toolbar {
    position: relative;
    z-index: 1000;
  }

  .quill-editor-overflow-visible .ql-picker-options {
    max-height: 200px;
    overflow-y: auto;
    z-index: 10000 !important;
  }

  .quill-editor-overflow-visible .ql-picker.ql-expanded .ql-picker-options {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 2px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000 !important;
  }

  /* Ensure parent containers don't clip the picker */
  .ql-container {
    overflow: visible !important;
  }

  .ql-editor {
    overflow-y: auto;
  }

  /* Style scrollbar for picker options */
  .ql-picker-options::-webkit-scrollbar {
    width: 6px;
  }

  .ql-picker-options::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .ql-picker-options::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .ql-picker-options::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Inject the CSS
if (
  typeof document !== 'undefined' &&
  !document.getElementById('quill-overflow-css')
) {
  const style = document.createElement('style');
  style.id = 'quill-overflow-css';
  style.textContent = quillOverflowCSS;
  document.head.appendChild(style);
}

// Comprehensive toolbar modules for all text types
export const getToolbarModules = (type = 'full') => {
  // Default base toolbar (includes size picker)
  const baseToolbar = [
    [{ font: Font.whitelist }],
    [{ size: Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }],
    [{ align: [] }],
  ];

  // For heading-only and subheading-only editors, include size picker and custom alignment
  if (type === 'heading' || type === 'subheading') {
    return {
      toolbar: [
        [{ font: Font.whitelist }],
        [{ size: Size.whitelist }],
        ['bold', 'italic', 'underline'],
        [{ color: [] }],
        [
          { align: '' },
          { align: 'center' },
          { align: 'right' },
          { align: 'justify' },
        ],
      ],
    };
  }

  // Simplified toolbar for paragraph blocks with alignment
  if (type === 'paragraph') {
    return {
      toolbar: [
        [{ font: Font.whitelist }],
        [{ size: Size.whitelist }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }],
        [
          { align: '' },
          { align: 'center' },
          { align: 'right' },
          { align: 'justify' },
        ],
      ],
    };
  }

  if (type === 'full') {
    return {
      toolbar: [
        ...baseToolbar,
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    };
  }

  return {
    toolbar: [...baseToolbar, ['clean']],
  };
};

export { Font, Size };

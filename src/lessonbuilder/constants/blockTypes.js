// Export plain JavaScript objects without JSX to avoid syntax errors
// Icons will be rendered by the consuming components

export const contentBlockTypes = [
  {
    id: 'text',
    title: 'Text Block',
    description: 'Rich text content with formatting',
    iconName: 'Type',
    category: 'content',
  },
  {
    id: 'heading',
    title: 'Heading',
    description: 'Section headings and titles',
    iconName: 'Heading1',
    category: 'content',
  },
  {
    id: 'statement',
    title: 'Important Statement',
    description: 'Highlighted key information',
    iconName: 'AlertCircle',
    category: 'content',
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Blockquotes and citations',
    iconName: 'Quote',
    category: 'content',
  },
  {
    id: 'list',
    title: 'List',
    description: 'Bulleted or numbered lists',
    iconName: 'List',
    category: 'content',
  },
  {
    id: 'checklist',
    title: 'Checklist',
    description: 'Interactive task checklist',
    iconName: 'CheckSquare',
    category: 'interactive',
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Photos, diagrams, and illustrations',
    iconName: 'Image',
    category: 'media',
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Video files and embedded content',
    iconName: 'Video',
    category: 'media',
  },
  {
    id: 'audio',
    title: 'Audio',
    description: 'Audio files and recordings',
    iconName: 'AudioLines',
    category: 'media',
  },
  {
    id: 'youtube',
    title: 'YouTube Video',
    description: 'Embedded YouTube videos',
    iconName: 'Youtube',
    category: 'media',
  },
  {
    id: 'link',
    title: 'Link',
    description: 'External links and resources',
    iconName: 'Link',
    category: 'interactive',
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Data tables and comparisons',
    iconName: 'Table',
    category: 'content',
  },
  {
    id: 'pdf',
    title: 'PDF Document',
    description: 'Embedded PDF files',
    iconName: 'FileText',
    category: 'media',
  },
  {
    id: 'scorm',
    title: 'SCORM Package',
    description: 'Interactive SCORM content',
    iconName: 'Box',
    category: 'interactive',
  },
];

export const blockCategories = {
  content: {
    label: 'Content',
    description: 'Text-based content blocks',
  },
  media: {
    label: 'Media',
    description: 'Images, videos, and audio',
  },
  interactive: {
    label: 'Interactive',
    description: 'Interactive and engaging elements',
  },
};

export const getBlockTypeById = id => {
  return contentBlockTypes.find(type => type.id === id);
};

export const getBlockTypesByCategory = category => {
  return contentBlockTypes.filter(type => type.category === category);
};

import { Heading1, Heading2, Text, Type } from 'lucide-react';

export const textTypes = [
  {
    id: 'heading',
    icon: <Heading1 className="h-5 w-5" />,
    preview: <h1 className="text-2xl font-bold mb-2">Heading</h1>,
    defaultContent: '<h1 class="text-2xl font-bold text-gray-800">Heading</h1>',
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1F2937',
    },
  },
  {
    id: 'master_heading',
    icon: <Heading1 className="h-5 w-5" />,
    preview: (
      <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Master Heading
        </h1>
      </div>
    ),
    defaultContent:
      '<div class="rounded-xl p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"><h1 class="text-4xl font-extrabold tracking-tight">Master Heading</h1></div>',
    style: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#FFFFFF',
      background:
        'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      padding: '16px',
      borderRadius: '12px',
    },
  },
  {
    id: 'subheading',
    icon: <Heading2 className="h-5 w-5" />,
    preview: <h2 className="text-xl font-semibold mb-2">Subheading</h2>,
    defaultContent:
      '<h2 class="text-xl font-semibold text-gray-800">Subheading</h2>',
    style: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#374151',
    },
  },
  {
    id: 'paragraph',
    icon: <Text className="h-5 w-5" />,
    preview: <p className="text-gray-700">This is a paragraph of text.</p>,
    defaultContent:
      '<p class="text-base text-gray-700">Start typing your text here...</p>',
    style: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#4B5563',
    },
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
    defaultContent:
      '<h1>Heading</h1><p>This is a paragraph below the heading.</p>',
  },
  {
    id: 'subheading_paragraph',
    icon: <Type className="h-5 w-5" />,
    preview: (
      <div>
        <h2 className="text-xl font-semibold mb-2">Subheading</h2>
        <p className="text-gray-700">
          This is a paragraph below the subheading.
        </p>
      </div>
    ),
    defaultContent:
      '<h2>Subheading</h2><p>This is a paragraph below the subheading.</p>',
  },
];

import { Image } from 'lucide-react';

export const imageTemplates = [
  {
    id: 'image-text',
    title: 'Image & text',
    description: 'Image with text content side by side',
    icon: <Image className="h-6 w-6" />,
    layout: 'side-by-side',
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
  },
  {
    id: 'ai-generated',
    title: 'AI Generated Image',
    description: 'Generate custom images using AI prompts',
    icon: <Image className="h-6 w-6" />,
    layout: 'ai-generated',
    defaultContent: {
      imageUrl: '',
      text: 'AI generated image will appear here',
      prompt: ''
    }
  }
];
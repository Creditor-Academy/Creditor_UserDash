import {
  FileText as FileTextIcon,
  MessageSquare,
  Quote,
  Image,
  Video,
  Volume2,
  Youtube,
  Link as LinkIcon,
  Table,
  Box
} from 'lucide-react';

export const contentBlockTypes = [
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
    id: 'tables',
    title: 'Tables',
    icon: <Table className="h-5 w-5" />
  },
];
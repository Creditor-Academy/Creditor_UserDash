import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  File,
  Sparkles,
} from 'lucide-react';

// Dummy content data
const dummyContent = [
  {
    id: 1,
    title: 'Marketing Strategy Guide',
    type: 'PDF',
    format: 'pdf',
    prompt: 'Comprehensive marketing strategy guide for startups',
    createdAt: '2025-01-18T11:00:00Z',
    size: '2.4 MB',
  },
  {
    id: 2,
    title: 'Product Design Handbook',
    type: 'EPUB',
    format: 'epub',
    prompt: 'Complete guide to modern product design principles',
    createdAt: '2025-01-12T15:30:00Z',
    size: '5.1 MB',
  },
  {
    id: 3,
    title: 'Business Plan Template',
    type: 'PDF',
    format: 'pdf',
    prompt: 'Professional business plan template with examples',
    createdAt: '2025-01-08T09:20:00Z',
    size: '1.8 MB',
  },
  {
    id: 4,
    title: 'Content Marketing Playbook',
    type: 'EPUB',
    format: 'epub',
    prompt: 'Step-by-step content marketing playbook',
    createdAt: '2025-01-03T13:45:00Z',
    size: '3.7 MB',
  },
];

const formatDate = dateString => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return '';
  }
};

const getFileBadge = format => {
  const f = format?.toLowerCase() || '';
  if (f.includes('pdf')) {
    return {
      label: 'PDF',
      className: 'bg-rose-50 text-rose-700 border-rose-100',
      icon: FileText,
    };
  }
  if (f.includes('epub')) {
    return {
      label: 'EPUB',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: BookOpen,
    };
  }
  return {
    label: 'File',
    className: 'bg-gray-50 text-gray-700 border-gray-100',
    icon: File,
  };
};

export function AIContentLibrarySection() {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              AI Content Library
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              PDFs, EPUBs, and documents generated with Canva AI
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dummyContent.map(item => {
            const badge = getFileBadge(item.format);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Header with badges */}
                <div className="px-4 pt-4 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] rounded-full px-2.5 py-1 font-semibold border ${badge.className}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </span>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] rounded-full bg-purple-50 px-2 py-1 font-semibold text-purple-700 border border-purple-100">
                    <Sparkles className="h-3 w-3" />
                    Canva
                  </span>
                </div>

                {/* Content */}
                <div className="px-4 py-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                    {item.title}
                  </h3>

                  {item.prompt && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.prompt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.size && (
                      <span className="font-medium">{item.size}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      <ExternalLink className="h-3 w-3" />
                      View
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state message (if needed) */}
        {dummyContent.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No AI content generated yet. Create your first document!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIContentLibrarySection;

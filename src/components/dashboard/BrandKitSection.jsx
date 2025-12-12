import React from 'react';
import { Palette, Type, ExternalLink, Sparkles } from 'lucide-react';

// Dummy brand kit data
const dummyBrandKits = [
  {
    id: 1,
    name: 'Tech Startup Brand',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    palette: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    font: 'Inter',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'E-commerce Brand',
    primaryColor: '#ec4899',
    secondaryColor: '#f472b6',
    palette: ['#ec4899', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'],
    font: 'Poppins',
    createdAt: '2025-01-10T14:20:00Z',
  },
  {
    id: 3,
    name: 'Creative Agency',
    primaryColor: '#10b981',
    secondaryColor: '#3b82f6',
    palette: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    font: 'Montserrat',
    createdAt: '2025-01-05T09:15:00Z',
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

export function BrandKitSection() {
  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Brand Kits</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Canva-generated brand identities and visual assets
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyBrandKits.map(kit => (
            <div
              key={kit.id}
              className="group overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Thumbnail/Banner Preview */}
              <div
                className="aspect-video relative overflow-hidden border-b border-gray-200"
                style={{
                  background: `linear-gradient(135deg, ${kit.primaryColor}15 0%, ${kit.secondaryColor}15 100%)`,
                }}
              >
                {/* Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, ${kit.primaryColor} 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                  }}
                />
                {/* Logo placeholder in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${kit.primaryColor} 0%, ${kit.secondaryColor} 100%)`,
                    }}
                  >
                    {kit.name.split(' ')[0].charAt(0)}
                  </div>
                </div>
              </div>

              {/* Banner Preview (collapsible) */}
              <div className="px-4 pt-2 pb-1">
                <details className="group/details">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 select-none">
                    <span>View Banner</span>
                    <span className="text-[10px] transition-transform duration-200 group-open/details:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <div
                      className="w-full h-32 relative"
                      style={{
                        background: `linear-gradient(135deg, ${kit.primaryColor} 0%, ${kit.secondaryColor} 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/80 font-semibold text-sm">
                          {kit.name} Banner
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {kit.name}
                  </h3>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] rounded-full bg-purple-50 px-2 py-1 font-semibold text-purple-700 border border-purple-100">
                    <Sparkles className="h-3 w-3" />
                    Canva
                  </span>
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      Color Palette
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {kit.palette.map((color, idx) => (
                      <div
                        key={`${color}-${idx}`}
                        className="h-8 w-8 rounded-lg border-2 border-white shadow-sm transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="flex items-center gap-2">
                  <Type className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Font:{' '}
                    <span className="font-semibold text-gray-900">
                      {kit.font}
                    </span>
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {formatDate(kit.createdAt)}
                  </span>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state message (if needed) */}
        {dummyBrandKits.length === 0 && (
          <div className="text-center py-12">
            <Palette className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No brand kits created yet. Start designing in Canva!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandKitSection;

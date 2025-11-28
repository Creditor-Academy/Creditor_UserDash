import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SponsorAdPopup = ({ ad, open, onClose }) => {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setCanClose(false);
    const timer = setTimeout(() => setCanClose(true), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open || !ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-blue-100">
        {ad.mediaUrl && (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        )}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100">
              Sponsored
            </Badge>
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              {ad.sponsorName}
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-gray-900">{ad.title}</h4>
            <p className="text-sm text-gray-600">{ad.description}</p>
          </div>
          {ad.ctaText && ad.ctaUrl && (
            <Button
              asChild
              className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow"
            >
              <a href={ad.ctaUrl} target="_blank" rel="noreferrer">
                {ad.ctaText}
              </a>
            </Button>
          )}
        </div>

        <button
          disabled={!canClose}
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/80 text-gray-600 hover:text-gray-900 rounded-full p-2 border border-gray-200 shadow disabled:opacity-50"
          aria-label="Close sponsored popup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SponsorAdPopup;

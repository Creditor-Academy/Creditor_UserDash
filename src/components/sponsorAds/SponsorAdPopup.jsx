import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SponsorAdPopup({ ad, onImpression, onClick, onClose }) {
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    if (onImpression && ad?.id) {
      onImpression(ad.id);
    }
    // Show close button after 3 seconds
    const timer = setTimeout(() => {
      setShowCloseButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [ad?.id, onImpression]);

  const handleClick = () => {
    if (onClick && ad?.id) {
      onClick(ad.id);
    }
    if (ad?.ctaUrl) {
      window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-opacity duration-200 ${
            showCloseButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {ad.mediaType === 'image' && ad.mediaUrl && (
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={ad.mediaUrl}
              alt={ad.title || ad.sponsorName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {ad.mediaType === 'video' && ad.mediaUrl && (
          <div className="relative w-full h-48 overflow-hidden">
            <video
              src={ad.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {ad.sponsorName && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {ad.sponsorName}
            </p>
          )}
          {ad.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{ad.title}</h2>
          )}
          {ad.description && (
            <p className="text-sm text-gray-600 mb-4">{ad.description}</p>
          )}
          {ad.ctaText && (
            <Button
              onClick={handleClick}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {ad.ctaText}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SponsorAdPopup;

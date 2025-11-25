import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SponsorAdCard({ ad, onImpression, onClick }) {
  React.useEffect(() => {
    if (onImpression && ad?.id) {
      onImpression(ad.id);
    }
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {ad.mediaType === 'image' && ad.mediaUrl && (
        <div className="relative w-full h-32 overflow-hidden">
          <img
            src={ad.mediaUrl}
            alt={ad.title || ad.sponsorName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        {ad.sponsorName && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {ad.sponsorName}
          </p>
        )}
        {ad.title && (
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {ad.title}
          </h3>
        )}
        {ad.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {ad.description}
          </p>
        )}
        {ad.ctaText && (
          <Button
            onClick={handleClick}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all duration-200 hover:shadow-md"
          >
            {ad.ctaText}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SponsorAdCard;

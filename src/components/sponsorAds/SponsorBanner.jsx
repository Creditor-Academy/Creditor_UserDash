import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SponsorBanner({ ad, onImpression, onClick }) {
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
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      {ad.mediaType === 'image' && ad.mediaUrl && (
        <div className="absolute inset-0">
          <img
            src={ad.mediaUrl}
            alt={ad.title || ad.sponsorName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      )}
      {ad.mediaType === 'video' && ad.mediaUrl && (
        <div className="absolute inset-0">
          <video
            src={ad.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      )}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 h-full min-h-[220px]">
        <div className="flex-1 text-white">
          {ad.sponsorName && (
            <p className="text-xs md:text-sm text-white/80 uppercase tracking-wide mb-1">
              {ad.sponsorName}
            </p>
          )}
          {ad.title && (
            <h2 className="text-xl md:text-2xl font-bold mb-2">{ad.title}</h2>
          )}
          {ad.description && (
            <p className="text-sm md:text-base text-white/90 max-w-2xl">
              {ad.description}
            </p>
          )}
        </div>
        {ad.ctaText && (
          <Button
            onClick={handleClick}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
          >
            {ad.ctaText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SponsorBanner;

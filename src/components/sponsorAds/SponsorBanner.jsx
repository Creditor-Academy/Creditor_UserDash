import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SponsorBanner = ({ ad, className }) => {
  if (!ad) return null;

  const { title, description, ctaText, ctaUrl, mediaUrl, sponsorName, tier } =
    ad;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-blue-100 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600',
        className
      )}
    >
      {mediaUrl && (
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-transparent" />

      <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-start gap-6">
        <div className="flex-1 text-white space-y-3">
          <div className="flex items-center gap-3 text-sm uppercase tracking-widest">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              {sponsorName}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold">
              {tier} Tier Sponsor
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl">
            {description}
          </p>
        </div>

        {ctaText && ctaUrl && (
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl animate-pulse"
          >
            <a href={ctaUrl} target="_blank" rel="noreferrer">
              {ctaText}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SponsorBanner;

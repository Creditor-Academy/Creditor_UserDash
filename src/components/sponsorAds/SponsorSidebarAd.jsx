import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const SponsorSidebarAd = ({ ad, className }) => {
  if (!ad) return null;

  const {
    sponsorName,
    title,
    description,
    ctaText,
    ctaUrl,
    logo,
    mediaUrl,
    mediaType,
    tier,
  } = ad;

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-md overflow-hidden',
        className
      )}
    >
      {mediaUrl &&
        (mediaType === 'video' ? (
          <video
            src={mediaUrl}
            className="w-full h-32 object-cover"
            controls
            muted
            loop
          />
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            loading="lazy"
            className="w-full h-32 object-cover"
          />
        ))}
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt={`${sponsorName} logo`}
              className="w-12 h-12 rounded-xl object-cover border border-white shadow"
              loading="lazy"
            />
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              {sponsorName}
            </p>
            <Badge
              variant="outline"
              className="text-[11px] px-2 py-0 border-none bg-white/70"
            >
              {tier} Tier
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        </div>

        {ctaText && ctaUrl && (
          <Button
            asChild
            variant="secondary"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2"
            >
              {ctaText}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorSidebarAd;

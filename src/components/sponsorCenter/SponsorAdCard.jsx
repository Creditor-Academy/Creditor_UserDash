import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SponsorStatusBadge from './SponsorStatusBadge';
import { CalendarDays, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to check if URL is a placeholder/invalid
const isPlaceholderUrl = url => {
  if (!url || url === '') return true;
  return (
    url.includes('example.com') ||
    url.includes('placeholder') ||
    url === null ||
    url === undefined
  );
};

const SponsorAdCard = ({
  ad,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onResubmit,
  hideActions,
  isPreview,
}) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!ad) return null;

  const hasValidMedia =
    ad.mediaUrl && !isPlaceholderUrl(ad.mediaUrl) && !imageError && !videoError;
  const showFallback = !hasValidMedia;

  const actionButtons = (
    <div className="flex justify-center">
      {onView && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(ad)}
          className="rounded-full w-full"
        >
          View
        </Button>
      )}
    </div>
  );

  return (
    <Card
      className={cn(
        'rounded-3xl border border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md',
        isPreview && 'border-dashed border-blue-200'
      )}
    >
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {ad.adTitle || 'Untitled Placement'}
          </CardTitle>
          {!isPreview && <SponsorStatusBadge status={ad.status || 'Pending'} />}
        </div>
        <p className="text-sm text-gray-500">
          {ad.sponsorName || 'Sponsor TBD'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="w-full h-44 rounded-2xl bg-gray-100 overflow-hidden relative">
          {hasValidMedia && ad.mediaType === 'video' ? (
            <video
              src={ad.mediaUrl}
              className="h-full w-full object-cover"
              controls
              muted
              onError={() => setVideoError(true)}
            />
          ) : hasValidMedia && ad.mediaType === 'image' ? (
            <img
              src={ad.mediaUrl}
              alt={ad.adTitle || 'Sponsor ad'}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : null}
          {showFallback && (
            <div className="absolute inset-0 h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50">
              {isPreview ? 'Preview updates as you type' : 'No media uploaded'}
            </div>
          )}
        </div>
        {ad.description && (
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {ad.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 min-h-[1.75rem]">
          {ad.placement && (
            <span className="rounded-full bg-gray-100 px-3 py-1 capitalize">
              {ad.placement.replace(/_/g, ' ')}
            </span>
          )}
          {ad.type && (
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {ad.type}
            </span>
          )}
          {ad.website && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
              <Globe className="w-3 h-3" />
              Link ready
            </span>
          )}
        </div>
        {!isPreview && (
          <div className="flex items-center gap-3 text-xs text-gray-500 min-h-[1.25rem]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {ad.startDate &&
                new Date(ad.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
              -{' '}
              {ad.endDate &&
                new Date(ad.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </span>
            {typeof ad.budget !== 'undefined' && (
              <span>Budget: ${Number(ad.budget).toLocaleString()}</span>
            )}
          </div>
        )}
      </CardContent>
      {!hideActions && !isPreview && (
        <CardFooter className="pt-4 pb-4 px-6">{actionButtons}</CardFooter>
      )}
    </Card>
  );
};

export default SponsorAdCard;

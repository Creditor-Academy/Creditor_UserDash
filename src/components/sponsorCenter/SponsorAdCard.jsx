import React from 'react';
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
  if (!ad) return null;

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      {onView && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(ad)}
          className="rounded-full"
        >
          View
        </Button>
      )}
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(ad)}
          className="rounded-full"
        >
          Edit
        </Button>
      )}
      {onToggleStatus &&
        ad.status !== 'Pending' &&
        ad.status !== 'Rejected' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(ad)}
            className="rounded-full"
          >
            {ad.status === 'Approved' ? 'Pause' : 'Resume'}
          </Button>
        )}
      {onResubmit && ad.status === 'Rejected' && (
        <Button
          size="sm"
          className="rounded-full bg-blue-600 text-white"
          onClick={() => onResubmit(ad)}
        >
          Resubmit
        </Button>
      )}
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onDelete(ad)}
        >
          Delete
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
      <CardHeader className="space-y-2">
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
      <CardContent className="space-y-4">
        <div className="w-full h-44 rounded-2xl bg-gray-100 overflow-hidden">
          {ad.mediaUrl ? (
            <img
              src={ad.mediaUrl}
              alt={ad.adTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              {isPreview ? 'Preview updates as you type' : 'No media uploaded'}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
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
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {ad.startDate} - {ad.endDate}
            </span>
            {typeof ad.budget !== 'undefined' && (
              <span>Budget: ${Number(ad.budget).toLocaleString()}</span>
            )}
          </div>
        )}
      </CardContent>
      {!hideActions && !isPreview && (
        <CardFooter className="flex flex-wrap gap-2">
          {actionButtons}
        </CardFooter>
      )}
    </Card>
  );
};

export default SponsorAdCard;

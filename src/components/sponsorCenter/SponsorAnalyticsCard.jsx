import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SponsorAnalyticsCard = ({
  label,
  value,
  helper,
  icon: Icon,
  accent = 'text-blue-600',
}) => {
  return (
    <Card className="rounded-xl border border-gray-100 shadow-sm">
      <CardContent className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
          {Icon && (
            <Icon
              className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0', accent)}
            />
          )}
          <span className="truncate">{label}</span>
        </div>
        <p className="text-xl sm:text-2xl font-semibold text-gray-900 break-words">
          {value}
        </p>
        {helper && (
          <p className="text-xs text-gray-500 line-clamp-2">{helper}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorAnalyticsCard;

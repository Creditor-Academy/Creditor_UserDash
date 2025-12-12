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
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {Icon && <Icon className={cn('w-4 h-4', accent)} />}
          {label}
        </div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {helper && <p className="text-xs text-gray-500">{helper}</p>}
      </CardContent>
    </Card>
  );
};

export default SponsorAnalyticsCard;

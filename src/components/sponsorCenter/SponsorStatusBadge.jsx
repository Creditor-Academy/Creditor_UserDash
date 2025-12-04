import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  Paused: 'bg-gray-100 text-gray-600 border-gray-200',
};

const SponsorStatusBadge = ({ status }) => {
  const classes =
    statusStyles[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <Badge
      className={`rounded-full px-3 py-1 text-xs font-semibold border ${classes}`}
    >
      {status}
    </Badge>
  );
};

export default SponsorStatusBadge;

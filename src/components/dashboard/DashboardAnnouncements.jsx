import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const announcementFeed = [
  {
    id: 1,
    title: 'New Insurance Sales Module',
    author: 'Training Manager',
    description:
      'Advanced Life Insurance Sales Techniques module has been added to the Insurance Fundamentals course.',
    timeAgo: '2 hours ago',
  },
  {
    id: 2,
    title: 'Sales Training Office Hours',
    author: 'Sales Coach',
    description:
      'Office hours will be held Tuesday and Thursday from 2-4 PM for sales technique consultation.',
    timeAgo: '1 day ago',
  },
];

export function DashboardAnnouncements({ className = '' }) {
  return (
    <Card
      className={cn(
        'w-full rounded-2xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Announcements</p>
          <h3 className="text-2xl font-semibold text-gray-900">
            Stay informed
          </h3>
          <p className="text-sm text-gray-500">Latest updates from your team</p>
        </div>
        <div className="rounded-full bg-blue-50 p-2 text-blue-600">
          <Bell size={18} />
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {announcementFeed.map(item => (
          <div
            key={item.id}
            className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.author}</p>
              </div>
              <span className="text-xs text-gray-500">{item.timeAgo}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <Button
          variant="ghost"
          className="w-full justify-between text-blue-600 hover:bg-blue-50"
          asChild
        >
          <Link to="/announcements">
            View All Announcements
            <ChevronRight size={18} />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default DashboardAnnouncements;

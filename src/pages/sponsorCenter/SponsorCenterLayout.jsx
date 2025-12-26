import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';

const tabs = [
  {
    value: 'submit',
    label: 'Submit Request',
    href: '/dashboard/sponsor-center/submit',
  },
  {
    value: 'my-ads',
    label: 'My Sponsor Ads',
    href: '/dashboard/sponsor-center/my-ads',
  },
  {
    value: 'analytics',
    label: 'Sponsor Analytics',
    href: '/dashboard/sponsor-center/analytics',
  },
];

const SponsorCenterLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab =
    tabs.find(tab => location.pathname.includes(tab.value))?.value || 'submit';

  const handleTabChange = value => {
    const target = tabs.find(tab => tab.value === value);
    if (target) navigate(target.href);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <Card className="border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl">
                  Sponsor Center
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-0.5">
                  Submit placements, manage campaigns, and track performance
                </CardDescription>
              </div>
            </div>
            <Badge className="self-start sm:self-auto sm:ml-auto bg-blue-50 text-blue-700 border-blue-100 rounded-full text-xs px-2.5 py-1">
              Learner View
            </Badge>
          </div>
          <div className="w-full">
            <Tabs
              value={currentTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="inline-flex h-auto items-stretch justify-start rounded-lg bg-gray-50 p-1 text-gray-500 gap-1.5 w-full sm:w-auto">
                {tabs.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="inline-flex items-center justify-center rounded-md px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-white/50 hover:text-gray-900 flex-1 sm:flex-initial min-w-0 leading-tight text-center"
                  >
                    <span className="break-words line-clamp-2 hyphens-auto">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SponsorCenterLayout;

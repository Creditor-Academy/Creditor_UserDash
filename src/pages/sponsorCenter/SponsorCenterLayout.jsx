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
    <div className="space-y-5">
      <Card className="border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Sponsor Center</CardTitle>
              <CardDescription className="text-sm">
                Submit placements, manage campaigns, and track performance
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-100 rounded-full text-xs">
              Learner View
            </Badge>
          </div>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-xl p-1">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SponsorCenterLayout;

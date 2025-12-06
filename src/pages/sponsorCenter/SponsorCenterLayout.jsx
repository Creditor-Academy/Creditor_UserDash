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
    <div className="space-y-6">
      <Card className="border border-gray-100 shadow-sm rounded-3xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Sponsor Center</CardTitle>
              <CardDescription>
                Submit new placements, manage existing campaigns, and monitor
                their performance.
              </CardDescription>
            </div>
            <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-100 rounded-full">
              Learner view
            </Badge>
          </div>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-1">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-600"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
      </Card>

      <div className="bg-white rounded-3xl shadow border border-gray-100 p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SponsorCenterLayout;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import SponsorAdCreate from '@/pages/admin/SponsorAdCreate';
import SponsorAdManage from '@/pages/admin/SponsorAdManage';
import SponsorAdAnalytics from '@/pages/admin/SponsorAdAnalytics';

const BASE_PATH = '/instructor/sponsor-ads';

const tabConfig = [
  { value: 'create', label: 'Create Ad', href: `${BASE_PATH}/create` },
  { value: 'manage', label: 'Manage Ads', href: `${BASE_PATH}/manage` },
  {
    value: 'analytics',
    label: 'Sponsor Analytics',
    href: `${BASE_PATH}/analytics`,
  },
];

const SponsorAdsAdminPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab =
    tabConfig.find(tab => location.pathname.startsWith(tab.href))?.value ||
    'create';

  const handleTabChange = value => {
    const target = tabConfig.find(tab => tab.value === value);
    if (target) {
      navigate(target.href);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'manage':
        return <SponsorAdManage />;
      case 'analytics':
        return <SponsorAdAnalytics />;
      case 'create':
      default:
        return <SponsorAdCreate />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sponsor Ads</CardTitle>
                <CardDescription>
                  Manage placements, targeting and reporting without leaving the
                  instructor portal.
                </CardDescription>
              </div>
            </div>
            <Badge className="ml-auto w-fit bg-blue-50 text-blue-700 border-blue-100">
              Instructor View
            </Badge>
          </div>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50">
              {tabConfig.map(tab => (
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
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SponsorAdsAdminPanel;

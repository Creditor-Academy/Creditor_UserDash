import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Activity, Clock, Target } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';

const tabs = [
  {
    value: 'create',
    label: 'Create Ad',
    href: '/dashboard/admin/sponsor-ads/create',
  },
  {
    value: 'manage',
    label: 'Manage Ads',
    href: '/dashboard/admin/sponsor-ads/manage',
  },
  {
    value: 'analytics',
    label: 'Sponsor Analytics',
    href: '/dashboard/admin/sponsor-ads/analytics',
  },
];

export const SponsorAdsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analytics, ads } = useSponsorAds();

  const currentTab =
    tabs.find(tab => location.pathname.includes(tab.value))?.value || 'create';

  const handleTabChange = value => {
    const target = tabs.find(tab => tab.value === value);
    if (target) {
      navigate(target.href);
    }
  };

  const quickStats = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        label: 'Total Impressions',
        value: analytics.totalImpressions?.toLocaleString() || '0',
        helper: 'last 7 days',
        icon: TrendingUp,
      },
      {
        label: 'Total Clicks',
        value: analytics.totalClicks?.toLocaleString() || '0',
        helper: `${analytics.overallCTR?.toFixed?.(2) ?? 0}% avg CTR`,
        icon: Activity,
      },
      {
        label: 'Active Ads',
        value: analytics.activeAdsCount || 0,
        helper: `${ads.filter(ad => ad.status === 'Paused').length} paused`,
        icon: Target,
      },
      {
        label: 'Avg Runway',
        value: (() => {
          if (!ads.length) return '—';
          const now = new Date();
          const durations = ads.map(ad => {
            const end = new Date(ad.endDate);
            return Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
          });
          const avg =
            durations.reduce((a, b) => a + b, 0) / durations.length || 0;
          return `${Math.round(avg)} days`;
        })(),
        helper: 'till expiry',
        icon: Clock,
      },
    ];
  }, [analytics, ads]);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl">
        <CardHeader className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-3xl font-semibold text-white">
                  Sponsor Ads Control
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Launch premium sponsor placements, manage campaigns, and
                  review insights from one refined surface.
                </CardDescription>
              </div>
            </div>
            <Badge className="ml-auto bg-white/15 text-white border-white/30 w-fit">
              Frontend Mock · No backend calls
            </Badge>
          </div>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/10 backdrop-blur rounded-2xl p-1 text-white">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map(stat => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 space-y-1"
              >
                <div className="flex items-center gap-2 text-blue-100 text-xs uppercase tracking-wider">
                  <stat.icon className="w-4 h-4" />
                  {stat.label}
                </div>
                <p className="text-2xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-blue-100/80 text-sm">{stat.helper}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100/80 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 pb-4 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">Workspace</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{ads.length} total campaigns</span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            {analytics?.typeDistribution?.length || 0} unique ad types running
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default SponsorAdsLayout;

import React from 'react';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import SponsorAnalyticsCharts from '@/components/sponsorAds/SponsorAnalyticsCharts';
import SponsorAdCard from '@/components/sponsorAds/SponsorAdCard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3 } from 'lucide-react';

export const SponsorAdAnalytics = () => {
  const { analytics, ads } = useSponsorAds();

  const topAds = [...ads]
    .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
    .slice(0, 3);

  const insights = [
    {
      label: 'CTR momentum',
      value: `${analytics?.overallCTR?.toFixed?.(2) ?? 0}%`,
      helper: 'Blended across active placements',
    },
    {
      label: 'Impressions last 7 days',
      value: analytics?.totalImpressions?.toLocaleString() ?? '0',
      helper: 'Across all surfaces',
    },
    {
      label: 'Click volume',
      value: analytics?.totalClicks?.toLocaleString() ?? '0',
      helper: 'Unique sponsor clicks',
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="rounded-3xl border-none bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 text-white shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div>
              <CardTitle className="text-3xl">
                Sponsor performance cockpit
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Live impression, CTR and click telemetry pulled directly from
                your mock ad dataset.
              </CardDescription>
            </div>
            <Badge className="bg-white/15 text-white border-white/30 rounded-full lg:ml-auto">
              Updated seconds ago
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {insights.map(item => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm uppercase tracking-wide text-blue-200">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold text-white mt-2">
                  {item.value}
                </p>
                <p className="text-sm text-blue-100">{item.helper}</p>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <SponsorAnalyticsCharts analytics={analytics} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border border-gray-100 shadow-sm rounded-3xl">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Top performing sponsors
            </CardTitle>
            <CardDescription>
              Sorted by impressions & engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topAds.map(ad => (
                <SponsorAdCard key={`top-${ad.id}`} ad={ad} hideActions />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-3xl">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Engagement leaderboard</CardTitle>
              <CardDescription>CTR focus by campaign.</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-100 text-blue-700"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              CTR view
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...ads]
                .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))
                .slice(0, 5)
                .map(ad => (
                  <div
                    key={`ctr-${ad.id}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{ad.title}</p>
                      <p className="text-sm text-gray-500">{ad.sponsorName}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {(ad.ctr ?? 0).toFixed(1)}%
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorAdAnalytics;

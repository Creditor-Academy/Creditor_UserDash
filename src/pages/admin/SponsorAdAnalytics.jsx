import React from 'react';
import { useSponsorAds } from '@/contexts/SponsorAdsContext';
import SponsorAnalyticsCharts from '@/components/sponsorAds/SponsorAnalyticsCharts';
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
    <div className="space-y-5">
      <Card className="rounded-xl border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl mb-1">Performance Overview</CardTitle>
          <CardDescription className="text-blue-100 text-sm">
            Key metrics across all sponsor ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {insights.map(item => (
              <div
                key={item.label}
                className="rounded-lg bg-white/10 backdrop-blur-sm p-4"
              >
                <p className="text-xs uppercase tracking-wide text-blue-200 mb-1">
                  {item.label}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="text-xs text-blue-100 mt-1">{item.helper}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SponsorAnalyticsCharts analytics={analytics} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-sm">
              Highest impressions & engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAds.map((ad, idx) => (
                <div
                  key={`top-${ad.id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {ad.title}
                    </p>
                    <p className="text-xs text-gray-500">{ad.sponsorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {ad.impressions?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500">impressions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">CTR Leaderboard</CardTitle>
                <CardDescription className="text-sm">
                  Click-through rate by campaign
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-blue-100 text-blue-700 text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                CTR
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...ads]
                .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))
                .slice(0, 5)
                .map(ad => (
                  <div
                    key={`ctr-${ad.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {ad.title}
                      </p>
                      <p className="text-xs text-gray-500">{ad.sponsorName}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 ml-4">
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

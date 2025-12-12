import React, { useEffect, useState } from 'react';
import { useUserSponsor } from '@/contexts/UserSponsorContext';
import SponsorAnalyticsCard from '@/components/sponsorCenter/SponsorAnalyticsCard';
import SponsorLineChart from '@/components/sponsorCenter/SponsorLineChart';
import SponsorBarChart from '@/components/sponsorCenter/SponsorBarChart';
import SponsorPieChart from '@/components/sponsorCenter/SponsorPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Activity,
  BarChart3,
  MousePointerClick,
  Target,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const SponsorAnalyticsPage = () => {
  const { analytics, ads } = useUserSponsor();
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAdClick = ad => {
    setSelectedAd(ad);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, idx) => (
          <Skeleton key={idx} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const kpis = [
    {
      label: 'Total Impressions',
      value: analytics.totalImpressions.toLocaleString(),
      helper: 'Past 7 days',
      icon: Activity,
    },
    {
      label: 'Total Clicks',
      value: analytics.totalClicks.toLocaleString(),
      helper: 'Unique sponsor clicks',
      icon: MousePointerClick,
    },
    {
      label: 'CTR',
      value: `${analytics.ctr.toFixed(2)}%`,
      helper: 'Overall click-through rate',
      icon: Target,
    },
    {
      label: 'Active Ads',
      value: analytics.activeAdsCount,
      helper: 'Currently approved & running',
      icon: BarChart3,
    },
    {
      label: 'Rejected Ads',
      value: analytics.rejectedAdsCount,
      helper: 'Need revisions',
      icon: AlertTriangle,
      accent: 'text-rose-500',
    },
  ];

  // Get approved ads for clickable list
  const approvedAds = ads.filter(ad => ad.status === 'Approved');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map(card => (
          <SponsorAnalyticsCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SponsorLineChart data={analytics.timelineSeries || []} />
        <SponsorBarChart data={analytics.clicksPerAd || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SponsorPieChart data={analytics.typeDistributionSeries || []} />
        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Ads</CardTitle>
            <CardDescription className="text-sm">
              Click to view detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approvedAds.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No approved ads yet
                </p>
              ) : (
                approvedAds.map(ad => {
                  const impressions =
                    Number(ad.impressions) || Number(ad.view_count) || 0;
                  const clicks =
                    Number(ad.clicks) || Number(ad.click_count) || 0;
                  const ctr =
                    impressions > 0 ? (clicks / impressions) * 100 : 0;
                  return (
                    <div
                      key={ad.id}
                      onClick={() => handleAdClick(ad)}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {ad.adTitle || ad.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ad.sponsorName}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {impressions.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Ad Analytics Dialog */}
      <Dialog
        open={Boolean(selectedAd)}
        onOpenChange={open => !open && setSelectedAd(null)}
      >
        <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedAd?.adTitle || selectedAd?.title || 'Ad Analytics'}
            </DialogTitle>
            <CardDescription className="text-sm">
              {selectedAd?.sponsorName} • Performance metrics
            </CardDescription>
          </DialogHeader>

          {selectedAd && (
            <div className="space-y-5 mt-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-xl border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Eye className="w-4 h-4" />
                      Total Views
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(
                        Number(selectedAd.impressions) ||
                        Number(selectedAd.view_count) ||
                        0
                      ).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MousePointerClick className="w-4 h-4" />
                      Total Clicks
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(
                        Number(selectedAd.clicks) ||
                        Number(selectedAd.click_count) ||
                        0
                      ).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <BarChart3 className="w-4 h-4" />
                      CTR
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(() => {
                        const views =
                          Number(selectedAd.impressions) ||
                          Number(selectedAd.view_count) ||
                          0;
                        const clicks =
                          Number(selectedAd.clicks) ||
                          Number(selectedAd.click_count) ||
                          0;
                        return views > 0
                          ? ((clicks / views) * 100).toFixed(2)
                          : 0;
                      })()}
                      %
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <Card className="rounded-xl border-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: 'Views',
                          value:
                            Number(selectedAd.impressions) ||
                            Number(selectedAd.view_count) ||
                            0,
                        },
                        {
                          name: 'Clicks',
                          value:
                            Number(selectedAd.clicks) ||
                            Number(selectedAd.click_count) ||
                            0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ad Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.status || 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Placement</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.placement
                      ?.replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.startDate
                      ? new Date(selectedAd.startDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">End Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.endDate
                      ? new Date(selectedAd.endDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorAnalyticsPage;

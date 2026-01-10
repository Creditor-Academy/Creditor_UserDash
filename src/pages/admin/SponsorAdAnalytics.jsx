import React, { useState } from "react";
import { useSponsorAds } from "@/contexts/SponsorAdsContext";
import SponsorAnalyticsCharts from "@/components/sponsorAds/SponsorAnalyticsCharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, BarChart3, Eye, MousePointerClick } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export const SponsorAdAnalytics = () => {
  const { analytics, ads } = useSponsorAds();
  const [selectedAd, setSelectedAd] = useState(null);

  const topAds = [...ads]
    .sort((a, b) => {
      const impressionsA = Number(a.impressions) || Number(a.view_count) || 0;
      const impressionsB = Number(b.impressions) || Number(b.view_count) || 0;
      return impressionsB - impressionsA;
    })
    .slice(0, 3);

  const handleAdClick = (ad) => {
    setSelectedAd(ad);
  };

  const insights = [
    {
      label: "CTR momentum",
      value: `${analytics?.overallCTR?.toFixed?.(2) ?? 0}%`,
      helper: "Blended across active placements",
    },
    {
      label: "Impressions last 7 days",
      value: analytics?.totalImpressions?.toLocaleString() ?? "0",
      helper: "Across all surfaces",
    },
    {
      label: "Click volume",
      value: analytics?.totalClicks?.toLocaleString() ?? "0",
      helper: "Unique sponsor clicks",
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
            {insights.map((item) => (
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
            <div className="space-y-2">
              {topAds.map((ad, idx) => {
                const impressions =
                  Number(ad.impressions) || Number(ad.view_count) || 0;
                const clicks = Number(ad.clicks) || Number(ad.click_count) || 0;
                return (
                  <div
                    key={`top-${ad.id}`}
                    onClick={() => handleAdClick(ad)}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {ad.title || ad.sponsorName}
                      </p>
                      <p className="text-xs text-gray-500">{ad.sponsorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {impressions.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                );
              })}
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
                .map((ad) => {
                  const impressions =
                    Number(ad.impressions) || Number(ad.view_count) || 0;
                  const clicks =
                    Number(ad.clicks) || Number(ad.click_count) || 0;
                  const ctr =
                    impressions > 0 ? (clicks / impressions) * 100 : 0;
                  return { ...ad, ctr };
                })
                .sort((a, b) => b.ctr - a.ctr)
                .slice(0, 5)
                .map((ad) => (
                  <div
                    key={`ctr-${ad.id}`}
                    onClick={() => handleAdClick(ad)}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {ad.title || ad.sponsorName}
                      </p>
                      <p className="text-xs text-gray-500">{ad.sponsorName}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900 ml-4">
                      {ad.ctr.toFixed(1)}%
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Ad Analytics Dialog */}
      <Dialog
        open={Boolean(selectedAd)}
        onOpenChange={(open) => !open && setSelectedAd(null)}
      >
        <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedAd?.title || selectedAd?.sponsorName || "Ad Analytics"}
            </DialogTitle>
            <CardDescription className="text-sm">
              {selectedAd?.sponsorName} • Detailed performance metrics
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
                          name: "Views",
                          value:
                            Number(selectedAd.impressions) ||
                            Number(selectedAd.view_count) ||
                            0,
                        },
                        {
                          name: "Clicks",
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
                    {selectedAd.status || "Active"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Placement</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.placement
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.startDate
                      ? new Date(selectedAd.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">End Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedAd.endDate
                      ? new Date(selectedAd.endDate).toLocaleDateString()
                      : "N/A"}
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

export default SponsorAdAnalytics;

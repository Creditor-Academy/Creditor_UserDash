import React, { useEffect, useState } from 'react';
import { useUserSponsor } from '@/contexts/UserSponsorContext';
import SponsorAnalyticsCard from '@/components/sponsorCenter/SponsorAnalyticsCard';
import SponsorLineChart from '@/components/sponsorCenter/SponsorLineChart';
import SponsorBarChart from '@/components/sponsorCenter/SponsorBarChart';
import SponsorPieChart from '@/components/sponsorCenter/SponsorPieChart';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  BarChart3,
  MousePointerClick,
  Target,
  AlertTriangle,
} from 'lucide-react';

const SponsorAnalyticsPage = () => {
  const { analytics } = useUserSponsor();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map(card => (
          <SponsorAnalyticsCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SponsorLineChart data={analytics.timelineSeries} />
        <SponsorBarChart data={analytics.clicksPerAd} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SponsorPieChart data={analytics.typeDistributionSeries} />
        <div className="rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-base font-semibold text-gray-900">
            Quick Insights
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• {analytics.activeAdsCount} ads are currently live</li>
            <li>• CTR is {analytics.ctr.toFixed(2)}% week over week</li>
            <li>
              • {analytics.typeDistributionSeries?.[0]?.name || 'Image'} formats
              drive most impressions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SponsorAnalyticsPage;

import React from 'react';
import HeroAnalytics from '../HeroAnalytics';
import AnalyticsChart from '../AnalyticsChart';
import RevenueInsights from '../RevenueInsights';
import ActivityFeed from '../ActivityFeed';

export default function DashboardContent() {
  return (
    <div className="space-y-8">
      <HeroAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>
        <div>
          <RevenueInsights />
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}

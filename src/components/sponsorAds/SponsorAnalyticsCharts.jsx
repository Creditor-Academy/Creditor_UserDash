import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];

export const SponsorAnalyticsCharts = ({ analytics }) => {
  if (!analytics) return null;

  const {
    totalImpressions = 0,
    totalClicks = 0,
    overallCTR = 0,
    activeAdsCount = 0,
    impressionsByAd = [],
    typeDistribution = [],
    dailyImpressions = [],
  } = analytics;

  const kpis = [
    {
      label: 'Total Impressions',
      value: totalImpressions.toLocaleString(),
      trend: '+8.4%',
      sublabel: 'vs last 7 days',
    },
    {
      label: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      trend: '+3.2%',
      sublabel: 'Engagement rate',
    },
    {
      label: 'Overall CTR',
      value: `${overallCTR.toFixed(2)}%`,
      trend: '+1.1%',
      sublabel: 'Click-through rate',
    },
    {
      label: 'Active Ads',
      value: activeAdsCount,
      trend: '+2 live',
      sublabel: 'Running right now',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border border-gray-100 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kpi.value}
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                {kpi.trend}
              </p>
              <p className="text-xs text-gray-400">{kpi.sublabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle>Impressions per Ad</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impressionsByAd}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="impressions"
                  radius={[8, 8, 0, 0]}
                  fill="#2563eb"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle>Ad Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle>Daily Mock Impressions</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyImpressions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#9333ea"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SponsorAnalyticsCharts;

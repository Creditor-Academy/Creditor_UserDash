import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Eye,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

const SponsorAnalyticsPage = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Performance Dashboard',
      description:
        'Comprehensive overview of all your sponsor ads with real-time metrics and KPIs.',
    },
    {
      icon: TrendingUp,
      title: 'Impressions Tracking',
      description:
        'Track total impressions over time with detailed charts showing daily, weekly, and monthly trends.',
    },
    {
      icon: MousePointerClick,
      title: 'Click Analytics',
      description:
        'Monitor click-through rates (CTR) and analyze which ads are performing best.',
    },
    {
      icon: Eye,
      title: 'View Statistics',
      description:
        'See how many users have viewed your ads and track engagement metrics.',
    },
    {
      icon: Target,
      title: 'Conversion Metrics',
      description:
        'Measure the effectiveness of your campaigns with detailed conversion tracking.',
    },
    {
      icon: Calendar,
      title: 'Time-Based Reports',
      description:
        'Generate reports for specific date ranges to analyze campaign performance over time.',
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description:
        'Filter analytics by ad status, placement location, date range, and more.',
    },
    {
      icon: Download,
      title: 'Export Reports',
      description:
        'Download detailed analytics reports in PDF or CSV format for external analysis.',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Coming Soon Header */}
      <div className="text-center space-y-4 py-8 sm:py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
          <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
          Sponsor Analytics
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm sm:text-base font-medium">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Coming Soon
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          We're building a powerful analytics dashboard to help you track and
          optimize your sponsor ad performance. Stay tuned for detailed insights
          and metrics!
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <CardDescription className="text-sm text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* What to Expect Section */}
      <Card className="rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl mb-2">
            What You'll Get
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Comprehensive analytics tools to help you make data-driven decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Key Metrics
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Total impressions and views</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Click-through rates (CTR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Active vs. inactive ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Campaign performance trends</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Visual Analytics
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Interactive charts and graphs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Time-series performance data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Ad comparison tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Customizable date ranges</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardContent className="p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Want to be notified when Sponsor Analytics is available?
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            We'll send you an email as soon as this feature is ready. In the
            meantime, you can track your ad status in the{' '}
            <span className="font-medium text-blue-600">"My Sponsor Ads"</span>{' '}
            section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SponsorAnalyticsPage;

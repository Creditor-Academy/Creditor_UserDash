import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Crown, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAIFeatureAccess } from './AIFeatureAccess';

const AIUsageDashboard = () => {
  const { 
    features, 
    getTodayUsage, 
    getUsageLimit, 
    userPlan, 
    upgradePlan 
  } = useAIFeatureAccess();

  const featureStats = Object.entries(features).map(([key, feature]) => ({
    id: key,
    name: feature.name,
    usage: getTodayUsage(key),
    limit: getUsageLimit(key),
    enabled: feature.enabled
  }));

  const totalUsage = featureStats.reduce((sum, stat) => sum + stat.usage, 0);
  const totalLimit = featureStats.reduce((sum, stat) => sum + stat.limit, 0);
  const usagePercentage = totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0;

  const planColors = {
    free: 'bg-gray-500',
    basic: 'bg-blue-500', 
    premium: 'bg-purple-500'
  };

  const planIcons = {
    free: Info,
    basic: TrendingUp,
    premium: Crown
  };

  const PlanIcon = planIcons[userPlan];

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          AI Usage Dashboard
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${planColors[userPlan]}`}>
          <PlanIcon className="w-4 h-4" />
          {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
        </div>
      </div>

      {/* Overall Usage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Today's Total Usage</span>
          <span className="text-sm text-gray-600">{totalUsage} / {totalLimit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
            className={`h-2 rounded-full ${
              usagePercentage > 90 ? 'bg-red-500' : 
              usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
        </div>
        {usagePercentage > 90 && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Approaching daily limit
          </div>
        )}
      </div>

      {/* Feature Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Feature Usage Breakdown</h4>
        {featureStats.map((stat) => {
          const percentage = stat.limit > 0 ? (stat.usage / stat.limit) * 100 : 0;
          
          return (
            <div key={stat.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stat.name}</span>
                  {stat.enabled ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {stat.usage} / {stat.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  className={`h-1 rounded-full ${
                    !stat.enabled ? 'bg-gray-400' :
                    percentage > 90 ? 'bg-red-400' : 
                    percentage > 70 ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Section */}
      {userPlan !== 'premium' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-800">Unlock More AI Power</h4>
          </div>
          <p className="text-purple-700 text-sm mb-3">
            Upgrade to Premium for unlimited AI generations and advanced features.
          </p>
          <button
            onClick={() => upgradePlan('premium')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Upgrade Now
          </button>
        </motion.div>
      )}

      {/* Plan Benefits */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Current Plan Benefits</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {userPlan === 'free' && (
            <>
              <li>• 5 AI generations per day</li>
              <li>• Basic image generation</li>
              <li>• Limited summarization</li>
            </>
          )}
          {userPlan === 'basic' && (
            <>
              <li>• 50 AI generations per day</li>
              <li>• Advanced image styles</li>
              <li>• Full summarization features</li>
              <li>• Content Q&A search</li>
            </>
          )}
          {userPlan === 'premium' && (
            <>
              <li>• Unlimited AI generations</li>
              <li>• All image styles and models</li>
              <li>• Advanced summarization</li>
              <li>• Priority processing</li>
              <li>• Custom AI models</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AIUsageDashboard;

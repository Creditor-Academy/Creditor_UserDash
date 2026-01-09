/**
 * Course Analytics Dashboard
 * Displays course feedback analytics and performance metrics
 * Shows top/bottom performing content blocks
 */

import React, { useState, useEffect } from "react";
import api from "@/services/apiClient";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const CourseAnalyticsDashboard = ({ courseId }) => {
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [topBlocks, setTopBlocks] = useState([]);
  const [bottomBlocks, setBottomBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch course feedback summary
      const summaryResponse = await api.get(
        `/api/feedback/course/${courseId}/summary`,
      );

      // Fetch top performing blocks
      const topResponse = await api.get(`/api/feedback/top-blocks?limit=5`);

      // Fetch bottom performing blocks
      const bottomResponse = await api.get(
        `/api/feedback/bottom-blocks?limit=5`,
      );

      setFeedbackSummary(summaryResponse.data.data);
      setTopBlocks(topResponse.data.data);
      setBottomBlocks(bottomResponse.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">
              Error Loading Analytics
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!feedbackSummary) {
    return (
      <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">No feedback data available yet.</p>
      </div>
    );
  }

  const ratingData = Object.entries(
    feedbackSummary.feedback_by_rating || {},
  ).map(([rating, count]) => ({
    rating: `${rating} ⭐`,
    count,
  }));

  const categoryData = Object.entries(
    feedbackSummary.feedback_categories || {},
  ).map(([category, count]) => ({
    category: category.replace(/_/g, " "),
    count,
  }));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Course Analytics
        </h2>
        <p className="text-gray-600">
          Feedback-driven insights to improve course quality and student
          engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Feedback"
          value={feedbackSummary.total_feedback}
          icon="📊"
          color="blue"
        />
        <MetricCard
          title="Average Rating"
          value={feedbackSummary.avg_rating.toFixed(1)}
          subtitle="out of 5"
          icon="⭐"
          color="yellow"
        />
        <MetricCard
          title="Completion Rate"
          value={`${feedbackSummary.avg_completion_rate.toFixed(1)}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Engagement Score"
          value={`${feedbackSummary.avg_engagement_score.toFixed(1)}%`}
          icon="🔥"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Categories */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Feedback Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
                        index % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Blocks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Top Performing Content Blocks
          </h3>
        </div>
        {topBlocks.length > 0 ? (
          <div className="space-y-3">
            {topBlocks.map((block, index) => (
              <div
                key={index}
                className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {block.block_type}
                    {block.variant && ` - ${block.variant}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {block.total_feedback_count} feedback entries
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {block.avg_rating.toFixed(1)}⭐
                  </p>
                  <p className="text-sm text-gray-600">
                    {block.completion_rate.toFixed(1)}% completion
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No performance data available yet.</p>
        )}
      </div>

      {/* Bottom Performing Blocks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Content Blocks Needing Improvement
          </h3>
        </div>
        {bottomBlocks.length > 0 ? (
          <div className="space-y-3">
            {bottomBlocks.map((block, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {block.block_type}
                    {block.variant && ` - ${block.variant}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {block.total_feedback_count} feedback entries
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {block.avg_rating.toFixed(1)}⭐
                  </p>
                  <p className="text-sm text-gray-600">
                    {block.completion_rate.toFixed(1)}% completion
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No performance data available yet.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Recommendations
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Focus on improving content blocks with ratings below 3.5 stars
              </li>
              <li>
                • Analyze why top-performing blocks succeed and replicate their
                patterns
              </li>
              <li>
                • Consider student feedback categories to guide content
                improvements
              </li>
              <li>
                • Track completion rates to identify where students disengage
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchAnalytics}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Refresh Analytics
      </button>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`p-4 border rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default CourseAnalyticsDashboard;

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Users, AlertTriangle, Star } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SummaryStats, TimeSeriesPoint, BreakdownItem } from '@/types';
import Link from 'next/link';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function DashboardContent() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TimeSeriesPoint[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const buildFilters = () => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    return filters;
  };

  const fetchData = async () => {
    setLoading(true);
    const filters = buildFilters();
    const queryString = new URLSearchParams(filters).toString();

    try {
      const [summaryRes, trendsRes, breakdownRes, reviewsRes] = await Promise.all([
        fetch(`/api/summary?${queryString}`),
        fetch(`/api/trends?${queryString}&granularity=day&metric=count`),
        fetch(`/api/breakdowns?${queryString}&groupBy=platform`),
        fetch(`/api/reviews?${queryString}&page=1&pageSize=10&sortBy=review_date&sortDirection=desc`),
      ]);

      // Check for errors in responses
      if (!summaryRes.ok) throw new Error(`Summary API error: ${summaryRes.statusText}`);
      if (!trendsRes.ok) throw new Error(`Trends API error: ${trendsRes.statusText}`);
      if (!breakdownRes.ok) throw new Error(`Breakdown API error: ${breakdownRes.statusText}`);
      if (!reviewsRes.ok) throw new Error(`Reviews API error: ${reviewsRes.statusText}`);

      const [summaryData, trendsData, breakdownData, reviewsData] = await Promise.all([
        summaryRes.json(),
        trendsRes.json(),
        breakdownRes.json(),
        reviewsRes.json(),
      ]);

      setSummary(summaryData);
      setTrends(trendsData.trends || []);
      setBreakdown(breakdownData.breakdown || []);
      setRecentReviews(reviewsData.items || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty states on error to prevent crashes
      setSummary(null);
      setTrends([]);
      setBreakdown([]);
      setRecentReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of customer reviews and insights</p>
      </div>

      <FilterBar onFiltersChange={fetchData} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard
          title="Total Reviews"
          value={summary?.total_reviews.toLocaleString() || '0'}
          icon={<Users className="w-8 h-8" />}
        />
        <KPICard
          title="Average Rating"
          value={summary?.avg_rating.toFixed(1) || '0.0'}
          subtitle="out of 5.0"
          icon={<Star className="w-8 h-8" />}
        />
        <KPICard
          title="Avg Sentiment"
          value={summary?.avg_sentiment_score.toFixed(2) || '0.00'}
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <KPICard
          title="High Churn Risk"
          value={`${summary?.high_churn_percentage.toFixed(1) || '0'}%`}
          subtitle={`${summary?.churn_risk_breakdown.find((r) => r.risk === 'high' || r.risk === 'critical')?.count || 0} reviews`}
          icon={<AlertTriangle className="w-8 h-8" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Reviews Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Count" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary?.sentiment_breakdown || []}
                  dataKey="count"
                  nameKey="sentiment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {summary?.sentiment_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Churn Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary?.churn_risk_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary?.platform_counts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Churn Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.review_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.rating}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.overall_sentiment || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.churn_risk || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.primary_category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <Link
                        href={`/reviews/${review.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {review.review_text.substring(0, 120)}...
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}


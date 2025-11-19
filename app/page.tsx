'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Star } from 'lucide-react';
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

const COLORS = ['#3b82f6', '#f97316', '#fbbf24', '#10b981', '#8b5cf6'];
const BLUE_SHADES = ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8'];

function DashboardContent() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [trends, setTrends] = useState<TimeSeriesPoint[]>([]);
  const [sentimentTrends, setSentimentTrends] = useState<TimeSeriesPoint[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('month');

  // Convert searchParams to stable string for dependency
  const paramsString = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return JSON.stringify(params);
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const filters: Record<string, string> = JSON.parse(paramsString);
    const queryString = new URLSearchParams(filters).toString();

    try {
      const [summaryRes, trendsRes, sentimentTrendsRes, breakdownRes, reviewsRes] = await Promise.all([
        fetch(`/api/summary?${queryString}`),
        fetch(`/api/trends?${queryString}&granularity=${granularity}&metric=count`),
        fetch(`/api/trends?${queryString}&granularity=month&metric=avg_sentiment`),
        fetch(`/api/breakdowns?${queryString}&groupBy=platform`),
        fetch(`/api/reviews?${queryString}&page=1&pageSize=10&sortBy=review_date&sortDirection=desc`),
      ]);

      // Check for errors in responses
      if (!summaryRes.ok) throw new Error(`Summary API error: ${summaryRes.statusText}`);
      if (!trendsRes.ok) throw new Error(`Trends API error: ${trendsRes.statusText}`);
      if (!sentimentTrendsRes.ok) throw new Error(`Sentiment Trends API error: ${sentimentTrendsRes.statusText}`);
      if (!breakdownRes.ok) throw new Error(`Breakdown API error: ${breakdownRes.statusText}`);
      if (!reviewsRes.ok) throw new Error(`Reviews API error: ${reviewsRes.statusText}`);

      const [summaryData, trendsData, sentimentTrendsData, breakdownData, reviewsData] = await Promise.all([
        summaryRes.json(),
        trendsRes.json(),
        sentimentTrendsRes.json(),
        breakdownRes.json(),
        reviewsRes.json(),
      ]);

      setSummary(summaryData);
      setTrends(trendsData.trends || []);
      setSentimentTrends(sentimentTrendsData.trends || []);
      setBreakdown(breakdownData.breakdown || []);
      setRecentReviews(reviewsData.items || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty states on error to prevent crashes
      setSummary(null);
      setTrends([]);
      setSentimentTrends([]);
      setBreakdown([]);
      setRecentReviews([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString, granularity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl border border-dark-border"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6 flex items-center gap-4">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/nimbus_logo_black.png" 
            alt="Nimbus Logo" 
            className="h-20 w-auto object-contain block dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/nimbus_logo_white_transparent.png" 
            alt="Nimbus Logo" 
            className="h-20 w-auto object-contain hidden dark:block"
          />
        </div>
        <div>
          <h1 className="text-4xl font-semibold text-gray-800 dark:text-white tracking-tight" style={{ letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Nimbus AI</h1>
          <p className="text-gray-700 dark:text-white mt-1">Customer Sentiment Insights</p>
        </div>
      </div>

      <FilterBar />

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
          variant={
            summary?.avg_rating 
              ? summary.avg_rating >= 3.5 
                ? 'success' 
                : 'danger'
              : 'default'
          }
        />
        <KPICard
          title="Avg Sentiment"
          value={summary?.avg_sentiment_score.toFixed(2) || '0.00'}
          icon={
            summary?.avg_sentiment_score && summary.avg_sentiment_score < 0 
              ? <TrendingDown className="w-8 h-8" />
              : <TrendingUp className="w-8 h-8" />
          }
          variant={
            summary?.avg_sentiment_score 
              ? summary.avg_sentiment_score > 0 
                ? 'success' 
                : summary.avg_sentiment_score < 0 
                ? 'danger' 
                : 'default'
              : 'default'
          }
        />
        <KPICard
          title="High Churn Risk"
          value={`${summary?.high_churn_percentage.toFixed(1) || '0'}%`}
          subtitle={`${summary?.churn_risk_breakdown.find((r) => r.risk === 'high' || r.risk === 'critical')?.count || 0} reviews`}
          icon={
            typeof summary?.high_churn_percentage === 'number' && summary.high_churn_percentage < 50 
              ? undefined 
              : <AlertTriangle className="w-8 h-8" />
          }
          variant={
            typeof summary?.high_churn_percentage === 'number'
              ? summary.high_churn_percentage < 50 
                ? 'success' 
                : 'danger'
              : 'default'
          }
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reviews Over Time</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => setGranularity('day')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    granularity === 'day'
                      ? 'bg-accent-blue text-white'
                      : 'bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-bg/80'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setGranularity('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    granularity === 'week'
                      ? 'bg-accent-blue text-white'
                      : 'bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-bg/80'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setGranularity('month')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    granularity === 'month'
                      ? 'bg-accent-blue text-white'
                      : 'bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-bg/80'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#60a5fa', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sentiment Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#34d399', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Churn Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary?.churn_risk_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="risk" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {summary?.churn_risk_breakdown.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="#f97316"
                      fillOpacity={0.4}
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Five Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(summary?.platform_counts || []).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="platform" stroke="#9ca3af" tick={false} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                  label={(props: any) => {
                    const { x, y, width, height, value, index } = props;
                    const platformData = (summary?.platform_counts || []).slice(0, 5);
                    const platformName = platformData[index]?.platform || '';
                    
                    const labelX = x + width / 2;
                    const labelY = y + height - 15; // Fixed position from bottom for alignment
                    
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        fill="#ffffff"
                        textAnchor="start"
                        dominantBaseline="central"
                        transform={`rotate(-90, ${labelX}, ${labelY})`}
                        fontSize={14}
                        fontWeight={500}
                      >
                        {platformName}
                      </text>
                    );
                  }}
                >
                  {(summary?.platform_counts || []).slice(0, 5).map((entry, index) => {
                    const color = BLUE_SHADES[index % BLUE_SHADES.length];
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        fillOpacity={0.4}
                        stroke={color}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
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
                  outerRadius={80}
                  label={(props: any) => {
                    const { cx, cy, midAngle, outerRadius, index, value } = props;
                    const total = (summary?.sentiment_breakdown || []).reduce((sum, item) => sum + item.count, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    const color = COLORS[index % COLORS.length];
                    
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={color}
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={500}
                      >
                        {`${value} (${percentage}%)`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: '#9ca3af' }}
                  strokeWidth={2}
                >
                  {summary?.sentiment_breakdown.map((entry, index) => {
                    const color = COLORS[index % COLORS.length];
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        fillOpacity={0.4}
                        stroke={color}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={(props) => {
                  if (props.active && props.payload && props.payload.length) {
                    const data = props.payload[0];
                    const total = (summary?.sentiment_breakdown || []).reduce((sum, item) => sum + item.count, 0);
                    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                    return (
                      <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}>
                        <p style={{ color: '#ffffff', fontWeight: 500, margin: 0 }}>
                          {data.name}
                        </p>
                        <p style={{ color: '#f97316', margin: '4px 0 0 0' }}>
                          {data.value} ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary?.category_counts || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: any) => {
                    const { cx, cy, midAngle, outerRadius, index, value } = props;
                    const total = (summary?.category_counts || []).reduce((sum, item) => sum + item.count, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    const color = COLORS[index % COLORS.length];
                    
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={color}
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={500}
                      >
                        {`${value} (${percentage}%)`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: '#9ca3af' }}
                  strokeWidth={2}
                >
                  {summary?.category_counts.map((entry, index) => {
                    const color = COLORS[index % COLORS.length];
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={color}
                        fillOpacity={0.4}
                        stroke={color}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={(props) => {
                  if (props.active && props.payload && props.payload.length) {
                    const data = props.payload[0];
                    const total = (summary?.category_counts || []).reduce((sum, item) => sum + item.count, 0);
                    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                    return (
                      <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}>
                        <p style={{ color: '#ffffff', fontWeight: 500, margin: 0 }}>
                          {data.name}
                        </p>
                        <p style={{ color: '#f97316', margin: '4px 0 0 0' }}>
                          {data.value} ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '11px' }} />
              </PieChart>
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
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-card">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Churn Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-bg divide-y divide-gray-200 dark:divide-gray-700">
                {recentReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.review_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.rating}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.overall_sentiment || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.churn_risk || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {review.primary_category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <Link
                        href={`/reviews/${review.id}`}
                        className="text-accent-blue hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
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
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-dark-card rounded-xl border border-dark-border"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}


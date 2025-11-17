'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { FrontierReviewProcessed } from '@/types';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<FrontierReviewProcessed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await fetch(`/api/reviews/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setReview(data);
        } else if (response.status === 404) {
          setReview(null); // Explicitly set to null for 404
        } else {
          throw new Error(`Failed to fetch review: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching review:', error);
        setReview(null); // Set to null on error
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReview();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Review not found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reviews
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Review Details</h1>
        <p className="text-gray-600 mt-1">Review ID: {review.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Review Date</label>
              <p className="text-gray-900">{review.review_date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Platform</label>
              <p className="text-gray-900">{review.platform}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rating</label>
              <p className="text-gray-900 text-2xl font-bold">{review.rating}/5</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reviewer</label>
              <p className="text-gray-900">{review.reviewer_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-gray-900">
                {review.city && review.state
                  ? `${review.city}, ${review.state}`
                  : review.state || review.city || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Review URL</label>
              <a
                href={review.review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View original <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Overall Sentiment</label>
              <div className="mt-1">
                <Badge variant={review.overall_sentiment?.includes('positive') ? 'success' : review.overall_sentiment?.includes('negative') ? 'danger' : 'default'}>
                  {review.overall_sentiment || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sentiment Score</label>
              <p className="text-gray-900">{review.sentiment_score?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Churn Risk</label>
              <div className="mt-1">
                <Badge variant={review.churn_risk === 'critical' || review.churn_risk === 'high' ? 'danger' : review.churn_risk === 'medium' ? 'warning' : 'success'}>
                  {review.churn_risk || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Churn Probability</label>
              <p className="text-gray-900">
                {review.churn_probability_score ? `${(review.churn_probability_score * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Primary Category</label>
              <p className="text-gray-900">{review.primary_category || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">NPS Indicator</label>
              <div className="mt-1">
                <Badge variant={review.nps_indicator === 'promoter' ? 'success' : review.nps_indicator === 'detractor' ? 'danger' : 'default'}>
                  {review.nps_indicator || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Urgency Level</label>
              <p className="text-gray-900">{review.urgency_level || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Resolution Status</label>
              <p className="text-gray-900">{review.resolution_status || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Text */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review Text</CardTitle>
        </CardHeader>
        <CardContent>
          {review.title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{review.title}</h3>
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{review.review_text}</p>
        </CardContent>
      </Card>

      {/* AI Attributes */}
      {review.ai_attributes && Object.keys(review.ai_attributes).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Extracted Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(review.ai_attributes).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-gray-900">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


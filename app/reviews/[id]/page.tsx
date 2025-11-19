'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ExternalLink, ChevronRight, ChevronDown } from 'lucide-react';
import type { FrontierReviewProcessed } from '@/types';

// Helper component to render expandable/collapsible tree nodes
function TreeNode({ label, value, level = 0 }: { label?: string; value: any; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(false); // All collapsed by default
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center gap-2 py-1">
        {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>}
        <span className="text-gray-500 dark:text-gray-500 italic text-sm">N/A</span>
      </div>
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="flex items-center gap-2 py-1">
          {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>}
          <span className="text-gray-500 dark:text-gray-500 italic text-sm">None</span>
        </div>
      );
    }

    // Check if array contains complex types (objects/arrays)
    const hasComplexItems = value.some(item => typeof item === 'object' && item !== null);

    if (!hasComplexItems) {
      // Simple array - display inline with bullets
      return (
        <div className="py-1">
          {label && <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">{label}:</span>}
          <div className="space-y-1 ml-4">
            {value.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">•</span>
                <span className="text-gray-800 dark:text-gray-100 text-sm">{String(item)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Complex array - make it expandable
    return (
      <div className="py-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg/50 rounded px-2 py-1 transition-colors w-full text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          )}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {label || 'Items'} <span className="text-gray-500 text-sm">({value.length})</span>
          </span>
        </button>
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-3">
            {value.map((item, idx) => (
              <TreeNode key={idx} label={`[${idx}]`} value={item} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Handle objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return (
        <div className="flex items-center gap-2 py-1">
          {label && <span className="font-medium text-gray-700 dark:text-gray-300">{label}:</span>}
          <span className="text-gray-500 dark:text-gray-500 italic text-sm">None</span>
        </div>
      );
    }

    return (
      <div className="py-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg/50 rounded px-2 py-1 transition-colors w-full text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          )}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {label ? label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Object'}
          </span>
        </button>
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-3">
            {entries.map(([key, val]) => (
              <TreeNode key={key} label={key} value={val} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Handle primitives (string, number, boolean)
  const renderPrimitiveValue = () => {
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'success' : 'default'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    return <span className="text-gray-800 dark:text-gray-100 text-sm">{String(value)}</span>;
  };

  return (
    <div className="flex items-center gap-2 py-1">
      {label && (
        <span className="font-medium text-gray-700 dark:text-gray-300 min-w-fit">
          {label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:
        </span>
      )}
      {renderPrimitiveValue()}
    </div>
  );
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<FrontierReviewProcessed | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

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

  const handleGenerateSummary = async () => {
    if (!review?.review_text) return;
    
    setShowSummary(true);
    
    // Check if pre-generated summary exists
    if (review.review_summary) {
      setSummary(review.review_summary);
      return;
    }
    
    // Otherwise, generate summary in real-time using Claude API
    setLoadingSummary(true);
    
    try {
      const response = await fetch(`/api/reviews/${params.id}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewText: review.review_text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        setSummary('Failed to generate summary. Please try again.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!review?.review_text || !question.trim()) return;
    
    setLoadingAnswer(true);
    setAnswer('');
    
    try {
      const response = await fetch(`/api/reviews/${params.id}/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewText: review.review_text, question: question.trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
      } else {
        setAnswer('Failed to get an answer. Please try again.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Failed to get an answer. Please try again.');
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleQuestionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !answer) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const handleOpenQuestionModal = () => {
    setShowQuestion(true);
    setQuestion('');
    setAnswer('');
  };

  const handleResetQuestion = () => {
    setQuestion('');
    setAnswer('');
  };

  const handleQuestionButtonClick = () => {
    if (answer) {
      // If there's already an answer, reset the form
      handleResetQuestion();
    } else {
      // Otherwise, submit the question
      handleAskQuestion();
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-64 bg-dark-card rounded"></div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-8 bg-dark-bg min-h-screen">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Review not found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 text-accent-blue hover:text-blue-400 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-accent-blue hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reviews
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Review Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review ID: {review.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Review Date</label>
              <p className="text-gray-800 dark:text-gray-100">{review.review_date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform</label>
              <p className="text-gray-800 dark:text-gray-100">{review.platform}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</label>
              <p className="text-gray-800 dark:text-gray-100 text-2xl font-bold">{review.rating}/5</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewer</label>
              <p className="text-gray-800 dark:text-gray-100">{review.reviewer_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
              <p className="text-gray-800 dark:text-gray-100">
                {review.city && review.state
                  ? `${review.city}, ${review.state}`
                  : review.state || review.city || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Review URL</label>
              <a
                href={review.review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue hover:text-blue-400 flex items-center gap-1 transition-colors"
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
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Sentiment</label>
              <div className="mt-1">
                <Badge variant={review.overall_sentiment?.includes('positive') ? 'success' : review.overall_sentiment?.includes('negative') ? 'danger' : 'default'}>
                  {review.overall_sentiment || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sentiment Score</label>
              <p className="text-gray-800 dark:text-gray-100">
                {typeof review.sentiment_score === 'number' ? review.sentiment_score.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Risk</label>
              <div className="mt-1">
                <Badge variant={review.churn_risk === 'critical' || review.churn_risk === 'high' ? 'danger' : review.churn_risk === 'medium' ? 'warning' : 'success'}>
                  {review.churn_risk || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Probability</label>
              <p className="text-gray-800 dark:text-gray-100">
                {typeof review.churn_probability_score === 'number' ? `${(review.churn_probability_score * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Category</label>
              <p className="text-gray-800 dark:text-gray-100">{review.primary_category || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">NPS Indicator</label>
              <div className="mt-1">
                <Badge variant={review.nps_indicator === 'promoter' ? 'success' : review.nps_indicator === 'detractor' ? 'danger' : 'default'}>
                  {review.nps_indicator || 'N/A'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgency Level</label>
              <p className="text-gray-800 dark:text-gray-100">{review.urgency_level || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolution Status</label>
              <p className="text-gray-800 dark:text-gray-100">{review.resolution_status || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Text */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Review Text</CardTitle>
            <button
              onClick={handleGenerateSummary}
              className="px-4 py-2 text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              AI Summary
            </button>
            <button
              onClick={handleOpenQuestionModal}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask a Question
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {review.title && (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{review.title}</h3>
          )}
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{review.review_text}</p>
        </CardContent>
      </Card>

      {/* AI Summary Modal */}
      {showSummary && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSummary(false)}
        >
          <div 
            className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Summary
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-dark-border pt-4">
              {loadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Generating summary...</span>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {summary}
                </p>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask a Question Modal */}
      {showQuestion && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuestion(false)}
        >
          <div 
            className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ask About This Review
              </h3>
              <button
                onClick={() => setShowQuestion(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-4">
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleQuestionKeyPress}
                  placeholder="e.g., What was the main complaint? What action items are mentioned?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loadingAnswer || !!answer}
                />
              </div>

              {/* Answer Display */}
              {(answer || loadingAnswer) && (
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 min-h-[100px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Answer
                  </label>
                  {loadingAnswer ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {answer}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowQuestion(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-dark-bg hover:bg-gray-300 dark:hover:bg-dark-bg/80 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleQuestionButtonClick}
                disabled={loadingAnswer || (!answer && !question.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {answer ? 'Ask Another Question' : 'Ask Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Attributes */}
      {review.ai_attributes && Object.keys(review.ai_attributes).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Extracted Attributes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(review.ai_attributes)
                .filter(([key]) => key !== 'schema_version')
                .map(([key, value]) => (
                  <TreeNode key={key} label={key} value={value} level={0} />
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


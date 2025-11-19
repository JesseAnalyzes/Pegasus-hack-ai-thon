// Type definitions for Nimbus application

export type OverallSentiment = 
  | 'very_negative' 
  | 'negative' 
  | 'neutral' 
  | 'positive' 
  | 'very_positive';

export type ChurnRisk = 'low' | 'medium' | 'high' | 'critical';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReputationRisk = 'low' | 'medium' | 'high' | 'critical';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ResolutionStatus = 
  | 'unresolved' 
  | 'partially_resolved' 
  | 'resolved' 
  | 'worsening';

export type ProcessingStatus = 
  | 'pending' 
  | 'claude_processed' 
  | 'vector_processed' 
  | 'completed' 
  | 'errored';

export type NPSIndicator = 'detractor' | 'passive' | 'promoter';

export type AreaType = 'urban' | 'suburban' | 'rural';

export interface FrontierReviewProcessed {
  id: number;
  review_id: number;
  platform: string;
  review_date: string; // ISO date string
  rating: number; // 1-5
  reviewer_name: string;
  location: string | null;
  review_text: string;
  helpful_count: number;
  review_url: string;
  title: string | null;
  verified_reviewer: boolean | null;
  verified_customer: boolean | null;
  local_guide: boolean | null;
  city: string | null;
  state: string | null;
  region: string | null;
  area_type: AreaType | null;
  date_parsed: string | null;
  year: number | null;
  month: number | null;
  quarter: string | null;
  week_of_year: number | null;
  days_ago: number | null;
  processing_status: ProcessingStatus;
  error_message: string | null;
  processing_attempts: number;
  last_processed_at: string | null;
  sentiment_score: number | null; // -1.0 to 1.0
  overall_sentiment: OverallSentiment | null;
  sentiment_intensity: string | null;
  urgency_level: UrgencyLevel | null;
  churn_risk: ChurnRisk | null;
  churn_probability_score: number | null; // 0.0 to 1.0
  retention_opportunity: boolean | null;
  primary_category: string | null;
  nps_indicator: NPSIndicator | null;
  would_recommend: boolean | null;
  reputation_risk: ReputationRisk | null;
  resolution_urgency: string | null;
  reviewer_type: string | null;
  customer_tenure_months: number | null;
  tenure_category: string | null;
  tech_savviness: string | null;
  issue_severity: IssueSeverity | null;
  issue_frequency: string | null;
  resolution_status: ResolutionStatus | null;
  ai_attributes: Record<string, any> | null; // JSONB
  review_summary: string | null; // Pre-generated 25-word summary
  gte_embedding: string | null; // Vector as string representation
  embedding_model: string | null;
  embedding_created_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewFilters {
  dateFrom?: string;
  dateTo?: string;
  platforms?: string[];
  regions?: string[];
  states?: string[];
  cities?: string[];
  areaTypes?: AreaType[];
  churnRisk?: ChurnRisk[];
  overallSentiment?: OverallSentiment[];
  primaryCategories?: string[];
  npsIndicator?: NPSIndicator[];
  minRating?: number;
  maxRating?: number;
  minSentimentScore?: number;
  maxSentimentScore?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  sortBy?: 'review_date' | 'rating' | 'sentiment_score' | 'churn_probability_score' | 'helpful_count';
  sortDirection?: 'asc' | 'desc';
}

export interface SummaryStats {
  total_reviews: number;
  avg_rating: number;
  avg_sentiment_score: number;
  sentiment_breakdown: {
    sentiment: OverallSentiment;
    count: number;
    percentage: number;
  }[];
  churn_risk_breakdown: {
    risk: ChurnRisk;
    count: number;
    percentage: number;
  }[];
  platform_counts: {
    platform: string;
    count: number;
  }[];
  region_counts: {
    region: string;
    count: number;
  }[];
  state_counts: {
    state: string;
    count: number;
  }[];
  nps_breakdown: {
    indicator: NPSIndicator;
    count: number;
    percentage: number;
  }[];
  category_counts: {
    category: string;
    count: number;
  }[];
  high_churn_percentage: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  count?: number;
}

export interface BreakdownItem {
  group: string;
  count: number;
  avg_rating: number;
  avg_sentiment_score: number;
  high_churn_count: number;
  high_churn_percentage: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  filters?: ReviewFilters;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  usedReviewIds: number[];
  sources: {
    id: number;
    review_date: string;
    rating: number;
    overall_sentiment: string | null;
    churn_risk: string | null;
    primary_category: string | null;
    snippet: string;
  }[];
}


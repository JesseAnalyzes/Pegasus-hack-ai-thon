/**
 * Data access layer for frontier_reviews_processed table
 * Provides reusable query helpers for dashboard, analytics, and chat
 */

import { query } from './db';
import type {
  FrontierReviewProcessed,
  ReviewFilters,
  PaginationParams,
  SortParams,
  SummaryStats,
  TimeSeriesPoint,
  BreakdownItem,
} from '@/types';

/**
 * Build WHERE clause and parameters from filters
 */
function buildFilterClause(
  filters: ReviewFilters = {},
  paramOffset: number = 0
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = paramOffset + 1;

  // Schema prefix
  const schemaPrefix = 'team_pegasus.';

  if (filters.dateFrom) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.review_date >= $${paramIndex}`);
    params.push(filters.dateFrom);
    paramIndex++;
  }

  if (filters.dateTo) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.review_date <= $${paramIndex}`);
    params.push(filters.dateTo);
    paramIndex++;
  }

  if (filters.platforms && filters.platforms.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.platform = ANY($${paramIndex})`);
    params.push(filters.platforms);
    paramIndex++;
  }

  if (filters.regions && filters.regions.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.region = ANY($${paramIndex})`);
    params.push(filters.regions);
    paramIndex++;
  }

  if (filters.states && filters.states.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.state = ANY($${paramIndex})`);
    params.push(filters.states);
    paramIndex++;
  }

  if (filters.cities && filters.cities.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.city = ANY($${paramIndex})`);
    params.push(filters.cities);
    paramIndex++;
  }

  if (filters.areaTypes && filters.areaTypes.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.area_type = ANY($${paramIndex})`);
    params.push(filters.areaTypes);
    paramIndex++;
  }

  if (filters.churnRisk && filters.churnRisk.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.churn_risk = ANY($${paramIndex})`);
    params.push(filters.churnRisk);
    paramIndex++;
  }

  if (filters.overallSentiment && filters.overallSentiment.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.overall_sentiment = ANY($${paramIndex})`);
    params.push(filters.overallSentiment);
    paramIndex++;
  }

  if (filters.primaryCategories && filters.primaryCategories.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.primary_category = ANY($${paramIndex})`);
    params.push(filters.primaryCategories);
    paramIndex++;
  }

  if (filters.npsIndicator && filters.npsIndicator.length > 0) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.nps_indicator = ANY($${paramIndex})`);
    params.push(filters.npsIndicator);
    paramIndex++;
  }

  if (filters.minRating !== undefined) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.rating >= $${paramIndex}`);
    params.push(filters.minRating);
    paramIndex++;
  }

  if (filters.maxRating !== undefined) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.rating <= $${paramIndex}`);
    params.push(filters.maxRating);
    paramIndex++;
  }

  if (filters.minSentimentScore !== undefined) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.sentiment_score >= $${paramIndex}`);
    params.push(filters.minSentimentScore);
    paramIndex++;
  }

  if (filters.maxSentimentScore !== undefined) {
    conditions.push(`${schemaPrefix}frontier_reviews_processed.sentiment_score <= $${paramIndex}`);
    params.push(filters.maxSentimentScore);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(
      `(${schemaPrefix}frontier_reviews_processed.review_text ILIKE $${paramIndex} OR ${schemaPrefix}frontier_reviews_processed.title ILIKE $${paramIndex})`
    );
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  // Ensure we don't have SQL injection - all values are parameterized
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

/**
 * Helper to append additional WHERE conditions
 */
function appendCondition(existingWhereClause: string, condition: string): string {
  if (!existingWhereClause) {
    return `WHERE ${condition}`;
  }
  return `${existingWhereClause} AND ${condition}`;
}

/**
 * Get summary statistics with filters
 */
export async function getSummaryStats(
  filters: ReviewFilters = {}
): Promise<SummaryStats> {
  const schemaPrefix = 'team_pegasus.';
  const { whereClause, params } = buildFilterClause(filters);

  // Main stats query
  const statsQuery = `
    SELECT 
      COUNT(*) as total_reviews,
      AVG(rating)::numeric(10,2) as avg_rating,
      AVG(sentiment_score)::numeric(10,2) as avg_sentiment_score,
      COUNT(*) FILTER (WHERE churn_risk IN ('high', 'critical')) as high_churn_count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
  `;

  // Sentiment breakdown
  const sentimentQuery = `
    SELECT 
      overall_sentiment as sentiment,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM ${schemaPrefix}frontier_reviews_processed ${whereClause}), 0), 2) as percentage
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    GROUP BY overall_sentiment
    ORDER BY 
      CASE overall_sentiment
        WHEN 'very_negative' THEN 1
        WHEN 'negative' THEN 2
        WHEN 'neutral' THEN 3
        WHEN 'positive' THEN 4
        WHEN 'very_positive' THEN 5
        ELSE 6
      END
  `;

  // Churn risk breakdown
  const churnQuery = `
    SELECT 
      churn_risk as risk,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM ${schemaPrefix}frontier_reviews_processed ${whereClause}), 0), 2) as percentage
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    GROUP BY churn_risk
    ORDER BY 
      CASE churn_risk
        WHEN 'low' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'high' THEN 3
        WHEN 'critical' THEN 4
        ELSE 5
      END
  `;

  // Platform counts
  const platformQuery = `
    SELECT platform, COUNT(*) as count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    GROUP BY platform
    ORDER BY count DESC
  `;

  // Region counts
  const regionQuery = `
    SELECT region, COUNT(*) as count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${appendCondition(whereClause, 'region IS NOT NULL')}
    GROUP BY region
    ORDER BY count DESC
  `;

  // State counts
  const stateQuery = `
    SELECT state, COUNT(*) as count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${appendCondition(whereClause, 'state IS NOT NULL')}
    GROUP BY state
    ORDER BY count DESC
  `;

  // NPS breakdown
  const npsQuery = `
    SELECT 
      nps_indicator as indicator,
      COUNT(*) as count,
      ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM ${schemaPrefix}frontier_reviews_processed ${whereClause}), 0), 2) as percentage
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    GROUP BY nps_indicator
    ORDER BY 
      CASE nps_indicator
        WHEN 'detractor' THEN 1
        WHEN 'passive' THEN 2
        WHEN 'promoter' THEN 3
        ELSE 4
      END
  `;

  const [stats, sentiment, churn, platforms, regions, states, nps] = await Promise.all([
    query(statsQuery, params),
    query(sentimentQuery, params),
    query(churnQuery, params),
    query(platformQuery, params),
    query(regionQuery, params),
    query(stateQuery, params),
    query(npsQuery, params),
  ]);

  const totalReviews = parseInt(stats.rows[0]?.total_reviews || '0', 10);
  const highChurnCount = parseInt(stats.rows[0]?.high_churn_count || '0', 10);

  return {
    total_reviews: totalReviews,
    avg_rating: parseFloat(stats.rows[0]?.avg_rating || '0'),
    avg_sentiment_score: parseFloat(stats.rows[0]?.avg_sentiment_score || '0'),
    sentiment_breakdown: sentiment.rows.map((r: any) => ({
      sentiment: r.sentiment,
      count: parseInt(r.count, 10),
      percentage: parseFloat(r.percentage || '0'),
    })),
    churn_risk_breakdown: churn.rows.map((r: any) => ({
      risk: r.risk,
      count: parseInt(r.count, 10),
      percentage: parseFloat(r.percentage || '0'),
    })),
    platform_counts: platforms.rows.map((r: any) => ({
      platform: r.platform,
      count: parseInt(r.count, 10),
    })),
    region_counts: regions.rows.map((r: any) => ({
      region: r.region,
      count: parseInt(r.count, 10),
    })),
    state_counts: states.rows.map((r: any) => ({
      state: r.state,
      count: parseInt(r.count, 10),
    })),
    nps_breakdown: nps.rows.map((r: any) => ({
      indicator: r.indicator,
      count: parseInt(r.count, 10),
      percentage: parseFloat(r.percentage || '0'),
    })),
    high_churn_percentage: totalReviews > 0 ? (highChurnCount / totalReviews) * 100 : 0,
  };
}

/**
 * Get time series data by day, week, month, or quarter
 */
export async function getTimeSeries(
  filters: ReviewFilters = {},
  granularity: 'day' | 'week' | 'month' | 'quarter' = 'day',
  metric: 'count' | 'avg_rating' | 'avg_sentiment' | 'churn_risk' = 'count'
): Promise<TimeSeriesPoint[]> {
  const schemaPrefix = 'team_pegasus.';
  const { whereClause, params } = buildFilterClause(filters);

  let dateGroupBy: string;
  switch (granularity) {
    case 'day':
      dateGroupBy = "DATE_TRUNC('day', review_date)";
      break;
    case 'week':
      dateGroupBy = "DATE_TRUNC('week', review_date)";
      break;
    case 'month':
      dateGroupBy = "DATE_TRUNC('month', review_date)";
      break;
    case 'quarter':
      dateGroupBy = "DATE_TRUNC('quarter', review_date)";
      break;
  }

  let metricSelect: string;
  switch (metric) {
    case 'count':
      metricSelect = 'COUNT(*)::int as value';
      break;
    case 'avg_rating':
      metricSelect = 'AVG(rating)::numeric(10,2) as value';
      break;
    case 'avg_sentiment':
      metricSelect = 'AVG(sentiment_score)::numeric(10,2) as value';
      break;
    case 'churn_risk':
      metricSelect = "COUNT(*) FILTER (WHERE churn_risk IN ('high', 'critical'))::int as value";
      break;
  }

  const queryText = `
    SELECT 
      ${dateGroupBy}::date as date,
      ${metricSelect},
      COUNT(*)::int as count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    GROUP BY ${dateGroupBy}
    ORDER BY date ASC
  `;

  const result = await query(queryText, params);
  return result.rows.map((r: any) => ({
    date: r.date.toISOString().split('T')[0],
    value: parseFloat(r.value || '0'),
    count: r.count,
  }));
}

/**
 * Get breakdown by group (platform, region, state, primary_category, area_type)
 */
export async function getBreakdown(
  filters: ReviewFilters = {},
  groupBy: 'platform' | 'region' | 'state' | 'primary_category' | 'area_type' = 'platform'
): Promise<BreakdownItem[]> {
  const schemaPrefix = 'team_pegasus.';
  const { whereClause, params } = buildFilterClause(filters);

  const queryText = `
    SELECT 
      ${groupBy} as group,
      COUNT(*)::int as count,
      AVG(rating)::numeric(10,2) as avg_rating,
      AVG(sentiment_score)::numeric(10,2) as avg_sentiment_score,
      COUNT(*) FILTER (WHERE churn_risk IN ('high', 'critical'))::int as high_churn_count
    FROM ${schemaPrefix}frontier_reviews_processed
    ${appendCondition(whereClause, `${groupBy} IS NOT NULL`)}
    GROUP BY ${groupBy}
    ORDER BY count DESC
    LIMIT 50
  `;

  const result = await query(queryText, params);
  return result.rows.map((r: any) => ({
    group: r.group,
    count: parseInt(r.count, 10),
    avg_rating: parseFloat(r.avg_rating || '0'),
    avg_sentiment_score: parseFloat(r.avg_sentiment_score || '0'),
    high_churn_count: parseInt(r.high_churn_count, 10),
    high_churn_percentage: r.count > 0 ? (r.high_churn_count / r.count) * 100 : 0,
  }));
}

/**
 * Get paginated reviews with filters and sorting
 */
export async function getReviews(
  filters: ReviewFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 },
  sort: SortParams = { sortBy: 'review_date', sortDirection: 'desc' }
): Promise<{
  items: FrontierReviewProcessed[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}> {
  const schemaPrefix = 'team_pegasus.';
  const { whereClause, params } = buildFilterClause(filters);

  const offset = (pagination.page - 1) * pagination.pageSize;
  const sortBy = sort.sortBy || 'review_date';
  const sortDirection = sort.sortDirection || 'desc';

  // Count total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
  `;

  // Get items
  const itemsQuery = `
    SELECT *
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause}
    ORDER BY ${sortBy} ${sortDirection}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const [countResult, itemsResult] = await Promise.all([
    query(countQuery, params),
    query(itemsQuery, [...params, pagination.pageSize, offset]),
  ]);

  const totalItems = parseInt(countResult.rows[0]?.total || '0', 10);
  const totalPages = Math.ceil(totalItems / pagination.pageSize);

  return {
    items: itemsResult.rows.map((row: any) => ({
      ...row,
      review_date: row.review_date?.toISOString().split('T')[0] || row.review_date,
      date_parsed: row.date_parsed?.toISOString().split('T')[0] || row.date_parsed,
      created_at: row.created_at?.toISOString() || row.created_at,
      updated_at: row.updated_at?.toISOString() || row.updated_at,
      last_processed_at: row.last_processed_at?.toISOString() || row.last_processed_at,
      embedding_created_at: row.embedding_created_at?.toISOString() || row.embedding_created_at,
    })) as FrontierReviewProcessed[],
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems,
    totalPages,
  };
}

/**
 * Get a single review by ID
 */
export async function getReviewById(id: number): Promise<FrontierReviewProcessed | null> {
  const schemaPrefix = 'team_pegasus.';
  const result = await query(
    `SELECT * FROM ${schemaPrefix}frontier_reviews_processed WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0] as any;
  return {
    ...row,
    review_date: row.review_date?.toISOString().split('T')[0] || row.review_date,
    date_parsed: row.date_parsed?.toISOString().split('T')[0] || row.date_parsed,
    created_at: row.created_at?.toISOString() || row.created_at,
    updated_at: row.updated_at?.toISOString() || row.updated_at,
    last_processed_at: row.last_processed_at?.toISOString() || row.last_processed_at,
    embedding_created_at: row.embedding_created_at?.toISOString() || row.embedding_created_at,
  } as FrontierReviewProcessed;
}

/**
 * Semantic search using pgvector cosine similarity
 * Note: This requires the query embedding to be computed first (see lib/ai/embeddings.ts)
 */
export async function semanticSearchReviews(
  queryEmbedding: number[],
  filters: ReviewFilters = {},
  limit: number = 20
): Promise<FrontierReviewProcessed[]> {
  const schemaPrefix = 'team_pegasus.';
  const { whereClause, params } = buildFilterClause(filters);

  // Convert array to PostgreSQL vector format: [1,2,3] -> '[1,2,3]'
  // pgvector expects the format: '[1,2,3]' as a string
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  // Build the query with proper parameter indexing
  const embeddingParamIndex = params.length + 1;
  const limitParamIndex = params.length + 2;

  const queryText = `
    SELECT *, 
      gte_embedding <-> $${embeddingParamIndex}::vector as similarity
    FROM ${schemaPrefix}frontier_reviews_processed
    ${whereClause ? `${whereClause} AND` : 'WHERE'} 
      gte_embedding IS NOT NULL 
      AND embedding_model = 'gte-base'
    ORDER BY gte_embedding <-> $${embeddingParamIndex}::vector
    LIMIT $${limitParamIndex}
  `;

  const result = await query(queryText, [...params, embeddingStr, limit]);

  return result.rows.map((row: any) => ({
    ...row,
    review_date: row.review_date?.toISOString().split('T')[0] || row.review_date,
    date_parsed: row.date_parsed?.toISOString().split('T')[0] || row.date_parsed,
    created_at: row.created_at?.toISOString() || row.created_at,
    updated_at: row.updated_at?.toISOString() || row.updated_at,
    last_processed_at: row.last_processed_at?.toISOString() || row.last_processed_at,
    embedding_created_at: row.embedding_created_at?.toISOString() || row.embedding_created_at,
  })) as FrontierReviewProcessed[];
}


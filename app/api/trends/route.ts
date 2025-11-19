/**
 * GET /api/trends
 * Returns time series data with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeries } from '@/lib/queries';
import { z } from 'zod';
import type { ReviewFilters } from '@/types';

const QuerySchema = z.object({
  granularity: z.enum(['day', 'week', 'month', 'quarter']).default('day'),
  metric: z.enum(['count', 'avg_rating', 'avg_sentiment', 'churn_risk']).default('count'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  platforms: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  regions: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  states: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  cities: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  areaTypes: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  churnRisk: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  overallSentiment: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  primaryCategories: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  npsIndicator: z.string().optional().transform((val: string | undefined) => val?.split(',') || undefined),
  minRating: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : undefined)),
  maxRating: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : undefined)),
  minSentimentScore: z.string().optional().transform((val: string | undefined) => (val ? parseFloat(val) : undefined)),
  maxSentimentScore: z.string().optional().transform((val: string | undefined) => (val ? parseFloat(val) : undefined)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validated = QuerySchema.safeParse(queryParams);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validated.error.errors },
        { status: 400 }
      );
    }

    const { granularity, metric, ...filters } = validated.data;
    const trends = await getTimeSeries(filters as ReviewFilters, granularity, metric);

    return NextResponse.json({ trends });
  } catch (error: any) {
    console.error('Error in /api/trends:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';


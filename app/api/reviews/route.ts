/**
 * GET /api/reviews
 * Returns paginated reviews with filters, search, and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReviews } from '@/lib/queries';
import { z } from 'zod';
import type { ReviewFilters, PaginationParams, SortParams } from '@/types';

const QuerySchema = z.object({
  page: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 1)).default('1'),
  pageSize: z.string().optional().transform((val: string | undefined) => (val ? parseInt(val, 10) : 20)).default('20'),
  sortBy: z.enum(['review_date', 'rating', 'sentiment_score', 'churn_probability_score', 'helpful_count']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
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

    const { page, pageSize, sortBy, sortDirection, ...filters } = validated.data;
    
    const pagination: PaginationParams = { page, pageSize };
    const sort: SortParams = { sortBy, sortDirection };
    
    const result = await getReviews(filters as ReviewFilters, pagination, sort);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';


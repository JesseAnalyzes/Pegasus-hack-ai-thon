/**
 * GET /api/breakdowns
 * Returns breakdown by group (platform, region, state, primary_category, area_type)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBreakdown } from '@/lib/queries';
import { z } from 'zod';
import type { ReviewFilters } from '@/types';

const QuerySchema = z.object({
  groupBy: z.enum(['platform', 'region', 'state', 'primary_category', 'area_type']).default('platform'),
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

    const { groupBy, ...filters } = validated.data;
    const breakdown = await getBreakdown(filters as ReviewFilters, groupBy);

    return NextResponse.json({ breakdown });
  } catch (error: any) {
    console.error('Error in /api/breakdowns:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';


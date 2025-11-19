/**
 * GET /api/reviews/[id]
 * Returns detailed information for a single review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReviewById } from '@/lib/queries';
import { z } from 'zod';

const ParamsSchema = z.object({
  id: z.string().transform((val: string) => parseInt(val, 10)),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validated = ParamsSchema.safeParse({ id: params.id });
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid review ID', details: validated.error.errors },
        { status: 400 }
      );
    }

    const review = await getReviewById(validated.data.id);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Error in /api/reviews/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';


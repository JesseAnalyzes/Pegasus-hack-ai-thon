/**
 * POST /api/chat
 * AI-powered chat endpoint using Claude Sonnet with semantic search
 */

import { NextRequest, NextResponse } from 'next/server';
import { processChatRequest } from '@/lib/ai/chat';
import { z } from 'zod';
import type { ChatRequest } from '@/types';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000), // Limit message length
  filters: z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    platforms: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    states: z.array(z.string()).optional(),
    cities: z.array(z.string()).optional(),
    areaTypes: z.array(z.string()).optional(),
    churnRisk: z.array(z.string()).optional(),
    overallSentiment: z.array(z.string()).optional(),
    primaryCategories: z.array(z.string()).optional(),
    npsIndicator: z.array(z.string()).optional(),
    minRating: z.number().optional(),
    maxRating: z.number().optional(),
    minSentimentScore: z.number().optional(),
    maxSentimentScore: z.number().optional(),
    search: z.string().optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000), // Limit history message length
  })).max(20).optional(), // Limit history length
});

// Maximum request body size (2MB)
const MAX_BODY_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const validated = ChatRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validated.error.errors },
        { status: 400 }
      );
    }

    const chatRequest: ChatRequest = validated.data;
    const response = await processChatRequest(chatRequest);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Ensure this route uses Node.js runtime for Vercel
export const runtime = 'nodejs';


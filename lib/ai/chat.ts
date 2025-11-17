/**
 * AI Chat integration with Claude Sonnet
 * Handles natural language questions about review data
 */

import Anthropic from '@anthropic-ai/sdk';
import { generateEmbedding, shouldUseKeywordSearch } from './embeddings';
import { semanticSearchReviews, getReviews } from '../queries';
import type { ReviewFilters, ChatRequest, ChatResponse } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Build context from retrieved reviews for the LLM
 */
function buildReviewContext(reviews: any[]): string {
  if (reviews.length === 0) {
    return 'No relevant reviews found.';
  }

  return reviews
    .slice(0, 20) // Limit to top 20 for context
    .map((review, idx) => {
      const snippet = review.review_text.substring(0, 200);
      return `
Review ${review.id} (${review.review_date}):
- Rating: ${review.rating}/5
- Platform: ${review.platform}
- Location: ${review.state || review.city || 'Unknown'}
- Sentiment: ${review.overall_sentiment || 'N/A'}
- Churn Risk: ${review.churn_risk || 'N/A'}
- Category: ${review.primary_category || 'N/A'}
- Text: "${snippet}${review.review_text.length > 200 ? '...' : ''}"
`.trim();
    })
    .join('\n\n');
}

/**
 * Build system prompt with schema information
 */
function buildSystemPrompt(): string {
  return `You are Nimbus, an AI assistant that helps analyze customer reviews for Frontier Communications.

You have access to a PostgreSQL database table called \`team_pegasus.frontier_reviews_processed\` with the following key fields:

**Core Review Data:**
- review_id, platform, review_date, rating (1-5), reviewer_name, location
- review_text, title, review_url, helpful_count

**Geographic & Temporal:**
- city, state, region, area_type (urban/suburban/rural)
- year, month, quarter, week_of_year, days_ago

**AI-Enriched Fields:**
- sentiment_score (-1.0 to 1.0), overall_sentiment (very_negative/negative/neutral/positive/very_positive)
- churn_risk (low/medium/high/critical), churn_probability_score (0.0 to 1.0)
- primary_category (problem category), nps_indicator (detractor/passive/promoter)
- urgency_level, reputation_risk, issue_severity, resolution_status
- ai_attributes (JSONB with additional extracted data)

**Instructions:**
1. Answer questions about trends, patterns, and insights in the review data
2. Cite specific review IDs when referencing individual reviews
3. Use the provided context reviews to ground your answers
4. If asked about aggregations or trends not in the context, acknowledge that you're working with a sample
5. Be concise but informative
6. Format numbers and percentages clearly
7. If the question requires data not in context, suggest what additional queries might help

**Important:** Do not hallucinate data. Only reference information from the provided context or explicitly state when you don't have that information.`;
}

/**
 * Process chat request and generate response using Claude Sonnet
 */
export async function processChatRequest(
  request: ChatRequest
): Promise<ChatResponse> {
  const { message, filters = {}, history = [] } = request;

  // Step 1: Try semantic search to find relevant reviews
  let relevantReviews: any[] = [];
  let usedReviewIds: number[] = [];

  try {
    if (!shouldUseKeywordSearch()) {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(message);
      relevantReviews = await semanticSearchReviews(queryEmbedding, filters, 20);
    } else {
      // Fallback to keyword search (implemented in queries.ts via filters.search)
      // For now, we'll get recent reviews as context
      const { items } = await getReviews(filters, { page: 1, pageSize: 20 });
      relevantReviews = items;
    }

    usedReviewIds = relevantReviews.map((r) => r.id);
  } catch (error) {
    console.error('Error in semantic search:', error);
    // Continue with empty context if search fails
  }

  // Step 2: Build context string
  const reviewContext = buildReviewContext(relevantReviews);

  // Step 3: Build messages for Claude
  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    {
      role: 'user',
      content: `Context from relevant reviews:\n\n${reviewContext}\n\n\nUser question: ${message}`,
    },
  ];

  // Step 4: Call Claude API
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Claude Sonnet 3.5
      max_tokens: 2048,
      system: buildSystemPrompt(),
      messages: messages as Anthropic.MessageParam[],
    });

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    // Step 5: Build sources array
    const sources = relevantReviews.slice(0, 10).map((review) => ({
      id: review.id,
      review_date: review.review_date,
      rating: review.rating,
      overall_sentiment: review.overall_sentiment,
      churn_risk: review.churn_risk,
      primary_category: review.primary_category,
      snippet: review.review_text.substring(0, 150),
    }));

    return {
      answer,
      usedReviewIds,
      sources,
    };
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    throw new Error(`AI chat error: ${error.message || 'Unknown error'}`);
  }
}


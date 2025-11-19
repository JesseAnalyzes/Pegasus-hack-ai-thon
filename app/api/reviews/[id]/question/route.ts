import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import config from '@/config';

// Use config file first (for hackathon demo), then fall back to env vars
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey || process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reviewText, question } = await request.json();

    if (!reviewText || !question) {
      return NextResponse.json(
        { error: 'Review text and question are required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: config.anthropic.model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a specific customer review. Here is the review:

"${reviewText}"

Please answer the following question about this specific review. Keep your answer concise and relevant to the review content:

${question}`,
        },
      ],
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Error answering question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question', message: error.message },
      { status: 500 }
    );
  }
}

// Ensure this route uses Node.js runtime for Vercel
export const runtime = 'nodejs';



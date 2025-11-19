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
    const { reviewText } = await request.json();

    if (!reviewText) {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: config.anthropic.model, // Use model from config
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Summarize this customer review in exactly 25 words or less. Focus on the key issue and sentiment:\n\n${reviewText}`,
        },
      ],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', message: error.message },
      { status: 500 }
    );
  }
}

// Ensure this route uses Node.js runtime for Vercel
export const runtime = 'nodejs';


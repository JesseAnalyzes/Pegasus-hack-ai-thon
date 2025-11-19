/**
 * Embedding generation for semantic search
 * Supports generating embeddings for user queries to enable semantic search
 */

/**
 * Generate embedding for a text query
 * This is a placeholder - you can integrate with OpenAI, HuggingFace, or other embedding APIs
 * For now, we'll use a simple fallback or require EMBEDDING_API_KEY
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EMBEDDING_API_KEY;
  const apiUrl = process.env.EMBEDDING_API_URL || 'https://api.openai.com/v1/embeddings';

  if (!apiKey) {
    throw new Error('EMBEDDING_API_KEY is not set. Semantic search requires embedding generation.');
  }

  try {
    // Default to OpenAI-compatible API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Fallback: Simple keyword-based search when embeddings are not available
 * This doesn't generate embeddings but can be used as a fallback
 */
export function shouldUseKeywordSearch(): boolean {
  return !process.env.EMBEDDING_API_KEY;
}


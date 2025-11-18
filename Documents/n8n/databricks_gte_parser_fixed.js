// Parse Databricks GTE Embedding Response (OpenAI-compatible format)
const embeddingResponse = $json;
const reviewData = $input.first().json;

console.log('Processing embedding for review:', reviewData.review_id);

let embedding = null;
let embeddingString = null;

try {
  // OpenAI-compatible format: { "data": [{ "embedding": [...] }] }
  if (embeddingResponse.data && Array.isArray(embeddingResponse.data)) {
    embedding = embeddingResponse.data[0].embedding;
    console.log('✓ Found embedding in OpenAI format (data array)');
  }
  // Databricks format: { "predictions": [[...]] }
  else if (embeddingResponse.predictions && Array.isArray(embeddingResponse.predictions)) {
    embedding = embeddingResponse.predictions[0];
    console.log('✓ Found embedding in Databricks format (predictions)');
  }
  // Direct array format
  else if (Array.isArray(embeddingResponse)) {
    embedding = embeddingResponse[0];
    console.log('✓ Found embedding in direct array');
  }
  // Object with embedding key
  else if (embeddingResponse.embedding) {
    embedding = embeddingResponse.embedding;
    console.log('✓ Found embedding in object');
  }
  else {
    throw new Error('Unexpected response format: ' + JSON.stringify(embeddingResponse).substring(0, 200));
  }
  
  // Validate embedding
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Embedding is not a valid array. Got: ' + typeof embedding);
  }
  
  // Convert to PostgreSQL vector format: '[0.1,0.2,0.3,...]'
  embeddingString = '[' + embedding.join(',') + ']';
  
  console.log('✓ Embedding dimension:', embedding.length);
  console.log('✓ First 5 values:', embedding.slice(0, 5));
  console.log('✓ Model:', embeddingResponse.model);
  
} catch (error) {
  console.error('❌ Failed to parse embedding:', error.message);
  console.error('Response keys:', Object.keys(embeddingResponse));
  throw new Error('Embedding parse error: ' + error.message);
}

// Return complete data with embedding
return [{
  json: {
    // All previous data
    ...reviewData,
    
    // Add embedding data
    gte_embedding: embeddingString,
    embedding_array: embedding,
    embedding_dimension: embedding.length,
    embedding_model: embeddingResponse.model || 'databricks-gte-large-en',
    embedding_created_at: new Date().toISOString(),
    
    // Token usage (if available)
    embedding_tokens: embeddingResponse.usage?.total_tokens || null,
    
    // Update processing status
    processing_status: 'completed'
  }
}];


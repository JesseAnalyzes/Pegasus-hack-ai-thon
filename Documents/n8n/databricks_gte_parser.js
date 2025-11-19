// Parse Databricks GTE Embedding Response
// Place this AFTER the Databricks HTTP Request node

const embeddingResponse = $json;
const reviewData = $input.first().json;

console.log('Processing embedding for review:', reviewData.review_id);

let embedding = null;
let embeddingString = null;

try {
  // Databricks format: { "predictions": [[0.1, 0.2, ...]] }
  if (embeddingResponse.predictions && Array.isArray(embeddingResponse.predictions)) {
    embedding = embeddingResponse.predictions[0];
    console.log('✓ Found embedding in predictions array');
  } else if (Array.isArray(embeddingResponse)) {
    // Alternative format: direct array
    embedding = embeddingResponse[0];
    console.log('✓ Found embedding in direct array');
  } else if (embeddingResponse.embedding) {
    // Alternative format: object with embedding key
    embedding = embeddingResponse.embedding;
    console.log('✓ Found embedding in object');
  } else {
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
  console.log('✓ String length:', embeddingString.length);
  
} catch (error) {
  console.error('❌ Failed to parse embedding:', error.message);
  console.error('Response was:', JSON.stringify(embeddingResponse));
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
    embedding_model: 'databricks-gte-large-en',
    embedding_created_at: new Date().toISOString(),
    
    // Update processing status
    processing_status: 'completed'
  }
}];


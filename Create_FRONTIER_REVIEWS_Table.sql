-- Create the reviews table with pgvector support
CREATE TABLE frontier_reviews (
    -- Primary identifier
    id SERIAL PRIMARY KEY,
    
    -- Core review fields
    review_id INTEGER NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL,
    review_date DATE NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewer_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    review_text TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    review_url TEXT NOT NULL,
    
    -- Optional platform-specific fields
    title VARCHAR(500),
    verified_reviewer BOOLEAN,
    verified_customer BOOLEAN,
    local_guide BOOLEAN,
    
    -- Vector embeddings (pgvector)
    review_text_embedding VECTOR(1536),  -- For OpenAI ada-002 or similar (adjust dimension as needed)
    title_embedding VECTOR(1536),        -- For title embeddings (if title exists)
    combined_embedding VECTOR(1536),     -- For combined title + review_text embedding
    
    -- Embedding metadata
    embedding_model VARCHAR(100),        -- e.g., 'text-embedding-ada-002', 'all-MiniLM-L6-v2'
    embedding_created_at TIMESTAMP WITH TIME ZONE,
    embedding_version INTEGER DEFAULT 1, -- Track if you re-embed with different models
    
    -- Record metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Data quality/processing flags
    is_processed BOOLEAN DEFAULT FALSE,
    sentiment_score DECIMAL(3,2),        -- Optional: store computed sentiment (-1 to 1)
    language_code VARCHAR(10) DEFAULT 'en'
);

-- Create indexes for common queries
CREATE INDEX idx_reviews_platform ON frontier_reviews(platform);
CREATE INDEX idx_reviews_rating ON frontier_reviews(rating);
CREATE INDEX idx_reviews_date ON frontier_reviews(review_date DESC);
CREATE INDEX idx_reviews_location ON frontier_reviews(location);
CREATE INDEX idx_reviews_is_processed ON frontier_reviews(is_processed);

-- Create GIN index for full-text search on review text
CREATE INDEX idx_reviews_text_search ON frontier_reviews USING gin(to_tsvector('english', review_text));
CREATE INDEX idx_reviews_title_search ON frontier_reviews USING gin(to_tsvector('english', COALESCE(title, '')));

-- Create HNSW indexes for vector similarity search (pgvector)
-- These enable fast approximate nearest neighbor search
CREATE INDEX idx_reviews_text_embedding_hnsw 
    ON frontier_reviews USING hnsw (review_text_embedding vector_cosine_ops);

CREATE INDEX idx_reviews_combined_embedding_hnsw 
    ON frontier_reviews USING hnsw (combined_embedding vector_cosine_ops);

-- Optional: IVFFlat index (alternative to HNSW, good for different use cases)
-- CREATE INDEX idx_reviews_text_embedding_ivfflat 
--     ON frontier_reviews USING ivfflat (review_text_embedding vector_cosine_ops) WITH (lists = 100);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reviews_timestamp
    BEFORE UPDATE ON frontier_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE frontier_reviews IS 'Stores customer reviews from multiple platforms with vector embeddings for semantic search';
COMMENT ON COLUMN frontier_reviews.review_text_embedding IS 'Vector embedding of the review_text field (1536 dimensions for OpenAI ada-002)';
COMMENT ON COLUMN frontier_reviews.combined_embedding IS 'Vector embedding combining title and review_text for comprehensive semantic search';
COMMENT ON COLUMN frontier_reviews.embedding_model IS 'Name/identifier of the embedding model used';


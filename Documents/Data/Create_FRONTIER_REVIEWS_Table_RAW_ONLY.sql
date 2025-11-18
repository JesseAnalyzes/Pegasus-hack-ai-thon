-- Create the RAW reviews table - stores only data as ingested from source platforms
-- This is the Bronze layer - no transformations, no calculated fields
-- All derived/calculated fields go to frontier_reviews_processed (Silver layer)

CREATE TABLE frontier_reviews (
    -- Primary identifier
    id SERIAL PRIMARY KEY,
    
    -- Core review fields (as they come from source platforms)
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
    
    -- Record metadata (system fields only)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Processing flag (simple boolean - detailed status in processed table)
    is_processed BOOLEAN DEFAULT FALSE,
    
    -- Language detection (if needed during ingestion)
    language_code VARCHAR(10) DEFAULT 'en'
);

-- Create indexes for common queries on raw data
CREATE INDEX idx_reviews_platform ON frontier_reviews(platform);
CREATE INDEX idx_reviews_rating ON frontier_reviews(rating);
CREATE INDEX idx_reviews_date ON frontier_reviews(review_date DESC);
CREATE INDEX idx_reviews_location ON frontier_reviews(location);
CREATE INDEX idx_reviews_is_processed ON frontier_reviews(is_processed);
CREATE INDEX idx_reviews_review_id ON frontier_reviews(review_id);

-- Create GIN index for full-text search on review text
CREATE INDEX idx_reviews_text_search ON frontier_reviews USING gin(to_tsvector('english', review_text));
CREATE INDEX idx_reviews_title_search ON frontier_reviews USING gin(to_tsvector('english', COALESCE(title, '')));

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
COMMENT ON TABLE frontier_reviews IS 'Bronze layer: Raw customer reviews from multiple platforms - no transformations or calculated fields';
COMMENT ON COLUMN frontier_reviews.is_processed IS 'Simple flag indicating if review has been processed. Detailed status in frontier_reviews_processed table';



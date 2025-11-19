-- Create the processed reviews table with AI attributes and embeddings
-- This table stores all processed information from frontier_reviews after AI analysis

CREATE TABLE frontier_reviews_processed (
    -- Primary identifier
    id SERIAL PRIMARY KEY,
    
    -- Foreign key to original review
    review_id INTEGER NOT NULL UNIQUE REFERENCES frontier_reviews(review_id) ON DELETE CASCADE,
    
    -- Copy of original review fields (for denormalized access)
    platform VARCHAR(50) NOT NULL,
    review_date DATE NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewer_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    review_text TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    review_url TEXT NOT NULL,
    title VARCHAR(500),
    verified_reviewer BOOLEAN,
    verified_customer BOOLEAN,
    local_guide BOOLEAN,
    
    -- Geographic metadata (calculated from location)
    city VARCHAR(100),
    state VARCHAR(50),
    region VARCHAR(50),
    area_type VARCHAR(20),  -- urban, suburban, rural
    
    -- Temporal metadata (calculated from review_date)
    date_parsed DATE,  -- ISO format date for consistent sorting
    year INTEGER,
    month INTEGER,
    quarter VARCHAR(10),  -- e.g., "Q3 2024"
    week_of_year INTEGER,
    days_ago INTEGER,
    
    -- Processing status tracking
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (processing_status IN ('pending', 'claude_processed', 'vector_processed', 'completed', 'errored')),
    error_message TEXT,
    processing_attempts INTEGER DEFAULT 0,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Key extracted fields as dedicated columns (for easy querying and indexing)
    -- Sentiment Analysis
    sentiment_score DECIMAL(3,2),  -- -1.0 to 1.0
    overall_sentiment VARCHAR(50),  -- very_positive, positive, neutral, negative, very_negative, mixed
    sentiment_intensity VARCHAR(50),  -- mild, moderate, strong, extreme
    urgency_level VARCHAR(50),  -- low, medium, high, critical
    
    -- Churn Analysis
    churn_risk VARCHAR(50),  -- low, medium, high, critical
    churn_probability_score DECIMAL(3,2),  -- 0.0 to 1.0
    retention_opportunity BOOLEAN,
    
    -- Classification
    primary_category VARCHAR(255),
    nps_indicator VARCHAR(50),  -- detractor, passive, promoter
    would_recommend BOOLEAN,
    reputation_risk VARCHAR(50),  -- low, medium, high, critical
    resolution_urgency VARCHAR(50),  -- low, medium, high, critical
    
    -- Reviewer Profile (key fields)
    reviewer_type VARCHAR(50),  -- residential, business, senior, student
    customer_tenure_months INTEGER,
    tenure_category VARCHAR(50),  -- new_customer, established, long_term, very_long_term
    tech_savviness VARCHAR(50),  -- low, medium, high, expert
    
    -- Technical Issues
    issue_severity VARCHAR(50),  -- low, medium, high, critical
    issue_frequency VARCHAR(50),  -- one_time, rare, occasional, frequent, constant
    resolution_status VARCHAR(50),  -- unresolved, partially_resolved, resolved, worsening
    
    -- Full AI extracted attributes as JSONB (complete data from Claude)
    ai_attributes JSONB,
    
    -- Vector embeddings (GTE model)
    gte_embedding VECTOR(768),  -- GTE-base typically uses 768 dimensions
    embedding_model VARCHAR(100) DEFAULT 'gte-base',
    embedding_created_at TIMESTAMP WITH TIME ZONE,
    
    -- Record metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_processed_review_id ON frontier_reviews_processed(review_id);
CREATE INDEX idx_processed_status ON frontier_reviews_processed(processing_status);
CREATE INDEX idx_processed_sentiment_score ON frontier_reviews_processed(sentiment_score);
CREATE INDEX idx_processed_churn_risk ON frontier_reviews_processed(churn_risk);
CREATE INDEX idx_processed_primary_category ON frontier_reviews_processed(primary_category);
CREATE INDEX idx_processed_review_date ON frontier_reviews_processed(review_date DESC);
CREATE INDEX idx_processed_platform ON frontier_reviews_processed(platform);

-- Indexes for geographic metadata
CREATE INDEX idx_processed_state ON frontier_reviews_processed(state);
CREATE INDEX idx_processed_city ON frontier_reviews_processed(city);
CREATE INDEX idx_processed_area_type ON frontier_reviews_processed(area_type);
CREATE INDEX idx_processed_region ON frontier_reviews_processed(region);

-- Indexes for temporal metadata
CREATE INDEX idx_processed_year_month ON frontier_reviews_processed(year, month);
CREATE INDEX idx_processed_quarter ON frontier_reviews_processed(quarter);
CREATE INDEX idx_processed_year ON frontier_reviews_processed(year);

-- GIN index for JSONB queries on ai_attributes
CREATE INDEX idx_processed_ai_attributes_gin ON frontier_reviews_processed USING gin(ai_attributes);

-- HNSW index for vector similarity search (pgvector)
CREATE INDEX idx_processed_gte_embedding_hnsw 
    ON frontier_reviews_processed USING hnsw (gte_embedding vector_cosine_ops);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_processed_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_processed_timestamp
    BEFORE UPDATE ON frontier_reviews_processed
    FOR EACH ROW
    EXECUTE FUNCTION update_processed_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE frontier_reviews_processed IS 'Silver layer: AI-processed reviews with all calculated metadata, extracted attributes, sentiment analysis, and vector embeddings';
COMMENT ON COLUMN frontier_reviews_processed.processing_status IS 'Processing state: pending, claude_processed, vector_processed, completed, errored';
COMMENT ON COLUMN frontier_reviews_processed.ai_attributes IS 'Complete JSON response from Claude LLM extraction following claude_extraction_schema.json';
COMMENT ON COLUMN frontier_reviews_processed.gte_embedding IS 'Vector embedding from GTE-base model (768 dimensions) for semantic search';
COMMENT ON COLUMN frontier_reviews_processed.city IS 'Geographic metadata: extracted from location field';
COMMENT ON COLUMN frontier_reviews_processed.state IS 'Geographic metadata: extracted from location field';
COMMENT ON COLUMN frontier_reviews_processed.region IS 'Geographic metadata: calculated from state';
COMMENT ON COLUMN frontier_reviews_processed.area_type IS 'Geographic metadata: urban, suburban, or rural - calculated from location';
COMMENT ON COLUMN frontier_reviews_processed.year IS 'Temporal metadata: extracted from review_date';
COMMENT ON COLUMN frontier_reviews_processed.month IS 'Temporal metadata: extracted from review_date';
COMMENT ON COLUMN frontier_reviews_processed.quarter IS 'Temporal metadata: calculated from review_date (e.g., "Q3 2024")';
COMMENT ON COLUMN frontier_reviews_processed.days_ago IS 'Temporal metadata: calculated as CURRENT_DATE - review_date';

ALTER TABLE team_pegasus.frontier_reviews_processed 
ALTER COLUMN gte_embedding TYPE vector(1024);
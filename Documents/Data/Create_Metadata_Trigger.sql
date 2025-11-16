-- Trigger to automatically calculate and populate metadata fields on INSERT
-- This trigger fires when a new review is inserted and calculates:
-- - Geographic metadata from location column
-- - Temporal metadata from review_date column

-- Create function to calculate metadata
CREATE OR REPLACE FUNCTION calculate_review_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate geographic metadata from location column
    -- Location format: "City, State" or "Rural Area Name"
    
    -- Extract city (first part before comma)
    NEW.city := CASE 
        WHEN NEW.location LIKE '%,%' THEN TRIM(SPLIT_PART(NEW.location, ',', 1))
        WHEN NEW.location LIKE 'Rural%' THEN NEW.location
        ELSE NULL
    END;
    
    -- Extract state (second part after comma)
    NEW.state := CASE 
        WHEN NEW.location LIKE '%,%' THEN TRIM(SPLIT_PART(NEW.location, ',', 2))
        ELSE NULL
    END;
    
    -- Determine region based on state
    NEW.region := CASE 
        WHEN NEW.state = 'CA' THEN 'West Coast'
        WHEN NEW.state = 'TX' THEN 'South'
        ELSE 'Other'
    END;
    
    -- Determine area type based on location
    NEW.area_type := CASE 
        WHEN NEW.location LIKE 'Rural%' THEN 'rural'
        WHEN NEW.location IN (
            'Los Angeles, CA', 'San Diego, CA', 'San Jose, CA', 'San Francisco, CA',
            'Fresno, CA', 'Sacramento, CA', 'Long Beach, CA', 'Oakland, CA',
            'Houston, TX', 'Dallas, TX', 'San Antonio, TX', 'Austin, TX',
            'Fort Worth, TX', 'El Paso, TX', 'Arlington, TX', 'Corpus Christi, TX'
        ) THEN 'urban'
        ELSE 'suburban'
    END;
    
    -- Calculate temporal metadata from review_date column
    -- date_parsed: Use review_date directly (already in DATE format)
    NEW.date_parsed := NEW.review_date;
    
    -- Extract year
    NEW.year := EXTRACT(YEAR FROM NEW.review_date);
    
    -- Extract month
    NEW.month := EXTRACT(MONTH FROM NEW.review_date);
    
    -- Generate quarter (Q1, Q2, Q3, Q4 + year)
    NEW.quarter := 'Q' || CEILING(EXTRACT(MONTH FROM NEW.review_date)::NUMERIC / 3)::INTEGER || ' ' || EXTRACT(YEAR FROM NEW.review_date)::TEXT;
    
    -- Extract week of year (ISO week)
    NEW.week_of_year := EXTRACT(WEEK FROM NEW.review_date);
    
    -- Calculate days ago from current date
    NEW.days_ago := CURRENT_DATE - NEW.review_date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires BEFORE INSERT
-- This ensures metadata is calculated before the row is inserted
CREATE TRIGGER trigger_calculate_review_metadata
    BEFORE INSERT ON frontier_reviews
    FOR EACH ROW
    EXECUTE FUNCTION calculate_review_metadata();

-- Optional: Also create trigger for UPDATE (in case location or review_date changes)
CREATE TRIGGER trigger_update_review_metadata
    BEFORE UPDATE OF location, review_date ON frontier_reviews
    FOR EACH ROW
    WHEN (OLD.location IS DISTINCT FROM NEW.location OR OLD.review_date IS DISTINCT FROM NEW.review_date)
    EXECUTE FUNCTION calculate_review_metadata();

-- Add comments for documentation
COMMENT ON FUNCTION calculate_review_metadata() IS 'Automatically calculates geographic and temporal metadata from location and review_date columns';
COMMENT ON TRIGGER trigger_calculate_review_metadata ON frontier_reviews IS 'Automatically populates metadata fields when a new review is inserted';
COMMENT ON TRIGGER trigger_update_review_metadata ON frontier_reviews IS 'Automatically updates metadata fields when location or review_date is updated';


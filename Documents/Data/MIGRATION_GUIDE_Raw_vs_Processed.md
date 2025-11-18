# Migration Guide: Raw vs Processed Data Architecture

## Overview

This guide explains the new data architecture where:
- **`frontier_reviews`** = Bronze layer (raw data only, as ingested)
- **`frontier_reviews_processed`** = Silver layer (all calculated/derived fields)

## Architecture Benefits

### ✅ Separation of Concerns
- **Raw data** stays untouched - perfect audit trail
- **Processed data** can be recalculated without affecting source
- Clear distinction between ingestion and processing

### ✅ Data Integrity
- Raw data remains immutable
- Can reprocess reviews if algorithms improve
- No risk of losing original data

### ✅ Performance
- Raw table is lightweight (fewer columns, no indexes on calculated fields)
- Processed table optimized for analytics queries
- Can query either table independently

## Schema Changes

### Old Schema (`frontier_reviews`)
Previously contained:
- Raw fields (review_id, platform, review_text, etc.)
- **Calculated metadata** (city, state, region, area_type, year, month, quarter, etc.)
- **Vector embeddings** (review_text_embedding, title_embedding, etc.)
- **Sentiment scores** (sentiment_score)
- **Processing flags** (is_processed)

### New Schema

#### `frontier_reviews` (Bronze - Raw Only)
Contains ONLY:
- Raw fields from source platforms
- System fields (created_at, updated_at)
- Simple processing flag (is_processed)

#### `frontier_reviews_processed` (Silver - All Processed Data)
Contains:
- Copy of all raw fields (for denormalized access)
- **Geographic metadata** (city, state, region, area_type)
- **Temporal metadata** (year, month, quarter, week_of_year, days_ago)
- **AI extracted attributes** (sentiment, churn, classification, etc.)
- **Vector embeddings** (gte_embedding)
- **Processing status** (pending, claude_processed, vector_processed, completed, errored)

## Migration Steps

### Option 1: Fresh Start (Recommended for New Deployments)

1. **Drop existing table** (if it exists and you don't need the data):
   ```sql
   DROP TABLE IF EXISTS frontier_reviews CASCADE;
   ```

2. **Create new raw table**:
   ```sql
   \i Documents/Data/Create_FRONTIER_REVIEWS_Table_RAW_ONLY.sql
   ```

3. **Create processed table**:
   ```sql
   \i Documents/Data/Create_FRONTIER_REVIEWS_PROCESSED_Table.sql
   ```

4. **Re-import raw data** from JSON files

### Option 2: Migrate Existing Data

If you have existing data in `frontier_reviews`:

1. **Backup existing table**:
   ```sql
   CREATE TABLE frontier_reviews_backup AS SELECT * FROM frontier_reviews;
   ```

2. **Create new raw table**:
   ```sql
   \i Documents/Data/Create_FRONTIER_REVIEWS_Table_RAW_ONLY.sql
   ```

3. **Create processed table**:
   ```sql
   \i Documents/Data/Create_FRONTIER_REVIEWS_PROCESSED_Table.sql
   ```

4. **Migrate raw data** (copy only raw fields):
   ```sql
   INSERT INTO frontier_reviews (
     review_id, platform, review_date, rating, reviewer_name, location,
     review_text, helpful_count, review_url, title, verified_reviewer,
     verified_customer, local_guide, is_processed, language_code
   )
   SELECT 
     review_id, platform, review_date, rating, reviewer_name, location,
     review_text, helpful_count, review_url, title, verified_reviewer,
     verified_customer, local_guide, is_processed, language_code
   FROM frontier_reviews_backup;
   ```

5. **Migrate processed data** (if you have existing processed records):

   **Automatic Migration (Built into AI Processor Workflow)**
   
   Migration is now **automatically handled** by the AI processor workflow (`nimbus_ai_processor.json`). For each record:
   
   - Workflow checks if record exists in `frontier_reviews_processed`
   - If not found, automatically calculates metadata and migrates the record
   - Then continues with normal AI processing (Claude + embeddings)
   
   **No separate migration step needed!** Just run the AI processor workflow and it will:
   - Migrate records automatically as they're processed
   - Calculate metadata programmatically (geographic & temporal)
   - Handle all records in the processing loop
   
   **Alternative: SQL Migration (One-time bulk migration)**
   
   If you want to migrate all existing records at once before running the workflow:
   
   ```sql
   INSERT INTO frontier_reviews_processed (
     review_id, platform, review_date, rating, reviewer_name, location,
     review_text, helpful_count, review_url, title, verified_reviewer,
     verified_customer, local_guide,
     city, state, region, area_type,
     date_parsed, year, month, quarter, week_of_year, days_ago,
     sentiment_score, gte_embedding, embedding_model, embedding_created_at,
     processing_status, created_at, updated_at
   )
   SELECT 
     review_id, platform, review_date, rating, reviewer_name, location,
     review_text, helpful_count, review_url, title, verified_reviewer,
     verified_customer, local_guide,
     city, state, region, area_type,
     date_parsed, year, month, quarter, week_of_year, days_ago,
     sentiment_score, 
     review_text_embedding as gte_embedding,  -- Note: dimension may differ
     embedding_model, embedding_created_at,
     CASE 
       WHEN is_processed = true THEN 'completed'
       ELSE 'pending'
     END as processing_status,
     created_at, updated_at
   FROM frontier_reviews_backup
   WHERE is_processed = true;
   ```
   
   **Note:** SQL migration assumes metadata already exists in source table. If not, the workflow will calculate it automatically during processing.

6. **Drop old table** (after verification):
   ```sql
   DROP TABLE frontier_reviews_backup;
   ```

## Important Notes

### Metadata Calculation
- Metadata is now calculated **programmatically during AI processing** in the n8n workflow (JavaScript)
- Migration is **automatic** - built into the AI processor workflow
- Previously calculated by database trigger on INSERT (no longer used)
- This allows for more flexible processing and reprocessing

### Vector Embeddings
- Old table: `review_text_embedding VECTOR(1536)` (OpenAI ada-002)
- New table: `gte_embedding VECTOR(768)` (GTE-base)
- **Dimension mismatch**: If migrating, you may need to:
  - Re-generate embeddings with GTE model, OR
  - Keep old embeddings in a separate column if needed

### Processing Status
- Old: Simple boolean `is_processed`
- New: Detailed status tracking:
  - `pending` → `claude_processed` → `vector_processed` → `completed`
  - `errored` (with error_message)

## Workflow Updates

The n8n workflow (`nimbus_ai_processor.json`) has been updated to:
1. Calculate metadata during processing (not via trigger)
2. Store all metadata in `frontier_reviews_processed`
3. Only update `is_processed` flag in raw table

## Query Changes

### Old Queries (won't work)
```sql
-- ❌ These fields no longer exist in frontier_reviews
SELECT city, state, year, month 
FROM frontier_reviews 
WHERE area_type = 'urban';
```

### New Queries
```sql
-- ✅ Query processed table for metadata
SELECT city, state, year, month 
FROM frontier_reviews_processed 
WHERE area_type = 'urban';

-- ✅ Query raw table for original data
SELECT review_id, platform, review_text, location
FROM frontier_reviews
WHERE is_processed = false;

-- ✅ Join both tables if needed
SELECT 
  r.review_id,
  r.review_text,
  p.city,
  p.sentiment_score,
  p.churn_risk
FROM frontier_reviews r
LEFT JOIN frontier_reviews_processed p ON r.review_id = p.review_id;
```

## Verification

After migration, verify:

1. **Raw table has only raw data**:
   ```sql
   SELECT COUNT(*) FROM frontier_reviews;
   -- Should match your source data count
   ```

2. **Processed table has calculated fields**:
   ```sql
   SELECT 
     COUNT(*) as total,
     COUNT(city) as with_city,
     COUNT(sentiment_score) as with_sentiment,
     COUNT(gte_embedding) as with_embeddings
   FROM frontier_reviews_processed;
   ```

3. **Data integrity**:
   ```sql
   -- All processed reviews should have corresponding raw record
   SELECT COUNT(*) 
   FROM frontier_reviews_processed p
   LEFT JOIN frontier_reviews r ON p.review_id = r.review_id
   WHERE r.review_id IS NULL;
   -- Should return 0
   ```

## Rollback Plan

If you need to rollback:

1. Restore from backup table
2. Re-enable metadata trigger (if using old approach)
3. Update queries to use old schema

## Questions?

Refer to:
- `Create_FRONTIER_REVIEWS_Table_RAW_ONLY.sql` - Raw table schema
- `Create_FRONTIER_REVIEWS_PROCESSED_Table.sql` - Processed table schema
- `nimbus_ai_processor.json` - Updated workflow


# Quick Start: Database Setup Guide

## Problem
```
relation "frontier_reviews_processed" does not exist
```

## Solution: Create the Tables

### Option 1: Quick Setup (All-in-One Script)

Run the complete setup script:

```bash
psql -U your_username -d your_database -f Documents/Data/00_SETUP_COMPLETE_DATABASE.sql
```

**Or in psql:**
```sql
\i Documents/Data/00_SETUP_COMPLETE_DATABASE.sql
```

This creates:
1. ✅ `frontier_reviews` (raw data table)
2. ✅ `frontier_reviews_processed` (processed data table)
3. ✅ All indexes and triggers
4. ✅ Enables pgvector extension

---

### Option 2: Step-by-Step Setup

If you prefer to run each script separately:

#### Step 1: Enable Vector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Step 2: Create Raw Table
```bash
psql -U your_username -d your_database -f Documents/Data/Create_FRONTIER_REVIEWS_Table_RAW_ONLY.sql
```

#### Step 3: Create Processed Table
```bash
psql -U your_username -d your_database -f Documents/Data/Create_FRONTIER_REVIEWS_PROCESSED_Table.sql
```

---

## Verify Tables Were Created

```sql
-- Check if tables exist
\dt frontier_reviews*

-- Check table structures
\d frontier_reviews
\d frontier_reviews_processed

-- Verify row counts (should be 0 initially)
SELECT 
    'frontier_reviews' as table_name,
    COUNT(*) as row_count
FROM frontier_reviews
UNION ALL
SELECT 
    'frontier_reviews_processed' as table_name,
    COUNT(*) as row_count
FROM frontier_reviews_processed;
```

Expected output:
```
       table_name           | row_count 
---------------------------+-----------
 frontier_reviews          |         0
 frontier_reviews_processed|         0
```

---

## Import Sample Data

### Import from CSV

If you have the CSV file:

```sql
COPY frontier_reviews (
    review_id, platform, review_date, rating, reviewer_name, location,
    review_text, helpful_count, review_url, title, verified_reviewer,
    verified_customer, local_guide, language_code
)
FROM 'C:/HACKATHON/Pegasus-hack-ai-thon/Documents/Data/FRONTIER_REVIEWS_OPTIMIZED.csv'
WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');
```

**Note:** Adjust the file path to match your system.

### Import from JSON

If you have JSON files:

```bash
# Using a Python script or n8n workflow to import JSON data
# The JSON files are in Documents/Data/:
# - frontier_reviews_5000_platform_authentic.json
# - frontier_reviews_5000_problem_focused.json
```

---

## Connection Details

Your n8n workflow is already configured to use:

```
Credential ID: HXJ5ic1ZBgUDE8cv
Credential Name: Postgres account 2
```

Make sure this credential in n8n has:
- ✅ Correct hostname
- ✅ Correct database name
- ✅ Correct username/password
- ✅ Correct port (usually 5432)

---

## Test the Setup

### Test 1: Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'frontier_reviews%';
```

Expected output:
```
       table_name           
---------------------------
 frontier_reviews
 frontier_reviews_processed
```

### Test 2: Insert Test Record

```sql
-- Insert test record into raw table
INSERT INTO frontier_reviews (
    review_id, platform, review_date, rating, reviewer_name, 
    location, review_text, review_url, title
) VALUES (
    99999,
    'Test Platform',
    '2025-01-01',
    3,
    'Test User',
    'Test City, TX',
    'This is a test review',
    'https://example.com/test',
    'Test Review'
);

-- Verify it was inserted
SELECT * FROM frontier_reviews WHERE review_id = 99999;

-- Clean up test record
DELETE FROM frontier_reviews WHERE review_id = 99999;
```

### Test 3: Test n8n Query

The query that was failing should now work:

```sql
SELECT review_id, processing_status
FROM frontier_reviews_processed
WHERE review_id = 1
LIMIT 1;
```

This will return empty results initially (no error), since no records have been processed yet.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Flow                                │
└─────────────────────────────────────────────────────────────┘

1. Raw Data Import
   ↓
   frontier_reviews (Bronze Layer)
   - Raw review data as ingested
   - No processing, no calculated fields
   - is_processed = false
   
2. n8n Workflow Processes Review
   ↓
   Claude AI Extraction
   - Extracts sentiment, churn risk, etc.
   - Creates structured JSON
   
3. Calculate Metadata
   ↓
   - Geographic: city, state, region, area_type
   - Temporal: year, month, quarter, days_ago
   
4. Generate Embeddings
   ↓
   GTE Model
   - Creates 768-dim vector embedding
   
5. Save to Processed Table
   ↓
   frontier_reviews_processed (Silver Layer)
   - All raw fields (denormalized)
   - All calculated metadata
   - AI extracted attributes
   - Vector embeddings
   - processing_status = 'completed'
   
6. Update Raw Table
   ↓
   frontier_reviews.is_processed = true
```

---

## Troubleshooting

### Error: "extension vector does not exist"

**Solution:**
```sql
CREATE EXTENSION vector;
```

If you don't have permissions:
```sql
-- As superuser (postgres)
psql -U postgres -d your_database -c "CREATE EXTENSION vector;"
```

### Error: "relation already exists"

**Solution:**
If you need to recreate tables:

```sql
-- Drop in correct order (processed first due to foreign key)
DROP TABLE IF EXISTS frontier_reviews_processed CASCADE;
DROP TABLE IF EXISTS frontier_reviews CASCADE;

-- Then run the setup script again
\i Documents/Data/00_SETUP_COMPLETE_DATABASE.sql
```

### Error: "permission denied"

**Solution:**
Ensure your database user has:
- CREATE permission on the database
- CREATE permission on schemas
- USAGE permission on schemas

```sql
-- As superuser
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_username;
GRANT CREATE ON SCHEMA public TO your_username;
```

### Foreign Key Constraint Error

**Cause:** Trying to insert into `frontier_reviews_processed` with a `review_id` that doesn't exist in `frontier_reviews`.

**Solution:**
Always insert into `frontier_reviews` first, then into `frontier_reviews_processed`.

---

## Next Steps

1. ✅ Tables created
2. ⏭️ Import your review data into `frontier_reviews`
3. ⏭️ Configure Claude API credentials in n8n
4. ⏭️ Run the `nimbus_ai_processor.json` workflow
5. ⏭️ Watch as reviews get processed and appear in `frontier_reviews_processed`

---

## Quick Reference Commands

```bash
# Connect to database
psql -U your_username -d your_database

# List all tables
\dt

# Describe table structure
\d frontier_reviews
\d frontier_reviews_processed

# Count records
SELECT COUNT(*) FROM frontier_reviews;
SELECT COUNT(*) FROM frontier_reviews_processed;

# Check processing status
SELECT 
    processing_status,
    COUNT(*) as count
FROM frontier_reviews_processed
GROUP BY processing_status;

# Exit psql
\q
```

---

## Support

If you encounter issues:
1. Check PostgreSQL logs
2. Verify pgvector extension is installed
3. Ensure database user has proper permissions
4. Check n8n credential configuration

Good luck! 🚀



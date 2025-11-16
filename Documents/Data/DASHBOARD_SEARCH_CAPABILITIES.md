# Dashboard Search Capabilities: What You Can Search For

After LLM analysis and vector embeddings, you can search and filter reviews in multiple ways:

---

## 🔍 1. STRUCTURED FILTERS (Exact Match)

### Geographic Filters
```sql
-- Filter by state
WHERE state = 'CA'

-- Filter by city
WHERE city = 'Los Angeles'

-- Filter by region
WHERE region = 'West Coast'

-- Filter by area type
WHERE area_type = 'urban'  -- or 'suburban', 'rural'
```

**Dashboard UI:** Dropdown filters, checkboxes

---

### Temporal Filters
```sql
-- Filter by date range
WHERE review_date BETWEEN '2024-01-01' AND '2024-12-31'

-- Filter by year
WHERE year = 2024

-- Filter by month
WHERE month = 6  -- June

-- Filter by quarter
WHERE quarter = 'Q3 2024'

-- Filter by recent reviews
WHERE days_ago <= 30  -- Last 30 days
```

**Dashboard UI:** Date picker, time range slider, quarter selector

---

### Platform & Rating Filters
```sql
-- Filter by platform
WHERE platform = 'Google Reviews'

-- Filter by rating
WHERE rating = 1  -- or 2, 3, 4, 5

-- Filter by rating range
WHERE rating <= 2  -- Negative reviews only
```

**Dashboard UI:** Platform selector, rating slider

---

### Verification Filters
```sql
-- Filter verified reviews only
WHERE verified_customer = true
WHERE verified_reviewer = true
WHERE local_guide = true
```

**Dashboard UI:** Checkbox toggles

---

## 🎯 2. LLM-EXTRACTED ATTRIBUTE FILTERS

After LLM extraction, you can filter by extracted attributes stored in the database:

### Problem Category Filters
```sql
-- Filter by primary problem
WHERE primary_category = 'Billing & Hidden Fees'
WHERE primary_category = 'Network Performance'
WHERE primary_category = 'Customer Service'
WHERE primary_category = 'Installation & Setup'
WHERE primary_category = 'Equipment & Hardware'
WHERE primary_category = 'Cancellation & Contracts'
```

**Dashboard UI:** Problem category selector, multi-select

---

### Sentiment Filters
```sql
-- Filter by sentiment score
WHERE sentiment_score < -0.7  -- Very negative
WHERE sentiment_score BETWEEN -0.3 AND 0.3  -- Neutral
WHERE sentiment_score > 0.7  -- Very positive

-- Filter by sentiment intensity
WHERE sentiment_intensity = 'extreme'
WHERE sentiment_intensity IN ('strong', 'extreme')  -- High intensity

-- Filter by overall sentiment
WHERE overall_sentiment = 'very_negative'
```

**Dashboard UI:** Sentiment slider, sentiment selector

---

### Churn Risk Filters
```sql
-- Filter by churn risk
WHERE churn_risk = 'high'
WHERE churn_risk = 'critical'
WHERE churn_probability_score > 0.7

-- Filter by switching intent
WHERE switching_intent = true
WHERE competitors_mentioned IS NOT NULL
```

**Dashboard UI:** Churn risk indicator, high-risk filter toggle

---

### Customer Profile Filters
```sql
-- Filter by customer tenure
WHERE customer_tenure_months >= 12  -- Long-term customers
WHERE tenure_category = 'new_customer'

-- Filter by use case
WHERE use_cases @> ARRAY['work_from_home']
WHERE criticality_level = 'mission_critical'

-- Filter by customer type
WHERE reviewer_type = 'residential'
WHERE reviewer_type = 'business'
```

**Dashboard UI:** Tenure slider, use case checkboxes, customer type selector

---

### Resolution Status Filters
```sql
-- Filter by resolution status
WHERE resolution_status = 'unresolved'
WHERE resolution_status = 'resolved'

-- Filter by problem severity
WHERE severity = 'critical'
WHERE severity IN ('high', 'critical')
```

**Dashboard UI:** Resolution status filter, severity indicator

---

### Metrics Filters
```sql
-- Filter by speed discrepancy
WHERE speed_percentage < 10  -- Getting less than 10% of advertised speed

-- Filter by price increase
WHERE price_increase_percent > 100  -- Price doubled or more

-- Filter by wait time
WHERE average_wait_time_minutes > 60  -- Waited over an hour

-- Filter by support contacts
WHERE contact_attempts > 5  -- Called more than 5 times
```

**Dashboard UI:** Metric sliders, threshold filters

---

## 🔎 3. SEMANTIC SEARCH (Vector Embeddings)

### Natural Language Queries
```sql
-- Find reviews similar to a query
SELECT * FROM frontier_reviews
WHERE review_text_embedding <-> (
    SELECT embedding FROM query_embeddings WHERE query = 'billing problems with hidden fees'
) < 0.3  -- Cosine distance threshold

-- Find reviews about specific problems
-- Query: "customers complaining about slow internet speeds"
-- Query: "installation issues with technicians not showing up"
-- Query: "billing errors and overcharges"
```

**Dashboard UI:** Search bar with natural language input

---

### Similarity Search
```sql
-- Find reviews similar to a specific review
SELECT * FROM frontier_reviews
WHERE review_text_embedding <-> (
    SELECT review_text_embedding FROM frontier_reviews WHERE review_id = 123
) < 0.25
ORDER BY review_text_embedding <-> (SELECT review_text_embedding FROM frontier_reviews WHERE review_id = 123)
LIMIT 10
```

**Dashboard UI:** "Find similar reviews" button on each review

---

### Topic Clustering
```sql
-- Find all reviews about a specific topic
-- Using semantic similarity to group related reviews
SELECT * FROM frontier_reviews
WHERE review_text_embedding <-> (
    -- Embedding for "billing and pricing issues"
) < 0.3
```

**Dashboard UI:** Topic clusters, related reviews section

---

## 🔍 4. TEXT SEARCH (Full-Text Search)

### PostgreSQL Full-Text Search
```sql
-- Search for specific keywords
SELECT * FROM frontier_reviews
WHERE to_tsvector('english', review_text) @@ to_tsquery('english', 'billing & fees')

-- Search for phrases
WHERE to_tsvector('english', review_text) @@ phraseto_tsquery('english', 'hidden fees')

-- Search in title
WHERE to_tsvector('english', COALESCE(title, '')) @@ to_tsquery('english', 'billing')
```

**Dashboard UI:** Keyword search box

---

### Pattern Matching
```sql
-- Search for specific patterns
WHERE review_text ILIKE '%$%'  -- Contains dollar signs (pricing mentions)
WHERE review_text ILIKE '%Mbps%'  -- Contains speed mentions
WHERE review_text ILIKE '%called%'  -- Mentions of calling support
```

**Dashboard UI:** Advanced search with pattern matching

---

## 🎯 5. COMBINED SEARCHES (Multi-Filter)

### Example: High Churn Risk Billing Issues in California
```sql
SELECT * FROM frontier_reviews
WHERE state = 'CA'
  AND primary_category = 'Billing & Hidden Fees'
  AND churn_risk = 'high'
  AND sentiment_score < -0.7
  AND year = 2024
ORDER BY churn_probability_score DESC
```

**Dashboard UI:** Multiple filter panels, filter chips

---

### Example: Unresolved Network Issues for Work-From-Home Customers
```sql
SELECT * FROM frontier_reviews
WHERE primary_category = 'Network Performance'
  AND resolution_status = 'unresolved'
  AND use_cases @> ARRAY['work_from_home']
  AND criticality_level = 'mission_critical'
  AND speed_percentage < 20
```

**Dashboard UI:** Smart filters, saved filter presets

---

## 📊 6. AGGREGATION QUERIES (Dashboard Metrics)

### Count by Problem Type
```sql
SELECT primary_category, COUNT(*) as count
FROM frontier_reviews
WHERE sentiment_score < -0.5
GROUP BY primary_category
ORDER BY count DESC
```

### Average Metrics by Location
```sql
SELECT state, 
       AVG(sentiment_score) as avg_sentiment,
       AVG(churn_probability_score) as avg_churn_risk,
       COUNT(*) as review_count
FROM frontier_reviews
GROUP BY state
ORDER BY avg_churn_risk DESC
```

### Trend Analysis
```sql
SELECT quarter, 
       COUNT(*) as review_count,
       AVG(sentiment_score) as avg_sentiment,
       COUNT(*) FILTER (WHERE churn_risk = 'high') as high_churn_count
FROM frontier_reviews
GROUP BY quarter
ORDER BY quarter
```

---

## 🎨 DASHBOARD SEARCH UI COMPONENTS

### 1. **Search Bar** (Semantic + Text Search)
- Natural language input: "Show me billing complaints from California"
- Converts to vector search + filters

### 2. **Filter Panels**
- **Geographic:** State, City, Region, Area Type
- **Temporal:** Date Range, Year, Month, Quarter
- **Problem:** Category, Severity, Resolution Status
- **Sentiment:** Score Range, Intensity, Overall Sentiment
- **Churn:** Risk Level, Probability Score, Switching Intent
- **Customer:** Tenure, Use Case, Type, Criticality
- **Platform:** Platform, Rating, Verification Status

### 3. **Quick Filters** (Pre-defined)
- "High Churn Risk" → `churn_risk IN ('high', 'critical')`
- "Unresolved Issues" → `resolution_status = 'unresolved'`
- "Recent Negative" → `days_ago <= 30 AND sentiment_score < -0.5`
- "Billing Problems" → `primary_category = 'Billing & Hidden Fees'`

### 4. **Saved Searches**
- Save frequently used filter combinations
- Share search queries with team

### 5. **Search Suggestions**
- Auto-complete based on extracted attributes
- Suggest related searches

---

## 💡 EXAMPLE DASHBOARD QUERIES

### For Management Dashboard:

1. **Revenue at Risk**
   ```sql
   SELECT COUNT(*) as high_churn_count,
          AVG(price_discrepancy) as avg_discrepancy
   FROM frontier_reviews
   WHERE churn_risk IN ('high', 'critical')
     AND primary_category = 'Billing & Hidden Fees'
   ```

2. **Problem Priority Matrix**
   ```sql
   SELECT primary_category,
          COUNT(*) as frequency,
          AVG(rating) as avg_severity,
          AVG(churn_probability_score) as business_impact
   FROM frontier_reviews
   GROUP BY primary_category
   ```

3. **Geographic Hotspots**
   ```sql
   SELECT state, city,
          COUNT(*) as problem_count,
          AVG(sentiment_score) as avg_sentiment
   FROM frontier_reviews
   WHERE sentiment_score < -0.5
   GROUP BY state, city
   ORDER BY problem_count DESC
   ```

4. **Customer Journey Pain Points**
   ```sql
   SELECT 
     CASE 
       WHEN customer_tenure_months <= 3 THEN 'Installation'
       WHEN customer_tenure_months <= 12 THEN 'Service Delivery'
       WHEN customer_tenure_months > 12 THEN 'Billing'
     END as journey_stage,
     COUNT(*) as problem_count
   FROM frontier_reviews
   GROUP BY journey_stage
   ```

5. **Resolution Failure Rate**
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE resolution_status = 'unresolved') * 100.0 / COUNT(*) as unresolved_percentage,
     AVG(contact_attempts) as avg_contacts,
     AVG(average_wait_time_minutes) as avg_wait_time
   FROM frontier_reviews
   WHERE primary_category = 'Customer Service'
   ```

---

## 🚀 IMPLEMENTATION TIPS

### 1. **Index Strategy**
- Index all filterable columns (state, city, year, month, etc.)
- Use GIN indexes for full-text search
- Use HNSW indexes for vector similarity search

### 2. **Query Performance**
- Combine vector search with structured filters for faster results
- Use materialized views for common aggregations
- Cache frequently accessed queries

### 3. **Search UX**
- Show filter counts (e.g., "California (1,234 reviews)")
- Enable multi-select filters
- Show active filters as removable chips
- Provide "Clear all filters" option

### 4. **Results Display**
- Sort by relevance (semantic similarity)
- Sort by date (newest first)
- Sort by sentiment (most negative first)
- Sort by churn risk (highest first)

---

## 📋 SUMMARY: What You Can Search For

✅ **Structured Data:** State, City, Date, Platform, Rating  
✅ **LLM-Extracted:** Problem Category, Sentiment, Churn Risk, Customer Profile  
✅ **Semantic:** Natural language queries, similar reviews, topic clusters  
✅ **Text:** Keywords, phrases, patterns  
✅ **Metrics:** Speed, Price, Wait Times, Contact Counts  
✅ **Combined:** Multiple filters together for precise results  

All of this enables powerful dashboard filtering and search capabilities!


# Databricks GTE Embeddings Setup Guide

## Overview

This guide shows you how to generate vector embeddings using Databricks GTE-large-en model for your review text.

**Endpoint:** `https://dbc-4a93b454-f17b.cloud.databricks.com/serving-endpoints/databricks-gte-large-en/invocations`

**Model:** GTE-large-en (1024 dimensions)

---

## Step 1: Get Databricks Access Token

### Option A: From Databricks UI
1. Go to https://dbc-4a93b454-f17b.cloud.databricks.com
2. Click **User Settings** (top right)
3. Go to **Access Tokens** tab
4. Click **Generate New Token**
5. Give it a name: "n8n-embeddings"
6. Set expiration (90 days recommended)
7. Click **Generate**
8. **Copy the token** (you won't see it again!)

### Option B: From Databricks CLI
```bash
databricks tokens create --comment "n8n-embeddings" --lifetime-seconds 7776000
```

---

## Step 2: Add Credentials in n8n

1. Open n8n
2. Go to **Credentials** (left sidebar)
3. Click **Add Credential**
4. Search for **"Header Auth"**
5. Configure:
   - **Credential Name**: `Databricks GTE Embeddings`
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_DATABRICKS_TOKEN`
   
   ⚠️ **Important:** Include the word `Bearer ` before your token!
   
   Example: `Bearer dapi1234567890abcdef...`

6. Click **Save**

---

## Step 3: Add HTTP Request Node to Workflow

### Workflow Position:

```
Claude AI Extraction
    ↓
Function → Parse Claude Response
    ↓
HTTP Request → Databricks GTE Embeddings  ← ADD THIS!
    ↓
Function → Parse Embedding Response
    ↓
Postgres → Insert/Update
```

### Node Configuration:

1. **Add** HTTP Request node after your Claude parser
2. **Name**: `HTTP → Databricks GTE Embeddings`
3. Configure as follows:

---

## Step 4: HTTP Request Node Settings

### Basic Settings:

**Method:** `POST`

**URL:** 
```
https://dbc-4a93b454-f17b.cloud.databricks.com/serving-endpoints/databricks-gte-large-en/invocations
```

**Authentication:** 
- Select: `Generic Credential Type`
- Choose: `Header Auth`
- Select: `Databricks GTE Embeddings` (the credential you created)

### Headers:

Click **Add Header** and add:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |

### Body:

**Body Type:** JSON

**JSON Body:**
```javascript
={
  "input": "{{ $json.review_text }}"
}
```

### Options:

- **Timeout:** `30000` (30 seconds)

---

## Step 5: Add Parser Function Node

Add a **Function node** after the HTTP Request to parse the embedding response.

**Node Name:** `Function → Parse GTE Embedding`

**Code:**

```javascript
// Parse Databricks GTE embedding response
const embeddingResponse = $json;
const reviewData = $input.first().json;

console.log('Embedding response:', embeddingResponse);

let embedding = null;
let embeddingString = null;

try {
  // Databricks returns: { "predictions": [[0.1, 0.2, ...]] }
  if (embeddingResponse.predictions && Array.isArray(embeddingResponse.predictions)) {
    embedding = embeddingResponse.predictions[0];
  } else if (Array.isArray(embeddingResponse)) {
    embedding = embeddingResponse[0];
  } else {
    throw new Error('Unexpected embedding format');
  }
  
  // Validate embedding
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Embedding is not a valid array');
  }
  
  // Convert to PostgreSQL vector format: '[0.1,0.2,0.3,...]'
  embeddingString = '[' + embedding.join(',') + ']';
  
  console.log('✓ Embedding dimension:', embedding.length);
  console.log('✓ First 5 values:', embedding.slice(0, 5));
  
} catch (error) {
  console.error('Failed to parse embedding:', error.message);
  throw new Error('Embedding parse error: ' + error.message);
}

// Return data with embedding
return [{
  json: {
    ...reviewData,
    gte_embedding: embeddingString,
    embedding_array: embedding,
    embedding_dimension: embedding.length,
    embedding_model: 'databricks-gte-large-en',
    embedding_created_at: new Date().toISOString()
  }
}];
```

---

## Step 6: Update PostgreSQL Insert

Your Postgres INSERT should now include the embedding:

```sql
INSERT INTO frontier_reviews_processed (
  review_id, 
  -- ... other fields ...
  gte_embedding,
  embedding_model,
  embedding_created_at,
  processing_status
)
VALUES (
  $1,
  -- ... other values ...
  $25::vector,  -- The embedding string
  $26,          -- 'databricks-gte-large-en'
  $27,          -- timestamp
  $28           -- 'completed'
);
```

Add these to your query parameters:
```javascript
{ "name": "25", "value": "={{ $json.gte_embedding }}" }
{ "name": "26", "value": "databricks-gte-large-en" }
{ "name": "27", "value": "={{ $json.embedding_created_at }}" }
{ "name": "28", "value": "completed" }
```

---

## Step 7: Test the Setup

### Test with Sample Data:

1. Set `max_records = 1`
2. Run the workflow
3. Check the GTE node output:

**Expected Response:**
```json
{
  "predictions": [
    [0.012, -0.043, 0.087, ..., 0.021]
  ]
}
```

**Expected Dimension:** 1024 (GTE-large-en)

---

## Complete Workflow Structure

```
┌─────────────────────────────────────┐
│ Postgres → Get Unprocessed Reviews  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Split In Batches (1 at a time)      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ HTTP → Claude AI Extraction         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Function → Parse Claude Response    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ HTTP → Databricks GTE Embeddings    │  ← NEW!
│ Input: review_text                   │
│ Output: embedding vector [1024]     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Function → Parse GTE Embedding      │  ← NEW!
│ Converts to PostgreSQL vector format│
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Postgres → Insert/Update            │
│ Saves: review + AI data + embedding │
└─────────────────────────────────────┘
```

---

## Databricks API Details

### Request Format:
```json
{
  "input": "Text to embed"
}
```

### Response Format:
```json
{
  "predictions": [
    [0.012, -0.043, 0.087, ...]
  ]
}
```

### Model Info:
- **Model:** GTE-large-en
- **Dimensions:** 1024
- **Max Input:** 512 tokens
- **Use Case:** Semantic search, similarity matching

---

## Troubleshooting

### Error: "401 Unauthorized"
**Cause:** Invalid or missing token

**Fix:** 
1. Check your Databricks token is correct
2. Ensure `Bearer ` prefix in credential
3. Verify token hasn't expired

### Error: "Timeout"
**Cause:** Request taking too long

**Fix:**
1. Increase timeout to 60000ms
2. Check if Databricks endpoint is running
3. Verify network connectivity

### Error: "predictions is undefined"
**Cause:** Unexpected response format

**Fix:** Check the actual response format:
```javascript
console.log('Raw response:', JSON.stringify($json, null, 2));
```

### Error: "Text too long"
**Cause:** Review text exceeds 512 tokens

**Fix:** Truncate text before embedding:
```javascript
={
  "input": "{{ $json.review_text.substring(0, 2000) }}"
}
```

---

## Note: Single Text Only

Databricks GTE endpoint processes one text at a time:

```javascript
// Correct format (single text):
={
  "input": "{{ $json.review_text }}"
}
```

For batch processing, you would need to call the API multiple times or use a different endpoint if available.

---

## Cost Estimation

Databricks charges based on:
- **Compute time:** Per second of processing
- **API calls:** Per request

**Typical cost per review:**
- ~0.5-1 second compute time
- ~$0.001-0.002 per embedding

**For 5000 reviews:** ~$5-10

---

## Verification

After running, verify embeddings in database:

```sql
SELECT 
  review_id,
  embedding_model,
  array_length(gte_embedding::float[], 1) as dimension,
  embedding_created_at
FROM frontier_reviews_processed
WHERE gte_embedding IS NOT NULL
LIMIT 5;
```

**Expected output:**
```
review_id | embedding_model              | dimension | embedding_created_at
----------|------------------------------|-----------|---------------------
1         | databricks-gte-large-en      | 1024      | 2025-11-18 00:00:00
2         | databricks-gte-large-en      | 1024      | 2025-11-18 00:00:01
```

---

## Next Steps

1. ✅ Set up credential
2. ✅ Add HTTP Request node
3. ✅ Add parser function
4. ✅ Update Postgres insert
5. ✅ Test with 1 record
6. ✅ Run full processing!

Your reviews will now have vector embeddings for semantic search! 🚀


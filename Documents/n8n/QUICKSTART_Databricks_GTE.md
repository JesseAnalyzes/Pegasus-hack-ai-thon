# Quick Start: Databricks GTE Embeddings

## 3-Step Setup

### Step 1: Create Credential (2 minutes)

1. Open n8n → **Credentials** → **Add Credential**
2. Select **Header Auth**
3. Configure:
   ```
   Credential Name: Databricks GTE Embeddings
   Name: Authorization
   Value: Bearer YOUR_DATABRICKS_TOKEN
   ```
4. Click **Save**

**Get your token:**
- Go to https://dbc-4a93b454-f17b.cloud.databricks.com
- User Settings → Access Tokens → Generate New Token

---

### Step 2: Add HTTP Request Node (3 minutes)

1. **Add node** after "Function → Parse Claude Response"
2. **Name**: `HTTP → Databricks GTE Embeddings`
3. **Method**: POST
4. **URL**: 
   ```
   https://dbc-4a93b454-f17b.cloud.databricks.com/serving-endpoints/databricks-gte-large-en/invocations
   ```
5. **Authentication**: Generic Credential Type → Header Auth
6. **Select credential**: Databricks GTE Embeddings
7. **Add Header**: 
   - Name: `Content-Type`
   - Value: `application/json`
8. **Body**: JSON
9. **JSON Body**:
   ```javascript
   ={
     "input": "{{ $json.review_text }}"
   }
   ```
10. **Save**

---

### Step 3: Add Parser Function (2 minutes)

1. **Add Function node** after the HTTP Request
2. **Name**: `Function → Parse GTE Embedding`
3. **Paste code** from `databricks_gte_parser.js`
4. **Save**

---

## Test It!

1. Set `max_records = 1`
2. Run workflow
3. Check output - should see:
   ```json
   {
     "gte_embedding": "[0.012,-0.043,0.087,...]",
     "embedding_dimension": 1024,
     "embedding_model": "databricks-gte-large-en"
   }
   ```

---

## Update Postgres Insert

Add to your INSERT VALUES:
```
$N::vector,        -- gte_embedding
$N+1,              -- embedding_model
$N+2               -- embedding_created_at
```

Add to query parameters:
```javascript
{ "name": "N", "value": "={{ $json.gte_embedding }}" }
{ "name": "N+1", "value": "databricks-gte-large-en" }
{ "name": "N+2", "value": "={{ $json.embedding_created_at }}" }
```

---

## That's It!

Your reviews now have 1024-dimensional vector embeddings! 🚀

**Files:**
- `databricks_gte_embeddings_setup.md` - Complete guide
- `databricks_gte_http_node.json` - HTTP node config
- `databricks_gte_parser.js` - Parser function
- `QUICKSTART_Databricks_GTE.md` - This file

**Total time:** ~7 minutes ⏱️



# How to set up the n8n ingestion workflow

## 0) TL;DR topology

- **One “Orchestrator” workflow**, triggered on a **Cron** (e.g., every 15 minutes).
- For each source (Reddit, Facebook, X, Yelp, etc.), **one “Worker” sub-workflow** that:
  1. pulls only new items since last run,
  2. normalizes them to a common schema,
  3. **UPSERTs** to Postgres (Bronze),
  4. optionally pings your **Next.js /api/analyze** route for downstream LLM work (or you can queue that separately).

The orchestrator calls workers via **Execute Workflow** nodes. This isolates failures and rate limits so Reddit going down doesn’t block Yelp, etc.

---

## 1) Orchestrator workflow (runs on a schedule)

**Nodes (in order):**
1. **Cron** — runs every 15 minutes.
2. **Set → Context** — optional run ID, timestamp, flags (e.g., “backfill: false”).
3. **Execute Workflow (Reddit Worker)**
4. **Execute Workflow (Facebook Worker)**
5. **Execute Workflow (Yelp Worker)**
6. **Execute Workflow (X/Twitter Worker)** — run parallel or series.
7. **Merge (By pass-through)** — aggregate summary counts.
8. **HTTP Request → Slack/Email** — optional summary report.

**Why this structure?**
- Each source independent (credentials, pagination, retries).
- Can enable/disable sources easily.
- Can run a worker manually for backfills.

---

## 2) Worker workflow (per source)

Using **Reddit** as an example.

### Nodes (in order)
1. **Workflow Trigger → Execute Workflow** (from the Orchestrator)
2. **Postgres (Get Cursor)**

```sql
SELECT last_seen_created_utc FROM ingestion_offsets WHERE source = 'reddit' LIMIT 1;
```

3. **HTTP Request (Fetch Page 1)** — Reddit API, OAuth2 credential, limit=100.
4. **IF (Any results?)** — If none, exit.
5. **Split In Batches** — Paginate results (50–100 per batch).
6. **Function (Normalize → Common Schema)** — transform payload:

```js
return items.map(item => {
  const post = item.json;
  return {
    json: {
      source: 'reddit',
      source_id: post.id,
      author: post.author,
      title: post.title ?? null,
      body: post.selftext ?? post.text ?? null,
      url: `https://reddit.com${post.permalink}`,
      created_at: new Date(post.created_utc * 1000).toISOString(),
      collected_at: new Date().toISOString(),
      raw: post
    }
  };
});
```

7. **Postgres (UPSERT Bronze)**

```sql
INSERT INTO bronze_posts (source, source_id, author, title, body, url, created_at, collected_at, raw)
VALUES (:source, :source_id, :author, :title, :body, :url, :created_at, :collected_at, :raw::jsonb)
ON CONFLICT (source, source_id) DO NOTHING;
```

8. **IF (New rows inserted?)**
   - If yes → **HTTP Request → Next.js /api/analyze**
   - Example body:

```json
{
  "source": "reddit",
  "source_id": "abc123",
  "bronze_id": 987,
  "text": "full text to analyze",
  "metadata": { "url": "...", "author": "..." }
}
```

9. **Function (Update Cursor)** — compute latest `last_seen_created_utc`.
10. **Postgres (Save Cursor)**

```sql
INSERT INTO ingestion_offsets (source, last_seen_created_utc, updated_at)
VALUES ('reddit', :ts, NOW())
ON CONFLICT (source)
DO UPDATE SET last_seen_created_utc = EXCLUDED.last_seen_created_utc, updated_at = NOW();
```

---

## 3) Credentials & configuration

- Use **n8n Credentials** (OAuth2/API key/Bearer).
- Don’t hardcode secrets in nodes.
- Use **Function** nodes for lightweight JS transforms only.
- Use **HTTP Request** for custom integrations.

---

## 4) Pagination, rate limits, and offsets

- Use `ingestion_offsets` or Data Stores to persist cursors.
- **Split In Batches** for pagination.
- Add **Wait** nodes or built-in retry logic for rate limits.

---

## 5) Post-ingestion analysis call

**Option A:** Immediate — POST to `/api/analyze` after Bronze UPSERT.  
**Option B:** Deferred — separate “Analyzer Orchestrator” workflow.

---

## 6) Error handling & observability

- Use an **Error Trigger workflow** to alert via Slack/Email.
- Configure per-node retries and backoff.
- Return counts (fetched, inserted, failed) for Orchestrator metrics.

---

## 7) Bronze table schema

```sql
CREATE TABLE IF NOT EXISTS bronze_posts (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  author TEXT,
  title TEXT,
  body TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_bronze_source_sourceid
  ON bronze_posts(source, source_id);
```

### Offsets
```sql
CREATE TABLE IF NOT EXISTS ingestion_offsets (
  source TEXT PRIMARY KEY,
  last_seen_created_utc TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 8) Example Reddit Worker wiring

- Execute Workflow (triggered)
- Postgres (Get Cursor)
- HTTP Request (Fetch Page)
- IF (any results?)
- Split In Batches
- Function (Normalize)
- Postgres (UPSERT)
- HTTP Request (Analyze)
- Function (Compute Cursor)
- Postgres (Save Cursor)

---

## 9) Security & scaling tips

- Restrict credential access in n8n.
- Use **Queue Mode (Redis)** for scaling.
- Keep only URIs for large media.
- Separate workflows per source.

---

## 10) Backfill workflow pattern

- Webhook-triggered version of each Worker that accepts params (`start`, `end`, etc.).

---

## 11) For non-native nodes

Use **HTTP Request** with proper credentials:
- **Yelp Fusion:** Bearer token.
- **Facebook Graph:** OAuth2.
- **X/Twitter:** Bearer token.

Normalize payloads via **Function** nodes.

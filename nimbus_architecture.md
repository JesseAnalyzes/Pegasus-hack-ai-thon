# Percepta – End-to-End Architecture Overview

## 1. High-Level Overview

Our solution is an **AI-powered customer sentiment and churn-risk monitoring platform** for Frontier Communications. It continuously ingests public customer feedback (social media, reviews, forums), analyzes it with LLMs and embeddings, and exposes insights through an interactive web dashboard.

### System Layers
1. **Ingestion & Orchestration** – n8n  
2. **Application & AI Orchestration** – Next.js API routes + LangChain  
3. **Storage (Operational & Vector)** – PostgreSQL + pgvector  
4. **Analytics & Aggregation** – SQL / derived views (Bronze / Silver / Gold pattern)  
5. **Presentation Layer** – React / Next.js dashboard deployed on Vercel  

---

## 2. Technology Stack

### Frontend / Web App
- **React + Next.js (App Router)**
- **Tailwind CSS** for styling
- **Vercel** for deployment (auto-builds from GitHub commits)

### Backend / APIs
- Next.js **API routes** (serverless functions on Vercel)
- TypeScript / JavaScript
- **LangChain (JS)** for LLM / embedding orchestration
- **Claude Sonnet** as the primary LLM (sentiment / churn analysis)

### Data & Storage
- Hackathon-provided **PostgreSQL** instance  
- **pgvector** extension for vector embeddings  
- Logical data layers: **Bronze → Silver → Gold**

### Ingestion & Automation
- **n8n** for scheduled / triggered ingestion workflows from external sources

### Embeddings
- Open-source embedding models (e.g., **BGE** or **GTE**)  
- Stored in Postgres `vector` columns via pgvector

---

## 3. Data Flow by Layer

### 3.1 Ingestion (Bronze Layer – Raw Data)

**Goal:** Continuously collect raw customer feedback from multiple external channels.

- **Scheduler & Orchestration:**  
  n8n workflows run on a schedule (e.g., every 10–15 minutes).

- **External Sources:** Reddit · Google Reviews · X (Twitter) · Facebook · Other APIs

- **Workflow Responsibilities:**
  1. Fetch new posts/reviews/comments related to Frontier.  
  2. Normalize into a common schema:
     - `id`, `source`, `author`, `text`, `url`, `created_at`
  3. Insert into a **Bronze** Postgres table (`posts_raw`).  
  4. After each insert / batch, call `POST /api/process_post` on our backend, passing the new record.

> **State:** Raw, unstructured, unscored data.

---

### 3.2 AI Processing (Silver Layer – Enriched Records)

**Goal:** Transform raw posts into structured, AI-enriched records with sentiment, churn risk, and summaries.

- **Entry Point:** n8n calls `/api/process_post`.

- **Implementation:**
  - `/api/process_post` is a **Next.js API route** (serverless on Vercel).
  - Inside the route, **LangChain (JS/TS)** defines a pipeline:
    1. Retrieve the raw post from `posts_raw`.
    2. **Call Claude Sonnet** via LangChain to assess:
       - Sentiment score (numeric)  
       - Sentiment label (positive / neutral / negative)  
       - Churn risk (low / medium / high)  
       - Summary text  
       - Optional topics / entities
    3. **Update Silver** table (`posts_enriched`) or enrich same row with:
       - `sentiment_score`, `sentiment_label`, `churn_risk`, `summary`, `topics`

> **State:** Structured and scored — the **Silver layer**.

---

### 3.3 Embeddings & Vector Storage

**Goal:** Enable semantic search, clustering, and similarity queries.

- **Embedding Generation:**
  - Second step in the LangChain pipeline (within `process_post`).
  - Model: **BGE** or **GTE**.
  - Output: high-dimensional vector (e.g., 768-float array).

- **Storage with pgvector:**
  - PostgreSQL configured with **pgvector**.
  - Enriched table includes `embedding vector(768)`.
  - Optional vector index (e.g., `ivfflat`) for fast similarity search.

**Capabilities**
- Find “similar posts.”  
- Semantic search (e.g., “no-show technician appointments”).  
- Cluster posts for higher-level theme detection.

---

### 3.4 Aggregation & Gold Layer (Analytics)

**Goal:** Provide high-level metrics and trends for dashboards / alerts.

**Derived Gold-Level Aggregates**
- Average sentiment by time / region / product / channel  
- Counts per sentiment or churn bucket  
- Top recurring themes / topics (via embedding clusters)  
- High-risk alerts (spikes in negative sentiment or churn risk)

**Implementation Options**
1. **On-the-fly SQL** – API routes compute aggregates (`GROUP BY`, `AVG`, `COUNT` …).  
2. **Materialized Views** – e.g., `daily_sentiment_summary`, refreshed via n8n job.  
3. **Dedicated Gold Tables** – scheduled process writes aggregated results (e.g., `sentiment_daily`, `alerts`).

> The dashboard consumes these Gold views / tables for fast, pre-aggregated metrics.

---

### 3.5 Presentation Layer (Dashboard)

**Goal:** Deliver an interactive, executive-friendly dashboard.

- **Technology**
  - React + Next.js + Tailwind CSS  
  - Deployed on **Vercel** (auto-deploys from GitHub)

- **Data Access**
  - Frontend → Next.js API routes (`/api/metrics/summary`, `/api/posts/search`, `/api/posts/{id}`)
  - APIs query:
    - Silver tables (detailed views)
    - Gold views (aggregates & charts)
    - Vector columns (pgvector) for semantic search / related posts

- **Example Features**
  - Sentiment trend (line charts)  
  - Distribution by region / channel (bar or pie)  
  - Top themes (tag cloud from embedding clusters)  
  - Alerts for high-risk spikes (“Call Now” recommendations)  
  - Drill-down to related posts via semantic similarity

---

## 4. Role of LangChain and n8n

### n8n – Deterministic Orchestration
- Scheduling ingestion  
- Calling external APIs  
- Normalizing & inserting into Postgres  
- Triggering the processing API

### LangChain / LangGraph – AI Orchestration
- Calling Claude Sonnet for sentiment / churn / summary / topics  
- Calling embedding models (BGE / GTE)  
- Managing multi-step pipeline (LLM → embeddings → DB writes) inside Next.js API routes

> **n8n handles the plumbing; LangChain handles the intelligence.**

---

## 5. Benefits of This Architecture

### Separation of Concerns
- Ingestion, AI processing, storage, and visualization are independent yet integrated.

### Scalability & Flexibility
- Vercel auto-scales the web/API layer.  
- PostgreSQL + pgvector handle both transactional and semantic queries.  
- n8n and LangChain pipelines evolve independently.

### Hackathon-Friendly
- Relies on managed services (Vercel, provided Postgres).  
- Minimal custom infrastructure.  
- Most logic lives in one codebase (Next.js + LangChain) with n8n as a visual ingestion orchestrator.

---

**End of Document**

# Next.js Dashboard Application Build Prompt

Build a comprehensive Next.js 14+ application (App Router) with TypeScript, React, Tailwind CSS, and PostgreSQL integration for analyzing customer reviews data. The application will be deployed to Vercel.

## Database Schema: FRONTIER_REVIEWS_PROCESSED

The application connects to a PostgreSQL database with a table named `frontier_reviews_processed` that contains:

### Raw Data Fields (Bronze Layer)
- `id` (SERIAL PRIMARY KEY)
- `review_id` (INTEGER, UNIQUE)
- `platform` (VARCHAR(50)) - e.g., "Google Reviews", "BBB", "Yelp", "Trustpilot"
- `review_date` (DATE)
- `rating` (SMALLINT, 1-5)
- `reviewer_name` (VARCHAR(255))
- `location` (VARCHAR(255))
- `review_text` (TEXT)
- `helpful_count` (INTEGER)
- `review_url` (TEXT)
- `title` (VARCHAR(500))
- `verified_reviewer` (BOOLEAN)
- `verified_customer` (BOOLEAN)
- `local_guide` (BOOLEAN)

### Geographic & Temporal Metadata (Silver Layer)
- `city` (VARCHAR(100))
- `state` (VARCHAR(50))
- `region` (VARCHAR(50))
- `area_type` (VARCHAR(20)) - "urban", "suburban", "rural"
- `date_parsed` (DATE)
- `year` (INTEGER)
- `month` (INTEGER)
- `quarter` (VARCHAR(10)) - e.g., "Q3 2024"
- `week_of_year` (INTEGER)
- `days_ago` (INTEGER)

### LLM-Extracted Structured Data (Silver Layer)
- `primary_category` (VARCHAR) - Main problem category
- `all_categories` (TEXT[]) - Array of all identified categories
- `sentiment_score` (DECIMAL(3,2)) - Range -1.0 to 1.0
- `overall_sentiment` (VARCHAR) - "very_positive", "positive", "neutral", "negative", "very_negative", "mixed"
- `sentiment_intensity` (VARCHAR) - "mild", "moderate", "strong", "extreme"
- `churn_risk` (VARCHAR) - "low", "medium", "high", "critical"
- `churn_probability_score` (DECIMAL(3,2)) - Range 0.0 to 1.0
- `customer_tenure_months` (INTEGER)
- `tenure_category` (VARCHAR) - "new_customer", "established", "long_term", "very_long_term"
- `reviewer_type` (VARCHAR) - "residential", "business", "senior", "student"
- `use_cases` (TEXT[]) - Array of use cases like "work_from_home", "gaming", "streaming"
- `criticality_level` (VARCHAR) - "casual", "moderate", "important", "mission_critical"
- `resolution_status` (VARCHAR) - "unresolved", "partially_resolved", "resolved", "worsening"
- `severity` (VARCHAR) - "low", "medium", "high", "critical"
- `competitors_mentioned` (TEXT[]) - Array of competitor names
- `switching_intent` (BOOLEAN)
- `nps_indicator` (VARCHAR) - "detractor", "passive", "promoter"
- `would_recommend` (BOOLEAN)

### Metrics Extracted (Silver Layer)
- `speed_percentage` (DECIMAL) - Actual speed vs advertised
- `price_discrepancy` (DECIMAL) - Difference between advertised and actual price
- `price_increase_percent` (DECIMAL)
- `outage_count` (INTEGER)
- `contact_attempts` (INTEGER)
- `average_wait_time_minutes` (INTEGER)
- `resolution_rate` (DECIMAL)

### Vector Embeddings (Gold Layer)
- `review_text_embedding` (VECTOR(1536)) - pgvector embedding for semantic search
- `title_embedding` (VECTOR(1536))
- `combined_embedding` (VECTOR(1536))
- `embedding_model` (VARCHAR(100))
- `embedding_created_at` (TIMESTAMP WITH TIME ZONE)
- `embedding_version` (INTEGER)

### Metadata Fields
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)
- `is_processed` (BOOLEAN)
- `language_code` (VARCHAR(10))

## Application Requirements

### 1. Project Setup

Create a Next.js 14+ application with:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with pgvector support (use `@vercel/postgres` or `pg` with connection pooling)
- **Charts**: Recharts or Chart.js with react-chartjs-2
- **UI Components**: shadcn/ui or similar component library
- **Icons**: Lucide React or Heroicons
- **Date Handling**: date-fns
- **Environment Variables**: Use `.env.local` for database connection and API keys

### 2. Database Connection

Set up database connection using environment variables:
- `POSTGRES_URL` - PostgreSQL connection string
- `POSTGRES_PRISMA_URL` (optional, for Prisma)
- `POSTGRES_URL_NON_POOLING` (for migrations)

Use connection pooling for Vercel deployment. Consider using `@vercel/postgres` or `pg` with `pg-pool`.

### 3. API Routes Structure

Create the following API routes in `app/api/`:

#### 3.1 Dashboard Statistics (`/api/dashboard/stats`)
**GET** - Returns overall dashboard statistics:
- Total reviews count
- Average rating
- Average sentiment score
- Total high churn risk count
- Reviews by platform (count)
- Reviews by rating (distribution)
- Recent reviews count (last 30 days)
- Unresolved issues count

**Response Format:**
```typescript
{
  totalReviews: number;
  averageRating: number;
  averageSentiment: number;
  highChurnRiskCount: number;
  platformDistribution: { platform: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  recentReviewsCount: number;
  unresolvedIssuesCount: number;
}
```

#### 3.2 Reviews List (`/api/reviews`)
**GET** - Returns paginated list of reviews with filtering:
- Query parameters:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `platform` (string, optional)
  - `state` (string, optional)
  - `city` (string, optional)
  - `rating` (number, optional)
  - `churnRisk` (string, optional: "low" | "medium" | "high" | "critical")
  - `primaryCategory` (string, optional)
  - `sentimentMin` (number, optional)
  - `sentimentMax` (number, optional)
  - `dateFrom` (string, ISO date, optional)
  - `dateTo` (string, ISO date, optional)
  - `search` (string, optional - for text search)
  - `sortBy` (string, default: "review_date")
  - `sortOrder` (string, default: "desc")

**Response Format:**
```typescript
{
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### 3.3 Review Detail (`/api/reviews/[id]`)
**GET** - Returns detailed information for a single review by ID

#### 3.4 Trends Analysis (`/api/analytics/trends`)
**GET** - Returns trend data over time:
- Query parameters:
  - `groupBy` (string: "day" | "week" | "month" | "quarter" | "year")
  - `metric` (string: "count" | "sentiment" | "churn_risk" | "rating")
  - `dateFrom` (string, ISO date, optional)
  - `dateTo` (string, ISO date, optional)
  - `filters` (JSON string, optional - additional filters)

**Response Format:**
```typescript
{
  trends: {
    period: string;
    value: number;
    count?: number;
  }[];
}
```

#### 3.5 Category Analysis (`/api/analytics/categories`)
**GET** - Returns analysis by problem category:
- Query parameters:
  - `dateFrom` (string, optional)
  - `dateTo` (string, optional)
  - `state` (string, optional)

**Response Format:**
```typescript
{
  categories: {
    category: string;
    count: number;
    averageSentiment: number;
    averageChurnRisk: number;
    averageRating: number;
    unresolvedCount: number;
  }[];
}
```

#### 3.6 Geographic Analysis (`/api/analytics/geographic`)
**GET** - Returns geographic distribution:
- Query parameters:
  - `groupBy` (string: "state" | "city" | "region")
  - `metric` (string: "count" | "sentiment" | "churn_risk")
  - `limit` (number, default: 10)

**Response Format:**
```typescript
{
  locations: {
    location: string;
    count: number;
    averageSentiment: number;
    averageChurnRisk: number;
    highChurnCount: number;
  }[];
}
```

#### 3.7 Churn Risk Analysis (`/api/analytics/churn`)
**GET** - Returns churn risk analysis:
- Query parameters:
  - `dateFrom` (string, optional)
  - `dateTo` (string, optional)
  - `state` (string, optional)

**Response Format:**
```typescript
{
  churnRiskDistribution: {
    risk: string;
    count: number;
    percentage: number;
  }[];
  highRiskReviews: Review[];
  averageChurnProbability: number;
}
```

#### 3.8 Sentiment Analysis (`/api/analytics/sentiment`)
**GET** - Returns sentiment analysis:
- Query parameters:
  - `dateFrom` (string, optional)
  - `dateTo` (string, optional)
  - `groupBy` (string: "day" | "week" | "month", optional)

**Response Format:**
```typescript
{
  sentimentDistribution: {
    sentiment: string;
    count: number;
    percentage: number;
  }[];
  averageSentiment: number;
  sentimentOverTime: {
    period: string;
    averageSentiment: number;
    count: number;
  }[];
}
```

#### 3.9 Semantic Search (`/api/search/semantic`)
**POST** - Performs semantic search using vector embeddings:
- Request body:
```typescript
{
  query: string;
  limit?: number;
  threshold?: number;
  filters?: {
    platform?: string;
    state?: string;
    dateFrom?: string;
    dateTo?: string;
    churnRisk?: string;
  };
}
```

**Response Format:**
```typescript
{
  results: {
    review: Review;
    similarity: number;
  }[];
}
```

**Implementation Notes:**
- Convert query text to embedding using OpenAI API or similar
- Use pgvector cosine similarity search
- Combine with structured filters for better results

#### 3.10 AI Chat Interface (`/api/chat`)
**POST** - AI-powered chat interface using Claude Sonnet:
- Request body:
```typescript
{
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: {
    filters?: Record<string, any>;
    focusArea?: string;
  };
}
```

**Response Format:**
```typescript
{
  response: string;
  suggestedQueries?: string[];
  dataInsights?: {
    query: string;
    result: any;
  };
}
```

**Implementation Notes:**
- Use Anthropic Claude Sonnet API (via `@anthropic-ai/sdk`)
- Provide system prompt that includes:
  - Database schema information
  - Available metrics and fields
  - Example queries and responses
  - Instructions to generate SQL queries when needed
  - Instructions to provide data-driven insights
- When user asks data questions, generate SQL, execute it, and include results in response
- Format responses in a conversational, helpful manner
- Include relevant charts/visualizations suggestions when appropriate

#### 3.11 Export Data (`/api/export`)
**GET** - Exports filtered data as CSV:
- Query parameters: Same as `/api/reviews`
- Returns CSV file download

### 4. Frontend Dashboard Components

Create a modern, responsive dashboard with the following pages and components:

#### 4.1 Main Dashboard Page (`/app/dashboard/page.tsx`)

**Layout:**
- Header with app title and user info
- Sidebar navigation
- Main content area with grid layout

**Dashboard Sections:**

1. **Key Metrics Cards** (Top Row)
   - Total Reviews
   - Average Rating (with trend indicator)
   - Average Sentiment Score (with color coding)
   - High Churn Risk Count (with alert styling)
   - Unresolved Issues Count
   - Recent Reviews (last 30 days)

2. **Rating Distribution Chart**
   - Pie chart or bar chart showing distribution of 1-5 star ratings
   - Interactive tooltips

3. **Platform Distribution Chart**
   - Horizontal bar chart or donut chart
   - Shows review count by platform

4. **Sentiment Trend Chart**
   - Line chart showing sentiment over time (last 6 months)
   - X-axis: Time periods
   - Y-axis: Average sentiment score
   - Color-coded (green for positive, red for negative)

5. **Churn Risk Distribution**
   - Stacked bar chart or pie chart
   - Shows distribution of churn risk levels
   - Color-coded by risk level

6. **Top Problem Categories**
   - Horizontal bar chart
   - Shows top 10 problem categories by count
   - Includes average sentiment and churn risk for each

7. **Geographic Heatmap or Table**
   - Shows problem distribution by state
   - Color intensity based on problem count or average sentiment
   - Clickable to drill down

8. **Recent High-Priority Reviews**
   - Table showing recent reviews with:
     - High churn risk
     - Low sentiment
     - Unresolved status
   - Clickable rows to view details

#### 4.2 Reviews List Page (`/app/reviews/page.tsx`)

**Features:**
- Advanced filtering panel (collapsible sidebar)
  - Platform selector (multi-select)
  - State/City selector
  - Rating slider
  - Date range picker
  - Churn risk filter
  - Category filter
  - Sentiment range slider
  - Text search box
- Sortable table with columns:
  - Review Date
  - Platform
  - Rating (with star display)
  - Reviewer Name
  - Location
  - Primary Category
  - Sentiment Score (with color indicator)
  - Churn Risk (with badge)
  - Actions (View Details)
- Pagination controls
- Export to CSV button
- Results count display

#### 4.3 Review Detail Page (`/app/reviews/[id]/page.tsx`)

**Features:**
- Full review text display
- All metadata in organized sections:
  - Basic Info (platform, date, rating, reviewer)
  - Location & Demographics
  - Sentiment Analysis
  - Problem Classification
  - Churn Risk Analysis
  - Extracted Metrics
  - Embedding Info
- "Find Similar Reviews" button (semantic search)
- Link to original review URL
- Back to list button

#### 4.4 Analytics Page (`/app/analytics/page.tsx`)

**Tabs/Sections:**

1. **Trends Tab**
   - Time period selector (day/week/month/quarter/year)
   - Multiple chart options:
     - Review volume over time
     - Sentiment trend
     - Churn risk trend
     - Rating trend
   - Comparison mode (compare periods)

2. **Categories Tab**
   - Problem category breakdown
   - Category comparison charts
   - Category-specific metrics

3. **Geographic Tab**
   - Map visualization (if possible) or table
   - State/city breakdown
   - Geographic trends

4. **Churn Analysis Tab**
   - Churn risk distribution
   - High-risk customer profiles
   - Churn probability trends
   - Retention opportunities

5. **Sentiment Analysis Tab**
   - Sentiment distribution
   - Sentiment over time
   - Sentiment by category
   - Emotional tone analysis

#### 4.5 AI Chat Interface (`/app/chat/page.tsx`)

**Features:**
- Chat interface component with:
  - Message history display
  - Input field with send button
  - Loading indicators
  - Suggested queries/prompts
- Sidebar with:
  - Current filter context
  - Quick action buttons
  - Example queries
- Chat messages should support:
  - Text responses
  - Data tables (when AI queries data)
  - Chart suggestions (with links to generate charts)
  - Follow-up questions
- Conversation history persistence (localStorage or session)
- Export conversation option

**Example Chat Interactions:**
- "Show me reviews with billing issues in California"
- "What's the average sentiment for network performance problems?"
- "Which states have the highest churn risk?"
- "Compare sentiment trends between Q1 and Q2 2024"
- "Find reviews similar to this one about slow internet"

### 5. UI/UX Requirements

#### 5.1 Design System
- Use Tailwind CSS with a custom color palette
- Color scheme:
  - Primary: Blue shades
  - Success: Green shades
  - Warning: Yellow/Orange shades
  - Danger: Red shades
  - Neutral: Gray shades
- Consistent spacing and typography
- Responsive design (mobile, tablet, desktop)

#### 5.2 Components to Build/Use
- Button (variants: primary, secondary, outline, ghost)
- Card
- Table (sortable, paginated)
- Input (text, select, date picker, slider)
- Badge/Tag
- Modal/Dialog
- Tabs
- Sidebar
- Loading spinner/skeleton
- Toast notifications
- Tooltip
- Chart containers

#### 5.3 Accessibility
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

### 6. Technical Implementation Details

#### 6.1 Database Queries
- Use parameterized queries to prevent SQL injection
- Implement connection pooling for Vercel
- Add proper error handling
- Use database indexes effectively
- Consider query optimization for large datasets

#### 6.2 API Route Implementation
- Add proper TypeScript types
- Implement error handling with try-catch
- Return appropriate HTTP status codes
- Add request validation
- Implement rate limiting (if needed)
- Add CORS headers if needed

#### 6.3 Vector Search Implementation
- For semantic search, you'll need:
  - OpenAI API key for generating embeddings (or use existing embeddings)
  - pgvector extension enabled in PostgreSQL
  - Cosine similarity queries using `<->` operator
- Example query structure:
```sql
SELECT *, review_text_embedding <-> $1::vector AS similarity
FROM frontier_reviews_processed
WHERE review_text_embedding IS NOT NULL
ORDER BY review_text_embedding <-> $1::vector
LIMIT $2
```

#### 6.4 Claude Sonnet Integration
- Use `@anthropic-ai/sdk` package
- Environment variable: `ANTHROPIC_API_KEY`
- System prompt should include:
  - Database schema
  - Available API endpoints
  - Example SQL queries
  - Response formatting guidelines
- Implement streaming responses for better UX
- Handle rate limits and errors gracefully

#### 6.5 Chart Library
- Use Recharts (recommended) or Chart.js
- Ensure charts are responsive
- Add interactive features (tooltips, zoom, etc.)
- Export chart data option

### 7. Vercel Deployment Configuration

#### 7.1 Environment Variables
Set up in Vercel dashboard:
- `POSTGRES_URL` - Database connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - (if generating embeddings on-the-fly)
- `NODE_ENV` - Set to "production"

#### 7.2 Vercel Configuration
- Create `vercel.json` if needed for routing
- Ensure API routes are properly configured
- Set up database connection pooling
- Configure edge functions if needed

#### 7.3 Build Configuration
- Ensure TypeScript compiles without errors
- Optimize bundle size
- Add proper error boundaries
- Implement loading states

### 8. File Structure

```
app/
├── api/
│   ├── dashboard/
│   │   └── stats/
│   │       └── route.ts
│   ├── reviews/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── analytics/
│   │   ├── trends/
│   │   │   └── route.ts
│   │   ├── categories/
│   │   │   └── route.ts
│   │   ├── geographic/
│   │   │   └── route.ts
│   │   ├── churn/
│   │   │   └── route.ts
│   │   └── sentiment/
│   │       └── route.ts
│   ├── search/
│   │   └── semantic/
│   │       └── route.ts
│   ├── chat/
│   │   └── route.ts
│   └── export/
│       └── route.ts
├── dashboard/
│   └── page.tsx
├── reviews/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── analytics/
│   └── page.tsx
├── chat/
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── charts/
│   ├── filters/
│   └── chat/
├── lib/
│   ├── db.ts (database connection)
│   ├── queries.ts (SQL query functions)
│   ├── embeddings.ts (embedding utilities)
│   └── anthropic.ts (Claude client)
├── types/
│   └── index.ts (TypeScript types)
└── layout.tsx
```

### 9. Additional Features to Consider

- **Real-time Updates**: Consider adding WebSocket or polling for live data
- **User Authentication**: Add auth if needed (NextAuth.js)
- **Saved Filters**: Allow users to save filter presets
- **Export Options**: CSV, JSON, PDF reports
- **Email Alerts**: For high churn risk reviews (future feature)
- **Comparison Mode**: Compare different time periods or categories
- **Drill-down Navigation**: Click charts to filter data
- **Mobile App**: Consider responsive mobile experience

### 10. Testing Considerations

- Test API routes with various query parameters
- Test edge cases (empty results, invalid filters, etc.)
- Test semantic search with various queries
- Test AI chat with different question types
- Test responsive design on multiple devices
- Test database connection pooling
- Test error handling

### 11. Performance Optimization

- Implement pagination for large datasets
- Add caching where appropriate (React Query or SWR)
- Optimize database queries
- Lazy load charts
- Implement virtual scrolling for long lists
- Optimize bundle size
- Use Next.js Image component for any images

### 12. Documentation

Create:
- README.md with setup instructions
- API documentation (inline comments or separate doc)
- Environment variables documentation
- Deployment guide

---

## Implementation Priority

1. **Phase 1**: Basic setup, database connection, core API routes, simple dashboard
2. **Phase 2**: Advanced filtering, charts, analytics pages
3. **Phase 3**: Semantic search, AI chat interface
4. **Phase 4**: Polish, optimization, additional features

---

## Success Criteria

The application should:
- ✅ Successfully connect to PostgreSQL database
- ✅ Display meaningful dashboard with key metrics
- ✅ Allow filtering and searching reviews
- ✅ Show interactive charts and trends
- ✅ Provide AI chat interface that can answer data questions
- ✅ Be fully responsive and accessible
- ✅ Deploy successfully to Vercel
- ✅ Handle errors gracefully
- ✅ Perform well with large datasets

---

**Start building this application step by step, ensuring each component works before moving to the next. Focus on creating a solid foundation with proper TypeScript types, error handling, and a clean architecture.**


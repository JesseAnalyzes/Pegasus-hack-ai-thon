# Nimbus - Usage Examples

Real-world usage examples and scenarios for the Nimbus application.

## 📊 Dashboard Usage Examples

### Example 1: View Overall Metrics

**Goal**: Get a quick overview of all reviews

**Steps**:
1. Navigate to `/` (dashboard)
2. View KPI cards:
   - Total reviews count
   - Average rating
   - Average sentiment
   - High churn risk percentage
3. Review charts for trends

**Use Case**: Daily standup, executive summary

### Example 2: Filter by Date Range

**Goal**: Analyze reviews from last 30 days

**Steps**:
1. Open dashboard
2. Set "Date From" to 30 days ago
3. Set "Date To" to today
4. Observe updated metrics and charts

**Use Case**: Monthly reporting, trend analysis

### Example 3: Analyze by Platform

**Goal**: Compare reviews across platforms

**Steps**:
1. View "Top Platforms" chart
2. Click on platform in chart (if interactive)
3. Filter by specific platform
4. Compare metrics

**Use Case**: Platform performance analysis

### Example 4: Identify High Churn Risk

**Goal**: Find reviews with critical churn risk

**Steps**:
1. Filter by "Churn Risk" = "critical" or "high"
2. Review count in KPI card
3. Check "Churn Risk Distribution" chart
4. Click on recent reviews table to see details

**Use Case**: Customer retention focus

## 📝 Reviews Management Examples

### Example 1: Search for Specific Issue

**Goal**: Find all reviews mentioning "billing"

**Steps**:
1. Navigate to `/reviews`
2. Enter "billing" in search box
3. Review filtered results
4. Click on review to see details

**Use Case**: Issue tracking, customer support

### Example 2: Filter by Location

**Goal**: Find reviews from specific state

**Steps**:
1. Go to reviews page
2. Filter by state (e.g., "California")
3. Review results
4. Sort by date or rating

**Use Case**: Regional analysis, local issues

### Example 3: Find Low-Rated Reviews

**Goal**: Identify negative reviews for follow-up

**Steps**:
1. Navigate to reviews
2. Sort by rating (ascending)
3. Filter by rating ≤ 2
4. Review list for patterns

**Use Case**: Customer service prioritization

### Example 4: Analyze by Category

**Goal**: Find all "network performance" issues

**Steps**:
1. Filter by primary category = "network performance"
2. Review count and distribution
3. Check average sentiment
4. Review individual cases

**Use Case**: Product improvement focus

## 🤖 AI Chat Examples

### Example 1: General Question

**User**: "What are the main complaints in recent reviews?"

**Expected**: 
- AI analyzes recent reviews
- Identifies common themes
- Provides summary with examples
- Shows source reviews

**Use Case**: Quick insights, trend identification

### Example 2: Specific Analysis

**User**: "Which states have the highest churn risk this month?"

**Expected**:
- AI queries filtered data
- Identifies states with high churn
- Provides statistics
- Shows relevant reviews

**Use Case**: Regional analysis, resource allocation

### Example 3: Comparison

**User**: "Compare sentiment between Q1 and Q2 2024"

**Expected**:
- AI retrieves data for both periods
- Compares metrics
- Highlights differences
- Provides insights

**Use Case**: Period-over-period analysis

### Example 4: Deep Dive

**User**: "What's causing high churn risk in New York?"

**Expected**:
- AI searches for NY reviews with high churn
- Analyzes patterns
- Identifies common issues
- Provides actionable insights

**Use Case**: Root cause analysis

## 🔍 Search Examples

### Example 1: Keyword Search

**Search**: "slow internet"

**Results**: 
- Reviews containing "slow" and "internet"
- Highlighted matches
- Sorted by relevance or date

### Example 2: Combined Search

**Search**: "billing" + Filter: State = "Texas" + Date: Last 90 days

**Results**:
- Texas reviews from last 90 days mentioning billing
- Filtered and sorted results

### Example 3: Semantic Search (via Chat)

**Query**: "reviews about connection problems"

**Results**:
- Uses vector search to find semantically similar reviews
- Not just exact keyword matches
- More relevant results

## 📈 Analytics Examples

### Example 1: Sentiment Trend Analysis

**Goal**: Track sentiment over time

**Steps**:
1. Dashboard → Trends chart
2. Select metric = "avg_sentiment"
3. Select granularity = "month"
4. Analyze trend line
5. Identify improvement or decline

**Use Case**: Performance tracking, KPI monitoring

### Example 2: Platform Comparison

**Goal**: Compare review quality across platforms

**Steps**:
1. Dashboard → Breakdowns
2. Group by = "platform"
3. Compare:
   - Review counts
   - Average ratings
   - Sentiment scores
   - Churn risk percentages

**Use Case**: Platform strategy, resource allocation

### Example 3: Category Analysis

**Goal**: Identify problem areas

**Steps**:
1. Filter by date range
2. View breakdown by primary_category
3. Sort by count or churn risk
4. Identify top problem categories

**Use Case**: Product roadmap, prioritization

## 🎯 Real-World Scenarios

### Scenario 1: Weekly Review Meeting

**Preparation**:
1. Open dashboard
2. Set date range to last 7 days
3. Review KPIs and trends
4. Identify top issues
5. Prepare action items

**Discussion Points**:
- Total reviews received
- Average sentiment trend
- High churn risk count
- Top problem categories
- Regional hotspots

### Scenario 2: Customer Support Triage

**Process**:
1. Navigate to reviews
2. Filter by:
   - Churn risk = "critical" or "high"
   - Resolution status = "unresolved"
   - Sort by date (newest first)
3. Review each case
4. Assign to support team
5. Track resolution

### Scenario 3: Product Improvement

**Analysis**:
1. Use AI chat: "What are the top 5 complaints?"
2. Review source reviews
3. Filter by category
4. Analyze patterns
5. Create improvement tickets

### Scenario 4: Executive Reporting

**Report Creation**:
1. Dashboard with YTD filters
2. Screenshot KPI cards
3. Export chart data (manual)
4. Use AI chat for insights
5. Compile executive summary

## 💡 Tips & Best Practices

### Efficient Filtering
- Start broad, then narrow down
- Use URL filters for sharing
- Save common filter combinations (mentally)

### Effective AI Queries
- Be specific in questions
- Ask follow-up questions
- Review source reviews for context
- Use filters to scope questions

### Data Analysis
- Combine multiple views
- Use trends for patterns
- Check breakdowns for distribution
- Review individual cases for details

### Performance
- Use appropriate date ranges
- Limit result sets with filters
- Use pagination for large datasets
- Clear filters when done

## 🎓 Learning Path

### Beginner
1. Explore dashboard
2. Try basic filters
3. View review details
4. Ask simple AI questions

### Intermediate
1. Combine multiple filters
2. Use search effectively
3. Analyze trends
4. Ask complex AI questions

### Advanced
1. Use URL filters for sharing
2. Leverage semantic search
3. Create custom analysis
4. Export insights

---

**Last Updated**: 2024


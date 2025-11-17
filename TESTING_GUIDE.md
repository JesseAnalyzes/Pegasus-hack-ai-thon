# Nimbus - Testing Guide

Guide for testing the Nimbus application locally and in production.

## 🧪 Testing Checklist

### Pre-Testing Setup

- [ ] Dependencies installed: `npm install`
- [ ] Environment variables configured
- [ ] Database connected and accessible
- [ ] API keys valid and have credits
- [ ] Development server running: `npm run dev`

## 📋 Manual Testing Scenarios

### 1. Dashboard Testing (`/`)

#### KPI Cards
- [ ] Total reviews count displays correctly
- [ ] Average rating shows proper value
- [ ] Average sentiment score displays
- [ ] High churn risk percentage calculates correctly

#### Charts
- [ ] Reviews over time chart renders
- [ ] Sentiment distribution pie chart displays
- [ ] Churn risk bar chart shows data
- [ ] Platform breakdown chart works
- [ ] Charts are responsive (resize browser)
- [ ] Tooltips work on hover

#### Filtering
- [ ] Date range filter works
- [ ] Platform filter updates data
- [ ] Region filter works
- [ ] State filter works
- [ ] Churn risk filter applies
- [ ] Sentiment filter works
- [ ] Multiple filters combine correctly
- [ ] Clear filters button resets all
- [ ] URL updates when filters change
- [ ] Filters persist on page refresh

#### Recent Reviews Table
- [ ] Table displays reviews
- [ ] Review links navigate to detail page
- [ ] Data displays correctly in columns
- [ ] Table is scrollable on mobile

### 2. Reviews Page Testing (`/reviews`)

#### Table Functionality
- [ ] Reviews load and display
- [ ] Pagination works (next/previous)
- [ ] Page size changes work
- [ ] Total count displays correctly
- [ ] Empty state shows when no results

#### Sorting
- [ ] Sort by date works (asc/desc)
- [ ] Sort by rating works
- [ ] Sort by sentiment works
- [ ] Sort by churn risk works
- [ ] Sort by helpful count works
- [ ] Sort direction toggles correctly

#### Search
- [ ] Search input accepts text
- [ ] Search filters reviews in real-time
- [ ] Search works with review text
- [ ] Search works with titles
- [ ] Search clears correctly
- [ ] Search combines with filters

#### Filtering
- [ ] All filters work individually
- [ ] Filters combine correctly
- [ ] Filter state persists
- [ ] Clear filters works

### 3. Review Detail Page (`/reviews/[id]`)

#### Data Display
- [ ] All review fields display
- [ ] Dates format correctly
- [ ] Ratings display properly
- [ ] AI analysis fields show
- [ ] AI attributes render correctly
- [ ] External link works

#### Navigation
- [ ] Back button works
- [ ] Browser back button works
- [ ] 404 page shows for invalid IDs
- [ ] Error handling works

### 4. AI Chat Testing (`/chat`)

#### Basic Functionality
- [ ] Chat interface loads
- [ ] Input field accepts text
- [ ] Send button works
- [ ] Enter key sends message
- [ ] Messages display correctly
- [ ] Loading state shows during processing

#### AI Responses
- [ ] Claude responds to questions
- [ ] Responses are relevant
- [ ] Sources display correctly
- [ ] Source links work
- [ ] Error messages show on failure

#### Message History
- [ ] Conversation persists
- [ ] Multiple messages work
- [ ] History limit enforced (20 messages)
- [ ] Scroll to bottom works

#### Example Questions to Test
- "What are the main complaints?"
- "Which states have high churn risk?"
- "Show me sentiment trends"
- "What's the average rating for billing issues?"

### 5. API Endpoint Testing

#### Health Check
```bash
curl http://localhost:3000/api
```
Expected: `{"status":"ok","service":"Nimbus API","version":"1.0.0"}`

#### Summary API
```bash
curl "http://localhost:3000/api/summary"
```
Expected: JSON with summary statistics

#### Trends API
```bash
curl "http://localhost:3000/api/trends?granularity=day&metric=count"
```
Expected: JSON with time series data

#### Breakdowns API
```bash
curl "http://localhost:3000/api/breakdowns?groupBy=platform"
```
Expected: JSON with breakdown data

#### Reviews API
```bash
curl "http://localhost:3000/api/reviews?page=1&pageSize=20"
```
Expected: JSON with paginated reviews

#### Review Detail API
```bash
curl "http://localhost:3000/api/reviews/1"
```
Expected: JSON with single review

#### Chat API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the main complaints?"}'
```
Expected: JSON with AI response

### 6. Error Handling Testing

#### Invalid Requests
- [ ] Invalid review ID returns 404
- [ ] Invalid API parameters return 400
- [ ] Missing required fields return 400
- [ ] Large requests return 413
- [ ] Invalid JSON returns 400

#### Error Pages
- [ ] 404 page displays for unknown routes
- [ ] Error page shows on application errors
- [ ] Error boundary catches React errors
- [ ] Error messages are user-friendly

### 7. Responsive Design Testing

#### Breakpoints
- [ ] Mobile (< 640px) - Layout adapts
- [ ] Tablet (640px - 1024px) - Layout works
- [ ] Desktop (> 1024px) - Full layout
- [ ] Charts resize correctly
- [ ] Tables scroll on mobile
- [ ] Navigation works on mobile

### 8. Performance Testing

#### Load Times
- [ ] Dashboard loads in < 3 seconds
- [ ] Reviews page loads in < 2 seconds
- [ ] API responses are < 1 second
- [ ] Charts render smoothly
- [ ] No console errors

#### Data Handling
- [ ] Large datasets paginate correctly
- [ ] Filters don't cause lag
- [ ] Search is responsive
- [ ] Multiple API calls work

## 🔍 Browser Testing

### Test in Multiple Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

### Check Console
- [ ] No JavaScript errors
- [ ] No TypeScript errors
- [ ] No network errors
- [ ] Warnings are acceptable

## 🐛 Common Issues to Test

### Database Connection
- [ ] Works with correct DATABASE_URL
- [ ] Fails gracefully with wrong URL
- [ ] Error message is clear

### API Keys
- [ ] Works with valid ANTHROPIC_API_KEY
- [ ] Fails gracefully with invalid key
- [ ] Error message is helpful

### Empty Database
- [ ] Dashboard shows empty states
- [ ] Charts handle no data
- [ ] Tables show "no results"
- [ ] No crashes or errors

### Network Issues
- [ ] Handles slow connections
- [ ] Handles timeouts
- [ ] Shows appropriate errors
- [ ] Retry works

## 📊 Test Data Scenarios

### Scenario 1: Full Dataset
- Database has 1000+ reviews
- All fields populated
- Test pagination, filtering, search

### Scenario 2: Empty Dataset
- Database has 0 reviews
- Test empty states
- Test error handling

### Scenario 3: Partial Data
- Some reviews missing fields
- Test null handling
- Test optional fields

### Scenario 4: Edge Cases
- Very long review text
- Special characters in text
- Extreme dates
- Boundary values

## ✅ Acceptance Criteria

### Functional Requirements
- [x] All features work as specified
- [x] All API endpoints return correct data
- [x] All pages render correctly
- [x] All interactions work

### Non-Functional Requirements
- [x] Application is responsive
- [x] Error handling works
- [x] Loading states display
- [x] Empty states display
- [x] Performance is acceptable

### Quality Requirements
- [x] No console errors
- [x] No TypeScript errors
- [x] Code is maintainable
- [x] Documentation is complete

## 🚀 Production Testing

Before deploying to production:

- [ ] All manual tests pass
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables set
- [ ] Database accessible from Vercel
- [ ] API keys have credits
- [ ] SSL configured for database
- [ ] Security headers work
- [ ] Error tracking configured (optional)

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Dashboard: [ ] Pass [ ] Fail
Reviews Page: [ ] Pass [ ] Fail
Review Detail: [ ] Pass [ ] Fail
AI Chat: [ ] Pass [ ] Fail
API Routes: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail
Responsive: [ ] Pass [ ] Fail
Performance: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
```

---

**Last Updated**: 2024


# Nimbus Setup Checklist

Use this checklist to ensure your Nimbus application is properly configured and ready to run.

## Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn package manager
- [ ] PostgreSQL database with:
  - [ ] `pgvector` extension installed
  - [ ] `team_pegasus` schema exists
  - [ ] `frontier_reviews_processed` table created
  - [ ] Database is accessible from your network

## Installation

- [ ] Clone or navigate to project directory
- [ ] Run `npm install` to install dependencies
- [ ] Verify installation: `npm list` (no errors)

## Environment Configuration

- [ ] Create `.env.local` file in project root
- [ ] Set `DATABASE_URL` with correct connection string
- [ ] Set `ANTHROPIC_API_KEY` (required for AI chat)
- [ ] Set `EMBEDDING_API_KEY` (optional, for semantic search)
- [ ] Set `EMBEDDING_API_URL` (optional, defaults to OpenAI)
- [ ] Verify `.env.local` is in `.gitignore`

## Database Setup

- [ ] Verify PostgreSQL is running
- [ ] Test database connection
- [ ] Verify `pgvector` extension: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Verify schema exists: `SELECT * FROM team_pegasus.frontier_reviews_processed LIMIT 1;`
- [ ] Check table has required columns (see schema in requirements)
- [ ] Verify `gte_embedding` column exists and has vector type
- [ ] Check indexes are created (especially HNSW index for embeddings)

## Verification

- [ ] Run setup verification: `npm run verify`
- [ ] All checks pass (Node version, env vars, files)

## Build & Test

- [ ] Run development server: `npm run dev`
- [ ] Application starts without errors
- [ ] Visit `http://localhost:3000`
- [ ] Dashboard loads (may show empty data if no reviews)
- [ ] Test API health check: `http://localhost:3000/api`
- [ ] Test API endpoints:
  - [ ] `/api/summary`
  - [ ] `/api/trends`
  - [ ] `/api/breakdowns`
  - [ ] `/api/reviews`
  - [ ] `/api/chat` (POST request)

## Frontend Testing

- [ ] Dashboard page loads (`/`)
- [ ] Filters work correctly
- [ ] Charts render (even if empty)
- [ ] Reviews page loads (`/reviews`)
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Review detail page loads (`/reviews/[id]`)
- [ ] Chat page loads (`/chat`)
- [ ] Chat sends messages and receives responses
- [ ] Error pages work (`/404`, error boundary)

## API Testing

- [ ] All API routes return proper responses
- [ ] Error handling works (test invalid requests)
- [ ] Validation works (test invalid parameters)
- [ ] Database queries execute successfully
- [ ] Semantic search works (if embeddings configured)

## Production Readiness

- [ ] TypeScript compiles: `npm run build`
- [ ] No build errors or warnings
- [ ] All environment variables documented
- [ ] Database connection string uses SSL for production
- [ ] API keys have sufficient credits/permissions
- [ ] Error logging is configured
- [ ] Monitoring is set up (optional)

## Deployment (Vercel)

- [ ] Code pushed to Git repository
- [ ] Vercel project created
- [ ] Environment variables set in Vercel
- [ ] Build settings configured
- [ ] Deployment successful
- [ ] Production URL works
- [ ] Database accessible from Vercel
- [ ] API routes work in production

## Troubleshooting

If something doesn't work:

1. **Database Connection Issues**
   - Check `DATABASE_URL` format
   - Verify database is accessible
   - Check firewall rules
   - Verify SSL settings

2. **API Errors**
   - Check API keys are valid
   - Verify API keys have credits
   - Check rate limits
   - Review error logs

3. **Build Errors**
   - Clear `.next` folder
   - Delete `node_modules` and reinstall
   - Check Node.js version
   - Review TypeScript errors

4. **Empty Data**
   - Verify database has data
   - Check table name and schema
   - Verify filters aren't too restrictive
   - Check database permissions

## Quick Commands

```bash
# Install dependencies
npm install

# Verify setup
npm run verify

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Support Resources

- README.md - Full setup instructions
- DEPLOYMENT.md - Vercel deployment guide
- QUICKSTART.md - Quick start guide
- PROJECT_SUMMARY.md - Architecture overview

---

**Status**: ✅ Ready when all items are checked


# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database with `pgvector` extension
- ✅ `team_pegasus.frontier_reviews_processed` table created
- ✅ Anthropic API key

## Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env.local`** (copy from `.env.example`):
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?schema=team_pegasus
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:3000

## First Steps

1. **Dashboard**: View overview at `/`
2. **Reviews**: Browse reviews at `/reviews`
3. **AI Chat**: Ask questions at `/chat`

## Common Issues

### Database Connection Error
- Verify `DATABASE_URL` format
- Check PostgreSQL is running
- Ensure schema `team_pegasus` exists

### AI Chat Not Working
- Verify `ANTHROPIC_API_KEY` is set
- Check API key has credits
- Semantic search requires `EMBEDDING_API_KEY` (optional)

### Build Errors
- Run `npm install` again
- Check Node.js version: `node --version` (should be 18+)
- Clear `.next` folder and rebuild

## Next Steps

- Customize filters and charts
- Add more AI features
- Deploy to Vercel (see README.md)


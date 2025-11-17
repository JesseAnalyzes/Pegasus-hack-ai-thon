# Deployment Guide for Nimbus

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] API keys verified (Anthropic, Embedding API if used)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Database schema matches expected structure

## Vercel Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=team_pegasus
ANTHROPIC_API_KEY=sk-ant-...
EMBEDDING_API_KEY=sk-... (optional)
EMBEDDING_API_URL=https://api.openai.com/v1/embeddings (optional)
```

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments
- Use SSL connection strings for production databases
- Never commit `.env.local` to Git

### 4. Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `next build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Check deployment logs for any errors
4. Visit your deployment URL

## Post-Deployment

### Verify Deployment

1. **Health Check**: Visit `https://your-app.vercel.app/api`
   - Should return: `{"status":"ok","service":"Nimbus API","version":"1.0.0"}`

2. **Dashboard**: Visit `https://your-app.vercel.app/`
   - Should load dashboard with data (if database is connected)

3. **API Routes**: Test each endpoint:
   - `/api/summary`
   - `/api/trends`
   - `/api/reviews`
   - `/api/chat`

### Common Issues

#### Database Connection Errors

**Problem**: "Connection refused" or "timeout"

**Solutions**:
- Verify `DATABASE_URL` is correct in Vercel
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled: `?sslmode=require`
- For some providers, use connection pooling URL

#### API Key Errors

**Problem**: "Invalid API key" or "Unauthorized"

**Solutions**:
- Double-check API keys in Vercel environment variables
- Ensure keys are set for the correct environment (Production)
- Verify API keys have sufficient credits/permissions

#### Build Failures

**Problem**: Build fails with TypeScript or dependency errors

**Solutions**:
- Run `npm run build` locally first to catch errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Clear `.next` folder and rebuild

#### Runtime Errors

**Problem**: App crashes or returns 500 errors

**Solutions**:
- Check Vercel function logs
- Verify database schema matches expectations
- Ensure `pgvector` extension is installed
- Check API rate limits

## Database Configuration for Production

### Connection Pooling

For production, use a connection pooler:

**Supabase**:
```
DATABASE_URL=postgresql://user:password@host:port/database?pgbouncer=true
```

**Neon**:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Railway/Render**:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### SSL Configuration

Most production databases require SSL. Add to connection string:
```
?sslmode=require
```

Or configure in `lib/db.ts`:
```typescript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- **Analytics**: Track page views and performance
- **Speed Insights**: Monitor Core Web Vitals
- **Logs**: View function logs and errors

### Custom Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Performance monitoring (New Relic, Datadog)
- Uptime monitoring (UptimeRobot, Pingdom)

## Rollback

If deployment has issues:

1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

## Scaling Considerations

- **Database**: Ensure connection pool size is appropriate
- **API Routes**: Vercel automatically scales serverless functions
- **Caching**: Consider adding Redis for frequently accessed data
- **CDN**: Vercel provides global CDN automatically

## Security Checklist

- [ ] Environment variables are not in Git
- [ ] API keys are rotated regularly
- [ ] Database credentials are secure
- [ ] CORS is configured if needed
- [ ] Rate limiting is considered for API routes
- [ ] Input validation is in place (Zod schemas)

## Support

For deployment issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Review Next.js deployment guide: https://nextjs.org/docs/deployment
3. Check function logs in Vercel dashboard


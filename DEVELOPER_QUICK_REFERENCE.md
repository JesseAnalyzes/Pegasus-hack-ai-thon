# Developer Quick Reference

Quick reference guide for working with the Nimbus codebase.

## Project Structure

```
nimbus/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── chat/              # Chat page
│   ├── reviews/           # Reviews pages
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration
│   ├── db.ts             # Database connection
│   ├── queries.ts        # Data access layer
│   └── validation.ts     # Input validation
├── types/                 # TypeScript types
└── scripts/              # Utility scripts
```

## Key Files

### API Routes
- `app/api/summary/route.ts` - Summary statistics
- `app/api/trends/route.ts` - Time series data
- `app/api/breakdowns/route.ts` - Grouped breakdowns
- `app/api/reviews/route.ts` - Paginated reviews
- `app/api/reviews/[id]/route.ts` - Single review
- `app/api/chat/route.ts` - AI chat endpoint

### Data Layer
- `lib/db.ts` - Database connection pool
- `lib/queries.ts` - All database queries
- `lib/ai/chat.ts` - Claude integration
- `lib/ai/embeddings.ts` - Embedding generation

### Types
- `types/index.ts` - All TypeScript types

## Common Tasks

### Adding a New API Route

1. Create route file: `app/api/[name]/route.ts`
2. Add validation with Zod
3. Use query helpers from `lib/queries.ts`
4. Add error handling
5. Export `runtime = 'nodejs'`

Example:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({ ... });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = Schema.safeParse(Object.fromEntries(searchParams));
    // ... implementation
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
```

### Adding a New Query Function

1. Add to `lib/queries.ts`
2. Use `buildFilterClause()` for filters
3. Use `query()` from `lib/db.ts`
4. Return typed data
5. Handle date conversions

Example:
```typescript
export async function getCustomData(
  filters: ReviewFilters = {}
): Promise<CustomType[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const result = await query(
    `SELECT * FROM team_pegasus.frontier_reviews_processed ${whereClause}`,
    params
  );
  return result.rows.map(convertDates);
}
```

### Adding a New Filter

1. Add to `ReviewFilters` type in `types/index.ts`
2. Add to `buildFilterClause()` in `lib/queries.ts`
3. Add to API route validation schemas
4. Add to FilterBar component if needed

### Adding a New Chart

1. Import from Recharts
2. Use `ResponsiveContainer`
3. Use data from API
4. Add to dashboard page

Example:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

## Database Queries

### Always Use Parameterized Queries

✅ Good:
```typescript
await query('SELECT * FROM table WHERE id = $1', [id]);
```

❌ Bad:
```typescript
await query(`SELECT * FROM table WHERE id = ${id}`);
```

### Schema Prefix

Always use: `team_pegasus.frontier_reviews_processed`

### Date Handling

Convert dates in query results:
```typescript
review_date: row.review_date?.toISOString().split('T')[0]
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key

Optional:
- `EMBEDDING_API_KEY` - For semantic search
- `EMBEDDING_API_URL` - Embedding API endpoint

## Common Patterns

### Error Handling
```typescript
try {
  // operation
} catch (error: any) {
  console.error('Error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);
// ... fetch data
setLoading(false);
```

### Empty States
```typescript
{data.length === 0 ? (
  <div>No data found</div>
) : (
  <div>{/* render data */}</div>
)}
```

## Testing Locally

```bash
# Install
npm install

# Verify setup
npm run verify

# Run dev server
npm run dev

# Build
npm run build

# Start production
npm start
```

## Debugging

### Database Issues
- Check `DATABASE_URL` format
- Verify connection string
- Check database is running
- Verify schema exists

### API Issues
- Check browser console
- Check server logs
- Verify environment variables
- Test with curl/Postman

### TypeScript Errors
- Run `npm run build` to see all errors
- Check type definitions in `types/index.ts`
- Verify imports are correct

## Code Style

- Use TypeScript strict mode
- Use async/await (not promises)
- Use Zod for validation
- Use parameterized queries
- Add error handling
- Add loading states
- Add empty states

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit
git add .
git commit -m "Add new feature"

# Push
git push origin feature/new-feature
```

## Useful Commands

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Format (if configured)
npm run format

# Verify setup
npm run verify
```

## Quick Links

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Zod](https://zod.dev/)

---

**Last Updated**: 2024


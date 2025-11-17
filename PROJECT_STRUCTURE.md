# Nimbus - Project Structure

Complete file structure and organization guide.

## 📁 Complete Directory Tree

```
nimbus/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes
│   │   ├── route.ts                  # Health check endpoint
│   │   ├── summary/
│   │   │   └── route.ts              # Summary statistics API
│   │   ├── trends/
│   │   │   └── route.ts              # Time series API
│   │   ├── breakdowns/
│   │   │   └── route.ts              # Breakdowns API
│   │   ├── reviews/
│   │   │   ├── route.ts              # Reviews list API
│   │   │   └── [id]/
│   │   │       └── route.ts         # Single review API
│   │   └── chat/
│   │       └── route.ts              # AI chat API
│   ├── chat/
│   │   └── page.tsx                  # Chat interface page
│   ├── reviews/
│   │   ├── page.tsx                  # Reviews list page
│   │   └── [id]/
│   │       └── page.tsx              # Review detail page
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Dashboard page
│   ├── error.tsx                     # Error page
│   ├── not-found.tsx                 # 404 page
│   └── globals.css                   # Global styles
│
├── components/                       # React Components
│   ├── dashboard/
│   │   ├── FilterBar.tsx             # Filter bar component
│   │   └── KPICard.tsx              # KPI card component
│   ├── layout/
│   │   └── Sidebar.tsx              # Navigation sidebar
│   └── ui/
│       ├── Badge.tsx                # Badge component
│       ├── Card.tsx                 # Card components
│       └── ErrorBoundary.tsx        # Error boundary
│
├── lib/                              # Libraries & Utilities
│   ├── ai/
│   │   ├── chat.ts                  # Claude chat integration
│   │   └── embeddings.ts           # Embedding generation
│   ├── db.ts                        # Database connection
│   ├── queries.ts                   # Data access layer
│   ├── validation.ts                # Input validation
│   ├── api-utils.ts                 # API utilities
│   └── utils.ts                     # General utilities
│
├── types/
│   └── index.ts                     # TypeScript type definitions
│
├── scripts/
│   └── verify-setup.js              # Setup verification script
│
├── Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.js               # Next.js config
│   ├── tailwind.config.ts           # Tailwind config
│   ├── postcss.config.js            # PostCSS config
│   ├── middleware.ts                # Next.js middleware
│   ├── vercel.json                  # Vercel config
│   ├── .eslintrc.json               # ESLint config
│   ├── .gitignore                   # Git ignore
│   └── .gitattributes               # Git attributes
│
└── Documentation/
    ├── START_HERE.md                # Quick start guide
    ├── README.md                    # Main documentation
    ├── INDEX.md                     # Documentation index
    ├── QUICKSTART.md                # Quick setup
    ├── SETUP_CHECKLIST.md           # Setup verification
    ├── DEPLOYMENT.md                # Deployment guide
    ├── SECURITY.md                  # Security guide
    ├── DEVELOPER_QUICK_REFERENCE.md # Developer guide
    ├── PROJECT_SUMMARY.md           # Architecture overview
    ├── PROJECT_OVERVIEW.md          # Complete overview
    ├── PROJECT_COMPLETE.md          # Completion status
    ├── FINAL_STATUS.md              # Final status
    ├── BUILD_SUMMARY.md             # Build summary
    ├── COMPLETE_FEATURE_LIST.md     # Feature list
    ├── PROJECT_STRUCTURE.md         # This file
    ├── CHANGELOG.md                 # Version history
    ├── CONTRIBUTING.md              # Contribution guide
    └── LICENSE                      # MIT License
```

## 📂 Directory Purposes

### `/app`
Next.js App Router directory containing:
- **Pages**: React Server Components and Client Components
- **API Routes**: Server-side API endpoints
- **Layouts**: Shared layouts
- **Error Handling**: Error and 404 pages

### `/components`
Reusable React components:
- **Dashboard**: Dashboard-specific components
- **Layout**: Layout components (sidebar, etc.)
- **UI**: Generic UI components (cards, badges, etc.)

### `/lib`
Utility libraries and helpers:
- **ai/**: AI/LLM integration code
- **db.ts**: Database connection management
- **queries.ts**: Data access layer
- **validation.ts**: Input validation utilities
- **api-utils.ts**: API helper functions

### `/types`
TypeScript type definitions:
- All interfaces and types
- Enums and unions
- API request/response types

### `/scripts`
Utility scripts:
- Setup verification
- Build scripts (if needed)

## 🔗 File Relationships

### Data Flow
```
Frontend (app/) 
  → API Routes (app/api/)
    → Query Helpers (lib/queries.ts)
      → Database (lib/db.ts)
        → PostgreSQL
```

### AI Chat Flow
```
Chat Page (app/chat/)
  → Chat API (app/api/chat/)
    → AI Chat (lib/ai/chat.ts)
      → Embeddings (lib/ai/embeddings.ts)
      → Semantic Search (lib/queries.ts)
      → Claude API
```

### Component Hierarchy
```
Layout (app/layout.tsx)
  → Sidebar (components/layout/Sidebar.tsx)
  → Page Content
    → Dashboard Components
    → UI Components
```

## 📝 Key Files Explained

### Entry Points
- `app/layout.tsx` - Root layout, wraps all pages
- `app/page.tsx` - Dashboard (home page)
- `app/globals.css` - Global styles

### API Entry Points
- `app/api/route.ts` - Health check
- `app/api/*/route.ts` - Individual API endpoints

### Core Logic
- `lib/db.ts` - Database connection singleton
- `lib/queries.ts` - All database queries
- `lib/ai/chat.ts` - AI chat logic
- `types/index.ts` - All TypeScript types

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript settings
- `next.config.js` - Next.js settings
- `tailwind.config.ts` - Tailwind CSS settings
- `middleware.ts` - Request middleware
- `vercel.json` - Vercel deployment config

## 🎯 Finding Files

### "Where is the..."
- **Dashboard code?** → `app/page.tsx`
- **Reviews page?** → `app/reviews/page.tsx`
- **Review detail?** → `app/reviews/[id]/page.tsx`
- **Chat page?** → `app/chat/page.tsx`
- **API routes?** → `app/api/`
- **Database queries?** → `lib/queries.ts`
- **AI chat logic?** → `lib/ai/chat.ts`
- **Type definitions?** → `types/index.ts`
- **Components?** → `components/`
- **Utilities?** → `lib/`

## 📊 File Count by Type

- **TypeScript Files**: 30+
- **React Components**: 10+
- **API Routes**: 7
- **Pages**: 4
- **Configuration Files**: 10+
- **Documentation Files**: 17
- **Total Files**: 55+

## 🔍 Navigation Tips

1. **Start with**: `START_HERE.md` or `README.md`
2. **Understand architecture**: `PROJECT_SUMMARY.md`
3. **Find code**: Use this structure guide
4. **Deploy**: Follow `DEPLOYMENT.md`
5. **Develop**: Use `DEVELOPER_QUICK_REFERENCE.md`

---

**Last Updated**: 2024


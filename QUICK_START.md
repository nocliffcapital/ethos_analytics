# Quick Start Guide

Get up and running with Ethos Analytics in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ethos_analytics
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...  # Optional
```

### Quick Local Setup (Docker)

If you have Docker, use this to start PostgreSQL and Redis:

```bash
# PostgreSQL
docker run -d \
  --name ethos-postgres \
  -e POSTGRES_DB=ethos_analytics \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Redis
docker run -d \
  --name ethos-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Then set in `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ethos_analytics
REDIS_URL=redis://localhost:6379
```

## 3. Initialize Database

```bash
npm run db:init
```

Or manually:
```bash
psql $DATABASE_URL < scripts/init-db.sql
```

## 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 5. (Optional) Start Background Worker

In a separate terminal:

```bash
npm run worker
```

## Test It Out

1. Go to http://localhost:3000
2. Enter a Twitter handle or wallet address
3. Click Search
4. View the reputation summary!

## Example Profiles to Try

Try these example inputs (if they exist on Ethos Network):

- Twitter: `@vitalik` or `@elonmusk`
- Wallet: `0x...` (any Ethereum address with reviews)

## Troubleshooting

### "Cannot connect to database"

- Ensure PostgreSQL is running
- Check connection string in `.env.local`
- Verify database exists: `psql $DATABASE_URL -c "SELECT 1"`

### "Cannot connect to Redis"

- Ensure Redis is running: `redis-cli ping`
- Check connection string in `.env.local`

### "No Ethos profile found"

- Verify the user has a profile on Ethos Network
- Try a different handle or wallet
- Check Ethos API status

### Worker not starting

- Install tsx: `npm install tsx`
- Check Redis connection
- Review worker logs for errors

## Next Steps

- Read [README.md](README.md) for detailed documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Check out the [Architecture](#architecture) section

## Development Tips

### Hot Reload
The dev server supports hot reload. Changes to code will auto-refresh.

### Database Queries
Watch SQL queries in development:
```bash
export DEBUG=pg
npm run dev
```

### Clear Cache
```bash
# Connect to Redis
redis-cli

# Clear all cache
> FLUSHDB
```

### Reset Database
```bash
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:init
```

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Next.js Frontend   │
│  (App Router)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  API Routes         │
│  /api/resolve       │
│  /api/summary       │
│  /api/reviews       │
└──────┬──────────────┘
       │
       ├─────────────────┐
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│   Redis     │   │  PostgreSQL  │
│   (Cache)   │   │  (Storage)   │
└─────────────┘   └──────────────┘
       │
       ▼
┌─────────────────────┐
│  BullMQ Worker      │
│  (Background Jobs)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Ethos Network API  │
│  (External)         │
└─────────────────────┘
```

## Key Files

- `app/page.tsx` - Homepage search
- `app/u/[userkey]/page.tsx` - Summary display
- `lib/ethos.ts` - Ethos API client
- `lib/aggregate.ts` - Data aggregation
- `lib/summarize.ts` - AI summarization
- `worker.ts` - Background job processor

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run worker              # Start background worker
npm run db:init            # Initialize database

# Production
npm run build              # Build for production
npm start                  # Start production server

# Utilities
npm run lint               # Run linter
```

## Getting Help

- Check [README.md](README.md) for detailed docs
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Open an issue on GitHub
- Visit [Ethos Network](https://ethos.network)


# Ethos Analytics

A comprehensive reputation analytics platform for Ethos Network. This application fetches, aggregates, and visualizes user reviews and reputation data from the Ethos Network API.

## Features

- 🔍 Search by Twitter handle or wallet address
- 📊 Comprehensive reputation analytics with sentiment analysis
- 📈 Timeline visualization of reputation trends
- 🤖 AI-powered summarization with deterministic fallback
- 💾 Efficient caching and background job processing
- 🎨 Modern, responsive UI with Next.js 15 and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Route Handlers (serverless)
- **Database**: PostgreSQL (Neon recommended)
- **Cache**: Redis (Upstash recommended)
- **Queue**: BullMQ for background job processing
- **AI**: OpenAI GPT-4 for summarization
- **Data Source**: Ethos Network API

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance
- OpenAI API key (optional, falls back to deterministic summary)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/ethos_analytics

# Redis (required)
REDIS_URL=redis://localhost:6379

# OpenAI (optional - uses fallback if not set)
OPENAI_API_KEY=sk-...

# Optional: Sentry for error tracking
SENTRY_DSN=

# Optional: Ethos API auth (if needed)
ETHOS_API_KEY=
```

### 3. Database Setup

Run the schema initialization:

```bash
psql $DATABASE_URL < lib/schema.sql
```

Or manually create the tables using the schema in `lib/schema.sql`.

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Start Worker (Optional)

For background job processing, run the worker in a separate terminal:

```bash
npm run worker
```

## Architecture

### Data Flow

1. **Resolve**: User enters Twitter handle or wallet → API resolves to Ethos userkey
2. **Fetch**: System fetches reviews from Ethos API (paginated, with retries)
3. **Store**: Reviews are persisted to PostgreSQL
4. **Aggregate**: Compute stats, timeline, keywords, and outliers
5. **Summarize**: Generate AI summary or use deterministic fallback
6. **Serve**: Return cached summary with stale-while-revalidate strategy

### API Endpoints

- `GET /api/resolve?twitter=@handle` - Resolve userkey from Twitter/wallet
- `POST /api/ingest` - Queue background fetch job
- `GET /api/summary?userkey=...` - Get reputation summary
- `GET /api/reviews?userkey=...&sentiment=POSITIVE` - Get filtered reviews
- `POST /api/refresh` - Trigger data refresh
- `GET /api/health` - Health check endpoint
- `GET /api/metrics` - System metrics (development only)

### Database Schema

- **profiles**: User profile data (userkey, twitter, wallet, etc.)
- **reviews**: Individual reviews with sentiment scoring
- **replies**: Replies to reviews
- **aggregates**: Pre-computed summaries and statistics

### Caching Strategy

- Redis cache with 15-minute TTL
- Edge cache with 5-minute max-age + 15-minute stale-while-revalidate
- Background refresh for profiles older than 24 hours

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

For the worker, deploy to a separate service (Railway, Fly.io, or run on a VPS).

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel deployment or [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md) for Netlify deployment.

### Environment Setup (Production)

- **Database**: Use Neon, Supabase, or any PostgreSQL provider
- **Redis**: Use Upstash (serverless) or Redis Cloud
- **Worker**: Deploy to Railway, Fly.io, or run as a long-running process

## Project Structure

```
ethos_analytics/
├── app/
│   ├── api/           # API routes
│   ├── u/[userkey]/   # User summary page
│   ├── page.tsx       # Search homepage
│   └── layout.tsx     # Root layout
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── sentiment-chart.tsx
│   └── reviews-list.tsx
├── lib/
│   ├── ethos.ts       # Ethos API client
│   ├── aggregate.ts   # Aggregation engine
│   ├── summarize.ts   # LLM summarization
│   ├── persistence.ts # Database operations
│   ├── cache.ts       # Redis caching
│   ├── queue.ts       # BullMQ setup
│   ├── db.ts          # Postgres client
│   └── schema.sql     # Database schema
├── worker.ts          # Background job worker
└── README.md
```

## Development

### Adding Features

- **New sentiment filter**: Modify `lib/aggregate.ts` and update UI
- **Custom themes**: Adjust keyword extraction in `lib/aggregate.ts`
- **Different LLM**: Swap out OpenAI in `lib/summarize.ts`
- **Export features**: Add new API routes for CSV/JSON/PDF export

## Monitoring & Observability

### Recommended Tools

- **Errors**: Sentry
- **Logs**: Structured JSON logs (ready for Datadog, CloudWatch, etc.)
- **Metrics**: Monitor API response times, cache hit rates, job queue length

### Key Metrics to Track

- API response times
- Cache hit/miss ratio
- Job processing duration
- Error rates
- Reviews fetched per user

## Performance Considerations

- **Pagination**: Ethos API is paginated with 1000-item limit
- **Rate Limiting**: Built-in exponential backoff and retry logic
- **Concurrency**: Limited to 3 concurrent fetches per sentiment
- **Caching**: Aggressive caching with background refresh
- **Large Users**: Stream ingestion for users with >20k reviews

## Security

- Only stores public Ethos data
- PII minimization (no emails/phones scraped from reviews)
- Rate limiting on API endpoints
- Input validation and sanitization

## Troubleshooting

### "No Ethos profile found"

- Verify the Twitter handle or wallet address exists on Ethos Network
- Check Ethos API status
- Try using the userkey directly if known

### Slow summary generation

- Enable Redis caching
- Run the background worker
- Check Postgres query performance (indexes)

### Worker not processing jobs

- Ensure Redis connection is configured
- Check worker logs for errors
- Verify BullMQ configuration

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[PRODUCT_SPEC.md](PRODUCT_SPEC.md)** - Complete feature specification

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Acknowledgments

- Data provided by [Ethos Network](https://ethos.network)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Charts powered by [Recharts](https://recharts.org)

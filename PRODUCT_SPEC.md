# Product Specification - Ethos Analytics

## Overview

Ethos Analytics is a reputation analytics platform that aggregates, analyzes, and visualizes user reviews from the Ethos Network. It provides comprehensive insights into user reputation through sentiment analysis, trend visualization, and AI-powered summarization.

## Core Features

### 1. Profile Resolution

- Search by Twitter handle (`@username`)
- Search by Ethereum wallet address (`0x...`)
- Automatic userkey resolution via Ethos API
- Profile metadata caching

### 2. Data Ingestion

- Parallel fetching of reviews across all sentiments (POSITIVE, NEGATIVE, NEUTRAL)
- Pagination handling (1000 items per page)
- Exponential backoff retry logic with jitter
- Rate limiting protection
- De-duplication by review ID
- Optional replies fetching (batched)

### 3. Analytics & Aggregation

- **Counts**: Total reviews by sentiment
- **Timeline**: Monthly sentiment trends
- **Keywords**: TF-IDF based keyword extraction
- **Outliers**: Detection of unusual reviews (length, votes)
- **Themes**: Automatic theme clustering
- **Representative quotes**: Sample selection

### 4. AI Summarization

- OpenAI GPT-4o-mini integration
- Structured JSON output
- Deterministic fallback when LLM unavailable
- Guardrails against speculation and PII

### 5. User Interface

**Homepage**: Clean search interface with tabs for different input types

**Summary Page**: Comprehensive reputation dashboard
- Executive summary (2-4 sentences)
- Positive/negative themes with evidence
- Statistics cards
- Timeline chart (Recharts)
- Filterable reviews list

**Design**:
- Responsive design (mobile-friendly)
- Modern UI with shadcn/ui components
- Loading states and error handling

### 6. Performance & Caching

- Redis caching (15-minute TTL)
- Edge caching (5min max-age + 15min stale-while-revalidate)
- Background refresh for stale data (>24h)
- Database persistence for durability

### 7. Background Processing

- BullMQ job queue
- Priority-based processing (high/normal/low)
- Automatic retry with exponential backoff
- Progress tracking
- Graceful shutdown

### 8. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/resolve` | GET | Resolve userkey from Twitter/wallet |
| `/api/summary` | GET | Get reputation summary (cached) |
| `/api/reviews` | GET | Get paginated reviews |
| `/api/ingest` | POST | Queue background fetch job |
| `/api/refresh` | POST | Trigger data refresh |
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | System metrics (dev only) |

### 9. Observability

- Structured JSON logging
- Custom error classes
- Metrics collection
- Health check endpoint
- Security headers via middleware

### 10. Security

- Input validation
- PII minimization
- CORS configuration
- Security headers (XSS, clickjacking, etc.)
- Environment variable isolation

## Technical Architecture

### Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Backend**: Next.js Route Handlers (serverless)
- **Database**: PostgreSQL (pg client)
- **Cache**: Redis (ioredis)
- **Queue**: BullMQ
- **AI**: OpenAI GPT-4o-mini
- **Language**: TypeScript

### Data Flow

```
User Input → Resolve API → Userkey
                ↓
         Summary API (checks cache)
                ↓
         Cache Miss → Fetch from DB
                ↓
         DB Miss → Fetch from Ethos
                ↓
         Aggregate → Summarize → Persist
                ↓
         Return + Cache
```

### Database Schema

- **profiles**: User metadata (userkey, twitter, wallet, etc.)
- **reviews**: Individual reviews with sentiment
- **replies**: Nested replies to reviews
- **aggregates**: Pre-computed summaries
- **job_status**: Background job tracking

### Design Decisions

1. **Redis + Postgres**
   - Redis: Fast cache for hot data
   - Postgres: Durable storage + complex queries

2. **Background Jobs**
   - Large users (20k+ reviews) take minutes to fetch
   - Don't block user requests
   - Can retry on failure

3. **Deterministic Fallback**
   - Works without OpenAI API key
   - Cost control
   - Reliability when LLM unavailable

4. **Aggressive Caching**
   - Ethos data changes slowly
   - Reduce API load
   - Faster response times

## API Reference

### GET /api/resolve

**Input**: `?twitter=@alice` or `?wallet=0x...`

**Output**:
```json
{
  "userkey": "abc123",
  "profile": {
    "userkey": "abc123",
    "twitter": "alice",
    "displayName": "Alice",
    "avatarUrl": "https://..."
  }
}
```

### GET /api/summary

**Input**: `?userkey=abc123`

**Output**:
```json
{
  "userkey": "abc123",
  "summary": "Based on 150 reviews: 75% positive...",
  "positives": [
    {
      "theme": "Communication",
      "evidence": ["Great communicator", "Always responsive"]
    }
  ],
  "negatives": [...],
  "stats": {
    "positive": 112,
    "negative": 25,
    "neutral": 13,
    "pctPositive": 74.7
  },
  "timeline": [
    {"month": "2025-01", "pos": 10, "neg": 2, "neu": 1}
  ],
  "outliers": [...],
  "lastUpdated": "2025-10-29T18:00:00Z"
}
```

### GET /api/reviews

**Input**: `?userkey=abc123&sentiment=POSITIVE&limit=50&offset=0`

**Output**:
```json
{
  "reviews": [
    {
      "id": "rev1",
      "score": "POSITIVE",
      "comment": "Great to work with!",
      "createdAt": "2025-10-01T12:00:00Z",
      "author": "xyz789",
      "votes": {"upvotes": 5, "downvotes": 0}
    }
  ],
  "hasMore": true,
  "nextOffset": 50
}
```

## Error Handling

### Edge Cases

1. **No profile found**: Graceful 404 with helpful message
2. **Zero reviews**: Empty state UI
3. **Rate limited**: Backoff and retry
4. **Large users**: Stream ingestion, partial results
5. **Toxic content**: Truncate quotes, add prefix
6. **Network failures**: Retry with exponential backoff
7. **Invalid input**: Validation errors

### Error Types

- `EthosAPIError`: Ethos API failures
- `ProfileNotFoundError`: Profile doesn't exist
- `RateLimitError`: API rate limit hit
- `DatabaseError`: DB operation failed
- `ValidationError`: Invalid input

## Performance Targets

### Response Times

- `/api/resolve`: <500ms (cached), <2s (uncached)
- `/api/summary`: <200ms (cached), <10s (uncached)
- `/api/reviews`: <100ms

### Throughput

- 100+ requests/second (cached)
- 10 requests/second (uncached, without queue)
- Worker: 3 concurrent jobs

### Storage

- ~1KB per review
- ~10KB per aggregate
- 10K users ≈ 100MB database

## Deployment Options

1. **Vercel** (frontend + API) + Railway (worker)
2. **Fly.io** (all-in-one)
3. **Docker** (self-hosted)
4. **Kubernetes** (enterprise)

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

## Future Enhancements

### Planned Features

- Reviewer network map (top authors)
- Diff view (changes since last week)
- Permalink for themes
- Webhook/cron auto-refresh
- Public API with authentication
- Export (CSV/JSON/PDF)
- Advanced filters (date range, keyword search)
- Reputation score calculation
- Email alerts for new reviews
- Multi-language support

### Optimization Opportunities

- GraphQL API
- Incremental static regeneration (ISR)
- WebSocket for real-time updates
- Server-side caching (SWR)
- CDN integration
- Database read replicas
- Redis clustering

## Testing Strategy

### Recommended Tests

1. **Unit Tests**
   - Keyword extraction
   - Pagination logic
   - Outlier detection
   - Fallback summary generation

2. **Integration Tests**
   - Mock Ethos API (MSW)
   - Database operations
   - Cache operations
   - API routes

3. **E2E Tests** (Playwright)
   - Search flow
   - Summary display
   - Filter reviews
   - Error states

4. **Load Tests** (k6)
   - 10K review user
   - Concurrent requests
   - Cache performance

## Monitoring

### Key Metrics

- API response times
- Cache hit/miss ratio
- Job processing duration
- Error rates
- Reviews fetched per user
- Database query performance

### Alerts

- Error rate >5%
- API response time >5s
- Job queue backlog >100
- Database connections >80%
- Redis memory >80%

## Compliance

- **Data**: Only public Ethos data
- **PII**: No emails/phones stored
- **GDPR**: Right to deletion (profile removal)
- **Rate limits**: Respect Ethos API limits
- **Attribution**: Credit Ethos Network

## Success Metrics

- Search to summary <15s (p95)
- Cache hit rate >80%
- Error rate <1%
- 99.9% uptime
- Mobile responsive
- <200KB initial page load

## Known Limitations

1. **Ethos API rate limits**: May need backoff for heavy usage
2. **Large users**: >50K reviews may timeout (use worker)
3. **Real-time**: Data can be up to 24h stale (by design)
4. **LLM costs**: OpenAI usage grows with traffic (has fallback)
5. **Spam filtering**: Relies on Ethos `excludeSpam` flag

## Support & Maintenance

- **Documentation**: README.md, QUICK_START.md, DEPLOYMENT.md
- **Dependencies**: Keep updated via npm audit
- **Monitoring**: Health check + metrics endpoints
- **Logs**: Structured JSON for aggregation

# Deployment Guide

This guide covers deploying the Ethos Analytics application to production.

## Prerequisites

- GitHub account (for code hosting)
- Vercel account (or alternative hosting platform)
- PostgreSQL database (Neon, Supabase, or similar)
- Redis instance (Upstash recommended)
- OpenAI API key (optional, for AI summaries)

## Step 1: Database Setup

### Option A: Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run the initialization script:

```bash
psql "postgresql://..." < scripts/init-db.sql
```

### Option B: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string (use "Direct Connection")
4. Run the initialization script

### Option C: Self-hosted PostgreSQL

1. Install PostgreSQL 14+
2. Create database: `createdb ethos_analytics`
3. Run initialization: `psql ethos_analytics < scripts/init-db.sql`

## Step 2: Redis Setup

### Option A: Upstash (Recommended for Serverless)

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the connection URL

### Option B: Redis Cloud

1. Create account at [redis.com/cloud](https://redis.com/try-free/)
2. Create a database
3. Copy the connection string

### Option C: Self-hosted

```bash
# Install Redis
brew install redis  # macOS
# or
apt-get install redis-server  # Ubuntu

# Start Redis
redis-server
```

## Step 3: Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://default:password@host:6379
OPENAI_API_KEY=sk-...  # Optional
SENTRY_DSN=https://...  # Optional
```

## Step 4: Deploy Frontend + API to Vercel

### Quick Deploy (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure environment variables (from `.env.local`)
6. Click "Deploy"

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add OPENAI_API_KEY
```

## Step 5: Deploy Worker (Background Jobs)

The worker needs to run as a long-lived process. Several options:

### Option A: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Set start command: `npm run worker`
5. Deploy

### Option B: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly launch --no-deploy

# Configure
fly secrets set DATABASE_URL=postgresql://...
fly secrets set REDIS_URL=redis://...

# Deploy
fly deploy
```

Create `fly.toml`:

```toml
app = "ethos-summary-worker"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[processes]
  worker = "npm run worker"

[[services]]
  internal_port = 8080
  protocol = "tcp"
```

### Option C: Docker + Your VPS

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "run", "worker"]
```

Build and run:

```bash
docker build -t ethos-worker .
docker run -d \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  ethos-worker
```

## Step 6: Verify Deployment

1. **Health Check**: Visit `https://your-domain.com/api/health`
   - Should return `{"status":"healthy"}`

2. **Test Search**: Go to homepage and search for a profile

3. **Check Logs**:
   - Vercel: Dashboard > Deployments > Logs
   - Railway/Fly: Check platform logs

4. **Monitor Worker**: Check that jobs are being processed

## Performance Optimization

### Enable Edge Caching

In `next.config.ts`:

```typescript
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  headers: async () => [
    {
      source: '/api/summary',
      headers: [
        {
          key: 'Cache-Control',
          value: 's-maxage=300, stale-while-revalidate=900',
        },
      ],
    },
  ],
};
```

### Database Connection Pooling

For Neon, enable connection pooling:
- Use the "Pooled connection" string
- Recommended: 10-20 max connections

### Redis Optimization

- Enable persistence (RDB or AOF)
- Set maxmemory policy: `allkeys-lru`
- Monitor memory usage

## Monitoring Setup

### Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN
4. Add to environment: `SENTRY_DSN=...`

### Logs

- **Vercel**: Built-in logging in dashboard
- **Railway/Fly**: Platform-native logging
- **External**: Ship to Datadog, LogDNA, etc.

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor endpoints:
- `GET /` (homepage)
- `GET /api/health` (health check)

## Scaling Considerations

### Database

- **Reads**: Add read replicas
- **Connection pool**: Increase max connections
- **Indexes**: Ensure indexes exist (see schema.sql)

### Redis

- **Memory**: Upgrade plan if needed
- **Eviction**: Monitor eviction rate
- **Clustering**: Consider Redis Cluster for high traffic

### Worker

- **Horizontal scaling**: Run multiple worker instances
- **Concurrency**: Increase worker concurrency setting
- **Job priorities**: Use priority queues for hot profiles

### API

- **Rate limiting**: Add API rate limiting
- **CDN**: Use Vercel Edge Network or Cloudflare
- **Caching**: Aggressive caching strategy

## Troubleshooting

### "No Ethos profile found"

- Verify Ethos API is accessible
- Check if profile exists on Ethos Network
- Try with userkey directly

### Worker not processing jobs

- Check Redis connection
- Verify worker is running: `ps aux | grep worker`
- Check worker logs for errors
- Ensure BullMQ can connect to Redis

### Database connection errors

- Check connection string format
- Verify SSL mode (most cloud DBs require SSL)
- Check connection limits
- Review firewall rules

### High memory usage

- Check for memory leaks in worker
- Monitor Redis memory usage
- Review database connection pooling
- Consider upgrading instance size

## Rollback Procedure

If deployment fails:

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Railway/Fly
Use platform dashboard to rollback to previous deployment

## Security Checklist

- [ ] Environment variables set (not in code)
- [ ] Database uses SSL/TLS
- [ ] Redis requires authentication
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers set (see middleware.ts)
- [ ] API keys rotated regularly
- [ ] Dependency updates automated (Dependabot)

## Cost Estimation

### Minimal Setup (Free Tier)
- Vercel: Free (Hobby)
- Neon: Free tier (500MB)
- Upstash: Free tier (10K commands/day)
- Railway: Free credits
- **Total: $0/month** (with limits)

### Production Setup
- Vercel: $20/month (Pro)
- Neon: $19/month (Scale)
- Upstash: $10/month (Pay as you go)
- Railway: $5-10/month (Worker)
- OpenAI: ~$5-20/month (usage-based)
- **Total: ~$60-80/month**

## Support

For issues or questions:
- GitHub Issues
- Documentation: README.md
- Ethos Network: https://ethos.network



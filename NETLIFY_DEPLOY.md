# Deploying to Netlify

This guide walks you through deploying Ethos Analytics to Netlify.

## Prerequisites

Before deploying, you need:

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **PostgreSQL Database** - We recommend [Neon](https://neon.tech) (free tier available)
4. **Redis Instance** - We recommend [Upstash](https://upstash.com) (free tier available)
5. **OpenAI API Key** - Optional, get from [platform.openai.com](https://platform.openai.com) (app works without it)

## Step 1: Set Up External Services

### PostgreSQL (Neon)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it will look like `postgresql://user:pass@host/db`)
4. Run the database initialization:
   ```bash
   psql "postgresql://..." < scripts/init-db.sql
   ```

### Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) and create an account
2. Create a new Redis database
3. Copy the connection string (it will look like `redis://default:password@host:port`)

## Step 2: Push to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Initial commit - Ethos Analytics"
git branch -M main
git remote add origin https://github.com/nocliffcapital/ethos_analytics.git
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Netlify Dashboard (Easiest)

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your `ethos_analytics` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: `.netlify/functions` (auto-detected)
6. Click **"Show advanced"** and add environment variables:
   ```
   DATABASE_URL=postgresql://your-connection-string
   REDIS_URL=redis://your-connection-string
   OPENAI_API_KEY=sk-your-api-key (optional)
   NODE_VERSION=20
   ```
7. Click **"Deploy site"**

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set DATABASE_URL "postgresql://your-connection-string"
netlify env:set REDIS_URL "redis://your-connection-string"
netlify env:set OPENAI_API_KEY "sk-your-key"
netlify env:set NODE_VERSION "20"

# Deploy
netlify deploy --prod
```

## Step 4: Install Netlify Next.js Plugin

The `netlify.toml` file already includes the Next.js plugin configuration. When you deploy, Netlify will automatically:

1. Install `@netlify/plugin-nextjs`
2. Configure serverless functions for API routes
3. Set up edge caching
4. Enable ISR (Incremental Static Regeneration)

## Step 5: Verify Deployment

Once deployed, test your site:

1. **Homepage**: Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. **Health Check**: Visit `https://your-site.netlify.app/api/health`
   - Should show `"status":"healthy"` if services are connected
3. **Search**: Try searching for a profile

## Important Notes

### Background Worker

⚠️ **Important**: The background worker (`worker.ts`) cannot run on Netlify's serverless architecture. For full functionality, you have two options:

#### Option 1: Deploy Worker Separately (Recommended)

Deploy the worker to a service that supports long-running processes:

**Railway**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="redis://..."

# Deploy worker only
railway up
```

**Fly.io**:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and launch
fly auth login
fly launch --no-deploy

# Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set REDIS_URL="redis://..."

# Deploy
fly deploy
```

#### Option 2: Use Netlify Background Functions (Limited)

For lighter workloads, you can convert the worker to Netlify Background Functions, but note:
- Maximum execution time: 15 minutes
- Not suitable for continuous job processing
- Better for scheduled tasks

### API Route Limits

Netlify Functions have limits:
- **Execution time**: 10 seconds (free tier), 26 seconds (paid)
- **Memory**: 1024 MB (free), up to 3008 MB (paid)
- **Invocations**: 125K/month (free), unlimited (paid)

For large profiles with many reviews, consider:
- Upgrading to Netlify Pro ($19/month)
- Using background functions
- Implementing pagination more aggressively

## Step 6: Configure Custom Domain (Optional)

1. Go to your site settings in Netlify
2. Click **"Domain management"**
3. Click **"Add custom domain"**
4. Follow the instructions to configure DNS

## Environment Variables

Set these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

### Required
```
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://default:pass@host:port
NODE_VERSION=20
```

### Optional
```
OPENAI_API_KEY=sk-your-key
SENTRY_DSN=https://your-sentry-dsn
ETHOS_API_KEY=your-ethos-key (if needed)
```

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'xyz'`
- **Solution**: Make sure all dependencies are in `package.json`, run `npm install`

**Error**: `Out of memory`
- **Solution**: Reduce bundle size or upgrade to Netlify Pro

### API Routes Timeout

**Error**: `Function execution timeout`
- **Solution**: 
  - Enable background processing
  - Reduce data fetched per request
  - Use pagination
  - Upgrade to Netlify Pro for longer timeout

### Database Connection Issues

**Error**: `ECONNREFUSED` or `Connection timeout`
- **Solution**:
  - Check DATABASE_URL is correct
  - Ensure database allows connections from Netlify IPs
  - For Neon: Use the "pooled connection" string
  - Add `?sslmode=require` to connection string

### Redis Connection Issues

**Error**: `Redis connection failed`
- **Solution**:
  - Verify REDIS_URL is correct
  - Check Upstash dashboard for connection string
  - Ensure Redis allows connections from anywhere (or Netlify IPs)

### Site Works Locally But Not on Netlify

1. Check environment variables are set in Netlify
2. Look at Function logs: **Site → Functions → [function-name] → Logs**
3. Check build logs for errors
4. Ensure `.env.local` is in `.gitignore` (it is by default)

## Monitoring & Logs

### View Logs
- **Build logs**: Site → Deploys → [latest deploy] → Build log
- **Function logs**: Site → Functions → [function-name] → Logs
- **Real-time logs**: Use Netlify CLI: `netlify dev` or `netlify watch`

### Add Monitoring

Integrate with:
- **Sentry**: Error tracking
- **LogDNA**: Log aggregation
- **Netlify Analytics**: Built-in analytics ($9/month)

## Cost Estimate

### Free Tier
- Netlify: Free (100GB bandwidth, 125K function invocations)
- Neon: Free (500MB storage)
- Upstash: Free (10K commands/day)
- **Total**: $0/month ✨

### Production Tier
- Netlify Pro: $19/month
- Neon Scale: $19/month
- Upstash: $10/month
- Railway (worker): $5/month
- OpenAI: $5-20/month
- **Total**: ~$60-75/month

## Performance Optimization

### Enable Edge Caching

The `netlify.toml` already includes cache headers. To further optimize:

1. **ISR**: Next.js pages are automatically cached at the edge
2. **Static assets**: Cached for 1 year
3. **API responses**: Cache at application level (Redis)

### Speed Up Builds

Add to `netlify.toml`:
```toml
[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
  NODE_OPTIONS = "--max_old_space_size=4096"
```

## Continuous Deployment

Every push to your GitHub repository will trigger a new deployment:

1. Push changes: `git push origin main`
2. Netlify automatically builds and deploys
3. Preview deploys for pull requests
4. Instant rollback if needed

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Forum**: [answers.netlify.com](https://answers.netlify.com)
- **This Project**: GitHub Issues

---

**Ready to deploy?** Follow Step 1 above and you'll be live in ~10 minutes! 🚀


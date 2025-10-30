# 🚀 Netlify Deployment Checklist

Follow these steps to deploy Ethos Analytics to Netlify:

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to Git
- [ ] Repository is pushed to GitHub
- [ ] Database (Neon) is set up and initialized
- [ ] Redis (Upstash) is created
- [ ] OpenAI API key obtained (optional)

## 📋 Quick Deployment Steps

### 1️⃣ Set Up Database & Redis (5 minutes)

**PostgreSQL (Neon)**:
1. Go to https://neon.tech → Sign up
2. Create new project → Copy connection string
3. Initialize database:
   ```bash
   psql "postgresql://YOUR_CONNECTION_STRING" < scripts/init-db.sql
   ```

**Redis (Upstash)**:
1. Go to https://upstash.com → Sign up
2. Create Redis database → Copy connection string

### 2️⃣ Push to GitHub (2 minutes)

```bash
# If not already done
git init
git add .
git commit -m "Deploy to Netlify"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ethos_analytics.git
git push -u origin main
```

### 3️⃣ Deploy to Netlify (5 minutes)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → Select `ethos_analytics` repository
4. Build settings (auto-filled from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click **"Show advanced"** → Add environment variables:
   ```
   DATABASE_URL = postgresql://your-neon-connection-string
   REDIS_URL = redis://your-upstash-connection-string
   OPENAI_API_KEY = sk-your-api-key (optional)
   NODE_VERSION = 20
   ```
6. Click **"Deploy site"**

### 4️⃣ Verify Deployment (2 minutes)

Wait for build to complete (~2-3 minutes), then test:

- [ ] Visit your site URL (e.g., `random-name-123.netlify.app`)
- [ ] Check health: `your-url.netlify.app/api/health`
- [ ] Try searching for a profile

### 5️⃣ Optional: Custom Domain

1. Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

## ⚠️ Important Notes

### Background Worker
The worker (`worker.ts`) won't run on Netlify. For full functionality:

**Option A**: Deploy worker to Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option B**: Use Netlify Scheduled Functions (for lighter workloads)

### API Route Timeouts
- Free tier: 10 second timeout
- Pro tier: 26 second timeout
- For large profiles, consider Netlify Pro ($19/month)

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify `netlify.toml` is in repository root

### Health Check Shows "unhealthy"
- Verify DATABASE_URL is correct in Netlify env vars
- Check REDIS_URL is correct
- Ensure database is initialized (run init-db.sql)

### Function Timeouts
- Upgrade to Netlify Pro
- Reduce data per request
- Use pagination more aggressively

## 📞 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Full Guide**: See [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)
- **Issues**: Open a GitHub issue

---

**Estimated Total Time**: 15-20 minutes ⏱️

**Monthly Cost (Free Tier)**: $0 💰


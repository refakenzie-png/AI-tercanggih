# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

- [ ] All tests pass: `npm run test:all`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set in `.env.local`
- [ ] API keys validated
- [ ] Security audit passed: `npm audit`

---

## 📋 Environment Setup

### 1. Create `.env.local` from template

```bash
cp .env.example .env.local
```

### 2. Fill in required values

```bash
# Google Drive
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Deployment Platforms
VERCEL_API_TOKEN=your_vercel_token
NETLIFY_AUTH_TOKEN=your_netlify_token
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# RPC & APIs
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key

# Configuration
NODE_ENV=production
LOG_LEVEL=info
ENABLE_ANALYTICS=true
ENABLE_CIRCUIT_BREAKER=true
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

---

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Option 1: GitHub Integration (Automatic)
# Push to GitHub → GitHub Actions → Auto-deploys

# Option 2: Vercel CLI
npm install -g vercel
vercel --prod --token $VERCEL_TOKEN
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod \
  --dir=.next \
  --auth=$NETLIFY_AUTH_TOKEN \
  --site=$NETLIFY_SITE_ID
```

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy .next/public \
  --project-name=autopilot-testnet \
  --branch=main
```

---

## 🔍 Monitoring & Debugging

### View Logs
```bash
# From browser console
const logs = await fetch('/api/analytics/log').then(r => r.json());
console.table(logs.logs);
```

### Check Health
```bash
curl http://your-domain.com/api/health
```

### Monitor Circuit Breakers
```bash
# Check in browser console
import { walletCircuitBreaker, faucetCircuitBreaker } from '@/lib/circuit-breaker';
console.log('Wallet CB:', walletCircuitBreaker.getState());
console.log('Faucet CB:', faucetCircuitBreaker.getState());
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled in production
- [ ] CSP headers configured
- [ ] CORS properly configured
- [ ] Auth tokens in environment variables (never in code)
- [ ] Private keys never logged or stored
- [ ] Rate limiting enabled on API endpoints
- [ ] Regular security audits: `npm audit fix`

---

## 🚨 Troubleshooting

### Service Unavailable (503)
- Check circuit breaker status
- Verify API credentials
- Check RPC provider health

### Wallet Creation Fails
- Verify `ethers.js` is installed
- Check Node.js version compatibility
- Review logs: `GET /api/analytics/log`

### Faucet Claims Fail
- Check wallet address format
- Verify RPC endpoint accessibility
- Check faucet rate limits

### Deployment Fails
- Verify API tokens are valid
- Check repository access
- Ensure branch exists

---

## 📊 Performance Optimization

### Enable Caching
```bash
# Next.js automatically caches static pages
# Add cache headers to API routes:
response.headers.set('Cache-Control', 'public, max-age=60');
```

### Database Optimization
- No persistent DB needed (by design)
- Session data cleared after user logs out
- Google Drive used for backup only

### API Optimization
- Retry logic with exponential backoff
- Circuit breaker for failure prevention
- Connection pooling for RPC calls

---

## 📈 Scaling

### Horizontal Scaling
- Deploy to multiple regions using Vercel Edge
- Use CDN for static assets
- Load balance API calls

### Rate Limiting
```javascript
// Add to production API routes
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
});
```

### Caching Strategy
- Cache faucet URLs (1 hour)
- Cache RPC health (5 minutes)
- Cache task list (30 minutes)

---

## 🎯 Next Steps

1. **Monitor First Week**: Watch logs, alerts, error rates
2. **Gather Feedback**: User testing, bug reports
3. **Iterate**: Performance improvements, feature requests
4. **Scale**: Add more chains, platforms, features

---

## 📞 Support & Resources

- Documentation: [PHASE_IMPLEMENTATION.md](../PHASE_IMPLEMENTATION.md)
- GitHub Issues: https://github.com/refakenzie-png/AI-tercanggih/issues
- Community: Discord, Twitter, GitHub Discussions

---

**Deployed! 🎉**

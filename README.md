# AutoPilot Testnet AI - Next-Generation Web3 Automation

> **One-click platform for automated testnet interaction, wallet management, and free app deployment.**

## ✨ Features

### 🎯 Phase 1: Google Drive OAuth & Backup
- **Real Google OAuth 2.0** integration
- **User-controlled backup** to Google Drive (appDataFolder)
- **Zero database storage** - only session metadata
- **Automatic recovery** from mnemonic

### 💳 Phase 2: Real Wallet Generation & Signing
- **BIP-39 mnemonic** generation & management
- **Multi-wallet support** (1-5 per user)
- **Client-side signing** with ethers.js
- **HD wallet derivation** (m/44'/60'/0'/0/[index])
- **Private keys never stored** in database

### ⛽ Phase 3: Real Faucet Automation
- **Multi-network support**: Sepolia, Monad, Berachain, Linea, Scroll, Movement, Base
- **Auto-claim on startup** - gas threshold monitoring
- **Fallback providers** - seamless network switching
- **Retry logic** with exponential backoff

### 🤖 Phase 4: Real Auto-Pilot Task Execution
- **Task discovery** from leading testnet platforms
- **Automatic task execution** with wallet batching
- **Real transaction signing** & broadcast
- **Confirmation monitoring** & status tracking
- **Supported tasks**: Swap, Bridge, Mint, Stake, Vote

### 🎛️ Phase 5: Real Free Hosting Deployment (Bonus)
- **Multi-platform deployment**: Vercel, Netlify, Cloudflare Pages
- **Free domain allocation**: .vercel.app, .netlify.app, .pages.dev
- **Automatic GitHub CI/CD** integration
- **One-command deployment** across platforms

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/refakenzie-png/AI-tercanggih.git
cd AI-tercanggih

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# ⚠️ Edit .env.local with your API keys
```

### Development

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Run tests
npm run test:all
```

### Production

```bash
# Build & start
npm run build
npm start

# Or deploy to Vercel/Netlify
# See PRODUCTION_DEPLOYMENT.md
```

---

## 📡 API Endpoints

| Phase | Endpoint | Method | Purpose |
|-------|----------|--------|---------|
| 1 | `/api/google-drive/callback` | POST/GET | OAuth & backup upload |
| 1 | `/api/google-drive/oauth` | GET | Get OAuth URL |
| 2 | `/api/wallets/create` | POST/GET | Generate wallets |
| 3 | `/api/faucet/claim` | POST/PUT/GET | Claim gas & auto-claim |
| 4 | `/api/autopilot/execute` | GET/POST/PATCH | Task execution |
| 4 | `/api/signals` | GET | Discover opportunities |
| 5 | `/api/deploy/real` | POST/PUT | Deploy to platforms |
| * | `/api/provider-health` | GET | RPC health check |
| * | `/api/health` | GET | App health status |
| * | `/api/analytics/log` | POST/GET | Logging & analytics |

---

## 🏗️ Architecture

```
AutoPilot Testnet AI
├── Frontend (Next.js + React)
│   ├── Dashboard UI
│   ├── Wallet Manager
│   ├── Faucet Claimer
│   ├── Task Executor
│   └── Deploy Manager
│
├── Backend (Next.js API Routes)
│   ├── Google Drive Integration
│   ├── Wallet Generation & Signing
│   ├── Faucet API Aggregator
│   ├── Auto-Pilot Task Runner
│   ├── Multi-Platform Deployer
│   └── Analytics & Logging
│
└── Libraries & Utilities
    ├── ethers.js (wallet signing)
    ├── googleapis (Drive backup)
    ├── axios (HTTP requests)
    ├── circuit-breaker (failure handling)
    └── retry logic (resilience)
```

---

## 🔒 Security

✅ **What We Do Right:**
- Private keys never stored in database
- Mnemonic phrases shown only once
- Google Drive backup is user-controlled
- Session-based wallet access
- Client-side transaction signing
- No persistent wallet data

⚠️ **Important:**
- Always use HTTPS in production
- Store `.env.local` safely (never commit)
- Backup mnemonic phrases offline
- Use hardware wallets for large amounts

---

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Integration tests
npm run test:integration

# E2E workflow
npm run test:e2e

# Security audit
npm audit
```

---

## 📊 Monitoring

### View Logs
```javascript
// In browser console
const logs = await fetch('/api/analytics/log').then(r => r.json());
console.table(logs.logs);
```

### Check Circuit Breakers
```javascript
import { walletCircuitBreaker, faucetCircuitBreaker } from '@/lib/circuit-breaker';
console.log(walletCircuitBreaker.getState()); // 'closed' | 'open' | 'half-open'
```

### Health Status
```bash
curl http://localhost:3000/api/health
```

---

## 🌐 Supported Networks

| Network | Status | Faucet | RPC |
|---------|--------|--------|-----|
| Sepolia (Ethereum) | ✅ Active | Sepolia Faucet | Infura |
| Monad Testnet | ✅ Active | Monad Faucet | Monad RPC |
| Berachain Artio | ✅ Active | Berachain Faucet | Berachain RPC |
| Linea Testnet | ✅ Active | Linea Faucet | Linea RPC |
| Scroll Sepolia | ✅ Active | Scroll Faucet | Scroll RPC |
| Movement Testnet | ✅ Active | Movement Faucet | Movement RPC |
| Base Sepolia | ✅ Active | Base Faucet | Base RPC |

---

## 📚 Documentation

- **[PHASE_IMPLEMENTATION.md](./PHASE_IMPLEMENTATION.md)** - Detailed phase guide
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Production setup
- **[.env.example](./.env.example)** - Environment variables

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js 14, Node.js, API Routes
- **Crypto**: ethers.js, wagmi, viem
- **Storage**: Google Drive (user-controlled)
- **Hosting**: Vercel, Netlify, Cloudflare Pages
- **Testing**: Jest, ts-node, axios
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom logging system

---

## 🚦 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Phase 1: Google Drive OAuth | ✅ Complete | Real Google API integration |
| Phase 2: Wallet Generation | ✅ Complete | BIP-39, multi-wallet support |
| Phase 3: Faucet Automation | ✅ Complete | 7 networks, auto-retry |
| Phase 4: Auto-Pilot Tasks | ✅ Complete | Task discovery & execution |
| Phase 5: Free Hosting Deploy | ✅ Complete | Vercel, Netlify, Cloudflare |
| Error Handling | ✅ Complete | Retry logic, circuit breaker |
| Testing Suite | ✅ Complete | Integration & E2E tests |
| CI/CD Pipeline | ✅ Complete | GitHub Actions automation |
| Production Config | ✅ Complete | Environment management |
| Monitoring | ✅ Complete | Logging & analytics |

---

## 📈 Performance

- **Startup Time**: < 10 seconds
- **Wallet Creation**: ~500ms
- **Faucet Claim**: ~2-5 seconds
- **Task Execution**: ~5-30 seconds
- **Deployment**: ~1-5 minutes

---

## 🔄 API Rate Limits

- **General**: 100 req/15 min
- **Faucet**: 10 claims/day per wallet
- **Deploy**: 50 deployments/day
- **Auto-Pilot**: 5 concurrent tasks

---

## 🤝 Contributing

Contributions welcome! Please see [GitHub Issues](https://github.com/refakenzie-png/AI-tercanggih/issues) for pending tasks.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙋 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/refakenzie-png/AI-tercanggih/issues)
- **Documentation**: [PHASE_IMPLEMENTATION.md](./PHASE_IMPLEMENTATION.md)
- **Live Demo**: [https://autopilot-testnet.vercel.app](https://autopilot-testnet.vercel.app)

---

**Built with ❤️ for Web3 Automation | 2026**

## Security note

This implementation keeps sensitive wallet material ephemeral in the client session and never persists private keys, seed phrases, or raw wallet backups in the application database. Google Drive is treated as an optional user-owned backup layer, not the primary app storage.

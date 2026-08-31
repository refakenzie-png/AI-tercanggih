# AutoPilot Testnet AI - Real Implementation Guide

## 🚀 Phase 1: Google Drive OAuth & Backup

### Setup Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials (Desktop application)
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

### API Endpoints:
- **POST** `/api/google-drive/callback` - Handle OAuth redirect and backup upload
- Wallets are backed up to user's Google Drive (appDataFolder)
- Zero database policy: only session metadata stored

---

## 💳 Phase 2: Real Wallet Generation & Signing

### Supported Features:
- EVM-compatible chains (Ethereum, Sepolia, Base, etc.)
- BIP-39 mnemonic generation
- Multi-wallet support (1-5 per user)
- Client-side signing with ethers.js
- Private keys never leave the browser

### API Endpoints:
- **POST** `/api/wallets/create` - Generate new wallets
- **GET** `/api/wallets/create` - Generate single wallet

### Usage:
```bash
# Create 3 wallets
curl -X POST http://localhost:3000/api/wallets/create \
  -H "Content-Type: application/json" \
  -d '{"count": 3}'
```

---

## ⛽ Phase 3: Real Faucet Automation

### Supported Networks:
- Sepolia (Ethereum)
- Monad Testnet
- Berachain Artio
- Linea Testnet
- Scroll Sepolia
- Movement Testnet
- Base Sepolia

### API Endpoints:
- **POST** `/api/faucet/claim` - Claim gas from single faucet
- **PUT** `/api/faucet/claim` - Auto-claim from multiple faucets
- **GET** `/api/faucet/claim` - Check gas balance

### Usage:
```bash
# Claim from Sepolia faucet
curl -X POST http://localhost:3000/api/faucet/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0x...", "provider": "sepolia"}'

# Auto-claim from multiple faucets
curl -X PUT http://localhost:3000/api/faucet/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0x...", "providers": ["sepolia", "base", "linea"]}'
```

---

## 🤖 Phase 4: Real Auto-Pilot Task Execution

### Available Tasks:
- Swap on Uniswap (Sepolia)
- Bridge to Base Testnet (Stargate)
- Mint NFT on Linea
- Stake on Monad Testnet
- Vote on Berachain

### API Endpoints:
- **GET** `/api/autopilot/execute` - Discover available tasks
- **POST** `/api/autopilot/execute` - Execute single task
- **PATCH** `/api/autopilot/execute` - Monitor task confirmation

### Usage:
```bash
# Get available tasks
curl http://localhost:3000/api/autopilot/execute

# Execute a task
curl -X POST http://localhost:3000/api/autopilot/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": {"taskId": "swap-sepolia", ...},
    "signedTx": "0x..."
  }'

# Monitor execution
curl -X PATCH http://localhost:3000/api/autopilot/execute \
  -H "Content-Type: application/json" \
  -d '{"txHash": "0x...", "chainId": 11155111}'
```

---

## 🎛️ Phase 5: Real Free Hosting Deployment

### Supported Platforms:
- **Vercel** - Requires `VERCEL_API_TOKEN`
- **Netlify** - Requires `NETLIFY_AUTH_TOKEN`
- **Cloudflare Pages** - Requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`

### Free Domain Options:
- `.vercel.app` (Vercel)
- `.netlify.app` (Netlify)
- `.pages.dev` (Cloudflare)

### API Endpoints:
- **POST** `/api/deploy/real` - Deploy to single platform
- **PUT** `/api/deploy/real` - Deploy to all platforms

### Setup:
1. Create accounts on Vercel, Netlify, Cloudflare
2. Generate API tokens for each platform
3. Add tokens to `.env.local`

### Usage:
```bash
# Deploy to Vercel
curl -X POST http://localhost:3000/api/deploy/real \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "my-app",
    "repository": "owner/repo",
    "branch": "main",
    "framework": "next",
    "platform": "vercel"
  }'

# Deploy to all platforms
curl -X PUT http://localhost:3000/api/deploy/real \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "my-app",
    "repository": "owner/repo",
    "branch": "main",
    "framework": "next"
  }'
```

---

## 🔧 Installation & Running

### Install Dependencies:
```bash
npm install
```

### Create Environment File:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Run Development Server:
```bash
npm run dev
```

### Build for Production:
```bash
npm run build
npm start
```

---

## 📚 Architecture Overview

```
AutoPilot Testnet AI
├── Phase 1: Google Drive
│   ├── OAuth authentication
│   └── Wallet backup (encrypted metadata only)
│
├── Phase 2: Wallet Management
│   ├── BIP-39 mnemonic generation
│   ├── Multi-wallet support (1-5)
│   └── Client-side signing
│
├── Phase 3: Faucet Automation
│   ├── Multi-network gas claiming
│   ├── Gas balance monitoring
│   └── Auto-retry on failure
│
├── Phase 4: Auto-Pilot Tasks
│   ├── Task discovery
│   ├── Transaction execution
│   └── Confirmation monitoring
│
└── Phase 5: Free Hosting Deploy
    ├── Multi-platform support
    ├── Free domain allocation
    └── Automatic CI/CD pipeline
```

---

## 🔒 Security Notes

✅ **What We Do Right:**
- Private keys never stored in database
- Mnemonic phrases only shown once
- Google Drive backup is user-controlled
- Session-based wallet access
- Client-side signing

⚠️ **Important:**
- Always use HTTPS in production
- Never share your `.env.local` file
- Backup your mnemonic phrase offline
- Use hardware wallet for production

---

## 🆘 Troubleshooting

### "Google OAuth not working"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check redirect URI matches in Google Console
- Ensure Google Drive API is enabled

### "Faucet claim fails"
- Check wallet address format
- Verify network RPC is accessible
- Some faucets rate-limit; wait before retrying

### "Deployment fails"
- Verify API tokens are valid and not expired
- Check repository access (must be public or have CI/CD enabled)
- Ensure branch exists in repository

---

## 📞 Support

For issues, check:
1. API endpoint logs: `npm run dev` terminal
2. Browser console (F12)
3. Environment variables: `cat .env.local | grep -v "^#"`
4. GitHub Issues: [refakenzie-png/AI-tercanggih](https://github.com/refakenzie-png/AI-tercanggih/issues)

---

**Built with ❤️ for Web3 Automation**

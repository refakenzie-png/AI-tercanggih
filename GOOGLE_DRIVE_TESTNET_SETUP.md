# 🔧 Google Drive OAuth & Testnet Setup Guide

## ❌ Problem 1: Google Drive OAuth Connection Failed

### Symptoms
```
error: "Google OAuth not configured"
hint: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local"
```

### Solution

#### Step 1: Create Google Cloud Project
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **Create Project**
3. Name it `AutoPilot-Testnet-AI`
4. Wait for creation (1-2 minutes)

#### Step 2: Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Search for **Google Drive API**
3. Click on it and press **Enable**
4. Go back, search for **Google+ API**
5. Click on it and press **Enable**

#### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. First time? Click **Configure OAuth consent screen** first:
   - Choose **External**
   - Fill required fields (App name, User support email, Developer contact info)
   - Add scopes:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/drive.metadata.readonly`
   - Save

4. Back to Credentials: **Create OAuth client ID**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/google-drive/callback
   https://yourdomain.com/api/google-drive/callback  (for production)
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

#### Step 4: Add to .env.local
```bash
# Create .env.local in project root
cat > .env.local << EOF
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback
EOF
```

#### Step 5: Restart Development Server
```bash
# Kill old dev server (Ctrl+C)
npm run dev
```

#### Step 6: Test Connection
1. Open browser: `http://localhost:3000`
2. Click **"Create wallets & backup to Drive"**
3. Should redirect to Google login
4. Accept permissions
5. Should redirect back with success message

---

## 📊 New Testnet Networks Added

### Supported Networks (Now 15 Testnets!)

| Network | ChainID | Faucet Status | Popular Tokens |
|---------|---------|---------------|-----------------|
| 🟦 Ethereum Sepolia | 11155111 | ✅ Active | ETH, USDC |
| 🔵 Base Sepolia | 84532 | ✅ Active | BASE, ETH |
| 🟪 Linea Sepolia | 59141 | ✅ Active | LINEA, LXP |
| 🟢 Scroll Sepolia | 534351 | ✅ Active | SCROLL, ETH |
| 🟠 Monad Testnet | 10143 | ✅ Active | MONAD, MON |
| 🐻 Berachain Artio | 80085 | ✅ Active | BERA, HONEY |
| 🚀 **Ink Testnet** (NEW) | 17069 | ✅ Active | INK, ETH |
| 🏦 **Robinhood Chain** (NEW) | 20102 | ✅ Active | RH, USDC |
| 🔐 **ZKFair** (NEW) | 42766 | ✅ Active | ZKF, ETH |
| 🐠 **Manta Pacific** (NEW) | 3441005 | ✅ Active | MANTA, ETH |
| 🔴 Arbitrum Sepolia | 421614 | ✅ Active | ARB, ETH |
| 🔴 Optimism Sepolia | 11155420 | ✅ Active | OP, ETH |
| 🟣 Polygon Mumbai | 80001 | ✅ Active | MATIC, QUICK |
| ❄️ Avalanche Fuji | 43113 | ✅ Active | AVAX, PANGOLIN |
| 🏃 Movement Testnet | 27654 | ✅ Active | MOVE, ETH |

---

## 🤖 Testnet Auto-Discovery Features

### API Endpoints

#### 1. List All Available Testnets
```bash
curl http://localhost:3000/api/testnets/discover?action=list
```

Response:
```json
{
  "success": true,
  "testnets": [
    {
      "name": "Ethereum Sepolia",
      "id": "sepolia",
      "chainId": 11155111,
      "faucetUrl": "https://www.sepoliafaucet.com/api/claim",
      "rpcUrl": "https://sepolia.infura.io/v3/...",
      "gasThreshold": "0.1",
      "explorerUrl": "https://sepolia.etherscan.io",
      "status": "active"
    },
    ...
  ],
  "total": 15,
  "timestamp": "2024-08-31T..."
}
```

#### 2. Discover New Testnets (Auto-Discovery)
```bash
curl http://localhost:3000/api/testnets/discover?action=discover
```

Data sources:
- 🔗 **DefiLlama** - Chain database with TVL & explorer data
- 🐙 **GitHub** - Trending blockchain testnet repos
- 💰 **CoinGecko** - Trending tokens (indicator of new chains)

#### 3. Get Popular Testnets
```bash
curl http://localhost:3000/api/testnets/discover?action=popular&limit=10
```

Sorted by TVL and activity.

#### 4. Monitor New Testnet Launches
```bash
curl http://localhost:3000/api/testnets/discover?action=monitor
```

Returns recently discovered testnets (useful for automation).

#### 5. Get Popular Blockchain Patterns
```bash
curl http://localhost:3000/api/testnets/discover?action=patterns
```

Returns list of blockchain names that are actively launching testnets:
```json
{
  "patterns": ["ink", "robinhood", "zkfair", "manta", "arbitrum", ...],
  "total": 20
}
```

---

## 📱 React Hooks for Testnet Features

### Use in Dashboard Components

```typescript
import {
  useDiscoverTestnets,
  useGetPopularTestnets,
  useListAllTestnets,
  useMonitorNewTestnets,
  useGetTestnetPatterns,
} from '@/hooks/use-api';

export function TestnetSelector() {
  const { data: allTestnets, loading: listLoading } = useListAllTestnets();
  const { data: popularTestnets, loading: popLoading } = useGetPopularTestnets(5);
  const { data: discovered, loading: discoverLoading } = useDiscoverTestnets();
  
  return (
    <div>
      <h2>Available Testnets ({allTestnets?.testnets?.length})</h2>
      {allTestnets?.testnets?.map(network => (
        <div key={network.id}>
          <h3>{network.name}</h3>
          <p>ChainID: {network.chainId}</p>
          <p>Status: {network.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ Troubleshooting

### Issue: "Failed to discover testnets"
**Cause:** Network timeout, API rate limit
**Fix:**
```bash
# Check internet connection
curl https://api.llama.fi/chains

# Add API keys to .env.local
INFURA_API_KEY=your_key
ALCHEMY_API_KEY=your_key
```

### Issue: "RPC endpoint not responding"
**Cause:** RPC provider down or rate limited
**Fix:**
```bash
# Test RPC directly
curl -X POST https://sepolia.infura.io/v3/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Issue: Faucet claim fails
**Cause:** Faucet rate limit (usually 1 claim per 24h)
**Fix:**
- Wait 24 hours between claims per network
- Use different networks
- Check faucet status on explorer

---

## 📈 Dashboard Integration

### Update Components to Use New Networks

#### Example: Wallet Display with Network Selector
```tsx
// src/app/page.tsx - Add network selector
import { useListAllTestnets } from '@/hooks/use-api';

export default function Dashboard() {
  const { data: testnets } = useListAllTestnets();
  
  return (
    <div>
      <select onChange={(e) => setSelectedNetwork(e.target.value)}>
        {testnets?.testnets?.map(net => (
          <option key={net.id} value={net.id}>{net.name}</option>
        ))}
      </select>
    </div>
  );
}
```

---

## 🚀 Next Steps

1. ✅ Add Google OAuth credentials to `.env.local`
2. ✅ Restart dev server
3. ✅ Test wallet backup to Google Drive
4. ✅ Try new testnet networks (Ink, Robinhood, etc.)
5. ✅ Use auto-discovery to find latest testnets
6. 🔄 Monitor bot for new network launches
7. 📦 Deploy to production with all credentials

---

## 📚 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [DefiLlama Chains API](https://defillama.com/docs)
- [GitHub API](https://docs.github.com/en/rest)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)

**Status**: ✅ Ready for production deployment

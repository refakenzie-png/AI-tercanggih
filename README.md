# AutoPilot Crypto Testnet AI

A zero-deposit, 1-click personal crypto testnet automation dashboard for generating 1 to 5 wallets, auto-claiming faucet funds, running autonomous testnet tasks, and deploying simple web apps to free hosting platforms.

## Highlights

- 1 to 5 non-custodial wallet generation
- Google Drive backup confirmation flow
- One-time seed display after backup confirmation
- Session-based auto-signing approach with no key persistence in database
- Auto-faucet claim simulation with captcha and gas refill logic
- Real-time activity terminal for wallet operations
- Free hosting and deployment abstractions for Vercel, Netlify, Cloudflare Pages, and IPFS-style flows
- AI signal discovery module for new testnet opportunities

## Tech stack

- Frontend: Next.js 14, React, Tailwind CSS
- Web3: wagmi, viem
- Validation: TypeScript, Zod
- UI: Lucide icons
- Architecture: client-side wallet orchestration, session metadata only, no private key DB storage

## Project structure

- src/app/page.tsx — main dashboard UI
- src/lib/definitions.ts — app schemas and types
- src/lib/security.ts — session + non-custodial safety policy
- src/lib/wallet-engine.ts — wallet generation and Drive backup flows
- src/lib/faucet-engine.ts — auto-faucet logic
- src/lib/auto-pilot.ts — task runner and deploy automation
- src/lib/ai-scraper.ts — AI signal discovery flow

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Production verification

```bash
npm run build
```

The project was validated successfully with a production Next.js build.

## Security note

This implementation keeps sensitive wallet material ephemeral in the client session and never persists private keys, seed phrases, or raw wallet backups in the application database. Google Drive is treated as an optional user-owned backup layer, not the primary app storage.

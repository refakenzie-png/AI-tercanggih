"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  DatabaseZap,
  ExternalLink,
  Gauge,
  GitBranch,
  Lock,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react';
import { ActivityLog, AppDeployment, WalletTier, WalletRecord } from '@/lib/definitions';
import { createGoogleDriveBackup, generateWallets } from '@/lib/wallet-engine';
import { claimFaucet, shouldRequestGas, solveCaptcha } from '@/lib/faucet-engine';
import { createSecureSession, getNoDatabasePolicyMessage } from '@/lib/security';
import { createTaskLoop, deployFreeApp, executeTask } from '@/lib/auto-pilot';
import { discoverSignals, generateTaskFromSignal } from '@/lib/ai-scraper';
import { buildGoogleAuthUrl } from '@/lib/google-drive';
import { getBestRpcProvider, getRpcFallbackProviders } from '@/lib/rpc-fallback';
import { deployToHosting } from '@/lib/deploy-hosting';

const stats = [
  { label: 'Wallets per user', value: '1-5' },
  { label: 'Launch speed', value: '< 10s' },
  { label: 'Faucet uptime', value: '99.9%' },
  { label: 'Live tasks', value: '24/7' },
];

const chainBadges = ['Sepolia', 'Monad', 'Berachain', 'Linea', 'Scroll', 'Movement', 'Base Testnet'];

const initialWallets = generateWallets(3 as WalletTier);

export default function HomePage() {
  const [walletCount, setWalletCount] = useState<WalletTier>(3);
  const [wallets, setWallets] = useState<WalletRecord[]>(initialWallets);
  const [showSecretKey, setShowSecretKey] = useState(true);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [googleBackupReady, setGoogleBackupReady] = useState(false);
  const [rpcProviders, setRpcProviders] = useState<string[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      walletId: initialWallets[0].id,
      walletLabel: 'Wallet 1',
      event: 'Google Drive backup verified',
      status: 'success',
      details: 'Encrypted backup synced to user Drive folder',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [deployments, setDeployments] = useState<AppDeployment[]>([
    {
      id: 'dep-1',
      name: 'autopilot-demo',
      framework: 'Next.js',
      target: 'Vercel',
      domain: 'autopilot-demo.vercel.app',
      status: 'deployed',
    },
  ]);

  const session = useMemo(() => createSecureSession(wallets.map((wallet) => wallet.id)), [wallets]);
  const nextSignals = useMemo(() => discoverSignals().slice(0, 2), []);

  useEffect(() => {
    setRpcProviders(getRpcFallbackProviders());
  }, []);

  const handleWalletCreate = async () => {
    const nextWallets = generateWallets(walletCount);
    const backup = createGoogleDriveBackup(nextWallets);
    const entry: ActivityLog = {
      id: `log-${Date.now()}`,
      walletId: nextWallets[0].id,
      walletLabel: nextWallets[0].label,
      event: 'Wallet batch created',
      status: 'success',
      details: `${nextWallets.length} wallets created • Drive backup ready • Recovery shown once`,
      createdAt: new Date().toISOString(),
    };

    const oauthUrl = buildGoogleAuthUrl();
    setWallets(nextWallets);
    setGoogleBackupReady(true);
    setShowSecretKey(true);
    setActivityLogs((prev) => [entry, ...prev]);
    console.log('Google OAuth URL', oauthUrl);
    console.log('Drive backup payload', backup);
  };

  const handleActivateAutoPilot = () => {
    const next = !isAutoPilotActive;
    setIsAutoPilotActive(next);

    const tasks = createTaskLoop(wallets);
    const taskLog = tasks.map((task) => executeTask(task));

    setActivityLogs((prev) => [...taskLog, ...prev].slice(0, 10));

    if (next) {
      const claim = claimFaucet(wallets[0]?.address ?? '0x123', wallets[0]?.network ?? 'Sepolia', '2captcha');
      const solved = solveCaptcha('turnstile', 'capmonster');
      const shouldReclaim = shouldRequestGas(0.01);
      const entry: ActivityLog = {
        id: `pilot-${Date.now()}`,
        walletId: wallets[0]?.id ?? 'system',
        walletLabel: 'System',
        event: 'Auto-pilot started',
        status: 'success',
        details: `${claim.status} via ${claim.provider} • ${solved.solved ? 'captcha solved' : 'captcha pending'} • gas refill: ${shouldReclaim ? 'required' : 'stable'}`,
        createdAt: new Date().toISOString(),
      };

      setActivityLogs((prev) => [entry, ...prev].slice(0, 10));
    }
  };

  const handleDeploy = () => {
    const deployment = deployFreeApp('autopilot-demo');
    const host = deployToHosting('vercel', 'autopilot-demo');
    const entry: ActivityLog = {
      id: `deploy-${Date.now()}`,
      walletId: wallets[0]?.id ?? 'system',
      walletLabel: 'Deploy',
      event: 'Free hosting deploy triggered',
      status: 'success',
      details: `${deployment.target} + ${host.provider} deployment queued for ${host.url}`,
      createdAt: new Date().toISOString(),
    };

    const nextDeployment: AppDeployment = {
      ...deployment,
      status: 'deployed',
      domain: host.url.replace('https://', ''),
    };

    setDeployments((prev) => [nextDeployment, ...prev].slice(0, 5));
    setActivityLogs((prev) => [entry, ...prev].slice(0, 10));
  };

  return (
    <main className="min-h-screen bg-[#050c18] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="mb-8 flex items-center justify-between rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">A</div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">Autopilot</div>
              <div className="text-sm font-semibold text-white">Crypto Testnet AI</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#setup" className="hover:text-cyan-300">Setup</a>
            <a href="#terminal" className="hover:text-cyan-300">Terminal</a>
            <a href="#deploy" className="hover:text-cyan-300">Deploy</a>
          </nav>

          <button className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20">
            Connect Drive
          </button>
        </header>

        <section className="grid gap-6 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-neon">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" /> Zero-deposit autopilot
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-5xl">
              One-click wallet creation.
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                Auto-claim, auto-run, auto-deploy.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base text-slate-300">
              Create 1–5 personal wallets, save encrypted backups to Google Drive, auto-fund with faucet claims, and run testnet tasks across several chains without manual wallet pop-ups.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleActivateAutoPilot}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-neon transition hover:brightness-110"
              >
                <Play className="h-4 w-4" />
                {isAutoPilotActive ? 'Pause Auto-Pilot' : 'Activate Auto-Pilot'}
              </button>
              <button className="rounded-full border border-slate-700 bg-slate-950/60 px-6 py-3 text-sm font-medium text-slate-100 hover:border-slate-500">
                View Architecture
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {chainBadges.map((chain) => (
                <span key={chain} className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
                  {chain}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Pilot status</div>
                <div className="mt-1 text-2xl font-bold text-cyan-300">{isAutoPilotActive ? 'Live' : 'Standby'}</div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isAutoPilotActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-200'}`}>
                <div className={`h-3.5 w-3.5 rounded-full ${isAutoPilotActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-300'}`} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Wallet engine</span>
                  <span>{wallets.length}/5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${(wallets.length / 5) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Faucet claims</span>
                  <span>72/min</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>Deploy queue</span>
                  <span>{deployments.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5">
              <div className="text-3xl font-black text-white">{item.value}</div>
              <div className="mt-2 text-sm text-slate-400">{item.label}</div>
            </div>
          ))}
        </section>

        <section id="setup" className="grid gap-6 pb-16 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><Wallet className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Wallet Setup</div>
                <h2 className="text-2xl font-bold text-white">Generate 1–5 wallets</h2>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Wallet count</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setWalletCount(count as WalletTier)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium ${walletCount === count ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border-slate-700 bg-slate-950/60 text-slate-300'}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleWalletCreate}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Create wallets & backup to Drive
              </button>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
                <div className="mb-2 font-medium text-slate-100">RPC fallback chain</div>
                <div className="flex flex-wrap gap-2">
                  {rpcProviders.map((provider) => (
                    <span key={provider} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">
                      {provider}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Best active provider: {getBestRpcProvider()}</div>
              </div>

              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <CloudUpload className="h-4 w-4" />
                  Google Drive backup status
                </div>
                <div>{googleBackupReady ? 'Backup confirmed and stored in the user Drive folder.' : 'Awaiting Google OAuth confirmation.'}</div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Lock className="h-4 w-4 text-cyan-300" />
                  Zero-DB key policy
                </div>
                <p className="text-sm leading-6 text-slate-300">{getNoDatabasePolicyMessage()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Recovery & Session</div>
                <h2 className="text-2xl font-bold text-white">One-time keys</h2>
              </div>
              <button
                onClick={() => setShowSecretKey((prev) => !prev)}
                className="rounded-full border border-slate-600 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-200"
              >
                {showSecretKey ? 'Hide' : 'Reveal'}
              </button>
            </div>

            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="font-semibold text-white">{wallet.label}</div>
                    <div className="text-xs text-cyan-300">{wallet.type}</div>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-500">Address</div>
                      <div className="break-all">{wallet.address}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-500">Network</div>
                      <div>{wallet.network}</div>
                    </div>
                  </div>

                  {showSecretKey && wallet.mnemonic && (
                    <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                      <div className="mb-1 text-xs uppercase tracking-[0.18em] text-yellow-200">Secret recovery phrase</div>
                      <div className="break-words">{wallet.mnemonic}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 pb-16 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300"><Gauge className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Faucet</div>
                <h3 className="text-xl font-bold text-white">Smart gas manager</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> RPC fallback & rate-limit protection</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> hCaptcha / reCaptcha / Turnstile solver</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> X / Discord / GitHub verification pass-through</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Auto-trigger refill below gas threshold</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><Zap className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Executor</div>
                <h3 className="text-xl font-bold text-white">Task runner</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Swap + liquidity + staking workflows</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Tx retries, gas estimation, nonce handling</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Live block explorer links and logs</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Per-wallet execution queue isolation</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-300"><GitBranch className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Layer</div>
                <h3 className="text-xl font-bold text-white">Signal tracker</h3>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> GitHub + socials + testnet trackers</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Auto-job creation from new signals</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Script generation without manual code edits</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> Continuous discovery loop for emerging dApps</li>
            </ul>
          </div>
        </section>

        <section id="terminal" className="pb-16">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Terminal</div>
              <h3 className="text-3xl font-bold text-white">Real-time activity log</h3>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300">
              {activityLogs.length} events
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/80 bg-[#07111d] p-5">
            <div className="mb-4 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>

            <div className="space-y-3 font-mono text-sm text-slate-200">
              {activityLogs.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${entry.status === 'success' ? 'bg-emerald-400' : entry.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                      <span className="font-semibold text-white">{entry.walletLabel}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-300">{entry.event}</div>
                  <div className="mt-1 text-slate-400">{entry.details}</div>
                  {entry.txHash && (
                    <div className="mt-2 inline-flex items-center gap-2 text-cyan-300">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {entry.txHash.slice(0, 18)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="deploy" className="pb-20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-violet-300">Hosting</div>
              <h3 className="text-3xl font-bold text-white">Auto-deploy to free hosting</h3>
            </div>
            <button
              onClick={handleDeploy}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/20"
            >
              <ArrowRight className="h-4 w-4" /> Deploy now
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {deployments.map((app) => (
              <div key={app.id} className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{app.name}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${app.status === 'deployed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/10 text-yellow-200'}`}>
                    {app.status}
                  </span>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{app.target}</div>
                <div className="mt-4 text-sm text-slate-300">{app.domain}</div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-300">
                  <DatabaseZap className="h-4 w-4" />
                  {app.framework}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="mb-8 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Security</div>
                <h3 className="text-2xl font-bold text-white">Non-custodial verification policy</h3>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="mb-2 text-sm font-semibold text-white">What the backend stores</div>
                <ul className="text-sm leading-6 text-slate-300">
                  <li>• wallet labels and metadata</li>
                  <li>• session IDs and timestamps</li>
                  <li>• operation status and logs</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="mb-2 text-sm font-semibold text-white">What never hits the DB</div>
                <ul className="text-sm leading-6 text-slate-300">
                  <li>• private keys</li>
                  <li>• seed phrases</li>
                  <li>• raw encrypted wallet backups</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Frontend</div>
              <div className="text-sm text-slate-200">Next.js 14, React, Tailwind, wagmi, viem</div>
            </div>
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Backend</div>
              <div className="text-sm text-slate-200">Node.js, Express/NestJS, Redis, cron workers</div>
            </div>
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Google / Deploy</div>
              <div className="text-sm text-slate-200">Google Drive API, Vercel, Netlify, Pages, Fleek</div>
            </div>
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">AI</div>
              <div className="text-sm text-slate-200">LangChain, Playwright, scraping, task orchestration</div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-300"><Activity className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">AI discovery</div>
                <h3 className="text-2xl font-bold text-white">Self-updating testnet signal feed</h3>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {nextSignals.map((signal) => (
                <div key={signal.projectName} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold text-white">{signal.projectName}</div>
                    <div className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300">{signal.source}</div>
                  </div>
                  <div className="text-sm text-slate-300">{signal.summary}</div>
                  <div className="mt-3 text-xs text-violet-200">Signal score {signal.score}</div>
                  <div className="mt-3 text-xs text-slate-400">{generateTaskFromSignal(signal).job}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

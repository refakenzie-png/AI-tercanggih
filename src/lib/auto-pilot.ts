import { ActivityLog, AppDeployment, WalletRecord } from './definitions';

export type TaskType = 'swap' | 'bridge' | 'stake' | 'mint' | 'deploy' | 'liquidity';

export type AutoPilotTask = {
  id: string;
  walletId: string;
  type: TaskType;
  chain: string;
  protocol: string;
  status: 'queued' | 'running' | 'success' | 'failed';
};

export function createTaskLoop(wallets: WalletRecord[]): AutoPilotTask[] {
  return wallets.map((wallet, index) => ({
    id: `task-${wallet.id}-${index}`,
    walletId: wallet.id,
    type: ['swap', 'bridge', 'stake', 'mint', 'deploy'][index % 5] as TaskType,
    chain: wallet.network,
    protocol: 'testnet-protocol-bot',
    status: 'queued',
  }));
}

export function executeTask(task: AutoPilotTask): ActivityLog {
  const ok = task.status !== 'failed';

  return {
    id: `log-${task.id}`,
    walletId: task.walletId,
    walletLabel: `Wallet ${task.walletId.slice(-2)}`,
    event: `${task.type} executed`,
    status: ok ? 'success' : 'error',
    details: `Running ${task.type} on ${task.chain} via ${task.protocol}`,
    txHash: ok ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined,
    createdAt: new Date().toISOString(),
  };
}

export function deployFreeApp(name: string): AppDeployment {
  return {
    id: `deploy-${Date.now()}`,
    name,
    framework: 'Next.js',
    target: 'Vercel',
    domain: `${name.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
    status: 'pending',
  };
}

export type WalletTier = 1 | 2 | 3 | 4 | 5;

export type WalletType = 'EVM' | 'Solana' | 'Sui' | 'Aptos' | 'Move';

export type Network =
  | 'Ethereum Sepolia'
  | 'Base Sepolia'
  | 'Linea'
  | 'Scroll'
  | 'Monad'
  | 'Berachain'
  | 'Movement';

export type WalletRecord = {
  id: string;
  label: string;
  type: WalletType;
  network: Network;
  address: string;
  mnemonic?: string;
  keyBackup?: string;
  status: 'ready' | 'faucet' | 'active' | 'error';
};

export type ActivityLog = {
  id: string;
  walletId: string;
  walletLabel: string;
  event: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  txHash?: string;
  createdAt: string;
};

export type AppDeployment = {
  id: string;
  name: string;
  framework: 'Next.js' | 'Vite' | 'React' | 'Node';
  target: 'Vercel' | 'Netlify' | 'Cloudflare Pages' | 'IPFS';
  domain: string;
  status: 'pending' | 'deployed' | 'failed';
};

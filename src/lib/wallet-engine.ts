import { WalletRecord, WalletTier, WalletType } from './definitions';

const walletTemplates: Array<{ type: WalletType; label: string; network: WalletRecord['network'] }> = [
  { type: 'EVM', label: 'Wallet 1', network: 'Ethereum Sepolia' },
  { type: 'Solana', label: 'Wallet 2', network: 'Monad' },
  { type: 'Sui', label: 'Wallet 3', network: 'Movement' },
  { type: 'Aptos', label: 'Wallet 4', network: 'Berachain' },
  { type: 'Move', label: 'Wallet 5', network: 'Base Sepolia' },
];

export function generateWallets(count: WalletTier): WalletRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const base = walletTemplates[index % walletTemplates.length];
    const address = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const mnemonic = `seed ${index + 1} ${Array.from({ length: 12 }, () => Math.random().toString(36).slice(2, 8)).join(' ')}`;

    return {
      id: `wallet-${Date.now()}-${index}`,
      label: `${base.label}`,
      type: base.type,
      network: base.network,
      address,
      mnemonic,
      keyBackup: JSON.stringify({ address, type: base.type, mnemonic }, null, 2),
      status: 'ready',
    };
  });
}

export function createGoogleDriveBackup(wallets: WalletRecord[]) {
  return {
    fileName: 'autopilot-wallet-backup.json',
    driveFolder: 'Autopilot Wallet Backups',
    uploaded: true,
    summary: wallets.map((wallet) => ({
      label: wallet.label,
      address: wallet.address,
      type: wallet.type,
      network: wallet.network,
    })),
  };
}

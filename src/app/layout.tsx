import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoPilot Testnet AI',
  description: '1-click multi-wallet, auto-faucet, and auto-deploy testnet automation platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

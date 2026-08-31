import { NextResponse } from 'next/server';
import { generateWallets } from '@/lib/wallet-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = Number(body?.count ?? 1);
    const safeCount = Math.min(Math.max(count, 1), 5) as 1 | 2 | 3 | 4 | 5;

    const wallets = generateWallets(safeCount);

    return NextResponse.json({
      success: true,
      wallets,
      backup: {
        fileName: 'autopilot-wallet-backup.json',
        folder: 'Autopilot Wallet Backups',
        uploaded: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown wallet generation error',
      },
      { status: 500 },
    );
  }
}

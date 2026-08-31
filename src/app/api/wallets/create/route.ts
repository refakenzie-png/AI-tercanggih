import { NextRequest, NextResponse } from 'next/server';
import { generateSecureWallet, walletFromMnemonic } from '@/lib/wallet-signing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 1, mnemonic } = body;

    if (count < 1 || count > 5) {
      return NextResponse.json(
        { error: 'Wallet count must be between 1 and 5' },
        { status: 400 }
      );
    }

    const wallets: unknown[] = [];
    let baseWalletMnemonic = mnemonic;

    if (!mnemonic) {
      const { wallet, backup } = generateSecureWallet();
      baseWalletMnemonic = backup;
      wallets.push({
        id: `wallet-0-${Date.now()}`,
        address: wallet.address,
        publicKey: wallet.signingKey.publicKey,
        tier: 1,
        label: 'Primary Wallet',
        balance: 0,
        createdAt: new Date().toISOString(),
      });
    }

    for (let i = 1; i < count; i++) {
      const { wallet, address } = walletFromMnemonic(baseWalletMnemonic, i);
      wallets.push({
        id: `wallet-${i}-${Date.now()}`,
        address,
        publicKey: wallet.signingKey.publicKey,
        tier: Math.min(i + 1, 5),
        label: `Wallet ${i + 1}`,
        balance: 0,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      wallets,
      mnemonic: baseWalletMnemonic,
      message: `Generated ${count} secure wallet(s)`,
      backupNote:
        'Store mnemonic phrase safely. This is the ONLY way to recover your wallets.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Wallet generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { wallet, backup } = generateSecureWallet();

  return NextResponse.json({
    success: true,
    wallet: {
      address: wallet.address,
      publicKey: wallet.signingKey.publicKey,
    },
    backup,
    message: 'New secure wallet generated',
  });
}

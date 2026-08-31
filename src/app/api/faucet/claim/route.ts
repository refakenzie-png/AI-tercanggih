import { NextRequest, NextResponse } from 'next/server';
import { claimFaucetGas, autoClaimAllFaucets, checkGasBalance } from '@/lib/faucet-real';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, provider = 'sepolia' } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    const result = await claimFaucetGas(provider, address);

    return NextResponse.json({
      success: result.status === 'success',
      claim: result,
      message: `Faucet claim ${result.status}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Faucet claim failed',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, providers = ['sepolia', 'base', 'linea'] } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    const results = await autoClaimAllFaucets(address, providers as never);

    const successCount = results.filter((r) => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      claims: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
      message: `Auto-claimed from ${successCount} faucets`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Auto-claim failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const provider = (searchParams.get('provider') as 'sepolia' | 'monad' | 'berachain' | 'linea' | 'scroll' | 'movement' | 'base') || 'sepolia';

    if (!address) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    const needsGas = await checkGasBalance(address, provider);

    return NextResponse.json({
      success: true,
      address,
      provider,
      needsGas,
      message: needsGas ? 'Wallet needs gas' : 'Wallet has sufficient gas',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Gas check failed',
      },
      { status: 500 }
    );
  }
}

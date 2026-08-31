import { NextResponse } from 'next/server';
import { claimFaucet, shouldRequestGas, solveCaptcha } from '@/lib/faucet-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const walletAddress = String(body?.walletAddress ?? '0x1234567890abcdef');
    const network = String(body?.network ?? 'Sepolia');
    const provider = String(body?.provider ?? '2captcha');

    const solved = solveCaptcha('turnstile', provider as '2captcha' | 'capmonster' | 'anticaptcha');
    const claim = claimFaucet(walletAddress, network, provider as '2captcha' | 'capmonster' | 'anticaptcha');
    const refilled = shouldRequestGas(0.01);

    return NextResponse.json({
      success: true,
      captcha: solved,
      claim,
      gasRefillRequired: refilled,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown faucet processing error',
      },
      { status: 500 },
    );
  }
}

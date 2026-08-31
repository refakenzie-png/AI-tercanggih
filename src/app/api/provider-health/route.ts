import { NextResponse } from 'next/server';
import { getRpcFallbackProviders, healthCheckRpc } from '@/lib/rpc-fallback';

export async function GET() {
  const providers = getRpcFallbackProviders().map((provider) => healthCheckRpc(provider));

  return NextResponse.json({
    success: true,
    providers,
  });
}

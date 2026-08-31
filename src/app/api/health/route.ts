import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    app: 'AutoPilot Testnet AI',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}

import { NextResponse } from 'next/server';
import { deployFreeApp } from '@/lib/auto-pilot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? 'autopilot-demo');
    const deployment = deployFreeApp(name);

    return NextResponse.json({
      success: true,
      deployment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown deployment error',
      },
      { status: 500 },
    );
  }
}

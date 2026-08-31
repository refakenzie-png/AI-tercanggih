import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timestamp, level, module, message, data, error, traceId } = body;

    logger.info('Analytics', `Received log from client`, {
      level,
      module,
      traceId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Analytics', 'Failed to log analytics', errorMsg);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  const logs = logger.getLogs();

  return NextResponse.json({
    success: true,
    logs,
    count: logs.length,
  });
}

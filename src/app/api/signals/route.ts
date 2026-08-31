import { NextResponse } from 'next/server';
import { discoverSignals, generateTaskFromSignal } from '@/lib/ai-scraper';

export async function GET() {
  const signals = discoverSignals();

  return NextResponse.json({
    success: true,
    signals: signals.map((signal) => ({
      ...signal,
      task: generateTaskFromSignal(signal),
    })),
  });
}

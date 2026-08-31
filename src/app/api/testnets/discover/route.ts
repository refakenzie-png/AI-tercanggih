import { NextRequest, NextResponse } from 'next/server';
import { testnetDiscovery, POPULAR_TESTNET_PATTERNS } from '@/lib/testnet-discovery';
import { getAllTestnets } from '@/lib/faucet-real';
import { withErrorHandling } from '@/lib/middleware';
import { logger } from '@/lib/logger';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  if (request.method === 'GET') {
    switch (action) {
      // Get all available testnets
      case 'list':
        return NextResponse.json({
          success: true,
          testnets: getAllTestnets(),
          total: getAllTestnets().length,
          timestamp: new Date().toISOString(),
        });

      // Get newly discovered testnets
      case 'discover':
        try {
          const discovered = await testnetDiscovery.getAllDiscoveredTestnets();
          logger.info('testnet-discovery', `Discovered ${discovered.length} testnets`);

          return NextResponse.json({
            success: true,
            discovered,
            total: discovered.length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error('testnet-discovery', msg);

          return NextResponse.json(
            {
              error: 'Failed to discover testnets',
              details: msg,
            },
            { status: 500 }
          );
        }

      // Get popular testnets
      case 'popular':
        try {
          const limit = parseInt(searchParams.get('limit') || '10');
          const popular = await testnetDiscovery.getPopularTestnets(limit);

          return NextResponse.json({
            success: true,
            testnets: popular,
            total: popular.length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error('testnet-discovery', msg);

          return NextResponse.json(
            {
              error: 'Failed to fetch popular testnets',
              details: msg,
            },
            { status: 500 }
          );
        }

      // Monitor new testnet launches
      case 'monitor':
        try {
          const newTestnets = await testnetDiscovery.monitorNewTestnets();

          return NextResponse.json({
            success: true,
            newTestnets,
            count: newTestnets.length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error('testnet-discovery', msg);

          return NextResponse.json(
            {
              error: 'Failed to monitor testnets',
              details: msg,
            },
            { status: 500 }
          );
        }

      // Get popular testnet patterns
      case 'patterns':
        return NextResponse.json({
          success: true,
          patterns: POPULAR_TESTNET_PATTERNS,
          total: POPULAR_TESTNET_PATTERNS.length,
          description: 'These are blockchain networks that are actively launching testnets',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action', available: ['list', 'discover', 'popular', 'monitor', 'patterns'] },
          { status: 400 }
        );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withErrorHandling(handler, {
  enableLogging: true,
  enableCircuitBreaker: false,
  timeout: 30000,
});

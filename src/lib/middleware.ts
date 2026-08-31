import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { CircuitBreaker } from '@/lib/circuit-breaker';

export type MiddlewareConfig = {
  enableLogging?: boolean;
  enableCircuitBreaker?: boolean;
  circuitBreakerName?: string;
  timeout?: number;
};

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: MiddlewareConfig = {}
) {
  return async (req: NextRequest) => {
    const { enableLogging = true, enableCircuitBreaker = false, circuitBreakerName = 'API' } = config;

    const startTime = Date.now();
    const traceId = req.headers.get('x-trace-id') || `trace-${Date.now()}`;

    if (enableLogging) {
      logger.setTraceId(traceId);
      logger.info(
        'API',
        `${req.method} ${req.nextUrl.pathname}`,
        { headers: Object.fromEntries(req.headers) }
      );
    }

    const executeHandler = async () => {
      try {
        const response = await handler(req);
        const duration = Date.now() - startTime;

        if (enableLogging) {
          logger.success('API', `${req.method} ${req.nextUrl.pathname}`, { status: response.status, duration });
        }

        return response.headers.set('x-trace-id', traceId);
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (enableLogging) {
          logger.error('API', `${req.method} ${req.nextUrl.pathname}`, errorMsg);
        }

        return NextResponse.json(
          {
            success: false,
            error: errorMsg,
            traceId,
          },
          { status: 500 }
        );
      }
    };

    if (enableCircuitBreaker) {
      const breaker = new CircuitBreaker(circuitBreakerName);
      try {
        return await breaker.execute(executeHandler);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Service temporarily unavailable (${circuitBreakerName})`,
            traceId,
          },
          { status: 503 }
        );
      }
    }

    return executeHandler();
  };
}

export function withValidation(
  validator: (req: NextRequest) => boolean | string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const validationResult = validator(req);

    if (validationResult !== true) {
      return NextResponse.json(
        { success: false, error: validationResult || 'Validation failed' },
        { status: 400 }
      );
    }

    return handler(req);
  };
}

export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return handler(req);
  };
}

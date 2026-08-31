import { logger } from './logger';
import { ApiError } from './api-client';

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export type CircuitBreakerConfig = {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
};

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000,
};

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private config: CircuitBreakerConfig;

  constructor(private name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.config.timeoutMs) {
        this.state = 'half-open';
        logger.info('CircuitBreaker', `${this.name} transitioning to half-open`);
      } else {
        logger.warn('CircuitBreaker', `${this.name} is open - rejecting call`);
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.successCount++;
        if (this.successCount >= this.config.successThreshold) {
          this.state = 'closed';
          this.failureCount = 0;
          this.successCount = 0;
          logger.success('CircuitBreaker', `${this.name} recovered to closed`);
        }
      } else {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('CircuitBreaker', `${this.name} failure (${this.failureCount}/${this.config.failureThreshold})`, errorMsg);

      if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'open';
        logger.error('CircuitBreaker', `${this.name} opened after ${this.failureCount} failures`);
      }

      throw error;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  reset() {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

export const walletCircuitBreaker = new CircuitBreaker('Wallet', { failureThreshold: 3 });
export const faucetCircuitBreaker = new CircuitBreaker('Faucet', { failureThreshold: 5 });
export const deployCircuitBreaker = new CircuitBreaker('Deploy', { failureThreshold: 3 });
export const gdriveCircuitBreaker = new CircuitBreaker('GoogleDrive', { failureThreshold: 2 });

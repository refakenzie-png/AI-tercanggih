import axios, { AxiosError } from 'axios';

export type RetryConfig = {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    public details: unknown
  ) {
    super(`API Error (${statusCode}) at ${endpoint}`);
    this.name = 'ApiError';
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      if (attempt < config.maxRetries) {
        const waitTime = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
        await delay(waitTime);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function callApi<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    retry?: Partial<RetryConfig>;
    timeout?: number;
  } = {}
): Promise<T> {
  const { method = 'GET', data, retry, timeout = 30000 } = options;
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retry };

  return retryWithBackoff(
    async () => {
      const response = await axios({
        method,
        url: endpoint,
        data,
        timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new ApiError(response.status, endpoint, response.data);
      }

      return response.data as T;
    },
    retryConfig,
    (attempt, error) => {
      console.warn(`[API] Retry attempt ${attempt}/${retryConfig.maxRetries} for ${endpoint}:`, error.message);
    }
  );
}

export async function createWalletWithRetry(count: number, mnemonic?: string) {
  return callApi('/api/wallets/create', {
    method: 'POST',
    data: { count, mnemonic },
    retry: { maxRetries: 2, delayMs: 500 },
  });
}

export async function claimFaucetWithRetry(address: string, provider: string) {
  return callApi('/api/faucet/claim', {
    method: 'POST',
    data: { address, provider },
    retry: { maxRetries: 3, delayMs: 2000 },
  });
}

export async function executeTaskWithRetry(task: unknown, signedTx: string) {
  return callApi('/api/autopilot/execute', {
    method: 'POST',
    data: { task, signedTx },
    retry: { maxRetries: 2, delayMs: 1000 },
  });
}

export async function uploadBackupWithRetry(
  accessToken: string,
  fileName: string,
  walletData: unknown
) {
  return callApi('/api/google-drive/backup', {
    method: 'POST',
    data: { accessToken, fileName, walletData },
    retry: { maxRetries: 2, delayMs: 1500 },
  });
}

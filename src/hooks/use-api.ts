/**
 * Dashboard Integration Hooks
 * Connects UI to real APIs with proper state management, error handling, and loading states
 */

import { useCallback, useState } from 'react';
import { callApi, createWalletWithRetry, claimFaucetWithRetry, executeTaskWithRetry, uploadBackupWithRetry } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { walletCircuitBreaker, faucetCircuitBreaker } from '@/lib/circuit-breaker';

export type UseAsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useAsync<T>(fn: () => Promise<T>, name: string) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      logger.info('Hook', `Executing ${name}`);
      const result = await fn();
      setState({ data: result, loading: false, error: null });
      logger.success('Hook', `${name} completed`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setState({ data: null, loading: false, error: errorMsg });
      logger.error('Hook', `${name} failed`, errorMsg);
      throw error;
    }
  }, [fn, name]);

  return { ...state, execute };
}

export function useCreateWallet() {
  return useAsync(
    async () => {
      return walletCircuitBreaker.execute(() => createWalletWithRetry(1));
    },
    'Create Wallet'
  );
}

export function useCreateMultipleWallets(count: number) {
  return useAsync(
    async () => {
      return walletCircuitBreaker.execute(() => createWalletWithRetry(count));
    },
    `Create ${count} Wallets`
  );
}

export function useClaimFaucet(address: string, provider: string) {
  return useAsync(
    async () => {
      return faucetCircuitBreaker.execute(() => claimFaucetWithRetry(address, provider));
    },
    `Claim ${provider} Faucet`
  );
}

export function useDiscoverTasks() {
  return useAsync(
    async () => {
      return callApi('/api/autopilot/execute');
    },
    'Discover Tasks'
  );
}

export function useExecuteTask(task: unknown, signedTx: string) {
  return useAsync(
    async () => {
      return executeTaskWithRetry(task, signedTx);
    },
    'Execute Task'
  );
}

export function useUploadBackup(accessToken: string, fileName: string, walletData: unknown) {
  return useAsync(
    async () => {
      return uploadBackupWithRetry(accessToken, fileName, walletData);
    },
    `Upload Backup: ${fileName}`
  );
}

export function useDiscoverSignals() {
  return useAsync(
    async () => {
      return callApi('/api/signals');
    },
    'Discover Signals'
  );
}

export function useCheckGasBalance(address: string, provider: string) {
  return useAsync(
    async () => {
      return callApi('/api/faucet/claim', {
        method: 'GET',
      });
    },
    `Check Gas: ${provider}`
  );
}

export function useGetGoogleOAuthUrl() {
  return useAsync(
    async () => {
      return callApi('/api/google-drive/oauth');
    },
    'Get Google OAuth URL'
  );
}

export function useAutoClaimFaucets(address: string, providers: string[] = ['sepolia', 'base', 'linea']) {
  return useAsync(
    async () => {
      return faucetCircuitBreaker.execute(() =>
        callApi('/api/faucet/claim', {
          method: 'PUT',
          data: { address, providers },
        })
      );
    },
    `Auto-Claim from ${providers.join(', ')}`
  );
}

export function useDeployToHosting(appName: string, repository: string, branch: string, platform: string = 'vercel') {
  return useAsync(
    async () => {
      return callApi('/api/deploy/real', {
        method: 'POST',
        data: { appName, repository, branch, framework: 'next', platform },
      });
    },
    `Deploy to ${platform}`
  );
}

export function useDiscoverTestnets() {
  return useAsync(
    async () => {
      return callApi('/api/testnets/discover?action=discover');
    },
    'Discover Testnets'
  );
}

export function useGetPopularTestnets(limit: number = 10) {
  return useAsync(
    async () => {
      return callApi(`/api/testnets/discover?action=popular&limit=${limit}`);
    },
    'Get Popular Testnets'
  );
}

export function useListAllTestnets() {
  return useAsync(
    async () => {
      return callApi('/api/testnets/discover?action=list');
    },
    'List All Testnets'
  );
}

export function useMonitorNewTestnets() {
  return useAsync(
    async () => {
      return callApi('/api/testnets/discover?action=monitor');
    },
    'Monitor New Testnets'
  );
}

export function useGetTestnetPatterns() {
  return useAsync(
    async () => {
      return callApi('/api/testnets/discover?action=patterns');
    },
    'Get Popular Patterns'
  );
}

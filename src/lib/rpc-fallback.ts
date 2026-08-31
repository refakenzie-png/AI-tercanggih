export type RpcProvider = 'alchemy' | 'ankr' | 'infura' | 'quicknode';

export type RpcHealth = {
  provider: RpcProvider;
  healthy: boolean;
  latencyMs: number;
  lastChecked: string;
};

export function getRpcFallbackProviders(): RpcProvider[] {
  return ['alchemy', 'ankr', 'infura', 'quicknode'];
}

export function healthCheckRpc(provider: RpcProvider): RpcHealth {
  const latencyMs = 80 + Math.floor(Math.random() * 240);

  return {
    provider,
    healthy: latencyMs < 250,
    latencyMs,
    lastChecked: new Date().toISOString(),
  };
}

export function getBestRpcProvider() {
  const providers = getRpcFallbackProviders();
  return providers[Math.floor(Math.random() * providers.length)];
}

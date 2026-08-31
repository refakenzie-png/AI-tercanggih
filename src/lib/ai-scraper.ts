export type SignalSource = 'github' | 'social' | 'testnet-tracker';

export type ProjectSignal = {
  source: SignalSource;
  projectName: string;
  chain: string;
  summary: string;
  score: number;
};

export function discoverSignals(): ProjectSignal[] {
  return [
    {
      source: 'github',
      projectName: 'monad-launchpad',
      chain: 'Monad',
      summary: 'new contract commit and active deploy branch',
      score: 0.94,
    },
    {
      source: 'social',
      projectName: 'scroll-farm-bot',
      chain: 'Scroll',
      summary: 'social buzz spike and early test transaction activity',
      score: 0.9,
    },
    {
      source: 'testnet-tracker',
      projectName: 'berachain-demo-app',
      chain: 'Berachain',
      summary: 'public testnet tracker detected new protocol heartbeat',
      score: 0.87,
    },
  ];
}

export function generateTaskFromSignal(signal: ProjectSignal) {
  return {
    protocol: signal.projectName,
    chain: signal.chain,
    action: 'swap',
    confidence: signal.score,
    job: `Auto-run ${signal.projectName} on ${signal.chain}`,
  };
}

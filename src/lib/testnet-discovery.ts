/**
 * Testnet Discovery Service
 * Automatically discovers latest testnet networks from blockchain ecosystem
 * Supports: DefiLlama, Defillama Protocol Index, GitHub trending, On-chain events
 */

import axios from 'axios';

export interface DiscoveredTestnet {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  faucetUrl?: string;
  explorerUrl?: string;
  tvl?: number;
  isPopular: boolean;
  discoveredAt: string;
  source: 'defilama' | 'github' | 'event-scanner' | 'social' | 'manual';
}

class TestnetDiscoveryService {
  private cache: Map<string, DiscoveredTestnet> = new Map();
  private lastUpdate: number = 0;
  private cacheTTL: number = 3600000; // 1 hour

  /**
   * Discover new testnets from DefiLlama
   */
  async discoverFromDefiLlama(): Promise<DiscoveredTestnet[]> {
    try {
      const response = await axios.get('https://api.llama.fi/chains', {
        timeout: 10000,
      });

      const testnets: DiscoveredTestnet[] = [];

      for (const chain of response.data) {
        // Filter for testnet-like chains
        if (
          chain.name.toLowerCase().includes('testnet') ||
          chain.name.toLowerCase().includes('sepolia') ||
          chain.name.toLowerCase().includes('goerli')
        ) {
          testnets.push({
            id: chain.name.toLowerCase().replace(/\s+/g, '-'),
            name: chain.name,
            chainId: chain.chainId || 0,
            rpcUrl: chain.rpc?.[0] || '',
            explorerUrl: chain.blockExplorer || '',
            tvl: chain.tvl || 0,
            isPopular: chain.tvl && chain.tvl > 100000,
            discoveredAt: new Date().toISOString(),
            source: 'defilama',
          });
        }
      }

      return testnets;
    } catch (error) {
      console.error('DefiLlama discovery error:', error);
      return [];
    }
  }

  /**
   * Discover from blockchain ecosystem repos (GitHub Trending)
   */
  async discoverFromGitHub(): Promise<DiscoveredTestnet[]> {
    try {
      const response = await axios.get(
        'https://api.github.com/search/repositories?q=testnet+blockchain+faucet&sort=stars&order=desc&per_page=20',
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const testnets: DiscoveredTestnet[] = [];

      for (const repo of response.data.items || []) {
        // Extract testnet info from repo
        if (repo.description && (repo.description.includes('testnet') || repo.description.includes('faucet'))) {
          testnets.push({
            id: repo.name,
            name: repo.name,
            chainId: 0,
            rpcUrl: '',
            explorerUrl: repo.html_url,
            isPopular: repo.stargazers_count > 100,
            discoveredAt: new Date().toISOString(),
            source: 'github',
          });
        }
      }

      return testnets;
    } catch (error) {
      console.error('GitHub discovery error:', error);
      return [];
    }
  }

  /**
   * Discover from CoinGecko trending coins (indicators of active testnets)
   */
  async discoverFromCoinGecko(): Promise<DiscoveredTestnet[]> {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/trending/coins', {
        timeout: 10000,
      });

      const testnets: DiscoveredTestnet[] = [];

      for (const item of response.data || []) {
        const coin = item.item;
        // Look for testnet tokens in trending
        if (
          coin.name.toLowerCase().includes('testnet') ||
          coin.symbol.toLowerCase().includes('test')
        ) {
          testnets.push({
            id: coin.symbol.toLowerCase(),
            name: coin.name,
            chainId: 0,
            rpcUrl: '',
            isPopular: true,
            discoveredAt: new Date().toISOString(),
            source: 'social',
          });
        }
      }

      return testnets;
    } catch (error) {
      console.error('CoinGecko discovery error:', error);
      return [];
    }
  }

  /**
   * Scan for RPC endpoints and verify chain status
   */
  async verifyTestnetRPC(rpcUrl: string): Promise<boolean> {
    try {
      const response = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1,
        },
        { timeout: 5000 }
      );

      return !!response.data.result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Discover faucet URL from blockchain foundation website
   */
  async discoverFaucetUrl(chainName: string): Promise<string | undefined> {
    try {
      // Common faucet patterns
      const commonPatterns = [
        `https://faucet.${chainName}.io/claim`,
        `https://${chainName}-faucet.io/claim`,
        `https://testnet-faucet.${chainName}.io`,
        `https://faucet.${chainName}.network/claim`,
      ];

      for (const url of commonPatterns) {
        try {
          const response = await axios.head(url, { timeout: 5000 });
          if (response.status === 200) {
            return url;
          }
        } catch {
          // Continue to next pattern
        }
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get all discovered testnets with caching
   */
  async getAllDiscoveredTestnets(): Promise<DiscoveredTestnet[]> {
    // Return cached results if still valid
    if (Date.now() - this.lastUpdate < this.cacheTTL) {
      return Array.from(this.cache.values());
    }

    // Clear old cache
    this.cache.clear();

    // Discover from all sources in parallel
    const results = await Promise.all([
      this.discoverFromDefiLlama(),
      this.discoverFromGitHub(),
      this.discoverFromCoinGecko(),
    ]);

    const allTestnets = results.flat();

    // Deduplicate and cache
    const seen = new Set<string>();
    for (const testnet of allTestnets) {
      const key = `${testnet.chainId}-${testnet.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        this.cache.set(testnet.id, testnet);
      }
    }

    this.lastUpdate = Date.now();
    return Array.from(this.cache.values());
  }

  /**
   * Get popular testnets (sorted by popularity/TVL)
   */
  async getPopularTestnets(limit: number = 10): Promise<DiscoveredTestnet[]> {
    const all = await this.getAllDiscoveredTestnets();
    return all
      .filter((t) => t.isPopular)
      .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
      .slice(0, limit);
  }

  /**
   * Monitor new testnet launches
   */
  async monitorNewTestnets(): Promise<DiscoveredTestnet[]> {
    const current = await this.getAllDiscoveredTestnets();
    const previous = Array.from(this.cache.values());

    // Find new testnets
    const newTestnets = current.filter((t) => !previous.find((p) => p.id === t.id));

    if (newTestnets.length > 0) {
      console.log(`🆕 Found ${newTestnets.length} new testnets:`, newTestnets.map((t) => t.name));
    }

    return newTestnets;
  }
}

// Export singleton instance
export const testnetDiscovery = new TestnetDiscoveryService();

// Popular testnet patterns to watch
export const POPULAR_TESTNET_PATTERNS = [
  'ink', // Ink Protocol
  'robinhood', // Robinhood Chain
  'zkfair', // ZKFair
  'manta', // Manta Pacific
  'scroll', // Scroll
  'linea', // Linea
  'berachain', // Berachain
  'monad', // Monad
  'movement', // Movement Labs
  'arbitrum', // Arbitrum
  'optimism', // Optimism
  'polygon', // Polygon
  'avalanche', // Avalanche
  'fantom', // Fantom
  'harmonyprotocol', // Harmony
];

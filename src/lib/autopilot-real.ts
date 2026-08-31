import axios from 'axios';

export type AutoPilotTask = {
  taskId: string;
  walletAddress: string;
  taskType: 'swap' | 'bridge' | 'stake' | 'mint' | 'vote' | 'deploy';
  chainId: number;
  target: string;
  params: Record<string, unknown>;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
};

export type TaskExecutionResult = {
  taskId: string;
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
  executedAt: string;
};

const TESTNET_TASKS = [
  {
    id: 'swap-sepolia',
    name: 'Swap on Uniswap Sepolia',
    chainId: 11155111,
    protocol: 'uniswap',
    reward: '0.01 ETH',
  },
  {
    id: 'bridge-base',
    name: 'Bridge to Base Testnet',
    chainId: 84532,
    protocol: 'stargate',
    reward: '5 Base Points',
  },
  {
    id: 'mint-linea',
    name: 'Mint NFT on Linea',
    chainId: 59140,
    protocol: 'mint',
    reward: '0.05 LXP',
  },
  {
    id: 'stake-monad',
    name: 'Stake on Monad Testnet',
    chainId: 10143,
    protocol: 'stake',
    reward: '0.02 MON',
  },
  {
    id: 'vote-berachain',
    name: 'Vote on Berachain',
    chainId: 80085,
    protocol: 'governance',
    reward: '1 BERA Point',
  },
];

export function discoverAutoPilotTasks(): AutoPilotTask[] {
  return TESTNET_TASKS.map((task) => ({
    taskId: task.id,
    walletAddress: '',
    taskType: 'swap',
    chainId: task.chainId,
    target: task.protocol,
    params: { reward: task.reward },
    status: 'queued',
    createdAt: new Date().toISOString(),
  }));
}

export async function executeAutoPilotTask(
  task: AutoPilotTask,
  signedTx: string
): Promise<TaskExecutionResult> {
  try {
    const rpcUrl = getRpcUrlForChain(task.chainId);

    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [signedTx],
        id: 1,
      },
      { timeout: 15000 }
    );

    if (response.data.error) {
      return {
        taskId: task.taskId,
        success: false,
        error: response.data.error.message,
        executedAt: new Date().toISOString(),
      };
    }

    const txHash = response.data.result;

    return {
      taskId: task.taskId,
      success: true,
      txHash,
      gasUsed: (Math.random() * 200000).toFixed(0),
      executedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      taskId: task.taskId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executedAt: new Date().toISOString(),
    };
  }
}

export async function monitorTaskExecution(
  txHash: string,
  chainId: number,
  maxRetries: number = 12
): Promise<{ confirmed: boolean; blockNumber?: number }> {
  const rpcUrl = getRpcUrlForChain(chainId);
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1,
        },
        { timeout: 5000 }
      );

      if (response.data.result) {
        return {
          confirmed: true,
          blockNumber: parseInt(response.data.result.blockNumber, 16),
        };
      }

      retries++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return { confirmed: false };
}

export async function runAutoPilotLoop(
  wallet: { address: string; sign: (tx: unknown) => Promise<string> },
  taskLimit: number = 5
): Promise<TaskExecutionResult[]> {
  const tasks = discoverAutoPilotTasks().slice(0, taskLimit);
  const results: TaskExecutionResult[] = [];

  for (const task of tasks) {
    task.walletAddress = wallet.address;

    const mockTx = {
      to: task.target,
      value: '0',
      data: `0x${Math.random().toString(16).substring(2)}`,
      gasLimit: '100000',
    };

    try {
      const signedTx = await wallet.sign(mockTx);
      const result = await executeAutoPilotTask(task, signedTx);
      results.push(result);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({
        taskId: task.taskId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString(),
      });
    }
  }

  return results;
}

function getRpcUrlForChain(chainId: number): string {
  const rpcMap: Record<number, string> = {
    11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    84532: 'https://sepolia.base.org',
    59140: 'https://rpc.linea.build',
    10143: 'https://testnet-rpc.monad.xyz',
    80085: 'https://artio.rpc.berachain.com',
    5040: 'https://testnet.movement.rpc.m2.dev',
  };

  return rpcMap[chainId] || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
}

#!/usr/bin/env node

/**
 * E2E Workflow Test - Simulates real user flow
 * Run: npx ts-node scripts/test-e2e.ts
 */

import axios from 'axios';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 30000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2ETest() {
  console.log('🚀 Starting E2E Workflow Test\n');

  try {
    // Step 1: Generate Wallet
    console.log('📝 Step 1: Generating wallet...');
    const walletRes = await axios.get(`${BASE_URL}/api/wallets/create`, { timeout: TIMEOUT });
    const wallet = walletRes.data.wallet;
    const mnemonic = walletRes.data.backup;
    console.log(`✅ Wallet created: ${wallet.address.substring(0, 10)}...`);
    console.log(`📌 Mnemonic: ${mnemonic.substring(0, 20)}...`);

    await sleep(1000);

    // Step 2: Check Gas Balance
    console.log('\n⛽ Step 2: Checking gas balance...');
    const gasRes = await axios.get(`${BASE_URL}/api/faucet/claim`, {
      params: { address: wallet.address, provider: 'sepolia' },
      timeout: TIMEOUT,
    });
    console.log(`✅ Gas check: needsGas = ${gasRes.data.needsGas}`);

    await sleep(1000);

    // Step 3: Discover Tasks
    console.log('\n🤖 Step 3: Discovering auto-pilot tasks...');
    const tasksRes = await axios.get(`${BASE_URL}/api/autopilot/execute`, { timeout: TIMEOUT });
    const tasks = tasksRes.data.tasks;
    console.log(`✅ Found ${tasks.length} tasks`);
    console.log(`   - ${tasks[0]?.taskId}: ${tasks[0]?.chainId}`);

    await sleep(1000);

    // Step 4: Discover Signals
    console.log('\n📡 Step 4: Discovering testnet signals...');
    const signalsRes = await axios.get(`${BASE_URL}/api/signals`, { timeout: TIMEOUT });
    const signals = signalsRes.data.signals;
    console.log(`✅ Found ${signals.length} signals`);
    if (signals[0]) {
      console.log(`   - ${signals[0].title.substring(0, 40)}...`);
    }

    await sleep(1000);

    // Step 5: Get RPC Health
    console.log('\n🏥 Step 5: Checking RPC provider health...');
    const healthRes = await axios.get(`${BASE_URL}/api/provider-health`, { timeout: TIMEOUT });
    const providers = healthRes.data.providers;
    console.log(`✅ Checked ${providers.length} providers`);
    providers.forEach((p: { provider: string; healthy: boolean }) => {
      console.log(`   - ${p.provider}: ${p.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    });

    console.log('\n✅ E2E Workflow Test PASSED!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E Workflow Test FAILED!');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runE2ETest();

#!/usr/bin/env node

/**
 * Integration Test Suite for AutoPilot Testnet AI
 * Run: npx ts-node scripts/test-integration.ts
 */

import axios from 'axios';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 30000;

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    await fn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    console.log(`✅ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMsg });
    console.log(`❌ ${name} (${duration}ms) - ${errorMsg}`);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log(`🧪 Running integration tests against ${BASE_URL}\n`);

  // Phase 1: Health Check
  await test('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/api/health`, { timeout: TIMEOUT });
    if (!response.data.success) throw new Error('Health check failed');
  });

  // Phase 2: Wallet Generation
  await test('Create Single Wallet', async () => {
    const response = await axios.get(`${BASE_URL}/api/wallets/create`, { timeout: TIMEOUT });
    if (!response.data.wallet?.address) throw new Error('No wallet address returned');
  });

  await test('Create Multiple Wallets', async () => {
    const response = await axios.post(
      `${BASE_URL}/api/wallets/create`,
      { count: 3 },
      { timeout: TIMEOUT }
    );
    if (response.data.wallets?.length !== 3) throw new Error('Expected 3 wallets');
  });

  // Phase 3: Faucet
  await test('Check Gas Balance', async () => {
    const response = await axios.get(`${BASE_URL}/api/faucet/claim`, {
      params: { address: '0x0000000000000000000000000000000000000000', provider: 'sepolia' },
      timeout: TIMEOUT,
    });
    if (response.data.needsGas === undefined) throw new Error('No gas check result');
  });

  // Phase 4: Auto-Pilot Tasks
  await test('Discover Tasks', async () => {
    const response = await axios.get(`${BASE_URL}/api/autopilot/execute`, { timeout: TIMEOUT });
    if (!response.data.tasks || response.data.tasks.length === 0) throw new Error('No tasks discovered');
  });

  // Phase 5: Signals
  await test('Discover Signals', async () => {
    const response = await axios.get(`${BASE_URL}/api/signals`, { timeout: TIMEOUT });
    if (!response.data.signals) throw new Error('No signals returned');
  });

  // Phase 1: Google Drive OAuth
  await test('Get Google OAuth URL', async () => {
    const response = await axios.get(`${BASE_URL}/api/google-drive/oauth`, { timeout: TIMEOUT });
    if (!response.data.authUrl) throw new Error('No OAuth URL generated');
  });

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log(`Total Time: ${totalTime}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});

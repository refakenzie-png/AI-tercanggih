export type FaucetProvider = '2captcha' | 'capmonster' | 'anticaptcha';

export type FaucetClaimStatus = 'claimed' | 'skipped' | 'failed';

export function shouldRequestGas(balance: number, minRequired = 0.02) {
  return balance < minRequired;
}

export function solveCaptcha(type: 'hcaptcha' | 'recaptcha' | 'turnstile', provider: FaucetProvider) {
  return {
    provider,
    type,
    solved: true,
    token: `captcha-${provider}-${type}-${Date.now()}`,
  };
}

export function claimFaucet(walletAddress: string, network: string, provider: FaucetProvider) {
  if (!walletAddress || walletAddress.length < 12) {
    return {
      status: 'failed' as FaucetClaimStatus,
      reason: 'invalid wallet address',
      network,
    };
  }

  return {
    status: 'claimed' as FaucetClaimStatus,
    network,
    txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    provider,
  };
}

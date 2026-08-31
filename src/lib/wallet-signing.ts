import { ethers, Wallet, HDNodeWallet } from 'ethers';

export type WalletSigningKey = {
  walletId: string;
  address: string;
  publicKey: string;
  mnemonic?: string;
};

export function generateSecureWallet(): { wallet: HDNodeWallet; backup: string } {
  const mnemonic = ethers.Wallet.createRandom().mnemonic;
  if (!mnemonic) throw new Error('Failed to generate mnemonic');

  const wallet = HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
  const backup = mnemonic.phrase;

  return { wallet, backup };
}

export function walletFromMnemonic(
  mnemonic: string,
  index: number = 0
): { wallet: HDNodeWallet | Wallet; address: string } {
  const path = `m/44'/60'/0'/0/${index}`;
  const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonic);
  const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);

  return { wallet, address: wallet.address };
}

export async function signTransaction(
  wallet: Wallet,
  txData: {
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
  }
): Promise<string> {
  const tx = {
    to: txData.to,
    value: ethers.parseEther(txData.value),
    data: txData.data || '0x',
    gasLimit: txData.gasLimit || '21000',
    gasPrice: ethers.parseUnits('10', 'gwei'),
    nonce: Math.floor(Math.random() * 1000),
    chainId: 11155111,
  };

  const signedTx = await wallet.signTransaction(tx);
  return signedTx;
}

export async function signMessage(wallet: Wallet, message: string): Promise<string> {
  return wallet.signMessage(message);
}

export function getWalletSigningKey(wallet: Wallet): WalletSigningKey {
  return {
    walletId: `wallet-${Date.now()}`,
    address: wallet.address,
    publicKey: wallet.signingKey.publicKey,
  };
}

/**
 * Production Configuration & Environment Setup
 */

export const PRODUCTION_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'),
    RETRY_ATTEMPTS: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
    RETRY_DELAY_MS: parseInt(process.env.API_RETRY_DELAY_MS || '1000'),
  },

  // Google Drive Configuration
  GOOGLE_DRIVE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-drive/callback',
    SCOPES: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
  },

  // Wallet Configuration
  WALLET: {
    DERIVATION_PATH: "m/44'/60'/0'/0",
    MAX_WALLETS_PER_USER: 5,
    SESSION_TIMEOUT_MS: parseInt(process.env.WALLET_SESSION_TIMEOUT_MS || '3600000'), // 1 hour
    REQUIRE_BACKUP: true,
  },

  // Faucet Configuration
  FAUCET: {
    NETWORKS: ['sepolia', 'monad', 'berachain', 'linea', 'scroll', 'movement', 'base'],
    MAX_CLAIMS_PER_DAY: 10,
    GAS_THRESHOLD: {
      sepolia: '0.1',
      monad: '0.05',
      berachain: '0.1',
      linea: '0.05',
      scroll: '0.1',
      movement: '0.05',
      base: '0.1',
    },
    CLAIM_COOLDOWN_MS: parseInt(process.env.FAUCET_CLAIM_COOLDOWN_MS || '30000'),
  },

  // Auto-Pilot Configuration
  AUTO_PILOT: {
    MAX_CONCURRENT_TASKS: parseInt(process.env.AUTO_PILOT_MAX_CONCURRENT_TASKS || '5'),
    TASK_TIMEOUT_MS: parseInt(process.env.AUTO_PILOT_TASK_TIMEOUT_MS || '120000'),
    CONFIRMATION_TIMEOUT_MS: parseInt(process.env.AUTO_PILOT_CONFIRMATION_TIMEOUT_MS || '300000'),
    RETRY_ATTEMPTS: parseInt(process.env.AUTO_PILOT_RETRY_ATTEMPTS || '2'),
  },

  // Deployment Configuration
  DEPLOYMENT: {
    PLATFORMS: ['vercel', 'netlify', 'cloudflare-pages'],
    MAX_DEPLOYMENTS_PER_DAY: 50,
    DEPLOYMENT_TIMEOUT_MS: parseInt(process.env.DEPLOYMENT_TIMEOUT_MS || '300000'),
  },

  // RPC Configuration
  RPC: {
    PROVIDERS: ['alchemy', 'ankr', 'infura', 'quicknode'],
    FALLBACK_ENABLED: true,
    HEALTH_CHECK_INTERVAL_MS: parseInt(process.env.RPC_HEALTH_CHECK_INTERVAL_MS || '60000'),
    TIMEOUT_MS: parseInt(process.env.RPC_TIMEOUT_MS || '10000'),
  },

  // Logging Configuration
  LOGGING: {
    ENABLED: true,
    LEVEL: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    MAX_LOGS: parseInt(process.env.LOG_MAX_LOGS || '10000'),
    SEND_TO_ANALYTICS: process.env.NODE_ENV === 'production',
  },

  // Circuit Breaker Configuration
  CIRCUIT_BREAKER: {
    ENABLED: true,
    WALLET_FAILURE_THRESHOLD: parseInt(process.env.CB_WALLET_FAILURE_THRESHOLD || '3'),
    FAUCET_FAILURE_THRESHOLD: parseInt(process.env.CB_FAUCET_FAILURE_THRESHOLD || '5'),
    DEPLOY_FAILURE_THRESHOLD: parseInt(process.env.CB_DEPLOY_FAILURE_THRESHOLD || '3'),
    GDRIVE_FAILURE_THRESHOLD: parseInt(process.env.CB_GDRIVE_FAILURE_THRESHOLD || '2'),
    TIMEOUT_MS: parseInt(process.env.CB_TIMEOUT_MS || '60000'),
  },

  // Security Configuration
  SECURITY: {
    ENABLE_HTTPS_ONLY: process.env.NODE_ENV === 'production',
    ENABLE_CSP: true,
    ENABLE_CORS: true,
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    REQUIRE_AUTH_FOR_SENSITIVE_ENDPOINTS: true,
  },

  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS !== 'false',
    ENABLE_CIRCUIT_BREAKER: process.env.ENABLE_CIRCUIT_BREAKER !== 'false',
    ENABLE_AUTO_RETRY: process.env.ENABLE_AUTO_RETRY !== 'false',
    ENABLE_BACKUP_TO_GDRIVE: process.env.ENABLE_BACKUP_TO_GDRIVE !== 'false',
  },
};

export function validateProductionConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (process.env.NODE_ENV === 'production') {
    if (!PRODUCTION_CONFIG.GOOGLE_DRIVE.CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required in production');
    }
    if (!PRODUCTION_CONFIG.GOOGLE_DRIVE.CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

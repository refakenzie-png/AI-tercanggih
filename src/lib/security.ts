export type SecureSession = {
  sessionId: string;
  walletIds: string[];
  createdAt: string;
  expiresAt: string;
};

export function createSecureSession(walletIds: string[]): SecureSession {
  const now = Date.now();
  const expiration = now + 1000 * 60 * 60 * 8;

  return {
    sessionId: `session-${Math.random().toString(16).slice(2, 10)}`,
    walletIds,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiration).toISOString(),
  };
}

export function sanitizeSensitiveText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export function getNoDatabasePolicyMessage() {
  return 'Private keys, seed phrases, and raw wallet backups are never persisted in the application database. They are kept ephemeral in the client session and optionally mirrored to Google Drive as an encrypted user-owned backup.';
}

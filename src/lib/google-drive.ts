export type GoogleDriveBackup = {
  fileName: string;
  folderName: string;
  driveUrl: string;
  status: 'ready' | 'pending';
  uploadedAt: string;
};

export function buildGoogleAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ?? 'demo-google-client-id';
  const redirectUri = 'https://localhost:3000/oauth/google-drive';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
  const responseType = 'code';

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
}

export function createGoogleDriveBackup(fileName: string, walletCount: number): GoogleDriveBackup {
  return {
    fileName,
    folderName: 'Autopilot Wallet Backups',
    driveUrl: `https://drive.google.com/folderview?id=autopilot-${walletCount}-wallets`,
    status: 'ready',
    uploadedAt: new Date().toISOString(),
  };
}

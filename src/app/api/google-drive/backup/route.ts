import { NextResponse } from 'next/server';
import { createGoogleDriveBackup } from '@/lib/google-drive';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = String(body?.fileName ?? 'autopilot-wallet-backup.json');
    const walletCount = Number(body?.walletCount ?? 1);

    const backup = createGoogleDriveBackup(fileName, walletCount);

    return NextResponse.json({
      success: true,
      backup,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Google Drive backup failed',
      },
      { status: 500 },
    );
  }
}

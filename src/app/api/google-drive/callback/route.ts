import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, uploadToGoogleDrive } from '@/lib/google-drive-real';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken(code);

    return NextResponse.json({
      success: true,
      accessToken,
      message: 'Google Drive OAuth authenticated successfully',
      redirectTo: `/dashboard?token=${accessToken}&state=${state}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'OAuth authentication failed',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, fileName, walletData } = body;

    if (!accessToken || !fileName) {
      return NextResponse.json(
        { error: 'Missing accessToken or fileName' },
        { status: 400 }
      );
    }

    const result = await uploadToGoogleDrive(
      accessToken,
      fileName,
      JSON.stringify(walletData, null, 2)
    );

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
      message: 'Wallet backup uploaded to Google Drive successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

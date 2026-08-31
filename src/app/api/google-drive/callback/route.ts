import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, uploadToGoogleDrive } from '@/lib/google-drive-real';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error) {
      return NextResponse.json(
        { 
          error: error,
          details: error_description || 'Google OAuth failed',
          hint: 'Make sure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are correctly set in .env.local'
        },
        { status: 401 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code', hint: 'Please try again' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { 
          error: 'Google OAuth not configured', 
          hint: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local'
        },
        { status: 500 }
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'OAuth authentication failed',
        details: errorMsg,
        hint: 'Check browser console and server logs for more details'
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

import { NextResponse } from 'next/server';

export async function GET() {
  const redirect = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=demo-google-client-id&redirect_uri=https%3A%2F%2Flocalhost%3A3000%2Foauth%2Fgoogle-drive&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&access_type=offline&prompt=consent';

  return NextResponse.json({
    success: true,
    oauthUrl: redirect,
    provider: 'google-drive',
  });
}

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-drive/callback'
);

export function getGoogleAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

export async function getAccessToken(code: string): Promise<string> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens.access_token || '';
}

export async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: string
): Promise<{ fileId: string; webViewLink: string }> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const fileMetadata = {
    name: fileName,
    parents: ['appDataFolder'],
  };

  const media = {
    mimeType: 'application/json',
    body: fileContent,
  };

  const result = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });

  return {
    fileId: result.data.id || '',
    webViewLink: result.data.webViewLink || '',
  };
}

export async function listBackups(accessToken: string): Promise<Array<{ id: string; name: string }>> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const result = await drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name)',
    pageSize: 10,
  });

  return (
    result.data.files?.map((file) => ({
      id: file.id || '',
      name: file.name || '',
    })) || []
  );
}

export async function downloadBackup(accessToken: string, fileId: string): Promise<string> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const result = await drive.files.get({
    fileId,
    alt: 'media',
  });

  return result.data as unknown as string;
}

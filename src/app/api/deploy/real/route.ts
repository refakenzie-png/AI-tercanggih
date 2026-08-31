import { NextRequest, NextResponse } from 'next/server';
import { deployToVercel, deployToNetlify, deployToCloudflarePages, deployToAllPlatforms } from '@/lib/deploy-real';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appName, repository, branch, framework, platform = 'vercel' } = body;

    if (!appName || !repository || !branch) {
      return NextResponse.json(
        { error: 'Missing required deployment parameters' },
        { status: 400 }
      );
    }

    const deploymentRequest = {
      appName,
      repository,
      branch,
      framework: (framework as 'next' | 'vite' | 'react' | 'node') || 'next',
    };

    let result;

    switch (platform) {
      case 'vercel':
        result = await deployToVercel(deploymentRequest, process.env.VERCEL_API_TOKEN || '');
        break;
      case 'netlify':
        result = await deployToNetlify(deploymentRequest, process.env.NETLIFY_AUTH_TOKEN || '');
        break;
      case 'cloudflare-pages':
        result = await deployToCloudflarePages(
          deploymentRequest,
          process.env.CLOUDFLARE_API_TOKEN || '',
          process.env.CLOUDFLARE_ACCOUNT_ID || ''
        );
        break;
      default:
        result = await deployToVercel(deploymentRequest, process.env.VERCEL_API_TOKEN || '');
    }

    return NextResponse.json({
      success: result.status === 'success',
      deployment: result,
      message: `Deployment to ${platform} ${result.status}`,
      liveUrl: result.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Deployment failed',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appName, repository, branch, framework = 'next' } = body;

    if (!appName || !repository || !branch) {
      return NextResponse.json(
        { error: 'Missing required deployment parameters' },
        { status: 400 }
      );
    }

    const deploymentRequest = {
      appName,
      repository,
      branch,
      framework: (framework as 'next' | 'vite' | 'react' | 'node') || 'next',
    };

    const credentials = {
      vercel: process.env.VERCEL_API_TOKEN,
      netlify: process.env.NETLIFY_AUTH_TOKEN,
      cloudflare: process.env.CLOUDFLARE_API_TOKEN
        ? { token: process.env.CLOUDFLARE_API_TOKEN, accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '' }
        : undefined,
    };

    const results = await deployToAllPlatforms(deploymentRequest, credentials as never);

    const successCount = results.filter((r) => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      deployments: results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
      liveUrls: results.filter((r) => r.status === 'success').map((r) => r.url),
      message: `Deployed to ${successCount} platform(s) successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Multi-platform deployment failed',
      },
      { status: 500 }
    );
  }
}

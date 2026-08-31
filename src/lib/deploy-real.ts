import axios from 'axios';

export type HostingPlatform = 'vercel' | 'netlify' | 'cloudflare-pages';

export type DeploymentRequest = {
  appName: string;
  repository: string;
  branch: string;
  framework: 'next' | 'vite' | 'react' | 'node';
  envVars?: Record<string, string>;
};

export type DeploymentResult = {
  platform: HostingPlatform;
  appName: string;
  url: string;
  status: 'success' | 'failed';
  deployId: string;
  timestamp: string;
};

export async function deployToVercel(
  request: DeploymentRequest,
  apiToken: string
): Promise<DeploymentResult> {
  try {
    const response = await axios.post(
      'https://api.vercel.com/v13/deployments',
      {
        name: request.appName,
        gitSource: {
          repo: request.repository,
          ref: request.branch,
          type: 'github',
        },
        framework: request.framework,
        env: request.envVars || {},
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const deployment = response.data;

    return {
      platform: 'vercel',
      appName: request.appName,
      url: `https://${request.appName.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
      status: 'success',
      deployId: deployment.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: 'vercel',
      appName: request.appName,
      url: '',
      status: 'failed',
      deployId: '',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function deployToNetlify(
  request: DeploymentRequest,
  apiToken: string
): Promise<DeploymentResult> {
  try {
    const response = await axios.post(
      'https://api.netlify.com/api/v1/sites',
      {
        name: request.appName.toLowerCase().replace(/\s+/g, '-'),
        repo: {
          provider: 'github',
          repo: request.repository,
          branch: request.branch,
        },
        build_settings: {
          cmd: 'npm run build',
          dir: '.next',
          functions_dir: 'netlify/functions',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const site = response.data;

    return {
      platform: 'netlify',
      appName: request.appName,
      url: `https://${site.name}.netlify.app`,
      status: 'success',
      deployId: site.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: 'netlify',
      appName: request.appName,
      url: '',
      status: 'failed',
      deployId: '',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function deployToCloudflarePages(
  request: DeploymentRequest,
  apiToken: string,
  accountId: string
): Promise<DeploymentResult> {
  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
      {
        name: request.appName.toLowerCase().replace(/\s+/g, '-'),
        production_branch: request.branch,
        source: {
          type: 'github',
          config: {
            repo_name: request.repository.split('/')[1],
            owner: request.repository.split('/')[0],
            production_branch: request.branch,
          },
        },
        build_config: {
          build_command: 'npm run build',
          destination_dir: '.next',
        },
        env_vars: Object.entries(request.envVars || {}).map(([key, value]) => ({
          name: key,
          value,
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const project = response.data.result;

    return {
      platform: 'cloudflare-pages',
      appName: request.appName,
      url: `https://${project.name}.pages.dev`,
      status: 'success',
      deployId: project.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: 'cloudflare-pages',
      appName: request.appName,
      url: '',
      status: 'failed',
      deployId: '',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function deployToAllPlatforms(
  request: DeploymentRequest,
  credentials: {
    vercel?: string;
    netlify?: string;
    cloudflare?: { token: string; accountId: string };
  }
): Promise<DeploymentResult[]> {
  const results: DeploymentResult[] = [];

  if (credentials.vercel) {
    const vercelResult = await deployToVercel(request, credentials.vercel);
    results.push(vercelResult);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (credentials.netlify) {
    const netlifyResult = await deployToNetlify(request, credentials.netlify);
    results.push(netlifyResult);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (credentials.cloudflare) {
    const cfResult = await deployToCloudflarePages(
      request,
      credentials.cloudflare.token,
      credentials.cloudflare.accountId
    );
    results.push(cfResult);
  }

  return results;
}

export function getFreeDomainOptions(): string[] {
  return [
    '.vercel.app',
    '.netlify.app',
    '.pages.dev',
    '.web3.storage',
  ];
}

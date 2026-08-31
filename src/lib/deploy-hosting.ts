export type HostingProvider = 'vercel' | 'netlify' | 'cloudflare-pages' | 'fleek';

export type HostingDeployment = {
  provider: HostingProvider;
  appName: string;
  domain: string;
  status: 'queued' | 'deployed';
  url: string;
};

export function deployToHosting(provider: HostingProvider, appName: string): HostingDeployment {
  const suffixes = {
    vercel: 'vercel.app',
    netlify: 'netlify.app',
    'cloudflare-pages': 'pages.dev',
    fleek: 'eth.limo',
  } as const;

  return {
    provider,
    appName,
    domain: `${appName.toLowerCase().replace(/\s+/g, '-')}.${suffixes[provider]}`,
    status: 'deployed',
    url: `https://${appName.toLowerCase().replace(/\s+/g, '-')}.${suffixes[provider]}`,
  };
}

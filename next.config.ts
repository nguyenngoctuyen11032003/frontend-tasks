import type { NextConfig } from "next";
import type { RemotePattern } from 'next/dist/shared/lib/image-config';
import withPWA from 'next-pwa';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const resolveBackend = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    return {
      origin: `${url.protocol}//${url.host}`,
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port || undefined,
    } as const;
  } catch {
    const fallback = new URL('http://localhost:3001/api');
    return {
      origin: `${fallback.protocol}//${fallback.host}`,
      protocol: 'http',
      hostname: 'localhost',
      port: '3001',
    } as const;
  }
};

const backend = resolveBackend(apiUrl);

const uploadRemotePattern = (): RemotePattern => {
  const pattern: RemotePattern = {
    protocol: backend.protocol as 'http' | 'https',
    hostname: backend.hostname,
    pathname: '/uploads/**',
  };

  if (backend.port) {
    pattern.port = backend.port;
  }

  return pattern;
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Add turbopack config to silence webpack warning
  turbopack: {},
  
  // Environment-specific settings
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },

  images: {
    remotePatterns: [uploadRemotePattern()],
  },

  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backend.origin}/uploads/:path*`,
      },
    ];
  },

  // Optimize headers for HMR and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

// Wrap config with PWA support
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})(nextConfig);

export default pwaConfig;

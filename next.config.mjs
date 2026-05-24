/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  ...(isCapacitorBuild && { output: 'export' }),
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  images: {
    unoptimized: isCapacitorBuild,
  },
  trailingSlash: false,
  poweredByHeader: false,
  ...(!isCapacitorBuild && {
    headers: async () => {
      return [
        {
          source: '/sw.js',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
            { key: 'Content-Type', value: 'application/javascript' },
          ],
        },
        {
          source: '/manifest.json',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
            { key: 'Content-Type', value: 'application/manifest+json' },
          ],
        },
        {
          source: '/icons/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;

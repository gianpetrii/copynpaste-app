/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Vercel con Firebase Admin
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  images: {
    unoptimized: false, // Vercel soporta optimización de imágenes
  },
  // Configuración optimizada para Firebase y PWA
  trailingSlash: false,
  poweredByHeader: false,
  // PWA Configuration
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

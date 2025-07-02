/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Firebase Hosting con Next.js support
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  images: {
    unoptimized: true, // Requerido para Firebase Hosting
  },
  // Configuración optimizada para Firebase
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;

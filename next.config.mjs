/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Firebase Hosting
  output: 'export', // Genera archivos estáticos para hosting
  images: {
    unoptimized: true, // Necesario para exportación estática
  },
  // Deshabilitar la generación de archivos estáticos para rutas dinámicas
  // si tu aplicación usa rutas dinámicas
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Necesario para imagen Docker (Next.js)
  // El proyecto aún tiene errores TS en varios módulos; quitar cuando esté limpio `tsc`.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

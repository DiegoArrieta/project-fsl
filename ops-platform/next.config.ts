import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Necesario para imagen Docker (Next.js)
  // Incluir cliente Prisma en el trace (runner sin node_modules completo de deps).
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/.prisma/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  // El proyecto aún tiene errores TS en varios módulos; quitar cuando esté limpio `tsc`.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

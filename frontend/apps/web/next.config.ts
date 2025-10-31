import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@frontend/types', '@frontend/ui'],
  webpack: (config) => {
    // Add alias for @/ in the UI package to resolve to the UI package root
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': path.resolve(__dirname, '../../packages/ui/components'),
      '@/lib': path.resolve(__dirname, '../../packages/ui/lib'),
      '@/hooks': path.resolve(__dirname, '../../packages/ui/hooks')
    }
    return config
  }
}

export default nextConfig

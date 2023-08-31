/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  output: 'standalone',
  transpilePackages: ['@frontend/types', '@frontend/ui'],
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig

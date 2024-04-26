/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  output: 'standalone',
  transpilePackages: ['@frontend/types', '@frontend/ui']
}

module.exports = nextConfig

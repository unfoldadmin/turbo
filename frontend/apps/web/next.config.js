/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@frontend/types', '@frontend/ui']
}

module.exports = nextConfig

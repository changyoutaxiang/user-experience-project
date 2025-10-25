/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 移除 output: 'export'，因为我们需要 API Routes
}

export default nextConfig

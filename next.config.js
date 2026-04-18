/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    // We run ESLint in GitHub Actions, skip during build to save Vercel build minutes
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We run TS checks in GitHub Actions, skip during build to save Vercel build minutes
    ignoreBuildErrors: true,
  },
  async headers() {
    const corsHeaders = [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, x-user-id, x-character-id' },
    ];
    return [
      {
        source: '/api/:path*',
        headers: corsHeaders,
      },
      {
        // OpenAI-compatible API routes
        source: '/v1/:path*',
        headers: corsHeaders,
      },
    ];
  },
};

module.exports = nextConfig;

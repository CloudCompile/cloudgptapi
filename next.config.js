/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip static generation for pages that require Clerk
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async headers() {
    const corsHeaders = [
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, x-user-id' },
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

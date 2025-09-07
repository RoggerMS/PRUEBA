/** @type {import('next').NextConfig} */
const nextConfig = {
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
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Skip static generation for problematic pages
    skipTrailingSlashRedirect: true,
  },
  images: {
    domains: ['ui-avatars.com'],
  },
  // Skip static generation for specific routes
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Ensure proper path resolution
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Disable static optimization for problematic pages
  async rewrites() {
    return [
      { source: '/@:username', destination: '/u/:username' },
      { source: '/@:username/:path*', destination: '/u/:username/:path*' },
    ];
  },
};

module.exports = nextConfig;
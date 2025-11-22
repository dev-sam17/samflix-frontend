/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable caching to fix HMR issues
  experimental: {
    // Disable server components HMR cache to ensure fresh data on each refresh
    serverComponentsHmrCache: false,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;

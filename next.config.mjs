/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'framer-motion'],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
};

export default nextConfig;
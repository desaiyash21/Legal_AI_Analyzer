/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for static exports (if using `next export`)
  output: 'export', // Remove this if you need SSR/API routes
  // Fixes missing assets in Appwrite
  images: {
    unoptimized: true, // Disable Image Optimization if not supported
  },
};

module.exports = nextConfig;
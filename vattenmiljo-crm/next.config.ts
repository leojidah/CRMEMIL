/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable CSS optimization
  swcMinify: true,
  // Optimize images
  images: {
    domains: [],
  },
  // Enable strict mode
  reactStrictMode: true,
}

module.exports = nextConfig
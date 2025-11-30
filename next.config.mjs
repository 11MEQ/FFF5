/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    buildActivity: false
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

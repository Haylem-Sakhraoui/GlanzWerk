/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'perfectcleandesign-erfurt.de',
        pathname: '/wp-content/**',
      },
    ],
  },
}

export default nextConfig


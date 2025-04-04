/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'search.pstatic.net',
      },
    ],
  },
};

export default nextConfig; 
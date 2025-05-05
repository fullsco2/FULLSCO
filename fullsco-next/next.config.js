/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'fullsco.com'],
  },
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
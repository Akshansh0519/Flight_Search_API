import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/bookings',
        destination: 'http://127.0.0.1:4000/api/v1/bookings',
      },
      {
        source: '/api/v1/bookings/:path*',
        destination: 'http://127.0.0.1:4000/api/v1/bookings/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:3000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;

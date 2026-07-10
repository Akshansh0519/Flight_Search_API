import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/user/:path*',
        destination: 'http://127.0.0.1:5000/api/v1/user/:path*',
      },
      {
        source: '/api/v1/info',
        destination: 'http://127.0.0.1:5000/api/v1/info',
      },
      {
        source: '/api/v1/bookings',
        destination: 'http://127.0.0.1:5000/bookingService/api/v1/bookings',
      },
      {
        source: '/api/v1/bookings/:path*',
        destination: 'http://127.0.0.1:5000/bookingService/api/v1/bookings/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:5000/flightService/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;

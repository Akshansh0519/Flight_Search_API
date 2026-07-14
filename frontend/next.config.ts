import type { NextConfig } from "next";

const gatewayUrl = (process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.API_GATEWAY_URL || 'http://127.0.0.1:5000').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/user/:path*',
        destination: `${gatewayUrl}/api/v1/user/:path*`,
      },
      {
        source: '/api/v1/info',
        destination: `${gatewayUrl}/api/v1/info`,
      },
      {
        source: '/api/v1/bookings',
        destination: `${gatewayUrl}/bookingService/api/v1/bookings`,
      },
      {
        source: '/api/v1/bookings/:path*',
        destination: `${gatewayUrl}/bookingService/api/v1/bookings/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${gatewayUrl}/flightService/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

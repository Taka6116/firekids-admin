/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'https://99cdagp73f.execute-api.ap-northeast-1.amazonaws.com/prod/admin/:path*',
      },
    ]
  },
}

export default nextConfig

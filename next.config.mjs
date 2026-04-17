/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // フロントエンドからの /api/admin/〜 というリクエストを
        source: '/api/admin/:path*',
        // API Gateway の /prod/admin/〜 に裏側で転送する
        destination: 'https://99cdagp73f.execute-api.ap-northeast-1.amazonaws.com/prod/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
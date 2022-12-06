/** @type {import('next').NextConfig} */


const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'same-origin'
  }
]


const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development"
})


module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ]
  }
})
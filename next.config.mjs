/** @type {import('next').NextConfig} */
// next.config.mjs
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "react-toastify",
    ],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  allowedDevOrigins: [
    "jmkresearch.com",
    "www.jmkresearch.com",
    "52.66.166.61",
    "172.31.15.172",
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  optimizeFonts: false,
};

export default nextConfig;

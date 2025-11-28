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
  allowedDevOrigins: ["13.202.130.75", "nyomx.com", "13.126.11.182"],
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

import type { NextConfig } from "next";

// Import plugins
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '10.1.58.38'],
};

// Compose plugins: withBundleAnalyzer wraps withPWA, which wraps nextConfig
export default withBundleAnalyzer(withPWA(nextConfig));

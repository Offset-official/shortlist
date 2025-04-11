import type { NextConfig } from "next";

// Using @ducanh2912/next-pwa package
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig: NextConfig = {
  // Add the allowedDevOrigins here inside the main config object
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '10.1.58.38']
};

// Export the configuration with PWA wrapper
export default withPWA(nextConfig);
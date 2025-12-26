/**
 * next.config.ts
 * Next.js configuration file for build settings, environment variables, and framework options.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow server actions to work with other proxies
    // Required for Apple OAuth: After redirect from appleid.apple.com,
    // the origin header will be set to appleid.apple.com, so we must whitelist it
    serverActions: {
      allowedOrigins: [
        "appleid.apple.com",
      ],
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for argon2 (native module) — exclude from Edge runtime
  serverExternalPackages: ["argon2", "@libsql/client", "googleapis"],
  experimental: {},
};

export default nextConfig;

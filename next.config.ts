import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/resume": ["./private/**"],
  },
};

export default nextConfig;

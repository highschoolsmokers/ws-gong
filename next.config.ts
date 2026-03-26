import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/resume": ["./private/**"],
  },
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

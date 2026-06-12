import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname
  },
  async redirects() {
    return [
      // Membership rebrand: Fixit Plus -> Fixit Peace.
      { source: "/fixit-plus", destination: "/fixit-peace", permanent: true }
    ];
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-postgres pulls in dns/net/fs. It only ever runs server-side, so
  // leave it to Node's own resolver instead of bundling it.
  serverExternalPackages: ["pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Product photos live on Vercel Blob. The store id prefixes the
        // host, so the wildcard covers whichever store is provisioned.
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

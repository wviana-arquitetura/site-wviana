import type { NextConfig } from "next";

const SUPABASE_HOSTNAME = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: SUPABASE_HOSTNAME
      ? [
          {
            protocol: "https",
            hostname: SUPABASE_HOSTNAME,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;

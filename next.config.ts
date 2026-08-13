import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to configure images.");
}

let parsedSupabaseUrl: URL;

try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
}

if (parsedSupabaseUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: parsedSupabaseUrl.hostname,
        port: "",
        pathname: "/storage/v1/object/public/portfolio-media/**",
      },
    ],
  },
};

export default nextConfig;

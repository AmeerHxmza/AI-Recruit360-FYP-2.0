import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  // Transpile client-side WebRTC and avatar dependencies for SSR compatibility
  serverExternalPackages: ["pdf-parse", "mammoth"],

  // ── Image Optimization ───────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ── Custom HTTP Response Headers ─────────────────────────────────────────
  async headers() {
    return [
      // Security headers applied to ALL routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // ── Webpack ───────────────────────────────────────────────────────────────
  webpack: (config) => {
    // Suppress PDF.js canvas peer-dep warning
    config.resolve.alias.canvas = false;
    // Fix case-sensitivity bug in simli-client@3.0.2 on Linux/Vercel (index.js requires "./Client", but file is "client.js")
    config.resolve.alias["simli-client$"] = path.resolve(
      process.cwd(),
      "node_modules/simli-client/dist/client.js",
    );
    return config;
  },

  // ── Turbopack (Next.js 16 Default) ────────────────────────────────────────
  turbopack: {},
};

export default nextConfig;

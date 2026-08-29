import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile client-side WebRTC and avatar dependencies for SSR compatibility
  transpilePackages: ["simli-client", "livekit-client"],
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
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(self), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Cache the AI service health proxy for 10s at edge (reduces cold-start load)
      {
        source: "/api/py/health",
        headers: [
          { key: "Cache-Control", value: "public, max-age=10, s-maxage=30, stale-while-revalidate=60" },
        ],
      },
      // Public job listing pages — allow ISR results to be cached at edge
      {
        source: "/jobs/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },

  // ── Webpack ───────────────────────────────────────────────────────────────
  webpack: (config) => {
    // Suppress PDF.js canvas peer-dep warning
    config.resolve.alias.canvas = false;
    return config;
  },

  // ── Turbopack (Next.js 16 Default) ────────────────────────────────────────
  turbopack: {},
};

export default nextConfig;

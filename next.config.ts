import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
const supabaseRealtimeOrigin = supabaseOrigin.replace("https://", "wss://");

const nextConfig: NextConfig = {
  async headers() {
    const connectSources = [
      "'self'",
      supabaseOrigin,
      supabaseRealtimeOrigin,
      "vercel-insights.com",
      "vitals.vercel-insights.com",
    ].filter(Boolean);

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' vercel-insights.com;
              style-src 'self' 'unsafe-inline';
              connect-src ${connectSources.join(" ")};
              img-src * data: blob:;
              font-src 'self' data:;
              object-src 'none';
            `.replace(/\s{2,}/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

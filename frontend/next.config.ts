import type { NextConfig } from "next";

// .env is loaded by instrumentation.ts when the Node server starts (before API routes run).
// Do not load dotenv here — it can cause "exports is not defined in ES module scope" when Next compiles the config.

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 3D model files in public/ — cache 30 days
        source: "/:path*.glb",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        source: "/:path*.gltf",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        // Images in public/ — cache 7 days
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;

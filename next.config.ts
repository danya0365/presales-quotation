import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // บังคับให้ snapshot ใน ./data ถูก bundle เข้า serverless function ทุก route
  // (อ่านด้วย fs แบบ dynamic path → file tracing จับเองไม่ได้ ต้องระบุ)
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;

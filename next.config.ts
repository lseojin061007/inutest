import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Next.js 버전에 따라 타입이 엄격하게 검사되어 Vercel 빌드 시 오류가 발생할 수 있으므로 무시합니다.
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;

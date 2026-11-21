import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A second build folder (NEXT_DIST_DIR) lets a production build be measured while `next dev` uses .next.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // The dev-only "N" badge sat on the folded index rail (bottom left); build errors still show.
  devIndicators: false,
  // Course figures for the belortzio drill: viewable in the app, kept out of search results.
  async headers() {
    return [{ source: '/belortzioak-irudiak/:file*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }];
  },
};

export default nextConfig;

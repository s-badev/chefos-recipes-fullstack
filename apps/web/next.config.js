/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Verification builds use a separate output folder (NEXT_DIST_DIR=.next-check) so they
  // never overwrite the .next folder of a running dev server. Netlify keeps the default.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;

/** @type {import('next').NextConfig} */


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const domain = apiUrl.replace(/^https?:\/\//, "").split("/api")[0];

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: domain,
      },
    ],
    unoptimized: false,
  },
  devIndicators: {
    buildActivity: false,
  },
};

// Conditionally set the output based on the environment
if (process.env.NEXT_PUBLIC_ENABLE_SEO === "false") {
  nextConfig.output = "export";
}

export default nextConfig;

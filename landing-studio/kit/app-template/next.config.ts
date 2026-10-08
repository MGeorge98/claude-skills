import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // few, already small images: served as they are, no optimisation service
  images: { unoptimized: true },
  // nodemailer runs on the server only; keep it out of the bundle
  serverExternalPackages: ["nodemailer"],
  // the lead route (kit/backend) mails the files in ATTACH_DIR (default agenti/) and the email logos;
  // on Vercel they must be traced into its bundle. Change the folder with ATTACH_DIR, or drop the line.
  outputFileTracingIncludes: { "/api/lead": ["./agenti/**", "./public/email-logo-*.png"] },
  // pages that carry someone else's brand stay out of search until the owner says otherwise
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;

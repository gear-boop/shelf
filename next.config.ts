import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
void initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });

const nextConfig: NextConfig = {};

export default nextConfig;

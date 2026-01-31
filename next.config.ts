import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let supabaseHostname: string | undefined;
try {
  supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;
} catch {
  supabaseHostname = undefined;
}

// ✅ خُد النوع كما هو من Next (بعد ما نشيل undefined)
type RemotePatterns = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>;

const remotePatterns: RemotePatterns = [
  { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
];

if (supabaseHostname) {
  remotePatterns.unshift({
    protocol: "https",
    hostname: supabaseHostname,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { simpleRateLimit } from "@/lib/rateLimit";
import { getPublicStorageUrl } from "@/lib/storagePublicUrl";

export const runtime = "nodejs";

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (!xf) return "unknown";
  return xf.split(",")[0]?.trim() || "unknown";
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    const rl = simpleRateLimit(`upload:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "Too many uploads. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Missing file." }, { status: 400 });
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, message: "File too large (max 5MB)." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ ok: false, message: "Unsupported file type." }, { status: 400 });
    }

    const bucket = "portfolio"; 
    const ext = file.name.split(".").pop() || "jpg";
    const filename = safeFileName(file.name || `image.${ext}`);
    const path = `projects/${crypto.randomUUID()}-${filename}`;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json({ ok: false, message: "Upload failed." }, { status: 500 });
    }

    const url = getPublicStorageUrl(bucket, path);
    return NextResponse.json({ ok: true, path, url });
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

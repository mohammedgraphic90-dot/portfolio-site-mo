import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim() || "unknown";
  return "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || "";

    const rl = await rateLimit(`contact:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))),
            "RateLimit-Limit": String(rl.limit),
            "RateLimit-Remaining": String(rl.remaining),
            "RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid data." }, { status: 400 });
    }

    if (parsed.data.company && parsed.data.company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      ip,
      user_agent: ua,
    });

    if (error) {
      return NextResponse.json({ ok: false, message: "Failed to send message." }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "RateLimit-Limit": String(rl.limit),
          "RateLimit-Remaining": String(rl.remaining),
          "RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to process request." }, { status: 500 });
  }
}

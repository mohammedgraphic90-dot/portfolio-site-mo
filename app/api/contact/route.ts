import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { simpleRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (!xf) return "unknown";
  return xf.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || "";

    const rl = simpleRateLimit(ip, 5, 60_000); 
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "طلبات كثيرة. حاول لاحقًا." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "بيانات غير صحيحة." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { ok: false, message: "حدث خطأ أثناء الإرسال." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "تعذر معالجة الطلب." },
      { status: 500 }
    );
  }
}

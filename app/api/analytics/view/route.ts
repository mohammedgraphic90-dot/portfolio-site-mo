import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const pageKey = String(body.pageKey ?? "").trim();

    if (!pageKey) {
      return NextResponse.json({ ok: false, message: "pageKey is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // upsert + increment
    const { data, error } = await supabase
      .from("page_views")
      .upsert({ page_key: pageKey, views: 0 }, { onConflict: "page_key" })
      .select("page_key, views")
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, message: "DB error" }, { status: 500 });
    }

    const { error: incErr } = await supabase
      .from("page_views")
      .update({ views: (data.views ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq("page_key", pageKey);

    if (incErr) {
      return NextResponse.json({ ok: false, message: "Increment failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}

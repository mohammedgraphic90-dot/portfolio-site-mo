import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("page_views")
      .select("page_key, views")
      .eq("page_key", "portfolio")
      .single();

    if (error) {
      return NextResponse.json({ ok: true, portfolioViews: 0 });
    }

    return NextResponse.json({ ok: true, portfolioViews: Number(data?.views ?? 0) });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}

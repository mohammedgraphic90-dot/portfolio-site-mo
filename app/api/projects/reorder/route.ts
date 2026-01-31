import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const supabase = getSupabaseAdmin();

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) return { ok: false as const, supabase, status: 401, message: "Unauthorized" };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email) {
    return { ok: false as const, supabase, status: 401, message: "Unauthorized" };
  }

  if (data.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return { ok: false as const, supabase, status: 403, message: "Forbidden" };
  }

  return { ok: true as const, supabase };
}

export async function POST(req: Request) {
  try {
    const gate = await requireAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
    }
    const supabase = gate.supabase;

    const body = await req.json();
    const aId = Number(body.aId);
    const bId = Number(body.bId);

    if (!Number.isFinite(aId) || !Number.isFinite(bId)) {
      return NextResponse.json({ ok: false, message: "Invalid ids." }, { status: 400 });
    }

    const { data: rows, error } = await supabase
      .from("projects")
      .select("id, sort_order")
      .in("id", [aId, bId]);

    if (error || !rows || rows.length !== 2) {
      return NextResponse.json({ ok: false, message: "Projects not found." }, { status: 404 });
    }

    const a = rows.find((r) => r.id === aId);
    const b = rows.find((r) => r.id === bId);

    if (!a || !b) {
      return NextResponse.json({ ok: false, message: "Projects not found." }, { status: 404 });
    }

    const aOrder = Number(a.sort_order);
    const bOrder = Number(b.sort_order);

    const temp = -Math.floor(Date.now() / 1000); 

    const { error: e1 } = await supabase.from("projects").update({ sort_order: temp }).eq("id", aId);
    if (e1) return NextResponse.json({ ok: false, message: "Reorder failed." }, { status: 500 });

    const { error: e2 } = await supabase.from("projects").update({ sort_order: aOrder }).eq("id", bId);
    if (e2) return NextResponse.json({ ok: false, message: "Reorder failed." }, { status: 500 });

    const { error: e3 } = await supabase.from("projects").update({ sort_order: bOrder }).eq("id", aId);
    if (e3) return NextResponse.json({ ok: false, message: "Reorder failed." }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

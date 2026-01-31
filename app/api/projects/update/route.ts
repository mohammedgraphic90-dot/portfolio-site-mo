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

    const id = Number(body.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, message: "Invalid id." }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, message: "Title is required." }, { status: 400 });
    }

    const payload = {
      title,
      category: String(body.category ?? "").trim() || null,
      description: String(body.description ?? "").trim() || null,
      project_url: String(body.project_url ?? "").trim() || null,
      image_url: String(body.image_url ?? "").trim() || null,
    };

    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, message: "Update failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
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

    const rl = simpleRateLimit(`create_project:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Try later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();

    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, message: "Title is required." }, { status: 400 });
    }

    const category = String(body.category ?? "").trim() || null;
    const description = String(body.description ?? "").trim() || null;
    const project_url = String(body.project_url ?? "").trim() || null;
    const image_url = String(body.image_url ?? "").trim() || null;

    const supabase = getSupabaseAdmin();

const { data: lastRow, error: lastErr } = await supabase
  .from("projects")
  .select("sort_order")
  .order("sort_order", { ascending: false })
  .order("id", { ascending: false })
  .limit(1)
  .maybeSingle();

if (lastErr) {
  return NextResponse.json({ ok: false, message: "Failed to read sort_order." }, { status: 500 });
}

const lastSort = typeof lastRow?.sort_order === "number" ? lastRow.sort_order : 0;
const nextSort = lastSort + 1;

const { data, error } = await supabase
  .from("projects")
  .insert({
    title,
    category,
    description,
    project_url,
    image_url,
    sort_order: nextSort, 
    is_published: true,
  })
  .select("id, slug")
  .single();


    if (error) {
      return NextResponse.json({ ok: false, message: "DB insert failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

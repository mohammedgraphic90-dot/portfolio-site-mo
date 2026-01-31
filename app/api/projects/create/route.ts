import { NextResponse } from "next/server";
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

    const rl = await rateLimit(`create_project:${ip}`, 10, 60_000);
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

    const title = String((body as any).title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, message: "Title is required." }, { status: 400 });
    }

    const category = String((body as any).category ?? "").trim() || null;
    const description = String((body as any).description ?? "").trim() || null;
    const project_url = String((body as any).project_url ?? "").trim() || null;
    const image_url = String((body as any).image_url ?? "").trim() || null;

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

    const lastSort = typeof (lastRow as any)?.sort_order === "number" ? (lastRow as any).sort_order : 0;
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

    return NextResponse.json(
      { ok: true, id: (data as any).id, slug: (data as any).slug },
      {
        headers: {
          "RateLimit-Limit": String(rl.limit),
          "RateLimit-Remaining": String(rl.remaining),
          "RateLimit-Reset": String(Math.ceil(rl.reset / 1000)),
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

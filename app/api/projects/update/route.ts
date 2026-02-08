import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import { revalidatePortfolioOnDemand } from "@/lib/publicProjects";

export const runtime = "nodejs";

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim() || "unknown";
  return "unknown";
}

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
    const ip = getIp(req);

    const rl = await rateLimit(`update_project:${ip}`, 60, 60_000);
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

    const gate = await requireAdmin(req);
    if (!gate.ok) {
      return NextResponse.json({ ok: false, message: gate.message }, { status: gate.status });
    }
    const supabase = gate.supabase;

    const body = await req.json();

    const id = Number((body as any).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, message: "Invalid id." }, { status: 400 });
    }

    const title = String((body as any).title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, message: "Title is required." }, { status: 400 });
    }

    const payload = {
      title,
      category: String((body as any).category ?? "").trim() || null,
      description: String((body as any).description ?? "").trim() || null,
      project_url: String((body as any).project_url ?? "").trim() || null,
      image_url: String((body as any).image_url ?? "").trim() || null,
    };

    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, message: "Update failed." }, { status: 500 });
    }

    let revalidated = true;
    try {
      await revalidatePortfolioOnDemand();
    } catch (cacheError) {
      revalidated = false;
      console.error("project update revalidation error:", cacheError);
    }

    return NextResponse.json(
      { ok: true, revalidated },
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

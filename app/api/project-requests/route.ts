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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ALLOWED_BUDGET = ["Under $500", "$500 – $1,000", "$1,000 – $3,000", "$3,000 – $7,000", "$7,000+"];

const ALLOWED_TIMELINE = ["ASAP", "1–2 weeks", "2–4 weeks", "1–2 months", "Not sure yet"];

const ALLOWED_SERVICES = ["UI/UX Design", "Website Development", "Performance Optimization", "Consulting", "Other"];

export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    const rl = await rateLimit(`project_request:${ip}`, 5, 60_000);
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

    const body = await req.json().catch(() => ({}));

    const website = String((body as any).website ?? "").trim();
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const name = String((body as any).name ?? "").trim();
    const email = String((body as any).email ?? "").trim();
    const company = String((body as any).company ?? "").trim() || null;

    const budgetRange = String((body as any).budgetRange ?? "").trim();
    const timeline = String((body as any).timeline ?? "").trim();

    const projectDetails = String((body as any).projectDetails ?? "").trim();

    const servicesNeededRaw = Array.isArray((body as any).servicesNeeded) ? (body as any).servicesNeeded : [];
    const servicesNeeded = servicesNeededRaw
      .map((x: any) => String(x).trim())
      .filter((x: string) => ALLOWED_SERVICES.includes(x));

    if (!name || name.length < 2) {
      return NextResponse.json({ ok: false, message: "Name is required." }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "A valid email is required." }, { status: 400 });
    }

    if (!ALLOWED_BUDGET.includes(budgetRange)) {
      return NextResponse.json({ ok: false, message: "Please select a valid budget range." }, { status: 400 });
    }

    if (!ALLOWED_TIMELINE.includes(timeline)) {
      return NextResponse.json({ ok: false, message: "Please select a valid timeline." }, { status: 400 });
    }

    if (!projectDetails || projectDetails.length < 20) {
      return NextResponse.json({ ok: false, message: "Project details must be at least 20 characters." }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || null;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("project_requests").insert({
      name,
      email,
      company,
      budget_range: budgetRange,
      timeline,
      services_needed: servicesNeeded,
      project_details: projectDetails,
      status: "new",
      ip,
      user_agent: userAgent,
    });

    if (error) {
      return NextResponse.json({ ok: false, message: "DB insert failed." }, { status: 500 });
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
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

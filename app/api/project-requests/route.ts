import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { simpleRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (!xf) return "unknown";
  return xf.split(",")[0]?.trim() || "unknown";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ALLOWED_BUDGET = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $3,000",
  "$3,000 – $7,000",
  "$7,000+",
];

const ALLOWED_TIMELINE = [
  "ASAP",
  "1–2 weeks",
  "2–4 weeks",
  "1–2 months",
  "Not sure yet",
];

const ALLOWED_SERVICES = [
  "UI/UX Design",
  "Website Development",
  "Performance Optimization",
  "Consulting",
  "Other",
];

export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    const rl = simpleRateLimit(`project_request:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Try again in 60 seconds." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => ({}));

    const website = String(body.website ?? "").trim();
    if (website) {
      return NextResponse.json({ ok: true }); 
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const company = String(body.company ?? "").trim() || null;

    const budgetRange = String(body.budgetRange ?? "").trim();
    const timeline = String(body.timeline ?? "").trim();

    const projectDetails = String(body.projectDetails ?? "").trim();

    const servicesNeededRaw = Array.isArray(body.servicesNeeded) ? body.servicesNeeded : [];
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
      return NextResponse.json(
        { ok: false, message: "Project details must be at least 20 characters." },
        { status: 400 }
      );
    }

    // user-agent
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
      console.error("project_requests insert error:", error);
      return NextResponse.json({ ok: false, message: "DB insert failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error." }, { status: 500 });
  }
}

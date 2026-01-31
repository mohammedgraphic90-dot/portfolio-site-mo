// D:\portfolio-site-mo\app\portfolio\page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Portfolio from "@/components/Portfolio";
import { getSupabasePublic } from "@/lib/supabasePublic";
import Link from "next/link";
import TrackView from "@/components/TrackView";

export const revalidate = 3600;

const PAGE_SIZE = 6;

type DbProject = {
  id: number;
  slug: string | null;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  sort_order: number;
};

type UiProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  url?: string;
};

function clampPage(n: number) {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

async function getProjects(page: number): Promise<{
  items: UiProject[];
  total: number;
  totalPages: number;
}> {
  const supabase = getSupabasePublic();

  const safePage = clampPage(page);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("projects")
    .select("id,slug,title,category,description,image_url,project_url,sort_order", {
      count: "exact",
    })
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("projects fetch error:", error);
    return { items: [], total: 0, totalPages: 1 };
  }

  const rows = (data ?? []) as DbProject[];

  const items: UiProject[] = rows
    .filter((p) => typeof p.slug === "string" && p.slug.trim().length > 0)
    .map((p) => ({
      id: p.id,
      slug: p.slug!.trim(),
      title: p.title,
      category: p.category ?? "Project",
      description: p.description ?? "",
      image: p.image_url ?? "https://picsum.photos/600/400?random=999",
      url: p.project_url?.trim() ? p.project_url.trim() : undefined,
    }));

  const total = typeof count === "number" ? count : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { items, total, totalPages };
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = clampPage(Number(sp.page ?? "1"));

  const { items, totalPages } = await getProjects(page);

  const currentPage = Math.min(page, totalPages);

  const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950 selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />
      <TrackView pageKey="portfolio" />

      <main>
        <Portfolio projects={items} />

        <div className="container mx-auto px-6 pb-16 -mt-10 relative z-10">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Link
              href={`/portfolio?page=${Math.max(1, currentPage - 1)}`}
              className={`px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              ← Prev
            </Link>

            {pagesToShow.map((p) => (
              <Link
                key={p}
                href={`/portfolio?page=${p}`}
                className={`px-4 py-2 rounded-xl border border-white/10 transition-colors ${
                  p === currentPage
                    ? "bg-teal-500/20 text-teal-200 border-teal-500/30"
                    : "bg-white/5 hover:bg-white/10 text-slate-200"
                }`}
              >
                {p}
              </Link>
            ))}

            <Link
              href={`/portfolio?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

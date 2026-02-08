import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Portfolio from "@/components/Portfolio";
import Link from "next/link";
import { PORTFOLIO_PAGE_SIZE, getPublicProjects, type PublicProject } from "@/lib/publicProjects";

export type PortfolioPageData = {
  items: PublicProject[];
  currentPage: number;
  totalPages: number;
  isOutOfRange: boolean;
};

function toPositiveInt(value: number) {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

export function getPortfolioHref(page: number) {
  if (page <= 1) return "/portfolio";
  return `/portfolio/page/${page}`;
}

export async function getPortfolioPageData(requestedPage: number): Promise<PortfolioPageData> {
  const projects = await getPublicProjects();

  const totalPages = Math.max(1, Math.ceil(projects.length / PORTFOLIO_PAGE_SIZE));
  const normalizedPage = toPositiveInt(requestedPage);
  const isOutOfRange = normalizedPage > totalPages;
  const currentPage = Math.min(normalizedPage, totalPages);

  const from = (currentPage - 1) * PORTFOLIO_PAGE_SIZE;
  const items = projects.slice(from, from + PORTFOLIO_PAGE_SIZE);

  return {
    items,
    currentPage,
    totalPages,
    isOutOfRange,
  };
}

export async function getPortfolioStaticPageParams() {
  const projects = await getPublicProjects();
  const totalPages = Math.max(1, Math.ceil(projects.length / PORTFOLIO_PAGE_SIZE));

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function PortfolioListingPage({
  page,
  data,
}: {
  page: number;
  data?: PortfolioPageData;
}) {
  const resolved = data ?? (await getPortfolioPageData(page));
  const pagesToShow = Array.from({ length: resolved.totalPages }, (_, i) => i + 1);

  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950 selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />

      <main>
        <Portfolio projects={resolved.items} />

        {resolved.totalPages > 1 ? (
          <div className="container mx-auto px-6 pb-16 -mt-10 relative z-10">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link
                href={getPortfolioHref(resolved.currentPage - 1)}
                className={`px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
                  resolved.currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Prev
              </Link>

              {pagesToShow.map((p) => (
                <Link
                  key={p}
                  href={getPortfolioHref(p)}
                  className={`px-4 py-2 rounded-xl border border-white/10 transition-colors ${
                    p === resolved.currentPage
                      ? "bg-teal-500/20 text-teal-200 border-teal-500/30"
                      : "bg-white/5 hover:bg-white/10 text-slate-200"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                href={getPortfolioHref(resolved.currentPage + 1)}
                className={`px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
                  resolved.currentPage === resolved.totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

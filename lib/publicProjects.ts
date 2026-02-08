import "server-only";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getSupabasePublic } from "@/lib/supabasePublic";

const PUBLIC_PROJECTS_CACHE_TAG = "public-projects";
const PUBLIC_PROJECTS_CACHE_KEY = "public-projects-v1";

export const PORTFOLIO_PAGE_SIZE = 6;

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

export type PublicProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  url?: string;
  sortOrder: number;
};

function toPublicProject(row: DbProject): PublicProject | null {
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  if (!slug) return null;

  const projectUrl = row.project_url?.trim();

  return {
    id: row.id,
    slug,
    title: row.title,
    category: row.category ?? "Project",
    description: row.description ?? "",
    image: row.image_url ?? "https://picsum.photos/1200/800?random=999",
    url: projectUrl ? projectUrl : undefined,
    sortOrder: row.sort_order,
  };
}

async function readPublishedProjectsFromSupabase(): Promise<PublicProject[]> {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase
    .from("projects")
    .select("id,slug,title,category,description,image_url,project_url,sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("public projects fetch error:", error);
    return [];
  }

  return ((data ?? []) as DbProject[])
    .map(toPublicProject)
    .filter((project): project is PublicProject => project !== null);
}

const getCachedPublishedProjects = unstable_cache(readPublishedProjectsFromSupabase, [PUBLIC_PROJECTS_CACHE_KEY], {
  tags: [PUBLIC_PROJECTS_CACHE_TAG],
});

export async function getPublicProjects() {
  return getCachedPublishedProjects();
}

export async function getPublicProjectBySlug(slug: string) {
  const normalized = slug.trim();
  if (!normalized) return null;

  const projects = await getCachedPublishedProjects();
  return projects.find((project) => project.slug === normalized) ?? null;
}

export async function revalidatePortfolioOnDemand() {
  revalidateTag(PUBLIC_PROJECTS_CACHE_TAG, { expire: 0 });

  // Warm the cache immediately after invalidation so user requests stay cache-only.
  await getCachedPublishedProjects();

  revalidatePath("/portfolio");
  revalidatePath("/portfolio/page/[page]", "page");
  revalidatePath("/portfolio/[slug]", "page");
}

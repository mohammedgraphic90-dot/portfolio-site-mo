import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabasePublic } from "@/lib/supabasePublic";

export const revalidate = 3600;

type DbProject = {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
};

async function getProjectBySlug(slug: string) {
  const supabase = getSupabasePublic();

  const { data, error } = await supabase
    .from("projects")
    .select("id,slug,title,category,description,image_url,project_url")
    .eq("is_published", true)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const p = data as DbProject;

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category ?? "Project",
    description: p.description ?? "",
    image: p.image_url ?? "https://picsum.photos/1200/800?random=999",
    url: p.project_url ?? "",
  };
}



export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; 
  const project = await getProjectBySlug(slug);


  if (!project) notFound();

  return (
    <div className="font-sans antialiased text-slate-200 bg-slate-950 selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <Link href="/portfolio" className="text-slate-400 hover:text-white transition-colors">
            ← Back to Portfolio
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-slate-900">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal-300 text-sm font-semibold mb-6">
              {project.category}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
              {project.title}
            </h1>

            <p className="text-slate-300 leading-8 text-lg mb-8">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-4">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold hover:shadow-[0_10px_30px_rgba(109,40,217,0.35)] transition-all"
                >
                  Live Demo
                </a>
              ) : null}

              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Contact Me
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

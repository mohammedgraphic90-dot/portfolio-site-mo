// D:\portfolio-site-mo\components\Portfolio.tsx

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { RevealOnView } from "@/components/RevealOnView";

type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  url?: string;
};

export default function Portfolio({ projects }: { projects: PortfolioProject[] }) {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-900/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-900/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Portfolio <span className="text-teal-400">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A curated selection of recent work—focused on detail and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project) => (
            <RevealOnView key={project.id} className="group">
              <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl hover:shadow-purple-500/20">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/0 transition-colors z-10" />

                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={false}
                    loading="lazy"
                    quality={75}
                  />

                  {/* Details (Eye) */}
                  <div className="absolute bottom-4 right-4 z-20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:bg-teal-400 hover:text-white transition-colors"
                      aria-label="view details"
                    >
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  <div className="absolute -top-5 left-6 bg-slate-800 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-teal-400 shadow-lg">
                    {project.category}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    <Link href={`/portfolio/${project.slug}`}>{project.title}</Link>
                  </h3>

                  <p className="text-slate-400 mb-6 line-clamp-2">{project.description}</p>

                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-teal-400 transition-colors"
                    >
                      Live demo
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-teal-400 transition-colors"
                    >
                      View details
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}

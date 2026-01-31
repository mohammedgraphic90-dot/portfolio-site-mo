"use client";

import { motion } from "framer-motion";
import { Palette, Code, Gauge, Lightbulb } from "lucide-react";
import type { Service } from "@/lib/types";

const services: Service[] = [
  {
    id: 1,
    title: "UI/UX Design",
    description:
      "Designing clean, user-friendly interfaces focused on improving user experience and business results.",
    icon: Palette,
  },
  {
    id: 2,
    title: "Web Development",
    description:
      "Building responsive, fast websites using modern technologies like React and Next.js with high quality standards.",
    icon: Code,
  },
  {
    id: 3,
    title: "Performance Optimization",
    description:
      "Analyzing and improving website speed and performance to deliver a better experience and boost SEO rankings.",
    icon: Gauge,
  },
  {
    id: 4,
    title: "Technical Consulting",
    description:
      "Helping founders and teams choose the right tools and architecture with practical, scalable solutions.",
    icon: Lightbulb,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-slate-900 relative scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What <span className="text-purple-400">I offer</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-slate-800/40 border border-white/5 p-6 rounded-2xl hover:bg-slate-800 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600/20 to-teal-400/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-6">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

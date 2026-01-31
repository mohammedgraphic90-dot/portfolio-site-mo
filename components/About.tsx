"use client";

import { motion } from "framer-motion";
import { User, MapPin, Mail, Calendar } from "lucide-react";
import type { Skill } from "@/lib/types";

const skills: Skill[] = [
  { name: "JavaScript / TypeScript", level: 95 },
  { name: "React.js / Next.js", level: 90 },
  { name: "Tailwind CSS", level: 95 },
  { name: "Node.js", level: 80 },
  { name: "UI/UX Design", level: 85 },
  { name: "Three.js / WebGL", level: 70 },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-20 bg-slate-900 relative scroll-mt-20 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Who <span className="text-purple-400">am I?</span>
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-teal-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl"
          >
            <p className="text-slate-300 leading-8 text-lg mb-8">
              I’m a developer and designer passionate about building modern digital
              experiences. I love mixing 3D visuals with fast performance. I have
              solid experience in building modern web apps using the latest
              technologies. I believe a website is not just code — it’s a complete
              experience that should leave a lasting impression.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="font-semibold text-white">Mohammed Ayman</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-semibold text-white">Cairo, Egypt</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Mail size={20} />
                </div>
<div className="min-w-0">
                  <p className="text-xs text-slate-400">Email</p>
        <p className="font-semibold text-white text-sm break-words leading-6">
  mohammedgraphic90@gmail.com
</p>


                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Age</p>
                  <p className="font-semibold text-white">29 years</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Bars */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Technical skills</h3>

            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-200 font-medium group-hover:text-teal-400 transition-colors">
                      {skill.name}
                    </span>
                    <span className="text-slate-400 text-sm">{skill.level}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 * index }}
                      className="h-full bg-gradient-to-r from-purple-600 to-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

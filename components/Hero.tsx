"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-8 lg:px-12 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left order-2 md:order-1 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal-400 text-sm font-semibold mb-6 backdrop-blur-sm">
              Hello, I'm Mohammed Ayman 👋
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              I craft digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
                3D experiences
              </span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0">
              A web developer and UI designer focused on building modern, fast web
              apps. I blend clean design with strong performance using the latest
              technologies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="/contact"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold hover:shadow-[0_10px_30px_rgba(109,40,217,0.5)] transition-all flex items-center justify-center gap-2 group"
              >
                Contact me
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="/portfolio"
                className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
              >
                View my work
              </a>
            </div>

            <div className="mt-10 flex items-center justify-center md:justify-start gap-6 text-slate-400">
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:scale-110 transition-all"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>

              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>

              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:scale-110 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="order-1 md:order-2 relative h-[400px] md:h-[600px] flex items-center justify-center perspective-1000">
          <motion.div
            animate={{ y: [0, -20, 0], rotateZ: [0, 2, 0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-md"
          >
            <div
              className="relative w-64 h-64 md:w-80 md:h-80 mx-auto"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateY(12deg) rotateX(6deg)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-teal-400 rounded-3xl blur-2xl opacity-40 animate-pulse" />

              <div
                className="absolute inset-0 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6"
                style={{ transform: "translateZ(10px)" }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 mb-4 shadow-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">&lt;/&gt;</span>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full mb-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full bg-purple-500"
                  />
                </div>

                <div className="w-3/4 h-3 bg-white/5 rounded-full mb-2" />
                <div className="w-1/2 h-3 bg-white/5 rounded-full" />
              </div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-12 -right-12"
              >
                <div
                  className="w-24 h-24 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-xl flex items-center justify-center"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <span className="text-4xl">🚀</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-8"
              >
                <div
                  className="w-20 h-20 bg-slate-900/90 backdrop-blur-md border border-teal-500/30 rounded-2xl shadow-xl flex items-center justify-center"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <span className="text-2xl font-bold text-white">UI</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

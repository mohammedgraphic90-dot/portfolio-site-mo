"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Twitter, Terminal } from "lucide-react";

export default function Hero() {
  const codeString = `import React from 'react';
function App() {
  return (
    <div className="matrix">
      <style>
         .hack { color: #2dd4bf; }
         .glow { filter: blur(4px); }
      </style>
      <code>
         System.init();
         // Loading 3D Engine...
         const power = 9000;
         <Header />
         <Hero />
         /* 
            Optimizing UI...
            Rendering Pixels...
         */
      </code>
    </div>
  );
}
export default App;`;

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
            animate={{
              y: [0, -20, 0],
              rotateZ: [0, 2, 0, -2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto [transform-style:preserve-3d] [transform:rotateY(12deg)_rotateX(6deg)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-teal-400 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>

              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden [transform:translateZ(10px)] group">
                <div className="absolute inset-0 opacity-10 font-mono text-[10px] leading-4 text-teal-400 p-4 select-none pointer-events-none">
                  <motion.div
                    animate={{ y: [0, -300] }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="whitespace-pre"
                  >
                    {codeString.repeat(3)}
                  </motion.div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 mb-6 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                    <span className="text-3xl font-bold text-white relative z-10">
                      &lt;/&gt;
                    </span>
                  </div>

                  <div className="w-full space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-teal-400 mb-1">
                        <span>INITIALIZING...</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 2, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-teal-400 to-purple-500 relative"
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5 backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <Terminal size={14} className="text-green-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-1.5 h-1.5">
                              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                              <div className="relative w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-[10px] font-bold text-white tracking-wider">
                              SYSTEM ACTIVE
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            Ready for deployment
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-[2px] items-end h-6 pb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 12, 6, 16, 4] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut",
                            }}
                            className="w-1 bg-purple-500/60 rounded-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-12 -right-12 w-24 h-24 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-xl flex items-center justify-center [transform:translateZ(20px)]"
              >
                <span className="text-4xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  🚀
                </span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-8 w-20 h-20 bg-slate-900/90 backdrop-blur-md border border-teal-500/30 rounded-2xl shadow-xl flex items-center justify-center [transform:translateZ(30px)]"
              >
                <span className="text-2xl font-bold text-white font-mono">UI</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

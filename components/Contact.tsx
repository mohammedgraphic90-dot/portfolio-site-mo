"use client";

import { useState } from "react";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    company: "", // honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.message || "Failed to send.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSent(true);
      setFormState({ name: "", email: "", message: "", company: "" });
    } catch {
      setIsSubmitting(false);
      setErrorMsg("Could not connect. Please try again.");
    }
  }

  return (
    <section
      id="contact"
      className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative scroll-mt-20"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-teal-400 text-sm font-bold tracking-wider uppercase mb-2 block">
            Have a project in mind?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Contact <span className="text-purple-400">me</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">
                Contact details
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Phone className="text-purple-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Phone</p>
                    <p className="text-white font-semibold">+20 100 621 6986</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                    <Mail className="text-teal-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <p className="text-white font-semibold">mohammedgraphic90@email.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Location</p>
                    <p className="text-white font-semibold">Cairo, Egypt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-slate-800/30 p-8 md:p-10 rounded-3xl border border-white/5 backdrop-blur-sm"
            >
              {isSent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="text-green-400 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Sent successfully!
                  </h3>
                  <p className="text-slate-400">
                    Thanks for reaching out — I’ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSent(false)}
                    className="mt-6 text-teal-400 font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Honeypot hidden field */}
                  <input
                    value={formState.company}
                    onChange={(e) =>
                      setFormState({ ...formState, company: e.target.value })
                    }
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                      placeholder="How can I help you?"
                    />
                  </div>

                  {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send message
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}

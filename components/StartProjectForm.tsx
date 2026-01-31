"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

type ApiResult = { ok: boolean; message?: string };

export default function StartProjectForm() {
  const budgetOptions = useMemo(
    () => ["Under $500", "$500 – $1,000", "$1,000 – $3,000", "$3,000 – $7,000", "$7,000+"],
    []
  );

  const timelineOptions = useMemo(
    () => ["ASAP", "1–2 weeks", "2–4 weeks", "1–2 months", "Not sure yet"],
    []
  );

  const serviceOptions = useMemo(
    () => ["UI/UX Design", "Website Development", "Performance Optimization", "Consulting", "Other"],
    []
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budgetRange: budgetOptions[1],
    timeline: timelineOptions[2],
    servicesNeeded: [] as string[],
    projectDetails: "",
    website: "", // honeypot hidden
  });

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleService(service: string) {
    setForm((p) => {
      const exists = p.servicesNeeded.includes(service);
      return {
        ...p,
        servicesNeeded: exists
          ? p.servicesNeeded.filter((x) => x !== service)
          : [...p.servicesNeeded, service],
      };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: ApiResult = await res.json().catch(() => ({ ok: false, message: "Bad response" }));

      if (!res.ok || !data.ok) {
        setErrorMsg(data.message || "Failed to send. Please try again.");
        setBusy(false);
        return;
      }

      setBusy(false);
      setSent(true);
      setForm({
        name: "",
        email: "",
        company: "",
        budgetRange: budgetOptions[1],
        timeline: timelineOptions[2],
        servicesNeeded: [],
        projectDetails: "",
        website: "",
      });
    } catch {
      setBusy(false);
      setErrorMsg("Connection failed. Please try again.");
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={onSubmit}
      className="bg-slate-800/30 p-8 md:p-10 rounded-3xl border border-white/5 backdrop-blur-sm"
    >
      {sent ? (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-400 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Request sent!</h3>
          <p className="text-slate-400">Thanks — I’ll get back to you soon.</p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-6 text-teal-400 font-bold hover:underline"
          >
            Send another request
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <input
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white">Start a project</h1>
            <p className="text-slate-400 mt-2">
              Share a few details about your project — I’ll reply with next steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Company (optional)</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Budget range *</label>
              <select
                value={form.budgetRange}
                onChange={(e) => setForm((p) => ({ ...p, budgetRange: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              >
                {budgetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Timeline *</label>
              <select
                value={form.timeline}
                onChange={(e) => setForm((p) => ({ ...p, timeline: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              >
                {timelineOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Services needed</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceOptions.map((s) => {
                  const checked = form.servicesNeeded.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={[
                        "text-left px-4 py-3 rounded-xl border transition-all",
                        checked
                          ? "bg-teal-500/10 border-teal-500/40 text-teal-200"
                          : "bg-slate-900/40 border-slate-700 text-slate-200 hover:border-white/20",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{s}</span>
                        <span
                          className={[
                            "w-4 h-4 rounded border",
                            checked ? "bg-teal-400/30 border-teal-400" : "border-slate-500",
                          ].join(" ")}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project details *</label>
            <textarea
              rows={6}
              required
              value={form.projectDetails}
              onChange={(e) => setForm((p) => ({ ...p, projectDetails: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              placeholder="Tell me what you want to build, features, references, goals, etc. (min 20 chars)"
            />
          </div>

          {errorMsg ? <p className="text-red-400 text-sm">{errorMsg}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            {busy ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Send request
                <Send size={18} />
              </>
            )}
          </button>

          <p className="text-xs text-slate-500">
            This form is for project requests. For general questions, use the Contact page.
          </p>
        </div>
      )}
    </motion.form>
  );
}

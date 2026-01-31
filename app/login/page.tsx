"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);

  // هنخزن الرسالة الحقيقية هنا
  const [err, setErr] = useState<string | null>(null);

  // لو عايز تعرض تفاصيل زيادة (اختياري)
  const [errDetails, setErrDetails] = useState<string | null>(null);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setErrDetails(null);

    try {
      const supabase = getSupabaseBrowser();

      const cleanEmail = email.trim();

     const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) {
  console.error("supabase login error:", error);
  setErr(`${error.message} (${error.status ?? "no-status"})`);
  return;
}

console.log("login ok:", data);
router.push("/dashboard");

      if (!data?.session) {
        console.warn("No session returned:", data);
        setErr("Signed in but no session returned. Check Supabase settings.");
        setErrDetails(JSON.stringify(data, null, 2));
        return;
      }

      router.push("/dashboard");
    } catch (e: any) {
      console.error("Login unexpected error:", e);
      setErr(e?.message || "Unexpected error.");
      setErrDetails(JSON.stringify(e, null, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-black mb-2">Admin Login</h1>
        <p className="text-slate-400 mb-6">Sign in to manage your portfolio.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {err ? (
            <div className="text-sm text-red-400 space-y-2">
              <div>{err}</div>

              {errDetails ? (
                <details className="text-xs text-red-300/90 whitespace-pre-wrap">
                  <summary className="cursor-pointer select-none">
                    Show technical details
                  </summary>
                  <pre className="mt-2 bg-black/30 border border-white/10 rounded-xl p-3 overflow-auto">
                    {errDetails}
                  </pre>
                </details>
              ) : null}
            </div>
          ) : null}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 py-3 font-bold disabled:opacity-70"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import AuthCard from '@/components/AuthCard'
import { useToastStore } from '@/store/toastStore'

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("aarav@example.com");
  const [password, setPassword] = useState("Password@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const highlights = [
    { label: "Smart discovery", value: "50+ colleges" },
    { label: "Fast compare", value: "2-click shortlist" },
    { label: "Saved profiles", value: "Resume your flow" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ data: { token: string; user: { id: string; name: string; email: string } } }>(
        "/api/auth/login",
        {
          method: "POST",
          body: { email, password }
        }
      );
      setAuth(response.data.token, response.data.user);
      useToastStore.getState().push({ message: 'Welcome back!', type: 'success' });
      document.cookie = `token=${response.data.token}; path=/; max-age=604800; samesite=lax`;
      router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to login";
      setError(msg);
      useToastStore.getState().push({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-shell py-10 md:py-14">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-slate-900 shadow-2xl shadow-slate-200/50 transition-all duration-500 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-900 dark:text-white dark:shadow-slate-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.1),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_38%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-2 text-sm text-blue-600 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Welcome back to CollegeCompass
              </div>
              <div className="space-y-3">
                <h1 className="max-w-lg text-4xl font-black tracking-tight sm:text-5xl text-slate-900 dark:text-white">Sign in to continue your college search.</h1>
                <p className="max-w-xl text-base leading-7 text-slate-500 font-medium dark:text-slate-200">
                  Pick up where you left off, review saved colleges, and keep your shortlist moving without starting over.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-blue-100 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600/70 dark:text-cyan-100/70">{item.label}</p>
                  <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-cyan-400/15 dark:text-cyan-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Secure session</p>
                <p className="text-sm text-slate-500 font-medium dark:text-slate-200">JWT login, saved on your device for a smooth return.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <AuthCard title="Login" subtitle="Use your account to continue">
            <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-700">Access account</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Login</h2>
              <p className="text-sm text-slate-600">Use your account details to resume discovery, comparisons, and saved progress.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:border-rose-900 dark:text-rose-400">{error}</div>
            ) : null}

            <button className="btn-primary w-full gap-2 py-3" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                New user? <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Create account</Link>
              </p>
            </form>
          </AuthCard>
        </section>
      </div>
    </main>
  );
}

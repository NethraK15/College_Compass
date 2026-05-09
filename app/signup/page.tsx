"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Sparkles, Users } from "lucide-react";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import AuthCard from '@/components/AuthCard'
import { useToastStore } from '@/store/toastStore'

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const benefits = [
    { label: "Save colleges", value: "Keep your shortlist in sync" },
    { label: "Compare faster", value: "Review details side by side" },
    { label: "Track progress", value: "Return to your profile anytime" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ data: { token: string; user: { id: string; name: string; email: string } } }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: { name, email, password }
        }
      );
      setAuth(response.data.token, response.data.user);
      useToastStore.getState().push({ message: 'Account created — welcome!', type: 'success' });
      document.cookie = `token=${response.data.token}; path=/; max-age=604800; samesite=lax`;
      router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to signup";
      setError(msg);
      useToastStore.getState().push({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-shell py-10 md:py-14">
      <div className="grid items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="order-2 flex items-center lg:order-1">
          <AuthCard title="Create account" subtitle="Quick sign up">
            <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-700">Start here</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
              <p className="text-sm text-slate-600">Join CollegeCompass to save colleges, compare options, and build your application shortlist.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}

            <button className="btn-primary w-full gap-2 py-3" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>

              <p className="text-sm text-slate-600">
                Already registered? <Link href="/login" className="font-medium text-cyan-700 hover:text-cyan-800">Login</Link>
              </p>
            </form>
          </AuthCard>
        </section>

        <section className="order-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-slate-900 shadow-2xl shadow-slate-200/50 transition-all duration-500 dark:border-white/10 dark:from-cyan-600 dark:via-blue-700 dark:to-slate-950 dark:text-white dark:shadow-cyan-900/50 lg:order-2">
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-2 text-sm text-blue-600 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Build your shortlist with style
              </div>
              <div className="space-y-3">
                <h2 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl text-slate-900 dark:text-white">A calmer way to pick the right college.</h2>
                <p className="max-w-lg text-base leading-7 text-slate-500 font-medium dark:text-slate-200">
                  Save favorites, compare programs, and keep your profile and notes in one place so decisions feel organized instead of overwhelming.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {benefits.map((item) => (
                <div key={item.label} className="rounded-2xl border border-blue-100 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600/70 dark:text-cyan-100/70">{item.label}</p>
                  <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-white/10 dark:text-cyan-100">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Made for students</p>
                <p className="text-sm text-slate-500 font-medium dark:text-slate-200">A focused workspace for discovery, comparison, and planning.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

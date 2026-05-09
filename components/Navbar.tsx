"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Compass, User, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationDropdown from "./NotificationDropdown";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Explore" },
  { href: "/compare", label: "Compare" },
  { href: "/predictor", label: "Predictor" },
  { href: "/questions", label: "Q&A Hub" },
  { href: "/saved", label: "My Roadmap" }
];

export default function Navbar() {
  const { user, logout, hydrate } = useAuthStore();
  const router = useRouter();
  const displayName = user?.name?.trim()?.split(/\s+/)[0] || "Student";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:rotate-45 transition-transform duration-500 dark:bg-blue-600">
            <Compass className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CollegeCompass</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationDropdown />
          {user ? (
            <div className="flex items-center gap-3 ml-1">
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Navigator</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
              </div>
              <Link href="/profile" className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all shadow-inner dark:bg-slate-800 dark:text-slate-400">
                <User className="h-6 w-6" />
              </Link>
              <button
                className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-all dark:text-slate-400 dark:hover:text-white" href="/login">
                Login
              </Link>
              <Link className="btn-primary py-3" href="/signup">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

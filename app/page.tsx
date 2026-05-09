"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import CollegeCard from "@/components/CollegeCard";
import Pagination from "@/components/Pagination";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { fetchColleges, apiRequest } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { type CollegeTrackingStatus } from "@/lib/college-tracking";
import {
  Compass,
  Navigation,
  Target,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  GraduationCap,
  MessageSquareQuote,
  ChevronRight
} from "lucide-react";

const highlights = [
  {
    title: "North Star Discovery",
    description: "Navigate through thousands of colleges with real-time data and peer insights.",
    icon: Compass
  },
  {
    title: "Pathfinder Tools",
    description: "Compare fees, placements, and eligibility in a side-by-side directed flow.",
    icon: Navigation
  },
  {
    title: "Decision Precision",
    description: "Predict your admission chances based on historical database rules.",
    icon: Target
  }
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minFees, setMinFees] = useState("0");
  const [maxFees, setMaxFees] = useState("1000000");
  const [page, setPage] = useState(1);
  const { token, user, hydrate } = useAuthStore();
  const pushToast = useToastStore((s) => s.push);
  const displayName = user?.name?.trim()?.split(/\s+/)[0] || "Student";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const debouncedSearch = useDebounce(search, 500);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (location.trim()) params.set("location", location.trim());
    params.set("minFees", minFees || "0");
    params.set("maxFees", maxFees || "10000000");
    params.set("page", String(page));
    params.set("pageSize", "6");
    return `?${params.toString()}`;
  }, [debouncedSearch, location, minFees, maxFees, page]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["colleges", queryString],
    queryFn: () => fetchColleges(queryString)
  });

  async function handleTrack(collegeId: string, status: CollegeTrackingStatus) {
    if (!token) {
      pushToast({ type: "error", message: "Please login to track colleges" });
      return false;
    }
    try {
      await apiRequest("/api/saved-colleges", {
        method: "POST",
        token,
        body: { collegeId, status }
      });
      pushToast({ type: "success", title: "Tracked!", message: `Successfully added to roadmap` });
      return true;
    } catch (e) {
      pushToast({ type: "error", message: "Failed to track college" });
      return false;
    }
  }

  return (
    <section className="space-y-16 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 p-10 md:p-20 text-slate-900 shadow-2xl dark:bg-slate-950 dark:border-slate-800 dark:text-white transition-colors duration-500">
        <div className="absolute top-0 right-0 p-12 opacity-10 dark:opacity-20">
          <Compass className="h-96 w-96 text-blue-500 animate-[spin_60s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.1),transparent_50%)]" />
        
        <div className="relative z-10 max-w-4xl space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/10 bg-blue-500/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles className="h-4 w-4" /> Your Academic Compass
            </div>
            <p className="text-xl font-bold text-slate-400 dark:text-blue-400/60 animate-in fade-in slide-in-from-left duration-700">
              Hello <span className="text-slate-900 dark:text-white">{displayName}</span>, let&apos;s dive in
            </p>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Navigate Your <br/> <span className="text-blue-600 dark:text-blue-500">Future</span> With Clarity.
          </h1>
          
          <p className="max-w-2xl text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
            Stop guessing and start navigating. College Compass provides data-driven signals to help you find, compare, and track your perfect campus match.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="#browse" className="btn-primary h-16 px-10 rounded-2xl">
              Start Exploring <ChevronRight className="h-5 w-5 ml-2" />
            </Link>
            <Link href="/compare" className="btn-secondary h-16 px-10 rounded-2xl">
              Compare Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="card p-8 group hover:border-blue-500/30 transition-all border-slate-100 dark:border-slate-800">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner dark:bg-slate-900 dark:text-blue-400">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-3 text-slate-500 font-medium leading-relaxed dark:text-slate-400">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Browse Section */}
      <div id="browse" className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Browse Institutions</h2>
            <p className="mt-2 text-slate-500 font-medium dark:text-slate-400">Use our directional filters to narrow down your search.</p>
          </div>
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="px-4 py-2 rounded-xl bg-white text-xs font-bold uppercase tracking-widest shadow-sm text-blue-600 dark:bg-slate-950">Active Records</span>
          </div>
        </div>

        <div className="card p-8 grid gap-4 md:grid-cols-4 bg-white/50 backdrop-blur-xl border-dashed dark:bg-slate-900/30 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Name</label>
            <input
              className="input"
              placeholder="Search college..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Location</label>
            <input
              className="input"
              placeholder="Filter by city..."
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Min Fees</label>
            <input
              className="input"
              type="number"
              value={minFees}
              onChange={(e) => { setMinFees(e.target.value); setPage(1); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Max Fees</label>
            <input
              className="input"
              type="number"
              value={maxFees}
              onChange={(e) => { setMaxFees(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <Compass className="h-16 w-16 text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning Databases...</p>
          </div>
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : (
          <div className="space-y-12">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {data?.data.map((college) => (
                <CollegeCard key={college.id} college={college} onTrack={handleTrack} trackDisabled={!token} />
              ))}
            </div>

            {data?.data.length === 0 && (
              <div className="card p-20 text-center space-y-4">
                <Search className="h-12 w-12 text-slate-200 mx-auto" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">No matches found</p>
                <p className="text-slate-500 font-medium">Try adjusting your filters to broaden your search.</p>
              </div>
            )}

            {data && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  refetch();
                  window.scrollTo({ top: document.getElementById('browse')?.offsetTop, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

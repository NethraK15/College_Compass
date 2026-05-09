"use client";
// Trigger re-compilation

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, fetchColleges } from "@/services/api";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useAuthStore } from "@/store/authStore";
import { currencyINR } from "@/lib/utils";
import { 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  Medal, 
  Scale, 
  Trophy, 
  ListOrdered, 
  TableProperties,
  Compass,
  Search
} from "lucide-react";
import { WeighingMachine, RankingList, ComparisonTable } from "@/components/ComparisonTools";

type ResultItem = {
  id: string;
  name: string;
  fees: number;
  placementRate: number;
  rating: number;
  location: string;
};

const metricTabs = ["fees", "placementRate", "rating", "location"] as const;
type MetricKey = (typeof metricTabs)[number];

const metricMeta: Record<MetricKey, { label: string; helper: string }> = {
  fees: {
    label: "Fees",
    helper: "Lower is better when you want a safer, more affordable choice."
  },
  placementRate: {
    label: "Placement",
    helper: "Higher placement usually means a stronger return on your degree."
  },
  rating: {
    label: "Rating",
    helper: "Higher ratings suggest happier students and a steadier campus experience."
  },
  location: {
    label: "Location",
    helper: "Location is a practical tie-breaker for travel, internships, and comfort."
  }
};

function formatLocationGroupName(location: string) {
  return location.trim() || "Unknown location";
}

function getRelativeBarValue(metric: MetricKey, item: ResultItem, result: ResultItem[]) {
  if (metric === "location") {
    const counts = new Map<string, number>();
    result.forEach((college) => {
      const key = college.location.toLowerCase().trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const maxCount = Math.max(...Array.from(counts.values()), 1);
    return ((counts.get(item.location.toLowerCase().trim()) || 1) / maxCount) * 100;
  }

  const values = result.map((college) => college[metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) return 100;

  const raw = item[metric];
  const normalized = metric === "fees" ? (max - raw) / (max - min) : (raw - min) / (max - min);
  return Math.max(0, Math.min(100, normalized * 100));
}

function getFriendlyInsight(metric: MetricKey, result: ResultItem[]) {
  const sorted = [...result];

  if (metric === "fees") {
    sorted.sort((a, b) => a.fees - b.fees);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const spread = currencyINR(worst.fees - best.fees);
    return `${best.name} is the lowest-cost option. The fee gap across this set is ${spread}, so budget-conscious students should lean toward it.`;
  }

  if (metric === "placementRate") {
    sorted.sort((a, b) => b.placementRate - a.placementRate);
    const best = sorted[0];
    return `${best.name} leads on placement rate. If job outcomes are the priority, this is the strongest signal in the comparison.`;
  }

  if (metric === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
    const best = sorted[0];
    return `${best.name} has the highest student rating. That usually points to a more balanced day-to-day experience on campus.`;
  }

  const locations = result.reduce<Record<string, number>>((acc, college) => {
    const key = formatLocationGroupName(college.location);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const groupedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]);
  const [topLocation, count] = groupedLocations[0] || ["Unknown location", 0];
  if (groupedLocations.length === 1) {
    return `All selected colleges are in ${topLocation}. That makes location an easy tie-breaker and keeps your travel context simple.`;
  }

  return `${count} of your selected colleges are in ${topLocation}. If commute, internships, or city comfort matter, that cluster is the easiest place to compare.`;
}

function getTopPick(result: ResultItem[]) {
  const scored = result.map((item) => {
    const feesScore = 100 - getRelativeBarValue("fees", item, result);
    const placementScore = getRelativeBarValue("placementRate", item, result);
    const ratingScore = getRelativeBarValue("rating", item, result);
    const locationScore = getRelativeBarValue("location", item, result);
    return {
      ...item,
      score: feesScore * 0.35 + placementScore * 0.4 + ratingScore * 0.2 + locationScore * 0.05
    };
  });

  return scored.sort((a, b) => b.score - a.score)[0];
}

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [comparisonName, setComparisonName] = useState("My Comparison");
  const [result, setResult] = useState<ResultItem[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("fees");
  const { token, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["compare-college-options"],
    queryFn: () => fetchColleges("?page=1&pageSize=50")
  });

  const selectedCount = selected.length;
  const canCompare = selectedCount >= 2 && selectedCount <= 3;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedCountLabel = `${selectedCount} / 3 selected`;
  const topPick = useMemo(() => (result ? getTopPick(result) : null), [result]);

  const metricSummary = useMemo(() => {
    if (!result) return null;
    const feeWinner = [...result].sort((a, b) => a.fees - b.fees)[0];
    const placementWinner = [...result].sort((a, b) => b.placementRate - a.placementRate)[0];
    const ratingWinner = [...result].sort((a, b) => b.rating - a.rating)[0];
    const locationCount = result.reduce<Record<string, number>>((acc, college) => {
      acc[college.location] = (acc[college.location] || 0) + 1;
      return acc;
    }, {});
    const locationLeader = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0];

    return {
      fees: feeWinner,
      placementRate: placementWinner,
      rating: ratingWinner,
      location: locationLeader
        ? {
            name: locationLeader[0],
            count: locationLeader[1]
          }
        : null
    };
  }, [result]);

  function toggleCollege(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  }

  async function runCompare() {
    try {
      setStatus(null);
      const response = await apiRequest<{
        data: {
          colleges: Array<{
            id: string;
            name: string;
            fees: number;
            placementRate: number;
            rating: number;
            location: string;
          }>;
        };
      }>("/api/compare", {
        method: "POST",
        body: { collegeIds: selected }
      });
      setResult(response.data.colleges);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to compare");
    }
  }

  async function saveComparison() {
    if (!token) {
      setStatus("Login required to save comparison");
      return;
    }
    if (!result || result.length < 2) {
      setStatus("Run comparison first");
      return;
    }

    try {
      await apiRequest("/api/saved-comparisons", {
        method: "POST",
        token,
        body: {
          name: comparisonName,
          collegeIds: result.map((item) => item.id)
        }
      });
      setStatus("Comparison saved");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to save comparison");
    }
  }

  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(college => 
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.data, searchQuery]);

  return (
    <section className="space-y-8 lg:space-y-10">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl transition-all duration-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white md:p-8 lg:p-10">
        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-20">
          <Compass className="h-64 w-64 text-blue-500 animate-[spin_60s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.03),transparent_32%)]" />
        <div className="relative z-10 space-y-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" />
              Compare 2 to 3 colleges
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900 dark:text-white">See the tradeoffs, not just the table.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Pick a few colleges and get a visual breakdown of fees, placement, rating, and location with friendly insights on what each metric means.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-blue-400/60">Selected</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{selectedCountLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-blue-400/60">Compare mode</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{canCompare ? "Ready" : "Pick 2+"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-blue-400/60">Focus</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{metricMeta[activeMetric].label}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-blue-400/60">Saved</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">1 click</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? <LoadingState text="Loading college options..." /> : null}
      {isError ? <ErrorState message={(error as Error).message} /> : null}

      {!isLoading && !isError ? (
        <div className="flex flex-col gap-10">
          <div className="card p-6 md:p-10 dark:bg-slate-900/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-10 mb-10">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Step 1: Choose colleges to compare</h2>
                <p className="mt-3 text-slate-500 font-medium leading-relaxed dark:text-slate-400">
                  Select up to 3 colleges from our database to see a side-by-side visualization of their strengths.
                </p>
              </div>
              <div className="w-full lg:w-96 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Search Institution</label>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    className="input pl-12 h-14"
                    placeholder="Type name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((college) => (
                <button
                  key={college.id}
                  type="button"
                  onClick={() => toggleCollege(college.id)}
                  className={`group relative rounded-[2rem] border-2 p-6 text-left transition-all duration-500 ${
                    selectedSet.has(college.id)
                      ? "border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-500/10 scale-[1.02] dark:bg-blue-900/10"
                      : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">{college.location}</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900 truncate dark:text-white">{college.name}</h3>
                    </div>
                    <div className={`shrink-0 rounded-2xl p-3 transition-colors ${selectedSet.has(college.id) ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 dark:bg-slate-800 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
                      {selectedSet.has(college.id) ? <CheckCircle2 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Annual Fees</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currencyINR(college.fees)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Placement Rate</span>
                      <span className="font-bold text-slate-900 dark:text-white">{college.placementRate}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
              <button 
                className={`btn-primary h-16 px-12 text-lg shadow-xl transition-all ${!canCompare ? 'opacity-50 grayscale' : 'hover:scale-[1.02] active:scale-95 bg-blue-600'}`} 
                onClick={runCompare} 
                disabled={!canCompare}
              >
                Launch Showdown
              </button>
              <div className="flex-1 min-w-[280px] max-w-sm">
                <input
                  className="input h-16"
                  value={comparisonName}
                  onChange={(e) => setComparisonName(e.target.value)}
                  placeholder="Label this journey (e.g. Dream Schools)"
                />
              </div>
              <button className="btn-secondary h-16 px-10 rounded-2xl font-bold dark:bg-slate-800 dark:border-slate-700" onClick={saveComparison}>
                Save Progress
              </button>
            </div>
            {status ? (
              <div className="mt-6 p-5 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40">
                {status}
              </div>
            ) : null}
          </div>

          {result ? (
            <div className="space-y-16 py-10">
              {/* 1. Dynamic Visualization (Weighing Machine or Ranking) */}
              {result.length === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm dark:bg-blue-600 dark:text-white dark:border-none">
                      <Scale className="h-5 w-5" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Showdown</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
                  </div>
                  <WeighingMachine colleges={result} />
                </div>
              )}

              {result.length === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm dark:bg-blue-600 dark:text-white dark:border-none">
                      <ListOrdered className="h-5 w-5" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Rankings</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
                  </div>
                  <RankingList colleges={result} />
                </div>
              )}

              {/* 2. Detailed Comparison Table */}
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <div className="flex items-center justify-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 text-slate-500 border border-slate-100 shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                    <TableProperties className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Matrix</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
                </div>
                <ComparisonTable colleges={result} />
              </div>

              {/* 3. Overall Pick & Insights Section (Aligned vertically) */}
              <div className="flex flex-col gap-10">
                <div className="card p-8 md:p-12 bg-blue-600 text-white shadow-2xl border-none relative overflow-hidden dark:bg-blue-700">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Medal className="h-40 w-40" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                        <Trophy className="h-3.5 w-3.5" /> Recommended Choice
                      </div>
                      <h2 className="text-4xl font-bold tracking-tight">The North Star Fit</h2>
                      <p className="text-blue-50/80 text-sm font-medium leading-relaxed max-w-xl">
                        Based on your current metrics, this institution offers the most balanced signal across academic and financial markers.
                      </p>
                    </div>
                    
                    {topPick ? (
                      <div className="w-full md:w-auto">
                        <div className="rounded-[2.5rem] bg-white p-8 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white transition-colors duration-500 min-w-[320px]">
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Top Result</span>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/20">
                              <Medal className="h-5 w-5" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold tracking-tight">{topPick.name}</h3>
                          <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Fees</p>
                              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{currencyINR(topPick.fees)}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Placement</p>
                              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{topPick.placementRate}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="card p-8 md:p-10">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Deep Dive</p>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">Metric Analysis</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
                      {metricTabs.map((metric) => (
                        <button
                          key={metric}
                          onClick={() => setActiveMetric(metric)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeMetric === metric ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                          {metricMeta[metric].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-slate-600 leading-relaxed italic border-l-4 border-cyan-500 pl-4 py-2">
                      &quot;{metricMeta[activeMetric].helper}&quot;
                    </p>
                    
                    <div className="space-y-4">
                      {result.map((item) => {
                        const barValue = getRelativeBarValue(activeMetric, item, result);
                        return (
                          <div key={item.id} className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold">
                              <span className="text-slate-900 truncate max-w-[180px]">{item.name}</span>
                              <span className="text-cyan-600">{Math.round(barValue)}% Score</span>
                            </div>
                            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(8, barValue)}%` }}
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-lg" 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Friendly Insights (Full width) */}
              <div className="card p-8 md:p-10 border-2 border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Expert Insights</h2>
                    <p className="text-slate-500 text-sm">Automated breakdown based on industry data</p>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {metricTabs.map((metric) => {
                    const winner =
                      metric === "fees" ? [...result].sort((a, b) => a.fees - b.fees)[0] :
                      metric === "placementRate" ? [...result].sort((a, b) => b.placementRate - a.placementRate)[0] :
                      metric === "rating" ? [...result].sort((a, b) => b.rating - a.rating)[0] : null;

                    return (
                      <div key={metric} className="group rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-cyan-200 hover:shadow-xl">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">{metricMeta[metric].label}</p>
                          {winner && (
                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase border border-emerald-100">
                              <Trophy className="h-3 w-3" /> Winner
                            </div>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{getFriendlyInsight(metric, result)}</p>
                        {winner && <p className="mt-4 text-sm font-bold text-slate-900 border-t border-slate-50 pt-4">Recommendation: {winner.name}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

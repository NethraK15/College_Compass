"use client";
// Trigger re-compilation

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, 
  Trophy, 
  IndianRupee, 
  Briefcase, 
  Star, 
  MapPin, 
  TrendingUp, 
  ChevronDown,
  Info
} from "lucide-react";
import { currencyINR } from "@/lib/utils";

type College = {
  id: string;
  name: string;
  fees: number;
  placementRate: number;
  rating: number;
  location: string;
  averageSalaryLpa: number;
};

type Criteria = "fees" | "placementRate" | "rating" | "averageSalaryLpa";

const criteriaMeta: Record<Criteria, { label: string; icon: any; color: string; description: string }> = {
  fees: { 
    label: "Fees", 
    icon: IndianRupee, 
    color: "bg-emerald-500",
    description: "Lower fees are prioritized. The more affordable college wins."
  },
  placementRate: { 
    label: "Placement", 
    icon: Briefcase, 
    color: "bg-blue-500",
    description: "Higher placement rates are prioritized. The college with better job prospects wins."
  },
  rating: { 
    label: "Rating", 
    icon: Star, 
    color: "bg-amber-500",
    description: "Higher student ratings are prioritized. The college with better student satisfaction wins."
  },
  averageSalaryLpa: {
    label: "Avg Salary",
    icon: TrendingUp,
    color: "bg-indigo-500",
    description: "Higher average salaries (LPA) are prioritized. This indicates better financial ROI."
  }
};

export const WeighingMachine = ({ colleges }: { colleges: College[] }) => {
  const [activeCriteria, setActiveCriteria] = useState<Criteria>("placementRate");

  if (colleges.length !== 2) return null;

  const [c1, c2] = colleges;

  const getWinner = () => {
    if (activeCriteria === "fees") {
      return c1.fees < c2.fees ? c1 : c2;
    }
    if (activeCriteria === "placementRate") {
      return c1.placementRate > c2.placementRate ? c1 : c2;
    }
    if (activeCriteria === "rating") {
      return c1.rating > c2.rating ? c1 : c2;
    }
    if (activeCriteria === "averageSalaryLpa") {
      return c1.averageSalaryLpa > c2.averageSalaryLpa ? c1 : c2;
    }
    return c1;
  };

  const winner = getWinner();
  const tiltAngle = winner.id === c1.id ? -15 : 15;

  return (
    <div className="card overflow-hidden bg-white/50 p-6 md:p-10 dark:bg-slate-900/50">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">The Ultimate Showdown</h2>
        <p className="mt-3 text-slate-500 font-medium italic dark:text-slate-400">Select a criteria to see which college weighs down the competition</p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {(Object.keys(criteriaMeta) as Criteria[]).map((key) => {
            const Meta = criteriaMeta[key];
            const Icon = Meta.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCriteria(key)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all ${
                  activeCriteria === key 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {Meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex flex-col items-center py-16">
        <div className="absolute bottom-0 h-4 w-40 rounded-t-full bg-slate-200 dark:bg-slate-800" />
        <div className="absolute bottom-4 h-40 w-5 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700" />
        
        <motion.div 
          className="relative z-10 flex h-2.5 w-[90%] max-w-2xl items-center justify-between rounded-full bg-slate-800 dark:bg-blue-600"
          animate={{ rotate: tiltAngle }}
          transition={{ type: "spring", stiffness: 40, damping: 12 }}
        >
          <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-700 bg-slate-200 shadow-inner dark:border-blue-700 dark:bg-slate-400" />
          
          {/* Scale 1 */}
          <div className="absolute left-0 top-0 flex -translate-x-1/2 flex-col items-center">
             <div className="h-20 w-1 bg-slate-300 dark:bg-blue-400/30" />
             <div className="h-2.5 w-20 rounded-full bg-slate-400 dark:bg-blue-400" />
             <motion.div 
                className="mt-4 w-48 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl dark:bg-slate-800 dark:border-slate-700"
                animate={{ rotate: -tiltAngle }}
                transition={{ type: "spring", stiffness: 40, damping: 12 }}
             >
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{c1.location}</p>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c1.name}</p>
                  <div className="pt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCriteria === "fees" ? currencyINR(c1.fees) : 
                     activeCriteria === "placementRate" ? `${c1.placementRate}%` : 
                     activeCriteria === "rating" ? `${c1.rating.toFixed(1)}` :
                     `${c1.averageSalaryLpa}L`}
                  </div>
                </div>
             </motion.div>
          </div>

          {/* Scale 2 */}
          <div className="absolute right-0 top-0 flex translate-x-1/2 flex-col items-center">
             <div className="h-20 w-1 bg-slate-300 dark:bg-blue-400/30" />
             <div className="h-2.5 w-20 rounded-full bg-slate-400 dark:bg-blue-400" />
             <motion.div 
                className="mt-4 w-48 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl dark:bg-slate-800 dark:border-slate-700"
                animate={{ rotate: -tiltAngle }}
                transition={{ type: "spring", stiffness: 40, damping: 12 }}
             >
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{c2.location}</p>
                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{c2.name}</p>
                  <div className="pt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCriteria === "fees" ? currencyINR(c2.fees) : 
                     activeCriteria === "placementRate" ? `${c2.placementRate}%` : 
                     activeCriteria === "rating" ? `${c2.rating.toFixed(1)}` :
                     `${c2.averageSalaryLpa}L`}
                  </div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 rounded-[2rem] bg-blue-50/50 p-8 text-center border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6 dark:bg-blue-900/30">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{winner.name} Leads</h3>
        <p className="mt-3 text-slate-600 font-medium dark:text-slate-400 max-w-lg mx-auto">{criteriaMeta[activeCriteria].description}</p>
      </div>
    </div>
  );
};

export const RankingList = ({ colleges }: { colleges: College[] }) => {
  const [activeCriteria, setActiveCriteria] = useState<Criteria>("placementRate");

  const rankedColleges = useMemo(() => {
    return [...colleges].sort((a, b) => {
      if (activeCriteria === "fees") return a.fees - b.fees;
      if (activeCriteria === "placementRate") return b.placementRate - a.placementRate;
      if (activeCriteria === "rating") return b.rating - a.rating;
      if (activeCriteria === "averageSalaryLpa") return b.averageSalaryLpa - a.averageSalaryLpa;
      return 0;
    });
  }, [colleges, activeCriteria]);

  return (
    <div className="card bg-white p-6 md:p-10 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div>
          <h2 className="text-3xl font-bold">Priority Rankings</h2>
          <p className="text-slate-500 font-medium mt-1 dark:text-slate-400">Institutions ordered by your selected signal</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(criteriaMeta) as Criteria[]).map((key) => {
            const Meta = criteriaMeta[key];
            const Icon = Meta.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCriteria(key)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                  activeCriteria === key 
                    ? "bg-blue-600 text-white shadow-xl" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {Meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {rankedColleges.map((college, index) => (
            <motion.div
              layout
              key={college.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex items-center gap-6 rounded-3xl p-5 md:p-6 transition-colors ${
                index === 0 ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
              }`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${
                index === 0 ? "bg-white text-blue-600 shadow-lg" : 
                index === 1 ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : 
                "bg-white text-slate-400 border border-slate-100 dark:bg-slate-800 dark:border-slate-800"
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? "text-blue-100" : "text-blue-600"}`}>{college.location}</p>
                <h3 className="text-xl font-bold truncate">{college.name}</h3>
              </div>

              <div className="text-right">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? "text-white/60" : "text-slate-400"}`}>{criteriaMeta[activeCriteria].label}</p>
                <p className="text-2xl font-bold">
                   {activeCriteria === "fees" ? currencyINR(college.fees) : 
                    activeCriteria === "placementRate" ? `${college.placementRate}%` : 
                    activeCriteria === "rating" ? `${college.rating.toFixed(1)}` :
                    `${college.averageSalaryLpa}L`}
                </p>
              </div>

              {index === 0 && (
                <div className="absolute -top-3 -right-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl animate-bounce">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-10 rounded-[2rem] bg-blue-50 text-blue-600 p-6 flex gap-4 dark:bg-blue-900/10 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
        <Info className="h-6 w-6 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-relaxed">
          The rankings are calculated dynamically based on the <strong>{criteriaMeta[activeCriteria].label}</strong> signal. 
          {activeCriteria === "fees" ? " Lower fees are prioritized for financial accessibility." : " Higher values indicate stronger performance in this category."}
        </p>
      </div>
    </div>
  );
};

export const ComparisonTable = ({ colleges }: { colleges: College[] }) => {
  return (
    <div className="card overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="border-b border-slate-100 bg-slate-50/50 p-8 dark:bg-slate-950 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Comparative Matrix</h2>
        <p className="text-sm text-slate-500 font-medium mt-1 dark:text-slate-400">Side-by-side breakdown of academic and financial signals</p>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Signal</th>
              {colleges.map((college) => (
                <th key={college.id} className="p-6 text-lg font-bold text-slate-900 border-b border-slate-100 dark:text-white dark:border-slate-800 min-w-[250px]">
                  {college.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Location</td>
              {colleges.map((college) => (
                <td key={college.id} className="p-6 text-slate-900 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {college.location}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Annual Fees</td>
              {colleges.map((college) => (
                <td key={college.id} className="p-6 font-bold text-slate-900 dark:text-white text-lg">
                  {currencyINR(college.fees)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Placement Rate</td>
              {colleges.map((college) => (
                <td key={college.id} className="p-6">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 dark:text-white min-w-[3rem]">{college.placementRate}%</span>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full bg-blue-600 rounded-full shadow-glow" 
                        style={{ width: `${college.placementRate}%` }} 
                      />
                    </div>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Student Rating</td>
              {colleges.map((college) => (
                <td key={college.id} className="p-6">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {college.rating.toFixed(1)} / 5.0
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Avg Salary</td>
              {colleges.map((college) => (
                <td key={college.id} className="p-6 font-bold text-slate-900 dark:text-white">
                  {college.averageSalaryLpa} LPA
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30 dark:bg-slate-950/30">Value Score</td>
              {colleges.map((college) => {
                const score = (college.placementRate * 0.6 + college.rating * 20 - (college.fees / 50000)) / 10;
                return (
                  <td key={college.id} className="p-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {Math.max(0, score).toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

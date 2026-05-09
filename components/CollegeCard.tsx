"use client";

import Link from "next/link";
import { Building2, IndianRupee, MapPin, Star, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { College } from "@/types";
import { currencyINR } from "@/lib/utils";
import {
  collegeTrackingStatuses,
  collegeTrackingStatusLabels,
  collegeTrackingStatusStyles,
  type CollegeTrackingStatus
} from "@/lib/college-tracking";

type Props = {
  college: College;
  onTrack?: (collegeId: string, status: CollegeTrackingStatus) => Promise<boolean> | boolean | void;
  trackDisabled?: boolean;
};

export default function CollegeCard({ college, onTrack, trackDisabled }: Props) {
  const [status, setStatus] = useState<CollegeTrackingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTrack(nextStatus: CollegeTrackingStatus) {
    if (trackDisabled || loading) return;
    if (!onTrack) return;
    try {
      setLoading(true);
      await Promise.resolve(onTrack(college.id, nextStatus));
      setStatus(nextStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className={`card group p-6 relative overflow-hidden ${status ? "ring-2 ring-blue-500 shadow-xl scale-[1.01]" : "hover:scale-[1.01]"}`}>
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity dark:opacity-[0.05]">
        <Building2 className="h-20 w-20 text-slate-900 dark:text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{college.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              <MapPin className="h-3.5 w-3.5" /> {college.location}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 shadow-sm dark:bg-amber-900/20 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {college.rating.toFixed(1)}
            </span>
            {status && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-tight ${collegeTrackingStatusStyles[status]}`}
              >
                {collegeTrackingStatusLabels[status]}
              </motion.span>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Fees</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{currencyINR(college.fees)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Placement</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{college.placementRate}%</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {collegeTrackingStatuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleTrack(item);
                }}
                disabled={trackDisabled || loading}
                className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-3 transition-all ${
                  status === item
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                  {status === item ? "Active" : "Add to"}
                </span>
                <span className="mt-1 text-[11px] font-bold whitespace-nowrap">
                  {collegeTrackingStatusLabels[item]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Link href={`/college/${college.id}`} className="flex-1 btn-secondary py-4 rounded-2xl font-bold">
              View Specs
            </Link>
            {status && (
              <Link href="/saved" className="flex items-center justify-center w-14 rounded-2xl bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all">
                <ChevronRight className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

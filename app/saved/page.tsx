"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { currencyINR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  collegeTrackingStatuses,
  collegeTrackingStatusLabels,
  collegeTrackingStatusStyles,
  type CollegeTrackingStatus
} from "@/lib/college-tracking";
import { useToastStore } from "@/store/toastStore";
import { 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3,
  CalendarDays,
  FileText,
  Building2,
  X,
  Compass
} from "lucide-react";

type SavedCollegeItem = {
  id: string;
  status: CollegeTrackingStatus;
  deadline?: string;
  notes?: string;
  college: {
    id: string;
    name: string;
    location: string;
    fees: number;
    rating: number;
  };
};

export default function SavedPage() {
  const { token, hydrate } = useAuthStore();
  const pushToast = useToastStore((s) => s.push);
  const [editingItem, setEditingItem] = useState<SavedCollegeItem | null>(null);
  const [editStatus, setEditStatus] = useState<CollegeTrackingStatus>("LONG_LIST");
  const [editDeadline, setEditDeadline] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const savedCollegesQuery = useQuery({
    queryKey: ["saved-colleges", token],
    queryFn: () => apiRequest<{ data: SavedCollegeItem[] }>("/api/saved-colleges", { token }),
    enabled: Boolean(token)
  });

  const savedComparisonsQuery = useQuery({
    queryKey: ["saved-comparisons", token],
    queryFn: () =>
      apiRequest<{
        data: Array<{
          id: string;
          name: string;
          colleges: Array<{ id: string; name: string; location: string; fees: number; rating: number; placementRate: number }>;
        }>;
      }>("/api/saved-comparisons", { token }),
    enabled: Boolean(token)
  });

  const colleges = savedCollegesQuery.data?.data || [];

  const grouped = collegeTrackingStatuses.reduce<Record<CollegeTrackingStatus, SavedCollegeItem[]>>(
    (acc, status) => {
      acc[status] = colleges.filter((item) => item.status === status);
      return acc;
    },
    {
      LONG_LIST: [],
      SHORT_LIST: [],
      WANT_TO_APPLY: [],
      APPLIED: []
    }
  );

  async function updateItem() {
    if (!token || !editingItem) return;
    try {
      setIsUpdating(true);
      await apiRequest("/api/saved-colleges", {
        method: "POST",
        token,
        body: { 
          collegeId: editingItem.college.id, 
          status: editStatus,
          deadline: editDeadline || null,
          notes: editNotes || null
        }
      });
      pushToast({
        type: "success",
        title: "Roadmap Updated",
        message: `${editingItem.college.name} has been updated.`
      });
      setEditingItem(null);
      await savedCollegesQuery.refetch();
    } catch (e) {
      pushToast({
        type: "error",
        title: "Update Failed",
        message: e instanceof Error ? e.message : "Could not update college."
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function removeCollege(collegeId: string) {
    if (!token) return;
    if (!confirm("Remove this college from your tracker?")) return;
    try {
      await apiRequest("/api/saved-colleges", {
        method: "DELETE",
        token,
        body: { collegeId }
      });
      pushToast({
        type: "success",
        message: "College removed from tracker."
      });
      await savedCollegesQuery.refetch();
    } catch (e) {
      pushToast({
        type: "error",
        message: "Failed to remove college."
      });
    }
  }

  const openEditModal = (item: SavedCollegeItem) => {
    setEditingItem(item);
    setEditStatus(item.status);
    setEditDeadline(item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : "");
    setEditNotes(item.notes || "");
  };

  return (
    <section className="space-y-10 max-w-5xl mx-auto pb-20 compass-pattern min-h-screen">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/80 p-10 text-slate-900 shadow-2xl dark:bg-slate-900 dark:border-slate-800 dark:text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Compass className="h-40 w-40 text-blue-500 animate-[spin_40s_linear_infinite]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">Personal Roadmap</h1>
          <p className="mt-3 text-base text-slate-500 leading-relaxed max-w-2xl dark:text-slate-400">
            Navigate your application journey with precision. Your calm workspace for academic success.
          </p>
        </div>
      </div>

      {!token ? (
        <div className="card p-16 text-center bg-slate-50 border-dashed border-2 rounded-[3rem]">
          <div className="max-w-md mx-auto space-y-8">
            <div className="h-24 w-24 bg-blue-100 rounded-3xl rotate-12 flex items-center justify-center mx-auto shadow-xl">
              <Building2 className="h-12 w-12 text-blue-600 -rotate-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Start Your List</h2>
              <p className="mt-4 text-slate-600 leading-relaxed font-medium">Save colleges, set deadlines, and track your progress in real-time. Join thousands of students today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/login" className="btn-primary h-14 px-10 rounded-2xl shadow-xl">Sign In</Link>
              <Link href="/signup" className="btn-secondary h-14 px-10 rounded-2xl">Create Account</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {savedCollegesQuery.isLoading || savedComparisonsQuery.isLoading ? (
            <LoadingState text="Loading your roadmap..." />
          ) : null}

          {savedCollegesQuery.isError ? <ErrorState message={(savedCollegesQuery.error as Error).message} /> : null}

          <div className="space-y-12">
            {collegeTrackingStatuses.map((status) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      status === 'LONG_LIST' ? 'bg-slate-400' :
                      status === 'SHORT_LIST' ? 'bg-blue-400' :
                      status === 'WANT_TO_APPLY' ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`} />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest dark:text-white">{collegeTrackingStatusLabels[status]}</h2>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">{grouped[status].length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {grouped[status].map((item) => (
                    <motion.div 
                      layoutId={item.id}
                      key={item.id} 
                      className="group flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-3xl hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-none"
                      onClick={() => openEditModal(item)}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        status === 'APPLIED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        {status === 'APPLIED' ? <CheckCircle2 className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">{item.college.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">{item.college.location}</p>
                          {item.deadline && (
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              {new Date(item.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-end px-4 border-r border-slate-50 dark:border-slate-800 mr-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{currencyINR(item.college.fees)}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest dark:text-slate-500">Est. Fees</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCollege(item.college.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors dark:text-slate-700 dark:group-hover:text-white" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {grouped[status].length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nothing here yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {savedComparisonsQuery.data && savedComparisonsQuery.data.data.length > 0 && (
            <div className="pt-10">
              <h2 className="text-2xl font-black text-slate-900 mb-8 px-6">Comparison Archives</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {savedComparisonsQuery.data.data.map((item) => (
                  <div key={item.id} className="card p-8 group hover:shadow-2xl transition-all">
                    <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <div className="mt-6 space-y-3">
                      {item.colleges.map((college) => (
                        <div key={college.id} className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-600 truncate max-w-[200px]">{college.name}</span>
                          <span className="text-slate-400 font-medium">{currencyINR(college.fees)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.colleges.length} Colleges</p>
                      <Link href={`/compare?id=${item.id}`} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        View Details <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl overflow-hidden rounded-[3rem] bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <Edit3 className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight dark:text-white">{editingItem.college.name}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 dark:text-slate-500">{editingItem.college.location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all dark:bg-slate-800 dark:text-slate-500 dark:hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Move To Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {collegeTrackingStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => setEditStatus(s)}
                          className={`px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            editStatus === s 
                              ? "bg-slate-900 text-white shadow-xl scale-[1.02] dark:bg-blue-600" 
                              : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700"
                          }`}
                        >
                          {collegeTrackingStatusLabels[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2 dark:text-blue-400/60">
                      <CalendarDays className="h-3 w-3" /> Application Deadline
                    </label>
                    <input 
                      type="date"
                      className="w-full h-14 rounded-2xl border-none bg-slate-50 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 transition-all dark:bg-slate-800 dark:text-white"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2 dark:text-blue-400/60">
                      <FileText className="h-3 w-3" /> Personal Notes
                    </label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-3xl border-none bg-slate-50 px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all dark:bg-slate-800 dark:text-white"
                      placeholder="Add reminders about application fees, required docs, or visit dates..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setEditingItem(null)}
                      className="flex-1 py-5 rounded-[1.5rem] font-bold text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={updateItem}
                      className="flex-1 py-5 rounded-[1.5rem] bg-slate-900 text-white font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Update Roadmap
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

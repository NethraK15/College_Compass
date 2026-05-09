"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCollegeById, fetchColleges } from "@/services/api";
import { currencyINR } from "@/lib/utils";
import Link from "next/link";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Star, 
  IndianRupee, 
  GraduationCap, 
  Award,
  Users,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BookOpen,
  MessageCircle
} from "lucide-react";
import Image from "next/image";

import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { apiRequest } from "@/services/api";

const tabs = [
  { id: "Overview", icon: Building2 },
  { id: "Courses", icon: BookOpen },
  { id: "Placements", icon: TrendingUp },
  { id: "Reviews", icon: MessageCircle }
] as const;

type Props = {
  params: {
    id: string;
  };
};

export default function CollegeDetailPage({ params }: Props) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("Overview");
  const { token } = useAuthStore();
  const pushToast = useToastStore((s) => s.push);
  const [isTrackLoading, setIsTrackLoading] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["college", params.id],
    queryFn: () => fetchCollegeById(params.id)
  });

  async function handleAddToRoadmap() {
    if (!token) {
      pushToast({ type: "error", message: "Please login to add to roadmap" });
      return;
    }
    try {
      setIsTrackLoading(true);
      await apiRequest("/api/saved-colleges", {
        method: "POST",
        token,
        body: { collegeId: params.id, status: "LONG_LIST" }
      });
      pushToast({ type: "success", title: "Success", message: "Added to your Long List" });
    } catch (e) {
      pushToast({ type: "error", message: "Failed to add to roadmap" });
    } finally {
      setIsTrackLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingState text="Navigating to campus..." />;
  }

  if (isError || !data?.data) {
    return <ErrorState message={(error as Error)?.message || "College not found"} />;
  }

  const college = data.data;

  return (
    <section className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-[3rem] shadow-2xl dark:border dark:border-slate-800">
        <Image 
          src="/college_hero_placeholder_1778313000794.png" 
          alt={college.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-10 md:p-14 text-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Premium Choice</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="text-sm font-bold">{college.rating.toFixed(1)} Rating</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none">{college.name}</h1>
              <div className="flex items-center gap-4 text-blue-100/80 font-semibold uppercase tracking-widest text-[10px]">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {college.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Est. {college.establishedYear}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="h-16 px-8 rounded-2xl bg-white text-slate-900 font-bold shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 text-sm dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                Visit Website <ExternalLink className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Annual Fees", value: currencyINR(college.fees), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Placement Rate", value: `${college.placementRate}%`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Avg Package", value: `${college.averageSalaryLpa} LPA`, icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Est. Year", value: college.establishedYear, icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((stat) => (
          <div key={stat.label} className="card p-6 flex items-center gap-4 dark:bg-slate-900/50">
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="grid lg:grid-cols-[1fr_350px] gap-10 items-start">
        <div className="space-y-10">
          <div className="flex p-2 rounded-[2rem] bg-slate-100/50 border border-slate-100 overflow-x-auto no-scrollbar dark:bg-slate-800/50 dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all min-w-[140px] ${
                  tab.id === activeTab 
                    ? "bg-white text-slate-900 shadow-xl scale-[1.02] dark:bg-slate-900 dark:text-white" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.id}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "Overview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="card p-10 dark:bg-slate-900/50">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 dark:text-white">
                    <BookOpen className="h-6 w-6 text-blue-600" /> Institution Overview
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed font-medium dark:text-slate-400">{college.overview}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-8 bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
                    <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[10px] dark:text-white">Academic Culture</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium dark:text-slate-400">Ranked among the top institutions for engineering and technology. Known for rigorous academic standards and industry-aligned curriculum.</p>
                  </div>
                  <div className="card p-8 bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                    <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[10px] dark:text-white">Student Life</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium dark:text-slate-400">Vibrant campus life with over 50+ student-led clubs, annual fests, and a strong focus on holistic development.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Courses" && (
              <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {college.courses?.map((course) => (
                  <div key={course.id} className="card group p-8 hover:border-blue-200 transition-all flex items-center justify-between dark:bg-slate-900/50">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all dark:bg-slate-800">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.name}</h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{course.duration} Program</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{course.seats}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Seats</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Placements" && (
              <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-slate-900/50">
                <div className="p-8 border-b border-slate-50 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historical Placement Trends</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:bg-slate-900/50">
                        <th className="px-8 py-6">Academic Year</th>
                        <th className="px-8 py-6">Placement Rate</th>
                        <th className="px-8 py-6">Average (LPA)</th>
                        <th className="px-8 py-6">Highest (LPA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {college.placements?.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                          <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{item.year}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.placementRate}%` }} />
                              </div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.placementRate}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-semibold text-slate-700 dark:text-slate-300">{item.averageSalaryLpa}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs dark:bg-emerald-900/20 dark:text-emerald-400">{item.highestSalaryLpa}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {college.reviews?.map((review) => (
                  <div key={review.id} className="card p-8 space-y-4 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 dark:bg-slate-800">
                          {review.student.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none dark:text-white">{review.student}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Verified Student</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span className="font-bold text-sm">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium italic leading-relaxed text-sm dark:text-slate-400">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 sticky top-24">
          <div className="card p-8 bg-blue-600 text-white shadow-xl overflow-hidden relative group transition-all duration-500">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all">
              <Compass className="h-40 w-40 animate-[spin_30s_linear_infinite] text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold leading-tight">Ready to start your journey?</h3>
              <p className="text-blue-100/80 text-xs font-medium leading-relaxed">Add this institution to your roadmap to track applications and set deadlines.</p>
              <button 
                onClick={handleAddToRoadmap}
                disabled={isTrackLoading}
                className="w-full py-4 rounded-2xl bg-white text-blue-600 font-bold shadow-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTrackLoading ? "Adding..." : "Add to Roadmap"}
              </button>
            </div>
          </div>

          <div className="card p-8 dark:bg-slate-900/50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 dark:text-blue-400/60">Connect with Alumni</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-800">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Alumnus {i}</p>
                    <p className="text-[10px] font-medium text-slate-500">Class of 202{i}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Colleges Section */}
      <RelatedColleges currentId={params.id} />
    </section>
  );
}

function RelatedColleges({ currentId }: { currentId: string }) {
  const { data } = useQuery({
    queryKey: ["related-colleges", currentId],
    queryFn: () => fetchColleges("?page=1&pageSize=4")
  });

  const colleges = data?.data.filter(c => c.id !== currentId).slice(0, 3) || [];

  if (colleges.length === 0) return null;

  return (
    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explore More Institutions</h2>
          <p className="mt-2 text-slate-500 font-medium dark:text-slate-400">Discover other campuses that might fit your academic goals.</p>
        </div>
        <Link href="/#browse" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
          View All <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {colleges.map((college) => (
          <Link 
            key={college.id} 
            href={`/college/${college.id}`}
            className="card group p-6 hover:border-blue-200 transition-all dark:bg-slate-900/50"
          >
            <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-6">
              <Image 
                src="/college_hero_placeholder_1778313000794.png"
                alt={college.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">{college.location}</p>
            <h3 className="text-lg font-bold text-slate-900 mb-4 truncate dark:text-white group-hover:text-blue-600 transition-colors">{college.name}</h3>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Star className="h-3 w-3 fill-amber-400" /> {college.rating.toFixed(1)}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {currencyINR(college.fees)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
    </svg>
  );
}

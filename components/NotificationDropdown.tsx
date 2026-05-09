"use client";

import { useState, useMemo } from "react";
import { Bell, Clock, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

type SavedCollegeItem = {
  id: string;
  status: string;
  deadline?: string;
  college: {
    name: string;
  };
};

type Notification = {
  id: string;
  type: "deadline" | "update" | "result";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuthStore();

  const { data: savedData } = useQuery({
    queryKey: ["notifications-deadlines"],
    queryFn: () => apiRequest<{ data: SavedCollegeItem[] }>("/api/saved-colleges", { token }),
    enabled: !!token
  });

  const notifications = useMemo(() => {
    const list: Notification[] = [];

    // Real data: Deadlines within 7 days
    if (savedData?.data) {
      const now = new Date();
      savedData.data.forEach((item) => {
        if (item.deadline) {
          const deadlineDate = new Date(item.deadline);
          const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 7) {
            list.push({
              id: `deadline-${item.id}`,
              type: "deadline",
              title: "Upcoming Deadline",
              message: `The deadline for ${item.college.name} is in ${diffDays} days!`,
              time: diffDays === 0 ? "Today" : `${diffDays}d left`,
              isRead: false,
              link: "/saved"
            });
          }
        }
      });
    }

    // Mock data: Results
    list.push({
      id: "mock-result-1",
      type: "result",
      title: "Results Published",
      message: "The first merit list for National Institute of Design is now live.",
      time: "2h ago",
      isRead: false,
      link: "/predictor"
    });

    // Mock data: Updates
    list.push({
      id: "mock-update-1",
      type: "update",
      title: "Platform Update",
      message: "New comparison tools have been added to your dashboard.",
      time: "5h ago",
      isRead: true,
      link: "/compare"
    });

    return list.sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
  }, [savedData]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-4 w-80 md:w-96 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl z-50 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest dark:bg-blue-900/20 dark:text-blue-400">
                  {unreadCount} New
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-white dark:bg-slate-900">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <Link 
                        key={n.id}
                        href={n.link || "#"}
                        onClick={() => setIsOpen(false)}
                        className={`block p-5 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50 ${!n.isRead ? "bg-blue-50/20 dark:bg-blue-900/5" : ""}`}
                      >
                        <div className="flex gap-4">
                          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                            n.type === 'deadline' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                            n.type === 'result' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {n.type === 'deadline' ? <Clock className="h-5 w-5" /> : 
                             n.type === 'result' ? <CheckCircle2 className="h-5 w-5" /> : 
                             <Info className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-slate-900 text-sm dark:text-white truncate">{n.title}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">{n.time}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2 dark:text-slate-400">{n.message}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-sm text-slate-400 font-medium">All caught up!</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                <button className="w-full text-center text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

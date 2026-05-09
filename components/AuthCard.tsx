"use client";

import React from "react";

export default function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="card w-full p-6 sm:p-8 backdrop-blur-xl dark:bg-slate-900/40 dark:border-slate-800">
      {title || subtitle ? (
        <div className="mb-6">
          {title ? <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3> : null}
          {subtitle ? <p className="mt-2 text-sm text-slate-500 font-medium dark:text-slate-400">{subtitle}</p> : null}
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
}

"use client";

import { useToastStore } from "@/store/toastStore";

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[320px] flex-col gap-3">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto rounded-lg border p-3 shadow-lg ${t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {t.title ? <div className="font-semibold">{t.title}</div> : null}
              <div className="mt-1 text-sm">{t.message}</div>
            </div>
            <button className="ml-2 text-sm opacity-70" onClick={() => remove(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

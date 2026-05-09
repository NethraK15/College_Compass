import { Compass } from "lucide-react";

export default function LoadingState({ text = "Calculating Path..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full animate-pulse" />
        <Compass className="h-16 w-16 text-blue-600 loading-compass relative z-10" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] dark:text-white">{text}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning academic signals</p>
      </div>
    </div>
  );
}

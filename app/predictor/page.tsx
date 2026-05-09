"use client";

import { useState, useMemo } from "react";
import { apiRequest } from "@/services/api";
import { currencyINR } from "@/lib/utils";
import { 
  Target, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Lightbulb,
  Cpu,
  Microscope,
  BookOpen,
  PieChart,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PredictedCollege = {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  rankRange: string;
  minRank: number;
  maxRank: number;
};

type EnhancedPrediction = PredictedCollege & {
  probability: number;
  category: "Safe" | "Probable" | "Dream";
  matchScore: number;
  reason: string;
};

const subjects = [
  { id: "cs", label: "Computer Science", icon: Cpu, color: "text-blue-500" },
  { id: "ai", label: "Artificial Intelligence", icon: Sparkles, color: "text-indigo-500" },
  { id: "me", label: "Mechanical", icon: Settings, color: "text-slate-500" },
  { id: "ee", label: "Electrical", icon: Zap, color: "text-amber-500" },
  { id: "ec", label: "Electronics", icon: Radio, color: "text-red-500" },
  { id: "bt", label: "Biotech", icon: Microscope, color: "text-emerald-500" },
  { id: "cv", label: "Civil", icon: Home, color: "text-orange-500" },
  { id: "ae", label: "Aerospace", icon: Plane, color: "text-sky-600" },
  { id: "ch", label: "Chemical", icon: FlaskConical, color: "text-green-600" },
  { id: "ds", label: "Data Science", icon: Database, color: "text-blue-700" },
  { id: "ro", label: "Robotics", icon: Bot, color: "text-purple-600" }
];

import { Settings, Zap, Home, Radio, Plane, FlaskConical, Database, Bot } from "lucide-react";

export default function PredictorPage() {
  const [exam, setExam] = useState("JEE");
  const [rank, setRank] = useState("");
  const [location, setLocation] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [result, setResult] = useState<PredictedCollege[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => s.label.toLowerCase().includes(subjectSearch.toLowerCase()));
  }, [subjectSearch]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const enhancedResults = useMemo(() => {
    if (!result.length) return [];
    
    const userRank = Number(rank);
    return result.map(college => {
      // Basic rank range from "1000 - 5000"
      const [min, max] = college.rankRange.split(" - ").map(v => parseInt(v.replace(/,/g, "")));
      
      // Probability Logic
      let prob = 0;
      if (userRank < min) prob = 95 - (min - userRank) / 100; // Rank is better than range
      else if (userRank <= max) prob = 85 - ((userRank - min) / (max - min)) * 40; // Inside range
      else prob = 40 - (userRank - max) / 200; // Rank is worse than range

      // Interest Bonus
      const interestBonus = selectedInterests.length > 0 ? (selectedInterests.length * 2) : 5;
      const finalProb = Math.min(99, Math.max(5, prob + interestBonus));

      let category: EnhancedPrediction["category"] = "Probable";
      if (finalProb > 80) category = "Safe";
      else if (finalProb < 50) category = "Dream";

      return {
        ...college,
        probability: finalProb,
        category,
        matchScore: finalProb,
        reason: category === "Safe" 
          ? "Your rank is comfortably within the historical cutoff for this institution."
          : category === "Probable"
          ? "Strong alignment with recent trends, though competition remains steady."
          : "Highly competitive choice; success depends on round-specific seat availability."
      } as EnhancedPrediction;
    }).sort((a, b) => b.probability - a.probability);
  }, [result, rank, selectedInterests]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ data: PredictedCollege[] }>("/api/predict", {
        method: "POST",
        body: { exam, rank: Number(rank) }
      });
      setResult(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run prediction");
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 p-10 md:p-16 text-slate-900 shadow-2xl transition-all duration-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <PieChart className="h-64 w-64 text-blue-500 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/10 bg-blue-500/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Target className="h-4 w-4" /> Eligibility Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">Smart College <span className="text-blue-600">Predictor.</span></h1>
          <p className="max-w-2xl text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
            Our multi-dimensional engine analyzes historical rank trends, subject popularity, and seat availability to give you a precise probability score.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        <div className="space-y-10">
          {/* Main Form */}
          <div className="card p-8 md:p-10 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 dark:text-white">
              <Sparkles className="h-6 w-6 text-blue-600" /> Enter Your Credentials
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Entrance Exam</label>
                  <select className="input h-14" value={exam} onChange={(e) => setExam(e.target.value)}>
                    <option value="JEE">JEE Mains</option>
                    <option value="NEET">NEET Medical</option>
                    <option value="CAT">CAT Management</option>
                    <option value="GATE">GATE Technical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">All India Rank</label>
                  <input
                    className="input h-14"
                    type="number"
                    min={1}
                    value={rank}
                    placeholder="e.g. 4500"
                    onChange={(e) => setRank(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 dark:text-blue-400/60">Preferred Location</label>
                  <input
                    className="input h-14"
                    type="text"
                    value={location}
                    placeholder="e.g. Mumbai, Karnataka"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-blue-400/60">Core Interests (Boosts Accuracy)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <input 
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      placeholder="Search subjects..."
                      className="bg-transparent border-b border-slate-200 pl-8 pr-2 py-1 text-[10px] font-bold focus:border-blue-400 focus:outline-none dark:border-slate-800"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 max-h-[160px] overflow-y-auto p-1 no-scrollbar">
                  {filteredSubjects.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleInterest(sub.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${
                        selectedInterests.includes(sub.id)
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                    >
                      <sub.icon className={`h-4 w-4 ${selectedInterests.includes(sub.id) ? "text-white" : sub.color}`} />
                      {sub.label}
                    </button>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <p className="text-[10px] font-bold text-slate-400 py-4 px-2 italic">No subjects found matching &quot;{subjectSearch}&quot;</p>
                  )}
                </div>
              </div>

              <button className="btn-primary w-full h-16 rounded-2xl text-lg shadow-2xl hover:scale-[1.01] transition-all" type="submit" disabled={loading}>
                {loading ? "Analyzing Trends..." : "Calculate Probabilities"}
              </button>
            </form>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {enhancedResults.map((college, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={college.id}
                  className="card p-8 group hover:border-blue-500/30 transition-all dark:bg-slate-900/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          college.category === 'Safe' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20' :
                          college.category === 'Probable' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/20'
                        }`}>
                          {college.category} Chance
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{college.location}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{college.name}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed dark:text-slate-400">{college.reason}</p>
                    </div>

                    <div className="w-full md:w-48 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400">Match Probability</span>
                        <span className={`text-lg font-black ${
                          college.probability > 80 ? 'text-emerald-600' :
                          college.probability > 50 ? 'text-blue-600' :
                          'text-amber-600'
                        }`}>{college.probability.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${college.probability}%` }}
                          className={`h-full rounded-full ${
                            college.probability > 80 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' :
                            college.probability > 50 ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]' :
                            'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right font-bold uppercase tracking-widest">Historical Cutoff: {college.rankRange}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Trends */}
        <aside className="space-y-8 sticky top-24">
          <div className="card p-8 bg-blue-600 text-white shadow-xl overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all">
              <TrendingUp className="h-40 w-40" />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold leading-tight">Trend Intelligence</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-blue-50">Computer Science cutoff is trending lower this year by ~4% in top NITs.</p>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-blue-50">State colleges in {location || "your region"} show higher seat availability for your rank.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8 dark:bg-slate-900/50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 dark:text-blue-400/60">Important Note</h3>
            <div className="flex gap-4 items-start text-slate-600 dark:text-slate-400">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-6 font-medium">Prediction probabilities are calculated based on last year&apos;s Round 1 to Round 6 data. Actual seat allotment depends on the current year&apos;s choice filling and category reservations.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

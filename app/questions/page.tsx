"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, fetchQuestions } from "@/services/api";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { 
  Search, 
  MessageCircle, 
  Send, 
  MoreVertical, 
  ChevronLeft,
  User,
  Clock,
  Plus,
  Filter,
  Globe,
  UserCircle2,
  TrendingUp,
  History,
  Sparkles
} from "lucide-react";

type FilterTab = "ALL" | "MY_QUESTIONS";
type CategoryFilter = "RECENT" | "TRENDING";

export default function QuestionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("RECENT");
  
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const { token, hydrate, user: currentUser } = useAuthStore();
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    refetchInterval: 10000, 
  });

  const questions = useMemo(() => data?.data || [], [data?.data]);

  const filteredQuestions = useMemo(() => {
    let list = [...questions];

    if (activeTab === "MY_QUESTIONS" && currentUser) {
      list = list.filter(q => q.user.id === currentUser.id);
    }

    if (searchQuery) {
      const lowSearch = searchQuery.toLowerCase();
      list = list.filter(q => 
        q.title.toLowerCase().includes(lowSearch) || 
        q.body.toLowerCase().includes(lowSearch) ||
        q.user.name.toLowerCase().includes(lowSearch)
      );
    }

    if (activeCategory === "RECENT") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeCategory === "TRENDING") {
      list.sort((a, b) => b.answers.length - a.answers.length);
    }

    return list;
  }, [questions, searchQuery, activeTab, activeCategory, currentUser]);

  const selectedQuestion = useMemo(() => {
    return questions.find(q => q.id === selectedId);
  }, [questions, selectedId]);

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      pushToast({ type: "error", message: "Login required to ask a question" });
      return;
    }
    try {
      await apiRequest("/api/questions", {
        method: "POST",
        token,
        body: { title, body }
      });
      setTitle("");
      setBody("");
      setShowNewModal(false);
      pushToast({ type: "success", title: "Discussion Started", message: "Your question has been posted." });
      refetch();
    } catch (e) {
      pushToast({ type: "error", message: e instanceof Error ? e.message : "Failed to post question" });
    }
  }

  async function submitAnswer(questionId: string) {
    if (!answerDraft.trim() || !token) return;
    try {
      await apiRequest(`/api/questions/${questionId}/answers`, {
        method: "POST",
        token,
        body: { body: answerDraft }
      });
      setAnswerDraft("");
      pushToast({ type: "success", message: "Reply sent" });
      refetch();
    } catch (e) {
      pushToast({ type: "error", message: e instanceof Error ? e.message : "Failed to post answer" });
    }
  }

  if (isLoading) return <LoadingState text="Opening messenger..." />;
  if (isError) return <ErrorState message={(error as Error).message} />;

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[600px] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:bg-slate-900 dark:border-slate-800">
      {/* Sidebar: Question List */}
      <div className={`flex w-full flex-col border-r border-slate-100 bg-slate-50/50 md:w-[400px] dark:bg-slate-900/50 dark:border-slate-800 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FAQ Hub</h1>
            <button 
              onClick={() => setShowNewModal(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-800">
            <button 
              onClick={() => setActiveTab("ALL")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ALL" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> Explore All
            </button>
            <button 
              onClick={() => setActiveTab("MY_QUESTIONS")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "MY_QUESTIONS" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserCircle2 className="h-3.5 w-3.5" /> My Discussions
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input px-11"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveCategory("RECENT")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === "RECENT" ? "bg-slate-900 text-white dark:bg-blue-600" : "bg-white text-slate-400 border border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <History className="h-3 w-3" /> Recent
              </button>
              <button 
                onClick={() => setActiveCategory("TRENDING")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === "TRENDING" ? "bg-slate-900 text-white dark:bg-blue-600" : "bg-white text-slate-400 border border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <TrendingUp className="h-3 w-3" /> Trending
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
          <div className="space-y-1">
            {filteredQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedId(q.id)}
                className={`group flex w-full items-start gap-4 rounded-[2rem] p-4 transition-all ${
                  selectedId === q.id 
                    ? "bg-white shadow-xl ring-1 ring-slate-100 scale-[1.02] z-10 dark:bg-slate-800 dark:ring-slate-700" 
                    : "hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-sm ${
                  selectedId === q.id ? "bg-blue-600 text-white" : "bg-white text-slate-400 group-hover:bg-slate-100 dark:bg-slate-800"
                }`}>
                  {q.user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 truncate dark:text-white">{q.title}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate max-w-[100px]">{q.user.name}</p>
                    <span className="text-[10px] text-slate-300">•</span>
                    <p className="text-[10px] font-bold text-slate-400">{q.answers.length} replies</p>
                  </div>
                </div>
              </button>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-400 font-bold italic">No discussions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Chat Window */}
      <div className={`flex flex-1 flex-col bg-white dark:bg-slate-950 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        {selectedQuestion ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 md:px-8 md:py-6 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-6 w-6 text-slate-900 dark:text-white" />
                </button>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white">
                  {selectedQuestion.user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-[200px] md:max-w-md dark:text-white">{selectedQuestion.title}</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">Author: {selectedQuestion.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors dark:hover:bg-slate-800">
                  <MoreVertical className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto bg-[url('https://w0.peakpx.com/wallpaper/580/650/wallpaper-background-whatsapp-light-themes-whatsapp.jpg')] bg-repeat p-6 md:p-10 space-y-6 dark:bg-slate-900 dark:bg-none">
              <div className={`flex ${selectedQuestion.user.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] space-y-1">
                  <div className={`rounded-3xl p-5 shadow-sm ${
                    selectedQuestion.user.id === currentUser?.id 
                      ? 'rounded-tr-none bg-blue-600 text-white shadow-blue-200/50 dark:bg-blue-600 dark:shadow-none' 
                      : 'rounded-tl-none bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}>
                    <p className="text-sm font-bold mb-2">{selectedQuestion.title}</p>
                    <p className="text-sm leading-relaxed font-medium">{selectedQuestion.body}</p>
                    <p className={`mt-2 text-[10px] font-bold uppercase text-right ${
                      selectedQuestion.user.id === currentUser?.id ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {new Date(selectedQuestion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-2 ${
                    selectedQuestion.user.id === currentUser?.id ? 'text-right text-slate-400' : 'text-slate-400'
                  }`}>
                    {selectedQuestion.user.id === currentUser?.id ? 'You' : selectedQuestion.user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <span className="px-4 py-2 rounded-full bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest shadow-sm dark:bg-slate-800 dark:text-slate-500">
                  Conversation Thread
                </span>
              </div>

              {selectedQuestion.answers.map((ans) => (
                <div 
                  key={ans.id} 
                  className={`flex ${ans.user.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] space-y-1">
                    <div className={`rounded-3xl p-5 shadow-sm ${
                      ans.user.id === currentUser?.id 
                        ? 'rounded-tr-none bg-blue-600 text-white shadow-blue-200/50 dark:bg-blue-600 dark:shadow-none' 
                        : 'rounded-tl-none bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{ans.body}</p>
                      <p className={`mt-2 text-[10px] font-bold uppercase text-right ${
                        ans.user.id === currentUser?.id ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        {new Date(ans.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest px-2 ${
                      ans.user.id === currentUser?.id ? 'text-right text-slate-400' : 'text-slate-400'
                    }`}>
                      {ans.user.id === currentUser?.id ? 'You' : ans.user.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-100 p-6 md:px-10 bg-white dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    className="input py-4 rounded-[2rem]"
                    placeholder={`Reply to ${selectedQuestion.user.id === currentUser?.id ? 'discussion' : selectedQuestion.user.name}...`}
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitAnswer(selectedQuestion.id)}
                  />
                </div>
                <button 
                  onClick={() => submitAnswer(selectedQuestion.id)}
                  disabled={!answerDraft.trim()}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Send className="h-6 w-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center bg-slate-50/30 dark:bg-slate-900/10">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-2xl mb-6 dark:bg-slate-800">
              <MessageCircle className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Guidance</h2>
            <p className="mt-3 text-slate-500 max-w-xs mx-auto leading-relaxed font-medium dark:text-slate-400">
              Select a question to view community replies or start your own discussion.
            </p>
            <button 
              onClick={() => setShowNewModal(true)}
              className="mt-8 btn-primary px-10"
            >
              Ask New Question
            </button>
          </div>
        )}
      </div>

      {/* New Question Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg overflow-hidden rounded-[3rem] bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800"
            >
              <div className="p-8 md:p-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-6 dark:bg-blue-900/20">
                  <Sparkles className="h-3.5 w-3.5" /> Start Conversation
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">Ask Anything</h2>
                <p className="text-slate-500 mb-8 font-medium dark:text-slate-400">Our community navigators are here to guide you.</p>
                
                <form onSubmit={submitQuestion} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Subject</label>
                    <input
                      className="input font-bold"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Scholarship guidance"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Details</label>
                    <textarea
                      className="w-full min-h-[160px] rounded-[2rem] border border-slate-200 bg-white/50 px-6 py-5 text-sm font-medium focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Explain your situation in detail..."
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowNewModal(false)}
                      className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-primary py-4"
                    >
                      Post Question
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

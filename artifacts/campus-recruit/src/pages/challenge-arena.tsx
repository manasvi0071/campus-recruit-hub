import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import {
  Target, Send, RotateCcw, Flame, Trophy, BookOpen,
  TrendingUp, AlertCircle, CheckCircle2, Sparkles, Star,
  ChevronRight, Loader2, Zap, Brain, Medal, ArrowUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface RejectionEntry {
  company: string;
  role: string;
  round: string;
  feedback: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  xp: number;
  completed: boolean;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Why do students fail technical rounds?",
  "How to improve communication skills fast?",
  "What should I do after getting rejected?",
  "How to prepare for HR interviews?",
  "Give me a 30-day improvement plan",
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: "1", title: "Solve 3 Easy DSA Problems", description: "Pick any 3 easy problems on LeetCode today. Focus on Arrays and Strings.", difficulty: "Easy", category: "Technical", xp: 50, completed: false },
  { id: "2", title: "Record a 2-min Self Introduction", description: "Record yourself giving a structured intro. Watch it back and improve.", difficulty: "Easy", category: "Communication", xp: 40, completed: false },
  { id: "3", title: "Mock Interview Practice", description: "Do a mock interview with a friend or use an AI tool. Practice STAR method.", difficulty: "Medium", category: "Interview", xp: 80, completed: false },
  { id: "4", title: "Rewrite Your Resume", description: "Update resume with action verbs, quantified achievements, and clean format.", difficulty: "Medium", category: "Resume", xp: 70, completed: false },
  { id: "5", title: "Research 3 Target Companies", description: "Study the company culture, recent news, and job requirements for 3 companies.", difficulty: "Easy", category: "Research", xp: 45, completed: false },
  { id: "6", title: "Build a Mini Project", description: "Create a small project that demonstrates a skill relevant to your target role.", difficulty: "Hard", category: "Technical", xp: 150, completed: false },
];

const IMPROVEMENT_AREAS = [
  { area: "Technical Skills", score: 45, target: 80, color: "bg-blue-500", icon: Brain },
  { area: "Communication", score: 60, target: 85, color: "bg-purple-500", icon: Zap },
  { area: "Problem Solving", score: 50, target: 80, color: "bg-orange-500", icon: Target },
  { area: "Resume Quality", score: 35, target: 90, color: "bg-pink-500", icon: BookOpen },
  { area: "Interview Prep", score: 40, target: 85, color: "bg-green-500", icon: Trophy },
];

// ─── AI Chat for rejected students ───────────────────────────────────────────
async function streamChallengeAI(
  messages: Message[],
  rejectionContext: RejectionEntry | null,
  onChunk: (chunk: string) => void,
  onDone: () => void,
) {
  const systemPrompt = `You are a compassionate and motivating career coach specifically helping students who were rejected from campus placement drives. Your name is "Coach AI".

Your role:
1. ANALYZE why the student was rejected based on their context
2. Give SPECIFIC, ACTIONABLE improvement steps — not generic advice
3. Be ENCOURAGING but HONEST — point out real gaps
4. Create PERSONALIZED improvement plans
5. Track their PROGRESS and celebrate small wins
6. Give PRACTICAL exercises they can do TODAY

${rejectionContext ? `
Student's rejection context:
- Company: ${rejectionContext.company}
- Role: ${rejectionContext.role}
- Round they failed: ${rejectionContext.round}
- Feedback received: ${rejectionContext.feedback || "No specific feedback given"}

Based on this, tailor your responses to address their specific failure points.
` : ""}

Keep responses focused, warm, and action-oriented. Use bullet points and numbered lists for clarity. Always end with one specific action they can take RIGHT NOW.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      stream: true,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok || !response.body) {
    onChunk("I'm here to help you bounce back stronger! Could you tell me more about which round you struggled with and what happened?");
    onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "content_block_delta" && data.delta?.text) {
            onChunk(data.delta.text);
          }
        } catch {}
      }
    }
  }
  onDone();
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ d }: { d: Challenge["difficulty"] }) {
  const map = { Easy: "bg-green-100 text-green-700", Medium: "bg-yellow-100 text-yellow-700", Hard: "bg-red-100 text-red-700" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[d]}`}>{d}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChallengeArena() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: `## Welcome to your Personal Challenge Arena! 🎯

I'm **Coach AI** — your personal guide to bounce back stronger after rejection.

**I can help you:**
- 🔍 Understand **exactly why** you didn't get selected
- 📋 Build a **personalized improvement plan**
- 💪 Give you **daily challenges** to level up your skills
- 🎯 Prepare you to **crack the next opportunity**

**To get started**, tell me:
1. Which company/role did you get rejected from?
2. Which round did you fail? (Resume → Aptitude → Technical → HR)
3. Any feedback you received?

*The more you share, the more specific my guidance will be!*`,
  }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Rejection context form
  const [showForm, setShowForm] = useState(true);
  const [rejection, setRejection] = useState<RejectionEntry>({ company: "", role: "", round: "", feedback: "" });
  const [rejectionSaved, setRejectionSaved] = useState(false);

  // Challenges
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [xp, setXp] = useState(0);
  const totalXp = INITIAL_CHALLENGES.reduce((s, c) => s + c.xp, 0);
  const completedCount = challenges.filter(c => c.completed).length;

  // Active tab
  const [tab, setTab] = useState<"chat" | "challenges" | "progress">("chat");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const aiId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiId, role: "assistant", content: "", streaming: true };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput("");
    setStreaming(true);

    await streamChallengeAI(
      [...messages, userMsg],
      rejectionSaved ? rejection : null,
      (chunk) => setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + chunk } : m)),
      () => { setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false } : m)); setStreaming(false); },
    );
  };

  const handleSaveRejection = () => {
    if (!rejection.company || !rejection.round) {
      toast({ title: "Please fill Company and Round at minimum", variant: "destructive" });
      return;
    }
    setRejectionSaved(true);
    setShowForm(false);
    const autoMsg = `I was rejected by ${rejection.company} for the ${rejection.role} role. I failed in the ${rejection.round} round. ${rejection.feedback ? `Feedback I received: "${rejection.feedback}"` : "I didn't get specific feedback."}`;
    sendMessage(autoMsg);
  };

  const toggleChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newCompleted = !c.completed;
      if (newCompleted) {
        setXp(x => x + c.xp);
        toast({ title: `+${c.xp} XP earned! 🎉`, description: `You completed: ${c.title}` });
      } else {
        setXp(x => x - c.xp);
      }
      return { ...c, completed: newCompleted };
    }));
  };

  const level = Math.floor(xp / 100) + 1;
  const levelProgress = (xp % 100);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Personal Challenge Arena <Flame className="w-7 h-7 text-orange-500" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Rejection is redirection. Let's build you back stronger with AI-powered coaching.
          </p>
        </div>
        {/* XP bar */}
        <div className="bg-card border rounded-xl px-4 py-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold">Level {level}</span>
            </div>
            <span className="text-xs text-muted-foreground">{xp} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{100 - levelProgress} XP to next level</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Challenges Done", value: `${completedCount}/${challenges.length}`, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "XP Earned", value: xp, icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Improvement Score", value: `${Math.min(Math.round((xp / totalXp) * 100), 100)}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0">
        {(["chat", "challenges", "progress"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "chat" ? "🤖 AI Coach" : t === "challenges" ? "⚡ Challenges" : "📈 Progress"}
          </button>
        ))}
      </div>

      {/* ── TAB: AI CHAT ── */}
      {tab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Rejection context form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm">Tell me about your rejection — I'll analyse it</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Company Name *</label>
                      <Input placeholder="e.g. TCS, Infosys" value={rejection.company}
                        onChange={e => setRejection(p => ({ ...p, company: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Role Applied For</label>
                      <Input placeholder="e.g. Software Engineer" value={rejection.role}
                        onChange={e => setRejection(p => ({ ...p, role: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Round You Failed *</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                        value={rejection.round} onChange={e => setRejection(p => ({ ...p, round: e.target.value }))}>
                        <option value="">Select round...</option>
                        <option>Resume Shortlisting</option>
                        <option>Aptitude / Online Test</option>
                        <option>Technical Round 1</option>
                        <option>Technical Round 2</option>
                        <option>Group Discussion</option>
                        <option>HR Round</option>
                        <option>Final Round</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Any Feedback Received?</label>
                      <Input placeholder="e.g. weak in DSA" value={rejection.feedback}
                        onChange={e => setRejection(p => ({ ...p, feedback: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveRejection} className="gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Analyse My Rejection
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Skip for now</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="bg-card border rounded-xl flex flex-col" style={{ height: "480px" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Coach AI</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Always here to help
                  </div>
                </div>
                {rejectionSaved && (
                  <Badge className="ml-auto text-xs bg-orange-100 text-orange-700 border-orange-200">
                    Context: {rejection.company} · {rejection.round}
                  </Badge>
                )}
              </div>

              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-4">
                  {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarFallback className={`text-[10px] font-bold ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-orange-400 to-red-500 text-white"}`}>
                          {msg.role === "user" ? (user?.name?.[0] ?? "S") : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/60 border rounded-tl-sm"}`}>
                        {msg.role === "user" ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-1.5">
                            <ReactMarkdown>{msg.content || (msg.streaming ? "" : "…")}</ReactMarkdown>
                            {msg.streaming && (
                              <span className="inline-flex gap-0.5 ml-1">
                                {[0, 1, 2].map(i => (
                                  <motion.span key={i} className="w-1 h-1 rounded-full bg-current inline-block"
                                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                                ))}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <div className="px-4 py-3 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Ask Coach AI anything..." value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    disabled={streaming} className="flex-1" />
                  <Button size="icon" onClick={() => sendMessage(input)} disabled={streaming || !input.trim()}>
                    {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick prompts + tips sidebar */}
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Quick Questions
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendMessage(p)} disabled={streaming}
                    className="w-full text-left text-sm px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between gap-2 group">
                    <span>{p}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Remember
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Every rejection is data, not failure",
                  "Companies reject skills, not people",
                  "One improvement per day = 365 improvements",
                  "The next opportunity is already waiting",
                ].map(t => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CHALLENGES ── */}
      {tab === "challenges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">Complete challenges to earn XP and level up your skills.</p>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              {completedCount}/{challenges.length} completed
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(c => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`bg-card border rounded-xl p-4 flex flex-col gap-3 transition-all ${c.completed ? "opacity-60 border-green-200 bg-green-50/30 dark:bg-green-950/10" : "hover:shadow-md"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DiffBadge d={c.difficulty} />
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{c.category}</span>
                    </div>
                    <h3 className={`font-semibold ${c.completed ? "line-through text-muted-foreground" : ""}`}>{c.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-1 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{c.xp} XP</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <Button size="sm" variant={c.completed ? "outline" : "default"}
                  onClick={() => toggleChallenge(c.id)} className="gap-1.5 self-start">
                  {c.completed ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed</>
                  ) : (
                    <><Target className="w-3.5 h-3.5" /> Mark Complete</>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: PROGRESS ── */}
      {tab === "progress" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill improvements */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Skill Gap Analysis
            </h3>
            <div className="space-y-4">
              {IMPROVEMENT_AREAS.map(area => (
                <div key={area.area}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <area.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{area.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Current: {area.score}%</span>
                      <span className="text-xs text-green-600">Target: {area.target}%</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${area.score}%` }} transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${area.color}`} />
                    <div className="absolute top-0 h-full w-0.5 bg-green-500 opacity-60" style={{ left: `${area.target}%` }} />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">+{area.target - area.score}% improvement needed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement roadmap */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Your Comeback Roadmap
            </h3>
            <div className="space-y-3">
              {[
                { week: "Week 1", title: "Foundation Reset", tasks: ["Fix resume", "Practice intros", "3 easy DSA"], done: completedCount >= 1 },
                { week: "Week 2", title: "Skill Building", tasks: ["Mock interviews", "2 projects", "10 medium DSA"], done: completedCount >= 3 },
                { week: "Week 3", title: "Interview Prep", tasks: ["HR questions", "Company research", "5 applications"], done: completedCount >= 5 },
                { week: "Week 4", title: "Placement Ready", tasks: ["Full mock drive", "Confidence boost", "Apply everywhere"], done: completedCount >= 6 },
              ].map((step, i) => (
                <div key={step.week} className={`flex gap-3 p-3 rounded-lg ${step.done ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : "bg-muted/30"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step.done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{step.week}</span>
                      <span className="font-medium text-sm">{step.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {step.tasks.map(t => (
                        <span key={t} className="text-xs bg-background border px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
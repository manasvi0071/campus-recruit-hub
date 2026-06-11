import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  BrainCircuit, Sparkles, Target, Trophy, Search, Send, Loader2,
  TrendingUp, Star, Zap, Users, Briefcase, Code2, Award, Rocket,
  MessageSquare, Upload, ChevronRight, CheckCircle2, AlertCircle,
  RefreshCw, BarChart3, Lightbulb, FileText, Bot, Clock, Bell,
  GraduationCap, Heart, Shield, ArrowUp, Eye, BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message { id: string; role: "user" | "assistant"; content: string; streaming?: boolean; }

interface Student {
  id: number; name: string; branch: string; cgpa: number;
  skills: string[]; projects: number; certifications: number;
  hackathons: number; aptitudeScore: number;
  talentScore?: number; hiringProbability?: number;
}

interface Project {
  id: number; title: string; tech: string[]; description: string;
  studentName: string; branch: string; quality?: number; tags?: string[];
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const STUDENTS: Student[] = [
  { id: 1, name: "Arjun Sharma",  branch: "CSE", cgpa: 8.5, skills: ["Python", "ML", "React"],         projects: 4, certifications: 3, hackathons: 2, aptitudeScore: 85 },
  { id: 2, name: "Priya Patel",   branch: "ECE", cgpa: 7.9, skills: ["Java", "DSA", "SQL"],             projects: 3, certifications: 2, hackathons: 1, aptitudeScore: 78 },
  { id: 3, name: "Rahul Singh",   branch: "CSE", cgpa: 6.8, skills: ["Python", "AI", "TensorFlow"],    projects: 5, certifications: 4, hackathons: 3, aptitudeScore: 72 },
  { id: 4, name: "Sneha Reddy",   branch: "IT",  cgpa: 8.1, skills: ["React", "Node.js", "AWS"],       projects: 3, certifications: 3, hackathons: 0, aptitudeScore: 82 },
  { id: 5, name: "Vikram Kumar",  branch: "CSE", cgpa: 6.2, skills: ["C++", "DSA", "Competitive"],     projects: 2, certifications: 1, hackathons: 5, aptitudeScore: 90 },
  { id: 6, name: "Ananya Iyer",   branch: "MBA", cgpa: 8.7, skills: ["Leadership", "Communication"],   projects: 1, certifications: 2, hackathons: 0, aptitudeScore: 88 },
  { id: 7, name: "Rohan Mehta",   branch: "CSE", cgpa: 7.5, skills: ["Python", "Data Science", "SQL"], projects: 4, certifications: 3, hackathons: 2, aptitudeScore: 80 },
  { id: 8, name: "Kavya Nair",    branch: "ECE", cgpa: 7.2, skills: ["ML", "Python", "Research"],      projects: 6, certifications: 5, hackathons: 4, aptitudeScore: 75 },
];

const PROJECTS: Project[] = [
  { id: 1, title: "Campus Placement Predictor",  tech: ["Python", "ML", "Flask"],    description: "Predicts placement outcomes using historical data and ML models. 87% accuracy.", studentName: "Rahul Singh",  branch: "CSE" },
  { id: 2, title: "AI Resume Screener",          tech: ["NLP", "Python", "React"],   description: "Automates resume screening using NLP with 92% precision.", studentName: "Kavya Nair",   branch: "ECE" },
  { id: 3, title: "Smart Attendance System",     tech: ["OpenCV", "Python", "IoT"],  description: "Face recognition attendance with 99% accuracy using OpenCV.", studentName: "Arjun Sharma", branch: "CSE" },
  { id: 4, title: "E-Commerce Recommendation",  tech: ["React", "Node.js", "AWS"],  description: "Product recommendation engine increasing sales by 34%.", studentName: "Sneha Reddy",  branch: "IT" },
  { id: 5, title: "Stock Market Prediction",    tech: ["LSTM", "Python", "Pandas"], description: "Deep learning model for stock trend prediction with 78% accuracy.", studentName: "Rohan Mehta", branch: "CSE" },
];

// ─── AI Streaming Helper ──────────────────────────────────────────────────────
async function streamAI(
  messages: { role: string; content: string }[],
  system: string,
  onChunk: (c: string) => void,
  onDone: () => void,
) {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) throw new Error("Backend error");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.content) onChunk(data.content);
            if (data.done) break;
          } catch {}
        }
      }
    }
  } catch (err) {
    onChunk("\n\n❌ Could not connect to backend. Make sure the server is running on port 3000 with OPENAI_API_KEY set.");
  }
  onDone();
}

// ─── Score Calculators ────────────────────────────────────────────────────────
function calcTalentScore(s: Student): number {
  const cgpaScore    = Math.min((s.cgpa / 10) * 25, 25);
  const projectScore = Math.min(s.projects * 5, 25);
  const certScore    = Math.min(s.certifications * 4, 20);
  const hackScore    = Math.min(s.hackathons * 5, 15);
  const aptScore     = (s.aptitudeScore / 100) * 15;
  return Math.round(cgpaScore + projectScore + certScore + hackScore + aptScore);
}

function calcHiringProb(s: Student, requiredSkills: string[]): number {
  const skillMatch  = requiredSkills.length
    ? (s.skills.filter(sk => requiredSkills.some(r => sk.toLowerCase().includes(r.toLowerCase()))).length / requiredSkills.length) * 40
    : 20;
  const cgpaFactor  = Math.min((s.cgpa / 10) * 25, 25);
  const aptFactor   = (s.aptitudeScore / 100) * 20;
  const projectBonus = Math.min(s.projects * 2, 10);
  const certBonus    = Math.min(s.certifications * 1.5, 5);
  return Math.min(Math.round(skillMatch + cgpaFactor + aptFactor + projectBonus + certBonus), 98);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** 1. AI HIRING SIMULATION */
function HiringSimulation() {
  const [company, setCompany]       = useState("");
  const [role, setRole]             = useState("");
  const [skills, setSkills]         = useState("");
  const [minCgpa, setMinCgpa]       = useState("6.0");
  const [results, setResults]       = useState<(Student & { talentScore: number; hiringProbability: number })[] | null>(null);
  const [loading, setLoading]       = useState(false);
  const { toast } = useToast();

  const simulate = () => {
    if (!company || !role) { toast({ title: "Enter company and role", variant: "destructive" }); return; }
    setLoading(true);
    setTimeout(() => {
      const required = skills.split(",").map(s => s.trim()).filter(Boolean);
      const scored = STUDENTS
        .filter(s => s.cgpa >= parseFloat(minCgpa))
        .map(s => ({ ...s, talentScore: calcTalentScore(s), hiringProbability: calcHiringProb(s, required) }))
        .sort((a, b) => b.hiringProbability - a.hiringProbability);
      setResults(scored);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
          <BrainCircuit className="w-4 h-4" /> Configure Simulation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Company Name</Label><Input placeholder="e.g. Google, TCS, Infosys" value={company} onChange={e => setCompany(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Role / Position</Label><Input placeholder="e.g. Software Engineer" value={role} onChange={e => setRole(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Required Skills (comma separated)</Label><Input placeholder="e.g. Python, ML, Communication" value={skills} onChange={e => setSkills(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Minimum CGPA</Label><Input type="number" step="0.1" min="0" max="10" value={minCgpa} onChange={e => setMinCgpa(e.target.value)} /></div>
        </div>
        <Button onClick={simulate} disabled={loading} className="mt-4 gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating...</> : <><Sparkles className="w-4 h-4" /> Run AI Simulation</>}
        </Button>
      </div>

      {results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Simulation Results for <span className="text-primary">{company} — {role}</span></h3>
            <Badge variant="outline">{results.length} eligible students</Badge>
          </div>
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span className="col-span-2">Student</span><span className="text-center">Talent Score</span><span className="text-center">Hiring Chance</span><span className="text-center">Prediction</span>
            </div>
            {results.map((s, i) => (
              <div key={s.id} className={`grid grid-cols-5 gap-2 items-center px-4 py-3 border-t hover:bg-muted/20 transition-colors ${i === 0 ? "bg-green-50/50 dark:bg-green-900/10" : ""}`}>
                <div className="col-span-2 flex items-center gap-2.5">
                  {i === 0 && <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />}
                  {i === 1 && <Star className="w-4 h-4 text-gray-400 shrink-0" />}
                  {i === 2 && <Award className="w-4 h-4 text-amber-600 shrink-0" />}
                  {i > 2 && <span className="w-4 h-4 text-xs text-muted-foreground flex items-center justify-center shrink-0">#{i+1}</span>}
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.branch} · CGPA {s.cgpa}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{s.talentScore}/100</div>
                  <Progress value={s.talentScore} className="h-1.5 mt-1" />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-sm ${s.hiringProbability >= 70 ? "text-green-600" : s.hiringProbability >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                    {s.hiringProbability}%
                  </div>
                  <Progress value={s.hiringProbability} className="h-1.5 mt-1" />
                </div>
                <div className="text-center">
                  <Badge className={`text-xs ${s.hiringProbability >= 70 ? "bg-green-100 text-green-700" : s.hiringProbability >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {s.hiringProbability >= 70 ? "✅ Likely" : s.hiringProbability >= 50 ? "⚠️ Possible" : "❌ Unlikely"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** 2. HIDDEN TALENT FINDER */
function HiddenTalentFinder() {
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const scored = STUDENTS.map(s => ({ ...s, talentScore: calcTalentScore(s) }))
    .sort((a, b) => b.talentScore - a.talentScore);

  const hiddenGems = scored.filter(s => s.cgpa < 7.5 && s.talentScore >= 60);

  const run = () => { setLoading(true); setTimeout(() => { setSearched(true); setLoading(false); }, 1200); };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5">
        <h3 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4" /> What this does
        </h3>
        <p className="text-sm text-muted-foreground">Identifies talented students who may be overlooked because of lower CGPA. Analyzes projects, certifications, hackathons, coding skills, and aptitude — not just marks.</p>
        <Button onClick={run} disabled={loading} className="mt-4 gap-2 bg-purple-600 hover:bg-purple-700">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</> : <><Search className="w-4 h-4" /> Find Hidden Talents</>}
        </Button>
      </div>

      {searched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Hidden gems */}
          {hiddenGems.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" /> Hidden Gems Found ({hiddenGems.length} students)
              </h4>
              <div className="space-y-3">
                {hiddenGems.map(s => (
                  <div key={s.id} className="bg-white dark:bg-card border border-yellow-200 dark:border-yellow-800/40 rounded-lg p-3 flex items-start gap-3">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-sm">{s.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{s.name}</span>
                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Hidden Gem ✨</Badge>
                        <Badge variant="outline" className="text-xs">CGPA {s.cgpa}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {[
                          { icon: Code2, label: "Projects", value: s.projects },
                          { icon: Award, label: "Certs", value: s.certifications },
                          { icon: Trophy, label: "Hackathons", value: s.hackathons },
                          { icon: Target, label: "Aptitude", value: `${s.aptitudeScore}%` },
                        ].map(stat => (
                          <div key={stat.label} className="text-xs flex items-center gap-1 text-muted-foreground">
                            <stat.icon className="w-3 h-3" /> {stat.label}: <span className="font-semibold text-foreground">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.skills.map(sk => <span key={sk} className="text-xs bg-muted px-2 py-0.5 rounded-full">{sk}</span>)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-purple-600">{s.talentScore}</div>
                      <div className="text-xs text-muted-foreground">Talent Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full leaderboard */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 font-semibold text-sm">All Students — Talent Leaderboard</div>
            {scored.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-3 border-t hover:bg-muted/20 ${hiddenGems.some(g => g.id === s.id) ? "bg-yellow-50/30 dark:bg-yellow-900/5" : ""}`}>
                <span className="w-6 text-xs text-muted-foreground font-mono">#{i+1}</span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{s.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    {hiddenGems.some(g => g.id === s.id) && <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">✨ Hidden Gem</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.branch} · CGPA {s.cgpa}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{s.talentScore}/100</div>
                  <Progress value={s.talentScore} className="h-1.5 w-24 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** 3. AI MOCK INTERVIEW */
function MockInterview() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "w", role: "assistant",
    content: `## Welcome to AI Mock Interview! 🎤

I'll conduct a realistic mock interview to help you prepare.

**Choose your interview type:**
- Type **"technical"** for a coding/DSA interview
- Type **"hr"** for an HR/behavioral interview  
- Type **"system design"** for a system design interview
- Type **"case study"** for a business case interview

Or just tell me which company you're preparing for and I'll simulate their style!`,
  }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [round, setRound] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const aiId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: aiId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    setStreaming(true);
    setRound(r => r + 1);

    await streamAI(
      [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      `You are an experienced technical interviewer conducting a mock interview. 
      Round number: ${round + 1}
      - Ask ONE question at a time
      - After the student answers, give brief feedback (2-3 lines) on their answer
      - Then ask the next question
      - For technical interviews: DSA, coding problems, system design concepts
      - For HR interviews: behavioral questions using STAR method
      - Be realistic but encouraging
      - After every 3 questions, give an overall performance summary with score out of 10
      - Keep responses concise and focused`,
      (c) => setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + c } : m)),
      () => { setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false } : m)); setStreaming(false); },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-green-800 dark:text-green-300">AI Interviewer — Live Session</div>
          <div className="text-xs text-green-600 dark:text-green-400">Questions asked: {round} · Builds confidence for real interviews</div>
        </div>
        <Button size="sm" variant="outline" className="ml-auto text-xs" onClick={() => { setMessages([{ id: "w", role: "assistant", content: "New session started! Tell me which company/role you're preparing for." }]); setRound(0); }}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </div>

      <div className="bg-card border rounded-xl flex flex-col" style={{ height: 460 }}>
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4">
            {messages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback className={`text-[10px] font-bold ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"}`}>
                    {m.role === "user" ? (user?.name?.[0] ?? "S") : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/60 border rounded-tl-sm"}`}>
                  {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1">
                      <ReactMarkdown>{m.content || (m.streaming ? "" : "…")}</ReactMarkdown>
                      {m.streaming && (
                        <span className="inline-flex gap-0.5 ml-1">
                          {[0,1,2].map(i => <motion.span key={i} className="w-1 h-1 rounded-full bg-current inline-block" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.2 }} />)}
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
        <div className="px-4 py-3 border-t flex gap-2">
          <Input placeholder="Type your answer..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)} disabled={streaming} className="flex-1" />
          <Button size="icon" onClick={() => send(input)} disabled={streaming || !input.trim()}>
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 4. AI PROJECT MARKETPLACE */
function ProjectMarketplace() {
  const [evaluated, setEvaluated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<(Project & { quality?: number; tags?: string[] })[]>(PROJECTS);
  const [search, setSearch] = useState("");

  const evaluate = () => {
    setLoading(true);
    setTimeout(() => {
      setProjects(prev => prev.map(p => ({
        ...p,
        quality: Math.floor(Math.random() * 25) + 70,
        tags: [...p.tech, p.tech.includes("ML") || p.tech.includes("NLP") || p.tech.includes("LSTM") ? "AI/ML" : "Web Dev",
               p.description.toLowerCase().includes("accuracy") ? "Data Science" : "Software Eng"].slice(0, 4),
      })));
      setEvaluated(true);
      setLoading(false);
    }, 1500);
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tech.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
            <Rocket className="w-4 h-4" /> AI Project Evaluator
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">AI evaluates project quality, tags technologies, and matches with recruiters.</p>
        </div>
        <Button onClick={evaluate} disabled={loading} className="gap-2 bg-orange-600 hover:bg-orange-700">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Sparkles className="w-4 h-4" /> Evaluate All Projects</>}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects by name, tech, or student..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <motion.div key={p.id} layout className="bg-card border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{p.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Avatar className="w-4 h-4"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{p.studentName[0]}</AvatarFallback></Avatar>
                  {p.studentName} · {p.branch}
                </div>
              </div>
              {evaluated && p.quality && (
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${p.quality >= 85 ? "text-green-600" : p.quality >= 70 ? "text-yellow-600" : "text-red-500"}`}>{p.quality}/100</div>
                  <div className="text-xs text-muted-foreground">Quality</div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{p.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.tech.map(t => <span key={t} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)}
            </div>
            {evaluated && p.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t">
                <span className="text-xs text-muted-foreground">AI Tags:</span>
                {p.tags.map(t => <span key={t} className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
            )}
            {evaluated && (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                ✅ Matched with 3 recruiters
              </Badge>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** 5. PERSONAL AI PLACEMENT AGENT */
function PlacementAgent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "w", role: "assistant",
    content: `## Hi ${user?.name?.split(" ")[0] ?? "there"}! I'm your Personal AI Placement Agent 🤖

I'm here to be your dedicated career guide throughout your placement journey.

**I can help you with:**
- 🎯 **Job matching** — Find roles that fit your profile
- 📝 **Resume improvement** — Specific suggestions for your resume
- 📚 **Skill recommendations** — What to learn for target companies
- ⏰ **Deadline tracking** — Never miss an application deadline
- 💡 **Interview preparation** — Company-specific prep tips
- 📊 **Profile analysis** — Understand your strengths and gaps

**What would you like help with today?**`,
  }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const quickActions = [
    "Analyze my placement readiness",
    "Which jobs should I apply to?",
    "How can I improve my resume?",
    "What skills should I learn for Google?",
    "Give me a 30-day placement plan",
  ];

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const aiId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: aiId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    setStreaming(true);

    await streamAI(
      [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      `You are a dedicated Personal AI Placement Agent for a student named ${user?.name ?? "the student"}.
      You are their personal career guide for campus placements.
      
      Your responsibilities:
      - Find suitable job opportunities based on their skills and interests
      - Give specific, actionable resume improvement tips
      - Recommend skills to learn for target companies (TCS, Infosys, Google, Amazon, etc.)
      - Track and remind about application deadlines
      - Give company-specific interview preparation tips
      - Analyze their profile strengths and gaps
      - Create personalized study/preparation plans
      
      Be warm, encouraging, and very specific. Always give actionable next steps.
      Use bullet points and structure your responses clearly.
      End every response with ONE specific action they should take TODAY.`,
      (c) => setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + c } : m)),
      () => { setMessages(prev => prev.map(m => m.id === aiId ? { ...m, streaming: false } : m)); setStreaming(false); },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm">Your Personal Placement Agent</div>
          <div className="text-xs text-muted-foreground">Available 24/7 · Personalized to your profile · Powered by AI</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" /> Active
        </div>
      </div>

      <div className="bg-card border rounded-xl flex flex-col" style={{ height: 460 }}>
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4">
            {messages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback className={`text-[10px] font-bold ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-primary to-purple-600 text-white"}`}>
                    {m.role === "user" ? (user?.name?.[0] ?? "S") : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/60 border rounded-tl-sm"}`}>
                  {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1">
                      <ReactMarkdown>{m.content || (m.streaming ? "" : "…")}</ReactMarkdown>
                      {m.streaming && (
                        <span className="inline-flex gap-0.5 ml-1">
                          {[0,1,2].map(i => <motion.span key={i} className="w-1 h-1 rounded-full bg-current inline-block" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.2 }} />)}
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

        <div className="px-4 pt-2 pb-1 border-t">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {quickActions.map(q => (
              <button key={q} onClick={() => send(q)} disabled={streaming}
                className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground transition-colors px-2.5 py-1 rounded-full">
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Ask your AI agent anything..." value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)} disabled={streaming} className="flex-1" />
            <Button size="icon" onClick={() => send(input)} disabled={streaming || !input.trim()}>
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "simulation",  label: "AI Hiring Simulation",   icon: BrainCircuit,  color: "text-blue-600",   desc: "Predict which students will be selected" },
  { id: "talent",      label: "Hidden Talent Finder",   icon: Sparkles,      color: "text-purple-600", desc: "Discover overlooked talented students" },
  { id: "interview",   label: "AI Mock Interview",       icon: MessageSquare, color: "text-green-600",  desc: "Practice interviews with AI" },
  { id: "projects",    label: "Project Marketplace",    icon: Rocket,        color: "text-orange-600", desc: "Showcase and evaluate student projects" },
  { id: "agent",       label: "Personal AI Agent",      icon: Bot,           color: "text-primary",    desc: "Your dedicated career guide" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AIHub() {
  const [activeTab, setActiveTab] = useState<TabId>("agent");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          AI Intelligence Hub <Sparkles className="w-7 h-7 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">5 AI-powered tools to supercharge your placement process.</p>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`p-3 rounded-xl border text-left transition-all space-y-1.5 ${
              activeTab === t.id ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-card hover:bg-muted border-border"
            }`}>
            <t.icon className={`w-5 h-5 ${activeTab === t.id ? "text-primary-foreground" : t.color}`} />
            <div className={`text-xs font-semibold leading-tight ${activeTab === t.id ? "text-primary-foreground" : ""}`}>{t.label}</div>
            <div className={`text-xs leading-tight ${activeTab === t.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Active tool */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === "simulation" && <HiringSimulation />}
          {activeTab === "talent"     && <HiddenTalentFinder />}
          {activeTab === "interview"  && <MockInterview />}
          {activeTab === "projects"   && <ProjectMarketplace />}
          {activeTab === "agent"      && <PlacementAgent />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
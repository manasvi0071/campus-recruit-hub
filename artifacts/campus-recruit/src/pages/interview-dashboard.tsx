import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2, XCircle, Clock, UserX, Trophy, Plus, ChevronRight,
  Building2, Users, TrendingUp, BarChart3, Download, Search,
  AlertCircle, Star, ArrowRight, Layers, RefreshCw, Eye, Pencil,
  IndianRupee, CalendarDays, Briefcase, Bell, FileDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoundStatus = "qualified" | "rejected" | "pending" | "absent";

interface Round {
  id: string;
  name: string;
  type: "aptitude" | "gd" | "technical" | "hr" | "final";
  date: string;
  totalAppeared: number;
  qualified: number;
  rejected: number;
  pending: number;
  absent: number;
}

interface Candidate {
  id: number;
  name: string;
  branch: string;
  cgpa: number;
  email: string;
  roundStatuses: Record<string, RoundStatus>;
  currentRound: string;
  overallStatus: "active" | "selected" | "rejected";
  packageLpa?: number;
  offerStatus?: "extended" | "accepted" | "declined";
}

interface Drive {
  id: string;
  company: string;
  role: string;
  packageLpa: number;
  date: string;
  rounds: Round[];
  candidates: Candidate[];
  totalApplied: number;
  status: "ongoing" | "completed" | "upcoming";
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_DRIVES: Drive[] = [
  {
    id: "1",
    company: "TCS",
    role: "Software Engineer",
    packageLpa: 7,
    date: "2025-12-10",
    status: "ongoing",
    totalApplied: 120,
    rounds: [
      { id: "r1", name: "Aptitude Test", type: "aptitude", date: "2025-12-10", totalAppeared: 115, qualified: 80, rejected: 30, pending: 0, absent: 5 },
      { id: "r2", name: "Technical Round 1", type: "technical", date: "2025-12-12", totalAppeared: 80, qualified: 45, rejected: 30, pending: 0, absent: 5 },
      { id: "r3", name: "Technical Round 2", type: "technical", date: "2025-12-14", totalAppeared: 45, qualified: 25, rejected: 18, pending: 2, absent: 0 },
      { id: "r4", name: "HR Interview", type: "hr", date: "2025-12-16", totalAppeared: 25, qualified: 18, rejected: 5, pending: 2, absent: 0 },
    ],
    candidates: [
      { id: 1, name: "Arjun Sharma", branch: "CSE", cgpa: 8.5, email: "arjun@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified", r4: "qualified" }, currentRound: "r4", overallStatus: "selected", packageLpa: 7, offerStatus: "accepted" },
      { id: 2, name: "Priya Patel", branch: "ECE", cgpa: 7.9, email: "priya@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified", r4: "pending" }, currentRound: "r4", overallStatus: "active" },
      { id: 3, name: "Rahul Singh", branch: "CSE", cgpa: 7.2, email: "rahul@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "rejected" }, currentRound: "r3", overallStatus: "rejected" },
      { id: 4, name: "Sneha Reddy", branch: "IT", cgpa: 8.1, email: "sneha@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified", r4: "qualified" }, currentRound: "r4", overallStatus: "selected", packageLpa: 7, offerStatus: "extended" },
      { id: 5, name: "Vikram Kumar", branch: "CSE", cgpa: 6.8, email: "vikram@college.edu", roundStatuses: { r1: "qualified", r2: "rejected" }, currentRound: "r2", overallStatus: "rejected" },
      { id: 6, name: "Ananya Iyer", branch: "MBA", cgpa: 8.7, email: "ananya@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified", r4: "qualified" }, currentRound: "r4", overallStatus: "selected", packageLpa: 7, offerStatus: "accepted" },
    ],
  },
  {
    id: "2",
    company: "Infosys",
    role: "Systems Engineer",
    packageLpa: 6.5,
    date: "2025-12-05",
    status: "completed",
    totalApplied: 95,
    rounds: [
      { id: "r1", name: "Online Test", type: "aptitude", date: "2025-12-05", totalAppeared: 90, qualified: 60, rejected: 25, pending: 0, absent: 5 },
      { id: "r2", name: "Group Discussion", type: "gd", date: "2025-12-07", totalAppeared: 60, qualified: 35, rejected: 22, pending: 0, absent: 3 },
      { id: "r3", name: "HR Round", type: "hr", date: "2025-12-09", totalAppeared: 35, qualified: 22, rejected: 11, pending: 0, absent: 2 },
    ],
    candidates: [
      { id: 7, name: "Rohan Mehta", branch: "CSE", cgpa: 7.5, email: "rohan@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified" }, currentRound: "r3", overallStatus: "selected", packageLpa: 6.5, offerStatus: "accepted" },
      { id: 8, name: "Kavya Nair", branch: "ECE", cgpa: 8.0, email: "kavya@college.edu", roundStatuses: { r1: "qualified", r2: "qualified", r3: "qualified" }, currentRound: "r3", overallStatus: "selected", packageLpa: 6.5, offerStatus: "accepted" },
      { id: 9, name: "Aditya Joshi", branch: "MECH", cgpa: 6.9, email: "aditya@college.edu", roundStatuses: { r1: "qualified", r2: "rejected" }, currentRound: "r2", overallStatus: "rejected" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROUND_ICONS: Record<Round["type"], string> = {
  aptitude: "📝", gd: "🗣️", technical: "💻", hr: "👥", final: "🏁",
};

const STATUS_CONFIG: Record<RoundStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  qualified: { label: "Qualified", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20", icon: CheckCircle2 },
  rejected:  { label: "Rejected",  color: "text-red-600",   bg: "bg-red-100 dark:bg-red-900/20",   icon: XCircle },
  pending:   { label: "Pending",   color: "text-yellow-600",bg: "bg-yellow-100 dark:bg-yellow-900/20", icon: Clock },
  absent:    { label: "Absent",    color: "text-gray-500",  bg: "bg-gray-100 dark:bg-gray-800",    icon: UserX },
};

function StatusPill({ status }: { status: RoundStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.color}`}>
      <c.icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InterviewDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === "admin" || user?.role === "recruiter";

  const [drives, setDrives] = useState<Drive[]>(DEMO_DRIVES);
  const [selectedDrive, setSelectedDrive] = useState<Drive>(DEMO_DRIVES[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "rounds" | "candidates" | "summary">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "selected" | "rejected">("all");

  // Update candidate round status
  const [editCandidate, setEditCandidate] = useState<{ candidate: Candidate; roundId: string } | null>(null);
  const [newStatus, setNewStatus] = useState<RoundStatus>("qualified");

  // New drive dialog
  const [showNewDrive, setShowNewDrive] = useState(false);
  const [newDrive, setNewDrive] = useState({ company: "", role: "", packageLpa: "", date: "" });

  // Sync selectedDrive from drives state
  const currentDrive = drives.find(d => d.id === selectedDrive.id) ?? drives[0] ?? null;

  const filteredCandidates = (currentDrive?.candidates ?? []).filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.overallStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  if (!currentDrive) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">No drives available</h2>
      <p className="text-muted-foreground">Create a drive to start tracking interviews.</p>
    </div>
  );
}

  const updateCandidateStatus = () => {
    if (!editCandidate) return;
    setDrives(prev => prev.map(d => {
      if (d.id !== currentDrive.id) return d;
      return {
        ...d,
        candidates: d.candidates.map(c => {
          if (c.id !== editCandidate.candidate.id) return c;
          const newStatuses = { ...c.roundStatuses, [editCandidate.roundId]: newStatus };
          const allRounds = d.rounds.map(r => r.id);
          const lastQualifiedIdx = allRounds.reduce((max, rid, idx) => newStatuses[rid] === "qualified" ? idx : max, -1);
          const overallStatus = newStatus === "rejected" ? "rejected" :
            lastQualifiedIdx === allRounds.length - 1 ? "selected" : "active";
          return { ...c, roundStatuses: newStatuses, overallStatus };
        }),
      };
    }));
    setEditCandidate(null);
    toast({ title: "Status updated!", description: `${editCandidate.candidate.name} → ${newStatus}` });
  };

  const handleNewDrive = () => {
    if (!newDrive.company || !newDrive.role) {
      toast({ title: "Company and role are required", variant: "destructive" }); return;
    }
    const drive: Drive = {
      id: Date.now().toString(), company: newDrive.company, role: newDrive.role,
      packageLpa: parseFloat(newDrive.packageLpa) || 0, date: newDrive.date,
      status: "upcoming", totalApplied: 0, rounds: [], candidates: [],
    };
    setDrives(prev => [drive, ...prev]);
    setSelectedDrive(drive);
    setShowNewDrive(false);
    setNewDrive({ company: "", role: "", packageLpa: "", date: "" });
    toast({ title: "Drive created!", description: `${drive.company} - ${drive.role}` });
  };

  // Summary stats
  const totalSelected = currentDrive.candidates.filter(c => c.overallStatus === "selected").length;
  const totalRejected = currentDrive.candidates.filter(c => c.overallStatus === "rejected").length;
  const totalActive = currentDrive.candidates.filter(c => c.overallStatus === "active").length;
  const selectionRate = currentDrive.candidates.length
    ? Math.round((totalSelected / currentDrive.candidates.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Interview Dashboard <Layers className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Track candidates round-by-round across all placement drives in real time.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowNewDrive(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Drive
          </Button>
        )}
      </div>

      {/* Drive selector */}
      <div className="flex flex-wrap gap-3">
        {drives.map(d => (
          <button key={d.id} onClick={() => { setSelectedDrive(d); setActiveTab("overview"); }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
              currentDrive.id === d.id
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card hover:bg-muted border-border"
            }`}>
            <Building2 className="w-4 h-4" />
            <span>{d.company}</span>
            <span className="opacity-70">· {d.role}</span>
            <Badge className={`text-xs ml-1 ${
              d.status === "ongoing" ? "bg-green-100 text-green-700" :
              d.status === "completed" ? "bg-blue-100 text-blue-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>{d.status}</Badge>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Applied", value: currentDrive.totalApplied, icon: Users, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600" },
          { label: "Appeared", value: currentDrive.rounds[0]?.totalAppeared ?? 0, icon: Briefcase, color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600" },
          { label: "Active", value: totalActive, icon: Clock, color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600" },
          { label: "Selected", value: totalSelected, icon: Trophy, color: "bg-green-100 dark:bg-green-900/20 text-green-600" },
          { label: "Rejected", value: totalRejected, icon: XCircle, color: "bg-red-100 dark:bg-red-900/20 text-red-600" },
          { label: "Selection %", value: `${selectionRate}%`, icon: TrendingUp, color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600" },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["overview", "rounds", "candidates", "summary"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t === "overview" ? "📊 Overview" : t === "rounds" ? "🔄 Rounds" : t === "candidates" ? "👥 Candidates" : "🏆 Final Summary"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Round funnel */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Recruitment Funnel
            </h3>
            <div className="space-y-4">
              {currentDrive.rounds.map((round, idx) => {
                const passRate = round.totalAppeared ? Math.round((round.qualified / round.totalAppeared) * 100) : 0;
                return (
                  <motion.div key={round.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ROUND_ICONS[round.type]}</span>
                        <span className="font-medium text-sm">{round.name}</span>
                        <span className="text-xs text-muted-foreground">· {round.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-600 font-medium">{round.qualified} qualified</span>
                        <span className="text-red-500">{round.rejected} rejected</span>
                        {round.pending > 0 && <span className="text-yellow-500">{round.pending} pending</span>}
                        <span className="text-muted-foreground">{round.absent} absent</span>
                        <Badge variant="outline" className="text-xs">{passRate}% pass rate</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                      {round.qualified > 0 && <div className="bg-green-500 transition-all" style={{ width: `${(round.qualified / round.totalAppeared) * 100}%` }} />}
                      {round.rejected > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(round.rejected / round.totalAppeared) * 100}%` }} />}
                      {round.pending > 0 && <div className="bg-yellow-400 transition-all" style={{ width: `${(round.pending / round.totalAppeared) * 100}%` }} />}
                    </div>
                    {idx < currentDrive.rounds.length - 1 && (
                      <div className="flex items-center gap-1 ml-4 text-xs text-muted-foreground">
                        <ArrowRight className="w-3 h-3" /> {round.qualified} advance to next round
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Round cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentDrive.rounds.map((round, idx) => (
              <div key={round.id} className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ROUND_ICONS[round.type]}</span>
                    <div>
                      <div className="font-semibold text-sm">{round.name}</div>
                      <div className="text-xs text-muted-foreground">Round {idx + 1}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-600">{round.qualified}</div>
                    <div className="text-xs text-muted-foreground">Qualified</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <div className="text-lg font-bold text-red-500">{round.rejected}</div>
                    <div className="text-xs text-muted-foreground">Rejected</div>
                  </div>
                </div>
                <div className="text-xs text-center text-muted-foreground">{round.totalAppeared} appeared · {round.absent} absent</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ROUNDS TAB ── */}
      {activeTab === "rounds" && (
        <div className="space-y-4">
          {currentDrive.rounds.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card">
              <Layers className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No rounds configured</p>
              <p className="text-sm text-muted-foreground">Add rounds to start tracking candidates</p>
            </div>
          ) : (
            currentDrive.rounds.map((round, idx) => (
              <div key={round.id} className="bg-card border rounded-xl overflow-hidden">
                {/* Round header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <span>{ROUND_ICONS[round.type]}</span> {round.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{round.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">{round.qualified} ✓</span>
                    <span className="text-red-500">{round.rejected} ✗</span>
                    <span className="text-yellow-500">{round.pending} ⏳</span>
                    <span className="text-muted-foreground">{round.absent} absent</span>
                  </div>
                </div>

                {/* Candidates in this round */}
                <div className="divide-y">
                  {currentDrive.candidates
                    .filter(c => c.roundStatuses[round.id] !== undefined)
                    .map(c => {
                      const st = c.roundStatuses[round.id];
                      return (
                        <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">{c.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.branch} · CGPA {c.cgpa}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusPill status={st} />
                            {canManage && (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => { setEditCandidate({ candidate: c, roundId: round.id }); setNewStatus(st); }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CANDIDATES TAB ── */}
      {activeTab === "candidates" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="selected">Selected ✅</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Candidate</TableHead>
                  {currentDrive.rounds.map(r => (
                    <TableHead key={r.id} className="text-center text-xs">
                      {ROUND_ICONS[r.type]} {r.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Status</TableHead>
                  {canManage && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{c.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.branch} · {c.cgpa}</div>
                        </div>
                      </div>
                    </TableCell>
                    {currentDrive.rounds.map(r => (
                      <TableCell key={r.id} className="text-center">
                        {c.roundStatuses[r.id] ? (
                          <StatusPill status={c.roundStatuses[r.id]} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Badge className={
                        c.overallStatus === "selected" ? "bg-green-100 text-green-700 border-green-200" :
                        c.overallStatus === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }>
                        {c.overallStatus === "selected" ? "✅ Selected" : c.overallStatus === "rejected" ? "❌ Rejected" : "⏳ Active"}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-center">
                        <Select onValueChange={(roundId) => {
                          setEditCandidate({ candidate: c, roundId });
                          setNewStatus(c.roundStatuses[roundId] ?? "pending");
                        }}>
                          <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                          <SelectContent>
                            {currentDrive.rounds.map(r => (
                              <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCandidates.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No candidates match your filter</div>
            )}
          </div>
        </div>
      )}

      {/* ── FINAL SUMMARY TAB ── */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Drive info */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {currentDrive.company[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentDrive.company}</h2>
                  <p className="text-muted-foreground">{currentDrive.role}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <IndianRupee className="w-3.5 h-3.5" /> {currentDrive.packageLpa} LPA
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" /> {currentDrive.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{selectionRate}%</div>
                <div className="text-sm text-muted-foreground">Selection Rate</div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Applied", value: currentDrive.totalApplied, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
              { label: "Final Selected", value: totalSelected, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
              { label: "Total Rejected", value: totalRejected, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
              { label: "Offers Extended", value: currentDrive.candidates.filter(c => c.offerStatus).length, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm mt-1 opacity-80">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Selected students list */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-green-50/50 dark:bg-green-900/10">
              <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                <Trophy className="w-4 h-4" /> Selected Students ({totalSelected})
              </h3>
              {canManage && (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <FileDown className="w-3.5 h-3.5" /> Export CSV
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead>Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Offer Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDrive.candidates.filter(c => c.overallStatus === "selected").map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-green-100 text-green-700 font-bold">{c.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.branch}</Badge></TableCell>
                    <TableCell><span className="font-medium">{c.cgpa}</span></TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <IndianRupee className="w-3.5 h-3.5" />{c.packageLpa} LPA
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        c.offerStatus === "accepted" ? "bg-green-100 text-green-700" :
                        c.offerStatus === "extended" ? "bg-blue-100 text-blue-700" :
                        c.offerStatus === "declined" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }>
                        {c.offerStatus === "accepted" ? "✅ Accepted" :
                         c.offerStatus === "extended" ? "📨 Extended" :
                         c.offerStatus === "declined" ? "❌ Declined" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Update Candidate Status Dialog ── */}
      <Dialog open={!!editCandidate} onOpenChange={() => setEditCandidate(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Round Status</DialogTitle>
            <DialogDescription>
              Update {editCandidate?.candidate.name}'s result for{" "}
              {currentDrive.rounds.find(r => r.id === editCandidate?.roundId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {(["qualified", "rejected", "pending", "absent"] as RoundStatus[]).map(s => (
              <button key={s} onClick={() => setNewStatus(s)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  newStatus === s ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${STATUS_CONFIG[s].bg}`}>
                  {(() => { const Icon = STATUS_CONFIG[s].icon; return <Icon className={`w-4 h-4 ${STATUS_CONFIG[s].color}`} />; })()}
                </div>
                <span className={`font-medium ${STATUS_CONFIG[s].color}`}>{STATUS_CONFIG[s].label}</span>
                {newStatus === s && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCandidate(null)}>Cancel</Button>
            <Button onClick={updateCandidateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Drive Dialog ── */}
      <Dialog open={showNewDrive} onOpenChange={setShowNewDrive}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Create New Drive</DialogTitle>
            <DialogDescription>Set up a new campus recruitment drive.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input placeholder="e.g. Google" value={newDrive.company} onChange={e => setNewDrive(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role / Position</Label>
              <Input placeholder="e.g. Software Engineer" value={newDrive.role} onChange={e => setNewDrive(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Package (LPA)</Label>
              <Input placeholder="e.g. 12" value={newDrive.packageLpa} onChange={e => setNewDrive(p => ({ ...p, packageLpa: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Drive Date</Label>
              <Input type="date" value={newDrive.date} onChange={e => setNewDrive(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDrive(false)}>Cancel</Button>
            <Button onClick={handleNewDrive}>Create Drive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
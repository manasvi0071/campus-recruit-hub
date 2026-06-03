import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarDays, MapPin, Video, Clock, Building2, Users, ChevronRight,
  Filter, Bell, CheckCircle2, ExternalLink,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";

type DriveMode = "online" | "offline" | "hybrid";
type DriveStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

interface Drive {
  id: number;
  company: string;
  logo: string;
  role: string;
  date: string;
  time: string;
  mode: DriveMode;
  venue: string;
  eligibleBranches: string[];
  minCgpa: number;
  packageLpa: number;
  rounds: string[];
  status: DriveStatus;
  registrations: number;
}

const DRIVES: Drive[] = [
  {
    id: 1, company: "Google", logo: "G", role: "Software Engineer (L3)",
    date: "2025-12-20", time: "09:00 AM", mode: "online", venue: "Google Meet",
    eligibleBranches: ["CSE", "IT", "ECE"], minCgpa: 8.5, packageLpa: 45,
    rounds: ["Coding Test", "Technical Round 1", "Technical Round 2", "HR"],
    status: "upcoming", registrations: 124,
  },
  {
    id: 2, company: "Microsoft", logo: "M", role: "SDE I",
    date: "2025-12-18", time: "10:00 AM", mode: "online", venue: "Teams Call",
    eligibleBranches: ["CSE", "IT"], minCgpa: 8.0, packageLpa: 38,
    rounds: ["Aptitude Test", "Coding Round", "System Design", "HR"],
    status: "upcoming", registrations: 98,
  },
  {
    id: 3, company: "Amazon", logo: "A", role: "SDE I",
    date: "2025-12-15", time: "09:30 AM", mode: "offline", venue: "Main Auditorium, Block A",
    eligibleBranches: ["CSE", "ECE", "IT", "MECH"], minCgpa: 7.5, packageLpa: 32,
    rounds: ["Online Assessment", "Technical Interview", "Bar Raiser", "HR"],
    status: "ongoing", registrations: 210,
  },
  {
    id: 4, company: "TCS", logo: "T", role: "System Engineer",
    date: "2025-12-10", time: "08:00 AM", mode: "offline", venue: "Seminar Hall, Block B",
    eligibleBranches: ["CSE", "ECE", "MECH", "EEE", "CIVIL"], minCgpa: 6.0, packageLpa: 7,
    rounds: ["TCS NQT", "Technical", "HR"],
    status: "completed", registrations: 520,
  },
  {
    id: 5, company: "Goldman Sachs", logo: "GS", role: "Technology Analyst",
    date: "2025-12-22", time: "11:00 AM", mode: "hybrid", venue: "Innovation Lab + Zoom",
    eligibleBranches: ["CSE", "IT", "ECE"], minCgpa: 8.0, packageLpa: 22,
    rounds: ["HackerRank Test", "Technical Round 1", "Technical Round 2", "HR"],
    status: "upcoming", registrations: 76,
  },
  {
    id: 6, company: "Deloitte", logo: "D", role: "Business Analyst",
    date: "2025-12-24", time: "09:00 AM", mode: "online", venue: "Webex",
    eligibleBranches: ["CSE", "IT", "ECE", "MBA"], minCgpa: 7.0, packageLpa: 12,
    rounds: ["Aptitude Test", "Case Study", "HR"],
    status: "upcoming", registrations: 145,
  },
  {
    id: 7, company: "Wipro", logo: "W", role: "Project Engineer",
    date: "2025-12-08", time: "09:00 AM", mode: "online", venue: "Online Portal",
    eligibleBranches: ["CSE", "ECE", "MECH", "EEE", "CIVIL", "MBA"], minCgpa: 6.0, packageLpa: 6,
    rounds: ["NLTH Test", "Technical", "HR"],
    status: "completed", registrations: 480,
  },
  {
    id: 8, company: "Adobe", logo: "Ad", role: "Product Analyst",
    date: "2025-12-28", time: "10:30 AM", mode: "online", venue: "Adobe Connect",
    eligibleBranches: ["CSE", "IT"], minCgpa: 8.5, packageLpa: 18,
    rounds: ["Analytical Test", "Case Study", "Technical", "HR"],
    status: "upcoming", registrations: 55,
  },
];

const MODE_CONFIG: Record<DriveMode, { label: string; icon: React.ElementType; cls: string }> = {
  online: { label: "Online", icon: Video, cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  offline: { label: "On Campus", icon: MapPin, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  hybrid: { label: "Hybrid", icon: Building2, cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
};

const STATUS_CONFIG: Record<DriveStatus, { label: string; cls: string }> = {
  upcoming: { label: "Upcoming", cls: "bg-primary/10 text-primary border-primary/20" },
  ongoing: { label: "Ongoing 🔴", cls: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300" },
  completed: { label: "Completed", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
};

const TODAY = new Date("2025-12-14");

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.round((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export default function Schedule() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [registered, setRegistered] = useState<Set<number>>(new Set());

  const filtered = DRIVES.filter(d => {
    const okStatus = statusFilter === "all" || d.status === statusFilter;
    const okMode = modeFilter === "all" || d.mode === modeFilter;
    return okStatus && okMode;
  });

  const upcoming = DRIVES.filter(d => d.status === "upcoming" || d.status === "ongoing");
  const nextDrive = upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const isStudent = user?.role === "student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drive Schedule</h1>
          <p className="text-muted-foreground mt-1">Upcoming and ongoing campus recruitment drives across all companies.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Bell className="w-4 h-4" /> Set Reminders
        </Button>
      </div>

      {/* Next drive banner */}
      {nextDrive && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-500 text-white p-6 shadow-lg shadow-primary/20"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-6 text-8xl font-black opacity-50">📅</div>
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Next Drive</p>
              <h2 className="text-2xl font-bold">{nextDrive.company} — {nextDrive.role}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {new Date(nextDrive.date).toLocaleDateString("en-IN", { weekday:"short", month:"long", day:"numeric" })}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {nextDrive.time}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {nextDrive.registrations} registered</span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="text-2xl font-bold">₹{nextDrive.packageLpa}L</div>
              <div className="text-white/70 text-sm">{daysUntil(nextDrive.date)}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Drives", value: DRIVES.length, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
          { label: "Upcoming", value: DRIVES.filter(d => d.status === "upcoming").length, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Ongoing", value: DRIVES.filter(d => d.status === "ongoing").length, icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Completed", value: DRIVES.filter(d => d.status === "completed").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card border rounded-lg p-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">On Campus</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} drives</span>
      </div>

      {/* Drive cards */}
      <div className="space-y-4">
        {filtered.map((drive, idx) => {
          const modeCfg = MODE_CONFIG[drive.mode];
          const statusCfg = STATUS_CONFIG[drive.status];
          const ModeIcon = modeCfg.icon;
          const until = daysUntil(drive.date);
          const isReg = registered.has(drive.id);

          return (
            <motion.div
              key={drive.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
            >
              <Card className={`hover:shadow-md transition-all ${drive.status === "ongoing" ? "border-orange-300 dark:border-orange-800 shadow-orange-100 dark:shadow-orange-900/20 shadow-sm" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-muted shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{drive.logo}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-lg leading-tight">{drive.company}</h3>
                          <Badge className={`text-[10px] px-2 py-0.5 border ${statusCfg.cls}`}>{statusCfg.label}</Badge>
                          {until && drive.status === "upcoming" && (
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{until}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{drive.role}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-primary" />
                            {new Date(drive.date).toLocaleDateString("en-IN", { weekday:"short", month:"short", day:"numeric" })} · {drive.time}
                          </span>
                          <span className="flex items-center gap-1.5"><ModeIcon className="w-3.5 h-3.5" /> {drive.venue}</span>
                        </div>
                        {/* Rounds */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {drive.rounds.map((r, i) => (
                            <span key={r} className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <span className="bg-muted px-1.5 py-0.5 rounded font-medium">{r}</span>
                              {i < drive.rounds.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/50" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-start gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{drive.packageLpa}L</div>
                        <div className="text-xs text-muted-foreground">CTC per annum</div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={`text-[10px] px-2 py-0.5 border-0 ${modeCfg.cls}`}>
                          <ModeIcon className="w-3 h-3 mr-1" /> {modeCfg.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {drive.registrations} registered
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min CGPA: <span className="font-semibold text-foreground">{drive.minCgpa}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end mt-1">
                          {drive.eligibleBranches.slice(0, 3).map(b => (
                            <Badge key={b} variant="outline" className="text-[9px] px-1 py-0">{b}</Badge>
                          ))}
                          {drive.eligibleBranches.length > 3 && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0">+{drive.eligibleBranches.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      {isStudent && drive.status === "upcoming" && (
                        <Button
                          size="sm" className="mt-1 w-full"
                          variant={isReg ? "outline" : "default"}
                          onClick={() => setRegistered(prev => { const n = new Set(prev); isReg ? n.delete(drive.id) : n.add(drive.id); return n; })}
                        >
                          {isReg ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Registered</> : "Register"}
                        </Button>
                      )}
                      {drive.mode === "online" && drive.status === "ongoing" && (
                        <Button size="sm" variant="outline" className="w-full gap-1.5 mt-1">
                          <ExternalLink className="w-3.5 h-3.5" /> Join
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

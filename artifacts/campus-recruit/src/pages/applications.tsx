import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ClipboardList, CheckCircle2, Clock, XCircle, Trophy, ArrowRight,
  Building2, Briefcase, CalendarDays, IndianRupee, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useListStudents } from "@workspace/api-client-react";

type AppStatus = "applied" | "screened" | "interviewed" | "offered" | "joined" | "rejected";

interface AppRecord {
  id: number;
  company: string;
  role: string;
  packageLpa: number;
  appliedDate: string;
  status: AppStatus;
  logo: string;
  round?: string;
}

const DEMO_APPLICATIONS_STUDENT: AppRecord[] = [
  { id: 1, company: "Google", role: "Software Engineer", packageLpa: 45, appliedDate: "2025-11-10", status: "interviewed", logo: "G", round: "Technical Round 2" },
  { id: 2, company: "Microsoft", role: "SDE I", packageLpa: 38, appliedDate: "2025-11-18", status: "screened", logo: "M", round: "HR Screen" },
  { id: 3, company: "Amazon", role: "SDE I", packageLpa: 32, appliedDate: "2025-12-01", status: "offered", logo: "A", round: "Offer Extended" },
  { id: 4, company: "TCS", role: "System Engineer", packageLpa: 7, appliedDate: "2025-10-05", status: "joined", logo: "T" },
  { id: 5, company: "Infosys", role: "Analyst", packageLpa: 6.5, appliedDate: "2025-10-12", status: "applied", logo: "I" },
  { id: 6, company: "Wipro", role: "Project Engineer", packageLpa: 6, appliedDate: "2025-09-20", status: "rejected", logo: "W" },
];

const DEMO_APPLICATIONS_ADMIN: AppRecord[] = [
  ...DEMO_APPLICATIONS_STUDENT,
  { id: 7, company: "Deloitte", role: "Business Analyst", packageLpa: 12, appliedDate: "2025-11-22", status: "screened", logo: "D", round: "Case Study" },
  { id: 8, company: "Goldman Sachs", role: "Technology Analyst", packageLpa: 22, appliedDate: "2025-12-05", status: "applied", logo: "GS" },
  { id: 9, company: "Adobe", role: "Product Analyst", packageLpa: 18, appliedDate: "2025-11-30", status: "interviewed", logo: "Ad", round: "Technical" },
  { id: 10, company: "Atlassian", role: "SWE II", packageLpa: 42, appliedDate: "2025-12-10", status: "offered", logo: "At" },
];

const STAGES: { status: AppStatus; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  { status: "applied", label: "Applied", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  { status: "screened", label: "Screened", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20" },
  { status: "interviewed", label: "Interviewed", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20" },
  { status: "offered", label: "Offered", icon: Trophy, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
  { status: "joined", label: "Joined", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
];

const BADGE_CONFIG: Record<AppStatus, { variant: "default"|"secondary"|"outline"|"destructive"; label: string; cls: string }> = {
  applied: { variant: "secondary", label: "Applied", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0" },
  screened: { variant: "secondary", label: "Screened", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0" },
  interviewed: { variant: "secondary", label: "Interviewed", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0" },
  offered: { variant: "secondary", label: "Offered 🎉", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0" },
  joined: { variant: "secondary", label: "Joined ✅", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0" },
  rejected: { variant: "destructive", label: "Not Selected", cls: "" },
};

function AppCard({ app }: { app: AppRecord }) {
  const cfg = BADGE_CONFIG[app.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-muted shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{app.logo}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm leading-tight">{app.role}</p>
            <p className="text-xs text-muted-foreground">{app.company}</p>
          </div>
        </div>
        <Badge className={`text-[10px] px-1.5 shrink-0 ${cfg.cls}`}>{cfg.label}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
        <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {app.packageLpa}L</span>
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(app.appliedDate).toLocaleDateString("en-IN", { month:"short", day:"numeric" })}</span>
      </div>
      {app.round && (
        <div className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2 py-1 flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-primary shrink-0" />
          {app.round}
        </div>
      )}
    </motion.div>
  );
}

export default function Applications() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const apps = isAdmin ? DEMO_APPLICATIONS_ADMIN : DEMO_APPLICATIONS_STUDENT;

  const [view, setView] = useState<"kanban" | "list">("kanban");

  const active = apps.filter(a => a.status !== "rejected");
  const rejected = apps.filter(a => a.status === "rejected");

  const stats = {
    total: apps.length,
    active: active.length,
    offered: apps.filter(a => a.status === "offered" || a.status === "joined").length,
    successRate: Math.round((apps.filter(a => a.status === "offered" || a.status === "joined").length / apps.length) * 100),
  };

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
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "All Applications" : "My Applications"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Track all student applications across placement drives." : "Track every application you've submitted — from first click to offer."}
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <Button size="sm" variant={view === "kanban" ? "default" : "ghost"} onClick={() => setView("kanban")} className="h-8 px-3 text-xs">Kanban</Button>
          <Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")} className="h-8 px-3 text-xs">List</Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applied", value: stats.total, icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "In Progress", value: stats.active, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Offers / Joined", value: stats.offered, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Success Rate", value: `${stats.successRate}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban view */}
      <AnimatePresence mode="wait">
        {view === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4"
          >
            {STAGES.map(stage => {
              const stageApps = active.filter(a => a.status === stage.status);
              return (
                <div key={stage.status} className="space-y-3">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${stage.border} ${stage.bg}`}>
                    <div className="flex items-center gap-2">
                      <stage.icon className={`w-4 h-4 ${stage.color}`} />
                      <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${stage.color} bg-white dark:bg-background rounded-full w-5 h-5 flex items-center justify-center`}>
                      {stageApps.length}
                    </span>
                  </div>
                  <div className="space-y-3 min-h-[120px]">
                    {stageApps.length === 0 ? (
                      <div className="border border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground/60">
                        None here
                      </div>
                    ) : (
                      stageApps.map(app => <AppCard key={app.id} app={app} />)
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {view === "list" && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {active.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No active applications</div>
                ) : active.map(app => {
                  const cfg = BADGE_CONFIG[app.status];
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-colors gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9 border shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{app.logo}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{app.role}</p>
                          <p className="text-xs text-muted-foreground">{app.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                        <span className="hidden md:flex items-center gap-1"><IndianRupee className="w-3 h-3" />{app.packageLpa}L</span>
                        <span className="hidden sm:flex items-center gap-1"><CalendarDays className="w-3 h-3" />
                          {new Date(app.appliedDate).toLocaleDateString("en-IN", { month:"short", day:"numeric" })}
                        </span>
                        <Badge className={`text-[10px] ${cfg.cls}`}>{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {rejected.length > 0 && (
              <Card className="opacity-70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" /> Not Selected
                  </CardTitle>
                  <CardDescription>These companies didn't move forward — don't give up!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {rejected.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-dashed bg-muted/10 gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">{app.logo}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{app.role}</p>
                          <p className="text-xs text-muted-foreground/70">{app.company}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Not Selected</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline visualizer */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Application Pipeline Summary
          </CardTitle>
          <CardDescription>Progress across all recruitment stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-stretch gap-0 overflow-x-auto pb-2">
            {STAGES.map((stage, i) => {
              const count = apps.filter(a => a.status === stage.status).length;
              const pct = apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
              return (
                <div key={stage.status} className="flex flex-col items-center flex-1 min-w-[80px]">
                  {/* Funnel segment */}
                  <div className="relative w-full flex flex-col items-center">
                    <div
                      className={`w-full flex items-center justify-center text-white font-bold text-lg rounded-sm ${
                        i === 0 ? "rounded-l-xl" : i === STAGES.length - 1 ? "rounded-r-xl" : ""
                      }`}
                      style={{
                        background: `hsl(${243 - i * 30} ${75 - i * 5}% ${55 + i * 3}%)`,
                        minHeight: `${Math.max(48, 80 - i * 8)}px`,
                        clipPath: i < STAGES.length - 1 ? "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)" : undefined,
                        marginRight: i < STAGES.length - 1 ? "-1px" : undefined,
                      }}
                    >
                      {count}
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                    <p className="text-[10px] text-muted-foreground">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

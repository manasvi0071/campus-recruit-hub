import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, Briefcase, Building2, CheckCircle2, TrendingUp, Clock,
  Database, Trophy, Zap, ArrowRight, Star, Target,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  useGetDashboardStats, useListJobs, useListStudents,
  getGetDashboardStatsQueryKey, getListJobsQueryKey, getListStudentsQueryKey,
  getListCompaniesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

const departmentData = [
  { name: "CSE", placed: 320, total: 350 },
  { name: "ECE", placed: 210, total: 240 },
  { name: "MECH", placed: 145, total: 200 },
  { name: "EEE", placed: 110, total: 150 },
  { name: "CIVIL", placed: 85, total: 120 },
  { name: "MBA", placed: 160, total: 180 },
];

const recentActivity = [
  { id: 1, title: "Google Drive Scheduled", time: "2 hours ago" },
  { id: 2, title: "45 Students placed in TCS", time: "5 hours ago" },
  { id: 3, title: "Microsoft Shortlist Released", time: "1 day ago" },
  { id: 4, title: "New Company Registered: Goldman Sachs", time: "1 day ago" },
];

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        // Invalidate every data query so all pages refresh
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });
        toast({ title: "Sample data loaded", description: `${data.counts?.students ?? 15} students, ${data.counts?.companies ?? 10} companies, ${data.counts?.jobs ?? 7} jobs added.` });
      } else {
        toast({ title: "Seed failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const pipeline = stats ? [
    { label: "Applied", value: stats.applicationsByStatus.applied },
    { label: "Screened", value: stats.applicationsByStatus.screened },
    { label: "Interviewed", value: stats.applicationsByStatus.interviewed },
    { label: "Offered", value: stats.applicationsByStatus.offered },
    { label: "Joined", value: stats.applicationsByStatus.joined },
  ] : Array(5).fill(0).map((_, i) => ({ label: ["Applied","Screened","Interviewed","Offered","Joined"][i], value: 0 }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Live overview of placement activities.</p>
        </div>
        <Button variant="outline" onClick={handleSeed} disabled={seeding} data-testid="btn-seed-data" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          {seeding ? "Loading…" : "Load Sample Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", value: stats?.totalStudents ?? 0, icon: Users, sub: "Registered in database" },
          { label: "Placed This Year", value: stats?.placedStudents ?? 0, icon: CheckCircle2, sub: "Status: placed", green: true },
          { label: "Active Drives", value: stats?.activeJobs ?? 0, icon: Briefcase, sub: "Open job postings" },
          { label: "Companies", value: stats?.totalCompanies ?? 0, icon: Building2, sub: "Registered partners" },
        ].map(({ label, value, icon: Icon, sub, green }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "…" : value.toLocaleString()}</div>
              <p className={`text-xs mt-1 flex items-center ${green ? "text-green-500" : "text-muted-foreground"}`}>
                {green && <TrendingUp className="w-3 h-3 mr-1" />}{sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Placements by Department</CardTitle>
            <CardDescription>Comparison of placed vs total students across branches.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="placed" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Placed Students" />
                <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4,4,0,0]} name="Total Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-primary" /></div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Pipeline</CardTitle>
          <CardDescription>Current status of all active applications across drives.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between relative px-4 py-8">
            <div className="absolute left-10 right-10 top-1/2 h-1 bg-muted -translate-y-1/2 z-0" />
            {pipeline.map((step, index) => (
              <div key={step.label} className="relative z-10 flex flex-col items-center bg-card px-2">
                <div className="w-12 h-12 rounded-full border-4 border-background bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">{index + 1}</div>
                <div className="mt-4 text-center">
                  <div className="font-semibold text-lg">{step.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{step.label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: jobs = [], isLoading: jobsLoading } = useListJobs();
  const { data: students = [] } = useListStudents();

  // Try to find this student's record by email
  const myStudent = students.find(s => s.email === user?.email);
  const readiness = myStudent?.readinessScore ?? null;
  const openJobs = jobs.filter(j => j.status === "open");

  // Eligible jobs for this student (branch + cgpa)
  const eligibleJobs = myStudent
    ? openJobs.filter(j => {
        const branchOk = !j.eligibleBranches || j.eligibleBranches.split(",").map(b => b.trim()).includes(myStudent.branch);
        const cgpaOk = !j.minCgpa || myStudent.cgpa >= j.minCgpa;
        return branchOk && cgpaOk;
      })
    : openJobs;

  const scoreLabel = readiness == null ? null : readiness >= 80 ? "Excellent" : readiness >= 65 ? "Good" : "Needs Work";
  const scoreColor = readiness == null ? "text-muted-foreground" : readiness >= 80 ? "text-green-500" : readiness >= 65 ? "text-yellow-500" : "text-destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-background border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {myStudent
              ? `${myStudent.branch} · CGPA ${myStudent.cgpa} · Batch ${myStudent.graduationYear}`
              : "Your personalised placement dashboard"}
          </p>
        </div>
        <Button onClick={() => setLocation("/scorecard")} className="gap-2 shrink-0">
          <Trophy className="w-4 h-4" /> View Full Scorecard
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${scoreColor}`}>{readiness ?? "—"}</div>
                <div className="text-xs text-muted-foreground">Readiness Score</div>
              </div>
            </div>
            {readiness !== null && (
              <Progress value={readiness} className="mt-3 h-1.5" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{eligibleJobs.length}</div>
                <div className="text-xs text-muted-foreground">Eligible Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{scoreLabel ?? "—"}</div>
                <div className="text-xs text-muted-foreground">Placement Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{openJobs.length}</div>
                <div className="text-xs text-muted-foreground">Active Drives</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eligible jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jobs You're Eligible For</CardTitle>
            <CardDescription>Based on your branch and CGPA</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/jobs")} className="gap-1.5">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading jobs…</div>
          ) : eligibleJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No open jobs right now. Check back soon!</div>
          ) : (
            <div className="space-y-3">
              {eligibleJobs.slice(0, 4).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {(job.companyName ?? job.title)[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.companyName} · ₹{job.packageLpa}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.deadline && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Due {new Date(job.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    <Badge variant="default" className="text-xs">Open</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "View My Scorecard", desc: "See your placement readiness breakdown", icon: Trophy, href: "/scorecard", color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Browse All Jobs", desc: "Explore all active placement drives", icon: Briefcase, href: "/jobs", color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Raise a Grievance", desc: "Report an issue to placement office", icon: Star, href: "/grievances", color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map(item => (
          <Card key={item.label} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setLocation(item.href)}>
            <CardContent className="pt-5 pb-5">
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mb-3`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Recruiter Dashboard ──────────────────────────────────────────────────────
function RecruiterDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: jobs = [], isLoading } = useListJobs();

  const openJobs = jobs.filter(j => j.status === "open");
  const closedJobs = jobs.filter(j => j.status === "closed");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-background border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Manage your job postings and applications.</p>
        </div>
        <Button onClick={() => setLocation("/jobs")} className="gap-2 shrink-0">
          <Briefcase className="w-4 h-4" /> Post a Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Postings", value: openJobs.length, icon: Briefcase, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Closed Drives", value: closedJobs.length, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Jobs Listed", value: jobs.length, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <div className={`text-3xl font-bold ${color}`}>{isLoading ? "…" : value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Job Postings</CardTitle>
            <CardDescription>All drives currently listed on the platform</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/jobs")}>Manage All</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading…</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No jobs posted yet.</div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 text-sm shrink-0">
                      {(job.companyName ?? job.title)[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.companyName} · ₹{job.packageLpa ?? "—"}L</p>
                    </div>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "outline"} className="capitalize">{job.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Manage Job Postings", desc: "Create, edit and close your recruitment drives", icon: Briefcase, href: "/jobs", color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "View Companies", desc: "Browse registered company profiles", icon: Building2, href: "/companies", color: "text-primary", bg: "bg-primary/10" },
        ].map(item => (
          <Card key={item.label} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setLocation(item.href)}>
            <CardContent className="pt-5 pb-5">
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center mb-3`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role ?? "student";
  if (role === "admin") return <AdminDashboard />;
  if (role === "recruiter") return <RecruiterDashboard />;
  return <StudentDashboard />;
}

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Building2, CheckCircle2, TrendingUp, Clock, Database } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Sample data loaded", description: "15 students, 10 companies and 5 jobs added." });
      }
    } catch {
      toast({ title: "Seed failed", variant: "destructive" });
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
  ] : [
    { label: "Applied", value: 0 },
    { label: "Screened", value: 0 },
    { label: "Interviewed", value: 0 },
    { label: "Offered", value: 0 },
    { label: "Joined", value: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Live overview of placement activities.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSeed}
          disabled={seeding}
          data-testid="btn-seed-data"
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          {seeding ? "Loading..." : "Load Sample Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-students">
              {isLoading ? "..." : (stats?.totalStudents ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Placed This Year</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-placed-students">
              {isLoading ? "..." : (stats?.placedStudents ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Status: placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Drives</CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-jobs">
              {isLoading ? "..." : (stats?.activeJobs ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Open job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-companies">
              {isLoading ? "..." : (stats?.totalCompanies ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered partners</p>
          </CardContent>
        </Card>
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
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="placed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Placed Students" />
                <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Total Students" />
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
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {activity.time}
                    </p>
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
                <div className="w-12 h-12 rounded-full border-4 border-background bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                  {index + 1}
                </div>
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

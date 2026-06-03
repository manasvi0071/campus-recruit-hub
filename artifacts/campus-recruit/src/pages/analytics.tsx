import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Users, Target, IndianRupee, Award, Building2, Percent } from "lucide-react";

const departmentPlacement = [
  { name: "CSE", rate: 92, placed: 320, total: 347 },
  { name: "ECE", rate: 85, placed: 204, total: 240 },
  { name: "IT", rate: 88, placed: 176, total: 200 },
  { name: "MECH", rate: 65, placed: 130, total: 200 },
  { name: "CIVIL", rate: 58, placed: 70, total: 121 },
  { name: "MBA", rate: 82, placed: 148, total: 180 },
];

const salaryTrend = [
  { year: "2021", avg: 6.5, highest: 24, median: 5.8 },
  { year: "2022", avg: 7.2, highest: 28, median: 6.5 },
  { year: "2023", avg: 8.2, highest: 32, median: 7.4 },
  { year: "2024", avg: 9.6, highest: 45, median: 8.8 },
];

const industryDistribution = [
  { name: "IT/Software", value: 45 },
  { name: "Core Engineering", value: 20 },
  { name: "Consulting", value: 15 },
  { name: "Finance", value: 12 },
  { name: "Others", value: 8 },
];

const topCompanies = [
  { name: "TCS", hires: 320 },
  { name: "Infosys", hires: 280 },
  { name: "Wipro", hires: 150 },
  { name: "Cognizant", hires: 140 },
  { name: "Capgemini", hires: 110 },
];

const monthlyApplications = [
  { month: "Aug", applications: 240, offers: 0 },
  { month: "Sep", applications: 580, offers: 40 },
  { month: "Oct", applications: 920, offers: 180 },
  { month: "Nov", applications: 1240, offers: 420 },
  { month: "Dec", applications: 1580, offers: 680 },
  { month: "Jan", applications: 1820, offers: 960 },
];

const skillRadarData = [
  { skill: "DSA", current: 65, target: 90 },
  { skill: "DBMS", current: 72, target: 85 },
  { skill: "OS", skill2: "OS", current: 58, target: 80 },
  { skill: "Networking", current: 50, target: 75 },
  { skill: "System Design", current: 45, target: 85 },
  { skill: "Soft Skills", current: 78, target: 90 },
];

const COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    borderRadius: "10px",
    border: "1px solid hsl(var(--border))",
    fontSize: "12px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
};

const YEAR_STATS = [
  { label: "Placement Rate", value: "78.4%", sub: "+10% vs last year", icon: Target, card: true },
  { label: "Average Package", value: "₹9.6L", sub: "+17% YoY", icon: IndianRupee, green: true },
  { label: "Total Offers", value: "1,448", sub: "Across 92 companies", icon: Users },
  { label: "Highest Package", value: "₹45L", sub: "Offered by Google", icon: Award },
];

export default function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Deep dive into placement performance and historical trends.</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live · AY 2024–25
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {YEAR_STATS.map(({ label, value, sub, icon: Icon, card, green }) => (
          <Card key={label} className={card ? "bg-gradient-to-br from-primary to-blue-500 text-primary-foreground border-none shadow-lg shadow-primary/20" : ""}>
            <CardHeader className="pb-2 space-y-0">
              <CardTitle className={`text-xs font-medium flex items-center gap-1.5 ${card ? "text-white/80" : "text-muted-foreground"}`}>
                <Icon className="w-4 h-4" /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${card ? "text-white/70" : green ? "text-emerald-500" : "text-muted-foreground"}`}>
                {green && <TrendingUp className="w-3 h-3" />}
                {sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Application & Offer Trend</CardTitle>
            <CardDescription>Monthly cumulative applications vs offers received this season</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyApplications} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradOffer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradApp)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="offers" name="Offers" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#gradOffer)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Breakdown of placements by sector</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryDistribution} cx="50%" cy="45%"
                  innerRadius={65} outerRadius={95}
                  paddingAngle={3} dataKey="value"
                >
                  {industryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Placement Rate</CardTitle>
            <CardDescription>Percentage of students placed per branch this year</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPlacement} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip {...tooltipStyle} formatter={v => [`${v}%`, "Placement Rate"]} />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Trend (4-Year)</CardTitle>
            <CardDescription>Average, median and highest CTC in LPA</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salaryTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
                <Tooltip {...tooltipStyle} formatter={v => [`₹${v}L`, ""]} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="highest" name="Highest" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="avg" name="Average" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ r: 3.5 }} activeDot={{ r: 5 }} strokeDasharray="0" />
                <Line type="monotone" dataKey="median" name="Median" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Hiring Partners</CardTitle>
            <CardDescription>Companies with the highest offer count this season</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {topCompanies.map((co, i) => (
              <div key={co.name} className="flex items-center gap-4">
                <div className="w-6 text-xs font-bold text-muted-foreground shrink-0">#{i + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium">{co.name}</span>
                    <span className="text-muted-foreground font-semibold">{co.hires}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(co.hires / topCompanies[0].hires) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Skill Radar</CardTitle>
            <CardDescription>Current batch skill level vs target benchmark</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Target" dataKey="target" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.05} strokeWidth={2} strokeDasharray="4 2" />
                <Tooltip {...tooltipStyle} formatter={v => [`${v}%`, ""]} />
                <Legend iconType="circle" iconSize={8} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department detail table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Department-wise Breakdown
          </CardTitle>
          <CardDescription>Detailed placement statistics for all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentPlacement.map(dept => (
              <div key={dept.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors">
                <div className="w-14 text-center">
                  <span className="font-bold text-sm text-primary">{dept.name}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{dept.placed} placed / {dept.total} total</span>
                    <span className="font-bold text-foreground">{dept.rate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.rate}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        dept.rate >= 85 ? "bg-emerald-500" :
                        dept.rate >= 70 ? "bg-primary" :
                        dept.rate >= 60 ? "bg-yellow-500" : "bg-destructive"
                      }`}
                    />
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-xs ${
                    dept.rate >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                    dept.rate >= 70 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {dept.rate >= 85 ? "Excellent" : dept.rate >= 70 ? "Good" : "Needs Focus"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

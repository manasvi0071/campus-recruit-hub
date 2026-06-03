import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit, FileText, AlertTriangle, Crosshair, Sparkles, CheckCircle2,
  Copy, Loader2, TrendingUp, Users, Zap, Target,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const SMART_DRAFT = `Dear Hiring Manager,

I am writing to express my interest in the Full Stack Developer position. As a Computer Science graduate with hands-on experience in React, Node.js, and PostgreSQL, I am confident in my ability to contribute effectively.

Key highlights:
• Developed a scalable e-commerce platform serving 500+ users, achieving 99.9% uptime
• Reduced API response time by 35% through query optimization and Redis caching
• Contributed to 3 open-source projects with 120+ GitHub stars

I am proficient in modern tooling including Docker, AWS EC2/S3, and CI/CD pipelines. I am eager to bring my problem-solving skills and passion for clean code to your team.

I look forward to discussing how my background aligns with your goals.

Warm regards,
Amit Kumar`;

const ANALYSIS_RESULTS = [
  { label: "Students analysed", value: "847", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { label: "Placement probability", value: "88.5%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "At-risk students", value: "23", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { label: "Top skill gap", value: "DSA", icon: Target, color: "text-destructive", bg: "bg-destructive/10" },
];

const SKILL_GAPS = [
  { skill: "Data Structures & Algorithms", gap: 68, demand: 95 },
  { skill: "System Design", gap: 54, demand: 88 },
  { skill: "Cloud (AWS / Azure)", gap: 41, demand: 82 },
  { skill: "Communication Skills", gap: 62, demand: 90 },
  { skill: "SQL & Databases", gap: 47, demand: 78 },
];

export default function AIInsights() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(false);

  const handleGenerateDraft = () => {
    setGenerating(true);
    setDraft(null);
    setTimeout(() => { setGenerating(false); setDraft(SMART_DRAFT); }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SMART_DRAFT);
    toast({ title: "Copied to clipboard!" });
  };

  const handleRunAnalysis = () => {
    setAnalysing(true);
    setAnalysisResult(false);
    setTimeout(() => { setAnalysing(false); setAnalysisResult(true); }, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            AI Insights Hub <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Predictive analytics and smart recommendations powered by TalentHub AI.</p>
        </div>
        <Button
          className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          variant="ghost"
          onClick={handleRunAnalysis}
          disabled={analysing}
          data-testid="btn-run-analysis"
        >
          {analysing
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing batch…</>
            : <><BrainCircuit className="w-4 h-4 mr-2" /> Run Full Analysis</>}
        </Button>
      </div>

      {/* Analysis result banner */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {ANALYSIS_RESULTS.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} className="border-primary/20">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Gaps (shown after analysis) */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" /> Batch Skill Gap Analysis
                </CardTitle>
                <CardDescription>Top skills where student proficiency lags behind industry demand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {SKILL_GAPS.map(({ skill, gap, demand }) => (
                  <div key={skill} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill}</span>
                      <span className="text-muted-foreground">
                        Proficiency <span className="text-foreground font-semibold">{100 - gap}%</span>
                        {" · "}Demand <span className="text-primary font-semibold">{demand}%</span>
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${demand}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-700" style={{ width: `${100 - gap}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-primary/20 shadow-md shadow-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-destructive" /> Dropout Risk Alerts
              </CardTitle>
              <CardDescription>Students at risk of missing placement criteria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Rahul Sharma", id: "CS21045", reason: "Attendance dropped below 75%" },
                { name: "Priya Desai", id: "EC21089", reason: "Failing mock interviews consistently" },
              ].map((student, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-destructive/10 text-destructive text-xs">{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{student.name} <span className="text-muted-foreground font-normal">({student.id})</span></p>
                    <p className="text-xs text-muted-foreground">{student.reason}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-sm h-8" size="sm">View All Alerts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Crosshair className="w-5 h-5 mr-2 text-chart-2" /> Top 5 CHRS Candidates
              </CardTitle>
              <CardDescription>Highest Campus Hiring Readiness Scores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Aditi Rao", score: 98, branch: "CSE" },
                  { name: "Karan Singh", score: 96, branch: "CSE" },
                  { name: "Sneha Patel", score: 94, branch: "ECE" },
                  { name: "Rohan Das", score: 92, branch: "IT" },
                  { name: "Vikram Mehta", score: 91, branch: "MECH" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-muted-foreground text-sm w-4">{i + 1}.</div>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.branch}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20">{s.score}/100</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2 & 3 */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileText className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" /> AI Resume Score Analyzer (Sample)
              </CardTitle>
              <CardDescription>Real-time analysis of student resumes against industry standards.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Amit Kumar (CS21092)</h3>
                    <p className="text-sm text-muted-foreground">Target Role: Full Stack Developer</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall ATS Score</span>
                      <span className="font-bold text-primary">74/100</span>
                    </div>
                    <Progress value={74} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {[
                      { label: "Keyword Match", val: 65, cls: "[&>div]:bg-yellow-500" },
                      { label: "Impact Metrics", val: 45, cls: "[&>div]:bg-destructive" },
                      { label: "Formatting", val: 95, cls: "[&>div]:bg-green-500" },
                      { label: "Action Verbs", val: 80, cls: "[&>div]:bg-chart-2" },
                    ].map(({ label, val, cls }) => (
                      <div key={label} className="space-y-1">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <Progress value={val} className={`h-1.5 ${cls}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 bg-secondary/50 rounded-lg p-4 border space-y-3">
                  <h4 className="text-sm font-semibold flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-1.5 text-primary" /> AI Feedback
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Missing quantitative metrics in project descriptions. Add results like "improved performance by 20%".</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Lacking modern keywords for Full Stack: missing 'Docker', 'AWS', 'Next.js'.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                      <span>Excellent clean formatting, no parsing errors detected by simulated ATS.</span>
                    </li>
                  </ul>
                  <Button size="sm" className="w-full mt-2" onClick={handleGenerateDraft} disabled={generating} data-testid="btn-generate-draft">
                    {generating
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                      : <><Sparkles className="w-4 h-4 mr-2" /> Generate Smart Suggestion Draft</>}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {draft && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="border rounded-lg bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" /> AI-Generated Cover Letter Draft
                        </h4>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1.5">
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </Button>
                      </div>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{draft}</pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Job Fit Predictor</CardTitle>
                <CardDescription>Google SDE I Role Match</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-primary/20 border-t-primary">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">82%</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Match</div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Based on historical hiring data, the current batch has an 82% skill alignment with Google's SDE I requirements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Placement Success Probability</CardTitle>
                <CardDescription>Forecast for current academic year</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Predicted Placement Rate</span>
                  <span className="text-lg font-bold text-chart-2">88.5%</span>
                </div>
                <Progress value={88.5} className="h-2 [&>div]:bg-chart-2" />
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4 border">
                  <strong>Insight:</strong> Increasing focus on System Design for CSE/IT students could bump placement probability to <span className="text-foreground font-medium">92%</span>.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

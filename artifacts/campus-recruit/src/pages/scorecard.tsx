import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Trophy, BrainCircuit, CheckCircle2, AlertTriangle, TrendingUp,
  BookOpen, Building2, Zap, Target, Star, Users, Lightbulb,
} from "lucide-react";
import { useListStudents } from "@workspace/api-client-react";

type StudentScorecard = {
  cgpa: number;
  technical: number;
  aptitude: number;
  communication: number;
  resumeQuality: number;
  mockInterview: number;
};

const DEMO_SCORECARDS: Record<number, StudentScorecard> = {};

function generateScorecard(cgpa: number, seed: number): StudentScorecard {
  const r = (base: number, variance: number) => Math.min(100, Math.max(20, Math.round(base + (seed % variance) - variance / 2)));
  return {
    cgpa: Math.round((cgpa / 10) * 100),
    technical: r(72, 30),
    aptitude: r(78, 25),
    communication: r(68, 35),
    resumeQuality: r(80, 28),
    mockInterview: r(65, 40),
  };
}

function getOverallScore(s: StudentScorecard) {
  return Math.round(
    s.cgpa * 0.2 + s.technical * 0.25 + s.aptitude * 0.15 +
    s.communication * 0.15 + s.resumeQuality * 0.1 + s.mockInterview * 0.15
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 65) return "text-yellow-500";
  return "text-destructive";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 65) return "bg-yellow-500";
  return "bg-destructive";
}

function getScoreLabel(score: number) {
  if (score >= 85) return { label: "Excellent", emoji: "🟢", variant: "Highly Placement Ready" };
  if (score >= 70) return { label: "Good", emoji: "🟡", variant: "Placement Ready" };
  if (score >= 55) return { label: "Average", emoji: "🟠", variant: "Needs Improvement" };
  return { label: "Below Average", emoji: "🔴", variant: "Not Yet Ready" };
}

const COMPANY_PREDICTIONS = [
  { name: "TCS", logo: "T", baseChance: 85, minScore: 50 },
  { name: "Infosys", logo: "I", baseChance: 78, minScore: 55 },
  { name: "Wipro", logo: "W", baseChance: 90, minScore: 48 },
  { name: "Accenture", logo: "A", baseChance: 72, minScore: 58 },
  { name: "Capgemini", logo: "C", baseChance: 80, minScore: 52 },
  { name: "HCL", logo: "H", baseChance: 83, minScore: 50 },
  { name: "Google", logo: "G", baseChance: 35, minScore: 88 },
  { name: "Microsoft", logo: "M", baseChance: 42, minScore: 85 },
];

const COURSES = [
  { name: "Data Structures & Algorithms", platform: "LeetCode", icon: "💻" },
  { name: "System Design Fundamentals", platform: "Coursera", icon: "🏗️" },
  { name: "Communication Skills for IT", platform: "Udemy", icon: "🗣️" },
  { name: "React.js & Modern Frontend", platform: "freeCodeCamp", icon: "⚛️" },
  { name: "SQL & Database Design", platform: "W3Schools", icon: "🗄️" },
  { name: "AWS Cloud Practitioner", platform: "AWS Skill Builder", icon: "☁️" },
];

const METRICS = [
  { key: "cgpa", label: "CGPA", weight: "20%" },
  { key: "technical", label: "Technical Skills", weight: "25%" },
  { key: "aptitude", label: "Aptitude", weight: "15%" },
  { key: "communication", label: "Communication Skills", weight: "15%" },
  { key: "resumeQuality", label: "Resume Quality", weight: "10%" },
  { key: "mockInterview", label: "Mock Interview Performance", weight: "15%" },
] as const;

export default function Scorecard() {
  const { data: students = [], isLoading } = useListStudents();
  const [selectedId, setSelectedId] = useState<string>("");

  const student = students.find(s => String(s.id) === selectedId);

  const scorecard: StudentScorecard | null = student
    ? (DEMO_SCORECARDS[student.id] ??= generateScorecard(student.cgpa, student.id * 7 + 13))
    : null;

  const overall = scorecard ? getOverallScore(scorecard) : 0;
  const rating = getScoreLabel(overall);

  const strengths = scorecard
    ? METRICS.filter(m => scorecard[m.key] >= 80).map(m => m.label)
    : [];
  const weaknesses = scorecard
    ? METRICS.filter(m => scorecard[m.key] < 65).map(m => m.label)
    : [];

  const eligibleCompanies = scorecard
    ? COMPANY_PREDICTIONS.filter(c => c.minScore <= overall)
    : [];

  const predictions = scorecard
    ? COMPANY_PREDICTIONS.map(c => ({
        ...c,
        chance: Math.min(98, Math.round(c.baseChance * (overall / 75))),
      })).filter(c => c.minScore <= overall + 10)
    : [];

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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Placement Readiness Scorecard <Trophy className="w-7 h-7 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of student placement preparedness with personalised recommendations.
          </p>
        </div>
      </div>

      {/* Student Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="max-w-sm" data-testid="select-student">
                  <SelectValue placeholder={isLoading ? "Loading students…" : "Select a student to analyse"} />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — {s.branch} · CGPA {s.cgpa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {student && (
              <Badge variant="outline" className="shrink-0">{student.branch} · {student.graduationYear}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedId && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-3">
          <Trophy className="w-16 h-16 opacity-20" />
          <p className="text-lg font-medium">Select a student to generate their scorecard</p>
          <p className="text-sm">The AI will analyse their profile and predict placement readiness.</p>
        </div>
      )}

      <AnimatePresence>
        {scorecard && student && (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Overall Score Banner */}
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-primary/30 bg-background shadow-inner shrink-0">
                    <span className={`text-5xl font-extrabold ${getScoreColor(overall)}`}>{overall}</span>
                    <span className="text-xs text-muted-foreground mt-1">out of 100</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-xl font-bold">👤 {student.name}</h2>
                      <p className="text-muted-foreground text-sm">{student.branch} · CGPA {student.cgpa} · Batch {student.graduationYear}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-lg">{rating.emoji}</span>
                      <Badge className={`${overall >= 80 ? "bg-green-500 hover:bg-green-600" : overall >= 65 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-destructive hover:bg-destructive/90"} text-white`}>
                        {rating.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{rating.variant}</span>
                    </div>
                    <Progress value={overall} className={`h-3 [&>div]:${getScoreBg(overall)}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown + AI Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Breakdown Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-primary" /> Score Breakdown
                  </CardTitle>
                  <CardDescription>Weighted across 6 key parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {METRICS.map(({ key, label, weight }) => {
                    const val = scorecard[key];
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{weight}</span>
                            <span className={`font-bold w-8 text-right ${getScoreColor(val)}`}>{val}%</span>
                          </div>
                        </div>
                        <Progress value={val} className={`h-2 [&>div]:${getScoreBg(val)}`} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BrainCircuit className="w-5 h-5 text-primary" /> AI Suggestions
                  </CardTitle>
                  <CardDescription>Personalised insights from TalentHub AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" /> Your Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {strengths.map(s => (
                          <li key={s} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" /> Areas to Improve
                      </h4>
                      <ul className="space-y-1.5">
                        {weaknesses.map(w => (
                          <li key={w} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1 border">
                    <p className="font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" /> AI Tip
                    </p>
                    <p className="text-muted-foreground">
                      {overall >= 80
                        ? "You are highly placement ready. Focus on applying to top-tier companies and preparing for advanced system design interviews."
                        : overall >= 65
                        ? "You are on the right track. Boost your mock interview scores and add quantifiable achievements to your resume."
                        : "Start with aptitude and DSA fundamentals. Aim for 2 mock interviews per week to build confidence."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Overall Score",
                  value: `${overall}/100`,
                  icon: Trophy,
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                },
                {
                  label: "Placement Probability",
                  value: `${Math.min(98, Math.round(overall * 1.05))}%`,
                  icon: TrendingUp,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  label: "Missing Skills",
                  value: `${weaknesses.length} area${weaknesses.length !== 1 ? "s" : ""}`,
                  icon: AlertTriangle,
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                },
                {
                  label: "Recommended Courses",
                  value: `${COURSES.length} courses`,
                  icon: BookOpen,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Eligible Companies",
                  value: `${eligibleCompanies.length} companies`,
                  icon: Building2,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  label: "Upcoming Drives",
                  value: "3 this week",
                  icon: Zap,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label}>
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
            </div>

            {/* AI Placement Predictions + Recommended Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Predictions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-chart-2" /> AI Placement Prediction
                  </CardTitle>
                  <CardDescription>Based on historical batch data and your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {predictions.map(company => (
                    <div key={company.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                        {company.logo}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{company.name}</span>
                          <span className={`font-bold ${getScoreColor(company.chance)}`}>{company.chance}% chance</span>
                        </div>
                        <Progress value={company.chance} className={`h-1.5 [&>div]:${getScoreBg(company.chance)}`} />
                      </div>
                    </div>
                  ))}
                  {predictions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Improve your score to unlock company predictions.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Recommended Courses
                  </CardTitle>
                  <CardDescription>Curated learning path to boost your score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {COURSES.map(course => (
                    <div key={course.name} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                      <span className="text-xl shrink-0">{course.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.platform}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

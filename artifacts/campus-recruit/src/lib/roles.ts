import {
  LayoutDashboard, Users, Building2, Briefcase, BarChart3,
  BrainCircuit, MessageSquareWarning, Trophy, CalendarDays,
  ClipboardList, type LucideIcon, Flame, UserCircle, BellRing, Cpu, Layers,
} from "lucide-react";


export type UserRole = "admin" | "student" | "recruiter";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/", label: "Command Center", icon: LayoutDashboard },
    { href: "/students", label: "Students", icon: Users },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/jobs", label: "Jobs & Drives", icon: Briefcase },
    { href: "/schedule", label: "Drive Schedule", icon: CalendarDays },
    { href: "/applications", label: "Applications", icon: ClipboardList },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/ai-insights", label: "AI Insights", icon: BrainCircuit },
    { href: "/scorecard", label: "Readiness Scorecard", icon: Trophy },
    { href: "/grievances", label: "Grievances", icon: MessageSquareWarning },
    { href: "/interview-dashboard", label: "Interview Tracker", icon: LayoutDashboard },
    { href: "/notifications", label: "Notifications", icon: BellRing },
    { href: "/ai-hub", label: "AI Hub", icon: Cpu },
  ],
  student: [
    { href: "/", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/schedule", label: "Drive Schedule", icon: CalendarDays },
    { href: "/applications", label: "My Applications", icon: ClipboardList },
    { href: "/scorecard", label: "My Scorecard", icon: Trophy },
    { href: "/grievances", label: "My Grievances", icon: MessageSquareWarning },
    { href: "/challenge-arena", label: "Challenge Arena", icon: Flame },
    { href: "/profile", label: "My Profile", icon: UserCircle },
    { href: "/ai-hub", label: "AI Hub", icon: Cpu },
  ],
  recruiter: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/schedule", label: "Drive Schedule", icon: CalendarDays },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/interview-dashboard", label: "Interview Tracker", icon: LayoutDashboard },
    { href: "/notifications", label: "Notifications", icon: BellRing },
    { href: "/ai-hub", label: "AI Hub", icon: Cpu },
  ],
};

export const ALLOWED_ROUTES: Record<UserRole, string[]> = {
  admin: ["/", "/students", "/companies", "/jobs", "/analytics", "/ai-insights", "/scorecard", "/grievances", "/schedule", "/applications", "/interview-dashboard",  "/notifications", "/ai-hub"],
  student: ["/", "/jobs", "/scorecard", "/grievances", "/schedule", "/applications", "/profile", "/challenge-arena", "/ai-hub"],
  recruiter: ["/", "/jobs", "/companies", "/schedule", "/interview-dashboard", "/notifications", "/ai-hub"],
};

export function getRoleLabel(role: string): string {
  if (role === "admin") return "Placement Officer";
  if (role === "recruiter") return "Company Recruiter";
  return "Student";
}

export function getRoleBadgeClass(role: string): string {
  if (role === "admin") return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
  if (role === "recruiter") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
}

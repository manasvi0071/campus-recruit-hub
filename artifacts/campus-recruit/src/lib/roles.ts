import {
  LayoutDashboard, Users, Building2, Briefcase, BarChart3,
  BrainCircuit, MessageSquareWarning, Trophy, type LucideIcon,
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
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/ai-insights", label: "AI Insights", icon: BrainCircuit },
    { href: "/scorecard", label: "Readiness Scorecard", icon: Trophy },
    { href: "/grievances", label: "Grievances", icon: MessageSquareWarning },
  ],
  student: [
    { href: "/", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/scorecard", label: "My Scorecard", icon: Trophy },
    { href: "/grievances", label: "My Grievances", icon: MessageSquareWarning },
  ],
  recruiter: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/companies", label: "Companies", icon: Building2 },
  ],
};

/** Routes each role is allowed to visit */
export const ALLOWED_ROUTES: Record<UserRole, string[]> = {
  admin: ["/", "/students", "/companies", "/jobs", "/analytics", "/ai-insights", "/scorecard", "/grievances"],
  student: ["/", "/jobs", "/scorecard", "/grievances"],
  recruiter: ["/", "/jobs", "/companies"],
};

export function getRoleLabel(role: string): string {
  if (role === "admin") return "Placement Officer";
  if (role === "recruiter") return "Company Recruiter";
  return "Student";
}

export function getRoleBadgeClass(role: string): string {
  if (role === "admin") return "bg-purple-500/10 text-purple-500";
  if (role === "recruiter") return "bg-blue-500/10 text-blue-500";
  return "bg-green-500/10 text-green-500";
}

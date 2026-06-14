import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AIAssistant } from "@/components/ai-assistant";
import { ALLOWED_ROUTES, type UserRole } from "@/lib/roles";

import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Companies from "@/pages/companies";
import Jobs from "@/pages/jobs";
import Analytics from "@/pages/analytics";
import AIInsights from "@/pages/ai-insights";
import Grievances from "@/pages/grievances";
import Scorecard from "@/pages/scorecard";
import Schedule from "@/pages/schedule";
import Applications from "@/pages/applications";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ChallengeArena from "@/pages/challenge-arena";
import Profile from "@/pages/profile";
import InterviewDashboard from "@/pages/interview-dashboard";
import NotificationSystem from "@/pages/notification-system";
import AIHub from "@/pages/ai-hub";
import Landing from "@/pages/landing";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType; path: string }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/landing");
      return;
    }
    if (!loading && user) {
      const role = user.role as UserRole;
      const allowed = ALLOWED_ROUTES[role] ?? ALLOWED_ROUTES.student;
      if (!allowed.includes(path)) {
        setLocation("/");
      }
    }
  }, [loading, user, path, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!user) return null;

  const role = user.role as UserRole;
  const allowed = ALLOWED_ROUTES[role] ?? ALLOWED_ROUTES.student;
  if (!allowed.includes(path)) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} path="/" />} />
      <Route path="/students" component={() => <ProtectedRoute component={Students} path="/students" />} />
      <Route path="/companies" component={() => <ProtectedRoute component={Companies} path="/companies" />} />
      <Route path="/jobs" component={() => <ProtectedRoute component={Jobs} path="/jobs" />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} path="/analytics" />} />
      <Route path="/ai-insights" component={() => <ProtectedRoute component={AIInsights} path="/ai-insights" />} />
      <Route path="/scorecard" component={() => <ProtectedRoute component={Scorecard} path="/scorecard" />} />
      <Route path="/grievances" component={() => <ProtectedRoute component={Grievances} path="/grievances" />} />
      <Route path="/schedule" component={() => <ProtectedRoute component={Schedule} path="/schedule" />} />
      <Route path="/applications" component={() => <ProtectedRoute component={Applications} path="/applications" />} />
      <Route path="/challenge-arena">
      <ProtectedRoute component={ChallengeArena} path="/challenge-arena" /></Route>
      <Route path="/profile">
      <ProtectedRoute component={Profile} path="/profile" />
      </Route>
      <Route path="/interview-dashboard">
      <ProtectedRoute component={InterviewDashboard} path="/interview-dashboard" />
      </Route>
      <Route path="/notifications">
      <ProtectedRoute component={NotificationSystem} path="/notifications" />
      </Route>
      <Route path="/ai-hub"><ProtectedRoute component={AIHub} path="/ai-hub" /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <AIAssistant />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

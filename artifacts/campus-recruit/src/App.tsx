import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ALLOWED_ROUTES, type UserRole } from "@/lib/roles";

import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Companies from "@/pages/companies";
import Jobs from "@/pages/jobs";
import Analytics from "@/pages/analytics";
import AIInsights from "@/pages/ai-insights";
import Grievances from "@/pages/grievances";
import Scorecard from "@/pages/scorecard";
import Login from "@/pages/login";
import Register from "@/pages/register";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType; path: string }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
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
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

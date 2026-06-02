import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Login failed", variant: "destructive" });
        return;
      }
      login(data);
      setLocation("/");
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <BrainCircuit className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">PlaceIQ</h1>
          <p className="text-muted-foreground mt-1">Campus Recruitment Management</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>Enter your credentials to access the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email" type="email" placeholder="you@college.edu"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      required data-testid="input-login-password"
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="btn-login">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                New student?{" "}
                <button onClick={() => setLocation("/register")}
                  className="text-primary font-medium hover:underline" data-testid="link-register">
                  Register here
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border p-4 space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Accounts</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {[
              { role: "Admin", email: "admin@placeiq.edu", pass: "admin123" },
              { role: "Student", email: "student@college.edu", pass: "student123" },
            ].map(d => (
              <button key={d.role} onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                className="flex items-center justify-between bg-muted/50 rounded px-3 py-2 hover:bg-muted transition-colors text-left"
                data-testid={`btn-demo-${d.role.toLowerCase()}`}>
                <span className="font-medium">{d.role}</span>
                <span className="text-muted-foreground">{d.email}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

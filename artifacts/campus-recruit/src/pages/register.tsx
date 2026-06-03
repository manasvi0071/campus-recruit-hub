import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BrainCircuit, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const BRANCHES = ["CSE", "ECE", "MECH", "EEE", "CIVIL", "MBA"];

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", branch: "CSE", cgpa: "", graduationYear: "2025", phone: "",
  });

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" }); return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? "Registration failed", variant: "destructive" }); return;
      }

      if (form.role === "student") {
        await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, email: form.email, branch: form.branch,
            cgpa: parseFloat(form.cgpa) || 0,
            graduationYear: parseInt(form.graduationYear) || 2025,
            phone: form.phone, status: "active",
          }),
        });
      }

      login(data);
      toast({ title: "Account created!", description: `Welcome, ${data.name}` });
      setLocation("/");
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <BrainCircuit className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join the TalentHub Campus placement platform</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Student / Staff Registration</CardTitle>
              <CardDescription>Fill in your details to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Aarav Sharma" value={form.name}
                      onChange={e => set("name", e.target.value)} required data-testid="input-reg-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="9876543210" value={form.phone}
                      onChange={e => set("phone", e.target.value)} data-testid="input-reg-phone" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="you@college.edu" value={form.email}
                    onChange={e => set("email", e.target.value)} required data-testid="input-reg-email" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input id="reg-password" type={showPass ? "text" : "password"} placeholder="Min 6 chars"
                        value={form.password} onChange={e => set("password", e.target.value)}
                        required data-testid="input-reg-password" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Repeat password"
                      value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                      required data-testid="input-reg-confirm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => set("role", v)}>
                    <SelectTrigger data-testid="select-reg-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Placement Officer / Admin</SelectItem>
                      <SelectItem value="recruiter">Company Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.role === "student" && (
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Select value={form.branch} onValueChange={v => set("branch", v)}>
                        <SelectTrigger data-testid="select-reg-branch"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input id="cgpa" placeholder="e.g. 8.5" value={form.cgpa}
                        onChange={e => set("cgpa", e.target.value)} data-testid="input-reg-cgpa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grad-year">Grad Year</Label>
                      <Input id="grad-year" placeholder="2025" value={form.graduationYear}
                        onChange={e => set("graduationYear", e.target.value)} data-testid="input-reg-year" />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading} data-testid="btn-register">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setLocation("/login")}
                  className="text-primary font-medium hover:underline" data-testid="link-login">
                  Sign in
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <button onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </button>
      </div>
    </div>
  );
}

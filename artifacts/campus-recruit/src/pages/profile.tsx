import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Mail, Phone, GraduationCap, Star, FileText,
  Plus, X, Save, CheckCircle2, Pencil, BookOpen,
  Trophy, Briefcase, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const BRANCHES = ["CSE", "ECE", "MECH", "EEE", "CIVIL", "MBA", "IT", "AIDS", "AIML"];

const SKILL_SUGGESTIONS = [
  "Python", "Java", "C++", "JavaScript", "React", "Node.js",
  "SQL", "MongoDB", "Git", "Docker", "AWS", "Machine Learning",
  "Data Analysis", "Excel", "Communication", "Leadership",
  "Problem Solving", "Teamwork", "Agile", "REST APIs",
];

const PROFILE_COMPLETENESS_FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone Number" },
  { key: "branch", label: "Branch" },
  { key: "cgpa", label: "CGPA" },
  { key: "skills", label: "Skills (at least 3)" },
  { key: "resumeUrl", label: "Resume Link" },
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    branch: "CSE",
    cgpa: "",
    graduationYear: "2025",
    skills: [] as string[],
    resumeUrl: "",
  });

  // Load existing student data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/students", { credentials: "include" });
        if (!res.ok) return;
        const students = await res.json();
        const mine = students.find((s: any) => s.email === user?.email);
        if (mine) {
          setForm({
            name: mine.name ?? user?.name ?? "",
            email: mine.email ?? user?.email ?? "",
            phone: mine.phone ?? "",
            branch: mine.branch ?? "CSE",
            cgpa: mine.cgpa?.toString() ?? "",
            graduationYear: mine.graduationYear?.toString() ?? "2025",
            skills: mine.skills ? mine.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
            resumeUrl: mine.resumeUrl ?? "",
          });
        }
      } catch {}
    };
    loadProfile();
  }, [user]);

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  // Calculate profile completeness
  const completeness = Math.round(
    (PROFILE_COMPLETENESS_FIELDS.filter(f => {
      if (f.key === "skills") return form.skills.length >= 3;
      return !!(form as any)[f.key];
    }).length / PROFILE_COMPLETENESS_FIELDS.length) * 100
  );

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Try to find student by email first
      const listRes = await fetch("/api/students", { credentials: "include" });
      const students = await listRes.json();
      const mine = students.find((s: any) => s.email === user?.email);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        branch: form.branch,
        cgpa: parseFloat(form.cgpa) || 0,
        graduationYear: parseInt(form.graduationYear) || 2025,
        skills: form.skills.join(", "),
        resumeUrl: form.resumeUrl,
        status: "active",
      };

      let res;
      if (mine) {
        res = await fetch(`/api/students/${mine.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast({ title: "Profile saved! ✅", description: "Your profile has been updated." });
        setEditing(false);
      } else {
        toast({ title: "Save failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your skills, resume, and personal information.</p>
        </div>
        <Button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving} className="gap-2">
          {editing ? (
            saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>
          ) : (
            <><Pencil className="w-4 h-4" /> Edit Profile</>
          )}
        </Button>
      </div>

      {/* Profile completeness */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Profile Completeness</span>
          </div>
          <span className={`text-sm font-bold ${completeness >= 80 ? "text-green-500" : completeness >= 50 ? "text-yellow-500" : "text-red-500"}`}>
            {completeness}%
          </span>
        </div>
        <Progress value={completeness} className="h-2.5" />
        {completeness < 100 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PROFILE_COMPLETENESS_FIELDS
              .filter(f => f.key === "skills" ? form.skills.length < 3 : !(form as any)[f.key])
              .map(f => (
                <span key={f.key} className="text-xs bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                  Missing: {f.label}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Avatar + quick stats */}
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-6 flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {form.name?.[0]?.toUpperCase() ?? "S"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="font-bold text-xl">{form.name || "Your Name"}</h2>
              <p className="text-muted-foreground text-sm">{form.email}</p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">Student</Badge>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">Quick Info</h3>
            {[
              { icon: GraduationCap, label: "Branch", value: form.branch || "Not set" },
              { icon: Trophy, label: "CGPA", value: form.cgpa || "Not set" },
              { icon: Briefcase, label: "Grad Year", value: form.graduationYear || "Not set" },
              { icon: Star, label: "Skills", value: `${form.skills.length} added` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="lg:col-span-2 space-y-4">

          {/* Personal Info */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)}
                  disabled={!editing} placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} disabled placeholder="Your email" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)}
                  disabled={!editing} placeholder="+91 9876543210" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Branch</Label>
                {editing ? (
                  <Select value={form.branch} onValueChange={v => set("branch", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.branch} disabled />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>CGPA</Label>
                <Input value={form.cgpa} onChange={e => set("cgpa", e.target.value)}
                  disabled={!editing} placeholder="e.g. 7.5" type="number" step="0.1" min="0" max="10" />
              </div>
              <div className="space-y-1.5">
                <Label>Graduation Year</Label>
                {editing ? (
                  <Select value={form.graduationYear} onValueChange={v => set("graduationYear", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["2024", "2025", "2026", "2027"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.graduationYear} disabled />
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Skills
              <span className="text-xs text-muted-foreground font-normal ml-1">(Add skills that match your target jobs)</span>
            </h3>

            {/* Current skills */}
            {form.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="gap-1 pl-3 pr-2 py-1">
                    {skill}
                    {editing && (
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No skills added yet. Add your technical and soft skills.</p>
            )}

            {/* Add skill input */}
            {editing && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Type a skill and press Enter"
                    value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSkill(newSkill)} />
                  <Button size="sm" onClick={() => addSkill(newSkill)} variant="outline" className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
                {/* Suggestions */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Quick add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                      <button key={s} onClick={() => addSkill(s)}
                        className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground transition-colors px-2.5 py-1 rounded-full">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Resume
              <span className="text-xs text-muted-foreground font-normal ml-1">(Paste your resume link)</span>
            </h3>
            <div className="space-y-1.5">
              <Label>Resume URL</Label>
              <Input value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)}
                disabled={!editing}
                placeholder="https://drive.google.com/your-resume OR LinkedIn profile URL" />
              <p className="text-xs text-muted-foreground">
                Upload your resume to Google Drive, set sharing to "Anyone with link", then paste the link here.
              </p>
            </div>
            {form.resumeUrl && (
              <a href={form.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-3.5 h-3.5" /> View My Resume
                </Button>
              </a>
            )}
          </div>

          {/* Save button at bottom */}
          {editing && (
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1 sm:flex-none">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save All Changes</>}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
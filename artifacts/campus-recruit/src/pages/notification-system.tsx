import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Mail, Send, CheckCircle2, XCircle, Clock, AlertCircle,
  Eye, MailOpen, MailX, Bell, Plus, Search, Pencil,
  Users, Building2, Calendar, RefreshCw, Download,
  ChevronRight, Sparkles, Filter, History, Trash2,
  MailCheck, MailWarning, Timer,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
type CandidateStatus = "selected" | "rejected" | "waitlisted" | "shortlisted" | "reminder";
type EmailStatus = "sent" | "delivered" | "opened" | "failed" | "pending";

interface EmailTemplate {
  id: string;
  name: string;
  status: CandidateStatus;
  subject: string;
  body: string;
  isDefault: boolean;
}

interface EmailRecord {
  id: string;
  candidateName: string;
  candidateEmail: string;
  company: string;
  round: string;
  status: CandidateStatus;
  emailStatus: EmailStatus;
  sentAt: string;
  openedAt?: string;
  subject: string;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  branch: string;
  company: string;
  round: string;
  status: CandidateStatus;
  selected: boolean;
}

// ─── Default Templates ────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1", name: "Selection Congratulations", status: "selected", isDefault: true,
    subject: "🎉 Congratulations! You've been selected by {{company}}",
    body: `Dear {{studentName}},

We are delighted to inform you that you have been SELECTED by {{company}} for the role of {{role}}!

📋 Selection Details:
• Company: {{company}}
• Role: {{role}}
• Round Cleared: {{round}}
• Package: {{package}} LPA

Next Steps:
Your placement coordinator will contact you shortly regarding the offer letter and joining formalities.

Please report to the Placement Cell with the following documents:
• Original marksheets
• ID proof
• 2 passport size photographs

Congratulations once again! We are proud of your achievement.

Best Regards,
Placement Cell
Campus Recruitment Hub`,
  },
  {
    id: "t2", name: "Rejection - Encouragement", status: "rejected", isDefault: true,
    subject: "Update on your {{company}} application - {{round}}",
    body: `Dear {{studentName}},

Thank you for participating in the {{company}} recruitment drive.

After careful evaluation, we regret to inform you that you have not been selected to move forward in the {{round}} for {{company}}.

Please do not be disheartened. This is part of the learning process, and we encourage you to:

• Visit the Challenge Arena on our portal for personalized improvement tips
• Attend upcoming mock interview sessions
• Work on the feedback areas identified during this drive

There are more opportunities coming up. Stay positive and keep preparing!

Best Regards,
Placement Cell
Campus Recruitment Hub`,
  },
  {
    id: "t3", name: "Shortlisted for Next Round", status: "shortlisted", isDefault: true,
    subject: "✅ Shortlisted! Next Round Details - {{company}}",
    body: `Dear {{studentName}},

Congratulations! You have been shortlisted for the next round of the {{company}} placement drive.

📅 Next Round Details:
• Company: {{company}}
• Round: {{round}}
• Date & Time: {{dateTime}}
• Mode: {{mode}}
• Venue / Link: {{venue}}

What to bring/prepare:
• Updated resume
• Government ID proof
• Laptop (if online)

Please confirm your attendance by replying to this email or updating your status on the portal.

All the best!

Best Regards,
Placement Cell
Campus Recruitment Hub`,
  },
  {
    id: "t4", name: "Waitlist Notification", status: "waitlisted", isDefault: true,
    subject: "Waitlist Update - {{company}} Recruitment Drive",
    body: `Dear {{studentName}},

You have been placed on the WAITLIST for {{company}} for the {{role}} position.

This means you are under consideration and may be called if positions open up.

📌 Your Status: Waitlisted
📌 Company: {{company}}
📌 Round: {{round}}

We will notify you immediately if your status changes. Please keep checking the portal for updates.

Best Regards,
Placement Cell
Campus Recruitment Hub`,
  },
  {
    id: "t5", name: "Interview Reminder", status: "reminder", isDefault: true,
    subject: "⏰ Reminder: {{company}} Interview Tomorrow!",
    body: `Dear {{studentName}},

This is a friendly reminder that you have an interview scheduled for TOMORROW.

📅 Interview Details:
• Company: {{company}}
• Round: {{round}}
• Date & Time: {{dateTime}}
• Venue / Link: {{venue}}

Quick Checklist:
✅ Resume printed (3 copies)
✅ Dress code: Formal
✅ Reach 15 minutes early
✅ Carry all required documents
✅ Test your internet/camera (if online)

Best of luck! You've got this!

Best Regards,
Placement Cell
Campus Recruitment Hub`,
  },
];

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_CANDIDATES: Candidate[] = [
  { id: 1, name: "Arjun Sharma",  email: "arjun@college.edu",  branch: "CSE", company: "TCS",      round: "HR Round",       status: "selected",    selected: false },
  { id: 2, name: "Priya Patel",   email: "priya@college.edu",  branch: "ECE", company: "TCS",      round: "HR Round",       status: "shortlisted", selected: false },
  { id: 3, name: "Rahul Singh",   email: "rahul@college.edu",  branch: "CSE", company: "TCS",      round: "Technical R2",   status: "rejected",    selected: false },
  { id: 4, name: "Sneha Reddy",   email: "sneha@college.edu",  branch: "IT",  company: "Infosys",  round: "HR Round",       status: "selected",    selected: false },
  { id: 5, name: "Vikram Kumar",  email: "vikram@college.edu", branch: "CSE", company: "Infosys",  round: "Technical R1",   status: "rejected",    selected: false },
  { id: 6, name: "Ananya Iyer",   email: "ananya@college.edu", branch: "MBA", company: "Deloitte", round: "Case Study",     status: "waitlisted",  selected: false },
  { id: 7, name: "Rohan Mehta",   email: "rohan@college.edu",  branch: "CSE", company: "TCS",      round: "Aptitude Test",  status: "shortlisted", selected: false },
  { id: 8, name: "Kavya Nair",    email: "kavya@college.edu",  branch: "ECE", company: "Google",   round: "Technical R1",   status: "shortlisted", selected: false },
];

const DEMO_HISTORY: EmailRecord[] = [
  { id: "e1", candidateName: "Arjun Sharma",  candidateEmail: "arjun@college.edu",  company: "TCS",      round: "Technical R1", status: "selected",    emailStatus: "opened",    sentAt: "2025-12-10 10:30", openedAt: "2025-12-10 11:02", subject: "🎉 Congratulations! You've been selected by TCS" },
  { id: "e2", candidateName: "Rahul Singh",   candidateEmail: "rahul@college.edu",  company: "TCS",      round: "Aptitude",     status: "rejected",    emailStatus: "delivered", sentAt: "2025-12-10 10:31", subject: "Update on your TCS application - Aptitude" },
  { id: "e3", candidateName: "Sneha Reddy",   candidateEmail: "sneha@college.edu",  company: "Infosys",  round: "GD Round",     status: "shortlisted", emailStatus: "opened",    sentAt: "2025-12-08 14:00", openedAt: "2025-12-08 15:30", subject: "✅ Shortlisted! Next Round Details - Infosys" },
  { id: "e4", candidateName: "Vikram Kumar",  candidateEmail: "vikram@college.edu", company: "Infosys",  round: "Technical R1", status: "rejected",    emailStatus: "failed",    sentAt: "2025-12-08 14:01", subject: "Update on your Infosys application - Technical R1" },
  { id: "e5", candidateName: "Ananya Iyer",   candidateEmail: "ananya@college.edu", company: "Deloitte", round: "Case Study",   status: "waitlisted",  emailStatus: "sent",      sentAt: "2025-12-09 09:00", subject: "Waitlist Update - Deloitte Recruitment Drive" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<CandidateStatus, string> = {
  selected:    "bg-green-100 text-green-700 border-green-200",
  rejected:    "bg-red-100 text-red-700 border-red-200",
  shortlisted: "bg-blue-100 text-blue-700 border-blue-200",
  waitlisted:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  reminder:    "bg-purple-100 text-purple-700 border-purple-200",
};

const EMAIL_STATUS_CONFIG: Record<EmailStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-gray-500" },
  sent:      { label: "Sent",      icon: Send,         color: "text-blue-500" },
  delivered: { label: "Delivered", icon: MailCheck,    color: "text-purple-500" },
  opened:    { label: "Opened",    icon: MailOpen,     color: "text-green-600" },
  failed:    { label: "Failed",    icon: MailX,        color: "text-red-500" },
};

function fillTemplate(body: string, candidate: Candidate, extras: Record<string, string> = {}) {
  return body
    .replace(/{{studentName}}/g, candidate.name)
    .replace(/{{company}}/g, candidate.company)
    .replace(/{{round}}/g, candidate.round)
    .replace(/{{role}}/g, extras.role ?? "the position")
    .replace(/{{package}}/g, extras.package ?? "N/A")
    .replace(/{{dateTime}}/g, extras.dateTime ?? "To be announced")
    .replace(/{{mode}}/g, extras.mode ?? "Online")
    .replace(/{{venue}}/g, extras.venue ?? "Check your email");
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === "admin" || user?.role === "recruiter";

  const [tab, setTab] = useState<"compose" | "templates" | "history" | "tracking">("compose");
  const [candidates, setCandidates] = useState<Candidate[]>(DEMO_CANDIDATES);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [history, setHistory] = useState<EmailRecord[]>(DEMO_HISTORY);

  // Compose state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Template editor
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);

  const selectedCandidates = candidates.filter(c => c.selected);
  const filteredCandidates = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchCompany = companyFilter === "all" || c.company === companyFilter;
    return matchSearch && matchStatus && matchCompany;
  });

  const companies = [...new Set(candidates.map(c => c.company))];

  const toggleSelect = (id: number) =>
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));

  const selectAll = () =>
    setCandidates(prev => prev.map(c => filteredCandidates.some(f => f.id === c.id) ? { ...c, selected: true } : c));

  const clearAll = () =>
    setCandidates(prev => prev.map(c => ({ ...c, selected: false })));

  const autoSelect = (status: CandidateStatus) =>
    setCandidates(prev => prev.map(c => ({ ...c, selected: c.status === status })));

  // Simulate sending emails
  const handleSendEmails = async () => {
    if (selectedCandidates.length === 0) {
      toast({ title: "No candidates selected", variant: "destructive" }); return;
    }
    setSending(true);
    setSendProgress(0);

    for (let i = 0; i < selectedCandidates.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setSendProgress(Math.round(((i + 1) / selectedCandidates.length) * 100));
    }

    // Add to history
    const newRecords: EmailRecord[] = selectedCandidates.map(c => {
      const tmpl = templates.find(t => t.status === c.status) ?? templates[0];
      return {
        id: `e${Date.now()}-${c.id}`,
        candidateName: c.name,
        candidateEmail: c.email,
        company: c.company,
        round: c.round,
        status: c.status,
        emailStatus: Math.random() > 0.1 ? "delivered" : "failed",
        sentAt: new Date().toLocaleString("en-IN"),
        subject: tmpl.subject.replace(/{{company}}/g, c.company).replace(/{{round}}/g, c.round),
      };
    });

    setHistory(prev => [...newRecords, ...prev]);
    clearAll();
    setSending(false);
    setSendProgress(0);
    toast({
      title: `✅ ${selectedCandidates.length} emails sent!`,
      description: `All notifications dispatched successfully.`,
    });
  };

  // Delivery stats
  const stats = {
    total: history.length,
    sent: history.filter(h => h.emailStatus !== "failed").length,
    opened: history.filter(h => h.emailStatus === "opened").length,
    failed: history.filter(h => h.emailStatus === "failed").length,
    openRate: history.length ? Math.round((history.filter(h => h.emailStatus === "opened").length / history.length) * 100) : 0,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Notification System <Mail className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Send automated, personalized emails to candidates based on their recruitment status.
          </p>
        </div>
        {selectedCandidates.length > 0 && (
          <Button onClick={handleSendEmails} disabled={sending} className="gap-2 bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4" />
            Send to {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: stats.sent, icon: Send, color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600" },
          { label: "Delivered", value: stats.sent, icon: MailCheck, color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600" },
          { label: "Opened", value: stats.opened, icon: MailOpen, color: "bg-green-100 dark:bg-green-900/20 text-green-600" },
          { label: "Failed", value: stats.failed, icon: MailX, color: "bg-red-100 dark:bg-red-900/20 text-red-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 flex items-center gap-3 ${s.color}`}>
            <s.icon className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs opacity-70">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Send progress bar */}
      <AnimatePresence>
        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Sending emails...
              </span>
              <span className="text-muted-foreground">{sendProgress}%</span>
            </div>
            <Progress value={sendProgress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["compose", "templates", "history", "tracking"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t === "compose" ? "✉️ Compose & Send" : t === "templates" ? "📝 Templates" : t === "history" ? "📋 History" : "📊 Tracking"}
          </button>
        ))}
      </div>

      {/* ── COMPOSE TAB ── */}
      {tab === "compose" && (
        <div className="space-y-4">
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground font-medium">Quick select:</span>
            {(["selected", "rejected", "shortlisted", "waitlisted"] as CandidateStatus[]).map(s => (
              <Button key={s} size="sm" variant="outline" onClick={() => autoSelect(s)}
                className={`gap-1.5 text-xs capitalize ${STATUS_COLORS[s]}`}>
                All {s} ({candidates.filter(c => c.status === s).length})
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={clearAll} className="text-xs text-muted-foreground ml-auto gap-1">
              <XCircle className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-9" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={selectAll} className="gap-1.5">
              <Users className="w-3.5 h-3.5" /> Select All ({filteredCandidates.length})
            </Button>
          </div>

          {/* Candidate list */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">{filteredCandidates.length} candidates</span>
              {selectedCandidates.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {selectedCandidates.length} selected
                </Badge>
              )}
            </div>
            <div className="divide-y">
              {filteredCandidates.map(c => {
                const tmpl = templates.find(t => t.status === c.status);
                return (
                  <motion.div key={c.id} layout
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors ${c.selected ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                    {/* Checkbox */}
                    <input type="checkbox" checked={c.selected} onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 rounded accent-primary cursor-pointer" />

                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{c.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.email} · {c.branch}</div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5" /> {c.company}
                      <ChevronRight className="w-3 h-3" /> {c.round}
                    </div>

                    <Badge className={`text-xs capitalize shrink-0 ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </Badge>

                    {/* Preview email */}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0"
                      onClick={() => setPreviewCandidate(c)} title="Preview email">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                );
              })}
              {filteredCandidates.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">No candidates found</div>
              )}
            </div>
          </div>

          {/* Send button */}
          {selectedCandidates.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
              <div>
                <div className="font-semibold text-sm">{selectedCandidates.length} emails ready to send</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selectedCandidates.filter(c => c.status === "selected").length} selected ·{" "}
                  {selectedCandidates.filter(c => c.status === "rejected").length} rejected ·{" "}
                  {selectedCandidates.filter(c => c.status === "shortlisted").length} shortlisted ·{" "}
                  {selectedCandidates.filter(c => c.status === "waitlisted").length} waitlisted
                </div>
              </div>
              <Button onClick={handleSendEmails} disabled={sending} className="gap-2 bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : `Send ${selectedCandidates.length} Emails`}
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-card border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs capitalize ${STATUS_COLORS[t.status]}`}>{t.status}</Badge>
                  {t.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                </div>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                  onClick={() => setEditTemplate({ ...t })}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
              </div>
              <h3 className="font-semibold text-sm">{t.name}</h3>
              <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 font-mono truncate">
                Subject: {t.subject}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{t.body}</p>
              <div className="flex flex-wrap gap-1">
                {["{{studentName}}", "{{company}}", "{{round}}", "{{dateTime}}"].map(v => (
                  <span key={v} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded font-mono">{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <History className="w-4 h-4" /> Email History ({history.length} emails)
            </span>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead>Candidate</TableHead>
                <TableHead>Company · Round</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(h => {
                const es = EMAIL_STATUS_CONFIG[h.emailStatus];
                return (
                  <TableRow key={h.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{h.candidateName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{h.candidateName}</div>
                          <div className="text-xs text-muted-foreground">{h.candidateEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium">{h.company}</div>
                      <div className="text-xs text-muted-foreground">{h.round}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs capitalize ${STATUS_COLORS[h.status]}`}>{h.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1.5 text-sm ${es.color}`}>
                        <es.icon className="w-3.5 h-3.5" /> {es.label}
                      </span>
                      {h.openedAt && <div className="text-xs text-muted-foreground mt-0.5">Opened: {h.openedAt}</div>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.sentAt}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── TRACKING TAB ── */}
      {tab === "tracking" && (
        <div className="space-y-4">
          {/* Open rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">Email Open Rate</h3>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold text-primary">{stats.openRate}%</div>
                <div className="text-sm text-muted-foreground pb-1">of delivered emails</div>
              </div>
              <Progress value={stats.openRate} className="h-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <div className="font-bold text-blue-600">{stats.sent}</div>
                  <div className="text-xs text-muted-foreground">Sent</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <div className="font-bold text-green-600">{stats.opened}</div>
                  <div className="text-xs text-muted-foreground">Opened</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                  <div className="font-bold text-red-500">{stats.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">By Status Type</h3>
              {(["selected", "rejected", "shortlisted", "waitlisted"] as CandidateStatus[]).map(s => {
                const count = history.filter(h => h.status === s).length;
                const pct = history.length ? Math.round((count / history.length) * 100) : 0;
                return (
                  <div key={s} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize font-medium">{s}</span>
                      <span className="text-muted-foreground">{count} emails ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {history.slice(0, 6).map(h => {
                const es = EMAIL_STATUS_CONFIG[h.emailStatus];
                return (
                  <div key={h.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      h.emailStatus === "opened" ? "bg-green-100 dark:bg-green-900/20" :
                      h.emailStatus === "failed" ? "bg-red-100 dark:bg-red-900/20" :
                      "bg-blue-100 dark:bg-blue-900/20"
                    }`}>
                      <es.icon className={`w-4 h-4 ${es.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{h.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        To: {h.candidateName} · {h.sentAt}
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${STATUS_COLORS[h.status]}`}>{h.status}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Email Preview Dialog ── */}
      {previewCandidate && (
        <Dialog open={!!previewCandidate} onOpenChange={() => setPreviewCandidate(null)}>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Preview
              </DialogTitle>
              <DialogDescription>
                This is what {previewCandidate.name} will receive
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {(() => {
                const tmpl = templates.find(t => t.status === previewCandidate.status) ?? templates[0];
                const subject = tmpl.subject.replace(/{{company}}/g, previewCandidate.company).replace(/{{round}}/g, previewCandidate.round);
                const body = fillTemplate(tmpl.body, previewCandidate);
                return (
                  <>
                    <div className="bg-muted/40 rounded-lg p-3 space-y-1.5 text-sm">
                      <div className="flex gap-2"><span className="text-muted-foreground w-12">To:</span><span>{previewCandidate.email}</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-12">From:</span><span>placement@campus.edu</span></div>
                      <div className="flex gap-2"><span className="text-muted-foreground w-12">Subject:</span><span className="font-medium">{subject}</span></div>
                    </div>
                    <div className="bg-white dark:bg-card border rounded-lg p-4 text-sm whitespace-pre-line leading-relaxed font-mono text-xs">
                      {body}
                    </div>
                  </>
                );
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewCandidate(null)}>Close</Button>
              <Button className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setCandidates(prev => prev.map(c => c.id === previewCandidate.id ? { ...c, selected: true } : c));
                  setPreviewCandidate(null);
                  toast({ title: `${previewCandidate.name} added to send list` });
                }}>
                <CheckCircle2 className="w-4 h-4" /> Add to Send List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Template Editor Dialog ── */}
      {editTemplate && (
        <Dialog open={!!editTemplate} onOpenChange={() => setEditTemplate(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template: {editTemplate.name}</DialogTitle>
              <DialogDescription>Customize the email template. Use variables like {`{{studentName}}`}, {`{{company}}`}, {`{{round}}`}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Subject Line</Label>
                <Input value={editTemplate.subject}
                  onChange={e => setEditTemplate(p => p ? { ...p, subject: e.target.value } : null)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email Body</Label>
                <Textarea value={editTemplate.body} rows={14}
                  onChange={e => setEditTemplate(p => p ? { ...p, body: e.target.value } : null)} className="font-mono text-xs" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Available variables:</span>
                {["{{studentName}}", "{{company}}", "{{round}}", "{{role}}", "{{package}}", "{{dateTime}}", "{{venue}}"].map(v => (
                  <button key={v} onClick={() => setEditTemplate(p => p ? { ...p, body: p.body + v } : null)}
                    className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded font-mono hover:bg-blue-100">
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancel</Button>
              <Button onClick={() => {
                setTemplates(prev => prev.map(t => t.id === editTemplate.id ? editTemplate : t));
                setEditTemplate(null);
                toast({ title: "Template saved!" });
              }}>Save Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
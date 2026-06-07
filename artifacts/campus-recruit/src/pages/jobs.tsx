import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useListJobs, useCreateJob, useDeleteJob, useListCompanies,
  getListJobsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  Search, Plus, CalendarIcon, Trash2, CheckCircle2,
  Briefcase, Building2, GraduationCap, IndianRupee, Clock, ChevronRight,
} from "lucide-react";

function statusVariant(status: string) {
  if (status === "open") return "default" as const;
  if (status === "screening") return "secondary" as const;
  return "outline" as const;
}

// Departments for filter — based on the job PDF data
const DEPARTMENTS = [
  "All",
  "HR",
  "Finance",
  "Legal",
  "Marketing",
  "Digital Marketing",
  "Admin & Operations",
  "AI & Technology",
];

// Auto-detect department from job title
function getDepartment(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("hr") || t.includes("human resource") || t.includes("talent") || t.includes("recruitment") || t.includes("learning") || t.includes("performance") || t.includes("payroll") || t.includes("employee relation") || t.includes("compensation")) return "HR";
  if (t.includes("finance") || t.includes("accounting") || t.includes("audit") || t.includes("tax") || t.includes("treasury") || t.includes("budget") || t.includes("fp&a") || t.includes("accounts") || t.includes("cfo")) return "Finance";
  if (t.includes("legal") || t.includes("compliance") || t.includes("litigation") || t.includes("contract") || t.includes("ipr") || t.includes("trademark") || t.includes("patent")) return "Legal";
  if (t.includes("digital") || t.includes("seo") || t.includes("sem") || t.includes("ppc") || t.includes("social media") || t.includes("email marketing") || t.includes("content") || t.includes("analytics")) return "Digital Marketing";
  if (t.includes("marketing") || t.includes("brand") || t.includes("pr") || t.includes("event") || t.includes("campaign")) return "Marketing";
  if (t.includes("admin") || t.includes("facility") || t.includes("transport") || t.includes("security") || t.includes("purchase") || t.includes("vendor") || t.includes("store") || t.includes("housekeeping")) return "Admin & Operations";
  if (t.includes("ai") || t.includes("machine learning") || t.includes("data science") || t.includes("ml ") || t.includes(" ml") || t.includes("data scientist")) return "AI & Technology";
  return "Other";
}

// Get skills from description text
function extractSkills(description: string): string[] {
  if (!description) return [];
  const skillKeywords = [
    "Leadership", "Communication", "Excel", "Problem Solving", "Teamwork",
    "Recruitment", "HR Operations", "Compliance", "Legal Drafting", "SEO",
    "Content Writing", "Data Analysis", "Python", "Machine Learning", "AI",
    "Financial Analysis", "Taxation", "Accounting", "Payroll", "Auditing",
    "Social Media", "Digital Marketing", "Brand Management", "Market Research",
    "Event Management", "Vendor Management", "MS Office", "CRM",
  ];
  return skillKeywords.filter(skill =>
    description.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 4);
}

type Job = {
  id: number;
  title: string;
  companyName?: string | null;
  companyId: number;
  description?: string | null;
  eligibleBranches?: string | null;
  minCgpa?: number | null;
  packageLpa?: number | null;
  deadline?: string | null;
  status: string;
};

function JobCard({
  job, canManage, onDelete, onApply, onView, applied, applying,
}: {
  job: Job;
  canManage: boolean;
  onDelete: (id: number) => void;
  onApply: (job: Job) => void;
  onView: (job: Job) => void;
  applied: boolean;
  applying: boolean;
}) {
  const dept = getDepartment(job.title);
  const skills = extractSkills(job.description ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {(job.companyName ?? job.title)[0]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground leading-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.companyName ?? "Unknown Company"}</p>
          </div>
        </div>
        <Badge variant={statusVariant(job.status)} className="shrink-0">
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </Badge>
      </div>

      {/* Department badge */}
      <div>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          {dept}
        </Badge>
      </div>

      {/* Job details */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {job.eligibleBranches && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{job.eligibleBranches}</span>
          </div>
        )}
        {job.packageLpa && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <IndianRupee className="w-3.5 h-3.5 shrink-0" />
            <span>{job.packageLpa} LPA</span>
          </div>
        )}
        {job.minCgpa && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>Min CGPA: {job.minCgpa}</span>
          </div>
        )}
        {job.deadline && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map(skill => (
            <span key={skill} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Description preview */}
      {job.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t">
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => onView(job)}>
          View Details <ChevronRight className="w-3 h-3" />
        </Button>
        {canManage ? (
          <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive"
            onClick={() => onDelete(job.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            size="sm" className="ml-auto gap-1"
            variant={applied ? "outline" : "default"}
            disabled={job.status !== "open" || applied || applying}
            onClick={() => onApply(job)}
          >
            {applied ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Applied</>
            ) : applying ? "Applying…" : job.status !== "open" ? "Closed" : "Apply Now"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const role = user?.role ?? "student";
  const canManage = role === "admin" || role === "recruiter";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isOpen, setIsOpen] = useState(false);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "", companyId: "", description: "", eligibleBranches: "",
    minCgpa: "", packageLpa: "", deadline: "", status: "open",
  });

  const { data: jobs = [], isLoading } = useListJobs();
  const { data: companies = [] } = useListCompanies();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });

  const filtered = jobs.filter(j => {
    const matchSearch =
      (j.companyName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.description ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === "All" || getDepartment(j.title) === selectedDept;
    return matchSearch && matchDept;
  });

  const handleSubmit = () => {
    if (!form.title) { toast({ title: "Please enter a job title", variant: "destructive" }); return; }
    if (!form.companyId) { toast({ title: "Please select a company", variant: "destructive" }); return; }
    createJob.mutate({
      data: {
        title: form.title, companyId: parseInt(form.companyId),
        description: form.description, eligibleBranches: form.eligibleBranches,
        minCgpa: form.minCgpa ? parseFloat(form.minCgpa) : undefined,
        packageLpa: form.packageLpa ? parseFloat(form.packageLpa) : undefined,
        deadline: form.deadline, status: form.status,
      },
    }, {
      onSuccess: () => {
        invalidate(); setIsOpen(false);
        toast({ title: "Job posted successfully!" });
        setForm({ title: "", companyId: "", description: "", eligibleBranches: "", minCgpa: "", packageLpa: "", deadline: "", status: "open" });
      },
      onError: () => toast({ title: "Failed to post job", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    deleteJob.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Job removed" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const handleApply = async (job: Job) => {
    if (appliedJobs.has(job.id)) return;
    setApplyingId(job.id);
    await new Promise(r => setTimeout(r, 800));
    setAppliedJobs(prev => new Set([...prev, job.id]));
    setApplyingId(null);
    toast({ title: "Application submitted!", description: `You applied for ${job.title} at ${job.companyName}.` });
  };

  const deptCounts = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = dept === "All" ? jobs.length : jobs.filter(j => getDepartment(j.title) === dept).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {canManage ? "Job Postings & Drives" : "Browse Job Openings"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {canManage
              ? "Manage active recruitment drives and job openings."
              : "Explore active placement drives and apply to eligible roles."}
          </p>
        </div>

        {canManage && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Post New Job</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post New Job Drive</DialogTitle>
                <DialogDescription>Add a new job opening from the recruitment drive.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Company */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Company</Label>
                  <div className="col-span-3">
                    <Select value={form.companyId} onValueChange={v => setForm(p => ({ ...p, companyId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                      <SelectContent>
                        {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Title */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Job Title</Label>
                  <Input className="col-span-3" placeholder="e.g. Campus Recruitment Executive"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                {/* Description */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Description</Label>
                  <Textarea className="col-span-3" rows={4}
                    placeholder="Job responsibilities, qualifications, core skills..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                {/* Eligible Branches */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Eligibility</Label>
                  <Input className="col-span-3" placeholder="e.g. MBA/HR, Business Administration"
                    value={form.eligibleBranches} onChange={e => setForm(p => ({ ...p, eligibleBranches: e.target.value }))} />
                </div>
                {/* Min CGPA & Package */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Min CGPA</Label>
                  <Input className="col-span-3" placeholder="e.g. 6.0"
                    value={form.minCgpa} onChange={e => setForm(p => ({ ...p, minCgpa: e.target.value }))} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Package (LPA)</Label>
                  <Input className="col-span-3" placeholder="e.g. 4.5"
                    value={form.packageLpa} onChange={e => setForm(p => ({ ...p, packageLpa: e.target.value }))} />
                </div>
                {/* Deadline */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Deadline</Label>
                  <Input type="date" className="col-span-3"
                    value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <div className="col-span-3">
                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createJob.isPending}>
                  {createJob.isPending ? "Posting..." : "Post Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, icon: Briefcase },
          { label: "Open Positions", value: jobs.filter(j => j.status === "open").length, icon: CheckCircle2 },
          { label: "Companies", value: new Set(jobs.map(j => j.companyId)).size, icon: Building2 },
        ].map(stat => (
          <div key={stat.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by company, role, or skill..."
          className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Department filters */}
      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map(dept => (
          <Button key={dept} size="sm"
            variant={selectedDept === dept ? "default" : "outline"}
            onClick={() => setSelectedDept(dept)}
            className="gap-1.5"
          >
            {dept}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedDept === dept ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
              {deptCounts[dept] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> job{filtered.length !== 1 ? "s" : ""}
        {selectedDept !== "All" && ` in ${selectedDept}`}
        {searchTerm && ` matching "${searchTerm}"`}
      </p>

      {/* Job Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border rounded-xl p-5 h-56 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">No jobs found</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm || selectedDept !== "All"
              ? "Try changing your search or filter"
              : canManage ? "Post your first job using the button above" : "Check back later for new openings"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} canManage={canManage}
              onDelete={handleDelete} onApply={handleApply}
              onView={setViewJob}
              applied={appliedJobs.has(job.id)}
              applying={applyingId === job.id}
            />
          ))}
        </div>
      )}

      {/* Job Detail Dialog */}
      {viewJob && (
        <Dialog open={!!viewJob} onOpenChange={() => setViewJob(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {(viewJob.companyName ?? viewJob.title)[0]}
                </div>
                <div>
                  <DialogTitle className="text-left">{viewJob.title}</DialogTitle>
                  <DialogDescription className="text-left">{viewJob.companyName}</DialogDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusVariant(viewJob.status)}>
                  {viewJob.status.charAt(0).toUpperCase() + viewJob.status.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {getDepartment(viewJob.title)}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Key details */}
              <div className="grid grid-cols-2 gap-3">
                {viewJob.packageLpa && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Package</div>
                    <div className="font-semibold">₹{viewJob.packageLpa} LPA</div>
                  </div>
                )}
                {viewJob.minCgpa && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Min CGPA</div>
                    <div className="font-semibold">{viewJob.minCgpa}</div>
                  </div>
                )}
                {viewJob.eligibleBranches && (
                  <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Eligibility</div>
                    <div className="font-semibold">{viewJob.eligibleBranches}</div>
                  </div>
                )}
                {viewJob.deadline && (
                  <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Application Deadline</div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      {new Date(viewJob.deadline).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {viewJob.description && (
                <div>
                  <h4 className="font-semibold mb-2">Job Description</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-muted/30 rounded-lg p-4">
                    {viewJob.description}
                  </div>
                </div>
              )}

              {/* Skills detected */}
              {extractSkills(viewJob.description ?? "").length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractSkills(viewJob.description ?? "").map(skill => (
                      <span key={skill} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewJob(null)}>Close</Button>
              {!canManage && (
                <Button
                  disabled={viewJob.status !== "open" || appliedJobs.has(viewJob.id) || applyingId === viewJob.id}
                  onClick={() => { handleApply(viewJob); setViewJob(null); }}
                >
                  {appliedJobs.has(viewJob.id) ? "Already Applied" : "Apply Now"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
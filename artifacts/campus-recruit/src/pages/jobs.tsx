import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
import { Search, Plus, CalendarIcon, Trash2, CheckCircle2 } from "lucide-react";

function statusVariant(status: string) {
  if (status === "open") return "default" as const;
  if (status === "screening") return "secondary" as const;
  return "outline" as const;
}

export default function Jobs() {
  const { user } = useAuth();
  const role = user?.role ?? "student";
  const isAdmin = role === "admin";
  const isRecruiter = role === "recruiter";
  const canManage = isAdmin || isRecruiter;

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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

  const filtered = jobs.filter(j =>
    (j.companyName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });

  const handleSubmit = () => {
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
        toast({ title: "Job posted successfully" });
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

  const handleApply = async (job: typeof jobs[number]) => {
    if (appliedJobs.has(job.id)) return;
    setApplyingId(job.id);
    await new Promise(r => setTimeout(r, 800));
    setAppliedJobs(prev => new Set([...prev, job.id]));
    setApplyingId(null);
    toast({ title: "Application submitted!", description: `You applied for ${job.title} at ${job.companyName}.` });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
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
              <Button data-testid="btn-post-job">
                <Plus className="w-4 h-4 mr-2" /> Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Post New Job Drive</DialogTitle>
                <DialogDescription>Create a new job posting for students to apply.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Company</Label>
                  <div className="col-span-3">
                    <Select value={form.companyId} onValueChange={v => setForm(p => ({ ...p, companyId: v }))}>
                      <SelectTrigger data-testid="select-company-job">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {[
                  { id: "title", label: "Role Title", placeholder: "e.g. Software Engineer" },
                  { id: "eligibleBranches", label: "Eligible Branches", placeholder: "e.g. CSE,ECE" },
                  { id: "minCgpa", label: "Min CGPA", placeholder: "e.g. 7.0" },
                  { id: "packageLpa", label: "Package (LPA)", placeholder: "e.g. 12.5" },
                ].map(f => (
                  <div key={f.id} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={f.id} className="text-right">{f.label}</Label>
                    <Input
                      id={f.id} placeholder={f.placeholder} className="col-span-3"
                      value={(form as Record<string, string>)[f.id]}
                      onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                      data-testid={`input-job-${f.id}`}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">Deadline</Label>
                  <Input id="deadline" type="date" className="col-span-3"
                    value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                    data-testid="input-job-deadline" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <div className="col-span-3">
                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger data-testid="select-job-status"><SelectValue /></SelectTrigger>
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
                <Button onClick={handleSubmit} disabled={createJob.isPending} data-testid="btn-submit-job">
                  Post Job Drive
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or role..."
            className="pl-9" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="input-search-jobs"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company & Role</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{canManage ? "Actions" : "Apply"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading jobs…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? `No jobs found matching "${searchTerm}"` : "No job postings yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(job => (
                <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {(job.companyName ?? job.title)[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">{job.title}</div>
                        <div className="text-sm text-muted-foreground">{job.companyName ?? "Unknown Company"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {job.eligibleBranches && <div>{job.eligibleBranches}</div>}
                      {job.minCgpa && <div className="text-muted-foreground">Min CGPA: {job.minCgpa}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.packageLpa ? <span className="font-medium">₹{job.packageLpa}L</span> : "—"}
                  </TableCell>
                  <TableCell>
                    {job.deadline ? (
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        {new Date(job.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage ? (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}
                        data-testid={`btn-delete-job-${job.id}`}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={appliedJobs.has(job.id) ? "outline" : "default"}
                        disabled={job.status !== "open" || appliedJobs.has(job.id) || applyingId === job.id}
                        onClick={() => handleApply(job)}
                        className="gap-1.5"
                        data-testid={`btn-apply-${job.id}`}
                      >
                        {appliedJobs.has(job.id) ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Applied</>
                        ) : applyingId === job.id ? (
                          "Applying…"
                        ) : job.status !== "open" ? (
                          "Closed"
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

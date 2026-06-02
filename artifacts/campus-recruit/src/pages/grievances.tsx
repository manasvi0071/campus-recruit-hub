import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListGrievances, useCreateGrievance, useUpdateGrievance,
  getListGrievancesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Plus, MessageSquareWarning, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const CATEGORIES = ["general", "placement", "document", "technical", "harassment", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

function statusBadge(status: string) {
  if (status === "resolved") return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
  if (status === "in_progress") return <Badge variant="secondary">In Progress</Badge>;
  if (status === "open") return <Badge variant="outline">Open</Badge>;
  return <Badge variant="destructive">Closed</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "urgent") return <Badge className="bg-red-500 hover:bg-red-600 text-xs">Urgent</Badge>;
  if (priority === "high") return <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">High</Badge>;
  if (priority === "medium") return <Badge variant="secondary" className="text-xs">Medium</Badge>;
  return <Badge variant="outline" className="text-xs">Low</Badge>;
}

export default function Grievances() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolveStatus, setResolveStatus] = useState("in_progress");

  const [form, setForm] = useState({
    subject: "", description: "", category: "general", priority: "medium",
  });

  const { data: grievances = [], isLoading } = useListGrievances();
  const createGrievance = useCreateGrievance();
  const updateGrievance = useUpdateGrievance();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListGrievancesQueryKey() });

  const myGrievances = grievances.filter(g => g.userId === user?.id);
  const displayList = isAdmin ? grievances : myGrievances;

  const stats = {
    open: grievances.filter(g => g.status === "open").length,
    inProgress: grievances.filter(g => g.status === "in_progress").length,
    resolved: grievances.filter(g => g.status === "resolved").length,
  };

  const handleSubmit = () => {
    if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
    createGrievance.mutate({
      data: {
        userId: user.id, submittedBy: user.name, email: user.email,
        subject: form.subject, description: form.description,
        category: form.category, priority: form.priority,
      },
    }, {
      onSuccess: () => {
        invalidate(); setIsOpen(false);
        toast({ title: "Grievance submitted", description: "We will review it shortly." });
        setForm({ subject: "", description: "", category: "general", priority: "medium" });
      },
      onError: () => toast({ title: "Submission failed", variant: "destructive" }),
    });
  };

  const handleUpdateStatus = (id: number) => {
    updateGrievance.mutate({ id, data: { status: resolveStatus, adminNote } }, {
      onSuccess: () => {
        invalidate(); setSelectedId(null);
        toast({ title: "Grievance updated" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievance Portal</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Review and resolve student complaints." : "Submit and track your complaints."}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-new-grievance">
              <Plus className="w-4 h-4 mr-2" /> Submit Grievance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>Submit a Grievance</DialogTitle>
              <DialogDescription>Describe your issue clearly. We aim to respond within 48 hours.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue"
                  value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  data-testid="input-grievance-subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea id="description" placeholder="Explain the issue in detail..."
                  rows={4} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  data-testid="textarea-grievance-description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger data-testid="select-grievance-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                    <SelectTrigger data-testid="select-grievance-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createGrievance.isPending || !form.subject || !form.description}
                data-testid="btn-submit-grievance">
                Submit Grievance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.open}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5" />
            {isAdmin ? "All Grievances" : "My Grievances"}
          </CardTitle>
          <CardDescription>
            {isAdmin ? `${grievances.length} total complaints` : `${myGrievances.length} submitted by you`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : displayList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {isAdmin ? "No grievances submitted yet." : "You have not submitted any grievances yet."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  {isAdmin && <TableHead>Submitted By</TableHead>}
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdmin && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayList.map(g => (
                  <TableRow key={g.id} data-testid={`row-grievance-${g.id}`}>
                    <TableCell className="text-muted-foreground">#{g.id}</TableCell>
                    {isAdmin && <TableCell>
                      <div className="font-medium">{g.submittedBy}</div>
                      <div className="text-xs text-muted-foreground">{g.email}</div>
                    </TableCell>}
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">{g.subject}</div>
                      {g.adminNote && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">Note: {g.adminNote}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{g.category}</span>
                    </TableCell>
                    <TableCell>{priorityBadge(g.priority)}</TableCell>
                    <TableCell>{statusBadge(g.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(g.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Dialog open={selectedId === g.id} onOpenChange={open => { setSelectedId(open ? g.id : null); setAdminNote(g.adminNote ?? ""); setResolveStatus(g.status); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`btn-resolve-${g.id}`}>Manage</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Grievance #{g.id}</DialogTitle>
                              <DialogDescription>{g.subject}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-muted/50 rounded-lg p-3 text-sm">{g.description}</div>
                              <div className="space-y-2">
                                <Label>Update Status</Label>
                                <Select value={resolveStatus} onValueChange={setResolveStatus}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Admin Note (visible to student)</Label>
                                <Textarea placeholder="Add a response or note..."
                                  value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
                              <Button onClick={() => handleUpdateStatus(g.id)} disabled={updateGrievance.isPending}>
                                Update
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useListStudents, useCreateStudent, useDeleteStudent, useUpdateStudent,
  getListStudentsQueryKey,
} from "@workspace/api-client-react";
import type { Student } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2, Pencil } from "lucide-react";

const BRANCHES = ["CSE", "ECE", "MECH", "EEE", "CIVIL", "MBA"];

function getStatusVariant(status: string) {
  if (status === "placed") return "default";
  if (status === "active") return "outline";
  return "destructive";
}

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", branch: "CSE", cgpa: "", graduationYear: "2025",
    skills: "", status: "active", phone: "",
  });

  const { data: students = [], isLoading } = useListStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === "all" || s.branch === branchFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });

  const openAdd = () => {
    setEditStudent(null);
    setForm({ name: "", email: "", branch: "CSE", cgpa: "", graduationYear: "2025", skills: "", status: "active", phone: "" });
    setIsOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({
      name: s.name, email: s.email, branch: s.branch,
      cgpa: String(s.cgpa), graduationYear: String(s.graduationYear),
      skills: s.skills ?? "", status: s.status, phone: s.phone ?? "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name, email: form.email, branch: form.branch,
      cgpa: parseFloat(form.cgpa), graduationYear: parseInt(form.graduationYear),
      skills: form.skills, status: form.status, phone: form.phone,
    };

    if (editStudent) {
      updateStudent.mutate({ id: editStudent.id, data: payload }, {
        onSuccess: () => { invalidate(); setIsOpen(false); toast({ title: "Student updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      });
    } else {
      createStudent.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setIsOpen(false); toast({ title: "Student added" }); },
        onError: () => toast({ title: "Failed to add student", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteStudent.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Student removed" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
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
          <h1 className="text-3xl font-bold tracking-tight">Student Database</h1>
          <p className="text-muted-foreground mt-1">Manage and track student placement readiness.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} data-testid="btn-add-student">
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>Fill in the student details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { id: "name", label: "Full Name", placeholder: "e.g. Aarav Sharma" },
                { id: "email", label: "Email", placeholder: "e.g. aarav@college.edu" },
                { id: "phone", label: "Phone", placeholder: "e.g. 9876543210" },
                { id: "cgpa", label: "CGPA", placeholder: "e.g. 8.5" },
                { id: "graduationYear", label: "Graduation Year", placeholder: "e.g. 2025" },
                { id: "skills", label: "Skills", placeholder: "e.g. React,Python,SQL" },
              ].map(f => (
                <div key={f.id} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={f.id} className="text-right">{f.label}</Label>
                  <Input
                    id={f.id}
                    placeholder={f.placeholder}
                    className="col-span-3"
                    value={(form as Record<string, string>)[f.id]}
                    onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                    data-testid={`input-${f.id}`}
                  />
                </div>
              ))}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Branch</Label>
                <div className="col-span-3">
                  <Select value={form.branch} onValueChange={v => setForm(p => ({ ...p, branch: v }))}>
                    <SelectTrigger data-testid="select-branch-form">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger data-testid="select-status-form">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={createStudent.isPending || updateStudent.isPending}
                data-testid="btn-submit-student"
              >
                {editStudent ? "Update" : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="input-search-students"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-4">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-branch">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Readiness</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading students...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No students found. Add one or load sample data from the dashboard.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(student => (
                <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.branch}</TableCell>
                  <TableCell className="font-medium">{student.cgpa}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(student.skills ?? "").split(",").filter(Boolean).slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="font-normal text-xs">{skill.trim()}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={student.readinessScore ?? 0}
                        className={`h-2 w-full ${
                          (student.readinessScore ?? 0) >= 80 ? "[&>div]:bg-green-500" :
                          (student.readinessScore ?? 0) >= 60 ? "[&>div]:bg-yellow-500" :
                          "[&>div]:bg-destructive"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{student.readinessScore ?? 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(student.status)}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(student)} data-testid={`btn-edit-student-${student.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} data-testid={`btn-delete-student-${student.id}`}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
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

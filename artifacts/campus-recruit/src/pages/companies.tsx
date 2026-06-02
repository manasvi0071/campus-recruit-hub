import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useListCompanies, useCreateCompany, useDeleteCompany,
  getListCompaniesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Building2, IndianRupee, Users, Trash2 } from "lucide-react";

function healthColor(h: string | null) {
  if (h === "hot") return "default";
  if (h === "warm") return "secondary";
  return "outline";
}

function healthLabel(h: string | null) {
  if (!h) return "Unknown";
  return h.charAt(0).toUpperCase() + h.slice(1);
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", industry: "", contactName: "", contactEmail: "",
    avgPackageLpa: "", totalHires: "", relationshipHealth: "warm", status: "active",
  });

  const { data: companies = [], isLoading } = useListCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCompaniesQueryKey() });

  const handleSubmit = () => {
    createCompany.mutate({
      data: {
        name: form.name, industry: form.industry,
        contactName: form.contactName, contactEmail: form.contactEmail,
        avgPackageLpa: form.avgPackageLpa ? parseFloat(form.avgPackageLpa) : undefined,
        totalHires: form.totalHires ? parseInt(form.totalHires) : undefined,
        relationshipHealth: form.relationshipHealth, status: form.status,
      },
    }, {
      onSuccess: () => {
        invalidate(); setIsOpen(false);
        toast({ title: "Company added" });
        setForm({ name: "", industry: "", contactName: "", contactEmail: "", avgPackageLpa: "", totalHires: "", relationshipHealth: "warm", status: "active" });
      },
      onError: () => toast({ title: "Failed to add company", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    deleteCompany.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Company removed" }); },
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
          <h1 className="text-3xl font-bold tracking-tight">Company & Partner CRM</h1>
          <p className="text-muted-foreground mt-1">Manage corporate relationships and hiring history.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-company">
              <Plus className="w-4 h-4 mr-2" /> Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Register a new company as a recruitment partner.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { id: "name", label: "Company Name", placeholder: "e.g. Google" },
                { id: "industry", label: "Industry", placeholder: "e.g. Technology" },
                { id: "contactName", label: "Contact Name", placeholder: "e.g. Priya Mehta" },
                { id: "contactEmail", label: "Contact Email", placeholder: "e.g. priya@google.com" },
                { id: "avgPackageLpa", label: "Avg Package (LPA)", placeholder: "e.g. 12.5" },
                { id: "totalHires", label: "Total Hires", placeholder: "e.g. 45" },
              ].map(f => (
                <div key={f.id} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={f.id} className="text-right">{f.label}</Label>
                  <Input
                    id={f.id}
                    placeholder={f.placeholder}
                    className="col-span-3"
                    value={(form as Record<string, string>)[f.id]}
                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                    data-testid={`input-company-${f.id}`}
                  />
                </div>
              ))}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Relationship</Label>
                <div className="col-span-3">
                  <Select value={form.relationshipHealth} onValueChange={v => setForm(p => ({ ...p, relationshipHealth: v }))}>
                    <SelectTrigger data-testid="select-relationship">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createCompany.isPending} data-testid="btn-submit-company">
                Add Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or industries..."
          className="pl-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          data-testid="input-search-companies"
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading companies...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-lg border">
          {searchTerm ? `No companies found matching "${searchTerm}"` : "No companies yet. Add one or load sample data from the dashboard."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Building2 className="w-3 h-3 mr-1 shrink-0" /> {company.industry}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge variant={healthColor(company.relationshipHealth ?? null)}
                      className={company.relationshipHealth === "hot" ? "bg-red-500 hover:bg-red-600" : ""}>
                      {healthLabel(company.relationshipHealth ?? null)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(company.id)}
                      data-testid={`btn-delete-company-${company.id}`}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-4 border-t mt-auto">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center mb-1">
                        <Users className="w-3.5 h-3.5 mr-1.5" /> Total Hires
                      </div>
                      <div className="font-semibold text-lg">{company.totalHires ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center mb-1">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Avg Package
                      </div>
                      <div className="font-semibold text-lg">{company.avgPackageLpa ?? "—"}L</div>
                    </div>
                    {company.contactName && (
                      <div className="col-span-2 pt-3 border-t">
                        <div className="text-xs text-muted-foreground">Contact: <span className="font-medium text-foreground">{company.contactName}</span></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

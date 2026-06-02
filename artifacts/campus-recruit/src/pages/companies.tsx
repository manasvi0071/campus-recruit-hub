import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { companies } from "@/lib/mock-data";
import { Search, Plus, Building2, MapPin, IndianRupee, Users } from "lucide-react";
import { useState } from "react";

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button data-testid="btn-add-company">
          <Plus className="w-4 h-4 mr-2" /> Add Company
        </Button>
      </div>

      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or industries..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search-companies"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border">
            No companies found matching "{searchTerm}"
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
            <motion.div 
              key={company.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Building2 className="w-3 h-3 mr-1" /> {company.industry}
                    </div>
                  </div>
                  <Badge variant={
                    company.relationship === "Hot" ? "default" :
                    company.relationship === "Warm" ? "secondary" :
                    "outline"
                  } className={company.relationship === "Hot" ? "bg-red-500 hover:bg-red-600" : ""}>
                    {company.relationship}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-4 border-t mt-auto">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center mb-1">
                        <Users className="w-3.5 h-3.5 mr-1.5" /> Total Hires
                      </div>
                      <div className="font-semibold text-lg">{company.totalHires}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center mb-1">
                        <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Avg Package
                      </div>
                      <div className="font-semibold text-lg">{company.avgPackage}L</div>
                    </div>
                    <div className="col-span-2 mt-2 pt-3 border-t">
                      <div className="text-muted-foreground flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" /> Last Visited: <span className="font-medium text-foreground ml-1">{company.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

import { Router, type IRouter } from "express";
import { db, studentsTable, jobsTable, companiesTable, applicationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { GetDashboardStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [{ count: totalStudents }] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable);
  const [{ count: placedStudents }] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(eq(studentsTable.status, "placed"));
  const [{ count: activeJobs }] = await db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "open"));
  const [{ count: totalCompanies }] = await db.select({ count: sql<number>`count(*)::int` }).from(companiesTable);

  const allApps = await db.select({ status: applicationsTable.status }).from(applicationsTable);

  const byStatus = {
    applied: allApps.filter(a => a.status === "applied").length,
    screened: allApps.filter(a => a.status === "screened").length,
    interviewed: allApps.filter(a => a.status === "interviewed").length,
    offered: allApps.filter(a => a.status === "offered").length,
    joined: allApps.filter(a => a.status === "joined").length,
  };

  res.json(GetDashboardStatsResponse.parse({
    totalStudents,
    placedStudents,
    activeJobs,
    totalCompanies,
    applicationsByStatus: byStatus,
  }));
});

export default router;

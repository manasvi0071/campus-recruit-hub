import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobsTable, companiesTable } from "@workspace/db";
import {
  CreateJobBody,
  UpdateJobBody,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
  GetJobResponse,
  UpdateJobResponse,
  ListJobsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      companyId: jobsTable.companyId,
      companyName: companiesTable.name,
      description: jobsTable.description,
      eligibleBranches: jobsTable.eligibleBranches,
      minCgpa: jobsTable.minCgpa,
      packageLpa: jobsTable.packageLpa,
      deadline: jobsTable.deadline,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .orderBy(jobsTable.createdAt);

  res.json(ListJobsResponse.parse(jobs.map(j => ({ ...j, applicantsCount: null, createdAt: j.createdAt.toISOString() }))));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.insert(jobsTable).values(parsed.data).returning();
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, job.companyId));
  res.status(201).json(GetJobResponse.parse({ ...job, companyName: company?.name ?? null, applicantsCount: null, createdAt: job.createdAt.toISOString() }));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      companyId: jobsTable.companyId,
      companyName: companiesTable.name,
      description: jobsTable.description,
      eligibleBranches: jobsTable.eligibleBranches,
      minCgpa: jobsTable.minCgpa,
      packageLpa: jobsTable.packageLpa,
      deadline: jobsTable.deadline,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(GetJobResponse.parse({ ...job, applicantsCount: null, createdAt: job.createdAt.toISOString() }));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(UpdateJobResponse.parse({ ...job, companyName: null, applicantsCount: null, createdAt: job.createdAt.toISOString() }));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicationsTable, studentsTable, jobsTable, companiesTable } from "@workspace/db";
import {
  CreateApplicationBody,
  UpdateApplicationBody,
  UpdateApplicationParams,
  ListApplicationsResponse,
  UpdateApplicationResponse,
  ListApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const queryParams = ListApplicationsQueryParams.safeParse(req.query);

  const apps = await db
    .select({
      id: applicationsTable.id,
      studentId: applicationsTable.studentId,
      jobId: applicationsTable.jobId,
      studentName: studentsTable.name,
      jobTitle: jobsTable.title,
      companyName: companiesTable.name,
      status: applicationsTable.status,
      createdAt: applicationsTable.createdAt,
    })
    .from(applicationsTable)
    .leftJoin(studentsTable, eq(applicationsTable.studentId, studentsTable.id))
    .leftJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .orderBy(applicationsTable.createdAt);

  let filtered = apps;
  if (queryParams.success && queryParams.data.jobId) {
    filtered = filtered.filter(a => a.jobId === queryParams.data.jobId);
  }
  if (queryParams.success && queryParams.data.studentId) {
    filtered = filtered.filter(a => a.studentId === queryParams.data.studentId);
  }

  res.json(ListApplicationsResponse.parse(filtered.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))));
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [app] = await db.insert(applicationsTable).values(parsed.data).returning();
  res.status(201).json({ ...app, studentName: null, jobTitle: null, companyName: null, createdAt: app.createdAt.toISOString() });
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [app] = await db.update(applicationsTable).set(parsed.data).where(eq(applicationsTable.id, params.data.id)).returning();
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(UpdateApplicationResponse.parse({ ...app, studentName: null, jobTitle: null, companyName: null, createdAt: app.createdAt.toISOString() }));
});

export default router;

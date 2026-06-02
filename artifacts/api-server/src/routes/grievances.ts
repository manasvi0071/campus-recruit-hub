import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, grievancesTable } from "@workspace/db";
import {
  CreateGrievanceBody,
  UpdateGrievanceBody,
  UpdateGrievanceParams,
  ListGrievancesResponse,
  UpdateGrievanceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/grievances", async (req, res): Promise<void> => {
  const grievances = await db.select().from(grievancesTable).orderBy(desc(grievancesTable.createdAt));
  res.json(ListGrievancesResponse.parse(grievances.map(g => ({ ...g, createdAt: g.createdAt.toISOString() }))));
});

router.post("/grievances", async (req, res): Promise<void> => {
  const parsed = CreateGrievanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [grievance] = await db.insert(grievancesTable).values(parsed.data).returning();
  res.status(201).json({ ...grievance, createdAt: grievance.createdAt.toISOString() });
});

router.patch("/grievances/:id", async (req, res): Promise<void> => {
  const params = UpdateGrievanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateGrievanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [grievance] = await db.update(grievancesTable).set(parsed.data).where(eq(grievancesTable.id, params.data.id)).returning();
  if (!grievance) {
    res.status(404).json({ error: "Grievance not found" });
    return;
  }
  res.json(UpdateGrievanceResponse.parse({ ...grievance, createdAt: grievance.createdAt.toISOString() }));
});

export default router;

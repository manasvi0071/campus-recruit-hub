import { Router } from "express";
import { db } from "@workspace/db";
import { drivesTable, driveRoundsTable, candidateRoundStatusTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET all drives
router.get("/drives", async (req, res) => {
  try {
    const all = await db.select().from(drivesTable).orderBy(drivesTable.createdAt);
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drives" });
  }
});

// POST create drive
router.post("/drives", async (req, res) => {
  try {
    const [drive] = await db.insert(drivesTable).values(req.body).returning();
    res.json(drive);
  } catch (err) {
    res.status(500).json({ error: "Failed to create drive" });
  }
});

// PUT update drive
router.put("/drives/:id", async (req, res) => {
  try {
    const [drive] = await db.update(drivesTable)
      .set(req.body)
      .where(eq(drivesTable.id, parseInt(req.params.id)))
      .returning();
    res.json(drive);
  } catch (err) {
    res.status(500).json({ error: "Failed to update drive" });
  }
});

// DELETE drive
router.delete("/drives/:id", async (req, res) => {
  try {
    await db.delete(drivesTable).where(eq(drivesTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete drive" });
  }
});

// GET rounds for a drive
router.get("/drives/:id/rounds", async (req, res) => {
  try {
    const rounds = await db.select().from(driveRoundsTable)
      .where(eq(driveRoundsTable.driveId, parseInt(req.params.id)));
    res.json(rounds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rounds" });
  }
});

// POST add round to drive
router.post("/drives/:id/rounds", async (req, res) => {
  try {
    const [round] = await db.insert(driveRoundsTable)
      .values({ ...req.body, driveId: parseInt(req.params.id) })
      .returning();
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: "Failed to create round" });
  }
});

// GET all candidates for a drive
router.get("/drives/:driveId/candidates", async (req, res) => {
  try {
    const results = await db.select().from(candidateRoundStatusTable)
      .where(eq(candidateRoundStatusTable.driveId, parseInt(req.params.driveId)));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// POST add candidate to drive round
router.post("/drives/:driveId/candidates", async (req, res) => {
  try {
    const [record] = await db.insert(candidateRoundStatusTable)
      .values({ ...req.body, driveId: parseInt(req.params.driveId) })
      .returning();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Failed to add candidate" });
  }
});

// PUT update candidate round status
router.put("/drives/:driveId/candidates/:studentId/round/:roundId", async (req, res) => {
  try {
    const [updated] = await db.update(candidateRoundStatusTable)
      .set({ status: req.body.status, updatedAt: new Date() })
      .where(
        and(
          eq(candidateRoundStatusTable.studentId, parseInt(req.params.studentId)),
          eq(candidateRoundStatusTable.roundId, parseInt(req.params.roundId)),
          eq(candidateRoundStatusTable.driveId, parseInt(req.params.driveId))
        )
      )
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
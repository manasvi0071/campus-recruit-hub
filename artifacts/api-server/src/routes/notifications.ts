import { Router } from "express";
import { db } from "@workspace/db";
import { notificationLogs } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

// GET notification history
router.get("/history", async (req, res) => {
  const logs = await db.select().from(notificationLogs)
    .orderBy(desc(notificationLogs.sentAt))
    .limit(100);
  res.json(logs);
});

// POST send/log notification
router.post("/send", async (req, res) => {
  const records = Array.isArray(req.body) ? req.body : [req.body];
  const inserted = await db.insert(notificationLogs)
    .values(records)
    .returning();
  res.json({ sent: inserted.length, records: inserted });
});

export default router;
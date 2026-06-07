import { Router } from "express";
import { db } from "@workspace/db";
import { notificationLogsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

// GET notification history
router.get("/notifications/history", async (req, res) => {
  try {
    const logs = await db.select().from(notificationLogsTable)
      .orderBy(desc(notificationLogsTable.sentAt))
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notification history" });
  }
});

// POST send/log notifications
router.post("/notifications/send", async (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = await db.insert(notificationLogsTable)
      .values(records)
      .returning();
    res.json({ sent: inserted.length, records: inserted });
  } catch (err) {
    res.status(500).json({ error: "Failed to save notifications" });
  }
});

export default router;
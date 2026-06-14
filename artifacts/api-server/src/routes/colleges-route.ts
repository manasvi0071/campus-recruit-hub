import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/colleges", async (req, res): Promise<void> => {
  try {
    const colleges = await db.execute(sql`SELECT * FROM colleges ORDER BY id`);
    res.json(colleges.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

export default router;
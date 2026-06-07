import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { drivesTable } from "./drives";

export const driveRoundsTable = pgTable("drive_rounds", {
  id: serial("id").primaryKey(),
  driveId: integer("drive_id").references(() => drivesTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  date: text("date"),
  totalAppeared: integer("total_appeared").default(0),
  qualified: integer("qualified").default(0),
  rejected: integer("rejected").default(0),
  pending: integer("pending").default(0),
  absent: integer("absent").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDriveRoundSchema = createInsertSchema(driveRoundsTable).omit({ id: true, createdAt: true });
export type InsertDriveRound = z.infer<typeof insertDriveRoundSchema>;
export type DriveRound = typeof driveRoundsTable.$inferSelect;
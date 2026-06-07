import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const drivesTable = pgTable("drives", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  packageLpa: numeric("package_lpa"),
  date: text("date"),
  status: text("status").default("upcoming"),
  totalApplied: integer("total_applied").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDriveSchema = createInsertSchema(drivesTable).omit({ id: true, createdAt: true });
export type InsertDrive = z.infer<typeof insertDriveSchema>;
export type Drive = typeof drivesTable.$inferSelect;
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { driveRoundsTable } from "./drive-rounds";
import { drivesTable } from "./drives";

export const candidateRoundStatusTable = pgTable("candidate_round_status", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentsTable.id),
  roundId: integer("round_id").references(() => driveRoundsTable.id),
  driveId: integer("drive_id").references(() => drivesTable.id),
  status: text("status").default("pending"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCandidateRoundStatusSchema = createInsertSchema(candidateRoundStatusTable).omit({ id: true, updatedAt: true });
export type InsertCandidateRoundStatus = z.infer<typeof insertCandidateRoundStatusSchema>;
export type CandidateRoundStatus = typeof candidateRoundStatusTable.$inferSelect;
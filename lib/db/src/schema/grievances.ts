import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const grievancesTable = pgTable("grievances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  submittedBy: text("submitted_by").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGrievanceSchema = createInsertSchema(grievancesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type Grievance = typeof grievancesTable.$inferSelect;

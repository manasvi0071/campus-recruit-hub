import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationLogsTable = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id"),
  candidateName: text("candidate_name"),
  candidateEmail: text("candidate_email"),
  company: text("company"),
  round: text("round"),
  subject: text("subject"),
  body: text("body"),
  status: text("status"),
  emailStatus: text("email_status").default("sent"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNotificationLogSchema = createInsertSchema(notificationLogsTable).omit({ id: true, sentAt: true });
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;
export type NotificationLog = typeof notificationLogsTable.$inferSelect;
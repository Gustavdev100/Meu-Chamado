import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true });

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type CreateTicketRequest = InsertTicket;
export type UpdateTicketRequest = Partial<InsertTicket>;

import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("Chamados"), // 'compras', 'MID', 'Chamados'
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  city: text("city").notNull(),
  base: text("base").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  // Campos específicos para MID
  midLocation: text("mid_location"),
  midMaterialType: text("mid_material_type"),
  // Campos específicos para Compras
  itemQuantity: integer("item_quantity"),
  itemCategory: text("item_category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true });

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type CreateTicketRequest = InsertTicket;
export type UpdateTicketRequest = Partial<InsertTicket>;

import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  tickets,
  type Ticket,
  type CreateTicketRequest,
  type UpdateTicketRequest
} from "@shared/schema";

export interface IStorage {
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: CreateTicketRequest): Promise<Ticket>;
  updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket> {
    const [updatedTicket] = await db.update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }
}

export const storage = new DatabaseStorage();

import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  tickets,
  type Ticket,
  type CreateTicketRequest,
  type UpdateTicketRequest
} from "@shared/schema";
import { log } from "./index";

export interface IStorage {
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: CreateTicketRequest): Promise<Ticket>;
  updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTickets(): Promise<Ticket[]> {
    const tickets_data = await db.select().from(tickets);
    log(`Fetched ${tickets_data.length} tickets from PostgreSQL`);
    return tickets_data;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (ticket) {
      log(`Fetched ticket #${id} from PostgreSQL`);
    }
    return ticket;
  }

  async createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    log(`Created ticket #${newTicket.id} in PostgreSQL`);
    return newTicket;
  }

  async updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket> {
    const [updatedTicket] = await db.update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();
    log(`Updated ticket #${id} in PostgreSQL`);
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
    log(`Deleted ticket #${id} from PostgreSQL`);
  }
}

// Initialize storage (PostgreSQL for now, Google Sheets ready when authorized)
const sheetsId = process.env.GOOGLE_SHEETS_ID;
if (sheetsId) {
  log(`Google Sheets ID configured: ${sheetsId.substring(0, 20)}...`, 'init');
} else {
  log('Using PostgreSQL storage (Google Sheets not configured)', 'init');
}

export const storage = new DatabaseStorage();

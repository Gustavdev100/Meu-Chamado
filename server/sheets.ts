import { google } from 'googleapis';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '@shared/schema';
import { log } from './index';

// Google Sheets configuration
const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
  range: 'Tickets!A:U',
  headers: [
    'ID', 'Tipo', 'Status', 'Título', 'Descrição', 'Cidade', 'Base',
    'Nome Solicitante', 'E-mail Contato', 'Prioridade', 'Itens (JSON)',
    'MID Localização', 'MID Tipo Material', 'Categoria Compra',
    'Observações Admin', 'Foto URL', 'Prazo Visita', 'Prazo Orçamento',
    'Prazo Entrega', 'Prazo Busca (MID)', 'Data Criação'
  ]
};

export interface ISheetsStorage {
  isConfigured(): boolean;
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: CreateTicketRequest): Promise<Ticket>;
  updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
}

export class GoogleSheetsStorage implements ISheetsStorage {
  private sheets: any;
  private spreadsheetId: string;

  constructor(accessToken?: string) {
    this.spreadsheetId = SHEETS_CONFIG.spreadsheetId;
    
    if (accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      this.sheets = google.sheets({ version: 'v4', auth });
    }
  }

  isConfigured(): boolean {
    return !!this.spreadsheetId && !!this.sheets;
  }

  private rowToTicket(row: any[], id: number): Ticket {
    return {
      id,
      type: row[1] || 'Chamados',
      status: row[2] || 'open',
      title: row[3] || '',
      description: row[4] || '',
      city: row[5] || '',
      base: row[6] || '',
      contactName: row[7] || '',
      contactEmail: row[8] || '',
      priority: row[9] || 'medium',
      items: row[10] ? JSON.stringify(JSON.parse(row[10])) : null,
      midLocation: row[11] || '',
      midMaterialType: row[12] || '',
      itemCategory: row[13] || '',
      adminObservations: row[14] || '',
      adminPhotoUrl: row[15] || '',
      deadlineVisit: row[16] ? new Date(row[16]) : undefined,
      deadlineQuote: row[17] ? new Date(row[17]) : undefined,
      deadlineDelivery: row[18] ? new Date(row[18]) : undefined,
      deadlinePickup: row[19] ? new Date(row[19]) : undefined,
      createdAt: row[20] ? new Date(row[20]) : new Date()
    };
  }

  private ticketToRow(ticket: Ticket): any[] {
    return [
      ticket.id,
      ticket.type,
      ticket.status,
      ticket.title,
      ticket.description,
      ticket.city,
      ticket.base,
      ticket.contactName,
      ticket.contactEmail,
      ticket.priority,
      ticket.items || '',
      ticket.midLocation || '',
      ticket.midMaterialType || '',
      ticket.itemCategory || '',
      ticket.adminObservations || '',
      ticket.adminPhotoUrl || '',
      ticket.deadlineVisit ? ticket.deadlineVisit.toISOString() : '',
      ticket.deadlineQuote ? ticket.deadlineQuote.toISOString() : '',
      ticket.deadlineDelivery ? ticket.deadlineDelivery.toISOString() : '',
      ticket.deadlinePickup ? ticket.deadlinePickup.toISOString() : '',
      ticket.createdAt ? ticket.createdAt.toISOString() : new Date().toISOString()
    ];
  }

  async getTickets(): Promise<Ticket[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: SHEETS_CONFIG.range
      });

      const rows = response.data.values || [];
      const tickets: Ticket[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0]) { // Skip empty rows
          tickets.push(this.rowToTicket(row, parseInt(row[0])));
        }
      }

      return tickets;
    } catch (error) {
      log(`Error fetching tickets from Sheets: ${error}`, 'sheets');
      throw error;
    }
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const tickets = await this.getTickets();
    return tickets.find(t => t.id === id);
  }

  async createTicket(ticket: CreateTicketRequest): Promise<Ticket> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      // Get next ID
      const tickets = await this.getTickets();
      const nextId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;

      const newTicket: Ticket = {
        id: nextId,
        ...ticket,
        createdAt: new Date()
      };

      const row = this.ticketToRow(newTicket);
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Tickets!A:U',
        valueInputOption: 'USER_ENTERED',
        values: [row]
      });

      log(`Created ticket #${nextId} in Sheets`, 'sheets');
      return newTicket;
    } catch (error) {
      log(`Error creating ticket in Sheets: ${error}`, 'sheets');
      throw error;
    }
  }

  async updateTicket(id: number, updates: UpdateTicketRequest): Promise<Ticket> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const ticket = await this.getTicket(id);
      if (!ticket) throw new Error(`Ticket ${id} not found`);

      const updated = { ...ticket, ...updates };
      const row = this.ticketToRow(updated);

      // Find row number
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Tickets!A:A'
      });

      const rows = response.data.values || [];
      const rowNum = rows.findIndex((r: any[]) => r[0] == id) + 1;

      if (rowNum <= 1) throw new Error(`Ticket ${id} not found in sheet`);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Tickets!A${rowNum}:U${rowNum}`,
        valueInputOption: 'USER_ENTERED',
        values: [row]
      });

      log(`Updated ticket #${id} in Sheets`, 'sheets');
      return updated;
    } catch (error) {
      log(`Error updating ticket in Sheets: ${error}`, 'sheets');
      throw error;
    }
  }

  async deleteTicket(id: number): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Tickets!A:A'
      });

      const rows = response.data.values || [];
      const rowNum = rows.findIndex((r: any[]) => r[0] == id) + 1;

      if (rowNum <= 1) throw new Error(`Ticket ${id} not found`);

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowNum - 1,
                endIndex: rowNum
              }
            }
          }]
        }
      });

      log(`Deleted ticket #${id} from Sheets`, 'sheets');
    } catch (error) {
      log(`Error deleting ticket from Sheets: ${error}`, 'sheets');
      throw error;
    }
  }
}

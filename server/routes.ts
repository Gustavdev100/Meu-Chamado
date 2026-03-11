import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { log } from "./index";

// Google Apps Script Webhook URL
const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx2UE8Z2Qn4bXpiab8E0lWp3uxrd6BK2pIv4AjlJnZZqxdMiqK8A3e0AeMwZfk4Acuw/exec';
log(`✅ Webhook ativo: Sincronizando com Google Sheets`, 'webhook');

// Função para enviar dados ao Google Sheets via webhook
async function syncToGoogleSheets(ticket: any) {
  if (!SHEETS_WEBHOOK_URL) {
    log('⚠️ SHEETS_WEBHOOK_URL não configurada - pulando sincronização', 'webhook');
    return;
  }

  try {
    const options = {
      method: 'POST' as const,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addTicket',
        ticket: ticket,
        timestamp: new Date().toISOString()
      })
    };

    const response = await fetch(SHEETS_WEBHOOK_URL, options);
    if (response.ok) {
      log(`✅ Ticket #${ticket.id} sincronizado com Google Sheets`, 'webhook');
    } else {
      log(`⚠️ Erro ao sincronizar com Sheets (${response.status}): ${await response.text()}`, 'webhook');
    }
  } catch (error) {
    log(`❌ Erro ao conectar com Google Sheets: ${error}`, 'webhook');
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.tickets.list.path, async (req, res) => {
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  app.get(api.tickets.get.path, async (req, res) => {
    const ticket = await storage.getTicket(Number(req.params.id));
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  });

  app.post(api.tickets.create.path, async (req, res) => {
    try {
      const input = api.tickets.create.input.parse(req.body);
      const ticket = await storage.createTicket(input);
      
      // Sincronizar com Google Sheets (assincronamente)
      syncToGoogleSheets(ticket).catch(err => 
        log(`Erro na sincronização: ${err}`, 'webhook')
      );
      
      res.status(201).json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.tickets.update.path, async (req, res) => {
    try {
      const input = api.tickets.update.input.parse(req.body);
      const ticket = await storage.updateTicket(Number(req.params.id), input);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.tickets.delete.path, async (req, res) => {
    try {
      await storage.deleteTicket(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data if empty
  try {
    const existingTickets = await storage.getTickets();
    if (existingTickets.length === 0) {
      await storage.createTicket({
        title: "Problema no acesso ao sistema",
        description: "Não consigo fazer login usando minhas credenciais corporativas.",
        status: "open",
        priority: "high",
        contactName: "João Silva",
        contactEmail: "joao.silva@exemplo.com",
      });
      await storage.createTicket({
        title: "Solicitação de novo monitor",
        description: "Meu monitor atual está com pixels queimados, gostaria de solicitar a troca.",
        status: "in_progress",
        priority: "medium",
        contactName: "Maria Oliveira",
        contactEmail: "maria.oliveira@exemplo.com",
      });
      await storage.createTicket({
        title: "Dúvida sobre férias",
        description: "Como faço para visualizar meu saldo de férias atualizado?",
        status: "resolved",
        priority: "low",
        contactName: "Carlos Pereira",
        contactEmail: "carlos.pereira@exemplo.com",
      });
    }
  } catch (error) {
    console.error("Failed to seed tickets:", error);
  }

  return httpServer;
}

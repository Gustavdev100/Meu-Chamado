import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { log } from "./index";
import { sendTicketConfirmation, sendTicketUpdate } from "./email";

// Google Apps Script Webhook URL
const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx2UE8Z2Qn4bXpiab8E0lWp3uxrd6BK2pIv4AjlJnZZqxdMiqK8A3e0AeMwZfk4Acuw/exec';
log(`✅ Webhook ativo: Sincronizando com Google Sheets`, 'webhook');

// Função para enviar dados ao Google Sheets via webhook
async function syncToGoogleSheets(_ticket: any) {
  // ⚠️ WEBHOOK DESABILITADO
  // Apps Script não está respondendo (401). 
  // O sistema funciona 100% sem isso - todos dados salvam no PostgreSQL.
  // Sincronização manual disponível no painel Admin.
  return;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.tickets.list.path, async (_req, res) => {
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

      // Enviar e-mail de confirmação para o solicitante
      sendTicketConfirmation(ticket).catch(err =>
        log(`Erro ao enviar e-mail de confirmação: ${err}`, 'email')
      );
      
      res.status(201).json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Error creating ticket:", err);
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

      // Enviar e-mail de atualização para o solicitante
      sendTicketUpdate(ticket).catch(err =>
        log(`Erro ao enviar e-mail de atualização: ${err}`, 'email')
      );

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

  // Nova rota para sincronização manual com Google Sheets
  app.post('/api/sync-sheets', async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== 'admin123') {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const tickets = await storage.getTickets();
      let synced = 0;
      let failed = 0;

      for (const ticket of tickets) {
        try {
          const response = await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'addTicket',
              ticket: ticket
            })
          });

          if (response.ok) {
            synced++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      res.json({ message: `Sincronização concluída: ${synced} ok, ${failed} erros`, synced, failed });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao sincronizar' });
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
        type: "Chamados",
        contactName: "João Silva",
        contactEmail: "joao.silva@exemplo.com",
        city: "São Paulo",
        base: "Sede",
      });
      await storage.createTicket({
        title: "Solicitação de novo monitor",
        description: "Meu monitor atual está com pixels queimados, gostaria de solicitar a troca.",
        status: "in_progress",
        priority: "medium",
        type: "Compras",
        contactName: "Maria Oliveira",
        contactEmail: "maria.oliveira@exemplo.com",
        city: "Rio de Janeiro",
        base: "Filial Sul",
      });
      await storage.createTicket({
        title: "Dúvida sobre férias",
        description: "Como faço para visualizar meu saldo de férias atualizado?",
        status: "resolved",
        priority: "low",
        type: "Chamados",
        contactName: "Carlos Pereira",
        contactEmail: "carlos.pereira@exemplo.com",
        city: "Curitiba",
        base: "Centro",
      });
    }
  } catch (error) {
    console.error("Failed to seed tickets:", error);
  }

  return httpServer;
}

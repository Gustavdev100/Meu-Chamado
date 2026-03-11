/**
 * Google Apps Script para Meu Chamado - Vale S.A.
 * 
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets
 * 2. Clique em "Extensões" → "Apps Script"
 * 3. Copie e cole TODO este código em "Code.gs"
 * 4. Salve (Ctrl+S)
 * 5. Execute a função setupTriggers() uma vez (click em "Executar")
 * 6. Autorize as permissões solicitadas
 * 
 * A planilha será sincronizada automaticamente a cada 5 minutos
 */

const SPREADSHEET_ID = '11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk'; // Sua planilha
const SHEET_NAME = 'Tickets';
const REPLIT_API_URL = 'https://meu-chamado-vale.replit.dev'; // Mude para sua URL do Replit
const API_KEY = 'sua-chave-api-aqui'; // Opcional: adicione segurança

/**
 * Configurar triggers automáticos (execute UMA VEZ)
 */
function setupTriggers() {
  // Remove triggers anteriores
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncFromAPI') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Cria novo trigger a cada 5 minutos
  ScriptApp.newTrigger('syncFromAPI')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('✅ Triggers configurados! A sincronização acontecerá a cada 5 minutos.');
}

/**
 * Sincronizar dados da API para a planilha
 */
function syncFromAPI() {
  try {
    Logger.log('🔄 Iniciando sincronização...');
    
    // Buscar tickets da API
    const options = {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = UrlFetchApp.fetch(`${REPLIT_API_URL}/api/tickets`, options);
    const status = response.getResponseCode();

    if (status !== 200) {
      Logger.log('❌ Erro na API: ' + status);
      Logger.log(response.getContentText());
      return;
    }

    const tickets = JSON.parse(response.getContentText());
    Logger.log(`📊 Recebidos ${tickets.length} tickets da API`);

    // Atualizar planilha
    updateSpreadsheet(tickets);
    Logger.log('✅ Sincronização concluída!');

  } catch (error) {
    Logger.log('❌ Erro: ' + error.toString());
  }
}

/**
 * Atualizar dados na planilha
 */
function updateSpreadsheet(tickets) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  // Limpar dados antigos (mantém header)
  if (sheet.getMaxRows() > 1) {
    sheet.deleteRows(2, sheet.getMaxRows() - 1);
  }

  // Cabeçalhos
  const headers = [
    'ID', 'Tipo', 'Status', 'Título', 'Descrição', 'Cidade', 'Base',
    'Nome Solicitante', 'E-mail Contato', 'Prioridade', 'Itens (JSON)',
    'MID Localização', 'MID Tipo Material', 'Categoria Compra',
    'Observações Admin', 'Foto URL', 'Prazo Visita', 'Prazo Orçamento',
    'Prazo Entrega', 'Prazo Busca (MID)', 'Data Criação'
  ];

  // Adicionar headers se não existir
  if (sheet.getRange(1, 1).getValue() === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Adicionar dados dos tickets
  if (tickets.length > 0) {
    const data = tickets.map(ticket => [
      ticket.id || '',
      ticket.type || '',
      ticket.status || '',
      ticket.title || '',
      ticket.description || '',
      ticket.city || '',
      ticket.base || '',
      ticket.contactName || '',
      ticket.contactEmail || '',
      ticket.priority || '',
      ticket.items || '',
      ticket.midLocation || '',
      ticket.midMaterialType || '',
      ticket.itemCategory || '',
      ticket.adminObservations || '',
      ticket.adminPhotoUrl || '',
      formatDate(ticket.deadlineVisit),
      formatDate(ticket.deadlineQuote),
      formatDate(ticket.deadlineDelivery),
      formatDate(ticket.deadlinePickup),
      formatDate(ticket.createdAt)
    ]);

    sheet.getRange(2, 1, data.length, headers.length).setValues(data);
    Logger.log(`✅ ${data.length} linhas adicionadas à planilha`);
  }
}

/**
 * Formatar datas
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return dateString;
  }
}

/**
 * Receber dados via webhook (POST)
 * URL: https://script.google.com/macros/d/{SCRIPT_ID}/usercripts
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('📥 Recebido POST: ' + e.postData.contents);

    if (data.action === 'addTicket') {
      addTicketToSheet(data.ticket);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Ticket adicionado à planilha'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Ação não reconhecida'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Erro em doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Adicionar um ticket à planilha
 */
function addTicketToSheet(ticket) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  const row = [
    ticket.id || '',
    ticket.type || '',
    ticket.status || '',
    ticket.title || '',
    ticket.description || '',
    ticket.city || '',
    ticket.base || '',
    ticket.contactName || '',
    ticket.contactEmail || '',
    ticket.priority || '',
    ticket.items || '',
    ticket.midLocation || '',
    ticket.midMaterialType || '',
    ticket.itemCategory || '',
    ticket.adminObservations || '',
    ticket.adminPhotoUrl || '',
    formatDate(ticket.deadlineVisit),
    formatDate(ticket.deadlineQuote),
    formatDate(ticket.deadlineDelivery),
    formatDate(ticket.deadlinePickup),
    formatDate(ticket.createdAt)
  ];

  sheet.appendRow(row);
  Logger.log(`✅ Ticket #${ticket.id} adicionado à planilha`);
}

/**
 * Testar sincronização (execute manualmente para testar)
 */
function testSync() {
  Logger.log('🧪 Testando sincronização...');
  syncFromAPI();
}

/**
 * Obter URL do webhook para usar no backend
 */
function getWebhookUrl() {
  const scriptId = ScriptApp.getScriptId();
  const url = `https://script.google.com/macros/d/${scriptId}/usercripts`;
  Logger.log('🔗 URL do Webhook:');
  Logger.log(url);
  Logger.log('\nCopie esta URL e adicione ao backend do Replit');
}

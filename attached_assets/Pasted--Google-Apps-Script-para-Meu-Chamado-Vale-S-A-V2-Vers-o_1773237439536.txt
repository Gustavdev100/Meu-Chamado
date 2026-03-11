/**
 * Google Apps Script para Meu Chamado - Vale S.A. (V2)
 * Versão otimizada e corrigida para sincronização com Sheets
 * 
 * INSTRUÇÕES:
 * 1. Abra sua planilha Google Sheets
 * 2. Extensões → Apps Script
 * 3. Copie TODO este código e substitua o anterior
 * 4. Salve (Ctrl+S)
 * 5. Execute setupTriggers() uma vez
 */

// Configuração
const SPREADSHEET_ID = '11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk';
const SHEET_NAME = 'Tickets';

/**
 * Webhook receiver (POST de tickets novos)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('📥 Recebido POST webhook:', JSON.stringify(data));

    if (data.action === 'addTicket' && data.ticket) {
      const ticket = data.ticket;
      
      // Adicionar nova linha na planilha
      const row = [
        ticket.id || '',
        ticket.type || '',
        ticket.status || 'open',
        ticket.title || '',
        ticket.description || '',
        ticket.city || '',
        ticket.base || '',
        ticket.contactName || '',
        ticket.contactEmail || '',
        ticket.priority || 'low',
        JSON.stringify(ticket.items ? JSON.parse(ticket.items) : []),
        ticket.midLocation || '',
        ticket.midMaterialType || '',
        ticket.itemCategory || '',
        ticket.adminObservations || '',
        ticket.adminPhotoUrl || '',
        ticket.deadlineVisit || '',
        ticket.deadlineQuote || '',
        ticket.deadlineDelivery || '',
        ticket.deadlinePickup || '',
        ticket.createdAt || new Date().toISOString()
      ];

      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      
      // Se não tem header, adiciona
      if (sheet.getRange(1, 1).getValue() === '') {
        addHeaders(sheet);
      }

      // Adiciona nova linha
      sheet.appendRow(row);
      Logger.log('✅ Ticket #' + ticket.id + ' adicionado à planilha');

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Ticket adicionado com sucesso'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Ação não reconhecida'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Erro em doPost:', error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Adicionar headers na planilha
 */
function addHeaders(sheet) {
  const headers = [
    'ID',
    'Tipo',
    'Status',
    'Título',
    'Descrição',
    'Cidade',
    'Base',
    'Nome Solicitante',
    'E-mail Contato',
    'Prioridade',
    'Itens (JSON)',
    'MID Localização',
    'MID Tipo Material',
    'Categoria Compra',
    'Observações Admin',
    'Foto URL',
    'Prazo Visita',
    'Prazo Orçamento',
    'Prazo Entrega',
    'Prazo Busca (MID)',
    'Data Criação'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatação básica do header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#007e7a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  
  Logger.log('✅ Headers adicionados');
}

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

  // Criar novo trigger a cada 5 minutos (opcional)
  ScriptApp.newTrigger('syncFromAPI')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('✅ Triggers configurados');
}

/**
 * Sincronizar dados da API para a planilha (opcional, a cada 5 min)
 */
function syncFromAPI() {
  try {
    Logger.log('🔄 Sincronizando tickets...');
    
    const apiUrl = 'https://seu-replit-url.replit.dev/api/tickets';
    
    const options = {
      method: 'get',
      muteHttpExceptions: true,
      timeout: 30
    };

    const response = UrlFetchApp.fetch(apiUrl, options);
    
    if (response.getResponseCode() !== 200) {
      Logger.log('⚠️ Erro na API: ' + response.getResponseCode());
      return;
    }

    const tickets = JSON.parse(response.getContentText());
    Logger.log('📊 Recebidos ' + tickets.length + ' tickets');

    // Atualizar planilha
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Limpar dados (manter header)
    if (sheet.getMaxRows() > 1) {
      sheet.deleteRows(2, sheet.getMaxRows() - 1);
    }

    // Adicionar headers se não existir
    if (sheet.getRange(1, 1).getValue() === '') {
      addHeaders(sheet);
    }

    // Adicionar dados
    if (tickets.length > 0) {
      const data = tickets.map(ticket => [
        ticket.id || '',
        ticket.type || '',
        ticket.status || 'open',
        ticket.title || '',
        ticket.description || '',
        ticket.city || '',
        ticket.base || '',
        ticket.contactName || '',
        ticket.contactEmail || '',
        ticket.priority || 'low',
        JSON.stringify(ticket.items ? JSON.parse(ticket.items) : []),
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

      sheet.getRange(2, 1, data.length, 21).setValues(data);
      Logger.log('✅ ' + data.length + ' tickets sincronizados');
    }

  } catch (error) {
    Logger.log('❌ Erro em syncFromAPI: ' + error.toString());
  }
}

/**
 * Formatar data
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  } catch (e) {
    return dateString;
  }
}

/**
 * Testar webhook (execute para debugar)
 */
function testWebhook() {
  const testData = {
    action: 'addTicket',
    ticket: {
      id: 999,
      type: 'Compras',
      status: 'open',
      title: 'Teste Webhook',
      description: 'Teste do Apps Script V2',
      city: 'São Luís',
      base: 'Base Porto',
      contactName: 'Teste',
      contactEmail: 'teste@teste.com',
      priority: 'high',
      items: '["Item 1", "Item 2"]',
      midLocation: '',
      midMaterialType: '',
      itemCategory: 'EPIs',
      adminObservations: '',
      adminPhotoUrl: '',
      deadlineVisit: '',
      deadlineQuote: '',
      deadlineDelivery: '',
      deadlinePickup: '',
      createdAt: new Date().toISOString()
    }
  };

  // Simular POST
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log('📋 Resultado do teste:', result.getContent());
}

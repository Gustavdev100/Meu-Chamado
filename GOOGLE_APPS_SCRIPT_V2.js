/**
 * Google Apps Script para Meu Chamado - Vale S.A. (V2 - CORRIGIDO)
 * Sincronização robusta com Sheets
 */

const SPREADSHEET_ID = '11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk';
const SHEET_NAME = 'Tickets';

/**
 * Webhook receiver - recebe POST de tickets novos
 */
function doPost(e) {
  try {
    Logger.log('📥 Recebido POST');
    
    if (!e.postData || !e.postData.contents) {
      Logger.log('❌ Sem dados no POST');
      return createErrorResponse('Sem dados');
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      Logger.log('❌ Erro ao parsear JSON: ' + parseErr);
      return createErrorResponse('JSON inválido');
    }

    Logger.log('✅ Dados recebidos: ' + JSON.stringify(data).substring(0, 100));

    if (!data.ticket) {
      Logger.log('❌ Sem campo ticket');
      return createErrorResponse('Sem campo ticket');
    }

    const ticket = data.ticket;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // Verificar/criar headers
    if (!sheet.getRange(1, 1).getValue()) {
      addHeaders(sheet);
    }

    // Montar linha
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
      formatItems(ticket.items),
      ticket.midLocation || '',
      ticket.midMaterialType || '',
      ticket.itemCategory || '',
      ticket.adminObservations || '',
      ticket.adminPhotoUrl || '',
      ticket.deadlineVisit || '',
      ticket.deadlineQuote || '',
      ticket.deadlineDelivery || '',
      ticket.deadlinePickup || '',
      ticket.createdAt || ''
    ];

    // Adicionar linha
    sheet.appendRow(row);
    Logger.log('✅ Ticket #' + ticket.id + ' adicionado');

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Ticket #' + ticket.id + ' sincronizado'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Erro em doPost: ' + error);
    return createErrorResponse(error.toString());
  }
}

/**
 * Formatar items field
 */
function formatItems(items) {
  if (!items) return '';
  
  // Se já é string JSON, retorna como está
  if (typeof items === 'string') {
    if (items.startsWith('[')) {
      return items; // Já é JSON
    }
    return items; // Retorna como string simples
  }
  
  // Se é array, converte para JSON
  if (Array.isArray(items)) {
    return JSON.stringify(items);
  }
  
  return '';
}

/**
 * Resposta de erro
 */
function createErrorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: msg
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Adicionar headers na planilha
 */
function addHeaders(sheet) {
  try {
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

    // Formatação
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#007e7a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    Logger.log('✅ Headers criados');
  } catch (error) {
    Logger.log('⚠️ Erro ao criar headers: ' + error);
  }
}

/**
 * Configurar triggers (execute UMA VEZ)
 */
function setupTriggers() {
  try {
    // Remover triggers antigos
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'syncFromAPI') {
        ScriptApp.deleteTrigger(trigger);
      }
    });

    // Novo trigger a cada 5 minutos
    ScriptApp.newTrigger('syncFromAPI')
      .timeBased()
      .everyMinutes(5)
      .create();

    Logger.log('✅ Triggers configurados');
  } catch (error) {
    Logger.log('❌ Erro ao setup triggers: ' + error);
  }
}

/**
 * Sincronizar API a cada 5 minutos (opcional)
 */
function syncFromAPI() {
  try {
    Logger.log('🔄 Sincronizando...');
    
    // Adicionar sua URL do Replit aqui:
    const apiUrl = 'https://seu-replit-url.replit.dev/api/tickets';

    const options = {
      method: 'get',
      muteHttpExceptions: true,
      timeout: 30
    };

    const response = UrlFetchApp.fetch(apiUrl, options);

    if (response.getResponseCode() !== 200) {
      Logger.log('⚠️ API retornou: ' + response.getResponseCode());
      return;
    }

    const tickets = JSON.parse(response.getContentText());
    Logger.log('📊 ' + tickets.length + ' tickets');

  } catch (error) {
    Logger.log('❌ Erro em sync: ' + error);
  }
}

/**
 * TESTAR WEBHOOK (execute para debugar)
 */
function testWebhook() {
  const testData = {
    action: 'addTicket',
    ticket: {
      id: 999,
      type: 'Compras',
      status: 'open',
      title: 'Teste Webhook V2',
      description: 'Testando sincronização',
      city: 'São Luís',
      base: 'Base Porto',
      contactName: 'Teste',
      contactEmail: 'teste@teste.com',
      priority: 'high',
      items: '["Item A", "Item B"]',
      itemCategory: 'EPIs',
      createdAt: new Date().toISOString()
    }
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log('📋 Resultado: ' + result.getContent());
}

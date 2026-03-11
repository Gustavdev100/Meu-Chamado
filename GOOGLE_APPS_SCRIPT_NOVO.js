/**
 * Google Apps Script - Meu Chamado Vale S.A.
 * NOVO - Simples e Robusto
 * 
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets
 * 2. Extensões → Apps Script
 * 3. Copie TODO este código para Code.gs
 * 4. Salve (Ctrl+S)
 * 5. Execute: runFirst() uma vez
 */

// ⚙️ CONFIGURE AQUI:
const SPREADSHEET_ID = 'COLE_O_ID_DA_SUA_PLANILHA_AQUI';
const SHEET_NAME = 'Sheet1';  // Mude se tiver nome diferente

/**
 * Execute PRIMEIRA VEZ apenas
 */
function runFirst() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const firstCell = sheet.getRange(1, 1).getValue();
  
  if (!firstCell || firstCell !== 'ID') {
    Logger.log('❌ Headers não encontrados!');
    Logger.log('Adicione os headers na linha 1 manualmente');
    return;
  }
  
  Logger.log('✅ Planilha pronta!');
}

/**
 * WEBHOOK - recebe tickets do backend
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return resposta(false, 'Sem dados');
    }

    const data = JSON.parse(e.postData.contents);
    if (!data.ticket) {
      return resposta(false, 'Sem ticket');
    }

    const t = data.ticket;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // Montar linha com 21 colunas
    const row = [
      t.id || '',
      t.type || '',
      t.status || 'open',
      t.title || '',
      t.description || '',
      t.city || '',
      t.base || '',
      t.contactName || '',
      t.contactEmail || '',
      t.priority || 'low',
      t.items || '',
      t.midLocation || '',
      t.midMaterialType || '',
      t.itemCategory || '',
      t.adminObservations || '',
      t.adminPhotoUrl || '',
      t.deadlineVisit || '',
      t.deadlineQuote || '',
      t.deadlineDelivery || '',
      t.deadlinePickup || '',
      t.createdAt || ''
    ];

    // Adicionar
    sheet.appendRow(row);
    Logger.log('✅ Ticket #' + t.id + ' OK');

    return resposta(true, 'Ticket #' + t.id + ' sincronizado');

  } catch (error) {
    Logger.log('❌ Erro: ' + error);
    return resposta(false, error.toString());
  }
}

/**
 * Resposta padrão
 */
function resposta(sucesso, msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ success: sucesso, message: msg })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * TESTAR - execute para debugar
 */
function teste() {
  const ticketTeste = {
    action: 'addTicket',
    ticket: {
      id: 999,
      type: 'Compras',
      status: 'open',
      title: 'Teste de Sincronização',
      description: 'Testando novo Apps Script',
      city: 'São Luís',
      base: 'Base Porto',
      contactName: 'Teste',
      contactEmail: 'teste@teste.com',
      priority: 'high',
      items: '["Item 1"]',
      itemCategory: 'EPIs',
      createdAt: new Date().toISOString()
    }
  };

  const e = {
    postData: {
      contents: JSON.stringify(ticketTeste)
    }
  };

  const resultado = doPost(e);
  Logger.log('Resultado: ' + resultado.getContent());
}

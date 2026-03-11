/**
 * Google Apps Script - Meu Chamado Vale S.A.
 * VERSÃO CORRIGIDA - COM TRATAMENTO DE ERROS
 */

const SPREADSHEET_ID = '1Rf-1Se4wTUry4Nu7cZJKSyw6j8rU21FysafSiwWVNYA';

/**
 * Obter a primeira aba automaticamente
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    if (sheets.length === 0) {
      Logger.log('❌ Nenhuma aba encontrada na planilha');
      return null;
    }
    
    return sheets[0]; // Primeira aba
  } catch (error) {
    Logger.log('❌ Erro ao abrir planilha: ' + error);
    return null;
  }
}

/**
 * Execute PRIMEIRA VEZ apenas
 */
function runFirst() {
  const sheet = getSheet();
  
  if (!sheet) {
    Logger.log('❌ Não conseguiu acessar a planilha');
    return;
  }
  
  const firstCell = sheet.getRange(1, 1).getValue();
  
  if (!firstCell || firstCell !== 'ID') {
    Logger.log('⚠️ Headers não encontrados na linha 1');
    Logger.log('✅ Mas a planilha está acessível!');
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
    const sheet = getSheet();
    
    if (!sheet) {
      return resposta(false, 'Erro ao acessar planilha');
    }

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
    Logger.log('✅ Ticket #' + t.id + ' sincronizado');

    return resposta(true, 'Ticket #' + t.id + ' sincronizado');

  } catch (error) {
    Logger.log('❌ Erro em doPost: ' + error);
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
  Logger.log('🧪 Iniciando teste...');
  
  const sheet = getSheet();
  if (!sheet) {
    Logger.log('❌ Não conseguiu acessar a planilha');
    return;
  }
  
  Logger.log('✅ Planilha acessada: ' + sheet.getName());
  
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
  Logger.log('📋 Resultado: ' + resultado.getContent());
}

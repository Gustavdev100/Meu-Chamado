# Como Implantar o Google Apps Script

## Passo 1: Abrir Apps Script

1. Abra sua planilha do Google Sheets
2. Clique em **"Extensões"** (no menu superior)
3. Clique em **"Apps Script"**
4. Uma nova aba abrirá com o editor de código

## Passo 2: Copiar o Código

1. Abra o arquivo `GOOGLE_APPS_SCRIPT.js` neste projeto
2. Copie **TODO o código** (Ctrl+A, Ctrl+C)
3. No editor do Apps Script, limpe o código padrão
4. Cole o código completo (Ctrl+V)
5. **Salve** (Ctrl+S)

## Passo 3: Configurar o Script

No topo do código, você vê:

```javascript
const SPREADSHEET_ID = '11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk'; // Sua planilha
const SHEET_NAME = 'Tickets';
const REPLIT_API_URL = 'https://meu-chamado-vale.replit.dev'; // Mude para sua URL do Replit
```

**Substitua:**
- `SPREADSHEET_ID`: Coloque o ID da sua planilha (já está correto)
- `REPLIT_API_URL`: Coloque a URL do seu Replit (ex: `https://seu-replit.replit.dev`)

## Passo 4: Configurar Triggers (Sincronização Automática)

1. No editor do Apps Script, clique no botão **"Executar"** (ou ▶️)
2. Selecione a função `setupTriggers`
3. Clique em "Executar"
4. **Autorize** as permissões quando solicitado
5. Pronto! Agora a sincronização acontecerá a cada 5 minutos

## Passo 5: Testar

1. No seu formulário (Meu Chamado), **envie um novo ticket**
2. Espere até 5 minutos
3. Atualize sua planilha do Google Sheets
4. **Os dados devem aparecer automaticamente!**

Se quiser testar imediatamente:
1. No Apps Script, selecione a função `testSync`
2. Clique "Executar"
3. Veja os logs clicando em "Logs de execução"

## Logs e Monitoramento

Para ver o que está acontecendo:
1. Clique em **"Logs de execução"** (abaixo do editor)
2. Verá mensagens como:
   - ✅ Sincronização concluída!
   - 📊 Recebidos 3 tickets da API
   - ❌ Erro: [mensagem de erro]

## Solução de Problemas

### "Erro: Permissão Negada"
- Certifique-se de que você é o DONO da planilha
- Faça login com a conta correta do Google

### "Erro: Script inválido"
- Verifique se copiou todo o código
- Salve novamente (Ctrl+S)

### "Não aparecem dados"
- Verifique se a URL do Replit está correta
- Execute `testSync()` manualmente
- Veja os logs para mensagens de erro

### "Planilha vazia após sincronização"
- A planilha foi LIMPA e reescrita com dados da API
- É assim que funciona: sempre sincroniza do servidor

## Segurança (Opcional)

Se quiser adicionar segurança com chave de API:
1. No código, descomente `const API_KEY = 'sua-chave-api-aqui'`
2. Gere uma chave no seu backend
3. O script enviará a chave em cada requisição

## URL do Webhook (Para o Backend)

Se quiser que cada novo ticket seja adicionado em tempo real (sem esperar 5 minutos):

1. No Apps Script, execute a função `getWebhookUrl()`
2. Veja os logs - a URL estará lá
3. Copie e guarde essa URL
4. O backend pode chamar essa URL quando um novo ticket for criado

Exemplo:
```
https://script.google.com/macros/d/1A2B3C4D5E6F7G8H9I0J/usercripts
```

## Próximos Passos

✅ Planilha sincronizando automaticamente
✅ Dados atualizando a cada 5 minutos
✅ Webhook disponível para sincronização em tempo real

Agora todos os tickets do Meu Chamado estarão na sua planilha do Google Sheets!

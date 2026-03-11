# ✅ SETUP NOVO - PASSO A PASSO

## 🎯 O Que Fazer

### PASSO 1️⃣: Criar Planilha
1. Vá para: https://sheets.google.com
2. "Criar" → "Planilha em branco"
3. Nome: **Meu Chamado**
4. Clique em "Criar"

### PASSO 2️⃣: Adicionar Headers
1. Clique na célula **A1**
2. Cole exatamente:
```
ID	Tipo	Status	Título	Descrição	Cidade	Base	Nome Solicitante	E-mail Contato	Prioridade	Itens	MID Localização	MID Tipo Material	Categoria Compra	Observações Admin	Foto URL	Prazo Visita	Prazo Orçamento	Prazo Entrega	Prazo Busca	Data Criação
```
3. Pressione ENTER

### PASSO 3️⃣: Copiar ID da Planilha
Na URL da planilha, está assim:
```
https://docs.google.com/spreadsheets/d/1abc2def3ghi4jkl5mno6pqr7stu8vwx/edit
```

**Copie**: `1abc2def3ghi4jkl5mno6pqr7stu8vwx`

### PASSO 4️⃣: Criar Apps Script
1. Na sua planilha
2. Clique "Extensões" → "Apps Script"
3. Nova aba abre

### PASSO 5️⃣: Instalar Script
1. Abra o arquivo: `GOOGLE_APPS_SCRIPT_NOVO.js` (aqui)
2. Copie TODO o código
3. No Apps Script, **substitua tudo** em "Code.gs"
4. **Salve** (Ctrl+S)

### PASSO 6️⃣: Configurar ID
No topo do script, achará:
```javascript
const SPREADSHEET_ID = 'COLE_O_ID_DA_SUA_PLANILHA_AQUI';
```

**Substitua** por seu ID. Fica:
```javascript
const SPREADSHEET_ID = '1abc2def3ghi4jkl5mno6pqr7stu8vwx';
```

**Salve** (Ctrl+S)

### PASSO 7️⃣: Executar Primeira Vez
1. Selecione a função: `runFirst`
2. Clique "Executar" (▶️)
3. Deve aparecer: `✅ Planilha pronta!`

### PASSO 8️⃣: Deploy como Web App
1. Clique em "Deploy" (canto superior direito)
2. Clique em "+ Nova implantação"
3. Type: **Web app**
4. Execute como: Sua conta
5. Dar acesso a: **Qualquer pessoa**
6. Clique "Implantar"
7. **Copie a URL que aparecer**

---

## 🔗 URL do Webhook

Depois do deploy, você terá uma URL assim:
```
https://script.google.com/macros/s/AKfycby...xyzabc/usercripts
```

**Essa é a URL do webhook!**

---

## 🆔 Próximo Passo

Me passa:
- ✅ ID da planilha
- ✅ URL do webhook (depois do deploy)

E eu vou atualizar o backend para sincronizar com sua planilha nova!

---

## 🧪 Testar

Depois de tudo pronto:
1. No Apps Script, selecione função: `teste`
2. Clique "Executar" (▶️)
3. Veja "Logs de execução"
4. Procure por: `✅ Ticket #999 OK`
5. Se aparecer → **Funciona!**

---

## ✅ Checklist

- [ ] Criei planilha em branco
- [ ] Colei headers na linha 1
- [ ] Copiei o ID da planilha
- [ ] Criei Apps Script
- [ ] Colei o código GOOGLE_APPS_SCRIPT_NOVO.js
- [ ] Substitui o SPREADSHEET_ID
- [ ] Executei runFirst()
- [ ] Fiz o deploy como Web App
- [ ] Testei com teste()
- [ ] Copiei a URL do webhook

**Pronto para sincronizar!** 🚀

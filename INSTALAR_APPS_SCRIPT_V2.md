# 🔧 Instalar Google Apps Script V2 (Corrigido)

## 🆘 Problema Anterior
O Apps Script retornava **erro 500** ao sincronizar. A versão nova corrige isso!

## ✅ 3 Passos Para Instalar

### 1️⃣ Abrir Apps Script
- Abra sua planilha: https://docs.google.com/spreadsheets/d/11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk
- Clique em **Extensões → Apps Script**

### 2️⃣ Substituir o Código
- Abra o arquivo `GOOGLE_APPS_SCRIPT_V2.js` deste projeto
- Copie TODO o código
- No Apps Script, limpe tudo em "Code.gs"
- Cole o novo código
- **Salve** (Ctrl+S)

### 3️⃣ Executar Setup
- Selecione a função `setupTriggers`
- Clique em **"Executar"** (botão ▶️)
- **Autorize** quando pedir permissão
- Pronto! ✅

---

## 🧪 Testar

### Opção A: Testar no Apps Script
1. Selecione a função `testWebhook`
2. Clique em "Executar"
3. Veja os logs (clique em "Logs de execução")
4. Deve aparecer:
   ```
   ✅ Ticket #999 adicionado à planilha
   ```

### Opção B: Enviar um Ticket Real
1. Abra http://localhost:5000
2. Preencha o formulário
3. Clique "Enviar Agora"
4. Verifique a planilha
5. **Deve aparecer uma nova linha!**

---

## 📊 O Que Mudou

### Versão 1 (com erro)
- ❌ Limpava toda a planilha
- ❌ Erro ao escrever dados

### Versão 2 (corrigida)
- ✅ Apenas **adiciona** novas linhas
- ✅ Sem limpar dados antigos
- ✅ Headers automáticos
- ✅ Formatação bonita
- ✅ Tratamento de erros melhor

---

## 📋 Estrutura Esperada

Os campos sincronizados na ordem:

1. ID
2. Tipo (Compras, MID, Chamados)
3. Status (open, in_progress, closed)
4. Título
5. Descrição
6. Cidade
7. Base
8. Nome Solicitante
9. E-mail Contato
10. Prioridade (low, medium, high)
11. Itens (JSON)
12. MID Localização
13. MID Tipo Material
14. Categoria Compra
15. Observações Admin
16. Foto URL
17. Prazo Visita
18. Prazo Orçamento
19. Prazo Entrega
20. Prazo Busca (MID)
21. Data Criação

---

## 🆘 Se Continuar com Erro

1. **Veja os logs do Apps Script**
   - Clique em "Logs de execução"
   - Procure por `❌ Erro`

2. **Execute testWebhook()**
   - Isso testa sem depender do backend
   - Se funcionar, o problema está no backend
   - Se não funcionar, o problema está no Apps Script

3. **Verifique a planilha**
   - Confirme que tem a aba "Tickets"
   - Nenhuma proteção de linhas
   - Sua conta tem acesso

---

## 🎯 Próximo Passo

Depois que instalar:
1. ✅ Teste com `testWebhook()`
2. ✅ Envie um ticket real
3. ✅ Confirme que aparece na planilha

**Sistema estará 100% funcional!** 🚀

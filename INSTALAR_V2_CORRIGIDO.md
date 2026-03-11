# ✅ Google Apps Script V2 - CORRIGIDO

## 🎯 O Que Foi Corrigido

✅ Tratamento robusto de items (não faz double-parse)
✅ Melhor tratamento de erros
✅ Logs detalhados para debugar
✅ Código simples e estável

---

## 🚀 INSTALAR AGORA

### 1️⃣ Abrir Apps Script
Vá para sua planilha:
```
https://docs.google.com/spreadsheets/d/11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk
```
→ Clique em **Extensões → Apps Script**

### 2️⃣ Copiar Código V2 Corrigido
- Abra o arquivo: `GOOGLE_APPS_SCRIPT_V2.js` (aqui no projeto)
- Copie TODO o código (Ctrl+A, Ctrl+C)
- Cole no Apps Script, substituindo tudo (Ctrl+A, Ctrl+V)
- **Salve** (Ctrl+S)

### 3️⃣ Executar Setup (UMA VEZ)
1. Selecione a função: `setupTriggers`
2. Clique no botão **"Executar"** (▶️)
3. Google vai pedir autorização → **Autorize**
4. Pronto! ✅

---

## 🧪 TESTAR AGORA

### Opção A: Teste Rápido no Apps Script
1. Selecione a função: `testWebhook`
2. Clique **"Executar"** (▶️)
3. Abra "Logs de execução" (clique em ↓ no bottom)
4. Procure por: `✅ Ticket #999 adicionado`
5. Se aparecer → **Funciona!** ✨

### Opção B: Teste Real no Formulário
1. Abra: http://localhost:5000
2. Clique em "Enviar Solicitação"
3. Escolha **Compras**
4. Preencha:
   - Nome: SEU NOME
   - E-mail: seu@email.com
   - Cidade: São Luís
   - Base: Base Porto
   - Categoria: EPIs
   - Itens: Adicione 1 item qualquer
5. Clique **"Enviar Agora"**
6. Verifique sua planilha
7. **Nova linha deve aparecer!** 🎉

---

## 📊 Estrutura de Dados

Os campos na ordem correta:

```
1. ID
2. Tipo (Compras, MID, Chamados)
3. Status
4. Título
5. Descrição
6. Cidade
7. Base
8. Nome Solicitante
9. E-mail Contato
10. Prioridade
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
```

---

## 🆘 Se Ainda Tiver Erro

### 1️⃣ Veja os Logs do Apps Script
1. Abra o Apps Script
2. Clique em **"Logs de execução"**
3. Procure por `❌` para ver erros
4. Cole a mensagem de erro aqui

### 2️⃣ Execute testWebhook()
- Se funcionar, o problema é com os dados do backend
- Se não funcionar, o problema é o Apps Script

### 3️⃣ Verifique a Planilha
- Ela tem a aba "Tickets"?
- Tem proteção de linhas?
- Você tem acesso total?

---

## ✅ Checklist Final

- [ ] Copiei o código V2 no Apps Script
- [ ] Executei setupTriggers()
- [ ] Autorizei as permissões
- [ ] Testei com testWebhook()
- [ ] Vi a linha de teste aparecer
- [ ] Enviei um ticket real
- [ ] Apareceu na planilha

**Se tudo marcado → Sistema está 100% funcional!** 🚀

---

## 📞 Próximo Passo

Depois que funcionar:
1. ✅ Publicar no Replit (use deploy)
2. ✅ Compartilhar com a equipe
3. ✅ Começar a receber solicitações!


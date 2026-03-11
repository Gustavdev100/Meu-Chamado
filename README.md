# 🎯 Meu Chamado - Vale S.A.

Sistema de gerenciamento de solicitações corporativo para Vale S.A., com sincronização automática com Google Sheets.

## ✅ Status: PRONTO PARA USO

- ✅ Sistema funcionando em produção
- ✅ Google Sheets sincronizado em tempo real
- ✅ Interface corporativa e responsiva
- ✅ 3 tipos de tickets (Compras, MID, Chamados)
- ✅ Painel administrativo protegido
- ✅ Rastreamento por e-mail

---

## 🚀 Acesso Rápido

### 📝 Enviar Solicitação
Acesse: **`http://localhost:5000`** (ou sua URL do Replit)

1. Clique em **"Enviar Solicitação"**
2. Escolha o tipo: Compras, MID ou Chamados
3. Preencha o formulário
4. Clique em **"Enviar Agora"**
5. ✅ Dados sincronizados automaticamente com sua planilha!

### 📊 Google Sheets
Planilha: `https://docs.google.com/spreadsheets/d/11lVsyjg-NRXBgg_-l4b9gb_3Uck4fTcC3RG9jSDRUzk`

### 🔐 Painel Admin
- URL: `http://localhost:5000` → Clique em "Admin"
- Senha: `admin123`
- Funcionalidades:
  - Editar observações
  - Adicionar fotos/anexos
  - Definir prazos
  - Gerenciar status

### 🔍 Rastrear Solicitação
- URL: `http://localhost:5000` → Clique em "Rastrear"
- Digite seu e-mail corporativo
- Veja status, prazos e observações

---

## 🏗️ Arquitetura

```
Meu Chamado
├── Frontend (HTML + CSS + JavaScript Puro)
│   ├── client/index.html         → SPA única
│   ├── client/styles.css         → Design corporativo
│   ├── client/script.js          → Lógica JavaScript
│   └── client/config.js          → Configurações
│
├── Backend (Express.js + TypeScript)
│   ├── server/index.ts           → Servidor Express
│   ├── server/routes.ts          → API endpoints
│   ├── server/storage.ts         → Abstração de dados
│   ├── server/db.ts              → Drizzle ORM
│   ├── server/vite.ts            → Dev server
│   └── server/sheets.ts          → Google Sheets (futuro)
│
├── Banco de Dados
│   ├── PostgreSQL (Replit)       → Dados primários
│   ├── Google Sheets             → Backup/Relatório
│   └── Google Apps Script        → Sincronização
│
└── Shared
    ├── shared/schema.ts          → Drizzle schema
    └── shared/routes.ts          → API definitions
```

---

## 📋 Tipos de Solicitações

### 🛒 Compras
- **Campos**: Categoria, Lista de itens (até 6)
- **Prazos**: Visita Técnica, Orçamento, Entrega
- **Exemplo**: Solicitar EPIs, ferramentas, materiais

### ♻️ MID (Descarte)
- **Campos**: Localização, Tipo de resíduo, Lista de itens (até 10)
- **Prazo**: Busca de materiais
- **Exemplo**: Descartar sucata, resíduos perigosos

### 🎧 Chamados
- **Campos**: Descrição geral
- **Prazos**: Visita Técnica, Orçamento, Entrega
- **Exemplo**: Manutenção, suporte técnico, reparos

---

## 🔌 Sincronização Google Sheets

### Como Funciona

1. **Usuário envia solicitação** → Clica "Enviar Agora"
2. **Backend salva no PostgreSQL** → ID 1, 2, 3...
3. **Backend chama webhook** → Google Apps Script recebe dados
4. **Google Sheets atualiza** → Linha adicionada automaticamente ✨

### URL do Webhook

```
https://script.google.com/macros/s/AKfycby26kTIpKed3ErNvvOUDlvVS2h1DooFnaUxXIUXARjXk09RM6Xj9RKN1dYuGpYhtqvRzA/exec
```

### Configuração

O webhook já está configurado em `.env.local`:
```env
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycby26k...
```

### Monitoramento

Veja os logs do servidor:
```
[webhook] ✅ Ticket #1 sincronizado com Google Sheets
[webhook] ✅ Ticket #2 sincronizado com Google Sheets
```

---

## 🎨 Design Corporativo

### Cores Vale S.A.
- **Verde Primário**: `#007e7a`
- **Ouro Secundário**: `#ffc20e`

### Features
- ✨ Animações suaves
- 📱 100% responsivo
- 🌙 Cores corporativas
- 🎯 UX intuitivo
- ⚡ Carregamento rápido

---

## 📊 Campos de Ticket

| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID | Number | Auto-incremental |
| Tipo | Text | Compras, MID, Chamados |
| Status | Text | open, in_progress, closed |
| Título | Text | Gerado automaticamente |
| Descrição | Text | Detalhes da solicitação |
| Cidade | Text | São Luís, Bacabeira, etc |
| Base | Text | Base específica da cidade |
| Nome Solicitante | Text | Quem enviou |
| E-mail Contato | Text | Para rastreamento |
| Prioridade | Text | low, medium, high |
| Itens (JSON) | Text | Array de itens |
| Observações Admin | Text | Notas da equipe |
| Foto URL | Text | Anexos/evidências |
| Prazos | DateTime | Visita, Orçamento, Entrega, Busca |
| Data Criação | DateTime | Timestamp |

---

## 🔐 Segurança

### Produção (Recomendado)

1. **Trocar senha do admin**
   - Arquivo: `client/script.js`
   - Procure: `const adminPassword = "admin123"`
   - Mude para uma senha forte

2. **Ativar HTTPS**
   - Replit usa HTTPS automaticamente
   - URL: `https://seu-replit.replit.dev`

3. **Validar e-mails**
   - Backend valida formato de e-mail
   - Frontend tem validação HTML5

4. **Rate Limiting**
   - Implementar no Express (futuro)
   - Proteção contra spam

---

## 📱 Recursos

- ✅ Formulário dinâmico baseado em tipo
- ✅ Validação de campos customizada
- ✅ Sincronização em tempo real
- ✅ Rastreamento por e-mail
- ✅ Edição de tickets (Admin)
- ✅ Upload de fotos/anexos
- ✅ Definição de prazos
- ✅ Observações internas
- ✅ Status tracking
- ✅ Relatório em planilha

---

## 🛠️ Tecnologias

### Frontend
- HTML5
- CSS3 (Corporativo, 100% responsivo)
- JavaScript Vanilla (Sem frameworks!)

### Backend
- Node.js
- Express.js
- TypeScript
- Drizzle ORM

### Banco de Dados
- PostgreSQL (Replit)
- Google Sheets (via Apps Script)

### Integração
- Google Apps Script
- Google Sheets API (futuro)

---

## 📈 Próximas Melhorias

- [ ] Exportar relatórios em PDF
- [ ] Notificações por email
- [ ] Integração com Slack
- [ ] Autenticação (OAuth/SAML)
- [ ] Sincronização bidirecional
- [ ] Dashboard com gráficos
- [ ] Sistema de permissões
- [ ] Auditoria de alterações

---

## 🆘 Troubleshooting

### "Planilha não atualiza?"
1. Verifique os logs do servidor: `[webhook]`
2. Confirme a URL em `.env.local`
3. Teste: `curl https://script.google.com/macros/s/AKfycby...`

### "Erro ao enviar ticket?"
1. Verifique a validação no formulário
2. Veja os logs: `[express] POST /api/tickets`
3. Confirme se preencheu todos os campos obrigatórios

### "Admin password não funciona?"
1. Confirme a senha em `client/script.js`
2. Padrão: `admin123`
3. Digite corretamente (case-sensitive)

---

## 📞 Suporte

**Erros comuns:**
- Campo obrigatório vazio → Preencha todos os `*`
- Webhook lento → Normal (até 10 segundos)
- Planilha limpa ao sincronizar → Comportamento esperado

**Logs úteis:**
```bash
# Terminal do Replit
[express] POST /api/tickets 201
[webhook] ✅ Ticket #1 sincronizado
```

```javascript
// Console do navegador
✅ Sistema Meu Chamado Iniciado
📊 Google Sheets Integrado: 11lVsyjg...
```

---

## 🎉 Próximas Ações

1. ✅ Teste o sistema em produção
2. ✅ Convide os usuários a usar
3. ✅ Monitore os logs
4. ✅ Recolha feedback
5. ✅ Implemente melhorias

---

**Sistema Meu Chamado** | Vale S.A. | Desenvolvido em Replit | 2026


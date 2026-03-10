# Meu Chamado - Vale S.A.

## Visão Geral
Sistema de gerenciamento de solicitações para Vale S.A. com suporte a 3 tipos de tickets: Compras, MID (Descarte) e Chamados.

### Tecnologia
- **Frontend**: HTML + CSS + JavaScript Puro (Vanilla)
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Replit) + Google Sheets (integração)
- **Cores**: Vale Verde (#007e7a) + Ouro (#ffc20e)

## Estrutura do Projeto

```
/client
  ├── index.html       (SPA única)
  ├── styles.css       (Design corporativo)
  └── script.js        (Lógica JavaScript)

/server
  ├── index.ts         (Express setup)
  ├── routes.ts        (API endpoints)
  ├── storage.ts       (Abstração de storage)
  ├── db.ts            (Drizzle ORM)
  └── vite.ts          (Dev server)

/shared
  ├── schema.ts        (Drizzle schema)
  └── routes.ts        (API definitions)
```

## Recuros Implementados

### 1. Formulário Público
- Seleção de tipo (Compras, MID, Chamados)
- Formulário dinâmico baseado no tipo
- Validação de cidade/base
- Itens dinâmicos (Compras até 6, MID até 10)
- Interface corporativa com animações

### 2. Rastreamento
- Busca por e-mail corporativo
- Exibição de status, prazos e observações admin
- Suporte a múltiplos chamados por e-mail

### 3. Painel Admin
- Autenticação com senha (admin123)
- Editar observações, fotos, prazos
- Gerenciar status de tickets
- Interface corporativa

## Campos de Ticket

### Campos Básicos
- `id`: Número (auto-incremental)
- `type`: Compras | MID | Chamados
- `status`: open | in_progress | closed
- `title`: Título (gerado automaticamente)
- `description`: Descrição textual
- `priority`: low | medium | high
- `createdAt`: Timestamp

### Localização
- `city`: São Luís, Bacabeira, Açailândia, Santa Inês, Alto Alegre, Vitória do Mearim
- `base`: Base específica da cidade

### Contato
- `contactName`: Nome do solicitante
- `contactEmail`: E-mail corporativo (usado para rastreamento)

### Tipo: MID (Descarte)
- `midLocation`: Onde estão os materiais
- `midMaterialType`: Tipo principal de resíduo
- `items`: JSON com lista de itens (até 10)
- `deadlinePickup`: Prazo para busca

### Tipo: Compras
- `itemCategory`: Categoria da compra
- `items`: JSON com lista de itens (até 6)
- `deadlineVisit`: Prazo visita técnica
- `deadlineQuote`: Prazo aprovação orçamento
- `deadlineDelivery`: Prazo entrega

### Tipo: Chamados
- `deadlineVisit`: Prazo visita técnica
- `deadlineQuote`: Prazo aprovação orçamento
- `deadlineDelivery`: Prazo entrega

### Admin
- `adminObservations`: Observações da equipe
- `adminPhotoUrl`: URL da foto/anexo

## Integração Google Sheets

### Status
⚠️ **Pendente de Autorização**: O Google Sheets foi rejeitado pelo usuário.

### Próximos Passos
1. Ver arquivo `GOOGLE_SHEETS_SETUP.md` para instruções de setup
2. Criar planilha no Google Sheets seguindo o template
3. Quando autorizar Google Sheets, o sistema sincronizará automaticamente

### Alternativas
- Continuar usando PostgreSQL (Replit Database)
- Usar Google Sheets com credenciais de serviço (arquivo JSON)

## Senhas e Credenciais

- **Admin Password**: `admin123` (hardcoded em client/script.js - mudar em produção!)
- **Google Sheets**: Pendente (quando autorizar)

## Fluxo de Dados

```
Cliente (HTML/JS)
  ↓
  ├→ POST /api/tickets (Enviar solicitação)
  ├→ GET /api/tickets (Rastrear por e-mail)
  └→ PUT /api/tickets/:id (Admin: editar)
  ↓
Express Server
  ↓
PostgreSQL Database
  ├→ Leitura/Escrita de tickets
  └→ [Futura] Sincronização com Google Sheets
```

## Senhas de Teste
- Admin: `admin123`

## Notas de Desenvolvimento

### Ajustes Necessários em Produção
1. [ ] Mudar senha do admin para algo mais seguro
2. [ ] Implementar autenticação de verdade (JWT, OAuth, etc)
3. [ ] Validar e-mails com regex mais rigoroso
4. [ ] Limpar dados sensíveis antes de produção
5. [ ] Configurar CORS corretamente
6. [ ] Adicionar rate limiting
7. [ ] Implementar logging adequado

### Google Sheets (Quando Autorizado)
- Será usado como backup/relatório em tempo real
- Sistema continuará funcionando com PostgreSQL
- Sincronização bidirecional (opcional)

### Cores Corporativas
- Primary Verde: `#007e7a` (--primary)
- Secondary Ouro: `#ffc20e` (--secondary)
- Background: `#f5f7fa` (--bg)

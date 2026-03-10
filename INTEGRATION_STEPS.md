# Integração Google Sheets - Passos

## Atual: PostgreSQL + Opção Google Sheets

O sistema **continua funcionando perfeitamente com PostgreSQL**. Google Sheets é OPCIONAL.

## Para Integrar Google Sheets:

### 1️⃣ Criar a Planilha
- Acesse [Google Sheets](https://sheets.google.com)
- Crie uma nova planilha chamada **"Meu Chamado - Vale S.A."**
- Copie as colunas do arquivo `GOOGLE_SHEETS_SETUP.md`

### 2️⃣ Autorizar no Meu Chamado
- Volte para o app (http://localhost:5000)
- Procure por "Configurações" (será adicionado na próxima release)
- Clique "Conectar Google Sheets"
- Autorize o acesso

### 3️⃣ Configurar Variável de Ambiente
```bash
GOOGLE_SHEETS_ID=copie_aqui_o_id_da_planilha
```

### 4️⃣ Pronto!
- Todos os tickets serão sincronizados com a planilha
- Também continuarão no PostgreSQL (backup)

## IDs da Planilha
- URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
- O ID é a sequência de caracteres após `/d/` e antes de `/edit`

## Estrutura da Planilha

### Aba 1: "Tickets"
Todas as colunas definidas em `GOOGLE_SHEETS_SETUP.md`

### Aba 2: "Configurações" (Opcional)
Você pode criar uma aba para armazenar prazos padrão, templates, etc.

## Suporte

Se tiver problemas:
1. Verifique se o ID da planilha está correto
2. Verifique se as colunas estão exatamente iguais
3. Confira se o Google Drive tem espaço disponível
4. Veja os logs do servidor (terminal)

## Voltar para PostgreSQL

Se quiser voltar a usar **apenas PostgreSQL**:
1. Remova a variável `GOOGLE_SHEETS_ID`
2. Reinicie o app
3. Tudo continua funcionando normalmente

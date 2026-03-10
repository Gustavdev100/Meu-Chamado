# Como Linkar Google Sheets ao Meu Chamado

## Passo 1: Criar a Planilha do Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em **"+ Nova planilha em branco"**
3. Renomeie para: **"Meu Chamado - Vale S.A."**

## Passo 2: Configurar as Colunas

Na primeira aba (renomeie para "Tickets"), crie as seguintes colunas (em ordem):

| Coluna | Nome | Tipo |
|--------|------|------|
| A | ID | Número |
| B | Tipo | Texto (Compras / MID / Chamados) |
| C | Status | Texto (open / in_progress / closed) |
| D | Título | Texto |
| E | Descrição | Texto |
| F | Cidade | Texto |
| G | Base | Texto |
| H | Nome Solicitante | Texto |
| I | E-mail Contato | Texto |
| J | Prioridade | Texto (low / medium / high) |
| K | Itens (JSON) | Texto |
| L | MID Localização | Texto |
| M | MID Tipo Material | Texto |
| N | Categoria Compra | Texto |
| O | Observações Admin | Texto |
| P | Foto URL | Texto |
| Q | Prazo Visita | Data/Hora |
| R | Prazo Orçamento | Data/Hora |
| S | Prazo Entrega | Data/Hora |
| T | Prazo Busca (MID) | Data/Hora |
| U | Data Criação | Data/Hora |

## Passo 3: Adicionar Permissões

1. Clique em **"Compartilhar"** no canto superior direito
2. Copie o **ID da planilha** da URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
3. Defina as permissões para "Qualquer um com o link"

## Passo 4: Configurar no Meu Chamado

Quando aparecer a opção de autorizar Google Sheets, clique e complete o fluxo de autorização. Depois, copie o ID da planilha na página de configurações do Meu Chamado.

## IDs de Exemplo

- **ID da Planilha**: `1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P`
- **Nome da Aba**: `Tickets`

Pronto! Seus tickets serão sincronizados em tempo real com a planilha.

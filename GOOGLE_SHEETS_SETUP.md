# Integração Google Sheets — Central Completa de Qualificação de Leads (Meta Ads)

Esta planilha atua como **CRM de Primeira Linha** e **Banco de Dados de Públicos da Meta**. 
Ela armazena automaticamente **24 campos de dados enriquecidos** a cada conversão na Landing Page.

---

## Como Usar para Gestão de Públicos (Qualificados vs Desqualificados)

* **Coluna B (Status):** Possui um menu seletor:
  * `QUALIFICADO` (Fale com ele, tem poder aquisitivo ou perfil de compra).
  * `DESQUALIFICADO` (Curioso, sem perfil, procurava aluguel barato, sem renda).
* **Criar Público de Exclusão na Meta:**
  1. Filtre a planilha por `Status = DESQUALIFICADO`.
  2. Copie a **Coluna G (Telefone Meta E.164)** e a **Coluna D/E (Nome/Sobrenome)**.
  3. No Gerenciador de Públicos da Meta, crie um **Público Personalizado de Lista de Clientes** e selecione esse público para **EXCLUIR** dos seus conjuntos de anúncios. Você para de queimar verba com perfis indesejados!
* **Criar Público Semelhante (Lookalike de Alta Conversão):**
  1. Filtre por `Status = QUALIFICADO`.
  2. Suba a lista na Meta e gere um **Lookalike 1% e 2%**. O algoritmo passará a buscar pessoas idênticas aos seus compradores reais!
* **Auditoria de Criativo Vencedor:**
  1. A **Coluna I (Anúncio / utm_content)** mostra o anúncio exato que o cliente clicou (ex: `AD03_IMG`), permitindo saber qual criativo traz mais clientes qualificados vs curiosos.

---

## Código Atualizado do Google Apps Script (24 Colunas Automáticas)

No seu Google Sheets, vá em **Extensões** → **Apps Script**, substitua o código existente por este e clique no disquete (Salvar):

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var headers = [
      "Data/Hora",
      "Status",
      "Nome Completo",
      "Primeiro Nome (Meta)",
      "Sobrenome (Meta)",
      "WhatsApp (Contato)",
      "Telefone Meta (E.164)",
      "Imóvel",
      "Anúncio (utm_content)",
      "Campanha (utm_campaign)",
      "Origem Mídia (utm_source)",
      "Canal Mídia (utm_medium)",
      "Termo (utm_term)",
      "Origem no Site",
      "Tempo na Página",
      "Rolagem Máxima",
      "Abriu Galeria",
      "Viu Valor",
      "Dispositivo / App",
      "Cidade",
      "Estado",
      "IP",
      "Facebook Click ID (fbclid)",
      "URL de Acesso"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#751d4b");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.data_hora || new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      data.status || "A CLASSIFICAR",
      data.nome || "",
      data.primeiro_nome || "",
      data.sobrenome || "",
      data.whatsapp || "",
      data.telefone_meta || "",
      data.imovel || "Apartamento V416 (Bombas)",
      data.utm_content || "",
      data.utm_campaign || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_term || "",
      data.origem_clique || data.origem || "site",
      data.tempo_pagina || "",
      data.rolagem || "",
      data.viu_galeria || "",
      data.viu_valor || "",
      data.dispositivo || "",
      data.cidade || "",
      data.estado || "",
      data.ip || "",
      data.fbclid || "",
      data.url || ""
    ];
    
    sheet.appendRow(row);
    
    // Regra de Validação de Dados na Coluna B (Status)
    var lastRow = sheet.getLastRow();
    var cellStatus = sheet.getRange(lastRow, 2);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["QUALIFICADO", "DESQUALIFICADO", "A CLASSIFICAR"], true)
      .setAllowInvalid(false)
      .build();
    cellStatus.setDataValidation(rule);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

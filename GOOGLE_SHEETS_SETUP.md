# Integração Google Sheets — Central de Leads com Rastreamento de IP e Detecção de Bot

Esta planilha atua como **CRM de Primeira Linha**, **Detector de Bot/IP Repetido** e **Banco de Dados de Públicos da Meta**. 
Ela armazena automaticamente **25 campos de dados enriquecidos**, destacando o **IP Real** e alertando se o mesmo IP está enviando múltiplos formulários.

---

## Recursos Anti-Bot e Qualificação:
1. **Coluna C (IP Real do Visitante):** Capturado diretamente da conexão na borda do Cloudflare (`CF-Connecting-IP`).
2. **Coluna D (Alerta Bot / Frequência):** 
   * Se for a 1ª vez do IP: `✅ Único (1º envio)` em verde.
   * Se o mesmo IP já enviou antes: `⚠️ REPETIDO (X vezes) - Possível Bot!` destacado em amarelo/laranja.
3. **Coluna B (Status):** Dropdown com `QUALIFICADO`, `DESQUALIFICADO`, `A CLASSIFICAR`.

---

## Código do Google Apps Script (Cole no seu Apps Script)

No Google Sheets, abra **Extensões** → **Apps Script**, substitua todo o código por este e clique no disquete (Salvar):

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var headers = [
      "Data/Hora",
      "Status",
      "IP Real do Visitante",
      "Alerta Bot / Frequência",
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
    var ipCliente = String(data.ip || "").trim();
    
    // Contagem de repetições de IP para detecção automática de BOT
    var repeticoes = 1;
    var alertaBot = "✅ Único (1º envio)";
    if (ipCliente && ipCliente !== "Não detectado") {
      var allRows = sheet.getDataRange().getValues();
      for (var i = 1; i < allRows.length; i++) {
        if (allRows[i][2] && String(allRows[i][2]).trim() === ipCliente) {
          repeticoes++;
        }
      }
      if (repeticoes > 1) {
        alertaBot = "⚠️ REPETIDO (" + repeticoes + "x) - Possível Bot!";
      }
    }
    
    var row = [
      data.data_hora || new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      data.status || "A CLASSIFICAR",
      ipCliente || "Não detectado",
      alertaBot,
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
      data.fbclid || "",
      data.url || ""
    ];
    
    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    
    // Menu Dropdown na Coluna B (Status)
    var cellStatus = sheet.getRange(lastRow, 2);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["QUALIFICADO", "DESQUALIFICADO", "A CLASSIFICAR"], true)
      .setAllowInvalid(false)
      .build();
    cellStatus.setDataValidation(rule);
    
    // Destaque visual na Coluna D (Alerta Bot)
    var cellAlerta = sheet.getRange(lastRow, 4);
    if (repeticoes > 1) {
      cellAlerta.setBackground("#fff2cc").setFontColor("#b45f06").setFontWeight("bold");
    } else {
      cellAlerta.setBackground("#eaf7ee").setFontColor("#0f7a3e");
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", row: lastRow, ip: ipCliente, repeticoes: repeticoes }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

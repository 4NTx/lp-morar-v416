# Integração com Google Sheets (Central de Leads Automática)

Cada formulário preenchido na Landing Page envia os dados instantaneamente para uma planilha do Google Sheets através do Cloudflare Pages (Functions).

---

## Passo 1: Criar a Planilha e o Apps Script

1. Acesse [sheets.new](https://sheets.new) para abrir uma nova planilha do Google Sheets.
2. Dê um nome para a planilha, por exemplo: `Leads - Morar Imóveis (V416)`.
3. No menu superior, clique em: **Extensões** → **Apps Script**.
4. Apague qualquer código existente no editor e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Se a primeira linha estiver vazia, cria os cabeçalhos automaticamente
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Data/Hora", "Nome", "WhatsApp", "Imóvel", "Origem do Clique", "Localização (IP)", "Link da Página"]);
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#751d4b");
      headerRange.setFontColor("#ffffff");
    }
    
    var data = JSON.parse(e.postData.contents);
    var localizacao = (data.cidade ? data.cidade + " - " : "") + (data.estado || "");
    
    sheet.appendRow([
      data.data_hora || new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      data.nome || "",
      data.whatsapp || "",
      data.imovel || "Apartamento V416 (Bombas)",
      data.origem || "site",
      localizacao || "Brasil",
      data.url || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Passo 2: Implantar como Web App

1. No canto superior direito do Apps Script, clique no botão azul **Implantar** (Deploy) → **Nova implantação** (New deployment).
2. Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha **App da Web** (Web app).
3. Preencha as configurações:
   * **Descrição:** `Webhook Leads Morar Imóveis`
   * **Executar como:** `Eu` (sua conta Google)
   * **Quem pode acessar:** `Qualquer pessoa` (Anyone) *(essencial para o Cloudflare conseguir enviar os dados sem login)*
4. Clique em **Implantar**.
5. Autorize o acesso com sua conta Google (se o Google exibir tela de aviso, clique em *Avançado* → *Acessar script*).
6. Copie a **URL do app da Web** gerada (começa com `https://script.google.com/macros/s/.../exec`).

---

## Passo 3: Adicionar a URL no Cloudflare Pages

1. Acesse o painel da Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers e Pages** → selecione o projeto `lp-morar-v416`.
3. Vá na aba **Settings** (Configurações) → **Variables and Secrets** (Variáveis e Segredos).
4. Clique em **Add** (Adicionar variável):
   * **Nome da variável:** `GOOGLE_SHEETS_WEBHOOK`
   * **Valor:** *(Cole a URL do Apps Script que você copiou no Passo 2)*
5. Clique em **Save** (Salvar).

Pronto! A partir desse momento, cada novo lead preenchido na página cairá na planilha em tempo real e de forma 100% segura.

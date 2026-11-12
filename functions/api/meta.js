// POST /api/meta — recebe o evento da página e manda para a API de Conversões da Meta.
// Roda no Cloudflare Pages (Functions). O repositório é público: o token NÃO fica no
// código, fica na variável META_CAPI_TOKEN do projeto no Cloudflare (tipo "Secret").
//
// Variáveis no Cloudflare (Settings → Variables and Secrets):
//   META_CAPI_TOKEN        obrigatório — token da API de Conversões
//   META_TEST_EVENT_CODE   opcional — código da aba "Testar eventos"; apague depois do teste
//   META_GRAPH_VERSION     opcional — padrão v24.0

const PIXEL = "1381890313989473";
const EVENTOS = new Set(["ViewContent", "Lead", "VerValor", "VerFotos", "Engajado"]);

async function sha256(texto) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// Regra da Meta para cidade/estado/país: minúsculo, sem acento, sem espaço nem pontuação.
const normal = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export async function onRequestPost({ request, env }) {
  const aqui = new URL(request.url);
  const origem = request.headers.get("Origin");
  if (origem && new URL(origem).host !== aqui.host) return new Response("origem", { status: 403 });

  let b;
  try { b = await request.json(); } catch { return new Response("json", { status: 400 }); }
  if (!EVENTOS.has(b.event_name) || typeof b.event_id !== "string" || b.event_id.length > 80)
    return new Response("evento", { status: 400 });

  // 1. Envia para a Planilha do Google Sheets (se GOOGLE_SHEETS_WEBHOOK estiver configurado)
  const sheetsWebhook = env.GOOGLE_SHEETS_WEBHOOK;
  if (b.event_name === "Lead" && sheetsWebhook) {
    try {
      const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      fetch(sheetsWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data_hora: agora,
          nome: b.name || "",
          whatsapp: b.phone || "",
          imovel: "Apartamento Bombas V416 (R$ 900.000)",
          origem: b.custom_data?.content_category || "site",
          url: b.url || aqui.href,
          ip: request.headers.get("CF-Connecting-IP") || "",
          cidade: request.cf?.city || "",
          estado: request.cf?.regionCode || ""
        }),
      }).catch(() => {});
    } catch (e) {}
  }

  // 2. Envia para a API de Conversões da Meta (se token configurado)
  const token = env.META_CAPI_TOKEN;
  if (!token) return new Response("ok (sheets only)", { status: 200 });

  const user_data = {
    client_ip_address: request.headers.get("CF-Connecting-IP") || undefined,
    client_user_agent: request.headers.get("User-Agent") || undefined,
  };
  if (b.fbp) user_data.fbp = String(b.fbp).slice(0, 200);
  if (b.fbc) user_data.fbc = String(b.fbc).slice(0, 500);
  if (b.external_id) user_data.external_id = [await sha256(String(b.external_id).slice(0, 100))];
  // Localização aproximada que o Cloudflare já sabe do visitante: melhora a correspondência.
  const cf = request.cf || {};
  if (cf.city) user_data.ct = [await sha256(normal(cf.city))];
  if (cf.regionCode) user_data.st = [await sha256(normal(cf.regionCode))];
  if (cf.country) user_data.country = [await sha256(normal(cf.country))];

  // Dados do Lead para elevar a nota de correspondência (Match Quality) da Meta
  if (b.phone) {
    const rawTel = String(b.phone).replace(/\D/g, "");
    const ddiTel = rawTel.startsWith("55") ? rawTel : "55" + rawTel;
    user_data.ph = [await sha256(ddiTel)];
  }
  if (b.name) {
    const fn = normal(String(b.name).trim().split(/\s+/)[0]);
    if (fn) user_data.fn = [await sha256(fn)];
  }

  let url = aqui.origin + "/";
  try { const u = new URL(b.url); if (u.host === aqui.host) url = u.href; } catch {}

  const custom_data = b.custom_data && typeof b.custom_data === "object" ? b.custom_data : {};
  const corpo = {
    data: [{
      event_name: b.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: b.event_id,
      event_source_url: url,
      action_source: "website",
      user_data,
      custom_data,
    }],
  };
  if (env.META_TEST_EVENT_CODE) corpo.test_event_code = env.META_TEST_EVENT_CODE;

  const versao = env.META_GRAPH_VERSION || "v24.0";
  const r = await fetch(`https://graph.facebook.com/${versao}/${PIXEL}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (r.ok) return new Response("ok");
  return new Response((await r.text()).slice(0, 300), { status: 502 });
}

export const onRequest = () => new Response("use POST", { status: 405 });

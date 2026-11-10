# LP · Morar Imóveis · Apartamento V416 (Bombas, Bombinhas/SC)

Landing page estática do apartamento V416, pronta para o Cloudflare Pages
(plano gratuito, endereço `*.pages.dev`, sem o domínio da Morar).

## Estrutura

- `index.html` — a página inteira (estilos e scripts dentro dela)
- `img/` — logo e fotos (webp, com versão menor para celular)
- `_headers` — cache longo das fotos no Cloudflare

Não tem build: o Cloudflare publica a pasta como está.

## Subir no Cloudflare Pages

1. dash.cloudflare.com → Workers e Pages → Criar → Pages → Conectar ao Git
2. Escolha o repositório `lp-morar-v416`
3. Configuração do build:
   - Framework: **Nenhum**
   - Comando de build: **(vazio)**
   - Diretório de saída: **/**
4. Salvar e implantar. O endereço sai como `lp-morar-v416.pages.dev`.

Cada `git push` na branch `main` publica de novo sozinho.

## Rastreamento Meta (Pixel + API de Conversões)

Pixel `1381890313989473`. Cada evento sai pelo navegador (Pixel) e pelo servidor
(`functions/api/meta.js`, que o Cloudflare Pages roda sozinho), com o mesmo
`event_id`: a Meta junta os dois e não conta em dobro.

| Evento | Quando dispara | Para que serve |
|---|---|---|
| PageView | abriu a página | base de todo público |
| ViewContent | 1,5 s depois de abrir (V416, R$ 900 mil) | remarketing de quem viu o imóvel |
| VerFotos | abriu a galeria ampliada | interesse no imóvel |
| VerValor | metade da seção de valor apareceu | interesse de compra |
| Engajado | 45 s com a aba aberta e metade da página lida | visitante qualificado |
| Lead | clicou em qualquer botão de WhatsApp (uma vez por visita) | conversão da LP; `content_category` diz qual botão |

A LP não tem formulário: o contato é o WhatsApp. Por isso o Lead é o clique, e
não há e-mail nem telefone para mandar à Meta; a correspondência sai de fbp,
fbc, IP, navegador, cidade/estado do visitante e um id anônimo do visitante.

**O token NÃO fica no código (o repositório é público).** No Cloudflare:
Workers e Pages → `lp-morar-v416` → Settings → Variables and Secrets → Add:

- `META_CAPI_TOKEN` (tipo **Secret**): o token da API de Conversões
- `META_TEST_EVENT_CODE` (opcional): o código da aba "Testar eventos" do
  Gerenciador de Eventos, para ver os eventos chegando; **apague depois do teste**

Depois de salvar, faça um novo deploy (Deployments → Retry deployment) para
a variável valer.

## Trocar o WhatsApp

No fim do `index.html`, variável `WA_NUMBER` (DDI + DDD + número, só dígitos).
Hoje: 554733691251.

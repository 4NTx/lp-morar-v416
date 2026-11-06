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

## Trocar o WhatsApp

No fim do `index.html`, variável `WA_NUMBER` (DDI + DDD + número, só dígitos).
Hoje: 554733691251.

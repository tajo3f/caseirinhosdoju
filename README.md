# Caseirinhos do Ju — V23

Site oficial do **Caseirinhos do Ju** (pães, biscoitos, casadinhos e esfirras
artesanais). Projeto estático em **HTML + CSS + JavaScript puro**, com build em
**Node.js** e deploy em **GitHub + Vercel**. Sem framework, sem banco de dados,
sem serviços pagos.

- Produção: <https://caseirinhosdoju.com.br>
- WhatsApp: +55 27 99651-1588 (`wa.me/5527996511588`)
- Instagram: [@caseirinhos.doju](https://www.instagram.com/caseirinhos.doju/)

---

## Requisitos

- Node.js **24.x** (ver `package.json` → `engines`)

## Comandos

```bash
node scripts/build.mjs            # gera dist/ (saída oficial de deploy)
node scripts/build.mjs --emit-root  # gera dist/ e sincroniza artefatos na raiz
node scripts/serve.mjs            # pré-visualiza dist/ em http://localhost:4173
npm test                          # build + validações + testes de disponibilidade
npm run check                     # checagem de sintaxe dos JS
```

## Deploy (Vercel)

- Framework Preset: **Other**
- Build Command: `node scripts/build.mjs`
- Output Directory: `dist`
- Node: **24.x**

O `vercel.json` já define build, output, cabeçalhos de segurança e cache.

---

## Estrutura

```
index.html                 página inicial (fonte)
404.html / offline.html    páginas de erro e modo offline (autossuficientes)
manifest.webmanifest       PWA
robots.txt                 diretivas de rastreamento
sitemap.xml                gerado no build (.nojekyll na raiz p/ GitHub Pages)
sw.js                      service worker (cache versionado em build)
package.json / vercel.json configuração
data/
  precos.json              FONTE CENTRAL DE PREÇOS
  catalog.json             produtos, imagens, sabores, redirects
scripts/
  build.mjs                build: catálogo, páginas de produto, sitemap, robots
  serve.mjs                servidor estático de pré-visualização
templates/
  product-page.html        template das páginas de produto
  redirect.html            template de redirecionamento de slug antigo
tests/
  validate-catalog.mjs     valida dados/preços
  availability.test.mjs    regras de dia/horário (node:test)
  validate-dist.mjs        auditoria do build (links, canonical, sitemap, segredos)
assets/
  css/                     base, components, sections, product-page, v23
  js/                      catalog-data (gerado), availability, app, ui, vfx, product-page
  images/  icons/
produtos/<slug>/index.html páginas de produto (geradas)
```

> `dist/` é a saída de build e **não** deve ser editada à mão. Edite as fontes e
> rode `node scripts/build.mjs`.

---

## Como alterar preços

1. Edite `data/precos.json` (somente valores).
2. Rode `node scripts/build.mjs`.

O build regenera `assets/js/catalog-data.js`, as páginas de produto, o JSON-LD
e o sitemap. Nenhum preço é duplicado em HTML/JS.

## Como adicionar um produto

1. Adicione a imagem em `assets/images/` (preferencialmente `.webp`).
2. Registre o preço em `data/precos.json`.
3. Adicione o produto em `data/catalog.json` (com `image`, `imageWidth`,
   `imageHeight` e `options[].priceKey`).
4. Rode `node scripts/build.mjs`. A página, o sitemap e o catálogo são gerados.

## Regras comerciais (não alterar sem necessidade)

- **Esfirras abertas** (combos e doces): quinta, sexta e sábado, **18h30–22h**
  (horário de Brasília). Fora do período, o site bloqueia o pedido direto e
  mostra a próxima abertura.
- **Pães doce e de sal e cebola**: pedido direto no fim de semana; nos outros
  dias, apenas solicitação de encomenda.
- **Pão de Hambúrguer Caseiro**: valor sob consulta.
- **Esfirras doces**: quantidade de unidades por opção confirmada com o Ju.

A fonte única dessas regras é `assets/js/availability.js`, usada pela home,
carrinho, modal e páginas de produto.

---

## Qualidade e segurança

- [`CHANGELOG-V23.md`](CHANGELOG-V23.md) — tudo o que mudou em relação à V22.
- [`SECURITY-AUDIT-V23.md`](SECURITY-AUDIT-V23.md) — auditoria de segurança e cabeçalhos.
- [`QA-V23.md`](QA-V23.md) — testes executados e resultados verificados.

---

## Crédito

Site desenvolvido por **TAJO Digital 3F** (crédito mantido apenas no rodapé).

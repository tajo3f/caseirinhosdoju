# CHANGELOG — Caseirinhos do Ju V23

Base: **V22** (o pacote recebido continha apenas o site já compilado, sem o
sistema de build). Todas as funcionalidades comerciais foram preservadas.
Nenhum preço, produto, telefone, Instagram ou domínio foi inventado ou alterado.

---

## 1. Sistema de build reconstruído

O ZIP da V22 não trazia `package.json`, `vercel.json`, `scripts/`, `data/`,
`templates/` nem `tests/`. Foi criada uma base oficial e resiliente:

- `scripts/build.mjs` — gera `dist/` com: cópia de `assets/`, páginas de produto,
  `catalog-data.js`, `sitemap.xml` (com `lastmod`), `robots.txt`, `.nojekyll` e
  `sw.js` com versão de cache calculada por hash do conteúdo.
- `data/precos.json` — **fonte central de preços** (nenhum preço duplicado).
- `data/catalog.json` — produtos, imagens (com largura/altura reais), sabores e
  redirects de slug antigo.
- `templates/product-page.html` e `templates/redirect.html`.
- `scripts/serve.mjs` — pré-visualização local sem dependências.
- `tests/` — validação de catálogo, regras de disponibilidade e auditoria do build.
- Build resiliente: se um preço ou imagem estiver ausente, o build falha com
  mensagem clara (em vez de quebrar o deploy silenciosamente).
- Flag `--emit-root`: sincroniza os artefatos gerados na raiz para permitir abrir
  o projeto sem build.

## 2. Preços e catálogo

- Preços centralizados em `data/precos.json` (22 chaves) e resolvidos no build.
- Catálogo gerado a partir de `data/catalog.json` (fim da duplicação manual).
- **Confirmado ausente** de catálogo, busca, JSON, sitemap e páginas:
  *Amanteigado de Coco com Chocolate* e *Amanteigado de Maracujá Puro*.
- Mantidos: Goiabinha, Ninho com Chocolate, Maracujá com Chocolate, Casadinho,
  Pão Doce, Pão de Sal e Cebola, Pão de Hambúrguer, Combos, Coca-Cola 1,5L e
  Esfirras Doces. A opção **Esfirra Mista** permanece entre os sabores salgados.
- Redirect do slug antigo `casadinho-maracuja-chocolate` passou a ser gerado
  pelo build (antes era um arquivo órfão mantido à mão).

## 3. Fontes (correção de erro real)

- `style.css` declarava `font-family:Inter,...` mas a fonte **nunca era
  carregada** (sem `@font-face` e sem link externo). A pilha foi corrigida para
  uma stack de sistema de alta qualidade — **zero requisições externas, zero
  CLS por fonte** — mantendo serifa de destaque para títulos (`--font-display`).

## 4. CSS reorganizado (13 → 5 arquivos)

- `base.css` (style + vfx + upgrade), `components.css` (v12–v16),
  `sections.css` (v18–v22), `product-page.css` e `v23.css`.
- A concatenação preserva **exatamente** a ordem de cascata original; nenhuma
  regra foi reescrita ou removida.
- O `<style>` inline das páginas de produto foi extraído para
  `assets/css/product-page.css`, permitindo **CSP sem `unsafe-inline`** nessas
  páginas.
- Nova camada `v23.css`: foco visível, contraste AA, impressão, telas de 320px
  e correções de header.

## 5. JavaScript

- 5 arquivos de UI (`v14-ui`, `v15-ui`, `v16-ui`, `v19-ui`, `v20-ui`) unificados
  em `assets/js/ui.js`, preservando a ordem de execução.
- Removida a função morta `initSchema()` (o JSON-LD agora é estático no HTML).
- `renderProducts()` passou a usar `imageWidth`/`imageHeight` reais do catálogo
  (antes todas as imagens eram marcadas como 1000×1000, causando distorção/CLS).
- Microcopy do painel de disponibilidade ajustada.

## 6. Responsividade

- Corrigido **overflow horizontal de ~88px** no header entre ~1251px e ~1480px
  (o bloco promocional do header agora cede espaço antes do menu/CTA/carrinho).
- Validação por navegador real (Chromium) em 16 larguras, de 320px a 1600px:
  **nenhum overflow horizontal**.
- Header mobile confirmado: menu à esquerda, logo centralizada, carrinho à
  direita, sticky e respeitando `safe-area-inset`.

## 7. Imagens

- Largura/altura intrínsecas corrigidas por produto (verificado nos arquivos
  reais): goiabinha/ninho/casadinho = 900×1200, maracujá = 1254×1254,
  pães = 1200×1200, embalagem = 675×1200. Isso elimina CLS e distorção.
- Removido SVG órfão `esfirras-doces-ilustracao.svg` (não referenciado).

## 8. SEO e dados estruturados

- JSON-LD `Organization` + `WebSite` na home (nome, URL, logo, Instagram,
  WhatsApp/telefone, `areaServed`, `sameAs`).
- JSON-LD `Product` + `BreadcrumbList` em cada página de produto.
- `canonical` única e exata em todas as páginas indexáveis.
- `sitemap.xml` com `lastmod` consistente; `robots.txt` revisado.
- Páginas 404 e offline redesenhadas, com fallback de WhatsApp e `noindex`.

## 9. PWA / Service Worker

- Corrigido: o `sw.js` anterior **não listava** `v22.css` no precache — CSS novo
  não era servido offline. Agora a lista cobre os 5 CSS e todos os JS.
- Versão de cache gerada por hash no build (`__CACHE_VERSION__` → hash real),
  evitando cache preso.
- `manifest.webmanifest` revisado: `id`, `scope`, `lang`, `categories`,
  `shortcuts` e `purpose: any` (sem `maskable`, pois não há ícone maskable
  dedicado — evita recorte do logo).

## 10. Segurança

- `vercel.json` com CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP` e regras de cache.
- CSP via `<meta>` nas páginas (defesa em profundidade).
- 3 ocorrências de `rel="noopener"` sem `noreferrer` corrigidas para
  `rel="noopener noreferrer"`.

## 11. Testes automatizados

- `tests/validate-catalog.mjs` — produtos, preços e ausência de itens removidos.
- `tests/availability.test.mjs` — 8 testes de regras de dia/horário (Brasília).
- `tests/validate-dist.mjs` — links internos, canonical, sitemap, ausência de
  `eval`/`document.write`, varredura de segredos e validação do catálogo gerado.
- Auditoria de navegador (Chromium) do layout, do carrinho/checkout, da busca e
  de acessibilidade básica.

## 12. O que NÃO mudou (identidade da marca)

- Nome **Caseirinhos do Ju**, domínio **caseirinhosdoju.com.br**,
  WhatsApp **5527996511588**, Instagram **@caseirinhos.doju**.
- Crédito **TAJO Digital 3F** apenas no rodapé.
- Stack: HTML + CSS + JS puro; Node.js somente para build. Sem Python,
  Next.js, banco de dados ou dependências extras.

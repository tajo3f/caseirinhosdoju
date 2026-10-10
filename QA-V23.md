# QA — Caseirinhos do Ju V23

Registro de qualidade da versão 23. Todos os itens abaixo foram **executados**
sobre o build real (`dist/`), não apenas inspecionados por leitura de código.

**Ambiente de teste**
- Node.js **v24.21.0**
- Chromium **153.0.8010.12** (via Playwright, headless)
- Sistema de arquivos local (`/tmp`), servidor estático próprio (`scripts/serve.mjs`)

---

## 1. Testes automatizados (`npm test`)

```
[build] ok · 10 produtos · 11 pastas de produto · versão de cache 5468dde1fd29

validate-catalog
  ✓ 10 produtos válidos
  ✓ 22 preços resolvidos
  ✓ nenhum produto removido (coco/maracujá puro)

node:test (availability)
  ✓ esfirras: quinta 19h (Brasília) liberado
  ✓ esfirras: quinta 17h (Brasília) bloqueado
  ✓ esfirras: quinta 22h30 (Brasília) bloqueado
  ✓ esfirras: segunda-feira bloqueado
  ✓ pães: sábado liberado, quarta bloqueado
  ✓ produto sob consulta nunca permite pedido direto
  ✓ produto regular é sempre adicionável
  ✓ kind() classifica produtos do catálogo
  ℹ tests 8 · pass 8 · fail 0

validate-dist
  ✓ links internos OK em 14 páginas HTML
  ✓ canonical única e exata em todas as páginas
  ✓ sitemap consistente (11 URLs)
  ✓ nenhum produto removido no build
  ✓ sem eval / new Function / document.write
  ✓ nenhum segredo detectado
  ✓ catálogo gerado válido (v23.0, 10 produtos)

validate-dist: tudo certo.
```

Resultado: **0 falhas**. 8/8 testes de disponibilidade, 3/3 suítes de validação.

## 2. Verificação de sintaxe (`npm run check`)

`node --check` aplicado a `scripts/build.mjs`, `catalog-data.js`,
`availability.js`, `app.js`, `ui.js`, `vfx.js`, `product-page.js` e `sw.js`.
Resultado: **sem erros de sintaxe**.

## 3. Auditoria em navegador real (Chromium)

### 3.1 Overflow horizontal — 16 larguras

| Largura | Resultado |
|---------|-----------|
| 320 / 360 / 375 / 390 / 430 px | ✅ sem overflow |
| 600 / 768 / 900 / 1024 / 1180 px | ✅ sem overflow |
| 1280 / 1300 / 1366 / 1400 / 1440 / 1600 px | ✅ sem overflow |
| 1090 / 1100 / 1101 / 1150 / 1250 / 1251 px | ✅ sem overflow |

Páginas testadas por largura: home, combos de esfirras, amanteigado de goiabinha
e esfirras doces. Nenhum `scrollWidth` acima do viewport.

> Durante a auditoria foi detectado e corrigido um overflow de ~88px no header
> entre 1251px e 1480px (menu desktop + CTA + carrinho sem espaço para o bloco
> promocional). Após a correção, todas as larguras passaram.

### 3.2 Header mobile (390px)
- ✅ menu à esquerda, logo centralizada, carrinho à direita
- ✅ menu abre ao clique e fecha com `Esc`
- ✅ sem overflow

### 3.3 Carrinho e checkout
- ✅ adicionar produto incrementa o contador do header (0 → 1)
- ✅ subtotal correto (`R$ 15,00`)
- ✅ gaveta do carrinho abre
- ✅ checkout abre e a validação exibe erro com campos vazios
- ✅ nenhum erro de console em todo o fluxo

### 3.4 Busca e filtros
- ✅ "goiabinha" → 1 resultado
- ✅ "coco" → 0 resultados (produto removido, confirmado)
- ✅ "maracujá puro" → 0 resultados (produto removido, confirmado)
- ✅ "maracujá" → encontra o Amanteigado de Maracujá com Chocolate
- ✅ categorias presentes: Todos, Amanteigados, Casadinhos, Pães, Esfirras, Bebidas

### 3.5 Acessibilidade básica
- ✅ todo botão tem nome acessível (texto, `aria-label` ou `title`)
- ✅ todo campo tem rótulo (`label for`, `label` envolvente ou `aria-label`)
- ✅ exatamente um `<h1>` por página
- ✅ `lang="pt-BR"` em todas as páginas
- ✅ toda imagem tem `alt`
- ✅ `aria-live` no status de disponibilidade e no contador de resultados

### 3.6 Páginas de produto
- ✅ produto regular: CTA "Pedir pelo WhatsApp" com link `wa.me/5527996511588`
- ✅ produto sob consulta: CTA "Consultar pelo WhatsApp"
- ✅ combos refletem o estado real de disponibilidade ("Pedidos indisponíveis"
  fora de quinta–sábado, 18h30–22h)

---

## 4. Verificações de conteúdo e integridade

- ✅ 10 produtos, 22 preços, 11 páginas de produto (10 reais + 1 redirect)
- ✅ preços idênticos à V22 (nenhum valor alterado)
- ✅ `Amanteigado de Coco com Chocolate` e `Amanteigado de Maracujá Puro`
  ausentes de catálogo, busca, JSON-LD, sitemap e páginas
- ✅ `Esfirra Mista` presente entre os sabores
- ✅ redirect `casadinho-maracuja-chocolate` → `amanteigado-maracuja-chocolate`
- ✅ 14 páginas HTML com canonical única; sitemap com 11 URLs consistentes
- ✅ nenhum segredo, `eval`, `new Function` ou `document.write` no build
- ✅ nenhum SVG órfão; nenhum link local quebrado

## 5. Não testado / limitações

- **Leitor de tela real** (NVDA/VoiceOver) não foi executado — a acessibilidade
  foi validada por regras automatizadas (nomes, rótulos, estrutura, `lang`).
- **Lighthouse / PageSpeed** não foi executado neste ambiente; as otimizações
  aplicadas são verificáveis (fontes de sistema, dimensões de imagem corretas,
  preload, `loading="lazy"`, cache imutável de assets).
- **Deploy real na Vercel** não foi disparado; `vercel.json` foi validado
  estruturalmente (JSON válido, `buildCommand`/`outputDirectory` corretos).
- **Safari/iOS real** não testado; o Chromium headless cobre a lógica, mas não
  substitui um dispositivo físico.

## 6. Como reproduzir

```bash
npm install        # sem dependências externas; apenas valida o package.json
npm test           # build + todas as validações automatizadas
npm run check      # sintaxe dos JS
npm run preview    # build + servidor local em http://localhost:4173
```

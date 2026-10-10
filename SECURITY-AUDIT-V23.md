# SECURITY AUDIT — Caseirinhos do Ju V23

Auditoria de segurança front-end do site estático (HTML + CSS + JS puro),
executada sobre o pacote V22 e revalidada no build V23.

**Escopo:** CSP, headers HTTP, XSS/injeção, links externos, service worker,
dependências, segredos e superfície de dados.
**Fora do escopo:** infraestrutura da Vercel, DNS, conta do WhatsApp e do
Instagram (terceiros).

---

## 1. Resultado geral

| Item | Situação |
|------|----------|
| Headers de segurança | ✅ Configurados (`vercel.json`) |
| Content-Security-Policy | ✅ `script-src 'self'` sem `unsafe-inline` |
| XSS / injeção de HTML | ✅ Todo conteúdo dinâmico passa por `escapeHtml` |
| Segredos / chaves | ✅ Nenhum encontrado |
| Dependências de terceiros | ✅ Zero (nenhum `node_modules` em runtime) |
| Links `target="_blank"` | ✅ `rel="noopener noreferrer"` |
| Dados sensíveis | ✅ Apenas o carrinho no `localStorage`; nenhum dado pessoal persistido |
| Service worker | ✅ Precache completo e versionado por hash |

---

## 2. Achados da V22 e correções aplicadas

### A1 — Ausência total de cabeçalhos de segurança · **Alta** · Corrigido
A V22 era um pacote estático sem `vercel.json`, portanto sem CSP, HSTS,
`X-Frame-Options`, `X-Content-Type-Options` ou `Referrer-Policy`. O site ficava
exposto a clickjacking, MIME sniffing e carregamento de recursos externos.
**Correção:** `vercel.json` com a política completa (seção 3).

### A2 — Ausência de Content-Security-Policy · **Alta** · Corrigido
Sem CSP, qualquer injeção de script teria execução livre.
**Correção:** CSP em dois níveis — cabeçalho HTTP (Vercel) e `<meta>` em cada
página (defesa em profundidade para GitHub Pages). `script-src 'self'`, sem
`'unsafe-inline'` e sem `'unsafe-eval'`.

### A3 — Script inline bloqueava CSP estrita nas páginas de produto · **Média** → **Corrigido**
As páginas de produto traziam um bloco `<style>` inline (e a V22 admitia um
hash de script inline inexistente), o que forçava `'unsafe-inline'`.
**Correção:** o bloco foi extraído para `assets/css/product-page.css`. As páginas
de produto e a home agora usam `style-src 'self'`, sem `'unsafe-inline'`.

### A4 — `rel="noopener"` sem `noreferrer` (3 ocorrências) · **Baixa** · Corrigido
Links para WhatsApp e Instagram vazavam o cabeçalho `Referer` e o objeto
`window.opener`. **Correção:** todos os links externos usam
`rel="noopener noreferrer"` (verificado: 5 ocorrências corretas, 0 incompletas).

### A5 — Ausência de build reprodutível / cadeia de suprimentos opaca · **Média** · Corrigido
A V22 entregava apenas o resultado compilado, sem fonte nem script de build —
impossível auditar o que gera o quê.
**Correção:** build determinístico com **apenas módulos nativos do Node.js**
(`node:fs`, `node:path`, `node:crypto`), sem dependências de terceiros.

### A6 — Service worker com precache incompleto · **Média** (integridade) · Corrigido
O `sw.js` da V22 **não listava** `v22.css`; o CSS novo não era servido offline e
o usuário podia ver um layout quebrado sem conexão.
**Correção:** lista `CORE` completa (5 CSS + 6 JS + ícones + páginas) e versão de
cache derivada de hash do conteúdo, garantindo invalidação correta.

### A7 — Fonte `Inter` declarada e nunca carregada · **Baixa** · Corrigido
Referência morta a uma fonte inexistente. **Correção:** stack de fontes de
sistema (nenhuma requisição externa, nenhum risco de terceiros).

### A8 — Revisão de XSS · **Nenhum achado**
`app.js` monta HTML com `innerHTML`, porém **todos** os campos vindos de dados
(nome, descrição, categoria, sabores, mensagens) passam por `escapeHtml`.
Não há `eval`, `new Function`, `document.write` nem `insertAdjacentHTML` com
entrada não tratada — confirmado por teste automatizado em `dist/`.

---

## 3. Cabeçalhos configurados (`vercel.json`)

| Cabeçalho | Valor |
|-----------|-------|
| `Content-Security-Policy` | `default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; form-action 'self' https://wa.me; frame-ancestors 'none'; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | câmera, microfone, geolocalização, pagamento, USB etc. desativados |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-Permitted-Cross-Domain-Policies` | `none` |
| `Cache-Control` | `immutable` para `/assets/*`; `must-revalidate` para HTML e `sw.js` |

---

## 4. Riscos residuais (aceitos e justificados)

1. **`style-src 'unsafe-inline'` no cabeçalho HTTP.**
   Necessário apenas para as páginas autossuficientes `404.html` e `offline.html`,
   que precisam funcionar mesmo em caminhos inexistentes ou sem rede (não podem
   depender de um CSS relativo). O risco de `unsafe-inline` em **estilos** é
   baixo (não permite execução de script) e **não** se aplica à home nem às
   páginas de produto, que usam `style-src 'self'` via `<meta>`. Recomendação
   futura: extrair um `error.css` absoluto e remover `'unsafe-inline'` também do
   cabeçalho.
2. **`upgrade-insecure-requests`** força HTTPS; em pré-visualização local por
   HTTP isso pode bloquear sub-recursos. Em produção (Vercel/HTTPS) é desejável.
3. **GitHub Pages não envia cabeçalhos.** Por isso a CSP também vai em `<meta>`
   em todas as páginas. A proteção completa (HSTS etc.) depende da Vercel.
4. **Conteúdo externo:** os únicos destinos externos são `wa.me` (navegação) e
   `instagram.com` (link), ambos abertos em nova aba com `noopener noreferrer`.

---

## 5. Como revalidar

```bash
npm test        # build + catálogo + disponibilidade + auditoria do dist
npm run check   # sintaxe de todos os JS
```

O `tests/validate-dist.mjs` verifica automaticamente: links internos, canonical,
sitemap, ausência de `eval`/`new Function`/`document.write` e varredura de
padrões de segredos (`api_key`, `secret`, `password`, `BEGIN PRIVATE KEY`,
`sk-`, `AIza`, `ghp_`, `service_role`).

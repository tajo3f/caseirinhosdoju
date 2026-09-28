# Caseirinhos do Ju — V18.2 · Esfirras e botões personalizados (sem Python)

**Novidades em `ATUALIZACAO-V18-2-IMAGENS-ICONES.md`.** Comece por `EDITAR-PRECOS.md`. Todos os preços ficam em um único arquivo: `data/precos.json`.

O pacote não precisa de Python, frameworks ou bibliotecas npm externas. A V18.2 inclui os ícones enviados e a imagem de apresentação das bandejas; ver `ATUALIZACAO-V18-2-IMAGENS-ICONES.md` e `QA-V18-2.md`. Vercel publica automaticamente com `node scripts/build.mjs` e saída `dist` (configurado em `vercel.json`). O projeto já inclui os arquivos compilados em FULL e SITE.

## O que editar
- **Preços de todos os produtos, quatro combos salgados (valor único no site e venda direta) e três sabores doces:** `data/precos.json`.
- Nome, descrição e foto de um produto: `data/catalog.json`. Não edite o preço nesse arquivo: é gerado pelo build.
- Fotos: `assets/images/`; a imagem atual das esfirras doces é uma ilustração assumida como provisória.
- Cores e apresentação: `assets/css/v18.css` e `assets/css/v18-2.css`; código de comportamento: `assets/js/app.js` e `assets/js/availability.js`.
- Textos fixos: `index.html`. Páginas `produtos/*` e `assets/js/catalog-data.js` são geradas.

## Publicar via GitHub → Vercel
1. Use `Caseirinhos-do-Ju-V18-1-GITHUB.zip` (arquivos na raiz do repositório, sem pasta externa).
2. Vercel: Framework **Other**; Build Command `node scripts/build.mjs`; Output Directory `dist`.
3. O commit no GitHub reconstrói automaticamente o site. Não coloque o ZIP como arquivo único no repositório: extraia e envie o conteúdo.
4. O domínio configurado continua `https://caseirinhosdoju.com.br/`. Faça um preview antes de substituir a produção.

## Testes e prévia local (só Node.js)
```
npm test
npm run build
npm run preview
```
Acesse http://localhost:4173. O arquivo `ferramentas/editor-precos.html` é opcional: importa `data/precos.json`, permite editar valores e exporta o mesmo JSON. Ele não é publicado no site.

**Horários preservados:** esfirras quinta a sábado 18h30–22h; pães doce/sal-cebola no fim de semana ou por solicitação de encomenda. A confirmação é feita com o Ju (Juninho) pelo WhatsApp; site estático não substitui confirmação de estoque ou quantidade.

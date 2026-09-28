# Correção da publicação na Vercel — V17

## O problema
A V16 possuía em `vercel.json` o comando `python3 scripts/build_static.py`. Se o ambiente/projeto da Vercel não consegue executar esse comando, o deployment falha. Sem o print/log exato da falha, esta é a dependência identificada no projeto, não uma confirmação de qual linha apareceu no seu log.

## Solução aplicada
- `vercel.json` atualizado para `buildCommand: "node scripts/build.mjs"`, `outputDirectory: "dist"`, `framework: null` e instalação de dependências dispensada.
- `scripts/build.mjs` recompila catálogo e páginas de produtos, SEO, preços destacados, sitemap e cache com **Node.js nativo, sem bibliotecas externas**.
- `package.json` permite `npm run build`; `templates/product-style.css` permite editar o estilo de todas as páginas individuais de produto pelo Gemini.
- As imagens, 12 produtos, preços e disponibilidade foram preservados.
- `assets/source` fica no pacote FULL, não vai para o site publicado.

## Como colocar no ar sem o erro
1. Descompacte o arquivo `Caseirinhos-do-Ju-V17-GITHUB-VERCEL.zip` e envie **o conteúdo**, não uma pasta extra, para a raiz do repositório. Na raiz devem existir `index.html`, `vercel.json`, `package.json`, a pasta `scripts` e a pasta `assets`.
2. Na Vercel, selecione o projeto, **Settings → Build and Deployment**. Em Framework Preset selecione **Other**. Confirme Build Command `node scripts/build.mjs` e Output Directory `dist`. Se houver Override antigo apontando para `python3`, substitua por Node (ou desative o override para deixar o `vercel.json` assumir). Mantenha o Root Directory na raiz do repositório.
3. Publique um novo deployment. O domínio existente `caseirinhosdoju.com.br` não precisa ser registrado novamente nem alterado.
4. Confira catálogo, páginas de produto, preços e checkout em um preview antes de promover para produção.

Se estiver usando o ZIP **SITE-ESTATICO**, ele contém uma pasta `public/` e outro `vercel.json` com `buildCommand: null` / `outputDirectory: public`; não precisa nem de Node para esse caso, mas não atualiza preços automaticamente sem regenerar arquivos.

## Edição de preços pelo celular
Altere apenas `data/precos.json`, salve e faça commit no GitHub. O build Node gerará os valores nos cards, nas páginas e no cache da nova publicação.

## Limitação
As restrições de horário ainda são verificadas no navegador; como o projeto é front-end estático, a confirmação de encomendas e estoque depende do atendimento via WhatsApp.

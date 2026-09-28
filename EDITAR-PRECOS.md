# Edite todos os preços em um único arquivo

Abra **`data/precos.json`** no GitHub (inclusive no celular). Toque no lápis, mude apenas o número e faça **Commit changes**. A Vercel reconstrói os cards, o carrinho, as páginas de produto, os dados de busca e o cache.

**Exemplo:** `"Combo Família · 15 un.": 75.0` → `"Combo Família · 15 un.": 80.0`. Use PONTO decimal no JSON (`55.00`), não vírgula (`55,00`). Não apague aspas, dois-pontos ou vírgulas entre itens.

### Onde ficam os novos valores
- `combos-esfirras-abertas`: quatro valores **definitivos no site e na venda direta** (34, 62, 75, 88).
- `esfirras-doces`: Nutella com Morango 55; Banana com Bacon 55; Romeu e Julieta 50.
- Tabela informativa de venda direta é atualizada automaticamente pelos mesmos quatro combos; você não precisa editar os valores duas vezes.
- Demais produtos permanecem no mesmo arquivo. Nunca atualize um preço em `index.html`, `produtos/` ou `assets/js/catalog-data.js`: eles são gerados automaticamente.

### Editor visual (opcional)
Abra localmente **`ferramentas/editor-precos.html`**, carregue o arquivo `data/precos.json`, altere e escolha **Baixar precos.json**. Substitua o original no GitHub. O editor não é publicado no site e não tem acesso à sua conta.

### Quantidade das esfirras doces
O cliente informou valores por sabor, mas não especificou quantas unidades acompanham cada preço. O site mostra essa informação como **pendente de confirmação pelo Ju** e a inclui na mensagem do WhatsApp. Para estabelecer a quantidade, confirme com o cliente antes de mudar o texto em `data/catalog.json`.

### Imagens
A ilustração provisória das doces está em `assets/images/esfirras-doces-ilustracao.svg`, identificada como ilustração. Quando receber a foto real, coloque o arquivo em `assets/images/` e altere o campo `image` em `data/catalog.json`.

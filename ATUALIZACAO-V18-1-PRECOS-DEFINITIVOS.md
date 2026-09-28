# Caseirinhos do Ju — V18.1 | preços definitivos de esfirras salgadas

- 6 unidades: **R$ 34,00**
- 12 unidades: **R$ 62,00**
- 15 unidades: **R$ 75,00**
- 18 unidades: **R$ 88,00**

Estes são os mesmos preços tanto para o cardápio online quanto para venda direta. O grupo duplicado `_venda_direta_esfirras` foi eliminado: edite apenas `combos-esfirras-abertas` em `data/precos.json`. O build Node.js atualiza a tabela informativa, cards, catálogo, carrinho, mensagens WhatsApp, páginas individuais e cache.

As esfirras doces continuam Nutella com Morango R$ 55,00, Banana com Bacon R$ 55,00 e Romeu e Julieta R$ 50,00. A quantidade das doces ainda está pendente de confirmação pelo Ju. Horários, fotos e demais preços preservados.

## Publicação

Use o pacote GITHUB para substituir os arquivos da raiz do repositório. Vercel: framework Other, build `node scripts/build.mjs`, output `dist`. O projeto não usa Python nem dependências npm externas. A versão SITE-SEM-BUILD já vem compilada. Não substitua a produção sem conferir o Preview.

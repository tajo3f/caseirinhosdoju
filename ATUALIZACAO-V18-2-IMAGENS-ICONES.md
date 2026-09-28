# Caseirinhos do Ju — V18.2: bandejas e ícones

## O que foi atualizado

- Imagem melhorada das duas bandejas de esfirras, fornecida nesta conversa, em `assets/images/esfirras-bandejas.webp` e três recortes otimizados. Usada no destaque inicial das esfirras, cards de combos, produto de combos e galeria na seção Sabores.
- Os cards individuais de sabores específicos mantêm suas fotos anteriores para não representar um sabor com uma fotografia genérica de outra preparação.
- As fotos de apresentação não representam necessariamente a quantidade exata nem a composição de cada combo; a informação está descrita no site. As esfirras doces continuam com imagem ilustrativa sinalizada, até receber foto específica.
- Ícone verde de WhatsApp enviado pelo cliente: `assets/icons/whatsapp-verde.png`, presente no botão flutuante com contato do Ju.
- Seta enviada pelo cliente: `assets/icons/seta-topo.png`, com o mesmo desenho do chevron e ajuste de espessura para leitura em tamanho reduzido, sobre botão claro.
- Arquivos enviados preservados em `assets/source/`; esta pasta não é publicada no site.
- Nova camada responsiva `assets/css/v18-2.css`; botões se deslocam para cima quando o carrinho móvel aparece e se ocultam em modais abertos.
- Build e publicação em Node.js, sem Python; cache atualizado automaticamente quando trocar imagem, CSS, JavaScript ou ícones.

## Preços e regras comerciais preservados

Combos salgados: 6 = R$ 34, 12 = R$ 62, 15 = R$ 75, 18 = R$ 88. Doces: Nutella com Morango R$ 55, Banana com Bacon R$ 55, Romeu e Julieta R$ 50. Esfirras: quinta, sexta e sábado, das 18h30 às 22h no horário de Brasília. Pães caseiros nos fins de semana ou por solicitação de encomenda.

## Como publicar no Vercel

Na raiz do repositório, use o conteúdo de `Caseirinhos-do-Ju-V18-2-GITHUB.zip` (não envie o próprio ZIP). Vercel: Framework Other, Build Command `node scripts/build.mjs`, Output Directory `dist`. Confirme o Preview antes de publicar em `caseirinhosdoju.com.br`.

Para atualizar no Gemini, altere principalmente `assets/css/v18-2.css`, `index.html`, `data/catalog.json` e `data/precos.json`. Não edite as páginas geradas em `produtos/`.

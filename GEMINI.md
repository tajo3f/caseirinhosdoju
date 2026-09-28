# Instruções para o Gemini — Caseirinhos do Ju V18.2

Você está editando um projeto de cardápio estático. **Não use Python.** Build com Node.js nativo, sem pacotes npm externos: `node scripts/build.mjs` → `dist/`.

## Prioridades
1. Nunca perca os produtos, preços, imagens e as regras de disponibilidade existentes. O Ju é o **Juninho**.
2. Preços ficam SOMENTE em `data/precos.json`. Os quatro combos têm um único preço cada, igual no site e na venda direta; não criar duplicidade de preços.
3. Produtos e descrições ficam em `data/catalog.json`. Em `esfirras-doces`, a quantidade de unidades por opção é pendente de confirmação.
4. O site mantém o WhatsApp +55 27 99651-1588, Instagram `@caseirinhos.doju`, domínio `https://caseirinhosdoju.com.br/`.
5. Esfirras quinta/sexta/sábado das 18h30 às 22h (Brasília); pães doce/sal-cebola só pedido direto no fim de semana, por encomenda nos outros dias.
6. Ao terminar, execute `npm test` e `npm run build`; entregue o conteúdo-fonte e não só `dist`.

## Arquivos
- `data/precos.json` — preços definitivos dos combos, doces e demais produtos.
- `assets/css/v18.css` — estilos comerciais da V18.
- `assets/css/v18-2.css` — galeria das bandejas e botões flutuantes.
- `assets/icons/whatsapp-verde.png` e `assets/icons/seta-topo.png` — ícones fornecidos pelo cliente.
- `assets/images/esfirras-bandejas.webp` — imagem otimizada de apresentação das bandejas; recortes em arquivos com prefixo `esfirras-bandeja`.
- `assets/js/app.js` — carrinho e checkout.
- `assets/js/availability.js` — horários, não remova bloqueios.
- `scripts/build.mjs` — geração automática.
- `ferramentas/editor-precos.html` — editor local, não publicado.

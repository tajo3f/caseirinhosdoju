# Caseirinhos do Ju — V15 FULL

Base: pacote V14 FULL da Biblioteca. Domínio de publicação: `https://caseirinhosdoju.com.br/`. Esta entrega NÃO altera o site publicado nem registra/renova domínio.

## Mudanças

- Ícones flutuantes WA e seta em texto trocados por SVG vetorial acessível, sem dependência de fontes externas.
- Atalhos de categorias para amanteigados, casadinhos, pães e esfirras; os filtros usam a lógica já existente no catálogo.
- Dock flutuante responsivo, recolocado acima do carrinho no celular. Fica oculto durante modais/carrinho; voltar ao topo só recebe foco quando aparece.
- Cabeçalho mais claro, refinamento de imagens, preços e botões. Animações sutis apenas com interação e respeito a movimento reduzido.
- Cards com leitura de preço por tecnologias assistivas, limite coerente de 99 unidades.
- `v15.css` e `v15-ui.js` adicionados ao build e ao cache versionado pelo conteúdo.

## Preservado

12 produtos, todas as opções/valores em `data/precos.json`, fotos existentes, Instagram correto, CTA WhatsApp, assinatura da TAJO apenas no rodapé, validade de 60 dias somente nos biscoitos, SEO e páginas individuais. Esfirras quinta/sexta/sábado das 18h30 às 22h (exclusivo) em America/Sao_Paulo, pães de sábado/domingo ou solicitação de encomenda nos demais dias.

## Publicação

No repositório GitHub, envie o CONTEÚDO do ZIP GITHUB para a raiz (ou faça isso em branch de teste). Na Vercel, Build Command `python3 scripts/build_static.py`, Output Directory `dist`. O site atual continua no ar até publicar novo deploy. Teste um Preview primeiro; confirme horário, carrinho e WhatsApp antes de promover à produção. O arquivo `dist` do ZIP SITE é uma opção para hospedagem estática sem build.

## Limitações importantes

Como o site é front-end estático, disponibilidade é verificada no navegador; não há validação server-side, gestão de estoque ou confirmação automática de pedidos. O envio/atendimento final ocorre pelo WhatsApp. A renovação anual do domínio não é realizada por esses arquivos.

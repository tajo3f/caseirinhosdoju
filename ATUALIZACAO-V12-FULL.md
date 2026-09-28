# Caseirinhos do Ju — V12 FULL (26/09/2026)

## O que foi preservado
Todos os 12 produtos, nomes, 12 páginas detalhadas, duas rotas antigas de redirecionamento, marca, assinatura TAJO apenas no cabeçalho, WhatsApp, Instagram `@caseirinhos.doju`, fotos otimizadas e arquivos de referência, opções e preços em `data/precos.json`, validade de 60 dias **somente para amanteigados/casadinhos**, combos, sabores e campanhas informativas da V11.

## V12 — engenharia e experiência
- Nova camada de design `assets/css/v12.css` aplicada após as anteriores, com responsividade específica para celular, tablet, desktop e telas grandes; acabamento de hero, grade de produtos, filtros, modais, carrinho e páginas individuais.
- Horário de esfirras: quinta, sexta e sábado, das **18h30 inclusive até 22h exclusive**, em **America/Sao_Paulo**. Fora desse período bloqueia botões de pedido imediato, combos, sabor, carrinho salvo e checkout. Os estados fechados mostram a próxima abertura.
- Pães caseiros doce e sal/cebola: pedido direto aos sábados e domingos; nos demais dias, **solicitação separada de encomenda**, sujeita a confirmação. O pão de hambúrguer continua sob consulta.
- Botão para remover de uma vez itens do carrinho fora da disponibilidade; não permite aumentar sua quantidade.
- Foco e navegação por teclado aprimorados, tratamento defensivo de dados no catálogo, mensagem de erro acessível e foco restaurado ao fechar sobreposições.
- Páginas individuais agora incluem escolha de peso/combo/sabor e quantidade; a mensagem direta ao WhatsApp informa a opção selecionada e o subtotal.
- Cache de publicação **automaticamente versionado pelo conteúdo e imagens** no build. Alterar preços em `data/precos.json` **ou substituir uma imagem preservando o nome do arquivo** gera novo `sw.js` no `dist`, sem você ter de modificar manualmente a versão do cache.
- Arquivos de origem das fotos não são publicados, mas permanecem no ZIP FULL. Pacote pré-gerado `dist/` incluído.

## Instalar no repositório
O ZIP FULL é **código-fonte**: envie seu conteúdo à raiz do repositório (sem a pasta externa). A Vercel deve usar `python3 scripts/build_static.py` como Build Command e `dist` como Output Directory, já definidos em `vercel.json`. Após publicar, verifique a URL e faça recarregamento no celular. Não envie `dist` sobre o código-fonte. Para GitHub Pages, defina **Settings → Pages → Source: GitHub Actions**; o workflow executa build e testes.

O pacote SITE contém só os arquivos pré-gerados de `dist`: utilize-o se quiser subir conteúdo estático diretamente em outro host. **Não substitua o repositório fonte apenas pelo pacote SITE** se a Vercel atual executa o script de build.

## Alterar preços pelo celular
GitHub → `data/precos.json` → lápis → mudar o número com ponto decimal → Commit. O build atualiza todos os preços derivados, páginas e cache. Nunca altere `assets/js/catalog-data.js` ou as páginas geradas manualmente.

## Limite honesto
Por ser um site estático com fluxo WhatsApp, a trava depende da hora do dispositivo e da execução do JavaScript. Não impede que alguém mande uma mensagem por WhatsApp por conta própria, nem substitui verificação de estoque/agenda por servidor. O atendimento precisa confirmar pedidos e encomendas. Testes de estrutura, sintaxe, lógica e build foram executados; o navegador automatizado no ambiente de teste bloqueou navegação local, então o resultado visual deve ser conferido após deploy antes de substituir a produção.

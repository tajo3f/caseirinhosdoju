# Caseirinhos do Ju · V14 FULL

Atualização visual sobre a V13. Preserva catálogo com 12 produtos, opções, preços, fotos existentes, Instagram correto, crédito TAJO no rodapé, SEO, horários, carrinho, WhatsApp e 60 dias de validade exclusivamente nos biscoitos informados.

**Cabeçalho:** navegação mais clara, marca mais presente, acesso ao atendimento e pedido em destaque. Crédito da TAJO mantido exclusivamente no rodapé.

**Hero:** composição editorial com fotos reais do catálogo (coco com chocolate, esfirra e goiabinha), chamadas concretas, CTA para cardápio e horário das esfirras. Removidas alegações de vendas e selos visuais genéricos.

**Cards:** mídia clicável, link acessível, nomenclatura, variante, preço com legenda, ações maiores e comunicação de indisponibilidade. O preço muda visualmente quando o cliente troca a opção. Nenhuma mudança nos valores cadastrados.

**Microinterações:** feedback nos links de navegação, elevação e ampliação de foto só em dispositivos com hover, respeitando redução de movimento, e pequenos estados visuais de foco. Os controles nativos permanecem navegáveis por teclado.

**Publicação:** Build Command `python3 scripts/build_static.py`; Output Directory `dist`. Faça deploy como preview antes de publicar. O serviço de pedidos continua estático e sujeito à confirmação do atendimento. Regras de horário são executadas no navegador, não no servidor.

**Preços:** edite apenas `data/precos.json` no GitHub e faça commit. O build gera catálogo, páginas e nova versão do cache. Não edite os arquivos de `dist` manualmente.

**Pastas de entrega:** FULL = código fonte, referências de imagens e `dist`; GITHUB = código-fonte sem `dist` e sem referências grandes, para o build no Vercel; SITE = conteúdo pronto de `dist`.

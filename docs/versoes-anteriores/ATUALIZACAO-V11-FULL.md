# Caseirinhos do Ju — V11 FULL

Base: ZIP do cliente `caseirinhosdoju-main.zip`; mantidos os 12 produtos, preços e páginas, fotos anteriores e histórico documental. Alterações:

- Instagram em todo conteúdo e metadados: `@caseirinhos.doju`, URL `https://www.instagram.com/caseirinhos.doju/` (verificar acesso da conta antes da publicação).
- Fotografias editadas: goiabinha 200g, Ninho com Chocolate 200g e casadinho 200g; originais preservados em `assets/source` e formatos WebP usados no site.
- Validade de 60 dias informada somente nos amanteigados/casadinhos; conferir rótulo. Pães e esfirras são perecíveis e não receberam esse selo.
- Horário comercial **America/Sao_Paulo**: esfirras de quinta a sábado, 18h30 (inclusivo) até 22h (exclusivo); pães caseiros doce e sal/cebola com pedido direto sábado e domingo, nos demais dias via solicitação de encomenda, não pedido imediato; hambúrguer sob consulta.
- Travas aplicadas em cards, combos, sabores, cart/checkout (inclusive carrinho salvo) e páginas individuais de produto; código compartilhado em `assets/js/availability.js`; atualiza após retorno ao site e a cada 30 segundos. **O atendimento deve confirmar pedidos; sem backend não se verifica estoque nem se impede manipulação do relógio cliente.**
- UI responsiva adicional `assets/css/upgrade.css`, barra de status e avisos de carrinho; melhor uso do espaço no smartphone, assinatura TAJO apenas no header, contato Instagram acessível no mobile.
- Service Worker novo, arquivos JS/CSS no-cache no Vercel; workflow de Github Pages e build estático para Vercel. Endereço canônico `https://caseirinhosdoju.com.br/`.
- Mantidos redirecionamentos das antigas rotas de casadinhos de maracujá para os nomes corretos dos amanteigados.

## Operação

**Alterar preços:** `data/precos.json` → commit; Vercel executa `python3 scripts/build_static.py` (Build Command), output `dist`. GitHub Pages executa workflow após commit. Se Settings da Vercel substituir as opções do `vercel.json`, defina manualmente Build Command e Output Directory.

**Alterar horários:** `assets/js/availability.js`, dados semânticos do HTML principal e gerador de páginas de produto; rodar testes antes de publicar. Use **America/Sao_Paulo**.

**Trocar mais imagens:** otimizar para WebP e manter o mesmo nome em `assets/images` para atualizar cards e páginas juntos. `assets/source` mantém referências apenas dentro do ZIP fonte (excluídas do `dist`).

**Limitação técnica importante:** é um site estático; a trava funciona no navegador, não constitui validação server-side ou confirmação de estoque. Pedidos só são confirmados pelo WhatsApp pelo atendimento.

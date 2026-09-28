# QA V12 — release checklist

Scope: revisão de sintaxe e estrutura, rotas geradas, dados, imagens, horários, cache e compatibilidade do build. 

- `python3 scripts/build_static.py`
- `python3 scripts/validate_site.py`
- `python3 -m unittest discover -s tests -v`
- `node tests/availability.test.cjs` e `node tests/availability-v12.test.cjs`
- `node --check assets/js/*.js` (cada arquivo individualmente) e `node --check dist/sw.js`
- CSS analisado com parser tinycss2; imagens WebP/JPEG abertas e verificadas.
- Referências internas e JSON-LD conferidos nas 12 páginas, 2 redirecionamentos antigos e homepage.
- ZIPs: testar CRC de todos os arquivos e confirmar conteúdo.

**Limitação do ambiente:** o navegador Chromium disponibilizado bloqueou o endereço de teste local com `ERR_BLOCKED_BY_ADMINISTRATOR`. A verificação visual end-to-end e o fluxo real de WhatsApp precisam ser conferidos em preview de hospedagem antes de substituir a produção. Não é correto afirmar que esses testes de navegador ocorreram.

**Limitação de operação:** o site é estático, sem estoque/agenda e sem validação de horário no servidor; bloqueia o fluxo de pedido do site, mas um usuário pode conversar diretamente pelo WhatsApp. Toda encomenda precisa ser confirmada pelo negócio.

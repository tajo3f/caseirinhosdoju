# QA V16

Comandos: `python3 scripts/build_static.py`, `python3 scripts/validate_site.py`, `python3 -m unittest discover -s tests -v`, `node tests/availability.test.cjs`, `node tests/availability-v12.test.cjs`, `node tests/availability-v16.test.cjs`, `node --check` por script e `tinycss2` para CSS. Os produtos, preços e imagens são verificados pelos testes.

**O navegador gráfico do ambiente bloqueou URLs locais** (`ERR_BLOCKED_BY_ADMINISTRATOR` para localhost e file://); não foi possível executar testes visuais reais do layout. Use um deployment Preview na Vercel antes de publicar a V16. Inspecione 360px, 390px, 768px, 1280px, 1600px, a imagem dos combos e os estados de horário. O domínio em produção não foi modificado por esta entrega.

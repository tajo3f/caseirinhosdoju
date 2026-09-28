# QA V15

- Build e validação estática: `python3 scripts/build_static.py && python3 scripts/validate_site.py`.
- Testes: `python3 -m unittest discover -s tests -v`; `node tests/availability.test.cjs` e `node tests/availability-v12.test.cjs`.
- JS: `node --check` em cada arquivo; CSS: parser `tinycss2`; imagens: leitura/verify do Pillow.
- Regressões novas: ícones SVG, dock, filtros válidos, crédito TAJO rodapé, 12 produtos, valores, modal inicial fechado, cache com V15.
- Preview real em desktop/celular e teste de ponta a ponta do WhatsApp requerem validação após deploy. Nenhuma alteração em produção efetuada.

# QA V14 — resultados da entrega

- Build estático e validador: passaram para 12 produtos e 12 páginas de produtos.
- 36 testes Python de regressão e layout estrutural passaram.
- 12 verificações anteriores e 20 verificações adicionais de disponibilidade passaram.
- Todos os scripts JS e service worker passaram em `node --check`.
- Todos os CSS passaram no parser tinycss2.
- Os pacotes ZIP passaram na leitura CRC; o pacote GITHUB foi reconstruído e testado isoladamente.

**Limites:** as verificações de layout são estruturais, não equivalem a um teste visual em navegadores reais ou a uma auditoria Lighthouse. Verifique o Preview da Vercel em celular/tablet/desktop antes de liberar em produção. As regras de horário são aplicadas no navegador; o atendimento deve confirmar disponibilidade e estoque pelo WhatsApp.

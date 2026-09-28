/* Caseirinhos do Ju · regras comerciais únicas para home, carrinho e páginas de produto. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CASEIRINHOS_AVAILABILITY = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";
  const zone = "America/Sao_Paulo";
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function clock(instant = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: zone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      });
      const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
      const day = weekdays[parts.weekday];
      const hour = Number(parts.hour), minute = Number(parts.minute);
      if (!Number.isInteger(day) || !Number.isFinite(hour) || !Number.isFinite(minute)) return null;
      return { day, minutes: hour * 60 + minute, zone };
    } catch (_error) { return null; } // If timezone cannot be determined, fail closed.
  }
  const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  function nextOpening(type, now) {
    if (!now) return "Consulte o atendimento.";
    if (type === "esfirra") {
      for (let offset = 0; offset <= 7; offset++) {
        const day = (now.day + offset) % 7;
        if (![4, 5, 6].includes(day)) continue;
        if (offset === 0 && now.minutes >= 18 * 60 + 30) continue;
        const when = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : dayNames[day];
        return `Próxima abertura: ${when}, às 18h30 (Brasília).`;
      }
    }
    if (type === "bread") {
      for (let offset = 0; offset <= 7; offset++) {
        const day = (now.day + offset) % 7;
        if ((day === 6 || day === 0) && offset > 0) return `Próxima produção de fim de semana: ${dayNames[day]}.`;
      }
    }
    return "Consulte o atendimento.";
  }
  function kind(product) {
    if (!product) return "unknown";
    if (product.category === "Esfirras") return "esfirra";
    if (product.slug === "pao-caseiro-doce" || product.slug === "pao-caseiro-sal-cebola") return "bread";
    if (product.consultPrice) return "consult";
    return "regular";
  }
  function getState(product, instant = new Date()) {
    const type = typeof product === "string" ? product : kind(product);
    const now = clock(instant);
    if (type === "consult") return { allowed: false, type, label: "Somente sob consulta", detail: "Solicite informações ao atendimento." };
    if (type === "regular") return { allowed: true, type, label: "Adicionar ao pedido", detail: "Pedido sujeito à confirmação do atendimento." };
    if (!now) return { allowed: false, type, label: "Horário indisponível", detail: "Não foi possível verificar o horário de Brasília. Consulte o atendimento." };
    if (type === "esfirra") {
      const allowed = [4, 5, 6].includes(now.day) && now.minutes >= 18 * 60 + 30 && now.minutes < 22 * 60;
      return { allowed, type, label: allowed ? "Esfirras disponíveis agora" : "Esfirras fechadas para pedidos", detail: allowed ? "Pedidos diretos até as 22h (Brasília)." : `Pedidos diretos: quinta, sexta e sábado, das 18h30 às 22h (Brasília). ${nextOpening(type, now)}` };
    }
    if (type === "bread") {
      const allowed = now.day === 0 || now.day === 6;
      return { allowed, type, label: allowed ? "Pães disponíveis no fim de semana" : "Pães somente por encomenda", detail: allowed ? "Pedido direto no fim de semana; confirmação pelo atendimento." : `Fora do fim de semana, solicite uma encomenda para confirmação. ${nextOpening(type, now)}` };
    }
    return { allowed: false, type, label: "Indisponível", detail: "Consulte o atendimento." };
  }
  return Object.freeze({ clock, kind, getState, nextOpening, zone });
});

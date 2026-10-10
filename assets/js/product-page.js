/* V12: consistent price/variant and availability enforcement on every detail page. */
(() => {
  "use strict";
  const action = document.getElementById("productOrderAction");
  const status = document.getElementById("productLiveStatus");
  if (!action || !status) return;
  const rules = window.CASEIRINHOS_AVAILABILITY;
  const variant = document.getElementById("detailVariant");
  const flavor = document.getElementById("detailFlavor");
  const quantity = document.getElementById("detailQuantity");
  const currency = new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL"});
  const whatsapp = "5527996511588";
  const type = action.dataset.productType;
  function generateUrl() {
    const selected = variant?.selectedOptions?.[0];
    const chosen = selected?.value || "";
    const count = Math.max(1,Math.min(99, Math.trunc(Number(quantity?.value)||1)));
    if (quantity && quantity.value !== String(count)) quantity.value = String(count);
    const price = Number(selected?.dataset.price || 0);
    const parts = [chosen, flavor?.value].filter(Boolean).join(" · ");
    const total = Number.isFinite(price) && price > 0 ? `\nTotal dos produtos: ${currency.format(price * count)}.` : "";
    const note = action.dataset.productName === "Esfirras Doces" ? " Quantidade de unidades por opção a confirmar com o Ju." : "";
    const message = `Olá! Vim pelo site do Caseirinhos do Ju e gostaria de pedir ${count}x ${action.dataset.productName}${parts ? ` (${parts})` : ""}.${total}${note} Aguardo a confirmação do atendimento.`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
  }
  function update() {
    const state = rules?.getState(action.dataset.productType) || {allowed:false,type,label:"Horário indisponível",detail:"Não foi possível verificar o horário de Brasília. Consulte o atendimento."};
    status.textContent = state.detail;
    status.hidden = !(type === "esfirra" || type === "bread");
    status.classList.toggle("is-open",state.allowed);
    action.removeAttribute("href");action.removeAttribute("target");action.removeAttribute("rel");
    action.setAttribute("aria-disabled","true");
    if (type === "consult") {
      action.href = action.dataset.orderUrl;
      action.textContent = "Consultar pelo WhatsApp →";
    } else if (state.allowed) {
      action.href = generateUrl();
      action.textContent = "Pedir pelo WhatsApp →";
    } else if (type === "bread" && rules) {
      action.href = action.dataset.enquiryUrl;
      action.textContent = "Solicitar encomenda →";
    } else {
      action.textContent = "Pedido direto fora do horário";
    }
    if (action.hasAttribute("href")) {
      action.target="_blank";action.rel="noopener noreferrer";action.removeAttribute("aria-disabled");
    }
  }
  [variant,flavor,quantity].forEach(element => element?.addEventListener("change", update));
  action.addEventListener("click", event => {update();if(!action.hasAttribute("href"))event.preventDefault();});
  update();window.setInterval(update,30_000);window.addEventListener("focus",update);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)update();});
})();

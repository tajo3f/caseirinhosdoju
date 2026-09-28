/* Caseirinhos V15: tiny, progressively enhanced actions; zero dependencies. */
(() => {
  "use strict";
  const top = document.getElementById("backTop");
  const mobileCart = document.getElementById("mobileCartButton");
  function syncCartDock() {
    document.body.classList.toggle("has-mobile-cart", Boolean(mobileCart && !mobileCart.hidden));
  }
  function syncTopVisibility() {
    if (!top) return;
    const visible = window.scrollY > 700;
    top.setAttribute("aria-hidden", String(!visible));
    top.tabIndex = visible ? 0 : -1;
    top.classList.toggle("show", visible);
  }
  if (mobileCart) {
    syncCartDock();
    if ("MutationObserver" in window) new MutationObserver(syncCartDock).observe(mobileCart, { attributes:true, attributeFilter:["hidden"] });
  }
  if (top) {
    syncTopVisibility();
    window.addEventListener("scroll", syncTopVisibility, { passive:true });
  }
})();

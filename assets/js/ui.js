/* V14: active section affordance. Native scroll + progressive enhancement. */
(() => {
  "use strict";
  if (!("IntersectionObserver" in window)) return;
  const links = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"],.mobile-nav a[href^="#"]'));
  const byId = new Map();
  links.forEach(link => {
    const id = link.getAttribute("href").slice(1);
    if (id && document.getElementById(id)) {
      const group = byId.get(id) || [];
      group.push(link);
      byId.set(id, group);
    }
  });
  if (!byId.size) return;
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(item => item.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (!visible.length) return;
    const active = visible[0].target.id;
    links.forEach(link => {
      const selected = link.getAttribute("href") === `#${active}`;
      link.classList.toggle("is-active",selected);
      if (selected) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  }, {rootMargin:"-15% 0px -65% 0px", threshold:[0,.1,.3]});
  byId.forEach((_links,id) => observer.observe(document.getElementById(id)));
})();
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
/* V16: progressively enhanced microinteractions. All purchase rules live in app.js/availability.js. */
(() => {
  'use strict';
  const live = document.getElementById('liveAvailability');
  if (live) live.setAttribute('aria-atomic','true');

  // Decorative reveal only; cards stay fully visible when JS/observer is unavailable.
  const grid = document.querySelector('.combo-grid');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!grid || reduced || !('IntersectionObserver' in window)) return;
  const cards = Array.from(grid.querySelectorAll('.combo-card'));
  grid.classList.add('v16-motion-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('v16-entered');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -16px 0px' });
  cards.forEach((card, index) => {
    card.style.setProperty('--v16-stagger', `${Math.min(index,3)*65}ms`);
    observer.observe(card);
  });
})();
/* V19 menu usability. All order, price and availability logic remains in app.js. */
(() => {
  'use strict';
  const toggle=document.getElementById('menuToggle');
  const nav=document.getElementById('mobileNav');
  if(!toggle || !nav)return;
  const close=(restoreFocus=false)=>{
    if(nav.hidden)return;
    nav.hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Abrir menu');
    if(restoreFocus)toggle.focus({preventScroll:true});
  };
  // Run after the existing app handler, keeping keyboard semantics and the original menu.
  toggle.addEventListener('click',()=>{
    const open=!nav.hidden;
    toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    if(open)nav.querySelector('a')?.focus({preventScroll:true});
  });
  document.addEventListener('pointerdown',event=>{
    if(nav.hidden)return;
    if(!nav.contains(event.target)&&!toggle.contains(event.target))close();
  });
  document.getElementById('headerCartButton')?.addEventListener('click',()=>close());
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!nav.hidden)close(true);
  },true);
  if('matchMedia' in window){
    const desktop=window.matchMedia('(min-width:1101px)');
    desktop.addEventListener?.('change',event=>{if(event.matches)close();});
  }
})();
/* V20 progressive enhancement: normalize header offsets and menu semantics without changing order flow. */
(() => {
  'use strict';
  const header=document.querySelector('.site-header');
  const toggle=document.getElementById('menuToggle');
  const nav=document.getElementById('mobileNav');
  const cart=document.getElementById('mobileCartButton');
  const updateOffset=()=>{
    if(!header)return;
    document.documentElement.style.setProperty('--sticky-header-height',`${Math.ceil(header.getBoundingClientRect().height)}px`);
    document.body.classList.toggle('has-mobile-cart',Boolean(cart&&!cart.hidden));
  };
  updateOffset();
  if('ResizeObserver' in window && header)new ResizeObserver(updateOffset).observe(header);
  if(cart&&'MutationObserver' in window)new MutationObserver(updateOffset).observe(cart,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('orientationchange',updateOffset,{passive:true});
  window.addEventListener('pageshow',updateOffset,{passive:true});
  if(toggle&&nav){
    toggle.addEventListener('click',()=>{toggle.setAttribute('aria-label',nav.hidden?'Abrir menu':'Fechar menu');});
    document.querySelectorAll('.mobile-nav a').forEach(link=>link.addEventListener('click',()=>toggle.setAttribute('aria-label','Abrir menu')));
  }
})();

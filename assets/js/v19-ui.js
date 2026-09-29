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

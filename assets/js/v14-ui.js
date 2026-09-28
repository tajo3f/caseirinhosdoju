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

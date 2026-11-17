/* Keep deep links useful when detailed scopes are progressively disclosed. */
(() => {
  const reveal = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    if (!id) return;
    const target = document.getElementById(id);
    const detail = target?.closest('details[data-service-detail]');
    if (!detail) return;
    detail.open = true;
    let parent = detail.parentElement?.closest('details');
    while (parent) { parent.open = true; parent = parent.parentElement?.closest('details'); }
    requestAnimationFrame(() => detail.scrollIntoView({block:'start', behavior:'instant'}));
  };
  window.addEventListener('hashchange', reveal);
  document.addEventListener('click', e => {
    const a=e.target.closest?.('a[href]');
    if (a?.hash && a.pathname===location.pathname && a.hash===location.hash) reveal();
  });
  const toc=document.querySelector("[data-article-toc]");
  if(toc && matchMedia("(max-width:900px)").matches) toc.open=false;
  reveal();
})();

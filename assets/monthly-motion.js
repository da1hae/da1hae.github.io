(() => {
  const demo = document.querySelector('[data-monthly-demo]');
  if (!demo) return;
  const tabs = [...demo.querySelectorAll('[data-week]')];
  const panels = [...demo.querySelectorAll('[data-week-panel]')];
  const tablist = demo.querySelector('[role=tablist]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const horizontal = matchMedia('(max-width:900px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let index = 0, timer = null, frame, visible = false, hovered = false, selected = false;
  const orient = () => tablist.setAttribute('aria-orientation', horizontal.matches ? 'horizontal' : 'vertical');
  const show = (next, instant = false) => {
    index = next;
    cancelAnimationFrame(frame);
    demo.classList.toggle('motion-instant', instant);
    demo.dataset.phase = String(index + 1);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (instant) frame = requestAnimationFrame(() => demo.classList.remove('motion-instant'));
  };
  const stop = () => { clearTimeout(timer); timer = null; demo.dataset.playing = 'false'; };
  const ready = () => visible && !hovered && !selected && !motion.matches && !document.hidden;
  const schedule = () => {
    stop();
    if (!ready()) return;
    demo.dataset.playing = 'true';
    timer = setTimeout(() => {
      timer = null;
      if (!ready()) { stop(); return; }
      show((index + 1) % tabs.length);
      schedule();
    }, 4800);
  };
  const select = () => { selected = true; stop(); };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', event => { select(); show(i, event.detail === 0 || motion.matches); });
    tab.addEventListener('keydown', event => {
      const previous = horizontal.matches ? 'ArrowLeft' : 'ArrowUp';
      const next = horizontal.matches ? 'ArrowRight' : 'ArrowDown';
      let target;
      if (event.key === previous) target = (i + tabs.length - 1) % tabs.length;
      if (event.key === next) target = (i + 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === undefined) return;
      event.preventDefault(); select(); show(target, true); tabs[target].focus();
    });
  });
  demo.addEventListener('focusin', select);
  demo.addEventListener('pointerdown', select);
  demo.addEventListener('pointerenter', () => { if (finePointer.matches) { hovered = true; stop(); } });
  demo.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  motion.addEventListener('change', schedule);
  horizontal.addEventListener('change', orient);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= .15); schedule();
  }, {threshold:[0,.15]}).observe(demo);
  orient(); show(0, true); demo.dataset.playing = 'false';
})();

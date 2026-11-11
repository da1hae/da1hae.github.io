(() => {
  const demo = document.querySelector('[data-monthly-demo]');
  if (!demo) return;
  const tabs = [...demo.querySelectorAll('[data-week]')];
  const panels = [...demo.querySelectorAll('[data-week-panel]')];
  const tablist = demo.querySelector('[role=tablist]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const horizontal = matchMedia('(max-width:900px)');
  const timers = new Set();
  let started = false, stopped = motion.matches, frame;
  const orient = () => tablist.setAttribute('aria-orientation', horizontal.matches ? 'horizontal' : 'vertical');
  const show = (index, instant = false) => {
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
  const stop = (mode = 'settled') => {
    stopped = true;
    timers.forEach(clearTimeout);
    timers.clear();
    demo.dataset.playing = 'false';
    demo.dataset.demoMode = mode;
    tabs.forEach(tab => tab.classList.remove('is-previewed'));
  };
  const play = () => {
    if (started || stopped || motion.matches || document.hidden) return;
    started = true;
    demo.dataset.playing = 'true';
    demo.dataset.demoMode = 'preview';
    // Introduce the timeline without replacing the panel someone is reading.
    tabs.forEach((tab, i) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (stopped) return;
        tabs.forEach(item => item.classList.remove('is-previewed'));
        tab.classList.add('is-previewed');
      }, i * 950);
      timers.add(timer);
    });
    const finish = setTimeout(() => stop(), 3900);
    timers.add(finish);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', event => {
      stop('selected');
      show(i, event.detail === 0 || motion.matches);
    });
    tab.addEventListener('keydown', event => {
      const previous = horizontal.matches ? 'ArrowLeft' : 'ArrowUp';
      const next = horizontal.matches ? 'ArrowRight' : 'ArrowDown';
      let target;
      if (event.key === previous) target = (i + tabs.length - 1) % tabs.length;
      if (event.key === next) target = (i + 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      stop('selected');
      show(target, true);
      tabs[target].focus();
    });
  });
  demo.addEventListener('focusin', () => stop('selected'));
  motion.addEventListener('change', () => { if (motion.matches) stop(); });
  horizontal.addEventListener('change', orient);
  document.addEventListener('visibilitychange', () => { if (document.hidden && started) stop(); });
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) play();
    else if (started) stop();
  }, { threshold: .2 }).observe(demo);
  orient();
  show(0, true);
  demo.dataset.playing = 'false';
  demo.dataset.demoMode = stopped ? 'settled' : 'ready';
})();

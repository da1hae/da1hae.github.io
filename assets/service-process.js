(() => {
  const flow = document.querySelector('[data-process-flow]');
  if (!flow) return;

  const steps = [...flow.querySelectorAll('[data-process-step]')];
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  const timers = new Set();

  const highlight = index => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-highlighted', i === index);
      step.classList.toggle('is-passed', i < index);
    });
    flow.dataset.phase = String(index + 1);
  };
  const stop = () => {
    timers.forEach(clearTimeout);
    timers.clear();
    flow.dataset.playing = 'false';
  };
  const start = () => {
    if (started || preference.matches || document.hidden) return;
    started = true;
    flow.dataset.playing = 'true';
    // Explain the order once in 3.9 seconds; keep all copy visible and still.
    steps.slice(1).forEach((_, index) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        highlight(index + 1);
        if (index === steps.length - 2) stop();
      }, (index + 1) * 1300);
      timers.add(timer);
    });
  };

  highlight(0);
  flow.dataset.playing = 'false';
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) start();
    else stop();
  }, { threshold: 0.35 });
  observer.observe(flow);
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();

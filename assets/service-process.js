(() => {
  const flow = document.querySelector('[data-process-flow]');
  if (!flow) return;

  const steps = [...flow.querySelectorAll('[data-process-step]')];
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let inView = false;
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
    flow.dataset.phase = '0';
    steps.forEach(step => step.classList.remove('is-highlighted', 'is-passed'));
  };
  const start = () => {
    if (started || preference.matches || document.hidden) return;
    started = true;
    flow.dataset.playing = 'true';
    highlight(0);
    // Explain the order once, then return every step to the same neutral state.
    steps.slice(1).forEach((_, index) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        highlight(index + 1);
      }, (index + 1) * 1300);
      timers.add(timer);
    });
    timers.add(setTimeout(stop, steps.length * 1300 - 600));
  };

  stop();
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) start();
    else stop();
  }, { threshold: 0.35 });
  observer.observe(flow);
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inView) start();
  });
})();

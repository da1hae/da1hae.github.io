/* Reading position and bounded, optional explanatory motion. No network calls. */
(() => {
  const article = document.querySelector('.editorial-body');
  const sections = [...document.querySelectorAll('.editorial-section')];
  const links = [...document.querySelectorAll('.editorial-toc nav a')];
  const progress = document.querySelector('.reading-progress>span');
  const meter = document.querySelector('.reading-progress');
  const remaining = document.querySelector('[data-reading-remaining]');
  const minutes = Number(document.querySelector('[data-reading-minutes]')?.dataset.readingMinutes) || 5;
  if (article && sections.length) {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const first = sections[0].getBoundingClientRect();
      const last = sections[sections.length - 1].getBoundingClientRect();
      const extent = last.bottom - first.top - innerHeight * .6;
      const fraction = Math.max(0, Math.min(1, (innerHeight * .3 - first.top) / Math.max(1, extent)));
      if (progress) progress.style.transform = `scaleX(${fraction})`;
      const percent = Math.round(fraction * 100);
      if (meter) meter.setAttribute('aria-valuenow', String(percent));
      if (remaining) {
        const seconds = Math.ceil(minutes * 60 * (1 - fraction) / 10) * 10;
        remaining.textContent = fraction >= 1 ? '본문 끝까지 도착했어요' : `예상 남은 읽기 ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      }
      let current = null;
      for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .38) current = section.id;
      links.forEach(link => {
        if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule);
    update();
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const figures = [...document.querySelectorAll('[data-editorial-diagram]')];
  const play = figure => {
    if (motion.matches || figure.classList.contains('is-playing')) return;
    figure.classList.add('is-playing');
    setTimeout(() => figure.classList.remove('is-playing'), 1600);
  };
  figures.forEach(figure => {
    const button = figure.querySelector('.diagram-replay');
    if (!button) return;
    button.hidden = motion.matches;
    button.addEventListener('click', () => play(figure));
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        play(entry.target);
        observer.unobserve(entry.target);
      });
    }, {threshold:.3});
    figures.forEach(figure => observer.observe(figure));
  }
  motion.addEventListener('change', () => figures.forEach(figure => {
    figure.classList.remove('is-playing');
    const button = figure.querySelector('.diagram-replay');
    if (button) button.hidden = motion.matches;
  }));
})();

/* Two quiet blinks per page visit, only while the portrait is in view. */
(() => {
  const character = document.querySelector('[data-character]');
  if (!character || !('IntersectionObserver' in window)) return;
  const picture = character.querySelector('img');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let count = 0;
  let pending = null;
  let finish = null;
  const ready = () => visible && !document.hidden && !reducedMotion.matches
    && picture.complete && picture.naturalWidth > 0 && count < 2;
  const stop = () => {
    clearTimeout(pending);
    clearTimeout(finish);
    pending = finish = null;
    character.classList.remove('is-blinking');
  };
  const schedule = () => {
    if (pending !== null || finish !== null || !ready()) return;
    pending = setTimeout(() => {
      pending = null;
      if (!ready()) return;
      count += 1;
      character.classList.add('is-blinking');
      finish = setTimeout(() => {
        character.classList.remove('is-blinking');
        finish = null;
        schedule();
      }, 220);
    }, count === 0 ? 2600 : 12000);
  };
  const sync = () => { stop(); schedule(); };
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.6);
    sync();
  }, { threshold: [0, 0.6] });
  observer.observe(character);
  picture.addEventListener('load', schedule, { once:true });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
})();

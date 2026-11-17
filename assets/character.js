/* A 3.6-second greeting. Replay is intentional; no endless motion. */
(() => {
  const character = document.querySelector('[data-character]');
  if (!character || !('IntersectionObserver' in window)) return;
  const pictures = [...character.querySelectorAll('img')];
  const replay = character.querySelector('[data-character-replay]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const timers = new Set();
  let visible = false, played = false, running = false;
  const ready = () => visible && !document.hidden && !motion.matches && pictures.every(p => p.complete && p.naturalWidth > 0);
  const stop = () => {
    timers.forEach(clearTimeout); timers.clear(); running = false;
    character.classList.remove('is-blinking'); character.dataset.pose = 'side';
    replay.setAttribute('aria-disabled', 'false');
  };
  const later = (ms, action) => {
    const timer = setTimeout(() => { timers.delete(timer); if (ready()) action(); else stop(); }, ms);
    timers.add(timer);
  };
  const blink = () => { character.classList.add('is-blinking'); later(150, () => character.classList.remove('is-blinking')); };
  const play = () => {
    if (!ready() || running) return;
    played = running = true; replay.setAttribute('aria-disabled', 'true');
    later(250, blink);
    later(800, () => { character.dataset.pose = 'turn'; });
    later(950, () => { character.dataset.pose = 'front'; });
    later(1500, blink);
    later(2300, () => { character.dataset.pose = 'turn'; });
    later(2450, () => { character.dataset.pose = 'side'; });
    later(3000, blink); later(3280, blink);
    later(3600, stop);
  };
  const sync = () => {
    replay.hidden = motion.matches || !pictures.every(p => p.complete && p.naturalWidth > 0);
    if (!ready()) stop(); else if (!played) play();
  };
  new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= .6); sync();
  }, {threshold:[0,.6]}).observe(character);
  pictures.forEach(p => { p.addEventListener('load', sync, {once:true}); p.addEventListener('error', sync, {once:true}); });
  replay.addEventListener('click', play);
  character.addEventListener('pointerenter', () => { if (hover.matches && played) play(); });
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  sync();
})();

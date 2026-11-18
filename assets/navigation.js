/* Persistent navigation with a quiet, keyboard-accessible return to the top. */
(() => {
  const topButton = document.querySelector('[data-back-to-top]');
  const homeLink = document.querySelector('.wordmark');
  if (!topButton) return;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const visible = window.scrollY > Math.max(480, window.innerHeight * .75);
    if (!visible && document.activeElement === topButton) homeLink?.focus({preventScroll:true});
    topButton.hidden = !visible;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  topButton.addEventListener('click', () => {
    homeLink?.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  update();
})();

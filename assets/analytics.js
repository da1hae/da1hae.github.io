/* Dawon Hae first-party measurement. No form text or contact details are read. */
(() => {
  const allowedOrigins = ['https://da1hae.xyz', 'https://www.da1hae.xyz'];
  if (!allowedOrigins.includes(location.origin) || window.DawonAnalytics) return;
  const measurementId = 'G-MZ6HBSS5EX';
  const path = location.pathname.replace(/\/index\.html$/, '/');
  const articleSlug = path.match(/^\/notes\/([a-z0-9-]+)\/?$/)?.[1] || '';
  const contentGroup = articleSlug ? 'notes_article' : path === '/notes/' ? 'notes_index'
    : path === '/' ? 'home' : path.split('/')[1] || 'other';
  const services = new Set(['undecided', 'monthly', 'content', 'ads', 'influencer', 'growth-crm',
    'diagnosis', 'landing', 'consulting', 'education', 'crm', 'brand', 'page']);
  const normalizeService = value => services.has(value) ? ({brand:'diagnosis',page:'landing',crm:'growth-crm'}[value] || value) : 'undecided';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  // Google owns the Organic Search and AI Assistant source classification.
  // Do not overwrite referrer, source, medium, campaign or send another page_view.
  window.gtag('js', new Date());
  const config = { content_group: contentGroup };
  if (new URLSearchParams(location.search).get('analytics_debug') === '1') config.debug_mode = true;
  window.gtag('config', measurementId, config);
  const loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(loader);

  const emit = (name, values = {}) => {
    try {
      // Only explicitly selected, low-cardinality parameters are sent.
      window.gtag('event', name, { send_to: measurementId, content_group: contentGroup,
        ...(articleSlug ? {article_slug: articleSlug} : {}), ...values });
    } catch (_) { /* Analytics must never interrupt navigation or inquiry delivery. */ }
  };
  let leadSent = false;
  window.DawonAnalytics = Object.freeze({
    lead(service) {
      if (leadSent) return;
      leadSent = true;
      emit('generate_lead', {service_key: normalizeService(service), placement: 'inquiry_form'});
    }
  });

  const placement = link => link.closest('header') ? 'header' : link.closest('footer') ? 'footer'
    : link.closest('article') ? 'article' : link.closest('.contact-band') ? 'contact_band' : 'main';
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let target;
    try { target = new URL(link.href, location.href); } catch (_) { return; }
    if (!allowedOrigins.includes(target.origin)) return;
    if (/^\/contact\/?$/.test(target.pathname)) {
      emit('inquiry_click', {service_key: normalizeService(target.searchParams.get('service')), placement: placement(link)});
    } else if (articleSlug && /^\/services\/?$/.test(target.pathname)) {
      emit('service_click', {service_key: normalizeService(target.hash.slice(1)), placement: placement(link)});
    }
  });

  const article = articleSlug && document.querySelector('article.editorial-body, article.story-body');
  if (!article) return;
  let visibleMs = 0;
  let previous = performance.now();
  let visible = document.visibilityState === 'visible';
  let depthReached = false;
  let engagedSent = false;
  const sample = () => {
    const now = performance.now();
    // Ignore long timer suspensions (sleep/background throttling).
    if (visible && document.visibilityState === 'visible') visibleMs += Math.min(Math.max(now - previous, 0), 2000);
    previous = now;
    visible = document.visibilityState === 'visible';
    const rect = article.getBoundingClientRect();
    if (visible && rect.height > 0 && (innerHeight - rect.top) / rect.height >= 0.75) depthReached = true;
    if (!engagedSent && depthReached && visibleMs >= 60000) {
      engagedSent = true;
      emit('article_engaged', {reading_seconds: Math.floor(visibleMs / 1000), scroll_percent: 75});
      clearInterval(timer);
      document.removeEventListener('visibilitychange', sample);
      window.removeEventListener('scroll', sample);
    }
  };
  const timer = setInterval(sample, 1000);
  document.addEventListener('visibilitychange', sample);
  window.addEventListener('scroll', sample, {passive: true});
  window.addEventListener('pagehide', () => { sample(); visible = false; });
  window.addEventListener('pageshow', () => { previous = performance.now(); visible = document.visibilityState === 'visible'; });
  sample();
})();

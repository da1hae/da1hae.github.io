(() => {
  // The capacity policy gets two gentle pulses on first view, then stays still.
  const notices = document.querySelectorAll('[data-slot-emphasis]');
  if (notices.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const noticeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-emphasized');
        noticeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    notices.forEach(notice => noticeObserver.observe(notice));
  }
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    menuButton.querySelector('span').textContent = '+';
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menuButton.querySelector('span').textContent = open ? '−' : '+';
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width:641px)').addEventListener('change', closeMenu);

  const form = document.querySelector('[data-inquiry]');
  if (!form) return;
  // Preserve the production Apps Script contract; localhost stays a dry run.
  const transport = window.DawonInquiry;
  const liveSubmission = transport?.canSubmit(location.origin) === true;
  const submitButton = form.querySelector('button[type=submit]');
  const submitLabel = submitButton.querySelector('[data-submit-label]');
  const notice = form.querySelector('.form-notice');
  const status = document.getElementById('form-status');
  if (!transport) {
    submitButton.disabled = true;
    status.textContent = '문의 기능을 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.';
    status.hidden = false;
    return;
  }
  submitButton.disabled = false;
  let busy = false;
  if (liveSubmission) {
    submitLabel.textContent = '문의 보내기';
    // Keep the existing privacy-policy link beside the live form.
  } else {
    submitLabel.textContent = '문의 내용 확인하기';
    notice.textContent = '로컬 미리보기에서는 문의가 전송되지 않습니다.';
    successHeadingForPreview();
  }
  function successHeadingForPreview() {
    document.querySelector('#form-success h2').textContent = '입력 내용 확인 완료';
    document.getElementById('confirmation-note').textContent = '기존 접수 항목에 맞춰 입력 내용을 확인했습니다. 미리보기라 실제 문의는 전송하지 않았습니다.';
  }
  const service = form.elements.namedItem('service');
  const query = new URLSearchParams(location.search).get('service');
  if (query && [...service.options].some(option => option.value === query)) service.value = query;
  const collaboration = form.elements.namedItem('collaboration');
  const collaborationQuery = new URLSearchParams(location.search).get('collaboration');
  if (collaborationQuery && [...collaboration.options].some(option => option.value === collaborationQuery)) collaboration.value = collaborationQuery;
  const success = document.getElementById('form-success');
  const fields = [...form.querySelectorAll('input,textarea,select')];
  const messages = {
    name: '이름 또는 브랜드명을 입력해 주세요.',
    email: '답변 받을 이메일 주소를 확인해 주세요.',
    phone: '연락 가능한 전화번호를 입력해 주세요.',
    message: '현재 운영 상황과 필요한 업무를 입력해 주세요.'
  };
  const clearError = field => {
    field.removeAttribute('aria-invalid');
    const error = document.getElementById(`${field.id}-error`);
    if (error) { error.textContent = ''; error.hidden = true; }
  };
  fields.forEach(field => field.addEventListener('input', () => {
    clearError(field);
    success.hidden = true;
    status.hidden = true;
    if (!busy) submitButton.disabled = false;
  }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    success.hidden = true;
    status.hidden = true;
    let firstInvalid;
    fields.forEach(field => {
      clearError(field);
      const blank = field.required && !field.value.trim();
      if (blank || !field.checkValidity()) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`);
        if (error) {
          error.textContent = messages[field.name] || '입력한 내용을 확인해 주세요.';
          error.hidden = false;
        }
        firstInvalid ||= field;
      }
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    document.getElementById('confirmed-collaboration').textContent = collaboration.selectedOptions[0].textContent;
    document.getElementById('confirmed-service').textContent = service.selectedOptions[0].textContent;
    const values = Object.fromEntries(new FormData(form));
    values.collaboration_label = collaboration.selectedOptions[0].textContent;
    values.service_label = service.selectedOptions[0].textContent;
    const payload = transport.buildPayload(values, location.origin + location.pathname);
    if (liveSubmission) {
      busy = true;
      submitButton.disabled = true;
      submitLabel.textContent = '전송 중';
      status.textContent = '문의를 전송하고 있습니다.';
      status.hidden = false;
      try {
        await transport.submit(payload);
        try { window.DawonAnalytics?.lead(service.value); } catch (_) { /* Delivery already succeeded. */ }
        success.querySelector('h2').textContent = '문의가 접수되었습니다.';
        document.getElementById('confirmation-note').textContent = '남겨주신 연락처로 협업 범위와 일정을 안내드립니다.';
        status.hidden = true;
      } catch (_) {
        status.textContent = '접수 완료 여부를 확인하지 못했습니다. 작성 내용은 그대로 남아 있습니다. 중복 전송을 피하려면 ramy_da@naver.com으로 접수 여부를 확인해 주세요.';
        submitButton.disabled = false;
        return;
      } finally {
        busy = false;
        submitLabel.textContent = '문의 보내기';
      }
    }
    success.hidden = false;
    success.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
})();

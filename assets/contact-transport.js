/* Existing Apps Script contract: name, phone, email, message, page.
   The responses sheet remains unchanged. Preview origins cannot send. */
((root) => {
  const endpoint = 'https://script.google.com/macros/s/AKfycbwVanJqC9uDUsFkSs1v2kZ8D6N85KSrmVqh0xmjGR1_izpRGC0qAc6R9ZJKEL601OX5/exec';
  const canSubmit = origin => ['https://da1hae.xyz', 'https://www.da1hae.xyz'].includes(origin);
  const clean = value => String(value || '').trim();
  const buildPayload = (values, page) => {
    const extra = [
      ['원하는 협업 방식', values.collaboration_label], ['필요한 마케팅 업무', values.service_label],
      ['브랜드 · 채널 링크', values.brand_url], ['희망 일정', values.schedule],
      ['월간 예산 범위', values.budget], ['내부 담당자와 제작 자원', values.resources]
    ].filter(([, value]) => clean(value)).map(([label, value]) => `${label}: ${clean(value)}`);
    return {
      name: clean(values.name), phone: clean(values.phone), email: clean(values.email),
      message: [clean(values.message), extra.join('\n')].filter(Boolean).join('\n\n'),
      page
    };
  };
  const submit = async (payload, { origin = root.location?.origin, request = root.fetch } = {}) => {
    if (!canSubmit(origin)) throw new Error('preview-only');
    if (!payload.name || !payload.phone || !payload.email || !payload.message) throw new Error('missing-fields');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await request(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (!response.ok) throw new Error('unconfirmed');
      const result = JSON.parse(await response.text());
      if (result.ok !== true) throw new Error('unconfirmed');
      return result;
    } finally { clearTimeout(timeout); }
  };
  const api = { endpoint, canSubmit, buildPayload, submit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DawonInquiry = api;
})(globalThis);

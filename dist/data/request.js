/* Dataset request form ("Download the … dataset"), shared by the FinScope pages.
   Sends the request to the website server (/api/forms/dataset), which stores it privately and emails the download link.
   Usage: FMTRequest({ survey: 'consumer' | 'msme', ctx: () => ({ iso, year, name }) }) once the page has the form markup. */
window.FMTRequest = function (opts) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const form = $('reqForm'); if (!form) return;
  const opened = Date.now();
  const rules = {
    rFirst: v => v.trim() ? '' : 'Enter your first name.', rLast: v => v.trim() ? '' : 'Enter your surname.',
    rEmail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email address like name@organisation.org.',
    rOrg: v => v.trim() ? '' : 'Enter your organisation.', rType: v => v ? '' : 'Choose the type of organisation.',
    rUse: v => v.trim().length >= 15 ? '' : 'Tell us a little more (at least 15 characters).'
  };
  const check = id => { const f = $(id).closest('.field'), msg = rules[id]($(id).value); f.classList.toggle('invalid', !!msg); f.querySelector('.err').textContent = msg; return !msg; };
  Object.keys(rules).forEach(id => $(id) && $(id).addEventListener('input', () => check(id)));
  const btn = $('rSubmit'), btnText = btn ? btn.textContent : '';
  const fail = msg => { $('termsErr').textContent = msg; if (btn) { btn.disabled = false; btn.textContent = btnText; } };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = Object.keys(rules).map(check).every(Boolean);
    if (!$('rTerms').checked) { $('termsErr').textContent = 'Accept the terms of use to continue.'; ok = false; } else $('termsErr').textContent = '';
    if (!ok) { const bad = form.querySelector('.invalid input,.invalid select,.invalid textarea'); if (bad) bad.focus(); return; }
    const c = opts.ctx(), first = $('rFirst').value.trim(), email = $('rEmail').value.trim();
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    let res, j = {};
    try {
      res = await fetch('/api/forms/dataset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        first, last: $('rLast').value.trim(), email, organisation: $('rOrg').value.trim(), orgType: $('rType').value, use: $('rUse').value.trim(),
        survey: opts.survey, iso: c.iso, year: String(c.year), terms: true, website: ($('rWebsite') || {}).value || '', elapsed: Date.now() - opened }) });
      j = await res.json().catch(() => ({}));
    } catch (err) { return fail('We could not send your request. Check your connection and try again, or email info@finmark.org.za.'); }
    if (!res.ok) return fail(j.error || 'We could not send your request. Please try again, or email info@finmark.org.za.');
    const label = `${c.label || 'FinScope ' + (opts.survey === 'msme' ? 'MSME' : 'Consumer')} ${c.name} ${c.year}`;
    $('reqDone').innerHTML = `
      <div><p class="eyebrow">Request received</p><h3 style="color:var(--navy);font-size:1.3rem">${j.emailed === false ? 'Thank you' : 'Check your inbox'}, ${esc(first)}</h3>
      <p class="note" style="margin:6px 0 0">${j.emailed === false
        ? `Your request for the <b>${esc(label)}</b> dataset is logged. We will email the download link to <b>${esc(email)}</b> shortly.`
        : `We have sent the download link for the <b>${esc(label)}</b> dataset to <b>${esc(email)}</b>. It can take a few minutes to arrive, so check your junk folder too.`}</p></div>
      <p>Please cite: ${esc(c.cite || `FinMark Trust (${c.year}). ${label} survey.`)}</p>
      <button class="btn ghost" type="button" id="reqAgain">Request another dataset</button>`;
    form.hidden = true; $('reqDone').hidden = false;
    const h = $('reqDone').querySelector('h3'); h.setAttribute('tabindex', '-1'); h.focus();
    $('reqAgain').onclick = () => { form.reset(); if (btn) { btn.disabled = false; btn.textContent = btnText; } $('reqDone').hidden = true; form.hidden = false; $('rFirst').focus(); };
  });
};

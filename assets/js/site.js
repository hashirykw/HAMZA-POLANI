/* Sir Hamza Ali Polani — site behaviour. Built by Nexlyr Solutions. */
(() => {
  'use strict';
  const WA = '923312364114';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.95 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -100 }); }
    }));
  }
  const lockScroll = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); };

  /* ---------- Nav ---------- */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-top', scrollY < 24);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  $$('.nav__drop').forEach(d => {
    const btn = $('button', d);
    let t;
    const open = (v) => { d.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', v); };
    btn.addEventListener('click', () => open(!d.classList.contains('is-open')));
    d.addEventListener('mouseenter', () => { clearTimeout(t); open(true); });
    d.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 160); });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') { open(false); btn.focus(); } });
    document.addEventListener('click', e => { if (!d.contains(e.target)) open(false); });
  });

  const burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    const set = (v) => {
      burger.setAttribute('aria-expanded', v);
      menu.classList.toggle('is-open', v);
      if (v) { const f = $('a', menu); f && f.focus({ preventScroll: true }); }
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', e => { if (!menu.contains(e.target) && !burger.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); burger.focus(); } });
    $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  }

  /* ---------- Reveal (below-the-fold only; never hides text that is already on screen) ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
    ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  $$('[data-reveal], [data-inview]').forEach(el => {
    if (!io || el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); else io.observe(el);
  });
  document.documentElement.classList.add('js-ready');

  /* ---------- Count-up ---------- */
  const fmt = (n) => n.toLocaleString('en-US');
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(Math.round(end * e)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) counters.forEach(el => el.textContent = fmt(+el.dataset.count));
    else {
      const co = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } }), { threshold: .6 });
      counters.forEach(el => co.observe(el));
    }
  }

  /* ---------- Testimonials ---------- */
  const qs = $('.quotes');
  if (qs) {
    const items = $$('.quote', qs), count = $('.qcount');
    let idx = 0;
    const go = (i) => { idx = (i + items.length) % items.length; qs.scrollTo({ left: items[idx].offsetLeft - qs.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    $('.qbtn--prev')?.addEventListener('click', () => go(idx - 1));
    $('.qbtn--next')?.addEventListener('click', () => go(idx + 1));
    qs.addEventListener('scroll', () => {
      const i = Math.round(qs.scrollLeft / qs.clientWidth); idx = i;
      if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    }, { passive: true });
  }

  /* ---------- Star rating ---------- */
  const rate = $('.rate');
  if (rate) {
    const stars = $$('.stars button', rate); let val = 0;
    const paint = (n) => stars.forEach((b, i) => b.classList.toggle('on', i < n));
    stars.forEach((b, i) => {
      b.addEventListener('mouseenter', () => paint(i + 1));
      b.addEventListener('focus', () => paint(i + 1));
      b.addEventListener('click', () => { val = i + 1; paint(val); stars.forEach((s, j) => s.setAttribute('aria-checked', j === i)); $('.rate__val', rate).textContent = `${val} / 5`; });
    });
    $('.stars', rate).addEventListener('mouseleave', () => paint(val));
    $('.rate__send', rate)?.addEventListener('click', () => {
      if (!val) { $('.rate__val', rate).textContent = 'Pick 1–5 stars first'; stars[4].focus(); return; }
      const fb = $('textarea', rate).value.trim();
      window.open(waLink(`Assalam o Alaikum Sir Hamza! I'm rating my Pakistan Studies classes: ${'★'.repeat(val)}${'☆'.repeat(5 - val)} (${val}/5).${fb ? '\n\n' + fb : ''}`), '_blank', 'noopener');
      rate.classList.add('is-done');
    });
  }

  /* ---------- Themed select ---------- */
  let selId = 0;
  $$('select.js-select').forEach(sel => {
    const wrap = document.createElement('div'); wrap.className = 'sel';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    const id = `sel-${++selId}`;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sel__btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    const lbl = sel.id && $(`label[for="${sel.id}"]`);
    if (lbl) { lbl.id = lbl.id || `${id}-l`; btn.setAttribute('aria-labelledby', `${lbl.id} ${id}-v`); lbl.addEventListener('click', e => { e.preventDefault(); btn.focus(); }); }
    btn.innerHTML = `<span id="${id}-v"></span><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>`;
    const list = document.createElement('ul'); list.className = 'sel__list glass'; list.id = id; list.setAttribute('role', 'listbox'); list.tabIndex = -1;
    wrap.append(btn, list);
    const opts = [...sel.options];
    let active = -1;
    opts.forEach((o, i) => {
      if (o.disabled && !o.value) return;
      const li = document.createElement('li'); li.setAttribute('role', 'option'); li.id = `${id}-o${i}`; li.dataset.i = i; li.textContent = o.textContent;
      li.addEventListener('click', () => { choose(i); close(); btn.focus(); });
      li.addEventListener('mousemove', () => setActive(i));
      list.appendChild(li);
    });
    const lis = () => $$('li', list);
    const sync = () => {
      const o = sel.options[sel.selectedIndex]; const v = $(`#${id}-v`);
      const ph = !o || (o.disabled && !o.value);
      v.textContent = o ? o.textContent : ''; v.className = ph ? 'ph' : '';
      lis().forEach(li => li.setAttribute('aria-selected', +li.dataset.i === sel.selectedIndex));
    };
    const setActive = (i) => { active = i; lis().forEach(li => li.classList.toggle('is-active', +li.dataset.i === i)); const a = $(`#${id}-o${i}`); if (a) { list.setAttribute('aria-activedescendant', a.id); a.scrollIntoView({ block: 'nearest' }); } };
    const choose = (i) => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); wrap.closest('.field')?.classList.remove('has-error'); };
    const open = () => {
      $$('.sel.is-open').forEach(s => s !== wrap && s.querySelector('.sel__btn').click());
      const r = btn.getBoundingClientRect(); wrap.classList.toggle('is-up', innerHeight - r.bottom < 280 && r.top > 300);
      wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      setActive(sel.selectedIndex > 0 || !(sel.options[0]?.disabled) ? sel.selectedIndex : +lis()[0].dataset.i);
    };
    const close = () => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => wrap.classList.contains('is-open') ? close() : open());
    btn.addEventListener('keydown', e => {
      const items = lis().map(li => +li.dataset.i); const pos = items.indexOf(active);
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (!wrap.classList.contains('is-open')) return open(); setActive(items[Math.max(0, Math.min(items.length - 1, pos + (e.key === 'ArrowDown' ? 1 : -1)))]); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); setActive(items[e.key === 'Home' ? 0 : items.length - 1]); }
      else if (e.key === 'Enter' || e.key === ' ') { if (wrap.classList.contains('is-open')) { e.preventDefault(); choose(active); close(); } }
      else if (e.key === 'Escape' || e.key === 'Tab') close();
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
    sel.addEventListener('change', sync);
    sync();
  });

  /* ---------- Booking forms → WhatsApp ---------- */
  $$('form[data-wa]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => {
        const field = f.closest('.field'); const bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10) || (f.type === 'email' && f.value && !/^\S+@\S+\.\S+$/.test(f.value));
        field?.classList.toggle('has-error', bad); if (bad && ok) { ok = false; (field?.querySelector('.sel__btn') || f).focus(); }
      });
      if (!ok) return;
      const lines = ['Assalam o Alaikum Sir Hamza! I would like to book a free Pakistan Studies class.', ''];
      $$('input, select, textarea', form).forEach(f => {
        if (!f.name || !f.value.trim()) return;
        const val = f.tagName === 'SELECT' ? f.options[f.selectedIndex].text : f.value.trim();
        lines.push(`${f.dataset.label || f.name}: ${val}`);
      });
      const btn = $('button[type="submit"]', form);
      btn.dataset.state = 'loading';
      setTimeout(() => {
        window.open(waLink(lines.join('\n')), '_blank', 'noopener');
        btn.dataset.state = 'success'; btn.querySelector('.btn__txt').textContent = 'Opened in WhatsApp';
        form.closest('.form')?.classList.add('is-sent');
        setTimeout(() => { delete btn.dataset.state; btn.querySelector('.btn__txt').textContent = btn.dataset.text; }, 4000);
      }, 450);
    });
    $$('input, textarea', form).forEach(f => f.addEventListener('input', () => f.closest('.field')?.classList.remove('has-error')));
  });
  $$('button[type="submit"] .btn__txt').forEach(t => t.closest('button').dataset.text = t.textContent);

  /* ---------- Lightbox ---------- */
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb), cnt = $('.lb__bar span', lb);
    let group = [], i = 0, last = null;
    const show = () => { const g = group[i]; img.src = g.dataset.full; img.alt = g.dataset.alt || ''; cnt.textContent = `${i + 1} / ${group.length}`; };
    const open = (el) => {
      last = el; group = $$(`[data-lb="${el.dataset.lb}"]`).filter(x => x.offsetParent !== null); i = group.indexOf(el);
      show(); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lockScroll(true); $('.lb__x', lb).focus();
    };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lockScroll(false); last && last.focus(); };
    document.addEventListener('click', e => { const t = e.target.closest('[data-lb]'); if (t) { e.preventDefault(); open(t); } });
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', () => { i = (i - 1 + group.length) % group.length; show(); });
    $('.lb__next', lb).addEventListener('click', () => { i = (i + 1) % group.length; show(); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') $('.lb__next', lb).click(); if (e.key === 'ArrowLeft') $('.lb__prev', lb).click();
    });
  }

  /* ---------- Results year filter ---------- */
  const yseg = $('#years');
  if (yseg) {
    const btns = $$('button', yseg);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      const y = b.dataset.y;
      $$('.results-grid .sheet').forEach(s => s.hidden = y !== 'all' && s.dataset.y !== y);
    }));
  }

  /* ---------- Past papers browser ---------- */
  const pl = $('#plist');
  if (pl && window.PAPERS) {
    const ysel = $('#pyear'), tseg = $('#ptype');
    let type = 'all';
    const render = () => {
      const y = ysel.value;
      const rows = window.PAPERS.filter(p => y === 'all' || String(p.y) === y);
      pl.innerHTML = rows.map(p => {
        const files = p.f.filter(([l]) => type === 'all' || (type === 'qp' && /Question|Specimen Paper/.test(l)) || (type === 'ms' && /Mark/.test(l)) || (type === 'more' && /Insert|Examiner|Grade|Specimen Insert/.test(l)));
        if (!files.length) return '';
        return `<article class="psess"><h3>${p.s} ${p.y}<span>${files.length} file${files.length > 1 ? 's' : ''}</span></h3><div class="pfiles">${files.map(([l, f]) => `<a href="${window.PAPERS_BASE + f}" target="_blank" rel="noopener"><i>PDF</i>${l}</a>`).join('')}</div></article>`;
      }).join('') || '<p class="muted">No files for this filter.</p>';
    };
    ysel.addEventListener('change', render);
    $$('button', tseg).forEach(b => b.addEventListener('click', () => { $$('button', tseg).forEach(x => x.setAttribute('aria-pressed', x === b)); type = b.dataset.t; render(); }));
    render();
  }

  /* ---------- Map (loads on request) ---------- */
  $$('[data-map]').forEach(btn => btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=verge%20schooling%20system%20karachi&t=m&z=16&output=embed';
    f.title = 'Map — Verge Schooling System, Karachi'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    btn.replaceWith(f);
  }));

  /* ---------- Chat assistant (compact panel) ---------- */
  const bot = $('.bot');
  if (bot) {
    const log = $('.bot__log', bot), form = $('.bot__form', bot), input = $('input', form);
    const html = document.documentElement;
    let greeted = false;
    const add = (text, who = 'bot') => { const m = document.createElement('div'); m.className = `msg msg--${who}`; m.innerHTML = text; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
    const say = (text) => { const t = add('<i></i><i></i><i></i>'); t.classList.add('msg--typing'); setTimeout(() => { t.remove(); add(text); }, reduce ? 50 : 650); };
    const wa = (q) => `<a href="${waLink(q || 'Assalam o Alaikum Sir Hamza! I have a question about Pakistan Studies classes.')}" target="_blank" rel="noopener">Message on WhatsApp</a>`;
    const KB = [
      [/\b(hi|hello|hey|salam|assalam|aoa|hy)\b/, () => `Wa alaikum assalam! Ask me about classes, the free trial, results, fees, timings or past papers.`],
      [/fee|price|cost|charges|kitni|discount|scholar/, () => `Fees are shared directly by Sir Hamza — they aren't published online. Scholarships (up to 100%) and discounts are offered for deserving students. ${wa('Assalam o Alaikum Sir! Could you share the fee details for O Level Pakistan Studies?')}`],
      [/free|demo|trial|book|register|admission|join|enrol/, () => `Yes — your first class is free. Fill the <a href="contact.html#book">booking form</a> or ${wa('Assalam o Alaikum Sir! I want to book my free Pakistan Studies class.')}. You'll hear back within 24 hours.`],
      [/time|timing|schedule|batch|slot|days|when.*class/, () => `Batch timings change each session, so Sir Hamza confirms them when you book. Slots are limited. ${wa('Assalam o Alaikum Sir! What are the current batch timings?')}`],
      [/online|zoom|live|city|lahore|islamabad|abroad|outside/, () => `Live, interactive online classes run for students across Pakistan and abroad — Karachi, Lahore, Islamabad, Multan, Faisalabad, Peshawar and more. Karachi students can also join on-campus.`],
      [/campus|address|location|where|karachi|bahadurabad|kmchs|map/, () => `On-campus classes are in Karachi (Bahadurabad area): Plot # 10, Street 3, KMCHS, Karachi. See the <a href="contact.html">contact page</a> for the map.`],
      [/2059|0448|igcse|syllabus|paper|topic|history|geography|environment/, () => `Classes cover O Level 2059 and IGCSE 0448. Paper 1 — History & Culture of Pakistan; Paper 2 — Environment of Pakistan. Each is 1 h 30 min, 75 marks, 50% of the grade. <a href="courses.html">See the full course</a>.`],
      [/result|a\*|grade|star|topper/, () => `Sir Hamza's students have earned 6,000+ A* and A grades and 3,500+ B grades. <a href="results.html">Browse the published result sheets</a>.`],
      [/about|who|experience|qualif|degree|teacher|hma|polani/, () => `Sir Hamza Ali Polani (HMA — Hamza M. Ali) has taught Pakistan Studies for 12+ years. He did O Levels (2009), A Levels (2010), a B.Com (2014) and is a Certified Chartered Accountant. He directs Verge Schooling System & Coaching Centre. <a href="about.html">Read more</a>.`],
      [/past|notes|resource|pdf|mark scheme|download/, () => `Free past papers from 2004 to 2024 — question papers, mark schemes, inserts and examiner reports — are on the <a href="resources.html">resources page</a>.`],
      [/school|verge|alpha|beacon|city school|wahaj|dm/, () => `He teaches at Verge, Alpha, Wahaj Hussain and DM Public School, and has taught at The City School and Beaconhouse.`],
      [/tip|how.*a\*|score|prepare|study/, () => `To aim for an A*: cover the whole syllabus, practise every question type (source-based, 4, 7 and 14-mark), back answers with dates, names and statistics, and do timed past papers against mark schemes.`],
      [/start|o1|o2|year/, () => `Most students start in O1 and study across two years, but you can join at any point — the free class is the easiest way to see where you stand.`],
      [/contact|phone|number|call|whatsapp|email/, () => `Call or WhatsApp <a href="tel:+923312364114">+92 331 2364114</a> · email <a href="mailto:support@cambridgepsttutor.com">support@cambridgepsttutor.com</a>.`],
      [/thank|thanks|shukria|jazak/, () => `You're welcome — good luck with Pakistan Studies!`]
    ];
    const reply = (q) => {
      const s = q.toLowerCase();
      const hit = KB.find(([re]) => re.test(s));
      say(hit ? hit[1]() : `I'm not sure about that one. Sir Hamza can answer directly — ${wa(`Assalam o Alaikum Sir! ${q}`)}.`);
    };
    const open = (v) => {
      html.classList.toggle('bot-open', v); bot.setAttribute('aria-hidden', !v);
      $('.bot-launch').setAttribute('aria-expanded', v);
      if (v) {
        if (!greeted) { greeted = true; say(`Assalam o Alaikum! I'm Sir Hamza's class assistant. How can I help — free class, fees, timings or results?`); }
        setTimeout(() => input.focus({ preventScroll: true }), 200);
      } else $('.bot-launch').focus({ preventScroll: true });
    };
    $('.bot-launch').addEventListener('click', () => open(true));
    $('.bot__x', bot).addEventListener('click', () => open(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && html.classList.contains('bot-open')) open(false); });
    $$('.bot__chips button', bot).forEach(b => b.addEventListener('click', () => { add(b.textContent, 'me'); reply(b.dataset.q || b.textContent); }));
    form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (!q) return; add(q.replace(/</g, '&lt;'), 'me'); input.value = ''; reply(q); });
  }

  /* ---------- Year in footer ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();

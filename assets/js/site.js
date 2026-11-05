/* ITology site script — shared by every page (English and Arabic). */
(function () {
  'use strict';

  /* ================= SETTINGS YOU CAN EDIT ================= */
  // Contact form: sent by FormSubmit (formsubmit.co) to this inbox.
  var FORM_EMAIL = 'info@itology.ae';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + FORM_EMAIL;
  // WhatsApp: international format, digits only.
  var WHATSAPP_NUMBER = '971506224664';
  /* ========================================================== */

  var doc = document.documentElement;
  var lang = doc.lang === 'ar' ? 'ar' : 'en';
  var STR = {
    en: { close: 'Close details', switching: 'Switching practice', ad: 'Abu Dhabi Practice', db: 'Dubai Practice',
          adSub: 'Energy & Asset Governance', dbSub: 'AI, Cyber & Data Practice',
          thanks: 'Thank you! Your briefing request has been received.', subscribed: 'Subscribed!',
          mailOpened: 'Your email app has opened with the message ready to send.', error: 'Something went wrong. Please email us directly.' },
    ar: { close: 'إغلاق التفاصيل', switching: 'جارٍ تبديل الممارسة', ad: 'ممارسة أبوظبي', db: 'ممارسة دبي',
          adSub: 'الطاقة وحوكمة الأصول', dbSub: 'ممارسة الذكاء الاصطناعي والأمن السيبراني والبيانات',
          thanks: 'شكراً لك! تم استلام طلب الإحاطة الخاص بك.', subscribed: 'تم الاشتراك!',
          mailOpened: 'تم فتح تطبيق البريد الإلكتروني والرسالة جاهزة للإرسال.', error: 'حدث خطأ ما. يرجى مراسلتنا عبر البريد الإلكتروني مباشرة.' }
  }[lang];
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var pageOffice = document.body.getAttribute('data-page-office'); // 'ad', 'db' or ''

  /* The chooser page always shows both practices (no remembered choice). */

  /* ---------- Header, scroll progress, back to top ---------- */
  var header = document.getElementById('mainNav');
  var progress = document.getElementById('scrollProgress');
  var toTop = document.getElementById('toTop');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 40);
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    toTop.classList.toggle('show', y > 700);
    ticking = false;
  }
  progress.style.width = '100%'; progress.style.transformOrigin = lang === 'ar' ? 'right' : 'left';
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burgerBtn');
  var mq = window.matchMedia('(max-width: 1100px)');
  function closeNav() {
    document.body.classList.remove('nav-open', 'no-scroll');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.nav-item.open').forEach(function (i) { i.classList.remove('open'); });
  }
  if (burger) burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    document.body.classList.toggle('no-scroll', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav-item > .nav-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!mq.matches) return;
      var item = btn.parentElement, wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });
  document.querySelectorAll('.dropdown-menu a').forEach(function (a) {
    a.addEventListener('click', function () { closeNav(); if (document.activeElement) document.activeElement.blur(); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  mq.addEventListener ? mq.addEventListener('change', function (e) { if (!e.matches) closeNav(); }) : null;

  /* ---------- Reveal on scroll (staggered) ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
      el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * 0.08) + 's');
      io.observe(el);
    });
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseInt(el.getAttribute('data-count'), 10), c = 0, step = Math.max(1, Math.ceil(target / 40));
        var timer = setInterval(function () { c += step; if (c >= target) { c = target; clearInterval(timer); } el.textContent = c + '+'; }, 35);
        statIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat-val[data-count]').forEach(function (el) { statIO.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Expand / collapse ---------- */
  document.querySelectorAll('.expand-trigger').forEach(function (btn) {
    var span = btn.querySelector('span'), label = span ? span.textContent : '';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var content = btn.nextElementSibling, open = content.classList.toggle('open');
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (span) span.textContent = open ? STR.close : label;
    });
  });

  /* ---------- Service filters ---------- */
  document.querySelectorAll('.filter-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('active'); chip.setAttribute('aria-pressed', 'true');
      var cat = chip.getAttribute('data-filter');
      document.querySelectorAll('#servicesGrid .service-card').forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-category') === cat;
        card.style.display = show ? '' : 'none';
        card.classList.remove('fade-in');
        if (show) { card.classList.add('visible'); void card.offsetWidth; card.classList.add('fade-in'); }
      });
    });
  });

  /* ---------- Office switch (3-second transition, then the other practice page) ---------- */
  var SKY = {
    ad: '<path d="M10 120 H510"/><path d="M30 120 V70 H60 V120"/><path d="M70 120 V50 H95 V120"/><path d="M110 120 V78 Q140 40 170 78 V120"/><path d="M182 120 V60 H210 V120"/><path d="M222 120 V36 H244 V120"/><path d="M256 120 V84 H330 V120"/><path d="M268 84 Q293 54 318 84"/><line x1="293" y1="58" x2="293" y2="44"/><path d="M344 120 V62 H372 V120"/><path d="M384 120 V74 H430 V120"/><path d="M442 120 V54 H474 V120"/><polyline points="440,30 455,22 470,30"/>',
    db: '<path d="M10 120 H510"/><path d="M24 120 V80 H54 V120"/><path d="M62 120 V62 H86 V120"/><path d="M96 120 V58 Q112 40 126 120"/><path d="M138 120 V72 H166 V120"/><path d="M240 120 L248 50 L254 8 L260 50 L268 120"/><path d="M236 120 V92 H272 V120"/><path d="M286 120 V52 H308 V120"/><path d="M318 120 V66 H346 V120"/><path d="M356 120 V56 L384 42 V120"/><path d="M396 120 V78 H432 V120"/><path d="M442 120 V64 H472 V120"/><circle cx="420" cy="28" r="10"/>'
  };
  var PAGE = { ad: 'abu-dhabi.html', db: 'dubai.html' };
  var ov = document.getElementById('switchOverlay');
  var switching = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markOffice(office) {
    document.querySelectorAll('[data-office-btn]').forEach(function (b) {
      var on = b.getAttribute('data-office-btn') === office;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function fillOverlay(office) {
    ov.classList.toggle('db', office === 'db');
    var sky = document.getElementById('switchSkyline');
    sky.innerHTML = SKY[office];
    sky.setAttribute('stroke', office === 'db' ? '#a78bfa' : '#60a5fa');
    document.getElementById('switchLabel').textContent = STR.switching;
    document.getElementById('switchTitle').textContent = STR[office];
    document.getElementById('switchSub').textContent = STR[office + 'Sub'];
  }
  function switchOffice(office, ev) {
    if (switching) return;
    closeNav();
    store.set('itology_office', office);
    markOffice(office);
    if (pageOffice === office) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (reduceMotion) { window.location.href = PAGE[office]; return; }
    switching = true;
    if (ev && ev.clientX) { ov.style.setProperty('--cx', ev.clientX + 'px'); ov.style.setProperty('--cy', ev.clientY + 'px'); }
    fillOverlay(office);
    ov.classList.remove('leaving', 'arrive'); void ov.offsetWidth; ov.classList.add('active');
    document.body.classList.add('no-scroll');
    try { sessionStorage.setItem('itology_arrive', office); } catch (e) {}
    setTimeout(function () { window.location.href = PAGE[office]; }, 3000);
  }
  window.switchOffice = switchOffice;
  document.querySelectorAll('[data-office-btn]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); switchOffice(b.getAttribute('data-office-btn'), e); });
  });

  // Highlight the current or last chosen practice, and finish the transition after arriving
  if (pageOffice) store.set('itology_office', pageOffice);
  markOffice(pageOffice || '');
  var arriving = null;
  try { arriving = sessionStorage.getItem('itology_arrive'); sessionStorage.removeItem('itology_arrive'); } catch (e) {}
  if (arriving && arriving === pageOffice && !reduceMotion) {
    fillOverlay(arriving);
    ov.classList.add('arrive');
    requestAnimationFrame(function () {
      setTimeout(function () { ov.classList.remove('arrive'); ov.classList.add('leaving'); }, 250);
      setTimeout(function () { ov.classList.remove('leaving'); }, 1000);
    });
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { ov.classList.remove('active', 'arrive', 'leaving'); document.body.classList.remove('no-scroll'); switching = false; } });

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById('toast'), toastTimer;
  function toast(msg) {
    document.getElementById('toastText').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3600);
  }

  /* ---------- Forms ---------- */
  function mailtoFallback(data, subject) {
    var body = [];
    data.forEach(function (v, k) { if (v && k.charAt(0) !== '_') body.push(k + ': ' + v); });
    window.location.href = 'mailto:' + FORM_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.join('\n'));
    toast(STR.mailOpened);
  }
  function sendForm(form, subject, okMsg) {
    var data = new FormData(form);
    if (data.get('_honey')) return; // spam bot
    data.append('_subject', subject);
    data.append('_captcha', 'false');
    data.append('page', document.title);
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || String(res.j.success) !== 'true') throw new Error(res.j && res.j.message);
        form.reset(); toast(okMsg);
      })
      .catch(function () { mailtoFallback(data, subject); })
      .then(function () { if (btn) btn.disabled = false; });
  }
  var bf = document.getElementById('briefingForm');
  if (bf) bf.addEventListener('submit', function (e) { e.preventDefault(); sendForm(bf, 'Executive briefing request (ITology website)', STR.thanks); });
  document.querySelectorAll('.newsletter-form').forEach(function (nf) {
    nf.addEventListener('submit', function (e) { e.preventDefault(); sendForm(nf, 'Newsletter subscription (ITology website)', STR.subscribed); });
  });

  /* ---------- WhatsApp ---------- */
  var wa = document.getElementById('waFloat');
  if (wa && WHATSAPP_NUMBER) { wa.href = 'https://wa.me/' + WHATSAPP_NUMBER; wa.classList.add('on'); }

  /* ---------- Photos: local file first, then the stock photo, then the designed fallback ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function fail() {
      var alt = img.getAttribute('data-alt-src');
      if (alt && img.src !== alt) { img.removeAttribute('data-alt-src'); img.src = alt; return; }
      img.classList.add('img-failed');
    }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- Optional photos and logos: appear only when the file exists ---------- */
  document.querySelectorAll('img[data-optional]').forEach(function (img) {
    var slot = img.closest('.logo-slot');
    function ok() { if (slot) slot.classList.add('has-logo'); if (img.parentElement) img.parentElement.classList.add('has-photo'); }
    function missing() { img.classList.add('img-missing'); if (slot) slot.classList.remove('has-logo'); }
    img.addEventListener('load', ok); img.addEventListener('error', missing);
    if (img.complete) { if (img.naturalWidth > 0) ok(); else missing(); }
  });
})();

/* ---------- Tabs (shorter page: related sections share one block) ---------- */
(function () {
  'use strict';
  function show(btn, focus) {
    var box = btn.closest('[data-tabs]');
    box.querySelectorAll('[role="tab"]').forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      var p = document.getElementById(b.getAttribute('aria-controls'));
      p.hidden = !on; p.classList.toggle('active', on);
      if (on) p.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
    });
    var list = btn.parentElement;
    if (list.scrollWidth > list.clientWidth) {
      var lr = list.getBoundingClientRect(), br = btn.getBoundingClientRect();
      list.scrollLeft += (br.left + br.width / 2) - (lr.left + lr.width / 2);
    }
    if (focus) btn.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var btns = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    btns.forEach(function (b, i) {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener('click', function () { show(b); });
      b.addEventListener('keydown', function (e) {
        var rtl = document.documentElement.dir === 'rtl', d = 0;
        if (e.key === 'ArrowRight') d = rtl ? -1 : 1;
        if (e.key === 'ArrowLeft') d = rtl ? 1 : -1;
        if (!d) return;
        e.preventDefault();
        show(btns[(i + d + btns.length) % btns.length], true);
      });
    });
  });
  // Menu links to a section that now lives inside a tab: open that tab, then scroll to the block
  function openFor(id, smooth) {
    var el = id && document.getElementById(id);
    if (!el) return false;
    var panel = el.closest('[role="tabpanel"]');
    if (!panel) return false;
    show(document.getElementById(panel.getAttribute('aria-labelledby')));
    var box = panel.closest('[data-tabs]');
    var y = box.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    if (openFor(a.getAttribute('href').slice(1), true)) {
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
    }
  });
  if (location.hash) setTimeout(function () { openFor(location.hash.slice(1), false); }, 60);
})();

/* ---------- "Learn about the service / product": open the contact form with the service already written ---------- */
(function () {
  'use strict';
  var ar = (document.documentElement.lang || '').slice(0, 2) === 'ar';
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ask]');
    if (!a) return;
    var card = a.closest('.feature-card'), t = card && card.querySelector('.card-title');
    var title = t ? t.textContent.trim() : '';
    var msg = document.getElementById('f-msg');
    if (!msg) {
      // Contact form lives on the practice home page: carry the service name there
      var home = document.body.getAttribute('data-page-office') === 'db' ? 'dubai.html' : 'abu-dhabi.html';
      e.preventDefault();
      window.location.href = home + '?ask=' + encodeURIComponent(title) + '#contact';
      return;
    }
    if (title) msg.value = (ar ? 'أرغب في معرفة المزيد عن: ' : 'I would like to learn more about: ') + title;
    var sel = document.getElementById('f-practice'), office = document.body.getAttribute('data-page-office');
    if (sel && office) sel.value = office;
    setTimeout(function () { var n = document.getElementById('f-name'); if (n) n.focus({ preventScroll: true }); }, 700);
  });
  // Arriving from a "Learn about" button on another page
  var m = /[?&]ask=([^&#]*)/.exec(location.search), msg = document.getElementById('f-msg');
  if (m && msg) {
    var t = decodeURIComponent(m[1].replace(/\+/g, ' '));
    if (t) msg.value = (ar ? 'أرغب في معرفة المزيد عن: ' : 'I would like to learn more about: ') + t;
    var sel = document.getElementById('f-practice'), office = document.body.getAttribute('data-page-office');
    if (sel && office) sel.value = office;
  }
})();

/* ---------- Phones: tap-to-open service index, product tiles; card spotlight on desktop ---------- */
(function () {
  'use strict';
  var mq = window.matchMedia('(max-width: 760px)');
  document.querySelectorAll('.card-grid-3, .card-grid-4').forEach(function (g) {
    var cards = Array.prototype.filter.call(g.children, function (c) { return c.classList.contains('feature-card') && !c.classList.contains('about-card'); });
    if (cards.length < 2) return;
    var products = cards.every(function (c) { return c.querySelector('a.learn-btn[data-ask]'); });
    if (products) { g.classList.add('m-tiles'); return; }
    g.classList.add('m-acc');
    cards.forEach(function (c, i) {
      var head = c.firstElementChild;
      var ic = document.createElement('span');
      ic.className = 'm-acc-ic'; ic.setAttribute('aria-hidden', 'true');
      head.appendChild(ic);
      if (i === 0) c.classList.add('m-open');
      head.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      function toggle() {
        if (!mq.matches) return;
        var open = c.classList.toggle('m-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', function (e) { if (mq.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(); } });
      function a11y() { if (mq.matches) { head.setAttribute('role', 'button'); head.tabIndex = 0; } else { head.removeAttribute('role'); head.removeAttribute('tabindex'); } }
      a11y(); if (mq.addEventListener) mq.addEventListener('change', a11y);
    });
  });
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.feature-card, .flow-step, .engage-step, .team-card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }
})();

/* ---------- Language switch transition (like the office switch) ---------- */
(function () {
  'use strict';
  var ov = document.getElementById('langOverlay');
  if (!ov) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  var T = {
    ar: { from: 'Aa', to: 'أب', title: 'العربية', sub: 'جارٍ عرض الموقع باللغة العربية', cls: 'lg-ar' },
    en: { from: 'أب', to: 'Aa', title: 'English', sub: 'Switching the site to English', cls: '' }
  };
  function fill(target) {
    var t = T[target];
    var from = ov.querySelector('.lang-glyph.from'), to = ov.querySelector('.lang-glyph.to');
    from.textContent = t.from; to.textContent = t.to;
    from.className = 'lang-glyph from' + (target === 'en' ? ' lg-ar' : '');
    to.className = 'lang-glyph to' + (target === 'ar' ? ' lg-ar' : '');
    var ti = document.getElementById('lgTitle'), su = document.getElementById('lgSub');
    ti.textContent = t.title; su.textContent = t.sub;
    ti.className = 'switch-title ' + t.cls; su.className = 'switch-sub ' + t.cls;
    ti.setAttribute('lang', target); su.setAttribute('lang', target);
    ti.dir = su.dir = target === 'ar' ? 'rtl' : 'ltr';
  }
  var going = false;
  document.querySelectorAll('a[hreflang]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduce || going) return;
      e.preventDefault();
      going = true;
      var target = cur === 'ar' ? 'en' : 'ar';
      var href = a.getAttribute('href') + (location.hash || '');
      if (document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open', 'no-scroll'); }
      if (e.clientX) { ov.style.setProperty('--cx', e.clientX + 'px'); ov.style.setProperty('--cy', e.clientY + 'px'); }
      fill(target);
      ov.classList.remove('leaving', 'arrive'); void ov.offsetWidth; ov.classList.add('active');
      try { sessionStorage.setItem('itology_lang_arrive', target); } catch (err) {}
      setTimeout(function () { window.location.href = href; }, 1900);
    });
  });
  var arr = null;
  try { arr = sessionStorage.getItem('itology_lang_arrive'); sessionStorage.removeItem('itology_lang_arrive'); } catch (e) {}
  if (arr && arr === cur && !reduce) {
    fill(cur);
    ov.classList.add('arrive');
    setTimeout(function () { ov.classList.remove('arrive'); ov.classList.add('leaving'); }, 250);
    setTimeout(function () { ov.classList.remove('leaving'); }, 1000);
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { ov.classList.remove('active', 'arrive', 'leaving'); going = false; } });
})();

/* ---------- Opening a service from the home page: unfold that card ---------- */
(function () {
  'use strict';
  function openHash() {
    var id = location.hash.slice(1), el = id && document.getElementById(id);
    if (!el || !el.classList.contains('feature-card')) return;
    if (el.parentElement && el.parentElement.classList.contains('m-acc')) {
      el.classList.add('m-open');
      if (el.firstElementChild) el.firstElementChild.setAttribute('aria-expanded', 'true');
    }
    el.classList.add('flash');
    setTimeout(function () { el.classList.remove('flash'); }, 1600);
  }
  setTimeout(openHash, 80);
  window.addEventListener('hashchange', openHash);
})();

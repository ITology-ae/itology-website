/* ITology site script — shared by every page (English and Arabic). */
(function () {
  'use strict';

  /* ================= SETTINGS YOU CAN EDIT ================= */
  // 1) Contact form: paste your Formspree (or similar) endpoint, e.g. 'https://formspree.io/f/abcdwxyz'.
  //    While empty, the form opens the visitor's email app with the message filled in.
  var FORM_ENDPOINT = '';
  var FORM_EMAIL = 'contact@itology.ae';
  // 2) WhatsApp: international format, digits only, e.g. '971501234567'. Empty = button hidden.
  var WHATSAPP_NUMBER = '';
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
    burger.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.nav-item.open').forEach(function (i) { i.classList.remove('open'); });
  }
  burger.addEventListener('click', function () {
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
  markOffice(pageOffice || store.get('itology_office') || 'ad');
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
  function sendForm(form, subject, okMsg) {
    var data = new FormData(form);
    if (FORM_ENDPOINT) {
      data.append('_subject', subject);
      fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); toast(okMsg); })
        .catch(function () { toast(STR.error); });
    } else {
      var body = [];
      data.forEach(function (v, k) { if (v) body.push(k + ': ' + v); });
      window.location.href = 'mailto:' + FORM_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.join('\n'));
      toast(STR.mailOpened);
    }
  }
  var bf = document.getElementById('briefingForm');
  if (bf) bf.addEventListener('submit', function (e) { e.preventDefault(); sendForm(bf, 'Executive briefing request (ITology website)', STR.thanks); });
  document.querySelectorAll('.newsletter-form').forEach(function (nf) {
    nf.addEventListener('submit', function (e) { e.preventDefault(); sendForm(nf, 'Newsletter subscription (ITology website)', STR.subscribed); });
  });

  /* ---------- WhatsApp ---------- */
  var wa = document.getElementById('waFloat');
  if (wa && WHATSAPP_NUMBER) { wa.href = 'https://wa.me/' + WHATSAPP_NUMBER; wa.classList.add('on'); }

  /* ---------- Images that fail to load show the designed fallback ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function fail() { img.classList.add('img-failed'); }
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
  });
})();

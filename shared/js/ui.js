/* Ibn Hamido Seafood · shared UI interactions (all 4 designs).
   Mobile nav drawer · cooking-style reveal · dish accordion · reviews carousel · story scroll reveal.
   Plain JS, no dependencies. Everything respects prefers-reduced-motion. */
(function () {
  'use strict';
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  // ?capture=1 renders the page in its settled state (no autoplay, story revealed): for screenshots and design-tool imports
  if (/[?&]capture=1\b/.test(location.search)) { reduced = true; document.documentElement.classList.add('capture'); }
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var FOCUSABLE = 'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

  /* Focus trap shared with order.js */
  function trapKey(e, box, close) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = $$(FOCUSABLE, box).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  window.IHS = window.IHS || {};
  window.IHS.trapKey = trapKey;
  window.IHS.reduced = reduced;

  /* ---------- Mobile nav drawer (Nav + LookNav) ---------- */
  $$('[data-on-click="openDrawer"]').forEach(function (btn) {
    var nav = btn.closest('nav') ? btn.closest('nav').parentNode : document;
    var overlay = nav.querySelector('[data-if="drawerOpen"]');
    if (!overlay) return;
    var dialog = overlay.querySelector('[role="dialog"]');
    var last = null;
    function open() {
      last = document.activeElement;
      overlay.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var c = overlay.querySelector('[data-nv-close], [data-lknv-close]');
      if (c) c.focus();
    }
    function close() {
      overlay.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (last && last.focus) last.focus();
    }
    btn.addEventListener('click', open);
    $$('[data-on-click="closeDrawer"]', overlay).forEach(function (b) { b.addEventListener('click', close); });
    if (dialog) dialog.addEventListener('keydown', function (e) { trapKey(e, dialog, close); });
  });

  /* ---------- Cooking styles: click/tap to reveal (no hover behaviour) ---------- */
  $$('.cs-card').forEach(function (card) {
    if (card.dataset.csInit) return;
    var grid = card.parentNode;
    var cards = $$('.cs-card', grid);
    cards.forEach(function (c) {
      c.dataset.csInit = '1';
      var btn = c.querySelector('.cs-btn');
      var spans = btn.children;
      c._inactive = { card: c.getAttribute('style'), btn: btn.getAttribute('style'), num: spans[0].getAttribute('style'),
        badge: spans[1].children[1].getAttribute('style'), icon: spans[2].getAttribute('style') };
    });
    function setActive(c, on) {
      var btn = c.querySelector('.cs-btn');
      var s = btn.children, badge = s[1].children[1];
      var st = c._inactive;
      c.setAttribute('style', on ? 'border: 1px solid #2B4AA5; background: #2B4AA5;' : st.card);
      btn.setAttribute('style', on ? 'color: #FFFFFF;' : st.btn);
      s[0].setAttribute('style', on ? 'font-size: 13px; font-weight: 600; letter-spacing: .08em; color: #5CC8C8;' : st.num);
      badge.setAttribute('style', on ? 'align-self: flex-start; display: inline-flex; align-items: center; min-height: 22px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: rgba(255,255,255,.16); color: #FFFFFF;' : st.badge);
      s[2].setAttribute('style', on ? 'flex: none; width: 32px; height: 32px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; line-height: 1; background: #FFFFFF; color: #2B4AA5;' : st.icon);
      s[2].textContent = on ? '–' : '+';
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      $$('[data-if="item.closed"]', c).forEach(function (el) { el.hidden = on; });
      $$('[data-if="item.active"]', c).forEach(function (el) { el.hidden = !on; });
    }
    cards.forEach(function (c) {
      c.querySelector('.cs-btn').addEventListener('click', function () {
        var isOn = c.querySelector('.cs-btn').getAttribute('aria-expanded') === 'true';
        cards.forEach(function (o) { setActive(o, o === c ? !isOn : false); });
      });
    });
  });

  /* ---------- Dish accordion: click/tap always, hover after 150 ms intent on wide screens ---------- */
  $$('.ac-panel').forEach(function (p) {
    var root = p.parentNode;
    if (root.dataset.acInit) return;
    root.dataset.acInit = '1';
    var panels = $$('.ac-panel', root).filter(function (x) { return x.parentNode === root; });
    var active = Math.max(0, panels.findIndex(function (x) { return !x.querySelector('[data-if="item.active"]').hidden; }));
    var timer = null;
    var narrow = null;
    function render() {
      root.className = narrow ? 'ac-narrow' : 'ac-wide';
      root.setAttribute('style', 'font-family: Inter, system-ui, sans-serif; display: flex; gap: 10px; ' + (narrow ? 'flex-direction: column;' : 'flex-direction: row; height: 520px;'));
      panels.forEach(function (x, i) {
        var on = i === active;
        x.setAttribute('style', narrow ? (on ? 'min-height: 420px;' : 'height: 64px;') : ('flex: ' + (on ? '7' : '1') + ' 1 0; min-width: 0;'));
        x.querySelector('[data-if="item.active"]').hidden = !on;
        var b = x.querySelector('[data-if="item.collapsed"]');
        b.hidden = on;
        b.setAttribute('style', narrow ? 'align-items: center; justify-content: flex-start; padding: 0 24px;' : 'align-items: flex-end; justify-content: center;');
        var t = b.querySelector('span');
        t.setAttribute('style', 'font-family: \'Young Serif\', Georgia, serif; font-size: 19px; line-height: 24px; color: #FFFFFF; white-space: nowrap; ' + (narrow ? '' : 'writing-mode: vertical-rl; transform: rotate(180deg);'));
      });
    }
    function select(i, focus) {
      clearTimeout(timer);
      if (active === i) return;
      active = i;
      render();
      if (focus) { var l = panels[i].querySelector('.ac-link'); if (l) l.focus(); }
    }
    function measure() {
      var n = window.innerWidth < 760;
      if (n !== narrow) { narrow = n; render(); }
    }
    panels.forEach(function (x, i) {
      x.querySelector('[data-if="item.collapsed"]').addEventListener('click', function () { select(i, true); });
      x.addEventListener('mouseenter', function () {
        if (narrow) return;
        clearTimeout(timer);
        timer = setTimeout(function () { select(i, false); }, 150);
      });
      x.addEventListener('mouseleave', function () { clearTimeout(timer); });
    });
    window.addEventListener('resize', measure);
    measure();
  });

  /* ---------- Reviews carousel: visible Pause/Play, pauses on hover and keyboard focus ---------- */
  $$('section.rv').forEach(function (rv) {
    var quote = rv.querySelector('blockquote');
    var cap = rv.querySelector('figcaption');
    var fig = rv.querySelector('figure');
    var dots = $$('[data-on-click="go"]', rv);
    var playBtn = rv.querySelector('[data-on-click="togglePlay"]');
    var counter = playBtn ? playBtn.nextElementSibling : null;
    var help = counter ? counter.parentNode.nextElementSibling : null;
    var n = dots.length || 5;
    var s = { i: 0, playing: !reduced, hover: false, focus: false, manual: false };
    var reviews = [];
    for (var k = 1; k <= n; k++) reviews.push({ quote: '[OWNER: handpicked review #' + k + ', quote]', name: '[First name + last initial]', source: '[SOURCE]' });
    function render() {
      var r = reviews[s.i];
      quote.textContent = '“' + r.quote + '”';
      cap.innerHTML = '<span style="color: #FFFFFF; font-weight: 600;"></span> · ';
      cap.firstChild.textContent = r.name;
      cap.appendChild(document.createTextNode(r.source));
      fig.setAttribute('aria-live', s.manual ? 'polite' : 'off');
      dots.forEach(function (d, k) {
        d.setAttribute('aria-current', k === s.i ? 'true' : 'false');
        var pip = d.querySelector('.rv-pip');
        if (pip) pip.setAttribute('style', k === s.i ? 'width: 32px; background: #5CC8C8;' : 'width: 10px; background: #8C9CCB;');
      });
      if (playBtn) {
        playBtn.setAttribute('aria-pressed', s.playing ? 'false' : 'true');
        $$('[data-if="playing"]', playBtn).forEach(function (el) { el.hidden = !s.playing; });
        $$('[data-if="stopped"]', playBtn).forEach(function (el) { el.hidden = s.playing; });
        var tn = playBtn.lastChild;
        while (tn && tn.nodeType !== 3) tn = tn.previousSibling;
        if (tn) tn.textContent = ' ' + (s.playing ? 'Pause' : 'Play') + ' ';
      }
      if (counter) counter.textContent = String(s.i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
    function go(k) { s.i = ((k % n) + n) % n; s.manual = true; render(); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    var prev = rv.querySelector('[data-on-click="prev"]'), next = rv.querySelector('[data-on-click="next"]');
    if (prev) prev.addEventListener('click', function () { go(s.i - 1); });
    if (next) next.addEventListener('click', function () { go(s.i + 1); });
    if (playBtn) playBtn.addEventListener('click', function () { s.playing = !s.playing; if (s.playing) s.manual = false; render(); });
    rv.addEventListener('mouseenter', function () { s.hover = true; });
    rv.addEventListener('mouseleave', function () { s.hover = false; });
    rv.addEventListener('focusin', function () { s.focus = true; });
    rv.addEventListener('focusout', function (e) { if (!e.relatedTarget || !rv.contains(e.relatedTarget)) s.focus = false; });
    if (reduced && help) help.textContent = 'Handpicked reviews. Auto-rotation is off because reduced motion is on.';
    setInterval(function () {
      if (s.playing && !s.hover && !s.focus) { s.i = (s.i + 1) % n; render(); }
    }, 6000);
    render();
  });

  /* ---------- Story: chapters reveal on scroll (static with reduced motion) ---------- */
  var rev = $$('[data-reveal], [data-lk-reveal]');
  if (rev.length) {
    var show = function (el) { el.classList.add('reveal-in'); };
    if (reduced || typeof IntersectionObserver === 'undefined') rev.forEach(show);
    else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.15 });
      rev.forEach(function (el) { io.observe(el); });
    }
  }
})();

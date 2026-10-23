/* Ibn Hamido Seafood · shared ordering engine (one file for all 4 designs).
   Menu rendered from shared/data/menu-data.json · option sheets · direct add + undo toast ·
   cart drawer + mobile bar · localStorage cart · checkout validation · confirmation.
   Prices: every price in menu-data.json is null until the owner confirms it, so the pure price
   functions below return null and the UI shows [PRICE] / [SUBTOTAL] / [TOTAL] placeholders.
   Review states via URL: ?status=open|closed|lunch &demoCart=1 &panel=cart|comboSheet|sidesError|sandwichSheet|catchSheet
   (order) · ?step=confirmed &showErrors=1 &status=closed &demoCart=1 (checkout) · extras: &lunchOnly=1 &byWeight=0 &soldOut=0 */
(function () {
  'use strict';
  var KEY = 'ihs-order-v4';
  var LAST = 'ihs-last-order-v4';
  var MAXLB_FALLBACK = 10; // stands in for [MAX LB] until the owner sets it
  var page = document.body.getAttribute('data-page');
  var root = document.querySelector('.od, .co');
  if (!root) return;

  /* ---------- per-design markup flavour (Base v2 vs the A/B/C looks) ---------- */
  var LOOK = root.classList.contains('lk');
  var CFG = LOOK ? {
    pri: 'btn btn-pri', sec: 'btn btn-sec', disp: 'var(--disp)', muted: 'var(--ink-2)', sans: 'Inter, sans-serif',
    arHead: function (t, big) { return '<p class="ard" lang="ar" dir="rtl" style="font-size: 32px; line-height: 1.2;">' + esc(t) + '</p>'; }, cardAr: true
  } : {
    pri: 'btn btn-primary', sec: 'btn btn-secondary', disp: 'var(--font-display)', muted: 'var(--ink-muted)', sans: 'var(--font-sans)',
    arHead: function (t) { return '<p class="ar" lang="ar" dir="rtl" style="margin: 0; font-size: 26px; line-height: 36px; color: var(--sea); text-align: left;">' + esc(t) + '</p>'; }, cardAr: false
  };

  /* ---------- URL params (review states) ---------- */
  var Q = new URLSearchParams(location.search);
  var on = function (k) { var v = Q.get(k); return v === '1' || v === 'true'; };
  var off = function (k) { var v = Q.get(k); return v === '0' || v === 'false'; };
  var P = {
    status: ['open', 'closed', 'lunch'].indexOf(Q.get('status')) >= 0 ? Q.get('status') : 'open',
    demoCart: on('demoCart'),
    panel: Q.get('panel') || Q.get('openPanel') || 'none',
    showErrors: on('showErrors'),
    step: Q.get('step') || '',
    lunchOnly: on('lunchOnly') || on('combosLunchOnly'),
    byWeight: !(off('byWeight') || off('onlineByWeight')),
    soldOutDemo: !off('soldOut')
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(sel, r) { return (r || document).querySelector(sel); }
  function $$(sel, r) { return Array.prototype.slice.call((r || document).querySelectorAll(sel)); }

  /* =====================================================================
     PRICE MATH: pure functions. null in = null out; the UI turns null into a placeholder.
     ===================================================================== */
  var Price = {
    num: function (v) { return typeof v === 'number' && isFinite(v) ? v : null; },
    sum: function (arr) { var t = 0; for (var i = 0; i < arr.length; i++) { if (arr[i] == null) return null; t += arr[i]; } return Math.round(t * 100) / 100; },
    mul: function (a, b) { return a == null || b == null ? null : Math.round(a * b * 100) / 100; },
    /* one unit of a line, from its options (d) and the menu (M) */
    each: function (d, M) {
      if (d.cat === 'catch') {
        var f = M.byId[d.itemId] || {};
        var perLb = Price.sum([Price.num(f.pricePerLb), Price.num(f.cookingChargePerLb)]);
        var w = weightOf(d);
        var base = w ? Price.mul(w, perLb) : null;
        var st = M.styles.filter(function (s) { return s.key === d.style; })[0];
        var styleX = !st ? 0 : (st.extraPrice === 0 ? 0 : Price.num(st.extraPrice));
        var sides = Object.keys(d.addSides || {}).map(function (id) { return Price.mul(d.addSides[id], Price.num((M.byId[id] || {}).price)); });
        return Price.sum([base, styleX].concat(sides));
      }
      var it = M.byId[d.itemId] || {};
      if (d.size && M.riceSizes) {
        var z = M.riceSizes.filter(function (r) { return r.name === d.size; })[0];
        return z ? Price.num(z.price) : null;
      }
      return Price.num(it.price);
    },
    line: function (l, M) { return Price.mul(Price.each(l.data || {}, M), l.qty || 1); },
    totals: function (lines, M, opt) {
      opt = opt || {};
      var subtotal = Price.sum(lines.map(function (l) { return Price.line(l, M); }));
      var tax = Price.mul(subtotal, Price.num(opt.taxRate)); // [TAX RATE] is unknown → null
      var tip = 0;
      if (opt.tip === 'custom') tip = Price.num(parseFloat(opt.tipCustom));
      else if (opt.tip && opt.tip !== 'none') tip = Price.mul(subtotal, parseInt(opt.tip, 10) / 100);
      return { subtotal: subtotal, tax: tax, tip: tip, total: Price.sum([subtotal, tax, tip]) };
    },
    fmt: function (n, ph) { return n == null ? (ph || '[PRICE]') : '$' + n.toFixed(2); }
  };
  window.IHS = window.IHS || {};
  window.IHS.Price = Price;

  function weightOf(d) { return d.weight === 'Other' ? d.other : parseFloat(d.weight); }

  /* =====================================================================
     MENU MODEL from menu-data.json (+ presentational copy that lives only on the canvas)
     ===================================================================== */
  var UI = {
    catKey: { fresh: 'catch' },
    eyebrow: { combos: 'Two sides included', signature: 'From the kitchen', sandwiches: 'On a hero or brioche', sides: 'On the table' },
    noteFallback: { sides: '[PRICE] each. Rice comes in small, medium or large.' },
    itemAr: { 'F-01': 'قاروص', 'F-02': 'سلمون', 'F-04': 'جمبري', 'F-06': 'استاكوزا',
      'SD-01': 'رز', 'SD-02': 'طحينة', 'SD-03': 'بابا غنوج', 'SD-04': 'سلطة حميدو', 'SD-05': 'سلطة بنجر', 'SD-06': 'بطاطس بالليمون',
      'SD-07': 'باذنجان بالتوم', 'SD-08': 'مسقعة', 'SD-09': 'بطاطس محمرة', 'SD-10': 'سلطة يوناني', 'SD-11': 'سلطة رنجة', 'SD-12': 'طبق مزة' },
    styleKey: { 'K-01': 'grilled', 'K-02': 'fried', 'K-03': 'baked', 'K-04': 'singari', 'K-05': 'rada', 'K-06': 'butterfly', 'K-07': 'deboned' },
    demoSold: { 'F-06': true, 'SG-06': true }
  };

  function buildModel(J) {
    var G = J.optionGroups;
    var M = { byId: {}, cats: [], groups: G };
    M.styles = G.cookingStyle.choices.map(function (c) { return { id: c.id, key: UI.styleKey[c.id], name: c.name, extraPrice: c.extraPrice, extra: c.extraPrice !== 0 }; });
    M.riceSizes = G.riceSize.choices;
    M.weights = G.weightLb.choices.map(String);
    M.maxLb = typeof G.weightLb.maxLb === 'number' ? G.weightLb.maxLb : MAXLB_FALLBACK;
    M.maxLbLabel = typeof G.weightLb.maxLb === 'number' ? G.weightLb.maxLb + ' lb' : String(G.weightLb.maxLb);
    M.weightHelper = G.weightLb.helper;
    M.comboSides = G.twoSides.choices.map(function (c) { return c.split(' ')[0]; });
    M.addSides = G.addSides.choices.slice();
    M.chips = G.sandwichSide.choices.slice();
    M.preps = G.prepFriedGrilled.choices.slice();
    J.categories.forEach(function (c) {
      var id = UI.catKey[c.id] || c.id;
      var cat = { id: id, label: c.name, ar: c.arabic, note: c.note || UI.noteFallback[id] || '', eyebrow: UI.eyebrow[id] || '', items: [] };
      c.items.forEach(function (it) {
        var x = {
          id: it.id, name: it.name, desc: it.description, cat: id, ar: UI.itemAr[it.id] || '',
          opts: it.options || [], price: it.price, pricePerLb: it.pricePerLb, cookingChargePerLb: it.cookingChargePerLb,
          available: it.availableToday !== false
        };
        if (id === 'catch') x.styles = it.styles === 'all' ? M.styles.map(function (s) { return s.key; }) : it.styles.map(function (k) { return UI.styleKey[k]; });
        M.byId[it.id] = x;
        cat.items.push(x);
      });
      M.cats.push(cat);
    });
    return M;
  }

  function loadData() {
    var fromGlobal = function () { return window.IHS_MENU_DATA ? Promise.resolve(window.IHS_MENU_DATA) : Promise.reject(new Error('menu data missing')); };
    if (location.protocol === 'file:') return fromGlobal();
    return fetch('../shared/data/menu-data.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(fromGlobal);
  }

  /* =====================================================================
     CART LINES
     ===================================================================== */
  var M = null;
  function sideName(id) { return (M.byId[id] || {}).name || id; }
  function countList(obj) {
    return Object.keys(obj || {}).filter(function (k) { return obj[k] > 0; }).map(function (k) { return sideName(k) + (obj[k] > 1 ? ' ×' + obj[k] : ''); }).join(', ');
  }
  function total(obj) { return Object.keys(obj || {}).reduce(function (a, k) { return a + (obj[k] || 0); }, 0); }
  function styleOf(key) { return M.styles.filter(function (s) { return s.key === key; })[0] || null; }

  function buildLine(s) {
    var it = M.byId[s.itemId] || { name: 'Item' };
    var opts = [], name = it.name, lb = false;
    if (s.cat === 'catch') {
      var st = styleOf(s.style);
      name = it.name + ' · by the lb';
      lb = true;
      opts.push('Est. weight: ' + weightOf(s) + ' lb');
      if (st) opts.push('Cooking: ' + st.name + (st.extra ? ' (+' + Price.fmt(Price.num(st.extraPrice)) + ')' : ''));
      var as = countList(s.addSides);
      if (as) opts.push('Add sides: ' + as);
    } else {
      if (s.cat === 'combos') name = it.name + ' · Hamido Combo';
      if (s.size) name = it.name + ' (' + s.size + ')';
      if (s.prep) opts.push('Preparation: ' + s.prep);
      var cs = countList(s.sides);
      if (cs) opts.push('Combo sides: ' + cs);
      if (s.chip) opts.push('Side: ' + s.chip);
    }
    if (s.note) opts.push('Note: ' + s.note);
    return { key: s.cat + '-' + s.itemId + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      cat: s.cat, itemId: s.itemId, name: name, opts: opts, qty: s.qty || 1, lb: lb, data: JSON.parse(JSON.stringify(s)) };
  }
  function linePrice(l) { var v = Price.line(l, M); return (l.lb ? 'Est. ' : '') + Price.fmt(v); }

  function demoLines() {
    var lines = [
      buildLine({ cat: 'catch', itemId: 'F-01', qty: 1, note: '', weight: '1.5', other: 3.5, style: 'singari', addSides: { 'SD-02': 1 } }),
      buildLine({ cat: 'combos', itemId: 'CB-04', qty: 1, note: '', prep: 'Grilled', sides: { 'SD-01': 1, 'SD-04': 1 }, chip: '', size: '' }),
      buildLine({ cat: 'sides', itemId: 'SD-01', qty: 1, note: '', prep: '', sides: {}, chip: '', size: 'Medium' })
    ];
    return P.byWeight ? lines : lines.filter(function (l) { return !l.lb; });
  }
  function readCart() {
    try { var p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (p && Array.isArray(p.lines)) return p.lines; } catch (e) {}
    return [];
  }
  function writeCart(lines) { try { localStorage.setItem(KEY, JSON.stringify({ lines: lines, savedAt: Date.now() })); } catch (e) {} }

  /* =====================================================================
     ORDER PAGE
     ===================================================================== */
  var S = { lines: [], sheet: null, cartOpen: false, tip: 'none', tipCustom: '', activeCat: 'catch', flash: '', toast: null };
  var lastFocus = null, toastTimer = null;

  function isSold(it) { return !it.available || (P.soldOutDemo && UI.demoSold[it.id]); }
  function hasOpts(it) { return it.cat === 'catch' || (it.opts && it.opts.length > 0); }
  function flags(s) {
    var it = M.byId[s.itemId] || { opts: [] }, o = it.opts || [];
    return { it: it, hasPrep: o.indexOf('prepFriedGrilled') >= 0, hasSides: o.indexOf('twoSides') >= 0, hasChips: o.indexOf('sandwichSide') >= 0, hasSize: o.indexOf('riceSize') >= 0 };
  }
  function newSheet(cat, id) {
    var base = { cat: cat, itemId: id, qty: 1, note: '', editKey: null, fromCart: false, err: {} };
    if (cat === 'catch') return Object.assign(base, { weight: '', other: 3.5, style: '', addSides: {} });
    return Object.assign(base, { prep: '', sides: {}, chip: '', size: '' });
  }
  function panelState(op) {
    var none = { sheet: null, cartOpen: false };
    if (op === 'cart') return { sheet: null, cartOpen: true };
    if (op === 'comboSheet') return { sheet: newSheet('combos', 'CB-04'), cartOpen: false };
    if (op === 'sidesError') { var s = newSheet('combos', 'CB-01'); s.sides = { 'SD-01': 1 }; s.err = { sides: true }; return { sheet: s, cartOpen: false }; }
    if (op === 'sandwichSheet') return { sheet: newSheet('sandwiches', 'SW-01'), cartOpen: false };
    if (op === 'catchSheet' && P.byWeight) { var c = newSheet('catch', 'F-01'); c.weight = '1.5'; c.style = 'singari'; c.addSides = { 'SD-02': 1 }; return { sheet: c, cartOpen: false }; }
    return none;
  }

  function cardHtml(it) {
    var closed = P.status === 'closed';
    var lunchNow = P.lunchOnly && P.status === 'lunch';
    var sold = isSold(it), isCombo = it.cat === 'combos', isFish = it.cat === 'catch';
    var lunchBlocked = isCombo && P.lunchOnly && !lunchNow;
    var badges = [];
    if (isCombo) badges.push(['2 sides included', 'badge badge-lunch']);
    if (isCombo && P.lunchOnly) badges.push(['Mon–Fri [LUNCH HOURS]', 'badge badge-lb']);
    if (isFish) badges.push(['By the lb', 'badge badge-lb']);
    if (sold) badges.push([isFish ? 'Sold out today' : 'Sold out', 'badge badge-sold']);
    var note = closed ? 'Online ordering is closed right now.' : sold ? (isFish ? 'Sold out today. Check back tomorrow.' : 'Sold out today.') : lunchBlocked ? 'Available Mon–Fri [LUNCH HOURS]' : '';
    var shot = isFish ? it.id + ' · ' + it.name + ', raw on ice, overhead · 1:1'
      : isCombo ? it.id + ' · ' + it.name + ', plated with two side bowls · 1:1'
      : it.cat === 'sandwiches' ? it.id + ' · ' + it.name + ' with fries · 1:1'
      : it.cat === 'signature' ? it.id + ' · ' + it.name + ', plated · 1:1' : it.id + ' · ' + it.name + ' · 1:1';
    var alt = it.name + (isFish ? ', raw on ice' : isCombo ? ' combo with two sides' : it.cat === 'sandwiches' ? ' with fries' : '');
    var price = isFish ? Price.fmt(Price.num(it.pricePerLb)) + '/lb · market price' : (it.id === 'SD-01' ? '[PRICE] · S / M / L' : Price.fmt(Price.num(it.price)));
    var disabled = closed || sold || lunchBlocked;
    var addText = sold ? (isFish ? 'Sold out today' : 'Sold out') : (isFish ? 'Order by the lb' : 'Add');
    var addLabel = sold ? 'Sold out: ' + it.name : (isFish ? 'Order ' + it.name + ' by the pound' : (hasOpts(it) ? 'Choose options for ' + it.name : 'Add ' + it.name + ' to your order'));
    return '<article class="' + (sold ? 'card card-sold' : 'card') + '" aria-labelledby="it-' + it.id + '">' +
      '<div class="card-ph ph-on"><img class="ph-img" src="../shared/photos/' + it.id + '.jpg" alt="' + esc(alt) + '" style="object-position: center;" loading="lazy"><span class="ph-tag">AI concept</span>' + esc(shot) + '</div>' +
      '<div class="card-body"><div class="badges">' + badges.map(function (b) { return '<span class="' + b[1] + '">' + esc(b[0]) + '</span>'; }).join('') + '</div>' +
      '<h3 id="it-' + it.id + '" class="card-title">' + esc(it.name) + (CFG.cardAr && it.ar ? ' <span class="card-ar" lang="ar" dir="rtl">' + esc(it.ar) + '</span>' : '') + '</h3>' +
      '<p class="card-desc">' + esc(it.desc) + '</p>' + (note ? '<p class="card-note">' + esc(note) + '</p>' : '') +
      '<div class="card-foot"><span class="price">' + esc(price) + '</span>' +
      '<button type="button" class="btn-add"' + (disabled ? ' disabled' : '') + ' aria-label="' + esc(addLabel) + '" data-act="add" data-id="' + it.id + '" data-k="add-' + it.id + '">' + esc(addText) + '</button></div></div></article>';
  }

  function menuHtml() {
    var fish = M.cats.filter(function (c) { return c.id === 'catch'; })[0];
    var h = '<section id="cat-catch" data-cat="catch" class="cat"><div class="wrap"><div class="cat-head"><p class="eyebrow">Fresh catch · by the lb</p>' +
      CFG.arHead(fish.ar) + '<h2>Fresh Catch</h2><p>Today’s catch, priced by the pound. Pick your fish, tell us how you want it, and we’ll weigh and cook it for pickup.</p></div>';
    if (P.byWeight) {
      h += '<h3 class="sr">How by-the-pound works</h3><ol class="how" aria-label="How by-the-pound works">' +
        '<li><span class="how-n" aria-hidden="true">1</span><span><b>Choose your fish and an estimated weight.</b> ' + esc(M.weightHelper) + '.</span></li>' +
        '<li><span class="how-n" aria-hidden="true">2</span><span><b>Pay the estimate online.</b> Market price plus the cooking charge, by the pound.</span></li>' +
        '<li><span class="how-n" aria-hidden="true">3</span><span><b>We weigh it at the counter.</b> Your final price matches the actual weight.</span></li></ol>' +
        '<div class="grid">' + fish.items.map(cardHtml).join('') + '</div>';
    } else {
      h += '<div class="instore"><div style="display: flex; flex-direction: column; gap: 12px;"><p class="eyebrow" style="color: #5CC8C8;">In store only</p>' +
        '<h3 style="margin: 0; font: 400 30px/36px ' + CFG.disp + ';">Fresh catch is sold by the pound at the counter.</h3>' +
        '<p style="margin: 0; font-size: 16px; line-height: 24px; color: #C9D3EE;">Come pick your fish on the ice and tell the chef how to cook it. Online, order a Hamido Combo, a signature dish or a sandwich.</p>' +
        '<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px;"><a class="btn" href="visit.html" style="background: #FFFFFF; color: #13245A;">Hours &amp; directions</a>' +
        '<a class="btn" href="menu.html#styles" style="border-color: #FFFFFF; color: #FFFFFF;">Cooking styles</a></div></div><ul style="list-style: none; margin: 0; padding: 0;">' +
        fish.items.map(function (it) { return '<li><span>' + esc(it.name) + '</span><span style="color: #C9D3EE;">[PRICE]/lb · market price</span></li>'; }).join('') + '</ul></div>';
    }
    h += '</div></section>';
    M.cats.filter(function (c) { return c.id !== 'catch'; }).forEach(function (c) {
      var eyebrow = c.id === 'combos' && P.lunchOnly ? 'Two sides included · Mon–Fri [LUNCH HOURS]' : c.eyebrow;
      h += '<section id="cat-' + c.id + '" data-cat="' + c.id + '" class="cat"><div class="wrap"><div class="cat-head"><p class="eyebrow">' + esc(eyebrow) + '</p>' +
        CFG.arHead(c.ar) + '<h2>' + esc(c.label) + '</h2>' + (c.note ? '<p>' + esc(c.note) + '</p>' : '') + '</div>' +
        '<div class="grid">' + c.items.map(cardHtml).join('') + '</div></div></section>';
    });
    return h;
  }

  function renderBanner() {
    var el = $('#order-banner');
    if (!el) return;
    var text = 'Ordering open · last orders [LAST ORDER TIME]', sub = P.lunchOnly ? 'Hamido Combos are available Mon–Fri [LUNCH HOURS].' : '', cls = 'banner banner-open', dot = 'background: #1F9AA0;';
    if (P.lunchOnly && P.status === 'lunch') { text = 'Hamido Combos available Mon–Fri [LUNCH HOURS]'; sub = 'Ordering open · last orders [LAST ORDER TIME]'; cls = 'banner banner-lunch'; dot = 'background: #2B4AA5;'; }
    if (P.status === 'closed') { text = 'Online ordering has closed for today (last orders [LAST ORDER TIME]). Please check back during opening hours.'; sub = ''; cls = 'banner banner-closed'; dot = 'background: #5CC8C8;'; }
    el.className = cls;
    el.innerHTML = '<span class="banner-dot" aria-hidden="true" style="' + dot + '"></span><span style="display: flex; flex-direction: column; gap: 2px;"><span style="font-weight: 600;">' + esc(text) + '</span>' +
      (sub ? '<span style="font-weight: 400;">' + esc(sub) + '</span>' : '') + '</span>';
  }
  function renderTabs() {
    var el = $('#order-tabs');
    if (!el) return;
    el.innerHTML = M.cats.map(function (c) {
      var cur = S.activeCat === c.id;
      return '<a class="' + (cur ? 'tab tab-on' : 'tab') + '" href="#cat-' + c.id + '" aria-current="' + cur + '">' + esc(c.label) + '</a>';
    }).join('');
  }
  function count() { return S.lines.reduce(function (a, l) { return a + (l.qty || 1); }, 0); }
  function renderCount() {
    var b = $('.cart-desk');
    if (b) {
      b.setAttribute('data-act', 'open-cart');
      b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"></path><path d="M9 7a3 3 0 016 0"></path></svg>\n        Your order (' + count() + ')';
    }
  }

  var X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
  function radio(name, act, v, label, checked, cls, inner) {
    return '<label class="' + cls + '"><input type="radio" name="' + name + '"' + (checked ? ' checked' : '') + ' data-act="' + act + '" data-v="' + esc(v) + '" data-k="' + act + '-' + esc(v) + '">' + (inner || '<span>' + esc(label) + '</span>') + '</label>';
  }
  function oc(on) { return 'opt' + (on ? ' opt-on' : ''); }
  function stepRows(obj, ids, field, max) {
    var tot = total(obj);
    return ids.map(function (id) {
      var n = obj[id] || 0, nm = sideName(id);
      return '<div class="' + (n > 0 ? 'srow srow-on' : 'srow') + '"><span>' + esc(nm) + '</span><div class="stepper" role="group" aria-label="' + esc(nm) + '">' +
        '<button type="button" aria-label="Remove one ' + esc(nm) + '"' + (n <= 0 ? ' disabled' : '') + ' data-act="' + field + '-dec" data-id="' + id + '" data-k="' + field + '-dec-' + id + '">−</button>' +
        '<span>' + n + '</span>' +
        '<button type="button" aria-label="Add one ' + esc(nm) + '"' + (max && tot >= max ? ' disabled' : '') + ' data-act="' + field + '-inc" data-id="' + id + '" data-k="' + field + '-inc-' + id + '">+</button></div></div>';
    }).join('');
  }

  function sheetHtml() {
    var s = S.sheet, e = s.err || {}, h = '';
    var verb = s.editKey ? 'Update item · ' : 'Add to order · ';
    var eyebrow, title, desc, price, cta;
    var each = Price.each(s, M);
    if (s.cat === 'catch') {
      var fish = M.byId[s.itemId];
      eyebrow = fish.id + ' · Fresh catch · by the lb'; title = fish.name; desc = fish.desc;
      price = Price.fmt(Price.num(fish.pricePerLb)) + '/lb market price + ' + Price.fmt(Price.num(fish.cookingChargePerLb)) + '/lb cooking';
      cta = verb + 'Est. ' + Price.fmt(Price.mul(each, s.qty));
    } else {
      var f = flags(s), cat = M.cats.filter(function (c) { return c.id === s.cat; })[0] || { label: '' };
      eyebrow = f.it.id + ' · ' + cat.label; title = f.it.name; desc = f.it.desc;
      price = f.hasSize ? '[PRICE] · by size' : Price.fmt(Price.num(f.it.price));
      cta = verb + Price.fmt(Price.mul(each, s.qty));
    }
    var msgs = [];
    if (e.weight) msgs.push('choose an estimated weight');
    if (e.style) msgs.push('choose a cooking style');
    if (e.prep) msgs.push('choose grilled or fried');
    if (e.sides) msgs.push('choose exactly 2 combo sides (' + total(s.sides) + ' / 2 chosen)');
    if (e.chip) msgs.push('choose fries or chips');
    if (e.size) msgs.push('choose a size');

    h += '<div class="ov"><button type="button" class="scrim" tabindex="-1" aria-hidden="true" data-act="close-sheet"></button>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-describedby="sheet-desc"><div class="sheet-handle" aria-hidden="true"></div>' +
      '<div class="sheet-head"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;"><p class="eyebrow">' + esc(eyebrow) + '</p>' +
      '<h2 id="sheet-title" style="margin: 0; font-family: ' + CFG.disp + '; font-size: 28px; line-height: 34px;">' + esc(title) + '</h2>' +
      '<p id="sheet-desc" style="margin: 0; font-size: 15px; line-height: 22px; color: ' + CFG.muted + ';">' + esc(desc) + '</p>' +
      '<p style="margin: 4px 0 0; font-size: 15px; font-weight: 600;">' + esc(price) + '</p></div>' +
      '<button type="button" class="icon-btn" data-sheet-close="true" aria-label="Close" data-act="close-sheet" data-k="sheet-close">' + X + '</button></div><div class="sheet-body">';
    if (msgs.length) h += '<p class="err-box" role="alert" tabindex="-1" data-sheet-err="true" style="margin: 0;">To add this item, ' + esc(msgs.join(', ')) + '.</p>';

    if (s.cat === 'catch') {
      var fish2 = M.byId[s.itemId];
      h += '<fieldset class="' + (e.weight ? 'fs-err' : '') + '" aria-describedby="weight-hint weight-err"><legend>Estimated weight <span class="req">Required</span></legend>' +
        '<div class="opts" style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 96px), 1fr));">' +
        M.weights.map(function (w) { return radio('sheet-weight', 'weight', w, w === 'Other' ? 'Other' : w + ' lb', s.weight === w, oc(s.weight === w)); }).join('') + '</div>';
      if (s.weight === 'Other') {
        h += '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 12px;"><div class="stepper" role="group" aria-label="Other weight in pounds">' +
          '<button type="button" aria-label="Half a pound less"' + (s.other <= 0.5 ? ' disabled' : '') + ' data-act="other-dec" data-k="other-dec">−</button><span aria-live="polite">' + s.other + ' lb</span>' +
          '<button type="button" aria-label="Half a pound more"' + (s.other >= M.maxLb ? ' disabled' : '') + ' data-act="other-inc" data-k="other-inc">+</button></div>' +
          '<span class="hint">0.5 lb steps, up to ' + esc(M.maxLbLabel) + '</span></div>';
      }
      h += '<p id="weight-hint" class="hint" style="margin-top: 8px;">' + esc(M.weightHelper) + '.</p>' + (e.weight ? '<p id="weight-err" class="err">Choose an estimated weight.</p>' : '') + '</fieldset>';
      h += '<fieldset class="' + (e.style ? 'fs-err' : '') + '" aria-describedby="style-err"><legend>How should the chef cook it? <span class="req">Required</span></legend><div class="opts opts-wide">' +
        M.styles.filter(function (st) { return fish2.styles.indexOf(st.key) >= 0; }).map(function (st) {
          var extra = st.extra ? '+' + Price.fmt(Price.num(st.extraPrice)) : 'Included';
          return radio('sheet-style', 'style', st.key, st.name, s.style === st.key, oc(s.style === st.key) + ' opt-style',
            '<span style="flex: 1;">' + esc(st.name) + '<span class="opt-sub">[OWNER: one-line description]</span></span><span class="opt-extra">' + esc(extra) + '</span>');
        }).join('') + '</div><p class="hint" style="margin-top: 8px;">Only the styles we offer for this fish are shown. <a href="menu.html#styles">About the cooking styles</a></p>' +
        (e.style ? '<p id="style-err" class="err">Choose how the chef should cook it.</p>' : '') + '</fieldset>';
      h += '<fieldset><legend>Add sides <span class="req">Optional · [PRICE] each</span></legend><div class="srows">' + stepRows(s.addSides, M.addSides, 'addSides', 0) + '</div></fieldset>';
      var w = s.weight ? weightOf(s) : null, st2 = styleOf(s.style);
      var extras = (st2 && st2.extra ? ' + ' + Price.fmt(Price.num(st2.extraPrice)) + ' ' + st2.name.toLowerCase() : '') + (total(s.addSides) ? ' + sides ' + Price.fmt(Price.sum(Object.keys(s.addSides).map(function (id) { return Price.mul(s.addSides[id], Price.num(M.byId[id].price)); }))) : '');
      h += '<div class="breakdown" aria-live="polite"><span>' + esc((w ? w + ' lb' : '[weight]') + ' × (' + Price.fmt(Price.num(fish2.pricePerLb)) + '/lb + ' + Price.fmt(Price.num(fish2.cookingChargePerLb)) + '/lb cooking)' + extras) + '</span>' +
        '<b>= Est. ' + esc(Price.fmt(each)) + '</b></div>' +
        '<p class="note-box" style="margin: 0;">We weigh your fish at the counter. Your final price is set by the actual weight and may differ slightly from the estimate.</p>';
    } else {
      var fl = flags(s);
      if (fl.hasPrep) {
        h += '<fieldset class="' + (e.prep ? 'fs-err' : '') + '" aria-describedby="prep-err"><legend>Cooking Preparation <span class="req">Required · choose 1</span></legend><div class="opts">' +
          M.preps.map(function (p) { return radio('sheet-prep', 'prep', p, p, s.prep === p, oc(s.prep === p)); }).join('') + '</div>' +
          (e.prep ? '<p id="prep-err" class="err">Choose grilled or fried.</p>' : '') + '</fieldset>';
      }
      if (fl.hasSides) {
        h += '<fieldset class="' + (e.sides ? 'fs-err' : '') + '" aria-describedby="sides-count sides-err"><legend>Combo Sides (pick 2) <span class="req">Required · exactly 2</span></legend>' +
          '<p class="hint" style="margin: 0 0 10px;">You can pick the same side twice.</p><div class="srows">' + stepRows(s.sides, M.comboSides, 'sides', 2) + '</div>' +
          '<p id="sides-count" class="counter" aria-live="polite">' + total(s.sides) + ' / 2 chosen</p>' + (e.sides ? '<p id="sides-err" class="err">Choose 2 sides to continue.</p>' : '') + '</fieldset>';
      }
      if (fl.hasChips) {
        h += '<fieldset class="' + (e.chip ? 'fs-err' : '') + '" aria-describedby="chip-err"><legend>Side (pick 1) <span class="req">Required</span></legend><div class="opts opts-wide">' +
          M.chips.map(function (c) { return radio('sheet-chip', 'chip', c, c, s.chip === c, oc(s.chip === c)); }).join('') + '</div>' +
          (e.chip ? '<p id="chip-err" class="err">Choose fries or a bag of chips.</p>' : '') + '</fieldset>';
      }
      if (fl.hasSize) {
        h += '<fieldset class="' + (e.size ? 'fs-err' : '') + '" aria-describedby="size-err"><legend>Size <span class="req">Required</span></legend><div class="opts">' +
          M.riceSizes.map(function (z) { return radio('sheet-size', 'size', z.name, z.name, s.size === z.name, oc(s.size === z.name), '<span>' + esc(z.name) + '</span><span class="opt-extra">' + Price.fmt(Price.num(z.price)) + '</span>'); }).join('') + '</div>' +
          (e.size ? '<p id="size-err" class="err">Choose a size.</p>' : '') + '</fieldset>';
      }
    }
    h += '<div class="field"><label for="sheet-note">Special instructions (optional)</label><textarea id="sheet-note" maxlength="140" aria-describedby="sheet-note-count" placeholder="Allergies, extra lemon, cut in half…" data-k="sheet-note">' + esc(s.note) + '</textarea>' +
      '<p id="sheet-note-count" class="hint">' + (s.note || '').length + ' / 140 characters</p></div></div>' +
      '<div class="sheet-foot"><div class="stepper" role="group" aria-label="Quantity"><button type="button" aria-label="Decrease quantity"' + (s.qty <= 1 ? ' disabled' : '') + ' data-act="qty-dec" data-k="qty-dec">−</button>' +
      '<span aria-live="polite">' + s.qty + '</span><button type="button" aria-label="Increase quantity" data-act="qty-inc" data-k="qty-inc">+</button></div>' +
      '<button type="button" class="' + CFG.pri + '" style="flex: 1 1 220px;" data-act="submit" data-k="submit">' + esc(cta) + '</button></div></div></div>';
    return h;
  }

  function cartHtml() {
    var lines = S.lines, hasLb = lines.some(function (l) { return l.lb; });
    var T = Price.totals(lines, M, { tip: S.tip, tipCustom: S.tipCustom, taxRate: null });
    var totalLabel = hasLb ? 'Estimated total' : 'Total';
    var closed = P.status === 'closed';
    var h = '<div class="ov ov-right"><button type="button" class="scrim" tabindex="-1" aria-hidden="true" data-act="close-cart"></button>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">' +
      '<div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 24px 24px 12px;"><div style="display: flex; flex-direction: column; gap: 4px;">' +
      '<h2 id="cart-title" style="margin: 0; font-family: ' + CFG.disp + '; font-size: 28px; line-height: 34px;">Your order</h2>' +
      '<p style="margin: 0; font-size: 14px; line-height: 20px; color: ' + CFG.muted + ';">Pickup · 14035 LaGrange Rd · about [PREP TIME]</p></div>' +
      '<button type="button" class="icon-btn" data-cart-close="true" aria-label="Close your order" data-act="close-cart" data-k="cart-close">' + X + '</button></div><div class="drawer-body">';
    if (!lines.length) {
      h += '<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding: 40px 0;"><h3 style="margin: 0; font-family: ' + CFG.disp + '; font-size: 24px; line-height: 30px;">Your order is empty</h3>' +
        '<p style="margin: 0; font-size: 15px; line-height: 22px; color: ' + CFG.muted + ';">Add a fish by the pound, a Hamido Combo or a few sides.</p>' +
        '<button type="button" class="' + CFG.sec + '" data-act="browse" data-k="browse">Browse the menu</button></div></div>';
    } else {
      h += '<ul style="margin: 0; padding: 0;">' + lines.map(function (l) {
        var q = l.qty || 1;
        return '<li class="ln"><div style="display: flex; gap: 16px; align-items: flex-start;"><div style="flex: 1; min-width: 0;"><p class="ln-name">' + esc(l.name) + '</p>' +
          (l.opts || []).map(function (t) { return '<p class="ln-opt">' + esc(t) + '</p>'; }).join('') + '</div><span class="price" style="white-space: nowrap;">' + esc(linePrice(l)) + '</span></div>' +
          '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;"><div class="stepper" role="group" aria-label="Quantity of ' + esc(l.name) + '">' +
          '<button type="button" aria-label="Decrease quantity of ' + esc(l.name) + '"' + (q <= 1 ? ' disabled' : '') + ' data-act="ln-dec" data-key="' + l.key + '" data-k="ln-dec-' + l.key + '">−</button><span>' + q + '</span>' +
          '<button type="button" aria-label="Increase quantity of ' + esc(l.name) + '" data-act="ln-inc" data-key="' + l.key + '" data-k="ln-inc-' + l.key + '">+</button></div>' +
          '<button type="button" class="link-btn" aria-label="Edit ' + esc(l.name) + '" data-act="ln-edit" data-key="' + l.key + '">Edit</button>' +
          '<button type="button" class="link-btn" aria-label="Remove ' + esc(l.name) + '" data-act="ln-remove" data-key="' + l.key + '">Remove</button></div></li>';
      }).join('') + '</ul>';
      h += '<fieldset><legend>Tip <span class="req">Optional</span></legend><div class="tips">' +
        [['15', '15%'], ['18', '18%'], ['20', '20%'], ['custom', 'Custom'], ['none', 'None']].map(function (t) { return radio('cart-tip', 'tip', t[0], t[1], S.tip === t[0], oc(S.tip === t[0])); }).join('') + '</div>' +
        (S.tip === 'custom' ? '<div class="field" style="margin-top: 12px; max-width: 200px;"><label for="tip-custom">Custom tip ($)</label><input id="tip-custom" type="text" inputmode="decimal" value="' + esc(S.tipCustom) + '" data-k="tip-custom"></div>' : '') +
        '</fieldset><dl class="totals"><div><dt>Subtotal</dt><dd>' + Price.fmt(T.subtotal, '[SUBTOTAL]') + '</dd></div><div><dt>Tax ([TAX RATE])</dt><dd>' + Price.fmt(T.tax, '[TAX]') + '</dd></div>' +
        '<div><dt>Tip</dt><dd>' + (S.tip === 'none' ? '—' : Price.fmt(T.tip, '[TIP]')) + '</dd></div><div class="tot"><dt>' + totalLabel + '</dt><dd>' + Price.fmt(T.total, '[TOTAL]') + '</dd></div></dl>' +
        (hasLb ? '<p class="note-box" style="margin: 0;">We weigh your fish at the counter. Your final price is set by the actual weight and may differ slightly from the estimate.</p>' : '') + '</div>';
      h += '<div style="border-top: 1px solid var(--line); padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 8px;">' +
        (closed ? '<button type="button" class="' + CFG.pri + '" disabled style="width: 100%;">Online ordering is closed</button>'
          : '<a class="' + CFG.pri + '" href="checkout.html" style="width: 100%;">Go to checkout · ' + totalLabel + ' ' + Price.fmt(T.total, '[TOTAL]') + '</a>') +
        '<p style="margin: 0; font-size: 13px; line-height: 18px; color: ' + CFG.muted + '; text-align: center;">Pickup only · pay online · dining in is walk-in only.</p></div>';
    }
    return h + '</aside></div>';
  }

  function renderLayer() {
    var layer = $('#order-layer');
    var act = document.activeElement, k = act && act.getAttribute ? act.getAttribute('data-k') : null;
    var sb = $('.sheet-body', layer), sbTop = sb ? sb.scrollTop : 0;
    var db = $('.drawer-body', layer), dbTop = db ? db.scrollTop : 0;
    var h = '';
    if (S.toast) h += '<div class="toast" role="status"><span>Added · ' + esc(S.toast.name) + '</span><button type="button" data-act="undo" aria-label="Undo: remove ' + esc(S.toast.name) + '">Undo</button></div>';
    if (count() > 0 && !S.cartOpen && !S.sheet) {
      var T = Price.totals(S.lines, M, {});
      h += '<div class="mbar"><button type="button" class="' + CFG.pri + '" aria-haspopup="dialog" style="width: 100%; min-height: 56px; box-shadow: 0 8px 24px rgba(15,27,61,.25);" data-act="open-cart">View order (' + count() + ') · ' + Price.fmt(T.subtotal, '[SUBTOTAL]') + '</button></div>';
    }
    if (S.sheet) h += sheetHtml();
    if (S.cartOpen) h += cartHtml();
    layer.innerHTML = h;
    var flash = $('p.sr[aria-live]', root);
    if (flash) flash.textContent = S.flash;
    sb = $('.sheet-body', layer); if (sb) sb.scrollTop = sbTop;
    db = $('.drawer-body', layer); if (db) db.scrollTop = dbTop;
    if (k) { var t = layer.querySelector('[data-k="' + k + '"]'); if (t && !t.disabled) t.focus({ preventScroll: true }); }
  }
  function renderAll() { renderTabs(); renderCount(); renderLayer(); }

  function setLines(lines, extra) { S.lines = lines; Object.assign(S, extra || {}); writeCart(lines); }
  function focusSoon(sel) { setTimeout(function () { var el = $(sel); if (el) el.focus({ preventScroll: true }); }, 0); }
  function openSheet(cat, id) { lastFocus = document.activeElement; S.sheet = newSheet(cat, id); S.cartOpen = false; renderAll(); focusSoon('[data-sheet-close]'); }
  function closeSheet() {
    var s = S.sheet; S.sheet = null; S.cartOpen = !!(s && s.fromCart); renderAll();
    if (S.cartOpen) focusSoon('[data-cart-close]'); else restore();
  }
  function openCart() { lastFocus = document.activeElement; S.cartOpen = true; S.sheet = null; renderAll(); focusSoon('[data-cart-close]'); }
  function closeCart() { S.cartOpen = false; renderAll(); restore(); }
  function restore() { try { if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  function up(p) { Object.assign(S.sheet, p); renderLayer(); }
  function clearErr(k) { if (S.sheet && S.sheet.err[k]) delete S.sheet.err[k]; }

  function quickAdd(id) {
    var it = M.byId[id];
    var line = buildLine({ cat: it.cat, itemId: id, qty: 1, note: '', prep: '', sides: {}, chip: '', size: '' });
    clearTimeout(toastTimer);
    setLines(S.lines.concat([line]), { toast: { key: line.key, name: line.name }, flash: 'Added ' + line.name + ' to your order.' });
    renderAll();
    toastTimer = setTimeout(function () { S.toast = null; renderLayer(); }, 6000);
  }
  function submitSheet() {
    var s = S.sheet, err = {};
    if (s.cat === 'catch') {
      var w = weightOf(s);
      if (!s.weight || !(w >= 0.5 && w <= M.maxLb)) err.weight = true;
      if (!s.style) err.style = true;
    } else {
      var f = flags(s);
      if (f.hasPrep && !s.prep) err.prep = true;
      if (f.hasSides && total(s.sides) !== 2) err.sides = true;
      if (f.hasChips && !s.chip) err.chip = true;
      if (f.hasSize && !s.size) err.size = true;
    }
    if (Object.keys(err).length) { s.err = err; renderLayer(); focusSoon('[data-sheet-err]'); return; }
    var line = buildLine(s);
    var lines = s.editKey ? S.lines.map(function (l) { return l.key === s.editKey ? Object.assign(line, { key: s.editKey }) : l; }) : S.lines.concat([line]);
    var back = !!s.fromCart;
    setLines(lines, { sheet: null, cartOpen: back, flash: (s.editKey ? 'Updated ' : 'Added ') + line.name + ' to your order.' });
    renderAll();
    if (back) focusSoon('[data-cart-close]'); else restore();
  }

  function onClick(ev) {
    var t = ev.target.closest('[data-act]');
    if (!t || t.tagName === 'INPUT') return;
    var a = t.getAttribute('data-act'), id = t.getAttribute('data-id'), key = t.getAttribute('data-key');
    var s = S.sheet;
    var bump = function (field, d, max) {
      var cur = Object.assign({}, s[field]); var n = Math.max(0, (cur[id] || 0) + d);
      if (max && d > 0 && total(cur) >= max) return;
      if (n) cur[id] = n; else delete cur[id];
      s[field] = cur;
      if (field === 'sides' && total(cur) === 2) clearErr('sides');
      renderLayer();
    };
    switch (a) {
      case 'add': { var it = M.byId[id]; if (hasOpts(it)) openSheet(it.cat, id); else quickAdd(id); break; }
      case 'open-cart': openCart(); break;
      case 'close-cart': closeCart(); break;
      case 'close-sheet': closeSheet(); break;
      case 'browse': S.cartOpen = false; renderAll(); var c = $('#cat-catch'); if (c) c.scrollIntoView(); break;
      case 'undo': {
        var tt = S.toast; if (!tt) break; clearTimeout(toastTimer);
        setLines(S.lines.filter(function (l) { return l.key !== tt.key; }), { toast: null, flash: 'Removed ' + tt.name + '.' }); renderAll(); break;
      }
      case 'other-dec': up({ other: Math.max(0.5, s.other - 0.5) }); break;
      case 'other-inc': up({ other: Math.min(M.maxLb, s.other + 0.5) }); break;
      case 'addSides-dec': bump('addSides', -1, 0); break;
      case 'addSides-inc': bump('addSides', 1, 0); break;
      case 'sides-dec': bump('sides', -1, 2); break;
      case 'sides-inc': bump('sides', 1, 2); break;
      case 'qty-dec': up({ qty: Math.max(1, s.qty - 1) }); break;
      case 'qty-inc': up({ qty: s.qty + 1 }); break;
      case 'submit': submitSheet(); break;
      case 'ln-dec': case 'ln-inc': {
        setLines(S.lines.map(function (l) { return l.key === key ? Object.assign({}, l, { qty: Math.max(1, (l.qty || 1) + (a === 'ln-inc' ? 1 : -1)) }) : l; })); renderAll(); break;
      }
      case 'ln-edit': {
        var l = S.lines.filter(function (x) { return x.key === key; })[0]; if (!l) break;
        var d = JSON.parse(JSON.stringify(l.data || {}));
        S.cartOpen = false;
        S.sheet = Object.assign(newSheet(d.cat, d.itemId), d, { qty: l.qty, editKey: l.key, fromCart: true, err: {} });
        renderAll(); focusSoon('[data-sheet-close]'); break;
      }
      case 'ln-remove': {
        var r = S.lines.filter(function (x) { return x.key === key; })[0];
        setLines(S.lines.filter(function (x) { return x.key !== key; }), { flash: r ? 'Removed ' + r.name + '.' : '' }); renderAll(); focusSoon('[data-cart-close]'); break;
      }
    }
  }
  function onChange(ev) {
    var t = ev.target, a = t.getAttribute('data-act');
    if (!a) return;
    var v = t.getAttribute('data-v'), s = S.sheet;
    if (a === 'tip') { S.tip = v; renderLayer(); return; }
    if (!s) return;
    if (a === 'weight') { s.weight = v; clearErr('weight'); }
    else if (a === 'style') { s.style = v; clearErr('style'); }
    else if (a === 'prep') { s.prep = v; clearErr('prep'); }
    else if (a === 'chip') { s.chip = v; clearErr('chip'); }
    else if (a === 'size') { s.size = v; clearErr('size'); }
    renderLayer();
  }
  function onInput(ev) {
    var t = ev.target;
    if (t.id === 'sheet-note' && S.sheet) {
      S.sheet.note = String(t.value || '').slice(0, 140);
      var c = $('#sheet-note-count'); if (c) c.textContent = S.sheet.note.length + ' / 140 characters';
    } else if (t.id === 'tip-custom') { S.tipCustom = t.value; }
  }
  function onKey(ev) {
    var box = ev.target.closest('.sheet, .drawer');
    if (!box || !window.IHS.trapKey) return;
    window.IHS.trapKey(ev, box, box.classList.contains('sheet') ? closeSheet : closeCart);
  }

  function initOrder() {
    var menu = $('#order-menu');
    if (menu) menu.innerHTML = menuHtml();
    var layer = document.createElement('div');
    layer.id = 'order-layer';
    root.appendChild(layer);
    renderBanner();
    var lines = P.demoCart ? demoLines() : readCart();
    if (P.demoCart) writeCart(lines);
    S.lines = lines;
    Object.assign(S, panelState(P.panel));
    renderAll();
    if (S.sheet) focusSoon('[data-sheet-close]');
    if (S.cartOpen) focusSoon('[data-cart-close]');
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { S.activeCat = en.target.getAttribute('data-cat'); renderTabs(); } });
      }, { rootMargin: '-25% 0px -65% 0px' });
      $$('[data-cat]').forEach(function (el) { io.observe(el); });
    } catch (e) {}
  }

  /* =====================================================================
     CHECKOUT + CONFIRMATION
     ===================================================================== */
  function lineLi(l, conf) {
    return '<li class="ln"><span style="font: 600 14px/21px ' + CFG.sans + '; color: ' + CFG.muted + '; min-width: 28px;">' + (l.qty || 1) + '×</span>' +
      '<div style="flex: 1; min-width: 0;"><p class="ln-name">' + esc(l.name) + '</p>' + (l.opts || []).map(function (t) { return '<p class="ln-opt">' + esc(t) + '</p>'; }).join('') +
      (conf && l.lb ? '<p class="ln-opt" style="font-weight: 600; color: var(--turquoise-ink);">Est., final after weighing</p>' : '') + '</div>' +
      '<span style="font: 600 14px/21px ' + CFG.sans + '; white-space: nowrap;">' + esc(linePrice(l)) + '</span></li>';
  }
  function showIf(path, ok, scope) { $$('[data-if="' + path + '"]', scope || root).forEach(function (el) { el.hidden = !ok; }); }

  function initCheckout() {
    if (P.step === 'confirmed') { location.replace('confirmed.html' + location.search.replace(/([?&])step=confirmed&?/, '$1').replace(/[?&]$/, '')); return; }
    var C = { when: 'asap', slot: '', name: '', phone: '', email: '', smsOrder: false, smsMkt: false, touched: {}, submitted: P.showErrors, sumOpen: false };
    var lines = readCart();
    if (!lines.length && P.demoCart) lines = demoLines();
    var closed = P.status === 'closed';
    var hasLb = lines.some(function (l) { return l.lb; });
    var T = Price.totals(lines, M, {});
    var totalLabel = hasLb ? 'Estimated total' : 'Total';
    var name = $('#co-name'), phone = $('#co-phone'), email = $('#co-email');
    var radios = $$('input[name="co-when"]');
    var place = $('.co-main > div:last-child button');
    function errors() {
      var o = {};
      if (!C.name.trim()) o.name = 'Enter your full name.';
      if (String(C.phone).replace(/\D/g, '').length < 10) o.phone = 'Enter a mobile number with at least 10 digits, like (708) 555-0123.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(C.email.trim())) o.email = 'Enter an email address, like name@example.com.';
      if (C.when === 'sched' && !C.slot) o.slot = 'Choose a pickup time.';
      return o;
    }
    function render() {
      var errs = errors();
      var show = function (f) { return !!errs[f] && (C.submitted || !!C.touched[f]); };
      var order = [['slot', '#co-slot'], ['name', '#co-name'], ['phone', '#co-phone'], ['email', '#co-email']];
      var list = C.submitted ? order.filter(function (o) { return errs[o[0]]; }) : [];
      var sum = $('[data-if="showSummary"]');
      if (sum) {
        sum.hidden = !list.length;
        $('h2', sum).textContent = 'There ' + (list.length === 1 ? 'is 1 problem' : 'are ' + list.length + ' problems') + ' with your order';
        $('ul', sum).innerHTML = list.map(function (o) { return '<li><a href="' + o[1] + '">' + esc(errs[o[0]]) + '</a></li>'; }).join('');
      }
      [['name', name, 'showNameErr'], ['phone', phone, 'showPhoneErr'], ['email', email, 'showEmailErr'], ['slot', $('#co-slot'), 'showSlotErr']].forEach(function (f) {
        var input = f[1]; if (!input) return;
        var field = input.closest('.field'); var bad = show(f[0]);
        field.classList.toggle('field-err', bad);
        input.setAttribute('aria-invalid', bad ? 'true' : 'false');
        var p = $('[data-if="' + f[2] + '"]', field);
        if (p) { p.hidden = !bad; p.textContent = errs[f[0]] || ''; }
      });
      radios.forEach(function (r, i) {
        var on = (i === 0) === (C.when === 'asap');
        r.checked = on; r.disabled = closed;
        r.closest('label').className = 'opt' + (on ? ' opt-on' : '') + (closed ? ' opt-dis' : '');
      });
      showIf('isSched', C.when === 'sched');
      showIf('closed', closed);
      showIf('hasLb', hasLb);
      showIf('isEmpty', !lines.length);
      if (place) { place.disabled = closed; place.textContent = 'Place order · ' + totalLabel + ' ' + Price.fmt(T.total, '[TOTAL]'); }
      var ul = $('#sum-body ul'); if (ul) ul.innerHTML = lines.map(function (l) { return lineLi(l, false); }).join('');
      var dds = $$('#sum-body .totals dd');
      if (dds.length === 4) { dds[0].textContent = Price.fmt(T.subtotal, '[SUBTOTAL]'); dds[1].textContent = Price.fmt(T.tax, '[TAX]'); dds[2].textContent = Price.fmt(T.tip, '[TIP]'); dds[3].textContent = Price.fmt(T.total, '[TOTAL]'); }
      var dt = $('#sum-body .totals .tot dt'); if (dt) dt.textContent = totalLabel;
      var tg = $('.sum-toggle');
      if (tg) {
        tg.setAttribute('aria-expanded', C.sumOpen ? 'true' : 'false');
        tg.children[0].textContent = (C.sumOpen ? 'Hide' : 'Show') + ' items (' + lines.reduce(function (a, l) { return a + (l.qty || 1); }, 0) + ') · ' + (hasLb ? 'Est. ' : '') + Price.fmt(T.total, '[TOTAL]');
        tg.children[1].textContent = C.sumOpen ? '–' : '+';
        $('#sum-body').className = C.sumOpen ? 'sum-open' : 'sum-closed';
      }
    }
    var bind = function (el, f) {
      if (!el) return;
      el.addEventListener('input', function () { C[f] = el.value; render(); });
      el.addEventListener('blur', function () { C.touched[f] = true; render(); });
    };
    bind(name, 'name'); bind(phone, 'phone'); bind(email, 'email');
    var slot = $('#co-slot');
    if (slot) { slot.addEventListener('change', function () { C.slot = slot.value; render(); }); slot.addEventListener('blur', function () { C.touched.slot = true; render(); }); }
    radios.forEach(function (r, i) { r.addEventListener('change', function () { C.when = i === 0 ? 'asap' : 'sched'; render(); }); });
    var cbs = $$('.consent input[type="checkbox"]');
    if (cbs[0]) cbs[0].addEventListener('change', function () { C.smsOrder = cbs[0].checked; });
    if (cbs[1]) cbs[1].addEventListener('change', function () { C.smsMkt = cbs[1].checked; });
    var tg = $('.sum-toggle'); if (tg) tg.addEventListener('click', function () { C.sumOpen = !C.sumOpen; render(); });
    if (place) place.addEventListener('click', function () {
      if (Object.keys(errors()).length) { C.submitted = true; render(); var s = $('[data-err-summary]'); if (s) s.focus(); return; }
      var sel = slot ? slot.options[slot.selectedIndex] : null;
      try {
        localStorage.setItem(LAST, JSON.stringify({ lines: lines, pickup: C.when === 'sched' && sel && sel.value ? 'Today, ' + sel.textContent : 'ASAP · ready in about [PREP TIME]', smsOrder: C.smsOrder, at: Date.now() }));
        localStorage.removeItem(KEY);
      } catch (e) {}
      location.href = 'confirmed.html';
    });
    render();
    if (C.submitted) { var s0 = $('[data-err-summary]'); if (s0 && !s0.hidden) s0.focus(); }
  }

  function initConfirmed() {
    var last = null;
    try { last = JSON.parse(localStorage.getItem(LAST) || 'null'); } catch (e) {}
    var lines = last && last.lines && last.lines.length ? last.lines : (readCart().length ? readCart() : demoLines());
    var hasLb = lines.some(function (l) { return l.lb; });
    var T = Price.totals(lines, M, {});
    var dd = $('.conf-dl dd'); if (dd) dd.textContent = last ? last.pickup : 'ASAP · ready in about [PREP TIME]';
    showIf('smsOrder', !!(last && last.smsOrder));
    showIf('hasLb', hasLb);
    var ul = $('h2.co-h2 + ul', root); if (ul) ul.innerHTML = lines.map(function (l) { return lineLi(l, true); }).join('');
    var tot = $('.totals .tot', root);
    if (tot) { tot.children[0].textContent = hasLb ? 'Estimated total' : 'Total'; tot.children[1].textContent = Price.fmt(T.total, '[TOTAL]'); }
    // Move focus to the heading only when we just came from checkout (as the canvas does after "Place order")
    var h1 = $('[data-conf-title]'); if (h1 && last && Date.now() - (last.at || 0) < 15000) h1.focus({ preventScroll: true });
  }

  loadData().then(function (J) {
    M = buildModel(J);
    if (page === 'order') initOrder();
    else if (page === 'checkout') initCheckout();
    else if (page === 'confirmed') initConfirmed();
  }).catch(function (e) { if (window.console) console.error('Menu data could not be loaded', e); });
})();

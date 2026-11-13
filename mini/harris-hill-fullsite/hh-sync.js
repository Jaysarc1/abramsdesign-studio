/* Harris Hill site · the Flagship wiring.
   Inquiries hand themselves to the barn office; horse status and published show results come back from it. */
(function () {
  'use strict';
  var ST = window.HHStore; if (!ST) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var HS = { sale: 'For sale', lease: 'For lease', contract: 'Under contract', sold: 'Sold', leased: 'Leased' };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var PL = { ch: ['Champion', ['#1F4FA3', '#B3262E', '#E2B93B']], rc: ['Reserve', ['#B3262E', '#E2B93B', '#F4F1EA']], 1: ['1st', ['#1F4FA3']], 2: ['2nd', ['#B3262E']], 3: ['3rd', ['#E2B93B']], 4: ['4th', ['#F4F1EA']], 5: ['5th', ['#E59BB0']], 6: ['6th', ['#3E7D4F']] };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ribbon(k) {
    var p = PL[k]; if (!p) return ''; var c = p[1], g = '';
    for (var i = 0; i < c.length; i++) g += '<circle cx="12" cy="9" r="' + ((10 - i * (c.length > 1 ? 3 : 0)) * .62) + '" fill="' + c[i] + '" stroke="rgba(19,40,77,.28)" stroke-width=".6"/>';
    return '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M9.2 12.5 7.6 21l2.6-1.4L12 21.6V13M14.8 12.5 16.4 21l-2.6-1.4L12 21.6" fill="' + c[0] + '" stroke="rgba(19,40,77,.28)" stroke-width=".6" stroke-linejoin="round"/>' + g + '</svg>';
  }
  var css = document.createElement('style');
  css.textContent = '.hc.hh-gone img{filter:grayscale(1) contrast(.92) brightness(1.04)}.hc.hh-gone .tag{opacity:.7}' +
    '.hh-res{margin:0;padding:0;list-style:none}.hh-res>li+li{margin-top:56px}' +
    '.hh-res h3{margin:0;font-family:var(--f-display);font-weight:500;font-size:clamp(26px,2.6vw,34px);line-height:1.1;letter-spacing:-.01em}' +
    '.hh-res h3 em{font-style:italic}.hh-res .when{margin:10px 0 0;font-family:var(--f-mark);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-2)}' +
    '.hh-res ol{list-style:none;margin:26px 0 0;padding:0;border-top:1px solid var(--line)}' +
    '.hh-res ol li{display:grid;grid-template-columns:30px 112px minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line)}' +
    '.hh-res ol li svg{display:block}.hh-res .pl{font-family:var(--f-mark);font-size:11px;letter-spacing:.2em;text-transform:uppercase}' +
    '.hh-res .hn{font-family:var(--f-display);font-size:21px;line-height:1.1}.hh-res .cl{color:var(--ink-2);font-size:15.5px}.hh-res .cl small{display:block;font-size:13.5px;opacity:.8}' +
    '@media (max-width:700px){.hh-res ol li{grid-template-columns:30px minmax(0,1fr);gap:4px 16px}.hh-res ol li svg{grid-row:span 3}.hh-res .cl{grid-column:2}}';
  document.head.appendChild(css);

  /* ---------- horses: status, listing and new arrivals ---------- */
  var file = (location.pathname.split('/').pop() || 'index.html');
  var tmpl = null;
  function applyHorses(st) {
    if (!st || !st.horses) return;
    var by = {}; st.horses.forEach(function (h) { by[h.id] = h; });
    if (file === 'horses.html') {
      var grid = $('.hgrid'); if (!grid) return;
      if (!tmpl) { var c0 = $('.hc', grid); tmpl = c0 && c0.cloneNode(true); }
      $$('.hc', grid).forEach(function (a) {
        var id = (a.getAttribute('href') || '').replace(/^horse-|\.html$/g, '');
        if (a.hasAttribute('data-hh')) id = a.getAttribute('data-hh');
        var h = by[id];
        if (!h || !h.site) { a.style.display = 'none'; return; }
        a.style.display = ''; fill(a, h);
      });
      st.horses.forEach(function (h) {
        if (!h.site || $('.hc[href="horse-' + h.id + '.html"]', grid) || $('.hc[data-hh="' + h.id + '"]', grid) || !tmpl) return;
        var a = tmpl.cloneNode(true); a.setAttribute('data-hh', h.id); a.setAttribute('href', 'inquire.html?t=viewing&h=' + encodeURIComponent(h.name));
        a.classList.add('in'); $$('.rv,.fr', a).forEach(function (x) { x.classList.add('in'); });
        var im = $('img', a); if (im) { im.src = 'images/' + h.img; im.alt = h.name + ', ' + String(h.sex || '').toLowerCase() + ', ' + (h.ht || ''); im.removeAttribute('loading'); }
        fill(a, h); grid.insertBefore(a, grid.firstChild);
      });
      var on = $('.tabs [aria-pressed="true"]'); if (on) on.click();
    }
    var m = file.match(/^horse-(.+)\.html$/);
    if (m && by[m[1]]) { var p = $('.pf .proof'); if (p) p.textContent = HS[by[m[1]].status] || p.textContent; }
    if (file === 'inquire.html') {
      var sel = $('#hs'); if (sel) {
        var keep = sel.value, names = st.horses.filter(function (h) { return h.site && (h.status === 'sale' || h.status === 'lease' || h.status === 'contract'); }).map(function (h) { return h.name; });
        var q = new URLSearchParams(location.search).get('h'); if (q && names.indexOf(q) < 0) names.unshift(q);
        sel.innerHTML = names.concat(['Not sure yet']).map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
        if (names.concat(['Not sure yet']).indexOf(keep) >= 0) sel.value = keep;
      }
    }
  }
  function fill(a, h) {
    var gone = h.status === 'sold' || h.status === 'leased';
    a.setAttribute('data-s', h.status === 'contract' ? 'sale' : h.status);
    a.classList.toggle('hh-gone', gone);
    var t = $('.tag', a); if (t) t.textContent = HS[h.status];
    var n = $('h3', a); if (n) n.textContent = h.name;
    var sp = $('.sp', a); if (sp) sp.innerHTML = esc(h.disc) + ' &middot; ' + esc(h.age) + ' &middot; ' + esc(h.ht) + ' &middot; ' + esc(h.sex);
  }

  /* ---------- shows: published results ---------- */
  function applyShows(st) {
    if (file !== 'shows.html' || !st || !st.shows) return;
    var pub = st.shows.filter(function (s) { return s.publish && s.results && s.results.length; }).sort(function (a, b) { return new Date(b.start) - new Date(a.start); });
    var ex = $('#results');
    if (!pub.length) { if (ex) ex.remove(); return; }
    var html = '<ul class="hh-res">' + pub.map(function (s) {
      var d = new Date(s.start), e = new Date(+d + (s.days - 1) * 864e5);
      return '<li><h3>' + esc(s.venue) + ', <em>' + esc(s.name) + '</em></h3><p class="when">' + MON[d.getMonth()] + ' ' + d.getDate() + ' to ' + (e.getMonth() !== d.getMonth() ? MON[e.getMonth()] + ' ' : '') + e.getDate() + ', ' + d.getFullYear() + '</p><ol>' +
        s.results.map(function (r) { return '<li>' + ribbon(r.place) + '<span class="pl">' + (PL[r.place] ? PL[r.place][0] : '') + '</span><span class="hn">' + esc(r.horse) + '</span><span class="cl">' + esc(r.cls) + '<small>' + esc(r.rider === 'Jennifer' ? 'Jennifer Bliss' : r.rider) + '</small></span></li>'; }).join('') + '</ol></li>';
    }).join('') + '</ul>';
    if (ex) { $('.sc', ex).innerHTML = html; return; }
    var first = $('main .sec'); if (!first) return;
    var s = document.createElement('section'); s.className = 'sec'; s.id = 'results';
    s.innerHTML = '<div class="wrap g12 rule-host"><div class="sl"><p class="lbl rv">Results</p></div><div class="sc">' + html + '</div></div>';
    first.parentNode.insertBefore(s, first.nextSibling);
    if (location.hash === '#results') setTimeout(function () { s.scrollIntoView(); }, 60);
  }

  function apply() { var st = ST.state(); applyHorses(st); applyShows(st); }
  apply();
  ST.on(function (k) { if (k === 'state') apply(); });

  /* ---------- inquiries ---------- */
  function uid() { return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var iq = $('#iq');
  if (iq) {
    var sent = false, done = $('.stp[data-k="5"]', iq);
    var mo = new MutationObserver(function () {
      if (sent || !done || !done.classList.contains('on')) return;
      sent = true;
      var t = $('.tile[aria-pressed="true"]', iq), type = t ? t.getAttribute('data-t') : 'lesson';
      var dts = $$('#rv dt'), fields = dts.map(function (dt) { var dd = dt.nextElementSibling; return [dt.textContent, dd ? dd.textContent : '']; });
      var val = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      var hs = $('#hs');
      ST.inquire({ id: uid(), at: Date.now(), type: type, name: val('n'), contact: val('c'), rider: val('r'), horse: type === 'viewing' && hs ? hs.value : '', fields: fields });
    });
    if (done) mo.observe(done, { attributes: true, attributeFilter: ['class'] });
  }
  var lf = $('#f'), snt = $('#sent');
  if (lf && snt) lf.addEventListener('submit', function () {
    setTimeout(function () {
      if (!snt.textContent.trim() || lf._hh) return; lf._hh = true;
      var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      ST.inquire({ id: uid(), at: Date.now(), type: 'lesson', name: v('n'), contact: v('c'), rider: '', horse: '', fields: [['For', 'A lesson'], ['You and your horse', v('h')], ['From', 'Ride with Jennifer']].filter(function (x) { return x[1]; }) });
    }, 30);
  });

  /* ---------- the game opens beside the site in the flagship view ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="game.html"]');
    if (a && ST.framed) { e.preventDefault(); ST.go('game'); }
  });
})();

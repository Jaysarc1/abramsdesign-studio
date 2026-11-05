/* UMB · Luna's Coffee owner dashboard. window.LunaOwner.mount(el, {compact}) */
(function () {
  'use strict';
  if (window.LunaOwner) return;

  /* ---------- menu (single source of truth, from the brief) ---------- */
  var MENU = [
    { id: 'crescent', name: 'Crescent Latte', price: 6.25, cat: 'Coffee', milk: 1, sized: 1, beans: 'house' },
    { id: 'cappuccino', name: 'Cappuccino', price: 5.00, cat: 'Coffee', milk: 1, sized: 1, beans: 'house' },
    { id: 'flatwhite', name: 'Flat White', price: 5.25, cat: 'Coffee', milk: 1, sized: 0, beans: 'house' },
    { id: 'espresso', name: 'Espresso', price: 3.50, cat: 'Coffee', milk: 0, sized: 0, beans: 'house' },
    { id: 'moonlight', name: 'Moonlight Cold Brew', price: 5.75, cat: 'Cold', milk: 0, sized: 1, beans: 'cold' },
    { id: 'matcha', name: 'Ceremonial Matcha', price: 6.00, cat: 'Cold', milk: 1, sized: 1 },
    { id: 'croissant', name: 'Butter Croissant', price: 4.25, cat: 'Bakery' },
    { id: 'painchoc', name: 'Pain au Chocolat', price: 4.75, cat: 'Bakery' },
    { id: 'cookie', name: 'Midnight Cookie', price: 3.75, cat: 'Bakery' },
    { id: 'toast', name: 'Avocado Toast', price: 12.00, cat: 'Kitchen' }
  ];
  var BY = {}; MENU.forEach(function (m) { BY[m.id] = m; });
  var CATS = ['Coffee', 'Cold', 'Bakery', 'Kitchen'];
  var CATC = { Coffee: '#E8B84A', Cold: '#F3ECDF', Bakery: '#8E92B4', Kitchen: '#3E4470' };
  var TAX = 0.07;
  var HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  var W_WD = { 6: 20, 7: 46, 8: 52, 9: 42, 10: 31, 11: 29, 12: 35, 13: 29, 14: 23, 15: 25, 16: 21, 17: 17, 18: 13, 19: 11, 20: 8, 21: 5 };
  var W_WE = { 6: 0, 7: 22, 8: 36, 9: 48, 10: 52, 11: 46, 12: 40, 13: 33, 14: 28, 15: 26, 16: 23, 17: 19, 18: 16, 19: 14, 20: 12, 21: 9 };
  var DAYMULT = [1.15, 0.92, 0.95, 0.98, 1.0, 1.12, 1.25]; /* Sun..Sat */
  var NAMES = ['Ava M.', 'Noah R.', 'Isla P.', 'Mateo G.', 'Zoe K.', 'Leo S.', 'Mila T.', 'Eli W.', 'Nora B.', 'Owen L.', 'Ruby H.', 'Kai D.', 'Lena F.', 'Jude C.', 'Ivy A.', 'Ezra N.', 'Clara V.', 'Milo J.', 'Hazel O.', 'Felix Y.', 'Stella Q.', 'Theo B.', 'Elena R.', 'Hugo M.', 'Sofia L.', 'Arlo P.', 'Maya C.', 'Rhys T.', 'Iris G.', 'Sami K.', 'June E.', 'Luca D.', 'Ada W.', 'Remy S.', 'Vera N.', 'Cole H.'];
  var STAGES = ['New', 'Brewing', 'Ready', 'Picked up'];

  var STAFF = [
    { n: 'Maya Ortiz', r: 'Lead', s: 6, e: 14, rate: 22, past: 38.5 },
    { n: 'Theo Kim', r: 'Barista', s: 6.5, e: 12.5, rate: 18, past: 30 },
    { n: 'Jules Park', r: 'Kitchen', s: 7, e: 15, rate: 17.5, past: 35.5 },
    { n: 'Ana Lucero', r: 'Barista', s: 10, e: 18, rate: 18, past: 36 },
    { n: 'Sam Rivera', r: 'Barista', s: 14, e: 22, rate: 18, past: 31 },
    { n: 'Nia Brooks', r: 'Barista', s: 16, e: 22, rate: 17, past: 27 }
  ];

  /* ---------- helpers ---------- */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pick(r, arr, w) { var s = 0, i; for (i = 0; i < w.length; i++) s += w[i]; var x = r() * s; for (i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return arr[i]; } return arr[arr.length - 1]; }
  function r2(v) { return Math.round(v * 100) / 100; }
  var NF2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var NF0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var NF1 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hl(h) { var hh = h % 24; return (hh % 12 || 12) + (hh < 12 ? ' AM' : ' PM'); }
  function hs(h) { var hh = h % 24; return (hh % 12 || 12) + (hh < 12 ? 'a' : 'p'); }
  function tfmt(d, sec) { var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + pad(m) + (sec ? ':' + pad(d.getSeconds()) : '') + (h < 12 ? ' AM' : ' PM'); }
  function hm(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? ' AM' : ' PM'); }
  var FMT = {
    m: function (v) { return (v < 0 ? '−$' : '$') + NF2.format(Math.abs(v)); },
    m0: function (v) { return (v < 0 ? '−$' : '$') + NF0.format(Math.abs(v)); },
    n: function (v) { return NF0.format(v); },
    n1: function (v) { return NF1.format(v); },
    mmss: function (v) { v = Math.round(v); return Math.floor(v / 60) + ':' + pad(v % 60); },
    pc: function (v) { return (v >= 0 ? '+' : '−') + NF1.format(Math.abs(v)) + '%'; },
    p0: function (v) { return NF0.format(v) + '%'; },
    fig: function (v) { var s = NF2.format(v).split('.'); return '<span class="u-cur">$</span>' + s[0] + '<span class="u-cents">.' + s[1] + '</span>'; },
    fig0: function (v) { return '<span class="u-cur">$</span>' + NF0.format(v); }
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- icons (1.5px line) ---------- */
  var IC = {
    today: '<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
    sales: '<path d="M4 4.5v15h16"/><path d="M7.5 15l3.5-4.2 3 2.4 5-6"/>',
    inventory: '<path d="M12 3.5l7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.5 7.7 12 12l7.5-4.3M12 12v8.5"/>',
    team: '<circle cx="9" cy="8.5" r="3"/><path d="M3.8 19c.7-2.9 2.8-4.5 5.2-4.5s4.5 1.6 5.2 4.5"/><circle cx="16.8" cy="9.4" r="2.3"/><path d="M15.6 14.6c2.2.1 3.9 1.4 4.6 3.9"/>',
    books: '<path d="M12 6.6C10 5.1 7.2 4.6 4.5 5v13c2.7-.4 5.5.1 7.5 1.6 2-1.5 4.8-2 7.5-1.6V5c-2.7-.4-5.5.1-7.5 1.6z"/><path d="M12 6.6v13"/>',
    sync: '<path d="M19 8.5A7.5 7.5 0 0 0 5.6 7M5 15.5A7.5 7.5 0 0 0 18.4 17"/><path d="M5 3.5V7h3.5M19 20.5V17h-3.5"/>',
    check: '<path d="M5 12.5l4.2 4L19 7"/>'
  };
  function icon(k, sz) { return '<svg viewBox="0 0 24 24" width="' + (sz || 18) + '" height="' + (sz || 18) + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + '</svg>'; }
  var LUNA = '<svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true"><defs><mask id="umbLunaM"><rect width="64" height="64" fill="#fff"/><circle cx="41" cy="24" r="17" fill="#000"/></mask></defs><circle cx="31" cy="33" r="22" fill="#E8B84A" mask="url(#umbLunaM)"/><g transform="translate(41 25) rotate(38)"><ellipse rx="7.2" ry="10.5" fill="#E8B84A"/><path d="M0-9.5C-3-5 3-2 0 0S-3 5 0 9.5" fill="none" stroke="#0D0F1C" stroke-width="1.6" stroke-linecap="round"/></g></svg>';
  var UMBMARK = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.5" fill="none" stroke="#E8B84A" stroke-width="1.5"/><path d="M8 15.5v-3M12 15.5V8.5M16 15.5v-5" stroke="#E8B84A" stroke-width="1.6" stroke-linecap="round"/></svg>';

  /* ---------- styles ---------- */
  var CSS = [
    '.umb{--night:#0D0F1C;--deep:#161A31;--mid:#232946;--gold:#E8B84A;--gold2:#D9B26A;--cream:#F3ECDF;--muted:#A3A6B8;--ok:#5ED492;--line:rgba(243,236,223,.08);--line2:rgba(243,236,223,.14);--ease:cubic-bezier(.2,.7,.2,1);',
    'position:relative;display:grid;grid-template-columns:232px 1fr;grid-template-rows:76px 1fr;height:100%;width:100%;min-height:0;overflow:hidden;background:var(--night);color:var(--cream);font-family:Manrope,system-ui,sans-serif;font-size:14px;line-height:1.4;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;text-align:left;box-sizing:border-box}',
    '.umb *,.umb *::before,.umb *::after{box-sizing:border-box}',
    '.umb button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}',
    /* rail */
    '.umb .u-brand{grid-column:1;grid-row:1;display:flex;align-items:center;gap:12px;padding:0 28px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--deep)}',
    '.umb .u-umb{font-weight:800;letter-spacing:.32em;font-size:14px;color:var(--cream);padding-left:2px}',
    '.umb .u-rail{grid-column:1;grid-row:2;display:flex;flex-direction:column;background:var(--deep);border-right:1px solid var(--line);padding:28px 0 26px;min-height:0}',
    '.umb .u-nav{display:flex;flex-direction:column;gap:2px}',
    '.umb .u-nav button{position:relative;display:flex;align-items:center;gap:14px;height:46px;padding:0 28px;color:var(--muted);font-weight:600;font-size:14px;letter-spacing:.01em;transition:color .4s var(--ease),background .4s var(--ease)}',
    '.umb .u-nav button::before{content:"";position:absolute;left:0;top:11px;bottom:11px;width:2px;background:var(--gold);transform:scaleY(0);transition:transform .5s var(--ease)}',
    '.umb .u-nav button:hover{color:var(--cream)}',
    '.umb .u-nav button.on{color:var(--cream);background:rgba(243,236,223,.035)}',
    '.umb .u-nav button.on::before{transform:scaleY(1)}',
    '.umb .u-nav .u-badge{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:rgba(232,184,74,.14);color:var(--gold);font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}',
    '.umb .u-nav .u-live{margin-left:auto;width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 0 rgba(232,184,74,.5);animation:uPulse 2.4s var(--ease) infinite}',
    '.umb .u-foot{margin-top:auto;padding:0 28px;display:flex;align-items:center;gap:12px}',
    '.umb .u-wm{display:flex;flex-direction:column;line-height:1}',
    '.umb .u-wm b{font-family:Syne,Manrope,sans-serif;font-weight:800;letter-spacing:.02em;font-size:15px}',
    '.umb .u-wm i{font-style:normal;font-weight:600;font-size:8px;letter-spacing:.32em;color:var(--muted);margin-top:4px}',
    /* header */
    '.umb .u-head{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 44px;border-bottom:1px solid var(--line);min-width:0}',
    '.umb .u-loc{display:flex;align-items:center;gap:10px;font-size:15px;white-space:nowrap;min-width:0}',
    '.umb .u-loc b{font-weight:700;letter-spacing:.005em}',
    '.umb .u-loc span{color:var(--muted)}',
    '.umb .u-loc .u-hb{display:none}',
    '.umb .u-hr{display:flex;align-items:center;gap:10px;white-space:nowrap}',
    '.umb .u-chip{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 13px;border:1px solid var(--line2);border-radius:12px;font-size:12px;font-weight:600;color:var(--cream);letter-spacing:.01em}',
    '.umb .u-chip em{font-style:normal;color:var(--muted);font-weight:500}',
    '.umb .u-chip svg{color:var(--muted)}',
    '.umb .u-dot{width:7px;height:7px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 3px rgba(94,212,146,.14)}',
    '.umb .u-clock{display:flex;align-items:baseline;gap:12px;padding-left:20px;margin-left:8px;border-left:1px solid var(--line2);height:30px;align-items:center}',
    '.umb .u-clock span{color:var(--muted);font-size:12px;font-weight:600;letter-spacing:.02em}',
    '.umb .u-clock b{font-weight:600;font-size:14px;min-width:92px;text-align:right}',
    '.umb .u-tabs{display:none}',
    /* view */
    '.umb .u-view{grid-column:2;grid-row:2;position:relative;overflow-y:auto;overflow-x:hidden;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(243,236,223,.12) transparent}',
    '.umb .u-page{padding:34px 44px 44px;min-height:100%}',
    '.umb .u-sec{opacity:0;transform:translateY(14px)}',
    '.umb .u-page.in .u-sec{animation:uRise .9s var(--ease) forwards;animation-delay:calc(var(--i,0) * 120ms)}',
    '@keyframes uRise{to{opacity:1;transform:none}}',
    '@keyframes uPulse{0%{box-shadow:0 0 0 0 rgba(232,184,74,.45)}70%{box-shadow:0 0 0 7px rgba(232,184,74,0)}100%{box-shadow:0 0 0 0 rgba(232,184,74,0)}}',
    '@keyframes uGlow{0%,100%{opacity:1}50%{opacity:.35}}',
    '.umb .u-lab{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}',
    '.umb .u-sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:18px;min-height:16px}',
    '.umb .u-meta{font-size:12px;color:var(--muted);font-weight:500;white-space:nowrap}',
    '.umb .u-meta b{color:var(--cream);font-weight:600}',
    '.umb .u-gold{color:var(--gold)}',
    '.umb .u-mut{color:var(--muted)}',
    /* kpis */
    '.umb .u-kpis{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;border-bottom:1px solid var(--line);padding-bottom:28px}',
    '.umb .u-kpi{padding:0 32px;border-left:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;min-width:0}',
    '.umb .u-kpi:first-child{padding-left:0;border-left:0}',
    '.umb .u-kv{font-size:34px;font-weight:500;letter-spacing:-.025em;line-height:1;margin-top:14px;white-space:nowrap}',
    '.umb .u-kv small{font-size:15px;color:var(--muted);font-weight:500;letter-spacing:0;margin-left:4px}',
    '.umb .u-ks{font-size:12px;color:var(--muted);margin-top:12px;font-weight:500;white-space:nowrap}',
    '.umb .u-fig{font-family:"Bodoni Moda",Didot,serif;font-weight:500;font-size:64px;line-height:.9;letter-spacing:-.01em;margin-top:12px;font-variant-numeric:lining-nums tabular-nums;white-space:nowrap}',
    '.umb .u-fig .u-cur{font-size:.5em;vertical-align:.62em;margin-right:4px;color:var(--gold2)}',
    '.umb .u-fig .u-cents{font-size:.42em;color:var(--muted);margin-left:2px;vertical-align:.95em}',
    /* today grid */
    '.umb .u-tg{display:grid;grid-template-columns:minmax(360px,420px) 1fr;gap:0 48px;margin-top:30px}',
    '.umb .u-col{display:flex;flex-direction:column;min-width:0;min-height:0}',
    '.umb .u-feedw{position:relative;flex:1;min-height:300px;overflow:hidden;border-top:1px solid var(--line)}',
    '.umb .u-feedw::after{content:"";position:absolute;left:0;right:0;bottom:0;height:56px;background:linear-gradient(transparent,var(--night));pointer-events:none}',
    '.umb .u-feed{position:absolute;inset:0 0 auto 0}',
    '.umb .u-o{border-bottom:1px solid var(--line);overflow:hidden;transition:background .8s var(--ease)}',
    '.umb .u-o.enter{animation:uOin 1s var(--ease) backwards}',
    '@keyframes uOin{from{max-height:0;opacity:0}to{max-height:64px;opacity:1}}',
    '.umb .u-orow{display:grid;grid-template-columns:62px 1fr auto 92px;align-items:center;gap:14px;height:62px;padding:0 4px 0 0;width:100%;text-align:left;position:relative}',
    '.umb .u-ot{font-size:12px;color:var(--muted);font-weight:500}',
    '.umb .u-on{min-width:0}',
    '.umb .u-on b{display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.umb .u-on span{display:block;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}',
    '.umb .u-oa{font-weight:600;font-size:14px;text-align:right}',
    '.umb .u-o.real{background:linear-gradient(90deg,rgba(232,184,74,.13),rgba(232,184,74,.03) 60%,transparent)}',
        '.umb .u-o.real .u-on b{color:var(--gold)}',
    '.umb .u-o.real .u-ot{color:var(--gold2)}',
    '.umb .u-o.flash{background:rgba(232,184,74,.22)}',
    '.umb .u-feedw .u-o.real{margin-left:0}',
    '.umb .u-stg{display:flex;flex-direction:column;align-items:flex-end;gap:7px}',
    '.umb .u-stg span{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}',
    '.umb .u-seg{display:flex;gap:3px}',
    '.umb .u-seg i{width:16px;height:2px;border-radius:2px;background:rgba(243,236,223,.12);transition:background .6s var(--ease)}',
    '.umb .u-stg[data-s="0"] i:nth-child(-n+1){background:var(--cream)}',
    '.umb .u-stg[data-s="1"] span{color:var(--gold2)} .umb .u-stg[data-s="1"] i:nth-child(-n+2){background:var(--gold2)} .umb .u-stg[data-s="1"] i:nth-child(2){animation:uGlow 1.6s ease-in-out infinite}',
    '.umb .u-stg[data-s="2"] span{color:var(--gold)} .umb .u-stg[data-s="2"] i:nth-child(-n+3){background:var(--gold)}',
    '.umb .u-stg[data-s="3"] span{color:var(--muted);font-weight:600} .umb .u-stg[data-s="3"] i{background:rgba(163,166,184,.38)}',
    '.umb .u-od{display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s var(--ease)}',
    '.umb .u-o.open .u-od{grid-template-rows:1fr}',
    '.umb .u-od>div{overflow:hidden}',
    '.umb .u-odi{padding:0 4px 16px 76px;font-size:12px}',
    '.umb .u-ol{display:flex;justify-content:space-between;gap:12px;padding:3px 0}',
    '.umb .u-ol em{font-style:normal;color:var(--muted)}',
    '.umb .u-ol.t{border-top:1px solid var(--line);margin-top:6px;padding-top:8px;color:var(--muted)}',
    '.umb .u-orow:hover .u-on b{color:var(--cream)}',
    '.umb .u-o.real .u-orow:hover .u-on b{color:var(--gold)}',
    /* bars (hourly) */
    '.umb .u-hc{position:relative;height:236px;margin-left:44px}',
    '.umb .u-grid{position:absolute;left:0;right:0;border-top:1px solid var(--line)}',
    '.umb .u-grid span{position:absolute;right:100%;margin-right:12px;top:-8px;font-size:11px;color:var(--muted)}',
    '.umb .u-bars{position:absolute;inset:0;display:flex;align-items:flex-end;gap:8px}',
    '.umb .u-b{position:relative;flex:1;height:100%;display:flex;align-items:flex-end;cursor:default}',
    '.umb .u-b .g{position:absolute;left:0;right:0;bottom:0;border:1px dashed rgba(243,236,223,.16);border-bottom:0;border-radius:3px 3px 0 0;transition:height 1.2s var(--ease)}',
    '.umb .u-b .f{position:relative;width:100%;height:0;border-radius:3px 3px 0 0;background:linear-gradient(rgba(243,236,223,.34),rgba(243,236,223,.16));transition:height 1.3s var(--ease),background .5s}',
    '.umb .u-b:hover .f{background:linear-gradient(rgba(243,236,223,.55),rgba(243,236,223,.25))}',
    '.umb .u-b.now .f{background:linear-gradient(var(--gold),rgba(232,184,74,.45))}',
    '.umb .u-b.now .f::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:#FFE6A6;border-radius:2px;animation:uGlow 1.8s ease-in-out infinite}',
    '.umb .u-b.fut .f{background:none}',
    '.umb .u-hx{display:flex;gap:8px;margin:12px 0 0 44px}',
    '.umb .u-hx span{flex:1;text-align:center;font-size:11px;color:var(--muted)}',
    '.umb .u-hx span.now{color:var(--gold)}',
    '.umb .u-leg{display:flex;gap:18px;align-items:center}',
    '.umb .u-leg span{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}',
    '.umb .u-leg i{display:inline-block;width:12px;height:8px;border-radius:2px}',
    /* heat */
    '.umb .u-heat{display:grid;grid-template-columns:44px repeat(16,1fr);gap:4px;align-items:center}',
    '.umb .u-heat .d{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.04em}',
    '.umb .u-heat .d.t{color:var(--gold)}',
    '.umb .u-heat .c{height:20px;border-radius:3px;transition:opacity .8s var(--ease)}',
    '.umb .u-heat .c.now{box-shadow:inset 0 0 0 1px var(--gold),0 0 0 2px rgba(232,184,74,.2)}',
    '.umb .u-heat .x{font-size:11px;color:var(--muted);text-align:center;margin-top:6px}',
    /* generic list rows */
    '.umb .u-g2{display:grid;grid-template-columns:1.1fr 1fr;gap:0 56px}',
    '.umb .u-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:0 48px}',
    '.umb .u-st{margin-top:40px}',
    '.umb .u-span2{grid-column:span 2}',
    '.umb.ph .u-span2{grid-column:auto}',
    '.umb .u-rows{border-top:1px solid var(--line)}',
    '.umb .u-r{display:grid;align-items:center;gap:16px;min-height:44px;border-bottom:1px solid var(--line);padding:8px 0}',
    '.umb .u-r .nm{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
    '.umb .u-r .nm small{display:block;font-size:12px;color:var(--muted);font-weight:500;margin-top:2px}',
    '.umb .u-r .v{text-align:right;font-weight:600;white-space:nowrap}',
    '.umb .u-r .v small{color:var(--muted);font-weight:500;font-size:12px;margin-left:4px}',
    '.umb .u-r .vm{text-align:right;color:var(--muted);font-size:12px;white-space:nowrap}',
    '.umb .u-trk{position:relative;height:4px;border-radius:4px;background:rgba(243,236,223,.07)}',
    '.umb .u-trk .f{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:4px;background:rgba(243,236,223,.42);transition:width 1.3s var(--ease)}',
    '.umb .u-trk .f.gd{background:var(--gold)}',
    '.umb .u-trk .par{position:absolute;top:-4px;bottom:-4px;width:1px;background:rgba(243,236,223,.4)}',
    '.umb .u-rk{grid-template-columns:22px minmax(0,1fr) 1.15fr 50px 76px}',
    '.umb .u-rk .ix{font-size:12px;color:var(--muted);font-weight:600}',
    '.umb .u-rk:first-child .ix{color:var(--gold)}',
    /* donut + mix */
    '.umb .u-mix{display:flex;align-items:center;gap:36px}',
    '.umb .u-don{position:relative;width:168px;height:168px;flex:none}',
    '.umb .u-don svg circle{transition:stroke-dasharray 1.4s var(--ease),stroke-dashoffset 1.4s var(--ease)}',
    '.umb .u-don .ct{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '.umb .u-don .ct b{font-size:26px;font-weight:500;letter-spacing:-.02em}',
    '.umb .u-don .ct span{font-size:11px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-top:2px}',
    '.umb .u-ml{flex:1;min-width:0}',
    '.umb .u-ml .u-r{grid-template-columns:12px 1fr auto 70px;min-height:40px}',
    '.umb .u-sw{width:10px;height:10px;border-radius:3px}',
    '.umb .u-big{font-size:44px;font-weight:500;letter-spacing:-.03em;line-height:1}',
    '.umb .u-big small{font-size:16px;color:var(--muted);font-weight:500;letter-spacing:0;margin-left:6px}',
    '.umb .u-duo{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);padding-top:22px}',
    '.umb .u-duo>div+div{border-left:1px solid var(--line);padding-left:28px}',
    '.umb .u-duo .u-ks{margin-top:10px}',
    '.umb .u-line svg{display:block;overflow:visible}',
    '.umb .u-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:uDraw 1.8s var(--ease) .3s forwards}',
    '@keyframes uDraw{to{stroke-dashoffset:0}}',
    '.umb .u-fade{opacity:0;animation:uFade 1.2s var(--ease) .9s forwards}',
    '@keyframes uFade{to{opacity:1}}',
    /* inventory */
    '.umb .u-bn{grid-template-columns:minmax(0,1fr) 64px;row-gap:10px;padding:14px 0}',
    '.umb .u-bn .u-trk{grid-column:1/-1}',
    '.umb .u-ml2{grid-template-columns:minmax(0,1fr) 92px;row-gap:10px;padding:14px 0}',
    '.umb .u-ml2 .u-trk{grid-column:1/-1}',
    '.umb .u-cup{grid-template-columns:minmax(0,1fr) 120px 64px;min-height:42px}',
    '.umb .u-al{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) 96px 132px;min-height:64px}',
    '.umb .u-btn{height:38px;padding:0 18px;border-radius:12px;border:1px solid rgba(232,184,74,.55);color:var(--gold);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:inline-flex;align-items:center;justify-content:center;gap:8px;justify-self:end;transition:background .5s var(--ease),color .5s var(--ease),border-color .5s var(--ease);min-width:118px}',
    '.umb .u-btn:hover{background:var(--gold);color:var(--night)}',
    '.umb .u-btn.done{border-color:var(--line2);color:var(--cream);cursor:default;background:none;letter-spacing:.02em;text-transform:none;font-weight:600}',
    '.umb .u-btn.done svg{color:var(--ok)}',
    '.umb .u-tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-left:8px;vertical-align:1px}',
    '.umb .u-ws{grid-template-columns:62px minmax(0,1fr) 64px;min-height:44px}',
    '.umb .u-ws .t{font-size:12px;color:var(--muted)}',
    '.umb .u-tot{display:flex;justify-content:space-between;align-items:baseline;padding-top:14px;font-weight:600}',
    '.umb .u-tot span{font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.14em;text-transform:uppercase}',
    /* team */
    '.umb .u-tl{position:relative;border-top:1px solid var(--line)}',
    '.umb .u-tr{display:grid;grid-template-columns:180px 1fr 72px;align-items:center;gap:24px;height:48px;border-bottom:1px solid var(--line)}',
    '.umb .u-tr .nm{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.umb .u-tr .nm small{color:var(--muted);font-weight:500;font-size:12px;margin-left:8px}',
    '.umb .u-lane{position:relative;height:100%}',
    '.umb .u-sh2{position:absolute;top:50%;height:10px;margin-top:-5px;border-radius:6px;background:rgba(243,236,223,.08);overflow:hidden}',
    '.umb .u-sh2 .w{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:rgba(243,236,223,.42);transition:width 1.4s var(--ease)}',
    '.umb .u-sh2.on .w{background:linear-gradient(90deg,rgba(232,184,74,.55),var(--gold))}',
    '.umb .u-nowl{position:absolute;top:-10px;bottom:0;width:1px;background:var(--gold);pointer-events:none}',
    '.umb .u-nowl b{position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:var(--gold);letter-spacing:.06em;white-space:nowrap}',
    '.umb .u-tx{display:grid;grid-template-columns:180px 1fr 72px;gap:24px;margin-top:10px}',
    '.umb .u-tx .ax{position:relative;height:14px}',
    '.umb .u-tx .ax span{position:absolute;transform:translateX(-50%);font-size:11px;color:var(--muted)}',
    '.umb .u-tp{grid-template-columns:minmax(0,1fr) 1fr 64px 74px}',
    '.umb .u-pr{grid-template-columns:1fr auto;min-height:44px}',
    '.umb .u-pr.tt{border-bottom:0;padding-top:16px}',
    '.umb .u-pr.tt .nm{font-weight:700}',
    '.umb .u-pr.tt .v{font-size:20px;font-weight:600;letter-spacing:-.01em}',
    /* books */
    '.umb .u-dc{grid-template-columns:1fr auto;min-height:42px}',
    '.umb .u-dc.sub .nm{color:var(--muted);font-weight:500}',
    '.umb .u-dc.sub .v{color:var(--muted);font-weight:500}',
    '.umb .u-dc.k .nm,.umb .u-dc.k .v{font-weight:700}',
    '.umb .u-split{display:flex;height:6px;border-radius:6px;overflow:hidden;gap:3px;margin:18px 0 12px}',
    '.umb .u-split i{display:block;height:100%;border-radius:6px;transition:width 1.3s var(--ease)}',
    '.umb .u-sl{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}',
    '.umb .u-sl b{color:var(--cream);font-weight:600;margin-left:6px}',
    '.umb .u-pl{grid-template-columns:minmax(0,1fr) 110px 100px;min-height:42px}',
    '.umb .u-pl.sub .nm{color:var(--muted);font-weight:500}',
    '.umb .u-pl.k{border-bottom-color:var(--line2)}',
    '.umb .u-pl.k .nm,.umb .u-pl.k .v{font-weight:700}',
    '.umb .u-sy{grid-template-columns:24px 120px minmax(0,1fr) 110px 100px;min-height:50px;transition:background 1s var(--ease)}',
    '.umb .u-sy .ok{color:var(--ok);display:flex}',
    '.umb .u-sy .ap{font-weight:700}',
    '.umb .u-sy .ds{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
    '.umb .u-sy.flash{background:rgba(232,184,74,.08)}',
    '.umb .u-pend{display:inline-flex;align-items:center;gap:8px}',
    /* tooltip */
    '.umb .u-tip{position:absolute;z-index:20;pointer-events:none;background:#1E2340;border:1px solid var(--line2);border-radius:10px;padding:9px 12px;font-size:12px;line-height:1.5;white-space:nowrap;opacity:0;transform:translate(-50%,-100%) translateY(-6px);transition:opacity .25s var(--ease);box-shadow:0 18px 40px rgba(0,0,0,.35)}',
    '.umb .u-tip.on{opacity:1}',
    '.umb .u-tip b{font-weight:700}',
    '.umb .u-tip span{color:var(--muted)}',
    '.umb .u-tabbar{display:none}',
    /* compact (iPad in scene) */
    '.umb.cmp{grid-template-columns:1fr;grid-template-rows:60px 1fr}',
    '.umb.cmp .u-brand,.umb.cmp .u-rail{display:none}',
    '.umb.cmp .u-head{grid-column:1;padding:0 28px;gap:16px}',
    '.umb.cmp .u-view{grid-column:1}',
    '.umb.cmp .u-loc .u-hb{display:flex;align-items:center;gap:10px;padding-right:14px;margin-right:4px;border-right:1px solid var(--line2);height:24px}',
    '.umb.cmp .u-loc .u-hb .u-umb{font-size:12px}',
    '.umb.cmp .u-loc{font-size:14px}',
    '.umb.cmp .u-loc .u-cs{display:none}',
    '.umb.cmp .u-tabs{display:flex;gap:2px;margin-left:8px}',
    '.umb.cmp .u-tabs button{height:30px;padding:0 11px;border-radius:12px;font-size:12px;font-weight:600;color:var(--muted);transition:color .4s,background .4s}',
    '.umb.cmp .u-tabs button.on{color:var(--cream);background:rgba(243,236,223,.07)}',
    '.umb.cmp .u-chip{height:26px;padding:0 10px;font-size:11px}',
    '.umb.cmp .u-chip.qb{display:none}',
    '.umb.cmp .u-clock{padding-left:14px;margin-left:2px;height:26px}',
    '.umb.cmp .u-clock span{display:none}',
    '.umb.cmp .u-clock b{min-width:0;font-size:13px}',
    '.umb.cmp .u-page{padding:22px 28px 24px}',
    '.umb.cmp .u-kpis{padding-bottom:20px}',
    '.umb.cmp .u-kpi{padding:0 24px}',
    '.umb.cmp .u-kv{font-size:28px;margin-top:10px}',
    '.umb.cmp .u-fig{font-size:50px;margin-top:8px}',
    '.umb.cmp .u-ks{margin-top:9px}',
    '.umb.cmp .u-tg{grid-template-columns:minmax(300px,360px) 1fr;gap:0 36px;margin-top:22px}',
    '.umb.cmp .u-hc{height:352px}',
    '.umb.cmp .u-heatw{display:none}',
    '.umb.cmp .u-feedw{min-height:0}',
    '.umb.cmp .u-orow{grid-template-columns:56px 1fr auto 84px;height:56px;gap:12px}',
    '.umb.cmp .u-sh{margin-bottom:14px}',
    '.umb.cmp .u-tdy .u-col:first-child .u-feedw{height:424px;flex:none}',
    /* medium widths */
    '.umb.md{grid-template-columns:76px 1fr}',
    '.umb.md .u-brand{padding:0;justify-content:center}',
    '.umb.md .u-brand .u-umb,.umb.md .u-nav span,.umb.md .u-wm,.umb.md .u-nav .u-badge,.umb.md .u-nav .u-live{display:none}',
    '.umb.md .u-nav button{padding:0;justify-content:center}',
    '.umb.md .u-foot{justify-content:center;padding:0}',
    '.umb.md .u-head{padding:0 32px}',
    '.umb.md .u-chip.qb{display:none}',
    '.umb.md .u-page{padding:30px 32px 40px}',
    /* phone */
    '.umb.ph{grid-template-columns:1fr;grid-template-rows:auto 1fr auto}',
    '.umb.ph .u-brand,.umb.ph .u-rail{display:none}',
    '.umb.ph .u-head{grid-column:1;flex-direction:column;align-items:stretch;gap:12px;padding:14px 16px 12px;height:auto}',
    '.umb.ph .u-loc{justify-content:space-between;font-size:14px}',
    '.umb.ph .u-loc .u-hb{display:flex;align-items:center;gap:9px}',
    '.umb.ph .u-loc .u-hb .u-umb{font-size:12px;letter-spacing:.28em}',
    '.umb.ph .u-loc .u-nm{display:none}',
    '.umb.ph .u-hr{justify-content:space-between;gap:8px}',
    '.umb.ph .u-chip{height:28px;padding:0 10px;font-size:11px;gap:7px}',
    '.umb.ph .u-chip svg{width:14px;height:14px}',
    '.umb.ph .u-clock{display:none}',
    '.umb.ph .u-pclock{font-size:13px;font-weight:600}',
    '.umb .u-pclock{display:none}',
    '.umb.ph .u-pclock{display:block}',
    '.umb.ph .u-view{grid-column:1;grid-row:2;touch-action:pan-y}',
    '.umb.ph .u-page{padding:22px 16px 36px}',
    '.umb.ph .u-pn{display:block;font-size:13px;color:var(--muted);font-weight:600;margin-bottom:18px}',
    '.umb .u-pn{display:none}',
    '.umb.ph .u-pn b{color:var(--cream);font-weight:700;font-size:20px;letter-spacing:-.01em;display:block;margin-top:2px}',
    '.umb.ph .u-kpis{grid-template-columns:repeat(3,1fr);row-gap:22px;padding-bottom:22px}',
    '.umb.ph .u-kpi{padding:0 14px}',
    '.umb.ph .u-kpi:first-child{grid-column:1/-1;padding:0 0 20px;border-bottom:1px solid var(--line)}',
    '.umb.ph .u-kpi:nth-child(2){padding-left:0;border-left:0}',
    '.umb.ph .u-kv{font-size:24px}',
    '.umb.ph .u-kv small{font-size:13px}',
    '.umb.ph .u-ks{font-size:11px}',
    '.umb.ph .u-fig{font-size:58px}',
    '.umb.ph .u-tg,.umb.ph .u-g2,.umb.ph .u-g3{grid-template-columns:1fr;gap:0}',
    '.umb.ph .u-tg>.u-col+.u-col,.umb.ph .u-g2>*+*,.umb.ph .u-g3>*+*{margin-top:40px}',
    '.umb.ph .u-feedw{flex:none;height:372px;min-height:0}',
    '.umb.ph .u-orow{grid-template-columns:54px 1fr auto 78px;gap:10px}',
    '.umb.ph .u-seg i{width:13px}',
    '.umb.ph .u-odi{padding-left:64px}',
    '.umb.ph .u-hc{height:180px;margin-left:36px}',
    '.umb.ph .u-hx{margin-left:36px;gap:3px}',
    '.umb.ph .u-hx span:nth-child(odd){visibility:hidden}',
    '.umb.ph .u-hx span{font-size:10px}',
    '.umb.ph .u-bars{gap:3px}',
    '.umb.ph .u-grid span{font-size:10px;margin-right:8px}',
    '.umb.ph .u-heat{grid-template-columns:30px repeat(16,1fr);gap:2px}',
    '.umb.ph .u-heat .c{height:16px;border-radius:2px}',
    '.umb.ph .u-heat .x{font-size:9px}',
    '.umb.ph .u-heat .x:nth-child(even){visibility:hidden}',
    '.umb.ph .u-heat .d{font-size:10px}',
    '.umb.ph .u-leg{gap:12px}',
    '.umb.ph .u-sh{flex-wrap:wrap;row-gap:8px}',
    '.umb.ph .u-rk{grid-template-columns:18px minmax(0,1fr) 72px 40px 64px;gap:10px}',
    '.umb.ph .u-mix{gap:22px}',
    '.umb.ph .u-don{width:132px;height:132px}',
    '.umb.ph .u-ml .u-r{grid-template-columns:10px 1fr 40px 60px;gap:10px}',
    '.umb.ph .u-big{font-size:36px}',
    '.umb.ph .u-al{grid-template-columns:minmax(0,1fr) 118px;row-gap:4px;padding:14px 0}',
    '.umb.ph .u-al .sp{grid-column:1;grid-row:2;font-size:12px;color:var(--muted)}',
    '.umb.ph .u-al .v{display:none}',
    '.umb.ph .u-al .u-btn{grid-column:2;grid-row:1/3}',
    '.umb.ph .u-tr{grid-template-columns:96px 1fr 44px;gap:12px}',
    '.umb.ph .u-tr .nm small{display:block;margin:2px 0 0}',
    '.umb.ph .u-tr{height:56px}',
    '.umb.ph .u-tx{grid-template-columns:96px 1fr 44px;gap:12px}',
    '.umb.ph .u-tx .ax span:nth-child(even){display:none}',
    '.umb.ph .u-tp{grid-template-columns:minmax(0,1fr) 70px 46px 64px;gap:10px}',
    '.umb.ph .u-pl{grid-template-columns:minmax(0,1fr) 44px 92px;gap:12px}',
    '.umb.ph .u-sy{grid-template-columns:20px minmax(0,1fr) auto;row-gap:2px;padding:12px 0}',
    '.umb.ph .u-sy .ap{grid-column:2}',
    '.umb.ph .u-sy .ds{grid-column:2;grid-row:2;white-space:normal}',
    '.umb.ph .u-sy .v{grid-column:3;grid-row:1}',
    '.umb.ph .u-sy .vm{grid-column:3;grid-row:2}',
    '.umb.ph .u-sy .ok{grid-row:1/3}',
    '.umb.ph .u-tabbar{display:grid;grid-template-columns:repeat(5,1fr);grid-column:1;grid-row:3;border-top:1px solid var(--line);background:rgba(22,26,49,.96);padding:0 4px env(safe-area-inset-bottom)}',
    '.umb .u-tabbar button{position:relative;height:62px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:var(--muted);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;transition:color .4s var(--ease)}',
    '.umb .u-tabbar button.on{color:var(--cream)}',
    '.umb .u-tabbar button::before{content:"";position:absolute;top:-1px;left:30%;right:30%;height:2px;background:var(--gold);transform:scaleX(0);transition:transform .5s var(--ease)}',
    '.umb .u-tabbar button.on::before{transform:scaleX(1)}',
    '.umb .u-tabbar .bd{position:absolute;top:10px;left:calc(50% + 8px);width:6px;height:6px;border-radius:50%;background:var(--gold)}',
    '.umb.ph .u-page.sl{animation:uSl .7s var(--ease) both}',
    '.umb.ph .u-page.sr{animation:uSr .7s var(--ease) both}',
    '@keyframes uSl{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:none}}',
    '@keyframes uSr{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.umb *{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}.umb .u-sec{opacity:1;transform:none}.umb .u-draw{stroke-dashoffset:0}.umb .u-fade{opacity:1}}'
  ].join('\n');

  function injectAssets() {
    if (!document.getElementById('umb-owner-css')) {
      var st = document.createElement('style'); st.id = 'umb-owner-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    if (!document.getElementById('umb-owner-fonts')) {
      var l = document.createElement('link'); l.id = 'umb-owner-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500&family=Manrope:wght@400;500;600;700;800&family=Syne:wght@800&display=swap';
      document.head.appendChild(l);
    }
  }

  /* ---------- mount ---------- */
  function mount(el, opts) {
    opts = opts || {};
    injectAssets();
    if (el.__umb) el.__umb.unmount();

    /* demo clock: real time while open, otherwise mid-afternoon */
    var real = new Date(), rh = real.getHours() + real.getMinutes() / 60;
    var OFF = 0;
    if (rh < 7 || rh >= 22) { var t = new Date(real); t.setHours(14, 18, 0, 0); OFF = t - real; }
    function now() { return new Date(Date.now() + OFF); }
    function hNow() { var d = now(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; }
    var today = now(); var WD = today.getDay();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    var R = rng(seed);
    var weekend = WD === 0 || WD === 6;
    var WTS = weekend ? W_WE : W_WD;
    var TOTW = HOURS.reduce(function (a, h) { return a + WTS[h]; }, 0);
    var AVGT = 11.4;

    var timers = [], dead = false;
    var S = { orders: [], seq: 1000 + Math.floor(R() * 40), tab: 'today', reorders: {}, sync: [], inv: null, refunds: [], lastQB: null, lastGusto: null };

    function makeLines(r, h) {
      var lines = [], n = r() < 0.7 ? 1 : (r() < 0.78 ? 2 : 3), i;
      var dIds = ['crescent', 'cappuccino', 'flatwhite', 'espresso', 'moonlight', 'matcha'];
      var dW = [18, 12, 10, 8, h >= 11 ? 17 : 11, 9];
      for (i = 0; i < n; i++) {
        var m = BY[pick(r, dIds, dW)], unit = m.price, notes = [];
        if (m.sized) { var sz = pick(r, [8, 12, 16], [2, 5, 3]); unit += sz === 12 ? 0.75 : sz === 16 ? 1.25 : 0; notes.push(sz + ' oz'); }
        if (m.milk) { var mk = pick(r, ['Whole', 'Oat', 'Almond', 'Skim'], [45, 35, 10, 10]); if (mk === 'Oat' || mk === 'Almond') unit += 0.75; notes.push(mk); }
        if (m.id !== 'matcha' && m.id !== 'moonlight' && r() < 0.12) { unit += 1; notes.push('Extra shot'); }
        if (m.id === 'moonlight' && r() < 0.2) { unit += 1; notes.push('Cold foam'); }
        addLine(lines, m, unit, notes.join(' · '));
      }
      if (r() < 0.38) { var b = BY[pick(r, ['croissant', 'painchoc', 'cookie'], [10, 7, 6])]; addLine(lines, b, b.price, r() < 0.4 ? 'Warmed' : ''); if (r() < 0.1) lines[lines.length - 1].qty++; }
      if (r() < (h >= 11 && h <= 14 ? 0.14 : 0.04)) { var tt = BY.toast, eg = r() < 0.35; addLine(lines, tt, tt.price + (eg ? 2.5 : 0), eg ? 'Jammy egg' : ''); }
      return lines;
    }
    function addLine(lines, m, unit, notes) {
      for (var i = 0; i < lines.length; i++) if (lines[i].id === m.id && lines[i].notes === notes) { lines[i].qty++; return; }
      lines.push({ id: m.id, name: m.name, qty: 1, unit: r2(unit), notes: notes, cat: m.cat });
    }
    function makeOrder(r, at) {
      var h = at.getHours(), lines = makeLines(r, h);
      var gross = r2(lines.reduce(function (a, l) { return a + l.qty * l.unit; }, 0));
      var ch = r() < 0.32 ? 'Online' : 'Counter';
      var pay = ch === 'Online' ? 'Card' : (r() < 0.86 ? 'Card' : 'Cash');
      var disc = r() < 0.05 ? r2(gross * 0.1) : 0;
      var sub = r2(gross - disc), tax = r2(sub * TAX), tip = 0;
      if (pay === 'Card') { var q = r(); if (ch === 'Online' ? q < 0.62 : q < 0.55) tip = q < 0.25 ? 1 : q < 0.4 ? 2 : r2(sub * (0.15 + r() * 0.05)); }
      var units = lines.reduce(function (a, l) { return a + (l.cat === 'Coffee' || l.cat === 'Cold' ? l.qty : 0); }, 0);
      return { id: '#' + (S.seq++), name: NAMES[Math.floor(r() * NAMES.length)], lines: lines, gross: gross, discount: disc, subtotal: sub, tax: tax, tip: tip, total: r2(sub + tax + tip), at: at, ch: ch, pay: pay, stage: 3, make: Math.round(110 + units * 38 + r() * 70 + (lines.some(function (l) { return l.id === 'toast'; }) ? 90 : 0)), pickup: ch === 'Online' ? 'ASAP' : '' };
    }

    /* seed today's orders up to now */
    (function seedOrders() {
      var hn = hNow(), d0 = now();
      HOURS.forEach(function (h) {
        var start = h === 6 ? 6.5 : h; if (start >= hn) return;
        var end = Math.min(h + 1, hn), frac = (end - start) / (h === 6 ? 0.5 : 1);
        var cnt = Math.round(WTS[h] * (0.92 + R() * 0.14) * frac), mins = [];
        for (var i = 0; i < cnt; i++) mins.push(start + R() * (end - start));
        mins.sort(function (a, b) { return a - b; });
        mins.forEach(function (x) {
          var at = new Date(d0); at.setHours(Math.floor(x), Math.floor((x % 1) * 60), Math.floor(((x * 60) % 1) * 60), 0);
          S.orders.push(makeOrder(R, at));
        });
      });
      var nn = d0.getTime();
      S.orders.forEach(function (o) {
        var age = (nn - o.at.getTime()) / 60000;
        if (age < 1.2) setStage(o, 0, true); else if (age < 4) setStage(o, 1, true); else if (age < 7) setStage(o, 2, true); else o.stage = 3;
      });
      /* refunds and the day's sync history */
      [[8.7, 6.25], [12.4, 5.75]].forEach(function (f) { if (f[0] < hn) S.refunds.push({ h: f[0], amt: f[1], tax: r2(f[1] * TAX) }); });
      S.lastQB = new Date(nn - 40000); S.lastGusto = new Date(d0); S.lastGusto.setMinutes(Math.floor(d0.getMinutes() / 15) * 15, 0, 0);
    })();

    /* past days, for trend + month to date */
    var PAST = [];
    (function () {
      var r = rng(seed * 7 + 3);
      for (var k = 1; k <= 45; k++) { var d = new Date(today); d.setDate(d.getDate() - k); PAST[k] = { d: d, v: r2(TOTW * AVGT * DAYMULT[d.getDay()] / DAYMULT[1] * 0.93 * (0.94 + r() * 0.1)) }; }
    })();
    function cumFrac(hn) {
      var s = 0; HOURS.forEach(function (h) { var st = h === 6 ? 6.5 : h; if (hn >= h + 1) s += WTS[h]; else if (hn > st) s += WTS[h] * (hn - st) / (h + 1 - st); }); return s / TOTW;
    }

    /* inventory state */
    S.inv = {
      beans: [
        { k: 'house', n: 'Luna House', o: 'Brazil · Colombia', lb: 33.5, use: 9.2, par: 5 },
        { k: 'guji', n: 'Guji', o: 'Ethiopia · single origin', lb: 14, use: 2.1, par: 5 },
        { k: 'cold', n: 'Moonlight Cold Brew', o: 'Brazil · Sumatra', lb: 22, use: 3.4, par: 5 },
        { k: 'decaf', n: 'Huila Decaf', o: 'Colombia · Swiss water', lb: 6.5, use: 0.6, par: 5 }
      ],
      milk: [
        { k: 'Whole', lb: 9.5, cap: 30, par: 14 },
        { k: 'Oat', lb: 17, cap: 24, par: 10 },
        { k: 'Almond', lb: 7.5, cap: 12, par: 5 },
        { k: 'Skim', lb: 6, cap: 10, par: 4 }
      ],
      cups: [
        { n: '8 oz hot', q: 640, cap: 1500, par: 400 },
        { n: '12 oz hot', q: 1150, cap: 2000, par: 600 },
        { n: '16 oz hot', q: 320, cap: 1500, par: 500 },
        { n: '16 oz cold', q: 920, cap: 1500, par: 500 },
        { n: 'Hot lids', q: 1840, cap: 3000, par: 900 },
        { n: 'Cold lids', q: 860, cap: 1500, par: 500 }
      ]
    };
    var ALERTS = [
      { k: 'house', n: 'Luna House beans', q: '40 lb', sup: 'Halden Roasters', cost: 412.00, eta: 'Arrives Wed' },
      { k: 'Whole', n: 'Whole milk', q: '24 gal', sup: 'Coastal Dairy Supply', cost: 103.20, eta: 'Arrives 6 AM' },
      { k: '16 oz hot', n: '16 oz hot cups', q: '1,000 ct', sup: 'Harbor Paper Co.', cost: 86.00, eta: 'Arrives Thu' }
    ];
    var WASTE = [
      [7.2, 'Whole milk', '0.5 gal · steamed, unused', 2.10],
      [8.9, 'Crescent Latte', '1 · remake', 1.85],
      [10.4, 'Oat milk', '0.25 gal · expired', 1.60],
      [11.6, 'Butter Croissant', '2 · dropped', 2.30],
      [13.3, 'Espresso shots', '3 · pulled long', 0.96],
      [15.8, 'Midnight Cookie', '1 · broken', 0.80],
      [17.5, 'Avocado Toast', '1 · wrong order', 3.40]
    ];
    function invUse(o) {
      o.lines.forEach(function (l) {
        var m = BY[l.id]; if (!m) return;
        if (m.beans === 'house') S.inv.beans[0].lb = Math.max(0, S.inv.beans[0].lb - 0.04 * l.qty);
        if (m.beans === 'cold') S.inv.beans[2].lb = Math.max(0, S.inv.beans[2].lb - 0.05 * l.qty);
        if (m.milk) { var mk = /Oat|Almond|Skim/.exec(l.notes || ''); mk = mk ? mk[0] : 'Whole'; S.inv.milk.forEach(function (x) { if (x.k === mk) x.lb = Math.max(0, x.lb - 0.06 * l.qty); }); }
        if (m.sized || m.cat === 'Coffee') { var c = /16 oz/.test(l.notes || '') ? (m.cat === 'Cold' ? 3 : 2) : /8 oz/.test(l.notes || '') ? 0 : 1; S.inv.cups[c].q = Math.max(0, S.inv.cups[c].q - l.qty); S.inv.cups[m.cat === 'Cold' ? 5 : 4].q = Math.max(0, S.inv.cups[m.cat === 'Cold' ? 5 : 4].q - l.qty); }
      });
    }

    /* ---------- derived values ---------- */
    var V = {};
    function derive() {
      var os = S.orders, hn = hNow(), ch = Math.floor(hn);
      var g = 0, dsc = 0, sub = 0, tax = 0, tip = 0, card = 0, cash = 0, mk = 0, mkn = 0, open = 0;
      var hr = {}, hrn = {}, items = {}, cats = {}, units = 0;
      HOURS.forEach(function (h) { hr[h] = 0; hrn[h] = 0; });
      MENU.forEach(function (m) { items[m.id] = { q: 0, rev: 0 }; });
      CATS.forEach(function (c) { cats[c] = 0; });
      os.forEach(function (o) {
        g += o.gross; dsc += o.discount; sub += o.subtotal; tax += o.tax; tip += o.tip;
        if (o.pay === 'Cash') cash += o.total; else card += o.total;
        var h = o.at.getHours(); if (hr[h] != null) { hr[h] += o.subtotal; hrn[h]++; }
        if (o.stage >= 2) { mk += o.make; mkn++; } else open++;
        o.lines.forEach(function (l) {
          var id = l.id && items[l.id] ? l.id : null;
          if (!id) MENU.forEach(function (m) { if (m.name === l.name) id = m.id; });
          var rev = l.qty * l.unit; units += l.qty;
          if (id) { items[id].q += l.qty; items[id].rev += rev; cats[BY[id].cat] += rev; } else cats.Coffee += rev;
        });
      });
      var rf = 0, rft = 0; S.refunds.forEach(function (x) { rf += x.amt; rft += x.tax; });
      V.gross = g; V.disc = -dsc; V.refunds = -rf; V.net = sub - rf; V.tax = tax - rft; V.tips = tip;
      V.total = V.net + V.tax + V.tips; V.card = card - rf - rft; V.cash = cash;
      V.cardPct = V.total ? V.card / V.total * 100 : 0; V.cashPct = 100 - V.cardPct;
      V.orders = os.length; V.avg = os.length ? sub / os.length : 0; V.make = mkn ? mk / mkn : 0; V.open = open; V.units = units;
      V.items = items; V.cats = cats; V.hr = hr; V.hrn = hrn; V.ch = ch;
      /* vs last same weekday, at the same time */
      V.lastSame = PAST[7].v * cumFrac(hn);
      V.vsLast = V.lastSame ? (V.net / V.lastSame - 1) * 100 : 0;
      V.lastAvg = 11.18; V.vsAvg = (V.avg / V.lastAvg - 1) * 100;
      /* hourly scale */
      var mx = 0; HOURS.forEach(function (h) { mx = Math.max(mx, hr[h], typ(h)); });
      var step = mx > 600 ? 200 : 100; V.scale = Math.ceil(mx * 1.08 / step) * step; V.step = step;
      HOURS.forEach(function (h) { V['hr' + h] = hr[h] / V.scale * 100; V['ty' + h] = typ(h) / V.scale * 100; });
      /* sales tab */
      var ranked = MENU.slice().sort(function (a, b) { return items[b.id].rev - items[a.id].rev; });
      V.ranked = ranked; var top = items[ranked[0].id].rev || 1;
      MENU.forEach(function (m) { V['dq_' + m.id] = items[m.id].q; V['dr_' + m.id] = items[m.id].rev; V['dw_' + m.id] = items[m.id].rev / top * 100; });
      var cs = 0; CATS.forEach(function (c) { cs += cats[c]; }); CATS.forEach(function (c) { V['cr_' + c] = cats[c]; V['cp_' + c] = cs ? cats[c] / cs * 100 : 0; });
      var th = 6; HOURS.forEach(function (h) { if (hr[h] > hr[th]) th = h; }); V.topH = th; V.topHr = hr[th]; V.topHn = hrn[th];
      var lo = null; HOURS.forEach(function (h) { if (h < ch && (lo == null || hr[h] < hr[lo])) lo = h; }); V.loH = lo == null ? 6 : lo; V.loHr = hr[V.loH]; V.loHn = hrn[V.loH];
      var t7 = V.net, l7 = V.lastSame; for (var k = 1; k <= 6; k++) { t7 += PAST[k].v; l7 += PAST[k + 7].v; }
      V.t7 = t7; V.l7 = l7; V.wow = (t7 / l7 - 1) * 100;
      /* inventory */
      S.inv.beans.forEach(function (b, i) { V['bl' + i] = b.lb; V['bd' + i] = b.lb / b.use; V['bw' + i] = Math.min(100, b.lb / b.use / 14 * 100); });
      S.inv.milk.forEach(function (b, i) { V['ml' + i] = b.lb; V['mw' + i] = b.lb / b.cap * 100; });
      S.inv.cups.forEach(function (b, i) { V['cq' + i] = b.q; V['cw' + i] = b.q / b.cap * 100; });
      var wt = 0, wn = 0; WASTE.forEach(function (w) { if (w[0] <= hn) { wt += w[3]; wn++; } }); V.waste = wt; V.wasteN = wn;
      V.alerts = ALERTS.filter(function (a) { return !S.reorders[a.k]; }).length;
      /* team */
      var hw = 0, hs2 = 0, onf = 0;
      STAFF.forEach(function (p, i) { var w = Math.max(0, Math.min(hn, p.e) - p.s); p.w = w; hw += w; hs2 += p.e - p.s; if (hn >= p.s && hn < p.e) onf++; V['tw' + i] = w; V['tww' + i] = (p.e - p.s) ? w / (p.e - p.s) * 100 : 0; });
      V.hoursW = hw; V.hoursS = hs2; V.onFloor = onf;
      STAFF.forEach(function (p, i) { V['tip' + i] = hw ? V.tips * p.w / hw : 0; V['tpw' + i] = hw ? p.w / Math.max.apply(null, STAFF.map(function (q) { return q.w; })) * 100 : 0; });
      var ph = 0, wg = 0; STAFF.forEach(function (p) { var hh = p.past + p.w; ph += hh; wg += hh * p.rate; });
      V.pHours = ph; V.pWages = wg; V.pTips = 1846.20 + V.tips; V.pTax = wg * 0.0765; V.pTotal = wg + V.pTips + V.pTax;
      /* books MTD */
      var dom = today.getDate(), mtd = V.net; for (k = 1; k < dom; k++) mtd += PAST[k].v;
      var mtdCard = mtd * 0.91;
      V.mRev = mtd; V.mCogs = -mtd * 0.305; V.mGp = mtd + V.mCogs; V.mLabor = -(mtd * 0.328); V.mRent = -9800; V.mUtil = -1180;
      V.mFees = -mtdCard * 0.026; V.mMkt = -850; V.mOther = -1320;
      V.mNoi = V.mGp + V.mLabor + V.mRent + V.mUtil + V.mFees + V.mMkt + V.mOther; V.mMargin = V.mNoi / mtd * 100;
      ['mRev', 'mCogs', 'mGp', 'mLabor', 'mRent', 'mUtil', 'mFees', 'mMkt', 'mOther', 'mNoi'].forEach(function (k2) { V[k2 + 'p'] = V[k2] / mtd * 100; V[k2 + 'w'] = Math.abs(V[k2]) / mtd * 100; });
      V.qbCount = os.filter(function (o) { return o.stage === 3; }).length;
      V.qbAmt = os.reduce(function (a, o) { return a + (o.stage === 3 ? o.total : 0); }, 0);
      V.lastQB = tfmt(S.lastQB, true); V.lastGusto = tfmt(S.lastGusto);
    }
    function typ(h) { return WTS[h] * AVGT * DAYMULT[WD] / DAYMULT[1] * 0.93; }

    /* ---------- bindings ---------- */
    function setNum(el, v) {
      var f = FMT[el.dataset.f || 'n'] || FMT.n, html = /^fig/.test(el.dataset.f || '');
      function put(x) { if (html) el.innerHTML = f(x); else el.textContent = f(x); }
      if (el.dataset.t == null || reduce) { put(v); el._v = v; return; }
      var from = el._v == null ? 0 : el._v; el._v = v;
      if (from === v) { put(v); return; }
      cancelAnimationFrame(el._raf); var t0 = performance.now(), dur = el._seen ? 700 : 1400; el._seen = 1;
      (function step(t) { var p = Math.min(1, (t - t0) / dur); p = 1 - Math.pow(1 - p, 3); put(from + (v - from) * p); if (p < 1) el._raf = requestAnimationFrame(step); })(t0);
    }
    function apply() {
      derive();
      root.querySelectorAll('[data-k]').forEach(function (el) { var v = V[el.dataset.k]; if (v == null) return; if (typeof v === 'number') setNum(el, v); else el.textContent = v; });
      root.querySelectorAll('[data-w]').forEach(function (el) { var v = V[el.dataset.w]; if (v != null) el.style.width = Math.max(0, Math.min(100, v)) + '%'; });
      root.querySelectorAll('[data-h]').forEach(function (el) { var v = V[el.dataset.h]; if (v != null) el.style.height = Math.max(0, Math.min(100, v)) + '%'; });
      var nb = root.querySelectorAll('.u-ib'); nb.forEach(function (b) { b.textContent = V.alerts; b.style.display = V.alerts ? '' : 'none'; });
    }
    function K(k, f, tw, cls) { return '<span' + (cls ? ' class="' + cls + '"' : '') + ' data-k="' + k + '" data-f="' + (f || 'n') + '"' + (tw ? ' data-t' : '') + '></span>'; }

    /* ---------- DOM shell ---------- */
    var root = document.createElement('div');
    root.className = 'umb' + (opts.compact ? ' cmp' : '');
    var TABS = [['today', 'Today'], ['sales', 'Sales'], ['inventory', 'Inventory'], ['team', 'Team'], ['books', 'Books']];
    root.innerHTML =
      '<div class="u-brand">' + UMBMARK + '<span class="u-umb">UMB</span></div>' +
      '<aside class="u-rail"><nav class="u-nav">' + TABS.map(function (t) {
        return '<button data-tab="' + t[0] + '" aria-label="' + t[1] + '">' + icon(t[0]) + '<span>' + t[1] + '</span>' + (t[0] === 'today' ? '<i class="u-live"></i>' : t[0] === 'inventory' ? '<b class="u-badge u-ib"></b>' : '') + '</button>';
      }).join('') + '</nav><div class="u-foot">' + LUNA + '<div class="u-wm"><b>LUNA\'S</b><i>COFFEE</i></div></div></aside>' +
      '<header class="u-head"><div class="u-loc"><span class="u-hb">' + UMBMARK + '<span class="u-umb">UMB</span></span><b class="u-nm">Luna\'s Coffee</b><span class="u-cs u-nm">·</span><span class="u-cs u-nm">Clematis St</span>' +
      '<nav class="u-tabs">' + TABS.map(function (t) { return '<button data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav><b class="u-pclock" data-clk="s"></b></div>' +
      '<div class="u-hr"><span class="u-chip"><i class="u-dot"></i>Square<em>·</em><em>Connected</em></span><span class="u-chip qb">' + icon('sync', 15) + 'Synced to QuickBooks<em>·</em>Gusto</span>' +
      '<div class="u-clock"><span data-clk="d"></span><b data-clk="t"></b></div></div></header>' +
      '<main class="u-view"></main>' +
      '<nav class="u-tabbar">' + TABS.map(function (t) { return '<button data-tab="' + t[0] + '" aria-label="' + t[1] + '">' + icon(t[0], 20) + t[1] + (t[0] === 'inventory' ? '<i class="bd u-ibd"></i>' : '') + '</button>'; }).join('') + '</nav>' +
      '<div class="u-tip"></div>';
    el.appendChild(root);
    if (el.clientHeight < 300 && !el.style.height) root.style.height = opts.compact ? '700px' : '880px';
    var view = root.querySelector('.u-view'), tip = root.querySelector('.u-tip');

    /* ---------- pages ---------- */
    function sec(i, html, cls) { return '<section class="u-sec ' + (cls || '') + '" style="--i:' + i + '">' + html + '</section>'; }
    function sh(lab, meta) { return '<div class="u-sh"><span class="u-lab">' + lab + '</span>' + (meta ? '<span class="u-meta">' + meta + '</span>' : '') + '</div>'; }
    function pn(t) { var d = now(); return '<div class="u-pn">' + d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + '<b>' + t + '</b></div>'; }

    function pageToday() {
      var ch = Math.floor(hNow());
      var gl = [], s = V.scale; for (var v = 0; v <= s; v += V.step * (s / V.step > 5 ? 2 : 1)) gl.push(v);
      var bars = HOURS.map(function (h) {
        var c = h === ch ? ' now' : h > ch ? ' fut' : '';
        return '<div class="u-b' + c + '" data-hour="' + h + '"><i class="g" data-h="ty' + h + '"></i><i class="f" data-h="hr' + h + '"></i></div>';
      }).join('');
      var heat = '<div class="u-heat"><span></span>' + HOURS.map(function () { return ''; }).join('');
      var days = [1, 2, 3, 4, 5, 6, 0], dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var hmx = 0, hv = {};
      days.forEach(function (d) { var w = (d === 0 || d === 6) ? W_WE : W_WD; hv[d] = {}; HOURS.forEach(function (h) { var x = w[h] * DAYMULT[d] * (h === 6 && w[h] ? 2 : 1); hv[d][h] = x; hmx = Math.max(hmx, x); }); });
      heat = '<div class="u-heat">';
      days.forEach(function (d) {
        heat += '<span class="d' + (d === WD ? ' t' : '') + '">' + dn[d] + '</span>';
        HOURS.forEach(function (h) {
          var x = hv[d][h], a = x ? 0.07 + 0.9 * Math.pow(x / hmx, 1.35) : 0;
          heat += '<i class="c' + (d === WD && h === ch ? ' now' : '') + '" style="background:' + (x ? 'rgba(232,184,74,' + a.toFixed(3) + ')' : 'rgba(243,236,223,.035)') + '" data-tip="<b>' + dn[d] + ' ' + hl(h) + '</b><br><span>' + (x ? Math.round(x / (h === 6 && x ? 2 : 1)) + ' orders typical' : 'Closed') + '</span>"></i>';
        });
      });
      heat += '<span></span>' + HOURS.map(function (h) { return '<span class="x">' + hs(h) + '</span>'; }).join('') + '</div>';
      return '<div class="u-page u-tdy">' + pn('Today') +
        sec(0, '<div class="u-kpis">' +
          '<div class="u-kpi"><span class="u-lab">Sales today</span><div class="u-fig">' + K('net', 'fig', 1) + '</div><div class="u-ks"><span class="u-gold">' + K('vsLast', 'pc') + '</span> vs last ' + now().toLocaleDateString('en-US', { weekday: 'long' }) + '</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Orders</span><div class="u-kv">' + K('orders', 'n', 1) + '</div><div class="u-ks">' + K('open') + ' in progress</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Avg ticket</span><div class="u-kv">' + K('avg', 'm', 1) + '</div><div class="u-ks"><span class="u-gold">' + K('vsAvg', 'pc') + '</span> vs 4-wk avg</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Make time</span><div class="u-kv">' + K('make', 'mmss', 1) + '</div><div class="u-ks">Avg · goal 4:00</div></div>' +
          '</div>') +
        '<div class="u-tg"><div class="u-col">' + sec(1, sh('Live orders', '<span class="u-pend"><i class="u-dot" style="background:var(--gold);box-shadow:none;animation:uPulse 2.4s infinite"></i>Square</span>'), 'u-feedh') +
        '<section class="u-sec u-feedw" style="--i:2"><div class="u-feed"></div></section></div>' +
        '<div class="u-col">' + sec(2, sh('Receipts by hour', '<span class="u-leg"><span><i style="background:rgba(243,236,223,.3)"></i>Today</span><span><i style="border:1px dashed rgba(243,236,223,.3)"></i>Typical ' + now().toLocaleDateString('en-US', { weekday: 'short' }) + '</span></span>') +
          '<div class="u-hc">' + gl.map(function (v) { return '<div class="u-grid" style="bottom:' + (v / s * 100) + '%"><span>' + (v ? '$' + v : '0') + '</span></div>'; }).join('') + '<div class="u-bars">' + bars + '</div></div>' +
          '<div class="u-hx">' + HOURS.map(function (h) { return '<span' + (h === ch ? ' class="now"' : '') + '>' + hs(h) + '</span>'; }).join('') + '</div>') +
        sec(3, '<div class="u-st u-heatw">' + sh('Busy times', 'Orders per hour · 8-wk avg') + heat + '</div>') +
        '</div></div></div>';
    }

    function pageSales() {
      var rk = V.ranked.map(function (m, i) {
        return '<div class="u-r u-rk"><span class="ix">' + pad(i + 1) + '</span><span class="nm">' + m.name + '</span><div class="u-trk"><i class="f' + (i === 0 ? ' gd' : '') + '" data-w="dw_' + m.id + '"></i></div><span class="vm">' + K('dq_' + m.id) + '</span><span class="v">' + K('dr_' + m.id, 'm0') + '</span></div>';
      }).join('');
      var ml = CATS.map(function (c) { return '<div class="u-r"><i class="u-sw" style="background:' + CATC[c] + '"></i><span class="nm">' + c + '</span><span class="vm">' + K('cp_' + c, 'p0') + '</span><span class="v">' + K('cr_' + c, 'm0') + '</span></div>'; }).join('');
      return '<div class="u-page">' + pn('Sales') + '<div class="u-g2">' +
        sec(0, sh('Sales by drink', '<b>' + K('units') + '</b> items') + '<div class="u-rows">' + rk + '</div>') +
        '<div>' + sec(1, sh('Category mix') + '<div class="u-mix"><div class="u-don" id="u-don"></div><div class="u-ml"><div class="u-rows">' + ml + '</div></div></div>') +
        sec(2, '<div class="u-st">' + sh('Top hour') + '<div class="u-duo"><div><div class="u-big">' + hl(V.topH).replace(' ', '<small>') + '</small></div><div class="u-ks">' + K('topHr', 'm0') + ' · ' + K('topHn') + ' orders</div></div>' +
          '<div><div class="u-big u-mut" style="color:var(--muted)">' + hl(V.loH).replace(' ', '<small>') + '</small></div><div class="u-ks">Slowest · ' + K('loHr', 'm0') + ' · ' + K('loHn') + ' orders</div></div></div></div>') +
        '</div></div>' +
        sec(3, '<div class="u-st">' + sh('Week over week', '<span class="u-leg"><span><i style="background:var(--gold)"></i>Last 7 days ' + '<b style="color:var(--cream);font-weight:600;margin-left:2px">' + K('t7', 'm0') + '</b></span><span><i style="border:1px dashed rgba(163,166,184,.7)"></i>Prior 7 ' + K('l7', 'm0') + '</span><span class="u-gold" style="font-weight:700">' + K('wow', 'pc') + '</span></span>') + '<div class="u-line" id="u-line"></div></div>') +
        '</div>';
    }

    function pageInventory() {
      var bn = S.inv.beans.map(function (b, i) {
        var low = b.lb / b.use < b.par;
        return '<div class="u-r u-bn"><span class="nm">' + b.n + (low && !S.reorders[b.k] ? '<span class="u-tag" data-low="' + b.k + '">Low</span>' : '') + '<small>' + b.o + ' · ' + K('bl' + i, 'n1') + ' lb</small></span><span class="v">' + K('bd' + i, 'n1') + '<small>days</small></span><div class="u-trk"><i class="f' + (low ? ' gd' : '') + '" data-w="bw' + i + '"></i><i class="par" style="left:' + (b.par / 14 * 100) + '%"></i></div></div>';
      }).join('');
      var mk = S.inv.milk.map(function (b, i) {
        var low = b.lb < b.par;
        return '<div class="u-r u-ml2"><span class="nm">' + b.k + (low && !S.reorders[b.k] ? '<span class="u-tag" data-low="' + b.k + '">Low</span>' : '') + '<small>Par ' + b.par + ' gal</small></span><span class="v">' + K('ml' + i, 'n1') + '<small>gal</small></span><div class="u-trk"><i class="f' + (low ? ' gd' : '') + '" data-w="mw' + i + '"></i><i class="par" style="left:' + (b.par / b.cap * 100) + '%"></i></div></div>';
      }).join('');
      var cp = S.inv.cups.map(function (b, i) {
        var low = b.q < b.par;
        return '<div class="u-r u-cup"><span class="nm">' + b.n + (low && !S.reorders[b.n] ? '<span class="u-tag" data-low="' + b.n + '">Low</span>' : '') + '</span><div class="u-trk"><i class="f' + (low ? ' gd' : '') + '" data-w="cw' + i + '"></i><i class="par" style="left:' + (b.par / b.cap * 100) + '%"></i></div><span class="v">' + K('cq' + i) + '</span></div>';
      }).join('');
      var al = ALERTS.map(function (a) {
        var d = S.reorders[a.k];
        return '<div class="u-r u-al"><span class="nm">' + a.n + '<small>' + a.q + '</small></span><span class="nm sp" style="font-weight:500;color:var(--muted)">' + a.sup + '</span><span class="v">' + FMT.m(a.cost) + '</span>' +
          (d ? '<span class="u-btn done">' + icon('check', 15) + a.eta + '</span>' : '<button class="u-btn" data-reorder="' + a.k + '">Reorder</button>') + '</div>';
      }).join('');
      var hn = hNow();
      var ws = WASTE.filter(function (w) { return w[0] <= hn; }).map(function (w) {
        return '<div class="u-r u-ws"><span class="t">' + hm(w[0]).replace(/:(\d\d)/, function (x) { return x; }) + '</span><span class="nm">' + w[1] + '<small>' + w[2] + '</small></span><span class="v">' + FMT.m(w[3]) + '</span></div>';
      }).join('');
      return '<div class="u-page">' + pn('Inventory') + '<div class="u-g3">' +
        sec(0, sh('Beans', 'Days left') + '<div class="u-rows">' + bn + '</div>') +
        sec(1, sh('Milk', 'On hand') + '<div class="u-rows">' + mk + '</div>') +
        sec(2, sh('Cups & lids', 'Count') + '<div class="u-rows">' + cp + '</div>') +
        '</div><div class="u-g3 u-st">' +
        sec(3, sh('Reorder') + '<div class="u-rows" id="u-al">' + al + '</div>', 'u-span2') +
        sec(4, sh('Waste today', K('wasteN') + ' entries') + '<div class="u-rows">' + ws + '</div><div class="u-tot"><span>Total</span>' + K('waste', 'm', 1) + '</div>') +
        '</div></div>';
    }

    function pageTeam() {
      var A = 6, B = 22, span = B - A, hn = hNow();
      function x(h) { return (h - A) / span * 100; }
      var rows = STAFF.map(function (p, i) {
        var on = hn >= p.s && hn < p.e;
        return '<div class="u-tr"><span class="nm">' + p.n + '<small>' + p.r + '</small></span><div class="u-lane"><div class="u-sh2' + (on ? ' on' : '') + '" style="left:' + x(p.s) + '%;width:' + (x(p.e) - x(p.s)) + '%" data-tip="<b>' + p.n + '</b><br><span>' + hm(p.s) + ' – ' + hm(p.e) + ' · ' + (p.e - p.s).toFixed(1) + ' h</span>"><i class="w" data-w="tww' + i + '"></i></div></div><span class="v" style="text-align:right;font-weight:600">' + K('tw' + i, 'n1') + '<small style="color:var(--muted);font-weight:500;font-size:12px;margin-left:3px">h</small></span></div>';
      }).join('');
      var ax = ''; for (var h = A; h <= B; h += 2) ax += '<span style="left:' + x(h) + '%">' + hs(h) + '</span>';
      var tp = STAFF.map(function (p, i) {
        return '<div class="u-r u-tp"><span class="nm">' + p.n + '</span><div class="u-trk"><i class="f' + (i === 0 ? ' gd' : '') + '" data-w="tpw' + i + '"></i></div><span class="vm">' + K('tw' + i, 'n1') + ' h</span><span class="v">' + K('tip' + i, 'm') + '</span></div>';
      }).join('');
      return '<div class="u-page">' + pn('Team') +
        sec(0, '<div class="u-kpis"><div class="u-kpi"><span class="u-lab">On floor now</span><div class="u-kv">' + K('onFloor', 'n', 1) + '<small>of ' + STAFF.length + '</small></div><div class="u-ks">' + STAFF.filter(function (p) { return hn >= p.s && hn < p.e; }).map(function (p) { return p.n.split(' ')[0]; }).join(', ') + '</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Hours today</span><div class="u-kv">' + K('hoursW', 'n1', 1) + '</div><div class="u-ks">of ' + V.hoursS.toFixed(1) + ' scheduled</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Tips pool</span><div class="u-kv">' + K('tips', 'm', 1) + '</div><div class="u-ks">Split by hours</div></div>' +
          '<div class="u-kpi"><span class="u-lab">Payroll</span><div class="u-kv">' + K('pTotal', 'm0', 1) + '</div><div class="u-ks">Oct 19 – Nov 1</div></div></div>') +
        sec(1, '<div class="u-st" style="margin-top:44px">' + sh('Shifts today') + '<div class="u-tl">' + rows + '<div class="u-tlnow" style="position:absolute;top:0;bottom:0;left:0;right:0;pointer-events:none"></div></div><div class="u-tx"><span></span><div class="ax">' + ax + '</div><span></span></div></div>') +
        '<div class="u-g2 u-st">' + sec(2, sh('Tip split', K('tips', 'm') + ' pool')) .replace('</section>', '<div class="u-rows">' + tp + '</div></section>') +
        sec(3, sh('Payroll · Oct 19 – Nov 1', 'Runs Nov 2') + '<div class="u-rows">' +
          '<div class="u-r u-pr"><span class="nm">Hours</span><span class="v">' + K('pHours', 'n1') + '</span></div>' +
          '<div class="u-r u-pr"><span class="nm">Wages</span><span class="v">' + K('pWages', 'm') + '</span></div>' +
          '<div class="u-r u-pr"><span class="nm">Tips</span><span class="v">' + K('pTips', 'm') + '</span></div>' +
          '<div class="u-r u-pr"><span class="nm">Employer taxes</span><span class="v">' + K('pTax', 'm') + '</span></div>' +
          '<div class="u-r u-pr tt"><span class="nm">Period total</span><span class="v">' + K('pTotal', 'm', 1) + '</span></div></div>') +
        '</div></div>';
    }

    function pageBooks() {
      function dc(n, k, cls) { return '<div class="u-r u-dc ' + (cls || '') + '"><span class="nm">' + n + '</span><span class="v">' + K(k, 'm', 1) + '</span></div>'; }
      function pl(n, k, cls) { return '<div class="u-r u-pl ' + (cls || '') + '"><span class="nm">' + n + '</span><div class="u-trk"><i class="f' + (k === 'mNoi' ? ' gd' : '') + '" data-w="' + k + 'w"></i></div><span class="v">' + K(k, 'm0', 1) + '</span></div>'; }
      return '<div class="u-page">' + pn('Books') + '<div class="u-g2">' +
        sec(0, sh('Daily close', now().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · so far') +
          '<div style="padding:4px 0 26px"><span class="u-lab">Total collected</span><div class="u-fig" style="font-size:56px">' + K('total', 'fig', 1) + '</div></div>' +
          '<div class="u-rows">' + dc('Gross sales', 'gross') + dc('Discounts', 'disc', 'sub') + dc('Refunds', 'refunds', 'sub') + dc('Net sales', 'net', 'k') + dc('Tax collected', 'tax', 'sub') + dc('Tips', 'tips', 'sub') + '</div>' +
          '<div class="u-split"><i style="background:var(--gold)" data-w="cardPct"></i><i style="background:rgba(243,236,223,.35)" data-w="cashPct"></i></div>' +
          '<div class="u-sl"><span><i class="u-sw" style="display:inline-block;background:var(--gold);margin-right:8px;vertical-align:-1px"></i>Card<b>' + K('card', 'm') + '</b></span><span>Cash<b>' + K('cash', 'm') + '</b></span></div>') +
        sec(1, sh('P&amp;L · ' + now().toLocaleDateString('en-US', { month: 'long' }) + ' to date', '<b>' + K('mMargin', 'n1') + '%</b> margin') + '<div class="u-rows">' +
          pl('Net sales', 'mRev', 'k') + pl('Cost of goods', 'mCogs', 'sub') + pl('Gross profit', 'mGp', 'k') + pl('Labor', 'mLabor', 'sub') + pl('Rent', 'mRent', 'sub') + pl('Utilities', 'mUtil', 'sub') + pl('Card fees', 'mFees', 'sub') + pl('Marketing', 'mMkt', 'sub') + pl('Supplies &amp; other', 'mOther', 'sub') + pl('Net operating income', 'mNoi', 'k') + '</div>') +
        '</div>' + sec(2, '<div class="u-st">' + sh('Sync', '<span class="u-pend"><i class="u-dot"></i>All systems current</span>') + '<div class="u-rows" id="u-sync">' + syncRows() + '</div></div>') + '</div>';
    }
    function syncRows() {
      var d = now(), y = new Date(d); y.setDate(y.getDate() - 1);
      var base = [
        ['QuickBooks', 'Sales receipts · <span data-k="qbCount"></span> orders today', K('qbAmt', 'm'), '<span data-k="lastQB"></span>', 'qb'],
        ['Gusto', 'Timesheets · ' + STAFF.length + ' people · <span data-k="hoursW" data-f="n1"></span> h', '', '<span data-k="lastGusto"></span>', ''],
        ['Gusto', 'Tips · today', K('tips', 'm'), '<span data-k="lastGusto"></span>', '']
      ];
      S.sync.slice().reverse().forEach(function (s) { base.splice(1, 0, ['QuickBooks', s.d, FMT.m(s.a), tfmt(s.t), 'new']); });
      base.push(['QuickBooks', 'Square payout · deposit', FMT.m(PAST[1].v * 1.13 * 0.886), '6:02 AM', '']);
      base.push(['QuickBooks', 'Daily close ' + y.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · journal entry', FMT.m(PAST[1].v * 1.13), '12:04 AM', '']);
      return base.map(function (r) {
        return '<div class="u-r u-sy' + (r[4] ? ' ' + r[4] : '') + '"><span class="ok">' + icon('check', 16) + '</span><span class="ap">' + r[0] + '</span><span class="ds">' + r[1] + '</span><span class="v">' + r[2] + '</span><span class="vm">' + r[3] + '</span></div>';
      }).join('');
    }

    /* ---------- svg charts ---------- */
    function drawDonut() {
      var host = root.querySelector('#u-don'); if (!host) return;
      var sz = host.clientWidth || 168, r = sz / 2 - 9, c = 2 * Math.PI * r, off = 0, gap = 3;
      var s = '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 ' + sz + ' ' + sz + '"><circle cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" fill="none" stroke="rgba(243,236,223,.05)" stroke-width="10"/>';
      CATS.forEach(function (k) {
        var len = Math.max(0, V['cp_' + k] / 100 * c - gap);
        s += '<circle class="seg" data-len="' + len + '" data-off="' + (-off) + '" cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" fill="none" stroke="' + CATC[k] + '" stroke-width="10" stroke-linecap="butt" stroke-dasharray="0 ' + c + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 ' + sz / 2 + ' ' + sz / 2 + ')" data-tip="<b>' + k + '</b><br><span>' + FMT.p0(V['cp_' + k]) + ' · ' + FMT.m0(V['cr_' + k]) + '</span>"/>';
        off += V['cp_' + k] / 100 * c;
      });
      s += '</svg><div class="ct"><b data-k="cp_Coffee" data-f="p0">' + FMT.p0(V.cp_Coffee) + '</b><span>Coffee</span></div>';
      host.innerHTML = s;
      requestAnimationFrame(function () { requestAnimationFrame(function () { host.querySelectorAll('.seg').forEach(function (e, i) { setTimeout(function () { e.setAttribute('stroke-dasharray', e.dataset.len + ' ' + c); }, reduce ? 0 : 350 + i * 120); }); }); });
    }
    function drawLine() {
      var host = root.querySelector('#u-line'); if (!host) return;
      var W = host.clientWidth || 800, ph = root.classList.contains('ph'), H = ph ? 190 : 220, L = ph ? 40 : 52, Rr = ph ? 20 : 28, T = 18, Bt = 30;
      var tw = [], lw = [], lab = [];
      for (var k = 6; k >= 1; k--) { tw.push(PAST[k].v); lw.push(PAST[k + 7].v); lab.push(PAST[k].d.toLocaleDateString('en-US', { weekday: 'short' })); }
      tw.push(V.net); lw.push(V.lastSame); lab.push('Today');
      var mx = Math.max.apply(null, tw.concat(lw)), step = 1000, top = Math.ceil(mx * 1.05 / step) * step;
      function X(i) { return L + i * (W - L - Rr) / 6; }
      function Y(v) { return T + (H - T - Bt) * (1 - v / top); }
      function path(a) { var d = ''; a.forEach(function (v, i) { if (!i) { d += 'M' + X(i) + ' ' + Y(v); return; } var x0 = X(i - 1), y0 = Y(a[i - 1]), x1 = X(i), y1 = Y(v), cx = (x1 - x0) * 0.42; d += ' C' + (x0 + cx) + ' ' + y0 + ' ' + (x1 - cx) + ' ' + y1 + ' ' + x1 + ' ' + y1; }); return d; }
      var s = '<svg width="' + W + '" height="' + H + '"><defs><linearGradient id="uLg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8B84A" stop-opacity=".22"/><stop offset="1" stop-color="#E8B84A" stop-opacity="0"/></linearGradient></defs>';
      for (var v = 0; v <= top; v += step * (top / step > 5 ? 2 : 1)) s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="rgba(243,236,223,.08)"/><text x="' + (L - 12) + '" y="' + (Y(v) + 4) + '" text-anchor="end" fill="#A3A6B8" font-size="11" font-family="Manrope">' + (v ? '$' + v / 1000 + 'k' : '0') + '</text>';
      lab.forEach(function (t, i) { s += '<text x="' + X(i) + '" y="' + (H - 6) + '" text-anchor="middle" fill="' + (i === 6 ? '#E8B84A' : '#A3A6B8') + '" font-size="11" font-family="Manrope" font-weight="' + (i === 6 ? 700 : 500) + '">' + t + '</text>'; });
      var tp = path(tw);
      s += '<path class="u-fade" d="' + tp + ' L' + X(6) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + 'Z" fill="url(#uLg)"/>';
      s += '<path class="u-draw" pathLength="1" d="' + path(lw) + '" fill="none" stroke="rgba(163,166,184,.55)" stroke-width="1.5" style="stroke-dasharray:none;stroke-dashoffset:0;opacity:0;animation:uFade 1.4s var(--ease) .2s forwards"/>';
      s += '<path d="' + path(lw) + '" fill="none" stroke="#0D0F1C" stroke-width="2" stroke-dasharray="2 5" class="u-fade" style="animation-delay:.2s"/>';
      s += '<path class="u-draw" pathLength="1" d="' + tp + '" fill="none" stroke="#E8B84A" stroke-width="2" stroke-linecap="round"/>';
      tw.forEach(function (v, i) {
        s += '<g class="u-fade"><circle cx="' + X(i) + '" cy="' + Y(v) + '" r="' + (i === 6 ? 5 : 3) + '" fill="' + (i === 6 ? '#E8B84A' : '#0D0F1C') + '" stroke="#E8B84A" stroke-width="1.5"/>' +
          '<rect x="' + (X(i) - 24) + '" y="' + T + '" width="48" height="' + (H - T - Bt) + '" fill="transparent" data-tip="<b>' + lab[i] + ' · ' + FMT.m0(v) + '</b><br><span>Prior ' + FMT.m0(lw[i]) + (i === 6 ? ' at this hour' : '') + '</span>"/></g>';
      });
      s += '<text class="u-fade" x="' + (X(6) - 12) + '" y="' + (Y(tw[6]) + 26) + '" text-anchor="end" fill="#F3ECDF" font-size="12" font-weight="700" font-family="Manrope">' + FMT.m0(tw[6]) + '</text>';
      host.innerHTML = s + '</svg>';
    }
    function drawNow() {
      var n = root.querySelector('.u-tlnow'); if (!n) return;
      var lane = root.querySelector('.u-lane'), tl = root.querySelector('.u-tl'); if (!lane) return;
      var hn = hNow(), p = (hn - 6) / 16, lr = lane.getBoundingClientRect(), tr = tl.getBoundingClientRect();
      var x = lr.left - tr.left + p * lr.width;
      n.innerHTML = '<div class="u-nowl" style="left:' + x + 'px"><b>' + tfmt(now()).replace(/ (AM|PM)/, function (m) { return m.toLowerCase().replace(' ', ''); }) + '</b></div>';
    }

    /* ---------- feed ---------- */
    var rowEls = {};
    function itemsLine(o) {
      var t = o.lines.map(function (l) { return (l.qty > 1 ? l.qty + '× ' : '') + l.name; });
      return t.join(', ');
    }
    function orderHTML(o) {
      var d = o.lines.map(function (l) { return '<div class="u-ol"><span>' + (l.qty > 1 ? l.qty + '× ' : '') + esc(l.name) + (l.notes ? ' <em>' + esc(l.notes) + '</em>' : '') + '</span><span>' + FMT.m(l.qty * l.unit) + '</span></div>'; }).join('');
      d += '<div class="u-ol t"><span>' + o.ch + ' · ' + o.pay + (o.pickup ? ' · Pickup ' + esc(o.pickup) : '') + (o.tip ? ' · Tip ' + FMT.m(o.tip) : '') + '</span><span>' + o.id + '</span></div>';
      return '<button class="u-orow"><span class="u-ot">' + tfmt(o.at).replace(' ', ' ').replace(' ', ' ') + '</span><span class="u-on"><b>' + esc(o.name) + '</b><span>' + esc(itemsLine(o)) + '</span></span><span class="u-oa">' + FMT.m(o.total) + '</span><span class="u-stg" data-s="' + o.stage + '"><span class="u-seg"><i></i><i></i><i></i><i></i></span><span>' + STAGES[o.stage] + '</span></span></button>' +
        '<div class="u-od"><div><div class="u-odi">' + d + '</div></div></div>';
    }
    function feedRow(o, enter) {
      var e = document.createElement('div');
      e.className = 'u-o' + (o.real ? ' real' : '') + (enter ? ' enter' : '');
      e.innerHTML = orderHTML(o); e._o = o;
      e.querySelector('.u-orow').addEventListener('click', function () { e.classList.toggle('open'); });
      rowEls[o.id] = e; return e;
    }
    function renderFeed() {
      var f = root.querySelector('.u-feed'); if (!f) return; rowEls = {};
      f.innerHTML = '';
      var list = feedList();
      list.forEach(function (o) { f.appendChild(feedRow(o)); });
    }
    function feedList() {
      var real = S.orders.filter(function (o) { return o.real; }).slice(-3);
      var rest = S.orders.filter(function (o) { return !o.real; }).slice(-12);
      var all = rest.concat(real).sort(function (a, b) { return (b.real ? b.rt : 0) - (a.real ? a.rt : 0) || b.at - a.at; });
      return all.slice(0, 12);
    }
    function feedAdd(o) {
      var f = root.querySelector('.u-feed'); if (!f) return;
      var e = feedRow(o, !reduce);
      if (o.real) f.insertBefore(e, f.firstChild);
      else { var after = null; f.querySelectorAll('.u-o.real').forEach(function (x) { after = x; }); f.insertBefore(e, after ? after.nextSibling : f.firstChild); }
      while (f.children.length > 12) { var l = f.lastChild; delete rowEls[l._o.id]; f.removeChild(l); }
    }
    function feedStage(o) {
      var e = rowEls[o.id]; if (!e) return;
      var s = e.querySelector('.u-stg'); s.dataset.s = o.stage; s.lastChild.textContent = STAGES[o.stage];
    }

    /* ---------- live simulation ---------- */
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function setStage(o, st, quiet) {
      o.stage = st;
      clearTimeout(o._t);
      if (!quiet) { feedStage(o); if (st === 3) { S.lastQB = now(); flashSync(); } apply(); }
      if (o.manual || st >= 3) return;
      var wait = st === 0 ? 2600 + Math.random() * 2400 : st === 1 ? 8000 + Math.random() * 7000 : 7000 + Math.random() * 6000;
      if (o.real) wait *= 1.6;
      o._t = setTimeout(function () { if (!dead) setStage(o, st + 1); }, wait);
      timers.push(o._t);
    }
    function addOrder(o) {
      S.orders.push(o); invUse(o);
      feedAdd(o); setStage(o, o.stage, true); apply();
      if (o.real) { var e = rowEls[o.id]; if (e) { e.classList.add('flash'); later(function () { e.classList.remove('flash'); }, 1600); } }
    }
    function simArrive() {
      if (dead) return;
      var o = makeOrder(Math.random, now()); o.stage = 0; addOrder(o);
      later(simArrive, 4200 + Math.random() * 4300);
    }
    function flashSync() {
      var q = root.querySelector('.u-sy.qb'); if (!q) return; q.classList.add('flash'); later(function () { q.classList.remove('flash'); }, 900);
    }
    function normStage(s) {
      if (typeof s === 'number' || /^\d$/.test(s)) return [0, 1, 1, 2, 3][Math.max(0, Math.min(4, +s))];
      s = String(s || '').toLowerCase().replace(/[^a-z]/g, '');
      if (s === 'new' || s === 'received' || s === 'placed' || s === 'ordered') return 0;
      if (s === 'brewing' || s === 'making' || s === 'inprogress' || s === 'preparing' || s === 'finishing') return 1;
      if (s === 'ready') return 2;
      if (s.indexOf('pick') === 0 || s === 'done' || s === 'complete' || s === 'completed') return 3;
      return null;
    }
    function onOrder(ev) {
      var d = ev && ev.detail || {}; if (!d) return;
      var id = String(d.id || ('#' + (S.seq++))); id = id.charAt(0) === '#' ? id : '#' + id;
      if (S.orders.some(function (o) { return o.id === id; })) return;
      var lines = (d.lines || []).map(function (l) {
        var m = BY[l.id]; if (!m) MENU.forEach(function (x) { if (x.name === l.name) m = x; });
        return { id: m ? m.id : l.id, name: l.name || (m && m.name) || 'Item', qty: +l.qty || 1, unit: +l.unit || (m ? m.price : 0), notes: l.notes || '', cat: m ? m.cat : 'Coffee' };
      });
      var gross = r2(lines.reduce(function (a, l) { return a + l.qty * l.unit; }, 0));
      var sub = d.subtotal != null ? +d.subtotal : gross, tax = d.tax != null ? +d.tax : r2(sub * TAX), tp = +d.tip || 0;
      var o = { id: id, name: d.name || 'Guest', lines: lines, gross: Math.max(gross, sub), discount: Math.max(0, r2(gross - sub)), subtotal: sub, tax: tax, tip: tp, total: d.total != null ? +d.total : r2(sub + tax + tp), at: now(), ch: 'Online', pay: 'Card', stage: 0, make: 180 + lines.length * 30, pickup: d.pickup && typeof d.pickup === 'object' ? (d.pickup.label || 'ASAP') : (d.pickup || 'ASAP'), real: true, rt: Date.now() };
      if (S.tab !== 'today' && root.classList.contains('cmp')) go('today');
      addOrder(o);
    }
    function onStage(ev) {
      var d = ev && ev.detail || {}; var id = String(d.id || ''); id = id.charAt(0) === '#' ? id : '#' + id;
      var st = normStage(d.stage); if (st == null) return;
      S.orders.forEach(function (o) { if (o.id === id) { o.manual = true; setStage(o, st); } });
    }
    window.addEventListener('luna:order', onOrder);
    window.addEventListener('luna:order-stage', onStage);

    /* ---------- tabs ---------- */
    var ORDER = TABS.map(function (t) { return t[0]; });
    function go(tab, dir) {
      S.tab = tab;
      root.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
      derive();
      var html = tab === 'today' ? pageToday() : tab === 'sales' ? pageSales() : tab === 'inventory' ? pageInventory() : tab === 'team' ? pageTeam() : pageBooks();
      view.innerHTML = html; view.scrollTop = 0;
      var pg = view.firstChild;
      if (dir) pg.classList.add(dir > 0 ? 'sl' : 'sr');
      if (tab === 'today') renderFeed();
      if (tab === 'sales') { drawDonut(); drawLine(); }
      if (tab === 'team') drawNow();
      root.querySelectorAll('[data-w],[data-h]').forEach(function (e) { e.style[e.dataset.w ? 'width' : 'height'] = '0%'; });
      void pg.offsetWidth;
      requestAnimationFrame(function () { pg.classList.add('in'); later(apply, reduce ? 0 : 260); });
      if (!reduce) root.querySelectorAll('[data-k][data-t]').forEach(function (e) { e._v = 0; });
      apply();
      root.querySelectorAll('[data-w],[data-h]').forEach(function (e) { e.style[e.dataset.w ? 'width' : 'height'] = '0%'; });
    }
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]');
      if (t) { var a = ORDER.indexOf(S.tab), b = ORDER.indexOf(t.dataset.tab); if (a !== b) go(t.dataset.tab, root.classList.contains('ph') ? (b > a ? 1 : -1) : 0); return; }
      var r = e.target.closest('[data-reorder]');
      if (r) {
        var k = r.dataset.reorder, a2 = ALERTS.filter(function (x) { return x.k === k; })[0];
        S.reorders[k] = now(); S.sync.push({ d: 'Purchase order · ' + a2.sup, a: a2.cost, t: now() });
        r.outerHTML = '<span class="u-btn done">' + icon('check', 15) + a2.eta + '</span>';
        root.querySelectorAll('[data-low]').forEach(function (t) { if (t.dataset.low === k) { t.style.transition = 'opacity .6s'; t.style.opacity = 0; } });
        apply(); syncBadge();
      }
    });
    function syncBadge() { root.querySelectorAll('.u-ibd').forEach(function (b) { b.style.display = V.alerts ? '' : 'none'; }); }

    /* swipe on phone */
    var tx = null, ty = null;
    view.addEventListener('touchstart', function (e) { if (!root.classList.contains('ph')) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    view.addEventListener('touchend', function (e) {
      if (tx == null) return; var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
      if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6) { var i = ORDER.indexOf(S.tab) + (dx < 0 ? 1 : -1); if (i >= 0 && i < ORDER.length) go(ORDER[i], dx < 0 ? 1 : -1); }
    }, { passive: true });

    /* tooltip */
    root.addEventListener('mousemove', function (e) {
      var t = e.target.closest('[data-tip],.u-b');
      if (!t) { tip.classList.remove('on'); return; }
      var html = t.dataset.tip;
      if (!html && t.classList.contains('u-b')) { var h = +t.dataset.hour; html = '<b>' + hl(h) + ' · ' + FMT.m(V.hr[h]) + '</b><br><span>' + V.hrn[h] + ' orders · typical ' + FMT.m0(typ(h)) + '</span>'; }
      tip.innerHTML = html; var rb = root.getBoundingClientRect();
      var x = e.clientX - rb.left, y = e.clientY - rb.top;
      x = Math.max(90, Math.min(rb.width - 90, x));
      tip.style.left = x + 'px'; tip.style.top = (y - 10) + 'px'; tip.classList.add('on');
    });
    root.addEventListener('mouseleave', function () { tip.classList.remove('on'); });

    /* size classes */
    var lastW = 0;
    function size() {
      var w = root.clientWidth; if (w === lastW) return; lastW = w;
      var ph = w < 760; var was = root.classList.contains('ph');
      root.classList.toggle('ph', ph);
      root.classList.toggle('md', !ph && !opts.compact && w < 1180);
      if (S.tab === 'sales') drawLine();
      if (S.tab === 'team') drawNow();
      if (was !== ph && view.firstChild) go(S.tab);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(root); else window.addEventListener('resize', size);

    /* clock */
    var lastH = Math.floor(hNow());
    function clock() {
      var d = now();
      root.querySelectorAll('[data-clk="t"]').forEach(function (e) { e.textContent = tfmt(d, true); });
      root.querySelectorAll('[data-clk="s"]').forEach(function (e) { e.textContent = tfmt(d); });
      root.querySelectorAll('[data-clk="d"]').forEach(function (e) { e.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); });
      var h = Math.floor(hNow());
      if (h !== lastH) { lastH = h; if (S.tab === 'today') go('today'); }
      if (d.getSeconds() === 0 && S.tab === 'team') drawNow();
      if (d.getMinutes() % 15 === 0 && d.getSeconds() === 0) { S.lastGusto = d; apply(); }
    }
    var ci = setInterval(clock, 1000);

    size(); go(opts.tab || 'today'); clock(); syncBadge();
    later(simArrive, 2500);

    var api = {
      unmount: function () { dead = true; clearInterval(ci); timers.forEach(clearTimeout); S.orders.forEach(function (o) { clearTimeout(o._t); }); window.removeEventListener('luna:order', onOrder); window.removeEventListener('luna:order-stage', onStage); if (ro) ro.disconnect(); if (root.parentNode) root.parentNode.removeChild(root); el.__umb = null; },
      go: function (t) { go(t); },
      state: function () { derive(); return { orders: S.orders.length, net: V.net, tips: V.tips }; }
    };
    el.__umb = api;
    return api;
  }

  window.LunaOwner = { mount: mount };
})();

/* Harris Hill · the barn office. window.HHOffice.mount(el)
   Bookings, horse listings, the site's inquiries, the show season and the people in the barn, in one place.
   Concept data: seeded fresh each week around today's date, kept in this browser.

ALIGNMENT NOTES
- Rail 248px, header 88px. The page title, every section label and every card share one left edge: the main column's 48px padding.
- Section labels sit on a hairline; content starts 18px under it, everywhere.
- Numbers are tabular so columns of times and amounts line up digit for digit.
- Intentional offsets:
  1) The calendar's hour labels hang 8px above their gridline. Purpose: the label names the hour that starts on the line, read like a ruler.
  2) Event cards in the calendar inset 3px from the day's column. Purpose: two back-to-back bookings read as two, not one long block.
*/
(function () {
  'use strict';
  if (window.HHOffice) return;
  var ST = window.HHStore;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  var NF0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  function money(v) { return (v < 0 ? '−$' : '$') + NF0.format(Math.abs(v)); }
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function d0(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addD(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function monday(d) { var x = d0(d), w = (x.getDay() + 6) % 7; return addD(x, -w); }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function at(d, h, m) { var x = d0(d); x.setHours(h, m || 0, 0, 0); return x; }
  function tm(d) { d = new Date(d); var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? ' AM' : ' PM'); }
  function tms(d) { d = new Date(d); var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + pad(m); }
  function md(d) { d = new Date(d); return MON[d.getMonth()] + ' ' + d.getDate(); }
  function wd(d) { d = new Date(d); return DAYS[d.getDay()] + ', ' + md(d); }
  function ago(t, now) { var s = (now - new Date(t)) / 1000; if (s < 60) return 'Just now'; if (s < 3600) return Math.round(s / 60) + 'm'; if (s < 86400) return Math.round(s / 3600) + 'h'; if (s < 86400 * 7) return Math.round(s / 86400) + 'd'; return md(t); }
  function initials(n) { return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function first(n) { return String(n || '').split(/\s+/)[0]; }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- vocabulary ---------- */
  var TYPES = {
    lesson: { l: 'Lesson', c: 'var(--navy)' },
    viewing: { l: 'Viewing', c: 'var(--brass)' },
    training: { l: 'Training ride', c: 'var(--saddle)' },
    care: { l: 'Farrier & vet', c: 'var(--sage)' }
  };
  var IQT = { lesson: 'A lesson', training: 'Training', viewing: 'A viewing', boarding: 'Boarding' };
  var HS = { home: 'Home string', sale: 'For sale', lease: 'For lease', contract: 'Under contract', sold: 'Sold', leased: 'Leased' };
  var RINGS = ['Main ring', 'Flat ring', 'Grass field', 'At the barn'];
  var PLACE = [
    { k: 'ch', l: 'Champion', c: ['#1F4FA3', '#B3262E', '#E2B93B'] },
    { k: 'rc', l: 'Reserve', c: ['#B3262E', '#E2B93B', '#F4F1EA'] },
    { k: '1', l: '1st', c: ['#1F4FA3'] }, { k: '2', l: '2nd', c: ['#B3262E'] }, { k: '3', l: '3rd', c: ['#E2B93B'] },
    { k: '4', l: '4th', c: ['#F4F1EA'] }, { k: '5', l: '5th', c: ['#E59BB0'] }, { k: '6', l: '6th', c: ['#3E7D4F'] }
  ];
  var PL = {}; PLACE.forEach(function (p) { PL[p.k] = p; });
  var PHOTOS = ['grey-bw.webp', 'palm.webp', 'bay-close.webp', 'stone-wall.webp', 'bay-head.webp', 'bay-over.webp', 'walk.webp', 'paddock.webp', 'photo.webp', 'barn.webp'];
  var POS = { 'grey-bw.webp': '45% 50%', 'palm.webp': '50% 62%', 'bay-close.webp': '38% 45%', 'stone-wall.webp': '40% 50%', 'bay-head.webp': '40% 40%', 'pony-jump.webp': '50% 35%', 'bay-over.webp': '50% 40%', 'walk.webp': '60% 50%', 'paddock.webp': '50% 55%', 'photo.webp': '58% 50%', 'barn.webp': '30% 55%' };

  /* ---------- seed: one believable fortnight around today ---------- */
  function seed(now) {
    var T = d0(now), W = monday(now);
    var horses = [
      { id: 'sterling', name: 'Sterling', status: 'sale', site: true, disc: 'Hunter, derbies', age: 8, ht: '16.3h', sex: 'Gelding', breed: 'Warmblood', price: 0, img: 'grey-bw.webp', story: 'A scopey grey with a big, even step, brought along through the young hunters and now at home in the performance hunter ring.' },
      { id: 'juniper', name: 'Juniper', status: 'sale', site: true, disc: 'Young hunter', age: 6, ht: '16.1h', sex: 'Mare', breed: 'Warmblood', price: 0, img: 'palm.webp', story: 'Careful and kind, with a lovely canter. She has had a quiet, steady start in the program and is ready for her next rider.' },
      { id: 'cavalier', name: 'Cavalier', status: 'lease', site: true, disc: 'Equitation, hunter', age: 11, ht: '16.2h', sex: 'Gelding', breed: 'Warmblood', price: 0, img: 'bay-close.webp', story: 'A seasoned partner for a junior rider moving up. Honest to the fences and straightforward on the flat.' },
      { id: 'notary', name: 'Notary', status: 'lease', site: true, disc: 'Amateur hunter', age: 13, ht: '16.1h', sex: 'Gelding', breed: 'Warmblood', price: 0, img: 'stone-wall.webp', story: 'An amateur hunter with miles in the ring, comfortable at home and away, and happiest with a regular routine.' },
      { id: 'pokerface', name: 'Poker Face', barn: 'Pokey', status: 'home', site: false, disc: 'International derbies', age: 21, ht: 'Under 16h', sex: '', breed: 'Dutch Warmblood', price: 0, img: 'barn.webp', rec: 'Seven International Derby Championships', story: 'Started in the baby greens as a newly imported five year old and brought all the way up to the High Performance. A banana every morning, a hackamore at home, and a family horse at heart.' },
      { id: 'sugarman', name: 'Sugarman', status: 'home', site: false, disc: 'National derbies, handy', age: 19, ht: '', sex: 'Gelding', breed: '', price: 0, img: 'photo.webp', rec: 'Won the $10,000 National Derby, 184', story: 'Started young in the program. Laid back, fearless to the jumps and scopey, and Jennifer’s favorite for the handy rounds.' }
    ];
    var clients = [
      { id: 'c1', name: 'Ava Whitcombe', kind: 'Boarder', rider: 'Junior', horses: ['Bellamy'], stall: 4, program: 'Training', since: '2021', slots: [[2, 15, 30], [4, 15, 30], [6, 10, 0]], ring: 'Main ring', care: { farrier: 3, vet: 41 }, notes: 'Qualifying for Indoors in the 3′3″ junior hunters.' },
      { id: 'c2', name: 'Claire Hadley', kind: 'Boarder', rider: 'Amateur', horses: ['Marlowe'], stall: 2, program: 'Training', since: '2019', slots: [[1, 9, 0], [3, 9, 0], [5, 9, 0]], ring: 'Main ring', care: { farrier: 3, vet: 12 }, notes: 'Amateur owner hunters. Prefers early rides before work.' },
      { id: 'c3', name: 'Sophie Lin', kind: 'Boarder', rider: 'Pony', horses: ['Pippin'], stall: 7, program: 'Lessons', since: '2024', slots: [[3, 16, 0], [6, 11, 15]], ring: 'Flat ring', mins: 45, care: { farrier: 10, vet: 55 }, notes: 'Small ponies. Parent: Grace Lin.' },
      { id: 'c4', name: 'Harper Quinn', kind: 'Boarder', rider: 'Junior', horses: ['Quill'], stall: 5, program: 'Training', since: '2022', slots: [[2, 16, 45], [4, 16, 45]], ring: 'Main ring', care: { farrier: 10, vet: 6 }, notes: 'Equitation. Medal and Maclay this season.' },
      { id: 'c5', name: 'Margaret Ellison', kind: 'Owner', rider: '', horses: ['Halcyon'], stall: 8, program: 'Young horses', since: '2025', slots: [], ring: '', care: { farrier: 17, vet: 26 }, notes: 'Owner of Halcyon, four, in the young horse program. Ridden by Jennifer.' },
      { id: 'c6', name: 'Daniel Reyes', kind: 'Rider', rider: 'Amateur', horses: [], stall: 0, program: 'Lessons', since: '2025', slots: [[6, 8, 30]], ring: 'Main ring', care: null, notes: 'Lessons on a school horse. Thinking about a lease.' },
      { id: 'c7', name: 'Isabel Moreau', kind: 'Boarder', rider: 'Amateur', horses: ['Sonnet'], stall: 3, program: 'Training', since: '2020', slots: [[1, 11, 0], [3, 11, 0]], ring: 'Grass field', care: { farrier: 17, vet: 2 }, notes: 'Amateur derbies. Sonnet has a hock check due.' },
      { id: 'c8', name: 'Lily Carver', kind: 'Rider', rider: 'Junior', horses: [], stall: 0, program: 'Lessons', since: '2026', slots: [[5, 15, 30]], ring: 'Flat ring', care: null, notes: 'New this fall. Riding Cavalier in lessons.' }
    ];
    var RATE = { Training: 1850, Lessons: 0, 'Young horses': 2400 }, BOARD = 2600, LESSON = 150;
    var ev = [];
    function E(o) { o.id = o.id || uid('e'); o.status = o.status || 'confirmed'; ev.push(o); }
    for (var k = -7; k <= 13; k++) {
      var day = addD(W, k), dw = day.getDay(); if (dw === 0) continue;
      var past = day < T;
      if (dw <= 5) E({ type: 'training', title: 'Halcyon', who: 'Jennifer', horse: 'Halcyon', ring: 'Flat ring', start: at(day, 7, 30), mins: 45 });
      if (dw === 1 || dw === 3 || dw === 5) E({ type: 'training', title: 'Juniper', who: 'Jennifer', horse: 'Juniper', ring: 'Main ring', start: at(day, 8, 15), mins: 45 });
      if (dw === 2 || dw === 4) E({ type: 'training', title: 'Sterling', who: 'Jennifer', horse: 'Sterling', ring: 'Main ring', start: at(day, 8, 15), mins: 45 });
      clients.forEach(function (c) {
        c.slots.forEach(function (s) {
          if (s[0] !== dw) return;
          E({ type: 'lesson', title: c.name, who: c.name, cid: c.id, horse: c.horses[0] || (c.id === 'c8' ? 'Cavalier' : 'School horse'), ring: c.ring, start: at(day, s[1], s[2]), mins: c.mins || 60, status: past ? 'done' : 'confirmed' });
        });
      });
      if (dw === 3 && Math.floor((day - W) / 864e5 / 7) % 2 === 0) E({ type: 'care', title: 'Farrier', who: 'Farrier', horse: 'Bellamy, Marlowe, Quill', ring: 'At the barn', start: at(day, 13, 0), mins: 90, status: past ? 'done' : 'confirmed' });
    }
    var thu = addD(W, 3), sat = addD(W, 5);
    if (thu < T) { thu = addD(thu, 7); sat = addD(sat, 7); }
    E({ type: 'viewing', title: 'Kate Ambrose', who: 'Kate Ambrose', horse: 'Sterling', ring: 'Main ring', start: at(thu, 14, 0), mins: 60, iq: 'q4' });
    E({ type: 'care', title: 'Vet', who: 'Vet', horse: 'Sonnet', ring: 'At the barn', start: at(addD(T, 1).getDay() === 0 ? addD(T, 2) : addD(T, 1), 12, 30), mins: 60 });
    if (T.getDay() !== 0) E({ type: 'viewing', title: 'Mia Calloway', who: 'Mia Calloway', horse: 'Juniper', ring: 'Main ring', start: at(T, 14, 30), mins: 60 });

    var hrs = 3600e3, dy = 864e5;
    var inbox = [
      { id: 'q1', at: new Date(+now - 2 * hrs), type: 'viewing', name: 'Rebecca Stone', contact: 'rebecca.stone@example.com', rider: 'Parent of a rider', horse: 'Juniper', status: 'new', read: false, src: 'site',
        fields: [['For', 'A viewing, Juniper'], ['Looking to', 'Buy'], ['For a', 'Junior'], ['Days', 'Sat, Sun'], ['Time', 'Morning'], ['Note', 'For our daughter, moving up from the children’s hunters. Could we see her go this weekend?']], thread: [] },
      { id: 'q2', at: new Date(+now - 26 * hrs), type: 'boarding', name: 'Natalie Ford', contact: 'n.ford@example.com', rider: 'Amateur', horse: '', status: 'new', read: false, src: 'site',
        fields: [['For', 'Boarding'], ['Horses', 'Two'], ['From', 'January'], ['Rider', 'Amateur'], ['Your horse', 'Two amateur hunters'], ['Note', 'Coming down for the winter season. Full service if you have the room.']], thread: [] },
      { id: 'q3', at: new Date(+now - 3 * dy), type: 'lesson', name: 'Chris Ashby', contact: 'chris.ashby@example.com', rider: 'Amateur', horse: '', status: 'replied', read: true, src: 'site',
        fields: [['For', 'A lesson'], ['Divisions', 'Amateur hunters'], ['Season', 'Winter in Wellington'], ['Goals', 'Back in the ring after a few years off.'], ['Days', 'Tue, Thu'], ['Time', 'Afternoon']],
        thread: [{ who: 'Jennifer', at: new Date(+now - 3 * dy + 5 * hrs), text: 'Hi Chris, welcome back to it. I have Tuesday and Thursday afternoons open from next week. Would 4:30 suit you for a first ride on one of ours?' }] },
      { id: 'q4', at: new Date(+now - 5 * dy), type: 'viewing', name: 'Kate Ambrose', contact: 'kate@example.com', rider: 'Professional', horse: 'Sterling', status: 'booked', read: true, src: 'site',
        fields: [['For', 'A viewing, Sterling'], ['Looking to', 'Buy'], ['For a', 'Junior'], ['Days', 'Thu'], ['Time', 'Afternoon'], ['Note', 'Trainer, looking for a junior hunter for a client.']],
        thread: [{ who: 'Jennifer', at: new Date(+now - 5 * dy + 3 * hrs), text: 'Hi Kate, Thursday at 2 works well. He’ll be tacked up and warmed up for you.' }] }
    ];
    var shows = [
      { id: 's0', name: 'Southeast Summer', venue: 'Summer circuit', start: addD(T, -84), days: 5, publish: false,
        entries: [], results: [{ horse: 'Sterling', rider: 'Jennifer', cls: 'Performance Hunter 3′6″', place: 'rc' }, { horse: 'Bellamy', rider: 'Ava Whitcombe', cls: 'Junior Hunter 3′3″', place: '3' }] },
      { id: 's1', name: 'Fall Classic', venue: 'WEC Ocala', start: addD(T, -19), days: 5, publish: true, entries: [],
        results: [{ horse: 'Sterling', rider: 'Jennifer', cls: 'Performance Hunter 3′6″', place: 'ch' }, { horse: 'Bellamy', rider: 'Ava Whitcombe', cls: 'Junior Hunter 3′3″', place: '1' },
          { horse: 'Quill', rider: 'Harper Quinn', cls: 'Equitation 3′3″', place: '2' }, { horse: 'Pippin', rider: 'Sophie Lin', cls: 'Small Pony Hunter', place: '4' }, { horse: 'Juniper', rider: 'Jennifer', cls: 'Green Hunter 3′', place: '1' }] },
      { id: 's2', name: 'Fall II', venue: 'WEC Ocala', start: addD(T, 9), days: 5, publish: false, results: [],
        entries: [{ horse: 'Sterling', rider: 'Jennifer', cls: 'Performance Hunter 3′6″' }, { horse: 'Juniper', rider: 'Jennifer', cls: 'Green Hunter 3′' }, { horse: 'Bellamy', rider: 'Ava Whitcombe', cls: 'Junior Hunter 3′3″' }, { horse: 'Quill', rider: 'Harper Quinn', cls: 'Equitation 3′3″' }] },
      { id: 's3', name: 'Winter Week 1', venue: 'Wellington International', start: addD(T, 70), days: 5, publish: false, results: [],
        entries: [{ horse: 'Sterling', rider: 'Jennifer', cls: 'Performance Hunter 3′6″' }, { horse: 'Marlowe', rider: 'Claire Hadley', cls: 'Amateur Owner Hunter 3′3″' }, { horse: 'Sonnet', rider: 'Isabel Moreau', cls: 'National Hunter Derby' }] },
      { id: 's4', name: 'Winter Week 2', venue: 'Wellington International', start: addD(T, 77), days: 5, publish: false, results: [], entries: [] }
    ];
    clients.forEach(function (c) {
      var lines = [];
      if (c.stall) lines.push(['Full board', BOARD]);
      if (RATE[c.program]) lines.push([c.program, RATE[c.program]]);
      var ls = ev.filter(function (e) { return e.cid === c.id && new Date(e.start).getMonth() === now.getMonth() && new Date(e.start) < now; }).length;
      if (c.program === 'Lessons' && ls) lines.push([ls + (ls === 1 ? ' lesson' : ' lessons'), ls * LESSON]);
      c.lines = lines; c.paid = c.id === 'c2' || c.id === 'c7' || c.id === 'c5';
    });
    return { v: 2, seeded: +T, horses: horses, clients: clients, events: ev, inbox: inbox, shows: shows };
  }

  /* ---------- icons (1.5px line) ---------- */
  var IC = {
    today: '<circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>',
    calendar: '<rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 10h16.5M8 3.5v3.5M16 3.5v3.5"/>',
    inbox: '<path d="M4 13.5 6.2 6.3A1.5 1.5 0 0 1 7.6 5.2h8.8a1.5 1.5 0 0 1 1.4 1.1L20 13.5v4.8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.3z"/><path d="M4 13.5h4.5l1.2 2.2h4.6l1.2-2.2H20"/>',
    horses: '<path d="M7.4 19.6H4.9C4.3 17.6 4 15.4 4 13.3 4 8.2 7.6 4.4 12 4.4s8 3.8 8 8.9c0 2.1-.3 4.3-.9 6.3h-2.5c.7-2 1-4.1 1-6.1 0-3.8-2.5-6.6-5.6-6.6s-5.6 2.8-5.6 6.6c0 2 .3 4.1 1 6.1z"/><path d="M6.2 11.5h.01M17.8 11.5h.01M6.4 15.6h.01M17.6 15.6h.01"/>',
    shows: '<circle cx="12" cy="9" r="5.2"/><circle cx="12" cy="9" r="2.1"/><path d="M9 13.4 7.6 20.4l2.6-1.3L12 21l1.8-1.9 2.6 1.3L15 13.4"/>',
    clients: '<circle cx="9" cy="8.5" r="3"/><path d="M3.8 19c.7-2.9 2.8-4.5 5.2-4.5s4.5 1.6 5.2 4.5"/><circle cx="16.8" cy="9.4" r="2.3"/><path d="M15.6 14.6c2.2.1 3.9 1.4 4.6 3.9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="M14.5 6 8.5 12l6 6"/>', right: '<path d="M9.5 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="M5 12.5l4.2 4L19 7"/>',
    reply: '<path d="M9.5 7 4.5 12l5 5"/><path d="M4.5 12H14a5.5 5.5 0 0 1 5.5 5.5V19"/>',
    ext: '<path d="M13.5 5.5H18.5V10.5M18.5 5.5 11 13M16 14v4.5H5.5V8H10"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>'
  };
  function icon(k, sz) { return '<svg viewBox="0 0 24 24" width="' + (sz || 18) + '" height="' + (sz || 18) + '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[k] + '</svg>'; }
  var ROUNDEL = '<svg class="o-rd" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" fill="#F1EADB" stroke="#6E5236" stroke-width="1.2"/><circle cx="50" cy="50" r="43.5" fill="#13284D"/><circle cx="50" cy="50" r="41.2" fill="none" stroke="#C29A5B" stroke-width=".7" opacity=".8"/><g fill="#C9A464" stroke="#4A3721" stroke-width=".45"><rect x="33.4" y="30" width="5" height="40"/><rect x="61.6" y="30" width="5" height="40"/><rect x="27.6" y="27.4" width="16.6" height="3.2"/><rect x="55.8" y="27.4" width="16.6" height="3.2"/><rect x="27.6" y="69.4" width="16.6" height="3.2"/><rect x="55.8" y="69.4" width="16.6" height="3.2"/><rect x="38.4" y="45.6" width="23.2" height="2.6"/><rect x="38.4" y="51.8" width="23.2" height="2.6"/></g></svg>';
  function ribbon(k, sz) {
    var p = PL[k]; if (!p) return '';
    var s = sz || 22, c = p.c, n = c.length, g = '';
    for (var i = 0; i < n; i++) { var r = 10 - i * (n > 1 ? 3 : 0); g += '<circle cx="12" cy="9" r="' + r * .62 + '" fill="' + c[i] + '" stroke="rgba(19,40,77,.28)" stroke-width=".6"/>'; }
    return '<svg class="o-rib" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true"><path d="M9.2 12.5 7.6 21l2.6-1.4L12 21.6V13M14.8 12.5 16.4 21l-2.6-1.4L12 21.6" fill="' + c[0] + '" stroke="rgba(19,40,77,.28)" stroke-width=".6" stroke-linejoin="round"/>' + g + '</svg>';
  }

  /* ---------- styles ---------- */
  var CSS = `
.ho{--navy:#13284D;--navy2:#1A3360;--navy3:#24406F;--cream:#F4EFE5;--paper:#FBF8F2;--sand:#E9E1D2;--sand2:#DFD5C2;--brass:#C29A5B;--brass2:#E2C48C;--saddle:#7E5E42;--sage:#6F8169;
--ink:#13284D;--ink2:#3C4A63;--mute:#7C8496;--line:rgba(19,40,77,.11);--line2:rgba(19,40,77,.2);--ok:#3E7D4F;--warn:#B3262E;
--display:"Bodoni Moda","Didot","Bodoni 72",Georgia,serif;--mark:"Josefin Sans","Futura",sans-serif;--text:"Jost","Futura",ui-sans-serif,system-ui,sans-serif;
--ease:cubic-bezier(.22,.61,.36,1);--pad:48px;
position:relative;display:grid;grid-template-columns:248px minmax(0,1fr);grid-template-rows:88px minmax(0,1fr);height:100%;width:100%;overflow:hidden;background:var(--cream);color:var(--ink);font:400 14px/1.45 var(--text);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;text-align:left}
.ho *,.ho *::before,.ho *::after{box-sizing:border-box}
.ho :where(button,input,select,textarea){font:inherit;color:inherit}
.ho :where(button){background:none;border:0;padding:0;cursor:pointer}
.ho :focus-visible{outline:2px solid var(--brass);outline-offset:3px}
.ho .lab{font:400 10.5px/1 var(--mark);letter-spacing:.24em;text-transform:uppercase;color:var(--mute)}
.ho em{font-style:italic}

/* rail */
.o-brand{grid-column:1;grid-row:1;display:flex;align-items:center;gap:14px;padding:0 26px;background:var(--navy);color:#F4EFE5;border-bottom:1px solid rgba(244,239,229,.08)}
.o-rd{width:40px;height:40px;flex:none;display:block}
.o-wm b{display:block;font:400 13px/1 var(--mark);letter-spacing:.26em;text-transform:uppercase;padding-top:2px}
.o-wm span{display:block;margin-top:7px;font:italic 500 13px/1 var(--display);color:var(--brass2);letter-spacing:.01em}
.o-rail{grid-column:1;grid-row:2;display:flex;flex-direction:column;background:var(--navy);color:rgba(244,239,229,.62);padding:26px 0 24px;min-height:0;overflow:auto}
.o-nav{display:flex;flex-direction:column;gap:2px}
.o-nav button{position:relative;display:flex;align-items:center;gap:15px;height:46px;padding:0 26px;font-size:14.5px;letter-spacing:.01em;transition:color .5s var(--ease),background .5s var(--ease)}
.o-nav button::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;background:var(--brass);transform:scaleY(0);transition:transform .6s var(--ease)}
.o-nav button:hover{color:#F4EFE5}
.o-nav button.on{color:#F4EFE5;background:rgba(244,239,229,.05)}
.o-nav button.on::before{transform:none}
.o-nav .bd{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--brass);color:var(--navy);font-size:11px;font-weight:500;display:grid;place-items:center}
.o-nav .bd:empty{display:none}
.o-me{margin-top:auto;padding:22px 26px 0;border-top:1px solid rgba(244,239,229,.08);display:flex;align-items:center;gap:12px}
.o-av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--sand);color:var(--navy);font:400 12px/1 var(--mark);letter-spacing:.12em;padding-left:.12em;flex:none}
.o-me b{display:block;color:#F4EFE5;font-weight:400;font-size:14px}
.o-me div span{display:block;font-size:12px;margin-top:2px}
.o-by{padding:18px 26px 0;font:400 9.5px/1.5 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:rgba(244,239,229,.34)}

/* header */
.o-head{grid-column:2;grid-row:1;display:flex;align-items:center;gap:24px;padding:0 var(--pad);border-bottom:1px solid var(--line);background:var(--cream)}
.o-ttl{display:flex;align-items:baseline;gap:16px;min-width:0;overflow:hidden}
.o-ttl h1{margin:0;font:500 32px/1 var(--display);letter-spacing:-.01em;white-space:nowrap}
.o-ttl .lab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.o-hr{margin-left:auto;display:flex;align-items:center;gap:22px;flex:none}
.o-clk{text-align:right}
.o-clk span{display:block;font:400 10.5px/1 var(--mark);letter-spacing:.22em;text-transform:uppercase;color:var(--mute)}
.o-clk b{display:block;margin-top:6px;font:500 19px/1 var(--display)}
.o-new{flex:none;display:inline-flex;align-items:center;gap:9px;height:42px;padding:0 20px 0 16px;border-radius:21px;background:var(--navy);color:#F4EFE5;font-size:14px;transition:background .5s var(--ease)}
.o-new:hover{background:var(--navy3)}
.o-mini{display:none}

/* views */
.o-view{grid-column:2;grid-row:2;overflow:auto;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.o-pg{padding:38px var(--pad) 72px;max-width:1480px}
.o-sec{opacity:0;transform:translateY(14px)}
.enter .o-sec{animation:oIn 1s var(--ease) forwards;animation-delay:calc(var(--i,0)*.14s + .05s)}
.still .o-sec{opacity:1;transform:none}
@keyframes oIn{to{opacity:1;transform:none}}
.o-sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding-top:14px;border-top:1px solid var(--line2);margin-bottom:18px}
.o-sh .meta{font-size:13px;color:var(--mute)}
.o-card{background:var(--paper);border:1px solid var(--line);box-shadow:0 1px 1px rgba(19,40,77,.03),0 18px 40px -30px rgba(19,40,77,.35)}
.o-tag{display:inline-flex;align-items:center;gap:7px;height:24px;padding:0 10px;border-radius:12px;font-size:12px;letter-spacing:.01em;white-space:nowrap;background:var(--sand);color:var(--ink2)}
.o-tag i{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.o-tag.sale{background:rgba(194,154,91,.16);color:#86622B}
.o-tag.lease{background:rgba(19,40,77,.08);color:var(--navy)}
.o-tag.contract{background:rgba(126,94,66,.14);color:var(--saddle)}
.o-tag.sold,.o-tag.leased{background:transparent;color:var(--mute);box-shadow:inset 0 0 0 1px var(--line2)}
.o-tag.new{background:var(--navy);color:#F4EFE5}
.o-tag.replied{background:rgba(111,129,105,.16);color:#4A5B45}
.o-tag.booked{background:rgba(194,154,91,.16);color:#86622B}
.o-tag.closed{background:transparent;color:var(--mute);box-shadow:inset 0 0 0 1px var(--line2)}
.o-btn{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:9px;height:40px;padding:0 18px;border-radius:20px;font-size:14px;white-space:nowrap;box-shadow:inset 0 0 0 1px var(--line2);transition:background .45s var(--ease),box-shadow .45s var(--ease),color .45s var(--ease)}
.o-btn:hover{box-shadow:inset 0 0 0 1px var(--navy)}
.o-btn.pri{background:var(--navy);color:#F4EFE5;box-shadow:none}
.o-btn.pri:hover{background:var(--navy3)}
.o-btn.br{background:var(--brass);color:var(--navy);box-shadow:none}
.o-btn.br:hover{background:var(--brass2)}
.o-btn.q{box-shadow:none;padding:0 6px;color:var(--ink2)}
.o-btn.q:hover{color:var(--navy);box-shadow:none}
.o-seg{display:inline-flex;gap:24px;flex-wrap:wrap}
.o-seg button{font:400 11px/1 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute);padding:8px 0 7px;border-bottom:1px solid transparent;transition:color .45s var(--ease),border-color .45s var(--ease)}
.o-seg button:hover{color:var(--navy)}
.o-seg button[aria-pressed="true"]{color:var(--navy);border-bottom-color:currentColor}
.o-seg button b{font-weight:400;margin-left:6px;color:var(--brass)}
.o-empty{padding:28px 0;color:var(--mute);font:italic 500 17px/1.4 var(--display)}

/* today */
.o-hello{font:italic 500 clamp(30px,3.2vw,44px)/1.08 var(--display);letter-spacing:-.01em;margin:0 0 34px}
.o-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-bottom:44px}
.o-kpi{padding:22px 24px 22px;cursor:pointer;transition:transform .7s var(--ease),box-shadow .7s var(--ease)}
.o-kpi:hover{transform:translateY(-3px)}
.o-kpi .v{display:flex;align-items:baseline;gap:10px;margin-top:18px;font:500 44px/1 var(--display);letter-spacing:-.02em}
.o-kpi .v small{font:400 14px/1 var(--text);letter-spacing:0;color:var(--mute)}
.o-kpi p{margin:12px 0 0;font-size:13.5px;color:var(--ink2);min-height:1.45em}
.o-kpi .live{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--brass);margin-right:8px;vertical-align:1px;animation:oPulse 2.6s infinite}
@keyframes oPulse{0%,100%{box-shadow:0 0 0 0 rgba(194,154,91,.55)}60%{box-shadow:0 0 0 7px rgba(194,154,91,0)}}
.o-tg{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:40px;align-items:start}
.o-tl{position:relative;list-style:none;margin:0;padding:0}
.o-tl li{display:grid;grid-template-columns:76px 1fr;gap:18px;padding:13px 0;border-bottom:1px solid var(--line);cursor:pointer;transition:background .5s var(--ease)}
.o-tl li:hover{background:rgba(19,40,77,.025)}
.o-tl li.done{opacity:.5}
.o-tl li.nowl{border-bottom:0;padding:0;height:0;position:relative;cursor:default}
.o-tl li.nowl::after{content:"";position:absolute;left:84px;right:0;top:-1px;height:1px;background:var(--brass)}
.o-tl li.nowl span{position:absolute;left:0;top:-8px;font:400 10px/16px var(--mark);letter-spacing:.18em;color:var(--brass);text-transform:uppercase}
.o-tl time{font:500 17px/1.2 var(--display);padding-top:1px}
.o-tl b{display:block;font-weight:400;font-size:15px}
.o-tl span.s{display:block;margin-top:3px;font-size:13px;color:var(--mute)}
.o-tl .ty{display:flex;align-items:center;gap:8px}
.o-dot{width:8px;height:8px;border-radius:50%;flex:none}
.o-mini-list{list-style:none;margin:0;padding:0}
.o-mini-list li{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line);cursor:pointer}
.o-mini-list li b{font-weight:400;font-size:15px;display:block}
.o-mini-list li span{font-size:13px;color:var(--mute)}
.o-mini-list .r{font-size:12.5px;color:var(--mute);text-align:right}
.o-nd{width:8px;height:8px;border-radius:50%;background:var(--brass)}
.o-nd.off{background:transparent;box-shadow:inset 0 0 0 1px var(--line2)}
.o-board li{grid-template-columns:1fr auto}
.o-due{font-size:12.5px;color:var(--ink2)}
.o-due.soon{color:var(--warn)}
.o-stack>*+*{margin-top:40px}

/* calendar */
.o-calbar{display:flex;align-items:center;gap:14px;margin-bottom:24px;flex-wrap:wrap}
.o-calbar h2{margin:0 8px 0 4px;font:500 24px/1 var(--display);min-width:210px}
.o-ib{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1px var(--line2);transition:box-shadow .45s var(--ease)}
.o-ib:hover{box-shadow:inset 0 0 0 1px var(--navy)}
.o-leg{margin-left:auto;display:flex;gap:20px;flex-wrap:wrap;font-size:12.5px;color:var(--ink2)}
.o-leg span{display:inline-flex;align-items:center;gap:8px}
.o-cal{--hh:58px;display:grid;grid-template-columns:62px repeat(7,minmax(0,1fr));overflow:hidden}
.o-cal .dh{height:62px;padding:14px 12px 0;border-bottom:1px solid var(--line2);border-left:1px solid var(--line)}
.o-cal .dh:first-child{border-left:0}
.o-cal .dh span{display:block;font:400 10.5px/1 var(--mark);letter-spacing:.22em;text-transform:uppercase;color:var(--mute)}
.o-cal .dh b{display:block;margin-top:7px;font:500 20px/1 var(--display)}
.o-cal .dh.t span{color:var(--brass)}
.o-cal .dh.t b{color:var(--navy)}
.o-cal .hrs{position:relative}
.o-cal .hrs span{position:absolute;right:12px;transform:translateY(-8px);font-size:11.5px;color:var(--mute)}
.o-cal .col{position:relative;border-left:1px solid var(--line);background-image:linear-gradient(var(--line) 1px,transparent 1px);background-size:100% var(--hh);cursor:copy}
.o-cal .col.sun{background-color:rgba(19,40,77,.025)}
.o-cal .col.t{background-color:rgba(194,154,91,.05)}
.o-ev{position:absolute;left:3px;right:3px;padding:6px 9px 6px 11px;overflow:hidden;background:var(--paper);border-radius:2px;box-shadow:0 1px 1px rgba(19,40,77,.06),0 6px 16px -10px rgba(19,40,77,.4);cursor:pointer;transition:transform .45s var(--ease),box-shadow .45s var(--ease)}
.o-ev::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c)}
.o-ev:hover{transform:translateY(-1px);box-shadow:0 1px 1px rgba(19,40,77,.06),0 10px 22px -10px rgba(19,40,77,.5)}
.o-ev b{display:block;font-weight:400;font-size:12.5px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.o-ev span{display:block;font-size:11px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.o-ev.req{background:repeating-linear-gradient(135deg,rgba(194,154,91,.07) 0 6px,transparent 6px 12px),var(--paper);box-shadow:inset 0 0 0 1px var(--brass)}
.o-ev.done{opacity:.55}
.o-ev.cancelled{opacity:.4;text-decoration:line-through}
.o-ev.fresh{animation:oFresh 1.6s var(--ease)}
@keyframes oFresh{0%{transform:scale(.96);box-shadow:0 0 0 6px rgba(194,154,91,.35)}100%{transform:none}}
.o-now{position:absolute;left:0;right:0;height:1px;background:var(--brass);z-index:2;pointer-events:none}
.o-now::before{content:"";position:absolute;left:-4px;top:-4px;width:9px;height:9px;border-radius:50%;background:var(--brass)}
.o-daypick{display:none}

/* inbox */
.o-ibx{display:grid;grid-template-columns:minmax(280px,380px) minmax(0,1fr);min-height:calc(100% - 0px);border-top:1px solid var(--line2)}
.o-list{border-right:1px solid var(--line);min-width:0}
.o-list .o-seg{padding:18px 0 14px}
.o-iq{display:grid;grid-template-columns:12px 1fr auto;gap:12px;align-items:start;padding:16px 20px 16px 0;border-bottom:1px solid var(--line);cursor:pointer;transition:background .5s var(--ease)}
.o-iq:hover{background:rgba(19,40,77,.025)}
.o-iq.on{background:var(--paper)}
.o-iq .o-nd{margin-top:7px}
.o-iq b{display:block;font-weight:400;font-size:15px}
.o-iq.unread b{font-weight:500}
.o-iq span{display:block;font-size:13px;color:var(--ink2);margin-top:2px}
.o-iq p{margin:6px 0 0;font-size:13px;color:var(--mute);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.o-iq time{font-size:12px;color:var(--mute);white-space:nowrap}
.o-iq.fresh{animation:oSlide 1.2s var(--ease)}
@keyframes oSlide{from{opacity:0;transform:translateY(-10px);background:rgba(194,154,91,.18)}}
.o-det{padding:28px 0 40px 40px;min-width:0}
.o-dh{display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap}
.o-dh .o-av{width:52px;height:52px;font-size:14px;background:var(--navy);color:#F4EFE5}
.o-dh h2{margin:2px 0 0;font:500 30px/1.05 var(--display);letter-spacing:-.01em}
.o-dh p{margin:8px 0 0;font-size:13.5px;color:var(--ink2)}
.o-dh .acts{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap}
.o-ans{display:grid;grid-template-columns:150px 1fr;margin:30px 0 0;border-top:1px solid var(--line2)}
.o-ans dt,.o-ans dd{margin:0;padding:12px 0;border-bottom:1px solid var(--line)}
.o-ans dt{font:400 10.5px/1.7 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute);padding-top:14px}
.o-ans dd{font-size:15px}
.o-thr{margin-top:34px}
.o-msg{max-width:620px;margin-top:14px;padding:16px 20px;background:var(--paper);border:1px solid var(--line)}
.o-msg.me{margin-left:auto;background:var(--navy);color:#F4EFE5;border-color:var(--navy)}
.o-msg .lab{display:block;margin-bottom:9px}
.o-msg.me .lab{color:var(--brass2)}
.o-msg p{margin:0;font-size:14.5px;line-height:1.55}
.o-cmp{margin-top:24px;padding:18px 20px;background:var(--paper);border:1px solid var(--line2)}
.o-cmp textarea{width:100%;min-height:118px;border:0;background:transparent;resize:vertical;font-size:15px;line-height:1.55;outline:none}
.o-cmp .row{display:flex;justify-content:flex-end;gap:10px;margin-top:10px}
.o-back{display:none}

/* horses */
.o-hbar{display:flex;align-items:center;gap:20px;margin-bottom:26px;flex-wrap:wrap}
.o-hbar .o-btn{margin-left:auto}
.o-hg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.o-hc .ft.rec{font:400 10.5px/1.5 var(--mark);letter-spacing:.18em;text-transform:uppercase;color:var(--brass);justify-content:flex-start}
.o-hc{display:flex;flex-direction:column;overflow:hidden;cursor:pointer;transition:transform .8s var(--ease),box-shadow .8s var(--ease),opacity .6s var(--ease)}
.o-hc:hover{transform:translateY(-4px)}
.o-hc .ph{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--sand)}
.o-hc .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease),filter .8s var(--ease)}
.o-hc:hover .ph img{transform:scale(1.04)}
.o-hc.gone .ph img{filter:grayscale(1) contrast(.9) brightness(1.05)}
.o-hc .ph .o-tag{position:absolute;left:14px;top:14px;background:rgba(251,248,242,.94)}
.o-hc .ph .o-tag.sold,.o-hc .ph .o-tag.leased{background:rgba(251,248,242,.94);box-shadow:none}
.o-hc .bd{padding:18px 20px 16px;display:flex;flex-direction:column;flex:1}
.o-hc h3{margin:0;font:500 26px/1 var(--display);letter-spacing:-.01em}
.o-hc .sp{margin-top:8px;font-size:13px;color:var(--mute)}
.o-hc .ft{margin-top:auto;padding-top:16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.o-sw{display:inline-flex;align-items:center;gap:10px;font-size:12.5px;color:var(--ink2);cursor:pointer;user-select:none}
.o-sw i{position:relative;width:34px;height:20px;border-radius:10px;background:var(--sand2);transition:background .45s var(--ease);flex:none}
.o-sw i::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(19,40,77,.3);transition:transform .45s var(--ease)}
.o-sw[aria-checked="true"] i{background:var(--navy)}
.o-sw[aria-checked="true"] i::after{transform:translateX(14px)}
.o-hc .ft .q{font-size:12.5px;color:var(--ink2);border-bottom:1px solid var(--line2);padding-bottom:1px}
.o-hc .ft .q:hover{color:var(--navy);border-color:var(--navy)}

/* shows */
.o-yr{position:relative;margin-bottom:40px;padding:26px 28px 24px}
.o-yr .m{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));font:400 10.5px/1 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute)}
.o-yr .tr{position:relative;height:46px;margin-top:14px;border-top:1px solid var(--line2)}
.o-yr .tr i{position:absolute;top:12px;height:22px;border-radius:11px;background:var(--navy);cursor:pointer;transition:background .45s var(--ease)}
.o-yr .tr i.past{background:var(--sand2)}
.o-yr .tr i.on{background:var(--brass)}
.o-yr .tr .td{position:absolute;top:-6px;bottom:0;width:1px;background:var(--brass)}
.o-yr .tr .td::before{content:"";position:absolute;left:-4px;top:-4px;width:9px;height:9px;border-radius:50%;background:var(--brass)}
.o-sg{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:40px;align-items:start}
.o-sl{list-style:none;margin:0;padding:0}
.o-sl li{padding:16px 0 16px 18px;border-bottom:1px solid var(--line);cursor:pointer;position:relative;transition:background .5s var(--ease)}
.o-sl li::before{content:"";position:absolute;left:0;top:16px;bottom:16px;width:2px;background:var(--brass);transform:scaleY(0);transition:transform .6s var(--ease)}
.o-sl li.on::before{transform:none}
.o-sl li:hover{background:rgba(19,40,77,.025)}
.o-sl b{display:block;font:500 19px/1.15 var(--display)}
.o-sl span{display:block;margin-top:4px;font-size:13px;color:var(--mute)}
.o-sl .lab{margin-bottom:8px;display:block}
.o-sd{padding:28px 30px 30px}
.o-sd h2{margin:10px 0 0;font:500 34px/1.05 var(--display);letter-spacing:-.01em}
.o-sd .sub{margin-top:8px;font-size:14px;color:var(--ink2)}
.o-tb{width:100%;border-collapse:collapse;margin-top:6px}
.o-tb th{text-align:left;font:400 10.5px/1 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute);padding:12px 12px 12px 0;border-bottom:1px solid var(--line2);font-weight:400}
.o-tb td{padding:13px 12px 13px 0;border-bottom:1px solid var(--line);font-size:14.5px;vertical-align:middle}
.o-tb td.r,.o-tb th.r{text-align:right;padding-right:0}
.o-tb td .o-rib{vertical-align:-6px;margin-right:8px}
.o-tb tr.fresh td{animation:oSlide 1.2s var(--ease)}
.o-add{display:grid;grid-template-columns:1fr 1fr 1.4fr auto auto;gap:10px;margin-top:14px;align-items:end}
.o-pub{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:28px;padding:16px 18px;background:var(--cream);border:1px solid var(--line)}
.o-pub p{margin:0;font-size:13.5px;color:var(--ink2)}

/* clients */
.o-cbar{display:flex;align-items:center;gap:20px;margin-bottom:22px;flex-wrap:wrap}
.o-srch{position:relative;margin-left:auto}
.o-srch svg{position:absolute;left:14px;top:11px;color:var(--mute)}
.o-srch input{height:40px;width:240px;border-radius:20px;border:0;box-shadow:inset 0 0 0 1px var(--line2);background:var(--paper);padding:0 16px 0 40px;outline:none}
.o-srch input:focus{box-shadow:inset 0 0 0 1px var(--navy)}
.o-ct tr{cursor:pointer;transition:background .5s var(--ease)}
.o-ct tbody tr:hover{background:rgba(19,40,77,.025)}
.o-ct .nm{display:flex;align-items:center;gap:12px}
.o-ct .nm .o-av{width:32px;height:32px;font-size:11px}
.o-ct .nm b{font-weight:400}
.o-ct small{display:block;font-size:12px;color:var(--mute)}

/* fields */
.o-f{display:grid;gap:7px}
.o-f>span{font:400 10.5px/1 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute)}
.o-f input,.o-f select,.o-f textarea{height:42px;border:0;border-radius:2px;box-shadow:inset 0 0 0 1px var(--line2);background:#FFFDF9;padding:0 12px;outline:none;font-size:14.5px;transition:box-shadow .4s var(--ease)}
.o-f textarea{height:auto;min-height:96px;padding:10px 12px;line-height:1.5;resize:vertical}
.o-f input:focus,.o-f select:focus,.o-f textarea:focus{box-shadow:inset 0 0 0 1px var(--navy)}
.o-f select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--ink2) 50%),linear-gradient(135deg,var(--ink2) 50%,transparent 50%);background-position:calc(100% - 17px) 18px,calc(100% - 12px) 18px;background-size:5px 5px;background-repeat:no-repeat;padding-right:30px}
.o-fg{display:grid;grid-template-columns:1fr 1fr;gap:16px 16px}
.o-fg .w{grid-column:1/-1}
.o-chips{display:flex;flex-wrap:wrap;gap:8px}
.o-chips button{height:34px;padding:0 14px;border-radius:17px;box-shadow:inset 0 0 0 1px var(--line2);font-size:13px;transition:background .4s var(--ease),color .4s var(--ease),box-shadow .4s var(--ease)}
.o-chips button[aria-pressed="true"]{background:var(--navy);color:#F4EFE5;box-shadow:none}
.o-pix{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.o-pix button{aspect-ratio:1;overflow:hidden;border-radius:2px;position:relative;box-shadow:inset 0 0 0 1px var(--line)}
.o-pix img{width:100%;height:100%;object-fit:cover;display:block}
.o-pix button[aria-pressed="true"]{box-shadow:0 0 0 2px var(--brass)}

/* drawer */
.o-scrim{position:absolute;inset:0;background:rgba(19,40,77,.22);opacity:0;visibility:hidden;transition:opacity .6s var(--ease),visibility 0s linear .6s;z-index:20}
.o-dr{position:absolute;top:0;right:0;bottom:0;width:min(460px,100%);background:var(--cream);z-index:21;display:flex;flex-direction:column;transform:translateX(102%);transition:transform .75s var(--ease),visibility 0s linear .75s;visibility:hidden}
.dr-on .o-scrim{opacity:1;visibility:visible;transition:opacity .6s var(--ease)}
.dr-on .o-dr{transform:none;visibility:visible;transition:transform .75s var(--ease);box-shadow:-30px 0 60px -40px rgba(19,40,77,.5)}
.o-drh{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:28px 30px 20px;border-bottom:1px solid var(--line)}
.o-drh h3{margin:10px 0 0;font:500 28px/1.05 var(--display);letter-spacing:-.01em}
.o-drb{flex:1;overflow:auto;padding:24px 30px 30px}
.o-drf{display:flex;gap:10px;justify-content:flex-end;padding:18px 30px;border-top:1px solid var(--line);flex-wrap:wrap}
.o-drf .sp{margin-right:auto}
.o-kv{display:grid;grid-template-columns:130px 1fr;border-top:1px solid var(--line2)}
.o-kv dt,.o-kv dd{margin:0;padding:11px 0;border-bottom:1px solid var(--line)}
.o-kv dt{font:400 10.5px/1.8 var(--mark);letter-spacing:.2em;text-transform:uppercase;color:var(--mute)}
.o-inv{list-style:none;margin:12px 0 0;padding:0}
.o-inv li{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:14.5px}
.o-inv li.t{border-bottom:0;font:500 20px/1 var(--display);padding-top:16px}

/* toast */
.o-toast{position:absolute;right:28px;top:104px;z-index:30;display:flex;align-items:center;gap:14px;max-width:min(380px,calc(100% - 32px));padding:14px 18px 14px 16px;background:var(--navy);color:#F4EFE5;box-shadow:0 20px 40px -20px rgba(19,40,77,.7);transform:translateY(-12px);opacity:0;visibility:hidden;transition:opacity .6s var(--ease),transform .6s var(--ease),visibility 0s linear .6s;cursor:pointer}
.o-toast.on{opacity:1;transform:none;visibility:visible;transition:opacity .6s var(--ease),transform .6s var(--ease)}
.o-toast .o-nd{flex:none;animation:oPulse 2.6s infinite}
.o-toast b{display:block;font-weight:400;font-size:14px}
.o-toast span{display:block;font-size:12.5px;color:rgba(244,239,229,.7);margin-top:2px}

/* phone */
.o-tabbar{display:none}
@media (max-width:1180px){.ho{--pad:32px}.o-hg{grid-template-columns:repeat(2,minmax(0,1fr))}.o-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.o-tg{grid-template-columns:1fr}.o-sg{grid-template-columns:1fr}}
@media (max-width:860px){
  .ho{--pad:18px;grid-template-columns:minmax(0,1fr);grid-template-rows:64px minmax(0,1fr) calc(64px + env(safe-area-inset-bottom,0px))}
  .o-brand,.o-rail{display:none}
  .o-head{grid-column:1;padding:0 var(--pad);gap:12px}
  .o-mini{display:block;width:32px;height:32px;flex:none}
  .o-ttl h1{font-size:24px}
  .o-ttl .lab{display:none}
  .o-clk{display:none}
  .o-new{height:38px;padding:0 14px 0 12px;font-size:13px}
  .o-view{grid-column:1}
  .o-pg{padding:24px var(--pad) 40px}
  .o-hello{font-size:28px;margin-bottom:24px}
  .o-kpis{gap:12px;margin-bottom:32px}
  .o-kpi{padding:16px 16px}
  .o-kpi .v{font-size:34px;margin-top:12px}
  .o-kpi p{font-size:12.5px}
  .o-tabbar{grid-column:1;grid-row:3;display:grid;grid-template-columns:repeat(6,1fr);background:var(--navy);padding-bottom:env(safe-area-inset-bottom,0px)}
  .o-tabbar button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:10px;letter-spacing:.04em;color:rgba(244,239,229,.55)}
  .o-tabbar button.on{color:#F4EFE5}
  .o-tabbar button.on::before{content:"";position:absolute;top:0;left:30%;right:30%;height:2px;background:var(--brass)}
  .o-tabbar .bd{position:absolute;top:9px;left:calc(50% + 6px);width:8px;height:8px;border-radius:50%;background:var(--brass)}
  .o-tabbar .bd[hidden]{display:none}
  .o-cal{grid-template-columns:52px minmax(0,1fr)}
  .o-cal .dh,.o-cal .col:not(.sel){display:none}
  .o-daypick{display:flex;gap:6px;margin-bottom:16px;overflow:auto}
  .o-daypick button{flex:1;min-width:44px;padding:9px 0;border-radius:2px;text-align:center;box-shadow:inset 0 0 0 1px var(--line)}
  .o-daypick button span{display:block;font:400 9.5px/1 var(--mark);letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}
  .o-daypick button b{display:block;margin-top:5px;font:500 17px/1 var(--display)}
  .o-daypick button[aria-pressed="true"]{background:var(--navy);color:#F4EFE5;box-shadow:none}
  .o-daypick button[aria-pressed="true"] span{color:var(--brass2)}
  .o-calbar h2{min-width:0;font-size:20px}
  .o-leg{display:none}
  .o-ibx{grid-template-columns:minmax(0,1fr);border-top:0}
  .o-ibx .o-det{display:none;padding:8px 0 30px}
  .o-ibx.det .o-list{display:none}
  .o-ibx.det .o-det{display:block}
  .o-back{display:inline-flex;margin-bottom:18px}
  .o-dh .acts{margin-left:0;width:100%}
  .o-ans{grid-template-columns:110px 1fr}
  .o-hg{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}
  .o-hbar .o-seg{flex-wrap:nowrap;overflow-x:auto;max-width:100%;gap:22px;scrollbar-width:none;-webkit-mask:linear-gradient(90deg,#000 85%,transparent)}.o-hbar .o-seg::-webkit-scrollbar{display:none}.o-hbar .o-seg button{white-space:nowrap;flex:none}.o-hbar .o-seg button:last-child{margin-right:28px}
  .o-hc h3{font-size:21px}
  .o-hc .bd{padding:14px 14px 12px}
  .o-hc .ft{flex-direction:column;align-items:flex-start;gap:10px}
  .o-hbar .o-btn{margin-left:0}
  .o-sd{padding:20px 18px}
  .o-add{grid-template-columns:1fr 1fr}
  .o-srch{margin-left:0;width:100%}.o-srch input{width:100%}
  .ho .hide{display:none}
  .o-yr{padding:18px 16px}
  .o-yr .m{font-size:8.5px;letter-spacing:.08em}
  .o-dr{top:auto;height:92%;width:100%;transform:translateY(102%);border-radius:14px 14px 0 0}
  .o-drh,.o-drb,.o-drf{padding-left:20px;padding-right:20px}
  .o-toast{top:76px;right:16px}
}
@media (prefers-reduced-motion:reduce){.ho *{animation:none!important;transition:none!important}.o-sec{opacity:1;transform:none}}
`;

  function injectAssets() {
    if (!document.getElementById('ho-css')) { var s = document.createElement('style'); s.id = 'ho-css'; s.textContent = CSS; document.head.appendChild(s); }
    if (!document.querySelector('link[data-ho-fonts]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-ho-fonts', '');
      l.href = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,500&family=Josefin+Sans:wght@300;400&family=Jost:wght@400;500&display=swap';
      document.head.appendChild(l);
    }
  }

  /* ---------- mount ---------- */
  function mount(el, opts) {
    opts = opts || {};
    injectAssets();
    var IMG = opts.images || 'site/images/';

    /* the demo clock: real time while the barn is open, otherwise a working afternoon */
    var real = new Date(), rh = real.getHours() + real.getMinutes() / 60, OFF = 0;
    if (rh < 7 || rh >= 19.5 || real.getDay() === 0) { var t = new Date(real); if (real.getDay() === 0) t.setDate(t.getDate() + 1); t.setHours(14, 12, 0, 0); OFF = t - real; }
    function now() { return new Date(Date.now() + OFF); }

    var S = null;
    function revive(st) {
      ['events'].forEach(function () { st.events.forEach(function (e) { e.start = new Date(e.start); }); });
      st.inbox.forEach(function (q) { q.at = new Date(q.at); (q.thread || []).forEach(function (m) { m.at = new Date(m.at); }); });
      st.shows.forEach(function (s) { s.start = new Date(s.start); });
      return st;
    }
    function load() {
      var st = null;
      try { if (location.hash === '#reset') { localStorage.removeItem('hh.office.v1'); localStorage.removeItem('hh.inq.v1'); history.replaceState(null, '', location.pathname); } } catch (e) {}
      var raw = ST && ST.state();
      if (raw && raw.v === 2 && raw.events && +monday(now()) <= raw.seeded + 7 * 864e5 && raw.seeded <= +now()) st = revive(raw);
      if (!st) st = seed(now());
      return st;
    }
    S = load();
    function save() { if (ST) ST.save(S); }

    var timers = [], dead = false;
    var V = { tab: opts.tab || 'today', week: monday(now()), day: now().getDay(), iq: null, iqf: 'all', hf: 'all', show: null, cf: 'all', q: '' };
    var nextShow = S.shows.filter(function (s) { return +s.start + s.days * 864e5 > +now(); }).sort(function (a, b) { return a.start - b.start; })[0];
    V.show = nextShow ? nextShow.id : S.shows[0].id;

    /* ---------- shell ---------- */
    var root = document.createElement('div');
    root.className = 'ho';
    var TABS = [['today', 'Today'], ['calendar', 'Calendar'], ['inbox', 'Inquiries'], ['horses', 'Horses'], ['shows', 'Shows'], ['clients', 'Clients']];
    root.innerHTML =
      '<div class="o-brand">' + ROUNDEL + '<div class="o-wm"><b>Harris Hill</b><span>The barn office</span></div></div>' +
      '<aside class="o-rail"><nav class="o-nav" aria-label="Barn office">' + TABS.map(function (t) {
        return '<button data-tab="' + t[0] + '">' + icon(t[0]) + '<span>' + t[1] + '</span>' + (t[0] === 'inbox' ? '<b class="bd"></b>' : '') + '</button>';
      }).join('') + '</nav>' +
      '<div class="o-me"><span class="o-av">JB</span><div><b>Jennifer Bliss</b><span>Trainer</span></div></div>' +
      '<div class="o-by">Concept by<br>Abrams Design Studio</div></aside>' +
      '<header class="o-head">' + ROUNDEL.replace('class="o-rd"', 'class="o-rd o-mini"') + '<div class="o-ttl"><h1></h1><span class="lab"></span></div>' +
      '<div class="o-hr"><div class="o-clk"><span data-clk="d"></span><b data-clk="t"></b></div><button class="o-new" data-new>' + icon('plus', 16) + 'New</button></div></header>' +
      '<main class="o-view"></main>' +
      '<nav class="o-tabbar" aria-label="Barn office">' + TABS.map(function (t) { return '<button data-tab="' + t[0] + '">' + icon(t[0], 20) + t[1] + (t[0] === 'inbox' ? '<i class="bd" hidden></i>' : '') + '</button>'; }).join('') + '</nav>' +
      '<div class="o-scrim"></div><aside class="o-dr" aria-hidden="true"></aside>' +
      '<div class="o-toast" role="status"></div>';
    el.innerHTML = '';
    el.appendChild(root);
    var view = root.querySelector('.o-view'), dr = root.querySelector('.o-dr'), toastEl = root.querySelector('.o-toast');
    var $ = function (s, r) { return (r || root).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || root).querySelectorAll(s)); };

    function tick() {
      var d = now();
      $$('[data-clk="d"]').forEach(function (e) { e.textContent = DAYL[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); });
      $$('[data-clk="t"]').forEach(function (e) { e.textContent = tm(d); });
      var nl = $('.o-now'); if (nl) placeNow(nl);
    }
    timers.push(setInterval(tick, 15000));

    function badges() {
      var n = S.inbox.filter(function (q) { return q.status === 'new'; }).length;
      $$('.o-nav .bd').forEach(function (b) { b.textContent = n || ''; });
      $$('.o-tabbar .bd').forEach(function (b) { b.hidden = !n; });
    }

    /* ---------- pages ---------- */
    function sec(i, html, cls) { return '<section class="o-sec ' + (cls || '') + '" style="--i:' + i + '">' + html + '</section>'; }
    function sh(lab, meta) { return '<div class="o-sh"><span class="lab">' + lab + '</span>' + (meta ? '<span class="meta">' + meta + '</span>' : '') + '</div>'; }
    function evOn(day) { return S.events.filter(function (e) { return sameDay(e.start, day) && e.status !== 'cancelled'; }).sort(function (a, b) { return a.start - b.start; }); }
    function evLine(e) { var t = TYPES[e.type]; return '<span class="ty"><i class="o-dot" style="background:' + t.c + '"></i>' + t.l + (e.horse && e.type !== 'training' ? ' · ' + esc(e.horse) : '') + (e.ring ? ' · ' + esc(e.ring) : '') + '</span>'; }

    function pageToday() {
      var n = now(), h = n.getHours();
      var hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      var tod = evOn(n), rides = tod.filter(function (e) { return e.type === 'lesson' || e.type === 'viewing'; });
      var next = rides.filter(function (e) { return e.start > n; })[0];
      var nw = S.inbox.filter(function (q) { return q.status === 'new'; }).sort(function (a, b) { return b.at - a.at; });
      var hs = S.horses.filter(function (x) { return x.site && (x.status === 'sale' || x.status === 'lease'); });
      var up = S.shows.filter(function (s) { return s.start > n; }).sort(function (a, b) { return a.start - b.start; })[0];
      var days = up ? Math.ceil((d0(up.start) - d0(n)) / 864e5) : 0;
      var tl = '', placed = false;
      tod.forEach(function (e) {
        if (!placed && e.start > n) { tl += '<li class="nowl" aria-hidden="true"><span>' + tms(n) + '</span></li>'; placed = true; }
        var past = +e.start + e.mins * 6e4 < +n;
        tl += '<li class="' + (past ? 'done' : '') + '" data-ev="' + e.id + '"><time>' + tms(e.start) + '</time><div><b>' + esc(e.type === 'training' ? e.horse + ', schooled by Jennifer' : e.type === 'care' ? e.title + ' · ' + e.horse : e.title) + '</b><span class="s">' + evLine(e) + '</span></div></li>';
      });
      if (!placed && tod.length) tl += '<li class="nowl" aria-hidden="true"><span>' + tms(n) + '</span></li>';
      var board = [];
      S.clients.forEach(function (c) {
        if (!c.care) return;
        c.horses.forEach(function (hn) {
          if (c.care.farrier <= 10) board.push({ n: hn, w: 'Farrier', d: c.care.farrier, c: c.id });
          if (c.care.vet <= 14) board.push({ n: hn, w: hn === 'Sonnet' ? 'Vet, hock check' : 'Vaccines', d: c.care.vet, c: c.id });
        });
      });
      board.sort(function (a, b) { return a.d - b.d; });
      return '<div class="o-pg">' +
        sec(0, '<h2 class="o-hello">' + hi + ', <em>Jennifer.</em></h2>') +
        sec(1, '<div class="o-kpis">' +
          '<div class="o-card o-kpi" data-go="calendar"><span class="lab">Rides today</span><div class="v">' + rides.length + '<small>' + (tod.length - rides.length) + ' schooling and care</small></div><p>' + (next ? 'Next, ' + esc(next.title) + ' at ' + tm(next.start) : 'All done for today') + '</p></div>' +
          '<div class="o-card o-kpi" data-go="inbox"><span class="lab">New inquiries</span><div class="v">' + nw.length + '<small>from the site</small></div><p>' + (nw[0] ? '<i class="live"></i>' + esc(nw[0].name) + ', ' + esc(IQT[nw[0].type] || '').toLowerCase() : 'Inbox clear') + '</p></div>' +
          '<div class="o-card o-kpi" data-go="horses"><span class="lab">On the site</span><div class="v">' + hs.length + '<small>horses</small></div><p>' + hs.filter(function (x) { return x.status === 'sale'; }).length + ' for sale, ' + hs.filter(function (x) { return x.status === 'lease'; }).length + ' for lease</p></div>' +
          '<div class="o-card o-kpi" data-go="shows"><span class="lab">Next show</span><div class="v">' + (up ? days : '—') + '<small>' + (up ? (days === 1 ? 'day' : 'days') : '') + '</small></div><p>' + (up ? esc(up.venue) + ', ' + esc(up.name) + ' · ' + up.entries.length + ' entries' : 'Season complete') + '</p></div>' +
          '</div>') +
        '<div class="o-tg"><div>' + sec(2, sh('In the ring today', DAYL[n.getDay()] + ', ' + md(n)) + (tod.length ? '<ol class="o-tl">' + tl + '</ol>' : '<p class="o-empty">A quiet day at the barn.</p>')) + '</div>' +
        '<div class="o-stack">' +
        sec(3, sh('Inquiries', '<button class="o-btn q" data-go="inbox">Open inbox</button>') + '<ul class="o-mini-list">' + S.inbox.slice().sort(function (a, b) { return b.at - a.at; }).slice(0, 4).map(function (q) {
          return '<li data-iq="' + q.id + '"><i class="o-nd' + (q.status === 'new' ? '' : ' off') + '"></i><div><b>' + esc(q.name) + '</b><span>' + esc(IQT[q.type] || '') + (q.horse ? ', ' + esc(q.horse) : '') + '</span></div><span class="r">' + ago(q.at, n) + '</span></li>';
        }).join('') + '</ul>') +
        sec(4, sh('Barn board', 'Due in the next two weeks') + (board.length ? '<ul class="o-mini-list o-board">' + board.slice(0, 5).map(function (b) {
          return '<li data-cl="' + b.c + '"><div><b>' + esc(b.n) + '</b><span>' + esc(b.w) + '</span></div><span class="o-due' + (b.d <= 3 ? ' soon' : '') + '">' + (b.d <= 0 ? 'Today' : b.d === 1 ? 'Tomorrow' : 'In ' + b.d + ' days') + '</span></li>';
        }).join('') + '</ul>' : '<p class="o-empty">Nothing due.</p>')) +
        '</div></div></div>';
    }

    var H0 = 7, H1 = 19;
    function pageCalendar() {
      var W = V.week, n = now(), cols = '', heads = '<div class="dh hz"></div>', hrs = '';
      for (var h = H0; h <= H1; h++) hrs += '<span style="top:calc(' + (h - H0) + ' * var(--hh))">' + (h === H0 ? '' : (h % 12 || 12) + (h < 12 ? ' am' : ' pm')) + '</span>';
      var pick = '';
      for (var i = 0; i < 7; i++) {
        var day = addD(W, i), t = sameDay(day, n), sel = day.getDay() === V.day;
        heads += '<div class="dh' + (t ? ' t' : '') + (sel ? ' sel' : '') + '"><span>' + DAYS[day.getDay()] + '</span><b>' + day.getDate() + '</b></div>';
        pick += '<button data-pick="' + day.getDay() + '" aria-pressed="' + sel + '"><span>' + DAYS[day.getDay()] + '</span><b>' + day.getDate() + '</b></button>';
        var evs = S.events.filter(function (e) { return sameDay(e.start, day); });
        cols += '<div class="col' + (t ? ' t' : '') + (day.getDay() === 0 ? ' sun' : '') + (sel ? ' sel' : '') + '" data-day="' + (+day) + '" style="height:calc(' + (H1 - H0) + ' * var(--hh))">' +
          evs.map(function (e) {
            var s = e.start.getHours() + e.start.getMinutes() / 60 - H0;
            var cls = e.status === 'requested' ? ' req' : e.status === 'done' ? ' done' : e.status === 'cancelled' ? ' cancelled' : '';
            return '<div class="o-ev' + cls + (e.fresh ? ' fresh' : '') + '" data-ev="' + e.id + '" style="--c:' + TYPES[e.type].c + ';top:calc(' + s + ' * var(--hh) + 2px);height:calc(' + (e.mins / 60) + ' * var(--hh) - 4px)"><b>' + esc(e.type === 'training' ? e.horse : e.title) + '</b><span>' + tms(e.start) + (e.mins >= 55 ? ' · ' + esc(e.type === 'lesson' ? e.horse : TYPES[e.type].l) : '') + '</span></div>';
          }).join('') + (t ? '<i class="o-now"></i>' : '') + '</div>';
      }
      S.events.forEach(function (e) { delete e.fresh; });
      var end = addD(W, 6);
      var rng = MON[W.getMonth()] + ' ' + W.getDate() + ' – ' + (end.getMonth() !== W.getMonth() ? MON[end.getMonth()] + ' ' : '') + end.getDate();
      return '<div class="o-pg">' +
        sec(0, '<div class="o-calbar"><button class="o-ib" data-wk="-1" aria-label="Previous week">' + icon('left') + '</button><button class="o-ib" data-wk="1" aria-label="Next week">' + icon('right') + '</button><h2>' + rng + '</h2>' +
          '<button class="o-btn" data-wk="0">This week</button><div class="o-leg">' + Object.keys(TYPES).map(function (k) { return '<span><i class="o-dot" style="background:' + TYPES[k].c + '"></i>' + TYPES[k].l + '</span>'; }).join('') + '<span><i class="o-dot" style="box-shadow:inset 0 0 0 1px var(--brass)"></i>Requested</span></div></div>' +
          '<div class="o-daypick">' + pick + '</div>') +
        sec(1, '<div class="o-card o-cal">' + heads + '<div class="hrs" style="height:calc(' + (H1 - H0) + ' * var(--hh))">' + hrs + '</div>' + cols + '</div>') +
        '</div>';
    }
    function placeNow(nl) {
      var n = now(), s = n.getHours() + n.getMinutes() / 60 - H0;
      if (s < 0 || s > H1 - H0) { nl.style.display = 'none'; return; }
      nl.style.display = ''; nl.style.top = 'calc(' + s.toFixed(3) + ' * var(--hh))';
    }

    function iqPreview(q) { var f = (q.fields || []).filter(function (x) { return x[0] === 'Note' || x[0] === 'Goals'; })[0]; return f ? f[1] : (q.fields || []).slice(1, 3).map(function (x) { return x[1]; }).join(' · '); }
    function pageInbox() {
      var n = now(), F = V.iqf;
      var list = S.inbox.slice().sort(function (a, b) { return b.at - a.at; }).filter(function (q) { return F === 'all' || (F === 'new' ? q.status === 'new' : F === 'booked' ? q.status === 'booked' : q.status === 'replied' || q.status === 'closed'); });
      if (!V.iq || !S.inbox.some(function (q) { return q.id === V.iq; })) V.iq = (list[0] || S.inbox[0] || {}).id;
      var q = S.inbox.filter(function (x) { return x.id === V.iq; })[0];
      var cnt = function (f) { return S.inbox.filter(function (q) { return f(q); }).length; };
      var segs = [['all', 'All', cnt(function () { return true; })], ['new', 'New', cnt(function (q) { return q.status === 'new'; })], ['booked', 'Booked', cnt(function (q) { return q.status === 'booked'; })], ['done', 'Replied', cnt(function (q) { return q.status === 'replied' || q.status === 'closed'; })]];
      var items = list.map(function (x) {
        return '<div class="o-iq' + (x.id === V.iq ? ' on' : '') + (x.status === 'new' && !x.read ? ' unread' : '') + (x.fresh ? ' fresh' : '') + '" data-iq="' + x.id + '"><i class="o-nd' + (x.status === 'new' ? '' : ' off') + '"></i><div><b>' + esc(x.name) + '</b><span>' + esc(IQT[x.type] || '') + (x.horse ? ', ' + esc(x.horse) : '') + '</span><p>' + esc(iqPreview(x)) + '</p></div><time>' + ago(x.at, n) + '</time></div>';
      }).join('') || '<p class="o-empty">Nothing here.</p>';
      S.inbox.forEach(function (x) { delete x.fresh; });
      var det = '';
      if (q) {
        var booked = S.events.filter(function (e) { return e.iq === q.id && e.status !== 'cancelled'; })[0];
        det = '<button class="o-btn q o-back" data-iqback>' + icon('left', 16) + 'Inquiries</button>' +
          '<div class="o-dh"><span class="o-av">' + initials(q.name) + '</span><div><span class="o-tag ' + q.status + '">' + { new: 'New', replied: 'Replied', booked: 'Booked', closed: 'Closed' }[q.status] + '</span><h2>' + esc(q.name) + '</h2><p>' + esc(IQT[q.type] || '') + (q.horse ? ', ' + esc(q.horse) : '') + ' · ' + wd(q.at) + ', ' + tm(q.at) + ' · From the site</p></div>' +
          '<div class="acts">' + (q.type !== 'boarding' ? '<button class="o-btn pri" data-book="' + q.id + '">' + icon('calendar', 16) + (booked ? 'Booked ' + DAYS[booked.start.getDay()] + ' ' + tm(booked.start) : 'Book a time') + '</button>' : '<button class="o-btn pri" data-client="' + q.id + '">' + icon('clients', 16) + 'Add to clients</button>') +
          '<button class="o-btn" data-reply="' + q.id + '">' + icon('reply', 16) + 'Reply</button>' + (q.status !== 'closed' ? '<button class="o-btn q" data-close="' + q.id + '">Close</button>' : '') + '</div></div>' +
          '<dl class="o-ans">' + [['Contact', q.contact], ['Rider', q.rider]].concat(q.fields.filter(function (f) { return f[0] !== 'For' && f[0] !== 'Contact' && f[0] !== 'Rider' && f[0] !== 'Name'; })).filter(function (f) { return f[1]; }).map(function (f) { return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>' +
          '<div class="o-thr">' + (q.thread || []).map(function (m) { return '<div class="o-msg me"><span class="lab">' + esc(m.who) + ' · ' + wd(m.at) + '</span><p>' + esc(m.text) + '</p></div>'; }).join('') +
          (V.compose === q.id ? '<div class="o-cmp"><span class="lab">Reply to ' + esc(first(q.name)) + '</span><textarea data-cmp>' + esc(draftFor(q)) + '</textarea><div class="row"><button class="o-btn q" data-cmpx>Discard</button><button class="o-btn pri" data-send="' + q.id + '">Send reply</button></div></div>' : '') + '</div>';
      }
      return '<div class="o-pg" style="padding-bottom:0">' + sec(0, '<div class="o-ibx' + (V.iqdet ? ' det' : '') + '"><div class="o-list"><div class="o-seg">' + segs.map(function (s) { return '<button data-iqf="' + s[0] + '" aria-pressed="' + (F === s[0]) + '">' + s[1] + '<b>' + s[2] + '</b></button>'; }).join('') + '</div>' + items + '</div><div class="o-det">' + det + '</div></div>') + '</div>';
    }
    function prefSlot(q) {
      var f = {}; (q.fields || []).forEach(function (x) { f[x[0]] = x[1]; });
      var ds = (f.Days || '').split(/,\s*/).filter(Boolean).map(function (d) { return DAYS.indexOf(d); }).filter(function (d) { return d >= 0; });
      var hr = /Morning/.test(f.Time || '') ? 10 : /Midday/.test(f.Time || '') ? 12 : /Afternoon/.test(f.Time || '') ? 15 : 10;
      for (var k = 1; k < 21; k++) { var d = addD(d0(now()), k); if (d.getDay() === 0 && ds.indexOf(0) < 0) continue; if (!ds.length || ds.indexOf(d.getDay()) >= 0) return at(d, hr, 0); }
      return at(addD(d0(now()), 1), hr, 0);
    }
    function draftFor(q) {
      var f = first(q.name);
      if (q.type === 'viewing') { var s = prefSlot(q); return 'Hi ' + f + ', thank you for asking about ' + (q.horse || 'our horses') + '. ' + DAYL[s.getDay()] + ' at ' + tm(s) + ' works here, and I’ll have ' + (q.horse ? (S.horses.some(function (h) { return h.name === q.horse && h.sex === 'Mare'; }) ? 'her' : 'him') : 'them') + ' warmed up for you. Videos and the show record are ready whenever you’d like them.\n\nJennifer'; }
      if (q.type === 'boarding') return 'Hi ' + f + ', thank you for thinking of Harris Hill for the winter. I’d love to show you the barn and talk through the season. When are you next in Wellington?\n\nJennifer';
      if (q.type === 'training') return 'Hi ' + f + ', thank you for reaching out. I’d love to hear more about your goals for the season. Could we start with a lesson so I can get to know you both?\n\nJennifer';
      var s2 = prefSlot(q); return 'Hi ' + f + ', thank you for reaching out. I have ' + DAYL[s2.getDay()] + ' at ' + tm(s2) + ' open for a first ride. Would that suit you?\n\nJennifer';
    }

    function pageHorses() {
      var F = V.hf, n = 0;
      var cnt = function (f) { return S.horses.filter(f).length; };
      var segs = [['all', 'All', S.horses.length], ['home', 'Home string', cnt(function (h) { return h.status === 'home'; })], ['sale', 'For sale', cnt(function (h) { return h.status === 'sale'; })], ['lease', 'For lease', cnt(function (h) { return h.status === 'lease'; })], ['contract', 'Under contract', cnt(function (h) { return h.status === 'contract'; })], ['gone', 'Sold and leased', cnt(function (h) { return h.status === 'sold' || h.status === 'leased'; })]];
      var hs = S.horses.filter(function (h) { return F === 'all' || (F === 'gone' ? h.status === 'sold' || h.status === 'leased' : h.status === F); });
      segs = segs.filter(function (s) { return s[0] === 'all' || s[2] > 0 || s[0] === F; });
      return '<div class="o-pg">' + sec(0, '<div class="o-hbar"><div class="o-seg">' + segs.map(function (s) { return '<button data-hf="' + s[0] + '" aria-pressed="' + (F === s[0]) + '">' + s[1] + '<b>' + s[2] + '</b></button>'; }).join('') + '</div><button class="o-btn pri" data-addh>' + icon('plus', 16) + 'Add a horse</button></div>') +
        sec(1, '<div class="o-hg">' + (hs.map(function (h) {
          var gone = h.status === 'sold' || h.status === 'leased';
          return '<article class="o-card o-hc' + (gone ? ' gone' : '') + '" data-h="' + h.id + '"><div class="ph"><img src="' + IMG + h.img + '" alt="" style="object-position:' + (POS[h.img] || '50% 50%') + '" loading="lazy"><span class="o-tag ' + h.status + '"><i></i>' + HS[h.status] + '</span></div>' +
            '<div class="bd"><h3>' + esc(h.name) + '</h3><p class="sp">' + [h.disc, h.age, h.ht, h.sex].filter(function (x) { return x !== '' && x != null; }).map(esc).join(' · ') + '</p>' +
            (h.status === 'home' ? '<div class="ft rec">' + esc(h.rec || 'At home in the barn') + '</div>' : '<div class="ft"><button class="o-sw" role="switch" aria-checked="' + !!h.site + '" data-site="' + h.id + '"><i></i>On the site</button>' + (h.site ? '<button class="q" data-see="' + h.id + '">See it live</button>' : '') + '</div>') + '</div></article>';
        }).join('') || '<p class="o-empty">No horses here yet.</p>') + '</div>') + '</div>';
    }

    function pageShows() {
      var n = now(), T = d0(n);
      var y0 = new Date(T.getFullYear(), T.getMonth() - 3, 1), span = 13;
      var mo = ''; for (var i = 0; i < span; i++) { var m = new Date(y0.getFullYear(), y0.getMonth() + i, 1); mo += '<span>' + MON[m.getMonth()] + (m.getMonth() === 0 ? ' ’' + String(m.getFullYear()).slice(2) : '') + '</span>'; }
      var y1 = new Date(y0.getFullYear(), y0.getMonth() + span, 1), tot = y1 - y0;
      function pc(d) { return Math.max(0, Math.min(100, (d - y0) / tot * 100)); }
      var bars = S.shows.map(function (s) {
        var e = addD(s.start, s.days), past = e < n;
        return '<i class="' + (past ? 'past' : '') + (s.id === V.show ? ' on' : '') + '" data-show="' + s.id + '" title="' + esc(s.venue + ', ' + s.name) + '" style="left:' + pc(s.start).toFixed(2) + '%;width:max(10px,' + (pc(e) - pc(s.start)).toFixed(2) + '%)"></i>';
      }).join('') + '<span class="td" style="left:' + pc(n).toFixed(2) + '%"></span>';
      var up = S.shows.filter(function (s) { return addD(s.start, s.days) >= n; }).sort(function (a, b) { return a.start - b.start; });
      var past = S.shows.filter(function (s) { return addD(s.start, s.days) < n; }).sort(function (a, b) { return b.start - a.start; });
      function li(s) { return '<li class="' + (s.id === V.show ? 'on' : '') + '" data-show="' + s.id + '"><b>' + esc(s.name) + '</b><span>' + esc(s.venue) + ' · ' + md(s.start) + ' – ' + md(addD(s.start, s.days - 1)) + '</span></li>'; }
      var s = S.shows.filter(function (x) { return x.id === V.show; })[0] || S.shows[0];
      var isPast = addD(s.start, s.days) < n, dd = Math.ceil((d0(s.start) - T) / 864e5);
      var horses = S.horses.map(function (h) { return h.name; }).concat(['Bellamy', 'Marlowe', 'Pippin', 'Quill', 'Halcyon', 'Sonnet']);
      var riders = ['Jennifer'].concat(S.clients.filter(function (c) { return c.rider; }).map(function (c) { return c.name; }));
      var opts = function (a) { return a.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join(''); };
      var det = '<span class="lab">' + (isPast ? 'Results' : dd <= 0 ? 'Showing now' : 'In ' + dd + (dd === 1 ? ' day' : ' days')) + '</span><h2>' + esc(s.name) + '</h2><p class="sub">' + esc(s.venue) + ' · ' + wd(s.start) + ' – ' + wd(addD(s.start, s.days - 1)) + '</p>';
      if (isPast) {
        det += '<table class="o-tb" style="margin-top:26px"><thead><tr><th>Placing</th><th>Horse</th><th class="hide">Rider</th><th>Class</th></tr></thead><tbody>' + (s.results.map(function (r) {
          return '<tr' + (r.fresh ? ' class="fresh"' : '') + '><td>' + ribbon(r.place) + PL[r.place].l + '</td><td>' + esc(r.horse) + '</td><td class="hide">' + esc(r.rider) + '</td><td>' + esc(r.cls) + '</td></tr>';
        }).join('') || '<tr><td colspan="4" class="o-empty">No results yet.</td></tr>') + '</tbody></table>' +
          '<form class="o-add" data-addres><label class="o-f"><span>Horse</span><select name="horse">' + opts(horses) + '</select></label><label class="o-f"><span>Rider</span><select name="rider">' + opts(riders) + '</select></label><label class="o-f"><span>Class</span><input name="cls" placeholder="Junior Hunter 3′3″"></label><label class="o-f"><span>Placing</span><select name="place">' + PLACE.map(function (p) { return '<option value="' + p.k + '">' + p.l + '</option>'; }).join('') + '</select></label><button class="o-btn br" type="submit">Add</button></form>' +
          '<div class="o-pub"><p>' + (s.publish ? 'These results are on the Shows page of the site.' : 'Publish to show these results on the Shows page of the site.') + '</p><button class="o-sw" role="switch" aria-checked="' + !!s.publish + '" data-pub="' + s.id + '"><i></i>' + (s.publish ? 'Published' : 'Publish') + '</button></div>';
        S.shows.forEach(function (x) { x.results.forEach(function (r) { delete r.fresh; }); });
      } else {
        det += '<table class="o-tb" style="margin-top:26px"><thead><tr><th>Horse</th><th>Rider</th><th>Division</th><th class="r"></th></tr></thead><tbody>' + (s.entries.map(function (r, i) {
          return '<tr' + (r.fresh ? ' class="fresh"' : '') + '><td>' + esc(r.horse) + '</td><td>' + esc(r.rider) + '</td><td>' + esc(r.cls) + '</td><td class="r"><button class="o-btn q" data-rment="' + i + '" aria-label="Remove entry">' + icon('x', 14) + '</button></td></tr>';
        }).join('') || '<tr><td colspan="4" class="o-empty">No entries yet.</td></tr>') + '</tbody></table>' +
          '<form class="o-add" data-addent style="grid-template-columns:1fr 1fr 1.4fr auto"><label class="o-f"><span>Horse</span><select name="horse">' + opts(horses) + '</select></label><label class="o-f"><span>Rider</span><select name="rider">' + opts(riders) + '</select></label><label class="o-f"><span>Division</span><input name="cls" placeholder="Junior Hunter 3′3″"></label><button class="o-btn br" type="submit">Enter</button></form>';
        S.shows.forEach(function (x) { x.entries.forEach(function (r) { delete r.fresh; }); });
      }
      return '<div class="o-pg">' +
        sec(0, '<div class="o-card o-yr"><div class="m" style="grid-template-columns:repeat(' + span + ',minmax(0,1fr))">' + mo + '</div><div class="tr">' + bars + '</div></div>') +
        '<div class="o-sg">' + sec(1, sh('Coming up') + '<ul class="o-sl">' + up.map(li).join('') + '</ul><div style="height:30px"></div>' + sh('Past') + '<ul class="o-sl">' + past.map(li).join('') + '</ul>') +
        sec(2, '<div class="o-card o-sd">' + det + '</div>') + '</div></div>';
    }

    function balance(c) { var t = (c.lines || []).reduce(function (a, l) { return a + l[1]; }, 0); return c.paid ? 0 : t; }
    function nextRide(c) { var n = now(); var e = S.events.filter(function (e) { return e.cid === c.id && e.start > n && e.status !== 'cancelled'; }).sort(function (a, b) { return a.start - b.start; })[0]; return e ? DAYS[e.start.getDay()] + ' ' + tm(e.start) : ''; }
    function pageClients() {
      var F = V.cf, q = V.q.toLowerCase();
      var cs = S.clients.filter(function (c) { return (F === 'all' || (F === 'board' ? c.stall : !c.stall)) && (!q || (c.name + ' ' + c.horses.join(' ')).toLowerCase().indexOf(q) >= 0); });
      var segs = [['all', 'Everyone', S.clients.length], ['board', 'Boarders', S.clients.filter(function (c) { return c.stall; }).length], ['ride', 'Riders', S.clients.filter(function (c) { return !c.stall; }).length]];
      var mt = S.clients.reduce(function (a, c) { return a + (c.lines || []).reduce(function (x, l) { return x + l[1]; }, 0); }, 0);
      var open = S.clients.reduce(function (a, c) { return a + balance(c); }, 0);
      return '<div class="o-pg">' +
        sec(0, '<div class="o-kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="o-card o-kpi" style="cursor:default"><span class="lab">In the barn</span><div class="v">' + S.clients.filter(function (c) { return c.stall; }).length + '<small>of 8 stalls</small></div><p>' + S.clients.length + ' clients in all</p></div>' +
          '<div class="o-card o-kpi" style="cursor:default"><span class="lab">' + MON[now().getMonth()] + ' billing</span><div class="v">' + money(mt) + '</div><p>Board, training and lessons</p></div>' +
          '<div class="o-card o-kpi" style="cursor:default"><span class="lab">Outstanding</span><div class="v">' + money(open) + '</div><p>' + S.clients.filter(function (c) { return balance(c); }).length + ' invoices open</p></div></div>') +
        sec(1, '<div class="o-cbar"><div class="o-seg">' + segs.map(function (s) { return '<button data-cf="' + s[0] + '" aria-pressed="' + (F === s[0]) + '">' + s[1] + '<b>' + s[2] + '</b></button>'; }).join('') + '</div><label class="o-srch">' + icon('search', 16) + '<input data-q placeholder="Search people and horses" value="' + esc(V.q) + '"></label><button class="o-btn pri" data-addc>' + icon('plus', 16) + 'Add a client</button></div>' +
          '<table class="o-tb o-ct"><thead><tr><th>Name</th><th>Horse</th><th class="hide">Stall</th><th class="hide">Program</th><th class="hide">Next ride</th><th class="r">Balance</th></tr></thead><tbody>' + cs.map(function (c) {
            var b = balance(c);
            return '<tr data-cl="' + c.id + '"><td><div class="nm"><span class="o-av">' + initials(c.name) + '</span><div><b>' + esc(c.name) + '</b><small>' + esc(c.kind) + (c.rider ? ' · ' + esc(c.rider) : '') + '</small></div></div></td><td>' + esc(c.horses.join(', ') || '—') + '</td><td class="hide">' + (c.stall || '—') + '</td><td class="hide">' + esc(c.program) + '</td><td class="hide">' + (nextRide(c) || '—') + '</td><td class="r">' + (b ? money(b) : '<span style="color:var(--mute)">Paid</span>') + '</td></tr>';
          }).join('') + '</tbody></table>' + (cs.length ? '' : '<p class="o-empty">No one by that name.</p>')) + '</div>';
    }

    var PAGES = { today: pageToday, calendar: pageCalendar, inbox: pageInbox, horses: pageHorses, shows: pageShows, clients: pageClients };
    var TITLES = { today: 'Today', calendar: 'Calendar', inbox: 'Inquiries', horses: 'Horses', shows: 'Shows', clients: 'Clients' };
    var SUBS = { today: 'The barn at a glance', calendar: 'Lessons, viewings and care', inbox: 'From the site', horses: 'Sales and leasing', shows: 'The season', clients: 'Boarders and riders' };
    function render(anim) {
      var sy = view.scrollTop;
      view.className = 'o-view ' + (anim && !reduce ? 'enter' : 'still');
      view.innerHTML = PAGES[V.tab]();
      $('.o-ttl h1').textContent = TITLES[V.tab];
      $('.o-ttl .lab').textContent = SUBS[V.tab];
      $$('[data-tab]').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === V.tab); if (b.dataset.tab === V.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
      if (anim) view.scrollTop = 0; else view.scrollTop = sy;
      var nl = $('.o-now'); if (nl) placeNow(nl);
      if (V.tab === 'calendar' && anim) { var c = $('.o-cal'); if (c) { var hh = parseFloat(getComputedStyle(c).getPropertyValue('--hh')) || 58; view.scrollTop = Math.max(0, hh * 0.5); } }
      badges(); tick();
    }
    function go(tab) { if (!PAGES[tab]) return; V.tab = tab; V.iqdet = false; V.compose = null; closeDr(); render(true); }

    /* ---------- drawer ---------- */
    function openDr(html) { dr.innerHTML = html; root.classList.add('dr-on'); dr.setAttribute('aria-hidden', 'false'); setTimeout(function () { var f = dr.querySelector('input,select,textarea,button'); f && f.focus({ preventScroll: true }); }, 380); }
    function closeDr() { root.classList.remove('dr-on'); dr.setAttribute('aria-hidden', 'true'); }
    function drShell(lab, title, body, foot) { return '<div class="o-drh"><div><span class="lab">' + lab + '</span><h3>' + title + '</h3></div><button class="o-ib" data-drx aria-label="Close">' + icon('x', 16) + '</button></div><div class="o-drb">' + body + '</div><div class="o-drf">' + foot + '</div>'; }
    function f(name, label, input, wide) { return '<label class="o-f' + (wide ? ' w' : '') + '"><span>' + label + '</span>' + input + '</label>'; }
    function sel(name, list, v) { return '<select name="' + name + '">' + list.map(function (o) { var k = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(k) + '"' + (String(k) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>'; }
    function inp(name, v, ph, type) { return '<input name="' + name + '" type="' + (type || 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>'; }
    function isoD(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
    var TIMES = []; for (var tt = H0 * 4; tt <= (H1 - 1) * 4; tt++) TIMES.push([pad(Math.floor(tt / 4)) + ':' + pad((tt % 4) * 15), tm(at(new Date(), Math.floor(tt / 4), (tt % 4) * 15))]);

    function bookForm(e, isNew) {
      var people = S.clients.filter(function (c) { return c.rider; }).map(function (c) { return c.name; });
      if (e.who && people.indexOf(e.who) < 0 && e.type !== 'training' && e.type !== 'care') people.unshift(e.who);
      var horses = S.horses.filter(function (h) { return h.status !== 'sold' && h.status !== 'leased'; }).map(function (h) { return h.name; }).concat(['Bellamy', 'Marlowe', 'Pippin', 'Quill', 'Halcyon', 'Sonnet', 'School horse']);
      if (e.horse && horses.indexOf(e.horse) < 0) horses.unshift(e.horse);
      var body = '<form class="o-fg" data-evform="' + (e.id || '') + '">' +
        '<div class="o-f w"><span>Type</span><div class="o-chips" data-one="type">' + Object.keys(TYPES).map(function (k) { return '<button type="button" data-v="' + k + '" aria-pressed="' + (e.type === k) + '">' + TYPES[k].l + '</button>'; }).join('') + '</div></div>' +
        f('who', 'Who', sel('who', (e.type === 'training' ? ['Jennifer'] : e.type === 'care' ? ['Farrier', 'Vet'] : people), e.who), true) +
        f('horse', 'Horse', sel('horse', horses, e.horse)) + f('ring', 'Where', sel('ring', RINGS, e.ring || 'Main ring')) +
        f('date', 'Day', inp('date', isoD(e.start), '', 'date')) + f('time', 'Time', sel('time', TIMES, hhmm(e.start))) +
        f('mins', 'Length', sel('mins', [[30, '30 min'], [45, '45 min'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours']], e.mins || 60)) +
        f('status', 'Status', sel('status', [['confirmed', 'Confirmed'], ['requested', 'Requested'], ['done', 'Done']], e.status || 'confirmed')) +
        '</form>';
      var foot = (isNew ? '' : '<button class="o-btn q sp" data-evcancel="' + e.id + '">Cancel booking</button>') + '<button class="o-btn" data-drx>Close</button><button class="o-btn pri" data-evsave>' + (isNew ? 'Book' : 'Save') + '</button>';
      openDr(drShell(isNew ? 'New booking' : TYPES[e.type].l, isNew ? (e.who && e.type !== 'training' ? 'Book ' + esc(first(e.who)) : 'A new booking') : esc(e.type === 'training' ? e.horse : e.title) + ' <em>' + esc(DAYS[e.start.getDay()] + ' ' + tm(e.start)) + '</em>', body, foot));
      dr._ev = e; dr._new = isNew;
    }
    function saveEv() {
      var fm = dr.querySelector('[data-evform]'), e = dr._ev; if (!fm) return;
      var g = function (n) { var x = fm.querySelector('[name="' + n + '"]'); return x ? x.value : ''; };
      var type = (fm.querySelector('[data-one="type"] [aria-pressed="true"]') || {}).dataset; type = type ? type.v : e.type;
      var p = g('date').split('-'), t = g('time').split(':');
      var start = new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]);
      if (isNaN(start)) start = e.start;
      e.type = type; e.who = g('who'); e.horse = g('horse'); e.ring = g('ring'); e.start = start; e.mins = +g('mins') || 60; e.status = g('status');
      e.title = type === 'training' ? e.horse : type === 'care' ? e.who : e.who;
      var c = S.clients.filter(function (c) { return c.name === e.who; })[0]; if (c) e.cid = c.id;
      if (dr._new) { e.id = uid('e'); S.events.push(e); }
      e.fresh = true;
      if (e.iq) { var q = S.inbox.filter(function (x) { return x.id === e.iq; })[0]; if (q && q.status !== 'closed') q.status = 'booked'; }
      save(); closeDr();
      V.week = monday(start); V.day = start.getDay();
      if (V.tab !== 'calendar' && V.tab !== 'inbox') { V.tab = 'calendar'; render(true); } else render(false);
      toast(dr._new ? 'Booked' : 'Saved', esc(e.title) + ', ' + DAYL[start.getDay()] + ' at ' + tm(start));
    }

    function horseForm(h, isNew) {
      var body = '<form class="o-fg" data-hform>' +
        f('name', 'Name', inp('name', h.name, 'Barn name'), true) +
        '<div class="o-f w"><span>Status</span><div class="o-chips" data-one="status">' + Object.keys(HS).map(function (k) { return '<button type="button" data-v="' + k + '" aria-pressed="' + (h.status === k) + '">' + HS[k] + '</button>'; }).join('') + '</div></div>' +
        f('disc', 'Discipline', inp('disc', h.disc, 'Hunter, equitation'), true) +
        f('age', 'Age', inp('age', h.age, '8')) + f('ht', 'Height', inp('ht', h.ht, '16.2h')) +
        f('sex', 'Sex', sel('sex', ['Gelding', 'Mare', 'Stallion'], h.sex)) + f('breed', 'Breed', inp('breed', h.breed, 'Warmblood')) +
        f('price', 'Price', sel('price', [[0, 'On request'], [1, 'Shown on request only, never listed']], 0)) +
        '<div class="o-f w"><span>Photo</span><div class="o-pix" data-one="img">' + PHOTOS.map(function (p) { return '<button type="button" data-v="' + p + '" aria-pressed="' + (h.img === p) + '"><img src="' + IMG + p + '" alt="" style="object-position:' + (POS[p] || '50% 50%') + '"></button>'; }).join('') + '</div></div>' +
        f('story', 'Story', '<textarea name="story" placeholder="A few lines for the site">' + esc(h.story || '') + '</textarea>', true) +
        '<div class="o-f w"><span>On the site</span><button type="button" class="o-sw" role="switch" aria-checked="' + !!h.site + '" data-hsite><i></i>' + (h.site ? 'Listed' : 'Hidden') + '</button></div>' +
        '</form>';
      var foot = (isNew ? '' : (h.status === 'sale' ? '<button class="o-btn q sp" data-mark="sold">Mark sold</button>' : h.status === 'lease' ? '<button class="o-btn q sp" data-mark="leased">Mark leased</button>' : '')) + '<button class="o-btn" data-drx>Close</button><button class="o-btn pri" data-hsave>' + (isNew ? 'Add horse' : 'Save') + '</button>';
      openDr(drShell(isNew ? 'New horse' : HS[h.status], isNew ? 'Add a horse' : esc(h.name), body, foot));
      dr._h = h; dr._new = isNew;
    }
    function saveHorse(mark) {
      var fm = dr.querySelector('[data-hform]'), h = dr._h; if (!fm) return;
      var g = function (n) { var x = fm.querySelector('[name="' + n + '"]'); return x ? x.value.trim() : ''; };
      var pk = function (k) { var b = fm.querySelector('[data-one="' + k + '"] [aria-pressed="true"]'); return b ? b.dataset.v : ''; };
      var name = g('name'); if (!name) { var ni = fm.querySelector('[name="name"]'); ni.focus(); ni.style.boxShadow = 'inset 0 0 0 1px var(--warn)'; return; }
      h.name = name; h.status = mark || pk('status') || h.status; h.disc = g('disc'); h.age = g('age'); h.ht = g('ht'); h.sex = g('sex'); h.breed = g('breed'); h.img = pk('img') || h.img; h.story = g('story');
      h.site = fm.querySelector('[data-hsite]').getAttribute('aria-checked') === 'true';
      if (dr._new) { h.id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 5); S.horses.unshift(h); }
      h.updated = +now();
      save(); closeDr(); render(false);
      toast(dr._new ? 'Added' : mark ? HS[h.status] : 'Saved', esc(h.name) + (h.site ? ', and the site is updated' : ''));
    }

    function clientDr(c) {
      var n = now();
      var evs = S.events.filter(function (e) { return e.cid === c.id && e.status !== 'cancelled'; }).sort(function (a, b) { return a.start - b.start; });
      var upc = evs.filter(function (e) { return e.start > n; }).slice(0, 4);
      var tot = (c.lines || []).reduce(function (a, l) { return a + l[1]; }, 0);
      var body = '<dl class="o-kv">' + [['With us since', c.since], ['Rider', c.rider || 'Owner'], ['Horses', c.horses.join(', ') || 'Rides school horses'], ['Stall', c.stall || 'None'], ['Program', c.program], ['Notes', c.notes]].filter(function (x) { return x[1]; }).map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('') + '</dl>' +
        (c.care ? '<div style="height:30px"></div>' + sh('Care') + '<ul class="o-inv">' + c.horses.map(function (hn) { return '<li><span>' + esc(hn) + ', farrier</span><span class="o-due' + (c.care.farrier <= 3 ? ' soon' : '') + '">' + md(addD(n, c.care.farrier)) + '</span></li><li><span>' + esc(hn) + ', ' + (hn === 'Sonnet' ? 'hock check' : 'vaccines') + '</span><span class="o-due' + (c.care.vet <= 3 ? ' soon' : '') + '">' + md(addD(n, c.care.vet)) + '</span></li>'; }).join('') + '</ul>' : '') +
        '<div style="height:30px"></div>' + sh('Coming up') + (upc.length ? '<ul class="o-inv">' + upc.map(function (e) { return '<li><span>' + TYPES[e.type].l + (e.horse ? ', ' + esc(e.horse) : '') + '</span><span>' + DAYS[e.start.getDay()] + ' ' + md(e.start) + ', ' + tm(e.start) + '</span></li>'; }).join('') + '</ul>' : '<p class="o-empty">Nothing booked.</p>') +
        '<div style="height:30px"></div>' + sh(MON[n.getMonth()] + ' invoice', c.paid ? 'Paid' : 'Open') + '<ul class="o-inv">' + (c.lines || []).map(function (l) { return '<li><span>' + esc(l[0]) + '</span><span>' + money(l[1]) + '</span></li>'; }).join('') + '<li class="t"><span>Total</span><span>' + money(tot) + '</span></li></ul>';
      var foot = (c.paid ? '' : '<button class="o-btn q sp" data-paid="' + c.id + '">Mark paid</button>') + '<button class="o-btn" data-drx>Close</button>' + (c.rider ? '<button class="o-btn pri" data-bookc="' + c.id + '">' + icon('calendar', 16) + 'Book a ride</button>' : '');
      openDr(drShell(c.kind, esc(c.name), body, foot));
    }
    function clientForm(seedQ) {
      var body = '<form class="o-fg" data-cform>' + f('name', 'Name', inp('name', seedQ ? seedQ.name : '', 'Full name'), true) +
        f('kind', 'Type', sel('kind', ['Boarder', 'Rider', 'Owner'], seedQ && seedQ.type === 'boarding' ? 'Boarder' : 'Rider')) + f('rider', 'Rider', sel('rider', ['Pony', 'Junior', 'Amateur', 'Professional', ''], seedQ ? (seedQ.rider || '').replace('Parent of a rider', 'Junior') : 'Amateur')) +
        f('horses', 'Horses', inp('horses', '', 'Barn names, separated by commas'), true) +
        f('program', 'Program', sel('program', ['Lessons', 'Training', 'Young horses'], 'Training')) + f('stall', 'Stall', sel('stall', [[0, 'None'], [1, '1'], [6, '6']], seedQ && seedQ.type === 'boarding' ? 1 : 0)) +
        f('notes', 'Notes', '<textarea name="notes">' + esc(seedQ ? iqPreview(seedQ) : '') + '</textarea>', true) + '</form>';
      openDr(drShell('New client', seedQ ? 'Welcome ' + esc(first(seedQ.name)) : 'Add a client', body, '<button class="o-btn" data-drx>Close</button><button class="o-btn pri" data-csave>Add client</button>'));
      dr._q = seedQ;
    }
    function saveClient() {
      var fm = dr.querySelector('[data-cform]'); if (!fm) return;
      var g = function (n) { var x = fm.querySelector('[name="' + n + '"]'); return x ? x.value.trim() : ''; };
      if (!g('name')) { var ni = fm.querySelector('[name="name"]'); ni.focus(); ni.style.boxShadow = 'inset 0 0 0 1px var(--warn)'; return; }
      var c = { id: uid('c'), name: g('name'), kind: g('kind'), rider: g('rider'), horses: g('horses').split(/\s*,\s*/).filter(Boolean), stall: +g('stall'), program: g('program'), since: String(now().getFullYear()), slots: [], ring: 'Main ring', care: null, notes: g('notes'), lines: [], paid: false };
      if (c.stall) c.lines.push(['Full board', 2600]);
      if (c.program === 'Training') c.lines.push(['Training', 1850]);
      if (c.horses.length) c.care = { farrier: 21, vet: 60 };
      S.clients.unshift(c);
      if (dr._q) { dr._q.status = 'closed'; }
      save(); closeDr(); if (V.tab !== 'clients') go('clients'); else render(false);
      toast('Added to clients', esc(c.name));
    }

    /* ---------- toast ---------- */
    var tT = 0, tAct = null;
    function toast(a, b, act) {
      toastEl.innerHTML = '<i class="o-nd"></i><div><b>' + a + '</b><span>' + b + '</span></div>';
      tAct = act || null;
      toastEl.classList.add('on'); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove('on'); }, act ? 6500 : 3600);
    }
    toastEl.addEventListener('click', function () { toastEl.classList.remove('on'); if (tAct) tAct(); });

    /* ---------- inquiries from the site ---------- */
    function merge(silent) {
      if (!ST) return;
      var q = ST.queue(), added = [];
      q.forEach(function (it) {
        if (!it || !it.id || S.inbox.some(function (x) { return x.id === it.id; })) return;
        if (/^live-/.test(it.id) && it.id !== liveId) return;
        var x = { id: it.id, at: new Date(it.at || Date.now()), type: it.type || 'lesson', name: it.name || 'New inquiry', contact: it.contact || '', rider: it.rider || '', horse: it.horse || '', status: 'new', read: false, src: /^live-/.test(it.id) ? 'live' : 'site', fields: it.fields || [], thread: [], fresh: true };
        S.inbox.push(x); added.push(x);
        var hasT = (x.fields || []).some(function (f) { return f[0] === 'Days' || f[0] === 'Time'; });
        if (hasT && x.type !== 'boarding') {
          var s = prefSlot(x);
          S.events.push({ id: uid('e'), type: x.type === 'viewing' ? 'viewing' : 'lesson', title: x.name, who: x.name, horse: x.horse || 'School horse', ring: 'Main ring', start: s, mins: 60, status: 'requested', iq: x.id, fresh: true });
        }
      });
      if (!added.length) return;
      save();
      var last = added[added.length - 1];
      if (!silent || true) toast('New inquiry', esc(last.name) + ', ' + esc((IQT[last.type] || '').toLowerCase()) + (last.horse ? ', ' + esc(last.horse) : ''), function () { V.iq = last.id; V.iqf = 'all'; V.iqdet = true; go('inbox'); });
      if (V.tab === 'today' || V.tab === 'inbox' || V.tab === 'calendar') render(false); else badges();
    }
    if (ST) ST.on(function (k) {
      if (k === 'inq') merge();
      if (k === 'state') {
        /* another open copy of the office saved: pick up its changes */
        var raw = ST.state();
        if (raw && raw.v === 2 && raw.events && raw !== S && !root.classList.contains('dr-on') && !V.compose) { S = revive(raw); render(false); }
      }
    });
    /* the site's latest inquiry lands a moment after the office opens, the way it would on a working day */
    var liveId = null;
    S.inbox = S.inbox.filter(function (x) { return x.src !== 'live'; });
    S.events = S.events.filter(function (e) { return !(e.iq && /^live-/.test(e.iq)); });
    merge(true);
    if (ST && opts.live !== false) timers.push(setTimeout(function () {
      if (dead) return;
      var hs = S.horses.filter(function (h) { return h.status === 'sale' && h.site; })[0], n = now();
      liveId = 'live-' + (+n);
      ST.inquire({ id: liveId, at: +n, type: hs ? 'viewing' : 'lesson', name: 'Caroline Whitley', contact: 'caroline.whitley@example.com', rider: 'Daughter, fourteen',
        horse: hs ? hs.name : '', fields: [['For', hs ? 'A viewing' : 'A lesson']].concat(hs ? [['Horse', hs.name]] : []).concat([['Rider', 'Daughter, fourteen'], ['Days', 'Sat'], ['Time', 'Morning'], ['Note', hs ? 'We saw the show results on the site and would love to try ' + hs.name + ' this weekend.' : 'We saw the show results on the site and would love a first ride this weekend.']]) });
      merge();
    }, 2800));

    /* ---------- events ---------- */
    root.addEventListener('click', function (e) {
      var t = e.target, b;
      if ((b = t.closest('[data-tab]'))) { go(b.dataset.tab); return; }
      if ((b = t.closest('[data-go]'))) { go(b.dataset.go); return; }
      if (t.closest('[data-drx]') || t.classList.contains('o-scrim')) { closeDr(); return; }
      if ((b = t.closest('.o-chips[data-one] button,.o-pix button'))) { [].forEach.call(b.parentNode.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (b.parentNode.dataset.one === 'type') { var fm = b.closest('form'), ws = fm.querySelector('[name="who"]'), ty = b.dataset.v; var opts = ty === 'training' ? ['Jennifer'] : ty === 'care' ? ['Farrier', 'Vet'] : S.clients.filter(function (c) { return c.rider; }).map(function (c) { return c.name; }); ws.innerHTML = opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join(''); }
        return; }
      if ((b = t.closest('[data-hsite]'))) { var on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(on)); b.lastChild.textContent = on ? 'Listed' : 'Hidden'; return; }
      if (t.closest('[data-new]')) {
        if (V.tab === 'horses') { horseForm({ name: '', status: 'sale', site: true, disc: '', age: '', ht: '', sex: 'Gelding', breed: 'Warmblood', img: 'bay-over.webp', story: '' }, true); return; }
        if (V.tab === 'clients') { clientForm(); return; }
        var n = now(), s = at(n, Math.min(H1 - 2, n.getHours() + 1), 0); bookForm({ type: 'lesson', who: '', horse: 'School horse', ring: 'Main ring', start: s, mins: 60, status: 'confirmed' }, true); return;
      }
      if ((b = t.closest('[data-ev]'))) { var ev = S.events.filter(function (x) { return x.id === b.dataset.ev; })[0]; if (ev) bookForm(ev, false); return; }
      if (t.closest('[data-evsave]')) { saveEv(); return; }
      if ((b = t.closest('[data-evcancel]'))) { var ce = dr._ev; ce.status = 'cancelled'; save(); closeDr(); render(false); toast('Cancelled', esc(ce.title) + ', ' + DAYS[ce.start.getDay()] + ' ' + tm(ce.start)); return; }
      if ((b = t.closest('.o-col-pick'))) return;
      if ((b = t.closest('.o-cal .col'))) {
        var r = b.getBoundingClientRect(), hh = r.height / (H1 - H0), y = (e.clientY - r.top) / hh, hr = H0 + Math.floor(y * 2) / 2;
        if (!isFinite(hr)) hr = 9; hr = Math.max(H0, Math.min(H1 - 1, hr));
        var dd = new Date(+b.dataset.day), st = at(dd, Math.floor(hr), (hr % 1) * 60);
        bookForm({ type: 'lesson', who: '', horse: 'School horse', ring: 'Main ring', start: st, mins: 60, status: 'confirmed' }, true); return;
      }
      if ((b = t.closest('[data-wk]'))) { var k = +b.dataset.wk; V.week = k ? addD(V.week, 7 * k) : monday(now()); if (!k) V.day = now().getDay(); render(false); return; }
      if ((b = t.closest('[data-pick]'))) { V.day = +b.dataset.pick; render(false); return; }
      if ((b = t.closest('[data-iqf]'))) { V.iqf = b.dataset.iqf; V.iq = null; render(false); return; }
      if (t.closest('[data-iqback]')) { V.iqdet = false; render(false); return; }
      if ((b = t.closest('[data-iq]'))) { V.iq = b.dataset.iq; V.compose = null; var qq = S.inbox.filter(function (x) { return x.id === V.iq; })[0]; if (qq && !qq.read) { qq.read = true; save(); } V.iqdet = true; if (V.tab !== 'inbox') { V.iqf = 'all'; go('inbox'); V.iqdet = true; render(false); } else render(false); return; }
      if ((b = t.closest('[data-book]'))) { var q = S.inbox.filter(function (x) { return x.id === b.dataset.book; })[0]; var ex = S.events.filter(function (x) { return x.iq === q.id && x.status !== 'cancelled'; })[0];
        if (ex) { if (ex.status === 'requested') { bookForm(ex, false); var sb = dr.querySelector('[name="status"]'); if (sb) sb.value = 'confirmed'; } else { V.week = monday(ex.start); V.day = ex.start.getDay(); ex.fresh = true; go('calendar'); } return; }
        bookForm({ type: q.type === 'viewing' ? 'viewing' : 'lesson', who: q.name, horse: q.horse || 'School horse', ring: 'Main ring', start: prefSlot(q), mins: 60, status: 'confirmed', iq: q.id }, true); return; }
      if ((b = t.closest('[data-reply]'))) { V.compose = b.dataset.reply; render(false); var ta = $('[data-cmp]'); if (ta) { ta.focus({ preventScroll: true }); if (ta.scrollIntoView) ta.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); } return; }
      if (t.closest('[data-cmpx]')) { V.compose = null; render(false); return; }
      if ((b = t.closest('[data-send]'))) { var sq = S.inbox.filter(function (x) { return x.id === b.dataset.send; })[0], txt = ($('[data-cmp]') || {}).value || ''; if (!txt.trim()) return;
        sq.thread = sq.thread || []; sq.thread.push({ who: 'Jennifer', at: now(), text: txt.trim() }); if (sq.status === 'new') sq.status = 'replied'; sq.read = true; V.compose = null; save(); render(false); toast('Reply sent', 'To ' + esc(sq.name)); return; }
      if ((b = t.closest('[data-close]'))) { var cq = S.inbox.filter(function (x) { return x.id === b.dataset.close; })[0]; cq.status = 'closed'; cq.read = true; save(); render(false); return; }
      if ((b = t.closest('[data-client]'))) { clientForm(S.inbox.filter(function (x) { return x.id === b.dataset.client; })[0]); return; }
      if ((b = t.closest('[data-hf]'))) { V.hf = b.dataset.hf; render(false); return; }
      if ((b = t.closest('[data-site]'))) { e.stopPropagation(); var hs = S.horses.filter(function (x) { return x.id === b.dataset.site; })[0]; hs.site = !hs.site; save(); render(false); toast(hs.site ? 'Listed on the site' : 'Hidden from the site', esc(hs.name)); return; }
      if ((b = t.closest('[data-see]'))) { e.stopPropagation(); var hv = S.horses.filter(function (x) { return x.id === b.dataset.see; })[0]; var path = ['sterling', 'juniper', 'cavalier', 'notary'].indexOf(hv.id) >= 0 ? 'site/horse-' + hv.id + '.html' : 'site/horses.html'; if (ST && ST.framed) ST.go('site', path); else window.open(path, '_blank'); return; }
      if (t.closest('[data-addh]')) { horseForm({ name: '', status: 'sale', site: true, disc: '', age: '', ht: '', sex: 'Gelding', breed: 'Warmblood', img: 'bay-over.webp', story: '' }, true); return; }
      if ((b = t.closest('[data-h]'))) { var hh2 = S.horses.filter(function (x) { return x.id === b.dataset.h; })[0]; if (hh2) horseForm(hh2, false); return; }
      if (t.closest('[data-hsave]')) { saveHorse(); return; }
      if ((b = t.closest('[data-mark]'))) { saveHorse(b.dataset.mark); return; }
      if ((b = t.closest('[data-show]'))) { V.show = b.dataset.show; render(false); return; }
      if ((b = t.closest('[data-pub]'))) { var ps = S.shows.filter(function (x) { return x.id === b.dataset.pub; })[0]; ps.publish = !ps.publish; save(); render(false); toast(ps.publish ? 'Published to the site' : 'Taken off the site', esc(ps.venue + ', ' + ps.name), ps.publish && ST && ST.framed ? function () { ST.go('site', 'site/shows.html#results'); } : null); return; }
      if ((b = t.closest('[data-rment]'))) { var es = S.shows.filter(function (x) { return x.id === V.show; })[0]; es.entries.splice(+b.dataset.rment, 1); save(); render(false); return; }
      if ((b = t.closest('[data-cf]'))) { V.cf = b.dataset.cf; render(false); return; }
      if (t.closest('[data-addc]')) { clientForm(); return; }
      if (t.closest('[data-csave]')) { saveClient(); return; }
      if ((b = t.closest('[data-paid]'))) { var pc = S.clients.filter(function (x) { return x.id === b.dataset.paid; })[0]; pc.paid = true; save(); closeDr(); render(false); toast('Marked paid', esc(pc.name)); return; }
      if ((b = t.closest('[data-bookc]'))) { var bc = S.clients.filter(function (x) { return x.id === b.dataset.bookc; })[0]; var n2 = now(); bookForm({ type: 'lesson', who: bc.name, cid: bc.id, horse: bc.horses[0] || 'School horse', ring: bc.ring || 'Main ring', start: at(addD(n2, 1), 15, 0), mins: 60, status: 'confirmed' }, true); return; }
      if ((b = t.closest('[data-cl]'))) { var cc = S.clients.filter(function (x) { return x.id === b.dataset.cl; })[0]; if (cc) clientDr(cc); return; }
    });
    root.addEventListener('submit', function (e) {
      e.preventDefault();
      var fm = e.target, s = S.shows.filter(function (x) { return x.id === V.show; })[0];
      var g = function (n) { return (fm.querySelector('[name="' + n + '"]') || {}).value || ''; };
      if (fm.hasAttribute('data-addres')) { if (!g('cls').trim()) { fm.querySelector('[name="cls"]').focus(); return; } s.results.push({ horse: g('horse'), rider: g('rider'), cls: g('cls').trim(), place: g('place'), fresh: true }); save(); render(false); }
      if (fm.hasAttribute('data-addent')) { if (!g('cls').trim()) { fm.querySelector('[name="cls"]').focus(); return; } s.entries.push({ horse: g('horse'), rider: g('rider'), cls: g('cls').trim(), fresh: true }); save(); render(false); }
      if (fm.hasAttribute('data-evform')) saveEv();
      if (fm.hasAttribute('data-hform')) saveHorse();
      if (fm.hasAttribute('data-cform')) saveClient();
    });
    root.addEventListener('input', function (e) { if (e.target.matches('[data-q]')) { V.q = e.target.value; var p = e.target.selectionStart; render(false); var i = $('[data-q]'); i.focus(); try { i.setSelectionRange(p, p); } catch (x) {} } });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('dr-on')) closeDr(); });

    save();
    render(true);
    var api = {
      go: go, state: function () { return S; }, merge: merge,
      unmount: function () { dead = true; timers.forEach(clearInterval); clearTimeout(tT); root.remove(); }
    };
    el.__ho = api;
    return api;
  }

  window.HHOffice = { mount: mount, seed: seed };
})();

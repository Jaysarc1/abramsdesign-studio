/* Harris Hill · relay for the pages shown side by side.
   Each page in a frame says hello; this page keeps the latest office state and any new inquiries, and passes them along. */
(function () {
  'use strict';
  var cache = null, q = [], R = window.HHRelay = { oninq: null, ongo: null };
  function frames() { return [].slice.call(document.querySelectorAll('iframe')); }
  function send(w, m) { try { w && w.postMessage(m, '*'); } catch (e) {} }
  addEventListener('message', function (e) {
    var m = e.data || {}; if (!m.hh) return;
    if (m.hh === 'hello') { if (cache) send(e.source, { hh: 'state', d: cache }); q.forEach(function (it) { send(e.source, { hh: 'inq', item: it }); }); }
    if (m.hh === 'state' && m.d) { cache = m.d; frames().forEach(function (f) { if (f.contentWindow !== e.source) send(f.contentWindow, { hh: 'state', d: cache }); }); }
    if (m.hh === 'inq' && m.item) {
      if (!q.some(function (x) { return x.id === m.item.id; })) q.push(m.item);
      frames().forEach(function (f) { if (f.contentWindow !== e.source) send(f.contentWindow, { hh: 'inq', item: m.item }); });
      if (R.oninq) R.oninq(m.item);
    }
    if (m.hh === 'go' && R.ongo) R.ongo(m.k, m.path);
  });
})();

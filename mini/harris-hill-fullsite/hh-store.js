/* Harris Hill · one small store shared by the barn office and the site.
   The office owns the state. The site reads it (horse status, published results) and hands new inquiries over.
   Same-origin pages share localStorage; the flagship viewer relays by postMessage when storage is unavailable. */
(function () {
  'use strict';
  if (window.HHStore) return;
  var KS = 'hh.office.v1', KQ = 'hh.inq.v1';
  var mem = { state: null, q: [] }, subs = [], bc = null;
  try { bc = new BroadcastChannel('hh-office'); } catch (e) {}
  var framed = false; try { framed = window.parent && window.parent !== window; } catch (e) {}

  function rd(k) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function up(msg) { if (framed) try { window.parent.postMessage(msg, '*'); } catch (e) {} }
  function emit(kind) { subs.forEach(function (f) { try { f(kind); } catch (e) {} }); }

  var S = {
    state: function () { return rd(KS) || mem.state; },
    save: function (st) {
      mem.state = st; wr(KS, st);
      if (bc) try { bc.postMessage({ t: 'state' }); } catch (e) {}
      up({ hh: 'state', d: { horses: st.horses, shows: st.shows } });
    },
    queue: function () { var a = rd(KQ) || []; mem.q.forEach(function (x) { if (!a.some(function (y) { return y.id === x.id; })) a.push(x); }); return a; },
    inquire: function (item) {
      var a = rd(KQ) || []; a.push(item); wr(KQ, a); mem.q.push(item);
      if (bc) try { bc.postMessage({ t: 'inq', item: item }); } catch (e) {}
      up({ hh: 'inq', item: item });
    },
    on: function (f) { subs.push(f); },
    go: function (k, path) { up({ hh: 'go', k: k, path: path || '' }); },
    framed: framed
  };

  addEventListener('storage', function (e) { if (e.key === KS) emit('state'); if (e.key === KQ) emit('inq'); });
  if (bc) bc.onmessage = function (e) {
    var m = e.data || {};
    if (m.t === 'inq' && m.item && !mem.q.some(function (x) { return x.id === m.item.id; })) mem.q.push(m.item);
    emit(m.t);
  };
  addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.hh === 'state' && m.d) { if (!rd(KS)) mem.state = Object.assign({}, mem.state || {}, m.d); emit('state'); }
    if (m.hh === 'inq' && m.item) { if (!mem.q.some(function (x) { return x.id === m.item.id; })) mem.q.push(m.item); emit('inq'); }
  });
  up({ hh: 'hello' });
  window.HHStore = S;
})();

/* ==========================================================================
   FINISH — the last pass over the desk.

   The lights come up, a gold line runs over what you can pick up, the coffee
   steams, the phone has news, a print of every aircraft sits under the folder,
   a folder opens into its spec sheet, and the letter of intent is paper: keys
   that clack, ink you sign with, a stamp when it lands.

   Loaded after everything else on every page. Nothing on this site sends a
   form anywhere; every submission is acknowledged on the page and that is all.
   ========================================================================== */
(function(){
  'use strict';
  var html = document.documentElement;
  var IDS = ['g550','f900','cl350','cj4','cl605'];
  var ROOT = new RegExp('/(' + IDS.join('|') + ')/').test(location.pathname) ? '../' : '';
  var LAND = !!document.querySelector('.stack-in');
  var PROP = !!document.getElementById('t-apply');
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function low(){ return reduce || html.classList.contains('perf-low'); }
  function fine(){ return !window.matchMedia || matchMedia('(hover:hover) and (pointer:fine)').matches; }
  function narrow(){ return window.innerWidth <= 740; }
  function ss(k, v){ try { if(v === undefined) return sessionStorage.getItem(k);
    if(v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch(e){ return null; } }
  function el(tag, cls, parent){ var e = document.createElement(tag); if(cls) e.className = cls;
    if(parent) parent.appendChild(e); return e; }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, parent){ var e = document.createElementNS(SVGNS, tag);
    for(var k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }

  var HOMES = IDS.map(function(k){
    var p = (window.VELA || {})[k] || {};
    var ph = (p.photos && p.photos[0]) || [];
    return {k:k, name:p.tab || k, full:p.name || k,
            img: window.VELA_IMG ? window.VELA_IMG(ph[0], 600) : ''};
  });

  /* ---------- sound: our own little machine, quiet, and only when it's on ---------- */
  var actx = null, abus = null;
  function soundOn(){ return !!(window.APSound && window.APSound.enabled && window.APSound.enabled()); }
  function audio(){
    if(!soundOn()) return null;
    if(!actx){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      actx = new AC(); abus = actx.createGain(); abus.gain.value = .9; abus.connect(actx.destination); }
    if(actx.state === 'suspended') actx.resume();
    return actx;
  }
  function burst(o){
    var c = audio(); if(!c) return;
    var t0 = c.currentTime + (o.delay || 0), len = Math.max(1, Math.floor(c.sampleRate * o.dur));
    var b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for(var i = 0; i < len; i++) d[i] = (Math.random()*2 - 1) * Math.pow(1 - i/len, o.decay || 2);
    var s = c.createBufferSource(); s.buffer = b;
    var f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.value = o.f; f.Q.value = o.q || 1;
    var g = c.createGain(); g.gain.value = o.gain;
    s.connect(f); f.connect(g); g.connect(abus); s.start(t0);
  }
  function thump(o){
    var c = audio(); if(!c) return;
    var t0 = c.currentTime + (o.delay || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(o.f, t0);
    osc.frequency.exponentialRampToValueAtTime(o.to || o.f*.6, t0 + o.dur);
    g.gain.setValueAtTime(o.gain, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + o.dur);
    osc.connect(g); g.connect(abus); osc.start(t0); osc.stop(t0 + o.dur + .02);
  }
  var SND = {
    key: function(){ var v = Math.random();
      burst({f:2300 + v*900, q:1.4, dur:.035, gain:.05, decay:3});
      thump({f:180 + v*40, to:90, dur:.05, gain:.035}); },
    space: function(){ burst({f:1300, q:.9, dur:.06, gain:.05, decay:2.5});
      thump({f:120, to:70, dur:.08, gain:.04}); },
    bell: function(){ burst({f:2000, q:1.2, dur:.05, gain:.05, decay:3});
      thump({f:2093, to:2080, dur:.9, gain:.018}); thump({f:3136, to:3120, dur:.6, gain:.008}); },
    stamp: function(){ thump({f:95, to:45, dur:.22, gain:.14});
      burst({f:700, q:.6, dur:.12, gain:.09, decay:2, type:'lowpass'}); },
    pen: function(){ burst({f:5200, q:.7, dur:.05, gain:.010, decay:1.2}); },
    paper: function(){ burst({f:3400, q:.5, dur:.22, gain:.022, decay:1.4}); }
  };

  /* ---------- the ink that makes a stamp look pressed, not printed ---------- */
  (function(){
    if(document.getElementById('fin-ink')) return;
    var s = sv('svg', {width:0, height:0, 'aria-hidden':'true', focusable:'false'});
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    var f = sv('filter', {id:'fin-ink', x:'-5%', y:'-5%', width:'110%', height:'110%'}, s);
    sv('feTurbulence', {type:'fractalNoise', baseFrequency:'.9', numOctaves:'2', seed:'7', result:'n'}, f);
    sv('feColorMatrix', {in:'n', type:'matrix', values:'0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5', result:'m'}, f);
    sv('feComposite', {in:'SourceGraphic', in2:'m', operator:'in', result:'c'}, f);
    sv('feDisplacementMap', {in:'c', in2:'n', scale:'1.6', xChannelSelector:'R', yChannelSelector:'G'}, f);
    document.body.appendChild(s);
  })();

  /* ---------- the gold outline ---------- */
  function outline(host, shape, pad){
    pad = pad == null ? 7 : pad;
    var old = host.querySelector(':scope > .fin-ol'); if(old) old.remove();
    var w = host.offsetWidth, h = host.offsetHeight; if(!w || !h) return null;
    var W = w + pad*2, H = h + pad*2;
    var s = sv('svg', {'class':'fin-ol', viewBox:'0 0 ' + W + ' ' + H, 'aria-hidden':'true'});
    s.style.inset = (-pad) + 'px'; s.style.width = W + 'px'; s.style.height = H + 'px';
    if(shape === 'cup'){
      /* the rim of the cup in his photograph, not the box around it */
      sv('ellipse', {cx: pad + w*.469, cy: pad + h*.417, rx: w*.445, ry: w*.445, pathLength:1}, s);
    } else {
      var r = shape === 'phone' ? 19 : 4;
      sv('rect', {x:1, y:1, width:W-2, height:H-2, rx:r, ry:r, pathLength:1}, s);
    }
    host.appendChild(s);
    return s;
  }

  /* ---------- a quiet label over what you're pointing at ---------- */
  var tag = el('div', 'fin-tag', document.body); tag.setAttribute('aria-hidden', 'true');
  var tagFor = null;
  function showTag(host, text){
    tagFor = host; tag.textContent = text;
    var r = host.getBoundingClientRect(), below = r.top < 90;
    tag.classList.toggle('below', below);
    tag.style.left = Math.round(Math.max(70, Math.min(innerWidth - 70, r.left + r.width/2))) + 'px';
    tag.style.top = Math.round(below ? r.bottom + 12 : r.top - 12) + 'px';
    requestAnimationFrame(function(){ tag.classList.add('on'); });
  }
  function hideTag(host){ if(host && host !== tagFor) return; tag.classList.remove('on'); tagFor = null; }
  function live(host, label, shape, onGo, pad){
    host.classList.add('fin-live');
    if(!host.hasAttribute('tabindex')) host.tabIndex = 0;
    if(!host.getAttribute('role')) host.setAttribute('role', 'button');
    if(label && !host.getAttribute('aria-label')) host.setAttribute('aria-label', label);
    outline(host, shape, pad);
    host.addEventListener('pointerenter', function(e){
      if(e.pointerType !== 'mouse') return;
      host.classList.add('fin-on'); if(label) showTag(host, label);
      if(window.APSound) window.APSound.hover();
    });
    host.addEventListener('pointerleave', function(){ host.classList.remove('fin-on'); hideTag(host); });
    host.addEventListener('focus', function(){ if(label && host.matches(':focus-visible')) showTag(host, label); });
    host.addEventListener('blur', function(){ hideTag(host); });
    if(onGo){
      host.addEventListener('click', function(e){ e.preventDefault(); hideTag(); onGo(e); });
      host.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onGo(e); } });
    }
  }

  /* ==========================================================================
     THE LANDING
     ========================================================================== */
  function cardFor(k){ return document.querySelector('a.card.fold[data-prop="' + k + '"]'); }
  function cards(){ return Array.prototype.slice.call(document.querySelectorAll('.stack-in a.card.fold')); }
  function bringUp(k){
    var list = cards(), c = cardFor(k); if(!c) return;
    var i = list.indexOf(c), tabs = document.querySelectorAll('.foldtabs .foldtab');
    if(tabs[i] && tabs[i].offsetParent){ tabs[i].click(); return; }
    if(narrow() || getComputedStyle(c).position !== 'absolute'){
      var y = c.getBoundingClientRect().top + scrollY - 70;
      scrollTo({top:y, behavior: low() ? 'auto' : 'smooth'}); return;
    }
    var next = document.getElementById('fl-next'), n = 0;
    (function step(){ if(c.classList.contains('is-on') || n++ > 6 || !next) return;
      next.click(); setTimeout(step, 60); })();
  }

  var TRIP_DIR = (document.querySelector('script[src*="finish.js"]') || {}).src ? document.querySelector('script[src*="finish.js"]').src.replace(/finish\.js.*$/, '') + 'assets/images/desk/' : 'assets/images/desk/';
  var TRIP = {
    g550:  [TRIP_DIR + 'trip-g550.webp',  'Captain Max'],
    f900:  [TRIP_DIR + 'trip-f900.webp',  'first window seat'],
    cl350: [TRIP_DIR + 'trip-cl350.webp', 'boarding chaos'],
    cj4:   [TRIP_DIR + 'trip-cj4.webp',   'oops, my thumb'],
    cl605: [TRIP_DIR + 'trip-cl605.webp', 'out cold by Nassau']
  };
  function makePrint(h, small){
    var f = el('figure', 'fin-print');
    /* batch 18: the prints are the buyers' own snapshots from their trips, each with a few words in the same hand */
    var T = TRIP[h.k];
    var img = el('img', '', f); img.src = T ? T[0] : h.img; img.alt = ''; img.loading = 'lazy';
    img.decoding = 'async';
    var cap = el('figcaption', '', f); cap.textContent = T ? T[1] : h.name;
    f.dataset.prop = h.k;
    var c = cardFor(h.k);
    if(c){ var st = c.querySelector('.status .dot.no'); if(st) img.style.filter = 'grayscale(1) contrast(1.04)'; }
    return f;
  }

  function landing(){
    var frame = document.querySelector('.stack') ? document.querySelector('.stack').closest('.frame') : document.querySelector('.frame');

    /* --- the prints, tucked under the folder --- */
    var prints = null;
    if(frame){
      prints = el('div', 'fin-prints');
      prints.setAttribute('aria-label', 'The aircraft');
      HOMES.slice().reverse().forEach(function(h){ prints.appendChild(makePrint(h)); });
      frame.insertBefore(prints, frame.firstChild);
      var place = function(){
        var st = frame.querySelector('.stack'); if(!st) return;
        var fl = frame.getBoundingClientRect().left, sl = st.getBoundingClientRect().left;
        /* 112px of print past the folder, but never off the desk */
        var x = Math.max(14 - fl, (sl - fl) - 112);
        prints.style.setProperty('--fin-px', Math.round(Math.min(-6, x)) + 'px');
      };
      place(); addEventListener('resize', place); setTimeout(place, 1200);
      live(prints, null, 'rect', null, 12);
      prints.removeAttribute('role'); prints.tabIndex = -1;
      var FULL = {}; HOMES.forEach(function(h){ FULL[h.k] = h.full; });
      Array.prototype.forEach.call(prints.children, function(p){
        if(!p.classList.contains('fin-print')) return;
        p.tabIndex = 0; p.setAttribute('role', 'button');
        p.setAttribute('aria-label', 'Show the ' + (FULL[p.dataset.prop] || p.querySelector('figcaption').textContent));
        function go(e){ e.preventDefault(); e.stopPropagation(); prints.classList.remove('fin-on');
          if(window.APSound) window.APSound.shuffle(); bringUp(p.dataset.prop); }
        p.addEventListener('click', go);
        p.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') go(e); });
        p.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse' && prints.classList.contains('fin-on')) showTag(p, FULL[p.dataset.prop]); });
        p.addEventListener('pointerleave', function(){ hideTag(p); });
        p.addEventListener('focus', function(){ prints.classList.add('fin-on'); showTag(p, FULL[p.dataset.prop]); });
        p.addEventListener('blur', function(){ prints.classList.remove('fin-on'); hideTag(p); });
      });
    }

    /* --- on a phone, the desk is a strip you drag along --- */
    var hero = document.querySelector('.hero');
    var strip = el('div', 'fin-strip'); var track = el('div', 'fin-track', strip);
    strip.setAttribute('aria-label', 'The aircraft');
    HOMES.forEach(function(h){
      var p = makePrint(h, true); p.tabIndex = 0; p.setAttribute('role', 'button');
      p.setAttribute('aria-label', 'Show ' + h.name);
      outline(p, 'rect', 8);
      track.appendChild(p);
    });
    if(frame && frame.parentNode){ frame.parentNode.insertBefore(strip, frame); }
    else if(hero && hero.parentNode){ hero.parentNode.insertBefore(strip, hero.nextSibling); }
    (function(){
      var down = false, x0 = 0, s0 = 0, moved = 0;
      strip.addEventListener('pointerdown', function(e){
        if(e.pointerType !== 'mouse') return;
        down = true; moved = 0; x0 = e.clientX; s0 = strip.scrollLeft; strip.classList.add('dragging'); });
      addEventListener('pointermove', function(e){ if(!down) return;
        moved = Math.max(moved, Math.abs(e.clientX - x0)); strip.scrollLeft = s0 - (e.clientX - x0); });
      addEventListener('pointerup', function(){ down = false; strip.classList.remove('dragging'); });
      track.addEventListener('click', function(e){
        if(moved > 6){ e.preventDefault(); moved = 0; return; }
        var p = e.target.closest('.fin-print'); if(!p) return;
        p.classList.add('fin-trace'); setTimeout(function(){ p.classList.remove('fin-trace'); }, 900);
        if(window.APSound) window.APSound.shuffle();
        bringUp(p.dataset.prop);
      });
      track.addEventListener('keydown', function(e){
        var p = e.target.closest('.fin-print'); if(p && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); bringUp(p.dataset.prop); } });
      /* the first time it comes into view it drifts once, so you know it moves */
      if(!low() && 'IntersectionObserver' in window){
        var io = new IntersectionObserver(function(es){
          if(!es[0].isIntersecting || !narrow()) return; io.disconnect();
          var max = strip.scrollWidth - strip.clientWidth; if(max < 20) return;
          var t0 = performance.now(), D = 2600, A = Math.min(110, max);
          (function f(t){ var k = Math.min(1, (t - t0)/D);
            strip.scrollLeft = A * Math.sin(Math.PI * k) * (1 - .15*k);
            if(k < 1 && !down) requestAnimationFrame(f); })(t0);
        }, {threshold:.8});
        setTimeout(function(){ io.observe(strip); }, 900);
      }
    })();

    /* --- props that wait on his photographs --- */
    props(frame, track);

    /* batch 18: the line about the specifications at the foot of the desk is gone */

    /* --- a folder opens into its spec sheet --- */
    document.addEventListener('click', function(e){
      if(e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]'); if(!a) return;
      var m = (a.getAttribute('href') || '').match(new RegExp('^(' + IDS.join('|') + ')/(index\\.html)?(#.*)?$'));
      if(!m) return;
      /* batch 20: the folder opens straight onto its spec sheet; the full-screen blow-up of its first photograph is gone */
      if(true) return;
      var card = a.closest('a.card.fold') || cardFor(m[1]);
      var img = card && (card.querySelector('.shot > img') || card.querySelector('.shot img'));
      if(!img || low()) return;
      var r = img.getBoundingClientRect(); if(r.width < 40 || r.bottom < 0 || r.top > innerHeight) r = null;
      if(!r) return;
      e.preventDefault();
      var gray = /grayscale/.test(getComputedStyle(img).filter);
      var src = img.currentSrc || img.src;
      var veil = el('div', 'fin-veil', document.body);
      var z = el('div', 'fin-zoom' + (gray ? ' fin-gray' : ''), document.body);
      z.style.backgroundImage = 'url("' + src + '")';
      z.style.left = r.left + 'px'; z.style.top = r.top + 'px';
      z.style.width = r.width + 'px'; z.style.height = r.height + 'px';
      if(window.APSound) window.APSound.shuffle();
      ss('fin-in', JSON.stringify({src: /^https?:/.test(src) && !/\/assets\//.test(src) ? src : src.replace(/^.*\/assets\//, 'assets/'), gray: gray}));
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        veil.classList.add('on');
        z.style.left = '0px'; z.style.top = '0px'; z.style.width = innerWidth + 'px';
        z.style.height = innerHeight + 'px'; z.style.borderRadius = '0px';
        if(gray){ setTimeout(function(){ z.classList.remove('fin-gray'); z.classList.add('fin-full'); }, 350); }
      }); });
      setTimeout(function(){ location.href = a.href; }, 1050);
    });
    addEventListener('pageshow', function(e){
      if(!e.persisted) return;
      Array.prototype.forEach.call(document.querySelectorAll('.fin-zoom,.fin-veil'), function(n){ n.remove(); });
    });

    /* --- the lights come up --- */
    intro(prints);
  }

  /* ---------- props that wait on photographs ---------- */
  function props(frame, track){
    var D = window.AP_DESK || {};
    var cur = (document.querySelector('.stack-in a.card.fold.is-on') || {}).getAttribute
      ? document.querySelector('.stack-in a.card.fold.is-on').getAttribute('data-prop') : IDS[0];
    function home(){ var c = document.querySelector('.stack-in a.card.fold.is-on');
      return c ? c.getAttribute('data-prop') : cur; }
    var LIST = [
      {k:'keys',      label:'Letter of intent', hash:'#apply',  pos:'left:-96px;bottom:-34px;width:170px'},
      {k:'clipboard', label:'Proof of funds',   hash:'#check',  pos:'right:-118px;top:30%;width:210px'},
      {k:'envelope',  label:'Notify me',        hash:'#notify', pos:'left:30%;bottom:-70px;width:200px'}
    ];
    LIST.forEach(function(p){
      if(!D[p.k]) return;
      function go(){ var h = home(); var a = document.createElement('a');
        a.href = h + '/index.html' + p.hash; a.setAttribute('href', h + '/index.html' + p.hash);
        if(window.APSound) window.APSound.select();
        document.body.appendChild(a); a.click(); a.remove(); }
      if(frame){
        var d = el('div', 'fin-prop fin-prop-' + p.k); d.style.cssText = p.pos;
        var lift = el('span', 'lift', d); var img = el('img', '', lift); img.src = D[p.k]; img.alt = '';
        frame.appendChild(d);
        img.addEventListener('load', function(){ live(d, p.label, 'rect', go, 4); });
      }
      if(track){
        var m = el('div', 'fin-prop fin-prop-' + p.k); m.style.width = '140px';
        var l2 = el('span', 'lift', m); var i2 = el('img', '', l2); i2.src = D[p.k]; i2.alt = '';
        track.appendChild(m);
        i2.addEventListener('load', function(){ live(m, p.label, 'rect', go, 6); });
      }
    });
  }

  /* ---------- the desk starts dark ---------- */
  function intro(prints){
    var mug = document.querySelector('.obj.mug'), phone = document.querySelector('.obj.phone');
    if(mug) outline(mug, 'cup', 4);
    if(phone) outline(phone, 'phone', 6);
    if(low() || ss('fin-intro')){ steam(0); return; }
    ss('fin-intro', '1');
    var night = el('div', 'fin-night', document.body), t0 = performance.now(), began = false;
    setTimeout(function(){ night.classList.add('warm'); }, 260);
    function lights(){
      if(began) return; began = true;
      var wait = Math.max(0, 1050 - (performance.now() - t0));
      setTimeout(function(){
        night.classList.add('up');
        setTimeout(function(){ night.classList.add('gone'); }, 2300);
        steam(700);
        var seq = [];
        if(narrow()){ var s = document.querySelector('.fin-track .fin-print'); if(s) seq = [s]; }
        else {
          if(prints && prints.offsetParent) seq.push(prints);
          if(mug && mug.offsetParent) seq.push(mug);
          if(phone && phone.offsetParent) seq.push(phone);
        }
        seq.forEach(function(n, i){
          setTimeout(function(){ n.classList.add('fin-trace'); }, 850 + i*520);
          setTimeout(function(){ n.classList.add('fin-fade'); }, 3300 + i*520);
          setTimeout(function(){ n.classList.remove('fin-trace', 'fin-fade'); }, 4400 + i*520);
        });
      }, wait);
    }
    if(document.readyState === 'complete') lights();
    else { addEventListener('load', function(){ setTimeout(lights, 200); }); setTimeout(lights, 3200); }
  }

  /* ---------- steam off the coffee (one small canvas that follows the cup) ---------- */
  function steam(delay){
    var mug = document.querySelector('.obj.mug.photo') || document.querySelector('.obj.mug');
    if(!mug || low()) return;
    var cv = el('canvas', 'fin-steam'); cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', {premultipliedAlpha:true, alpha:true, antialias:false});
    if(!gl) return;
    document.body.appendChild(cv);
    var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision mediump float;varying vec2 v;uniform float t;uniform vec2 r;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
      'float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}',
      'void main(){',
      ' vec2 q=v; q.x=(q.x-.5)*r.x/r.y;',            /* cup center sits at (0, .30) */
      ' float y=q.y-.30;',
      ' vec2 w=vec2(q.x*5.5, y*4.0 - t*.32);',
      ' float a=fb(w*.8+vec2(sin(y*9.-t*.5)*.4, t*.03));',
      ' float b=fb(w*1.4+vec2(a*2.2, -t*.08));',
      ' float rid=1.-abs(2.*b-1.);',
      ' float s=pow(rid,6.)*smoothstep(.36,.74,a);',
      ' vec2 c=vec2(q.x, y*.82-.03);',                    /* over the coffee, leaning up past the rim */
      ' float m=smoothstep(.20,.05,length(c))*smoothstep(-.16,-.02,y);',
      ' float al=clamp(s*m*.8,0.,.2);',
      ' gl_FragColor=vec4(vec3(1.,.985,.96)*al,al);',
      '}'].join('\n');
    function sh(type, src){ var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); if(!gl.getProgramParameter(pr, gl.LINK_STATUS)){ cv.remove(); return; }
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var ut = gl.getUniformLocation(pr, 't'), ur = gl.getUniformLocation(pr, 'r');
    gl.clearColor(0, 0, 0, 0);
    var BUSY = /\b(grabbing|tipped|empty|carried|righting|sloshing)\b/;
    var t0 = performance.now(), W = 0, H = 0, raf = 0, shown = false;
    function frame(t){
      raf = requestAnimationFrame(frame);
      if(document.hidden || low()){ cv.classList.remove('on'); return; }
      var img = mug.querySelector('.mugimg') || mug, r = img.getBoundingClientRect();
      var busy = BUSY.test(mug.className) || !mug.offsetParent || r.width < 30;
      if(busy){ cv.classList.remove('on'); shown = false; return; }
      if(!shown){ shown = true; cv.classList.add('on'); }
      var cx = r.left + r.width*.469, cy = r.top + r.height*.417, cw = r.width*1.5, ch = r.width*2.2;
      var dpr = Math.min(1.5, devicePixelRatio || 1);
      var w = Math.round(cw*dpr*.5), h = Math.round(ch*dpr*.5);   /* half resolution, it's steam */
      if(w !== W || h !== H){ W = w; H = h; cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
      cv.style.transform = 'translate(' + (cx - cw/2) + 'px,' + (cy - ch*.70) + 'px)';
      gl.uniform1f(ut, (t - t0)/1000); gl.uniform2f(ur, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    setTimeout(function(){ raf = requestAnimationFrame(frame); }, delay || 0);
  }

  /* ---------- the phone has news from us, above whatever else came in ---------- */
  function phoneNews(){
    var phone = document.querySelector('.obj.phone') || document.querySelector('.phone');
    if(!phone) return;
    var NEWS = [
      'Pre-buy inspection booked · Savannah, Tue 9:00',
      'Demo flight confirmed · KTEB, Sat 10:00',
      'Logbooks are in the data room',
      'Your letter of intent was received',
      'A Challenger 650 comes to market Monday'
    ];
    var n = Math.floor(Math.random()*NEWS.length);
    /* the wallpaper is a find: it shows only when a hand wakes the phone */
    function egg(e){ if(e && e.isTrusted === false) return; phone.classList.add('fin-egg'); }
    phone.addEventListener('click', egg);
    phone.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') egg(e); });
    function lift(on){
      if(!on || narrow()){ phone.style.scale = ''; phone.style.translate = ''; return; }
      if(phone.style.scale) return;
      var t = phone.querySelector('.txt'); if(!t) return;
      var fs = parseFloat(getComputedStyle(t).fontSize) || 8;
      var r = phone.getBoundingClientRect(), k = Math.max(1, 12.6 / (fs * (r.width / Math.max(1, phone.offsetWidth))));
      k = Math.min(k, 2.2);
      var w = r.width*k, h = r.height*k, cx = r.left + r.width/2, cy = r.top + r.height/2, M = 18;
      var nx = Math.min(innerWidth - M - w/2, Math.max(M + w/2, cx)), ny = Math.min(innerHeight - M - h/2, Math.max(M + h/2, cy));
      phone.style.scale = k.toFixed(3); phone.style.translate = Math.round(nx - cx) + 'px ' + Math.round(ny - cy) + 'px';
    }
    new MutationObserver(function(){
      if(!phone.classList.contains('awake') && phone.classList.contains('fin-egg')) phone.classList.remove('fin-egg');
      lift(phone.classList.contains('awake') && !/grab|held|carried/.test(phone.className));
      if(!phone.classList.contains('awake') || phone._finWas) { if(!phone.classList.contains('awake')) phone._finWas = false; return; }
      phone._finWas = true;
      var first = phone.querySelector('.screen .msg:not(.fin-n)'); if(!first) return;
      var m = phone.querySelector('.msg.fin-n');
      if(!m){ m = el('div', 'msg fin-n'); m.innerHTML = '<div class="who"></div><div class="txt"></div>';
        first.parentNode.insertBefore(m, first); }
      m.querySelector('.who').innerHTML = 'Vela<span>now</span>';
      m.querySelector('.txt').textContent = NEWS[n++ % NEWS.length];
    }).observe(phone, {attributes:true, attributeFilter:['class']});
  }

  /* ==========================================================================
     THE AIRCRAFT PAGES
     ========================================================================== */
  function homePage(){
    /* --- #apply, #check and #notify open their tab --- */
    var MAP = {'#apply':'t-apply', '#check':'t-check', '#notify':'t-heads'};
    function fromHash(){ var id = MAP[location.hash]; if(!id) return;
      var t = document.getElementById(id); if(!t) return; t.click();
      setTimeout(function(){ var tl = document.querySelector('.tabs') || t;
        tl.scrollIntoView({behavior: low() ? 'auto' : 'smooth', block:'start'}); }, 80); }
    fromHash(); addEventListener('hashchange', fromHash);

    /* --- arriving from a folder: the photograph settles into the first print --- */
    var inn = ss('fin-in'); ss('fin-in', null);
    if(inn && !low()){
      try { inn = JSON.parse(inn); } catch(e){ inn = null; }
      var first = document.querySelector('.ins-card img');
      if(inn && first){
        var z = el('div', 'fin-zoom', document.body);
        z.style.transition = 'none';
        z.style.backgroundImage = 'url("' + (/^https?:/.test(inn.src) ? '' : ROOT) + inn.src + '")';
        z.style.left = '0px'; z.style.top = '0px'; z.style.width = innerWidth + 'px'; z.style.height = innerHeight + 'px';
        z.style.borderRadius = '0px';
        var settle = function(){
          var r = first.getBoundingClientRect();
          z.style.transition = '';
          if(r.width < 40 || r.top > innerHeight){ z.style.opacity = '0'; }
          else { z.style.left = r.left + 'px'; z.style.top = r.top + 'px';
            z.style.width = r.width + 'px'; z.style.height = r.height + 'px'; z.style.borderRadius = '3px'; }
          setTimeout(function(){ z.style.opacity = '0'; }, 1000);
          setTimeout(function(){ z.remove(); }, 2000);
        };
        if(document.readyState === 'complete') setTimeout(settle, 120);
        else addEventListener('load', function(){ setTimeout(settle, 120); });
      }
    }

    typewriter();
    signature();
    stamps();
    pillMidway();
  }

  /* ---------- the status pill sits exactly halfway ----------
     Halfway between the foot of the spec-sheet line above it and the top of
     the aircraft's name below it, measured on the glyphs the browser drew,
     not on the boxes round them. Offsets ignore transforms, so the entrance
     animation can't throw the measurement off; the pill moves with `top`
     (it is position:relative), so nothing else on the page moves with it. */
  function pillMidway(){
    var pill = document.querySelector('.hero-text .status');
    var label = document.querySelector('.hero-top .label-caps');
    var h1 = document.querySelector('.hero-text h1');
    if(!pill || !label || !h1) return;
    var cv = document.createElement('canvas'), g = cv.getContext && cv.getContext('2d');
    if(!g || !('fontBoundingBoxAscent' in (g.measureText('x') || {}))) return;
    function top(el){ var y = 0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
    function metrics(el, text){
      var cs = getComputedStyle(el);
      g.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var m = g.measureText(text);
      var lh = parseFloat(cs.lineHeight);
      if(!lh) lh = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      var pad = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
      var base = top(el) + pad + (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent))/2 + m.fontBoundingBoxAscent;
      return {base: base, ink: m.actualBoundingBoxAscent};
    }
    function place(){
      pill.style.top = '';
      if(!pill.offsetParent || getComputedStyle(pill).display === 'none') return;
      var lt = (label.textContent || '').trim(); if(getComputedStyle(label).textTransform === 'uppercase') lt = lt.toUpperCase();
      var first = (h1.firstChild && h1.firstChild.nodeType === 3 ? h1.firstChild.nodeValue : h1.textContent).trim();
      if(!lt || !first) return;
      var above = metrics(label, lt).base;                 /* capitals sit on the line */
      var nm = metrics(h1, first), below = nm.base - nm.ink;
      var rel = parseFloat(getComputedStyle(pill).top) || 0;   /* a stylesheet may already nudge it */
      var pt = top(pill) - rel, ph = pill.offsetHeight;
      var want = above + (below - above - ph)/2;
      var d = Math.round((want - pt)*2)/2;
      if(Math.abs(d) < 60) pill.style.top = d + 'px';
    }
    var go = function(){ requestAnimationFrame(place); };
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
    addEventListener('load', go);
    var t; addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(place, 120); });
  }

  /* ---------- keys that clack ---------- */
  function typewriter(){
    var last = 0;
    document.addEventListener('keydown', function(e){
      var t = e.target; if(!t || !t.matches) return;
      if(!t.matches('input[type="text"],input[type="email"],input[type="tel"],input[type="number"],input:not([type]),textarea')) return;
      if(e.metaKey || e.ctrlKey || e.repeat) return;
      var now = performance.now(); if(now - last < 28) return; last = now;
      if(e.key === 'Enter') SND.bell();
      else if(e.key === ' ' || e.key === 'Backspace') SND.space();
      else if(e.key.length === 1) SND.key();
    }, true);
  }

  /* ---------- a line to sign on ---------- */
  function signature(){
    var cert = document.querySelector('#form-wrap .certify'); if(!cert) return;
    var holder = cert.closest('.full') || cert.parentNode;
    var wrap = el('div', 'full fin-sign');
    var lab = el('span', 'f-label', wrap); lab.textContent = 'Signature';
    var pad = el('div', 'fin-pad', wrap);
    var x = el('span', 'fin-x', pad); x.textContent = '×'; x.setAttribute('aria-hidden', 'true');
    var cv = el('canvas', '', pad); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Signature pad');
    var clr = el('button', 'fin-clear', pad); clr.type = 'button'; clr.textContent = 'Clear';
    holder.parentNode.insertBefore(wrap, holder);
    var g = cv.getContext('2d'), dpr = 1, drawing = false, pts = [], lastW = 2, lastSnd = 0;
    function size(){ var r = pad.getBoundingClientRect(); if(!r.width) return;
      var keep = wrap.classList.contains('inked') ? cv.toDataURL() : null;
      dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width*dpr); cv.height = Math.round(r.height*dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineCap = 'round'; g.lineJoin = 'round';
      if(keep){ var im = new Image(); im.onload = function(){ g.setTransform(1,0,0,1,0,0); g.drawImage(im, 0, 0, cv.width, cv.height); g.setTransform(dpr,0,0,dpr,0,0); }; im.src = keep; } }
    size(); addEventListener('resize', size);
    if('ResizeObserver' in window) new ResizeObserver(size).observe(pad);
    function at(e){ var r = cv.getBoundingClientRect(); return {x:e.clientX - r.left, y:e.clientY - r.top, t:performance.now()}; }
    cv.addEventListener('pointerdown', function(e){ e.preventDefault(); drawing = true; cv.setPointerCapture(e.pointerId);
      pts = [at(e)]; lastW = 2.2; wrap.classList.add('inked'); });
    cv.addEventListener('pointermove', function(e){
      if(!drawing) return;
      var p = at(e), a = pts[pts.length - 1]; if(!a) return;
      var d = Math.hypot(p.x - a.x, p.y - a.y); if(d < .8) return;
      var v = d / Math.max(1, p.t - a.t);                               /* faster is thinner, like a nib */
      var w = Math.max(.9, Math.min(3.2, 3.4 - v*1.4)); w = lastW + (w - lastW)*.35; lastW = w;
      g.strokeStyle = '#1C2742'; g.lineWidth = w;
      g.beginPath();
      var b = pts.length > 1 ? pts[pts.length - 2] : a;
      var m1 = {x:(b.x + a.x)/2, y:(b.y + a.y)/2}, m2 = {x:(a.x + p.x)/2, y:(a.y + p.y)/2};
      g.moveTo(m1.x, m1.y); g.quadraticCurveTo(a.x, a.y, m2.x, m2.y); g.stroke();
      pts.push(p);
      if(p.t - lastSnd > 90){ lastSnd = p.t; SND.pen(); }
    });
    function up(){ drawing = false; pts = []; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    clr.addEventListener('click', function(){ g.clearRect(0, 0, cv.width, cv.height); wrap.classList.remove('inked');
      if(window.APSound) window.APSound.tick(); });
  }

  /* ---------- RECEIVED, with the date, pressed into the paper ---------- */
  function stampOn(host, word){
    if(!host || host.querySelector('.fin-stamp')) return;
    var check = host.querySelector('.check');
    var s = el('div', 'fin-stamp fin-seal'); s.setAttribute('aria-hidden', 'true');
    var b = el('b', '', s); b.textContent = word;
    var d = new Date(), M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var sm = el('small', '', s); sm.textContent = M[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
    /* the stamp takes the place of the tick */
    if(check){ check.style.display = 'none'; check.parentNode.insertBefore(s, check); }
    else host.insertBefore(s, host.firstChild);
    setTimeout(function(){
      s.classList.add('down');
      if(low()) return;
      SND.stamp();
      setTimeout(function(){ host.classList.add('fin-thud'); }, 120);
      setTimeout(function(){ host.classList.remove('fin-thud'); }, 520);
    }, low() ? 0 : 560);
  }
  function stamps(){
    var ov = document.getElementById('confirm-overlay'), done = document.getElementById('done');
    function doneUp(){ return done && done.style.display && done.style.display !== 'none'; }
    if(ov) new MutationObserver(function(){
      if(ov.classList.contains('open')) stampOn(ov.querySelector('.confirm-card'), 'LOI Received');
      else if(doneUp()) stampOn(done.querySelector('section') || done, 'LOI Received');
    }).observe(ov, {attributes:true, attributeFilter:['class']});
    var msg = document.getElementById('iq-msg');
    if(msg) new MutationObserver(function(){
      var ok = /show/.test(msg.className) && /ok/.test(msg.getAttribute('style') || '');
      if(!ok) return;
      var old = msg.parentNode.querySelector('.fin-stamp'); if(old) old.remove();
      var s = el('div', 'fin-stamp fin-sent'); s.setAttribute('aria-hidden', 'true');
      var b = el('b', '', s); b.textContent = 'Noted';
      var d = new Date(), M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var sm = el('small', '', s); sm.textContent = M[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
      msg.parentNode.insertBefore(s, msg.nextSibling);
      setTimeout(function(){ s.classList.add('down'); if(!low()) SND.stamp(); }, low() ? 0 : 420);
    }).observe(msg, {attributes:true, attributeFilter:['class','style']});
  }

  /* ---------- nothing on the page is set under 12px ----------
     The desk has been through many passes; rather than trust every one of
     them, measure what the browser actually drew and lift anything smaller.
     The phone is left alone: it lifts itself to be read when it wakes. */
  var lifted = [];
  function floor12(){
    lifted.forEach(function(n){ n.style.removeProperty('font-size'); });
    lifted = [];
    var all = document.body.getElementsByTagName('*');
    for(var i = 0; i < all.length; i++){
      var n = all[i];
      if(n.closest('svg,.phone,.lens,script,style,noscript')) continue;
      var t = false;
      for(var c = n.firstChild; c; c = c.nextSibling){
        if(c.nodeType === 3 && /\S/.test(c.nodeValue)){ t = true; break; }
      }
      if(!t) continue;
      var fs = parseFloat(getComputedStyle(n).fontSize);
      if(fs && fs < 11.95){ n.style.setProperty('font-size', '12px', 'important'); lifted.push(n); }
    }
  }

  /* ========================================================================== */
  function start(){
    try { if(LAND) landing(); } catch(e){ console.error(e); }
    try { phoneNews(); } catch(e){ console.error(e); }
    try { if(PROP) homePage(); } catch(e){ console.error(e); }
    try { floor12(); setTimeout(floor12, 1500); } catch(e){ console.error(e); }
    addEventListener('resize', function(){
      clearTimeout(start._r);
      start._r = setTimeout(function(){
        var mug = document.querySelector('.obj.mug'); if(mug) outline(mug, 'cup', 4);
        var ph = document.querySelector('.obj.phone'); if(ph) outline(ph, 'phone', 6);
        try { floor12(); } catch(e){}
      }, 200);
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
/* batch 17: the parked cup and phone on the aircraft pages follow the folder tabs, so the cup's handle never sits on a tab and the phone never covers the prints */
(function(){
  if(document.body && document.body.classList.contains('land')) return;
  function place(){
    if(innerWidth<980||document.body.classList.contains('land')) return;
    var tabs=document.querySelector('.tabs'),mug=document.querySelector('.obj.mug.parked'),ph=document.querySelector('.obj.phone.parked');
    if(!tabs) return;
    var t=tabs.getBoundingClientRect().top;
    [[mug,14],[ph,-57]].forEach(function(o){var e=o[0];if(!e)return;
      if(!e.classList.contains('parked'))return;
      var r=e.getBoundingClientRect(),cur=parseFloat(getComputedStyle(e).top)||0;
      var want=(o[1]>0)?(t-o[1]-r.height):(t+o[1]);
      e.style.setProperty('--v17t',(cur+(want-r.top)).toFixed(0)+'px');});
  }
  function go(){place();setTimeout(place,600);setTimeout(place,1800);}
  if(document.readyState==='complete') go(); else addEventListener('load',go);
  addEventListener('resize',function(){clearTimeout(go.t);go.t=setTimeout(place,150);});
})();
/* batch 18: the cup can be knocked over, and the phone chimes the first time it is picked up.
   Pick the cup up three times (the third grab arms it, it goes over when you let go) or swing it hard
   while holding it, and it tips onto its side where it is, coffee running out of the mouth across
   whatever it lands on. The sounds go through the site's own switch (APSound), so mute holds. */
(function(){
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function low(){ return reduce || html.classList.contains('perf-low'); }
  function ss(k, v){ try { if(v === undefined) return sessionStorage.getItem(k);
    sessionStorage.setItem(k, v); } catch(e){ return null; } }

  /* ---------- sound: quiet, and only when the site's sound is on ---------- */
  var actx = null, bus = null;
  function ac(){
    if(!(window.APSound && window.APSound.enabled && window.APSound.enabled())) return null;
    if(!actx){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      actx = new AC(); bus = actx.createGain(); bus.gain.value = .9; bus.connect(actx.destination); }
    if(actx.state === 'suspended') actx.resume();
    return actx;
  }
  function env(c, g, t0, peak, att, dur){
    g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + att);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  }
  function noise(c, o){
    var t0 = c.currentTime + (o.delay || 0), len = Math.max(1, Math.floor(c.sampleRate * o.dur));
    var b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for(var i = 0; i < len; i++) d[i] = Math.random()*2 - 1;
    var s = c.createBufferSource(); s.buffer = b;
    var f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || .8;
    f.frequency.setValueAtTime(o.f, t0);
    if(o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
    var g = c.createGain(); env(c, g, t0, o.gain, o.att || .002, o.dur);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t0); s.stop(t0 + o.dur + .02);
  }
  function tone(c, o){
    var t0 = c.currentTime + (o.delay || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t0);
    if(o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
    env(c, g, t0, o.gain, o.att || .003, o.dur);
    osc.connect(g); g.connect(bus); osc.start(t0); osc.stop(t0 + o.dur + .02);
  }
  /* ceramic on wood: a low knock, the click of the glaze, then it rocks once and settles */
  function clunk(delay){
    var c = ac(); if(!c) return; delay = delay || 0;
    tone(c,  {f:168, to:96,  dur:.16, gain:.065, delay:delay});
    noise(c, {f:520, type:'lowpass', q:.7, dur:.07, gain:.045, delay:delay});
    noise(c, {f:2700, q:4, dur:.035, gain:.02, delay:delay});
    tone(c,  {f:1860, to:1830, dur:.09, gain:.005, type:'triangle', delay:delay});
    tone(c,  {f:190, to:120, dur:.08, gain:.022, delay:delay + .085});
    noise(c, {f:2900, q:4, dur:.025, gain:.009, delay:delay + .085});
    tone(c,  {f:200, to:130, dur:.06, gain:.009, delay:delay + .15});
  }
  /* and the coffee going: a soft wash, a few drops after it */
  function splash(delay){
    var c = ac(); if(!c) return; delay = delay || 0;
    noise(c, {f:650, to:1500, q:.7, dur:.30, att:.03, gain:.03, delay:delay});
    noise(c, {f:300, type:'lowpass', q:.6, dur:.24, att:.04, gain:.018, delay:delay + .02});
    noise(c, {f:3800, q:.8, dur:.16, att:.01, gain:.007, delay:delay + .11});
  }
  /* a soft rising three-note chime, like a message arriving */
  function chime(){
    var c = ac(); if(!c) return false;
    [1318.51, 1661.22, 1975.53].forEach(function(f, i){
      var d = .12 + i*.085;
      tone(c, {f:f, dur:.34, gain:.016, att:.005, delay:d});
      tone(c, {f:f*2, dur:.16, gain:.0035, att:.004, delay:d});
    });
    return true;
  }

  /* ---------- the phone: first time it's picked up this session ---------- */
  addEventListener('pointerdown', function(e){
    if(e.button > 0 || !e.isTrusted) return;
    if(!(e.target && e.target.closest && e.target.closest('.obj.phone'))) return;
    if(ss('v18-chime')) return;
    if(chime()) ss('v18-chime', '1');
  }, true);

  /* ---------- the cup ---------- */
  var KEY = 'v18-grabs', SPEED = 2.5, SPAN = 60;
  var spilt = false, g = null;   /* g: the grab in progress */
  function grabs(){ return parseInt(ss(KEY) || '0', 10) || 0; }

  function mugOf(t){ return t && t.closest ? t.closest('.obj.mug') : null; }

  addEventListener('pointerdown', function(e){
    var mug = mugOf(e.target); if(!mug) return;
    if(spilt){ e.stopPropagation(); e.preventDefault(); return; }
    if(e.button > 0) return;
    g = {id:e.pointerId, mug:mug, x0:e.clientX, y0:e.clientY, moved:false, pts:[{x:e.clientX, y:e.clientY, t:e.timeStamp}]};
  }, true);

  addEventListener('pointermove', function(e){
    if(spilt && mugOf(e.target)){ e.stopPropagation(); return; }
    if(!g || e.pointerId !== g.id) return;
    var now = e.timeStamp;
    g.pts.push({x:e.clientX, y:e.clientY, t:now});
    while(g.pts.length > 2 && now - g.pts[1].t > 160) g.pts.shift();
    if(!g.moved){
      if(Math.abs(e.clientX - g.x0) < 4 && Math.abs(e.clientY - g.y0) < 4) return;
      g.moved = true; ss(KEY, String(grabs() + 1));
    }
    /* a hard swing: the hand averaging over 2.5px a millisecond for 60ms or more */
    var i = g.pts.length - 1, len = 0;
    while(i > 0 && now - g.pts[i - 1].t <= SPAN + 25){
      len += Math.hypot(g.pts[i].x - g.pts[i-1].x, g.pts[i].y - g.pts[i-1].y); i--; }
    var span = now - g.pts[i].t;
    if(span >= SPAN - 8 && len / span > SPEED){
      e.stopPropagation();           /* the cup stops where the hand let it go */
      knock(g.mug, dirOf(g), g);
    }
  }, true);

  function up(e){
    if(!g || e.pointerId !== g.id) return;
    var cur = g; g = null;
    if(spilt){ setTimeout(function(){ cur.mug.classList.add('v18-inert'); }, 0); return; }
    if(cur.moved && grabs() >= 3){
      var d = dirOf(cur);
      setTimeout(function(){ knock(cur.mug, d, null); }, 0);   /* after the drag has set it down */
    }
  }
  addEventListener('pointerup', up, true);
  addEventListener('pointercancel', up, true);

  /* the way the hand was going; a cup goes over in the direction it was moving */
  function dirOf(gr){
    var p = gr.pts, n = p.length - 1, last = p[n], a = p[0];
    for(var i = n; i >= 0; i--){ a = p[i]; if(last.t - a.t > 90) break; }
    var dx = last.x - a.x, dy = last.y - a.y;
    if(Math.hypot(dx, dy) < 6){ dx = last.x - gr.x0; dy = last.y - gr.y0; }
    if(Math.hypot(dx, dy) < 6) return Math.PI * .86;
    return Math.atan2(dy, dx);
  }

  /* ---------- light: from the upper left, as in the photographs ---------- */
  var LX = -.55, LY = -.83;
  function mix(a, b, k){ return [0,1,2].map(function(i){ return Math.round(a[i] + (b[i] - a[i])*k); }); }
  function rgb(c){ return 'rgb(' + c.join(',') + ')'; }
  /* a lying cylinder lit from above-left: the colour across it, from one side to the other */
  function shade(u, nx, ny){
    var k = .62, lx = LX*k, ly = LY*k, lz = Math.sqrt(1 - k*k);
    var nz = Math.sqrt(Math.max(0, 1 - u*u)), nl = u*(nx*lx + ny*ly) + nz*lz;
    var b = Math.max(0, nl);
    /* the half-vector seen across the cylinder: a lying cup always shows one bright line along it */
    var hn = nx*lx + ny*ly, hz = lz + 1, hl = Math.hypot(hn, hz);
    var sp = .8*Math.pow(Math.max(0, (u*hn + nz*hz)/hl), 60);
    var c = mix([164,156,143], [250,248,244], Math.pow(b, .7));
    return mix(c, [255,255,255], sp*.9);
  }

  /* ---------- the cup on its side, seen from above ---------- */
  function cupSVG(R, a, side){
    var L = R*2.24, x0 = -L/2, x1 = L/2, s = side;
    var ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
    var lx = LX*ca + LY*sa, ly = -LX*sa + LY*ca;            /* the light in the cup's own frame */
    var ext = Math.hypot(L/2 + R*.4, R*1.55) + R*.5 + 16, S = Math.ceil(ext*2);
    var f = function(v){ return (+v).toFixed(2); };
    var stops = '';
    for(var i = 0; i <= 32; i++){ var u = -1 + i/16; stops += '<stop offset="' + f(i/32) + '" stop-color="' + rgb(shade(u, nx, ny)) + '"/>'; }
    var hc = shade(s*.55, nx, ny), hdark = mix(hc, [120,110,96], .55);
    var shx = -lx*R*.16, shy = -ly*R*.16;                   /* shadows fall away from the light */
    var body = 'M' + f(x1) + ' ' + f(-R) + 'L' + f(x0) + ' ' + f(-R) + 'A' + f(R*.17) + ' ' + f(R) + ' 0 0 0 ' + f(x0) + ' ' + f(R) + 'L' + f(x1) + ' ' + f(R) + 'Z';
    var hp = 'M' + f(-L*.26) + ' ' + f(s*R*.82) + 'C' + f(-L*.29) + ' ' + f(s*R*1.62) + ' ' + f(L*.17) + ' ' + f(s*R*1.62) + ' ' + f(L*.15) + ' ' + f(s*R*.82);
    var hw = R*.2, mo = x1 + R*.01;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + S + ' ' + S + '" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="v18b" gradientUnits="userSpaceOnUse" x1="0" y1="' + f(-R) + '" x2="0" y2="' + f(R) + '">' + stops + '</linearGradient>' +
        '<linearGradient id="v18f" gradientUnits="userSpaceOnUse" x1="' + f(x0 - R*.17) + '" y1="0" x2="' + f(x0 + L*.4) + '" y2="0">' +
          '<stop offset="0" stop-color="#4A3E30" stop-opacity=".26"/><stop offset="1" stop-color="#4A3E30" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="v18i" gradientUnits="userSpaceOnUse" cx="' + f(mo - lx*R*.06) + '" cy="' + f(-ly*R*.3) + '" r="' + f(R*.95) + '">' +
          '<stop offset="0" stop-color="#7C6A57"/><stop offset=".5" stop-color="#46362A"/><stop offset="1" stop-color="#1E150E"/></radialGradient>' +
        '<filter id="v18s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + f(R*.11) + '"/></filter>' +
        '<filter id="v18c" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + f(R*.035) + '"/></filter>' +
        '<filter id="v18h" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + f(R*.025) + '"/></filter>' +
      '</defs>' +
      '<g transform="translate(' + f(S/2) + ' ' + f(S/2) + ') rotate(' + f(a*180/Math.PI) + ')">' +
        /* the soft shadow it throws, and the tight dark one where it meets the surface */
        '<g transform="translate(' + f(shx) + ' ' + f(shy) + ')" filter="url(#v18s)" opacity=".5" fill="#140A03">' +
          '<path d="' + body + '"/><ellipse cx="' + f(x1) + '" cy="0" rx="' + f(R*.3) + '" ry="' + f(R) + '"/>' +
          '<path d="' + hp + '" fill="none" stroke="#140A03" stroke-width="' + f(hw) + '" stroke-linecap="round"/></g>' +
        '<g transform="translate(' + f(shx*.3) + ' ' + f(shy*.3) + ')" filter="url(#v18c)" opacity=".45" fill="#140A03">' +
          '<rect x="' + f(x0) + '" y="' + f(-R*.92) + '" width="' + f(L) + '" height="' + f(R*1.84) + '" rx="' + f(R*.3) + '"/></g>' +
        /* the handle, standing off one side */
        '<path d="' + hp + '" fill="none" stroke="' + rgb(hdark) + '" stroke-width="' + f(hw*1.18) + '" stroke-linecap="round" transform="translate(' + f(-lx*R*.05) + ' ' + f(-ly*R*.05) + ')"/>' +
        '<path d="' + hp + '" fill="none" stroke="' + rgb(hc) + '" stroke-width="' + f(hw) + '" stroke-linecap="round"/>' +
        '<path d="' + hp + '" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="' + f(hw*.24) + '" stroke-linecap="round" filter="url(#v18h)" transform="translate(' + f(lx*R*.05) + ' ' + f(ly*R*.05) + ')"/>' +
        /* the body */
        '<path d="' + body + '" fill="url(#v18b)"/>' +
        '<path d="' + body + '" fill="url(#v18f)"/>' +
        '<path d="M' + f(x0 + R*.05) + ' ' + f(-R*.86) + 'A' + f(R*.13) + ' ' + f(R*.86) + ' 0 0 0 ' + f(x0 + R*.05) + ' ' + f(R*.86) + '" fill="none" stroke="#8E8473" stroke-opacity=".38" stroke-width="' + f(R*.025) + '"/>' +
        '<path d="' + body + '" fill="none" stroke="#7E7462" stroke-opacity=".32" stroke-width=".7"/>' +
        /* the mouth: the lip, the dark inside, and coffee on the lip where it ran out */
        '<ellipse cx="' + f(x1) + '" cy="0" rx="' + f(R*.3) + '" ry="' + f(R) + '" fill="url(#v18b)"/>' +
        '<ellipse cx="' + f(x1) + '" cy="0" rx="' + f(R*.3) + '" ry="' + f(R) + '" fill="none" stroke="#7E7462" stroke-opacity=".35" stroke-width=".7"/>' +
        '<ellipse cx="' + f(mo) + '" cy="0" rx="' + f(R*.235) + '" ry="' + f(R*.86) + '" fill="url(#v18i)"/>' +
        '<ellipse cx="' + f(mo) + '" cy="0" rx="' + f(R*.235) + '" ry="' + f(R*.86) + '" fill="none" stroke="#2B1A0C" stroke-opacity=".55" stroke-width="' + f(R*.03) + '"/>' +
        '<path d="M' + f(mo + R*.2) + ' ' + f(R*.35) + 'Q' + f(mo + R*.29) + ' ' + f(R*.05) + ' ' + f(mo + R*.21) + ' ' + f(-R*.3) + '" fill="none" stroke="#3A2210" stroke-opacity=".55" stroke-width="' + f(R*.05) + '" stroke-linecap="round" filter="url(#v18h)"/>' +
        /* the glaze catching the lamp along its length */
        '<path d="M' + f(x0 + R*.25) + ' 0H' + f(x1 - R*.36) + '" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="' + f(R*.07) + '" stroke-linecap="round" filter="url(#v18h)" transform="translate(0 ' + f(hiY(nx, ny)*R) + ')"/>' +
      '</g></svg>';
    function hiY(nx2, ny2){            /* where across the body the brightest line falls */
      var best = 0, bv = -1;
      for(var u = -1; u <= 1; u += .02){ var c = shade(u, nx2, ny2), v = c[0] + c[1] + c[2]; if(v > bv){ bv = v; best = u; } }
      return best;
    }
  }

  /* ---------- what the coffee lands on ---------- */
  function surface(x, y, skip){
    if(x < 0 || y < 0 || x > innerWidth || y > innerHeight || !document.elementsFromPoint) return 'wood';
    var list = document.elementsFromPoint(x, y), n = null;
    for(var i = 0; i < list.length; i++){
      var c = list[i];
      if(skip.contains(c) || c.closest('.desk-objects > .obj, .v18-spill, .fin-steam, .lens, .toyhint')) continue;
      if(c.classList && (c.classList.contains('desk-objects') || c.classList.contains('desk-marks'))) continue;
      n = c; break;
    }
    if(!n) return 'wood';
    if(n.tagName === 'IMG') return n.closest('.notepad') ? 'paper' : 'wood';   /* a glossy print holds it like varnish */
    for(var e = n; e && e !== document.body && e !== html; e = e.parentElement){
      var cs = getComputedStyle(e), bi = cs.backgroundImage;
      if(bi && bi !== 'none') return /wood/i.test(bi) ? 'wood' : 'paper';
      var m = (cs.backgroundColor || '').match(/[\d.]+/g);
      if(m && m.length >= 3 && (m.length < 4 || +m[3] > .5)){
        var lum = (.2126*m[0] + .7152*m[1] + .0722*m[2]) / 255;
        return lum > .55 ? 'paper' : 'wood';
      }
    }
    return 'wood';
  }

  function ease(t){ t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); }

  /* ---------- the spill: one organic shape that runs out of the mouth ---------- */
  function spillCanvas(R, a, kind, mx, my){
    var H = Math.ceil(R*3.7), dpr = Math.min(2, window.devicePixelRatio || 1);
    /* cut to the page, so coffee running off the edge never widens or lengthens it */
    var de = document.documentElement, pw = de.clientWidth - scrollX;
    var phh = Math.max(document.body.scrollHeight, de.scrollHeight) - scrollY;
    var cl = Math.max(0, Math.ceil(H - mx)), cr = Math.max(0, Math.ceil(mx + H - pw));
    var ct = Math.max(0, Math.ceil(H - my - scrollY)), cbt = Math.max(0, Math.ceil(my + H - phh));
    var W = Math.max(1, H*2 - cl - cr), Hh = Math.max(1, H*2 - ct - cbt);
    var cv = document.createElement('canvas');
    cv.className = 'v18-spill' + (kind === 'paper' ? ' on-paper' : '');
    cv.setAttribute('aria-hidden', 'true');
    cv.width = Math.round(W*dpr); cv.height = Math.round(Hh*dpr);
    cv.style.width = W + 'px'; cv.style.height = Hh + 'px';
    var ctx = cv.getContext('2d'); if(!ctx) return null;
    var ca = Math.cos(a), sa = Math.sin(a);
    var lx = LX*ca + LY*sa, ly = -LX*sa + LY*ca;
    var rnd = Math.random;
    var ph = [rnd()*6.28, rnd()*6.28, rnd()*6.28, rnd()*6.28];
    var cb = R*.95, rx = R*1.45, ry = R*1.0;
    var fingers = [], nF = 2 + Math.round(rnd());
    for(var k = 0; k < nF; k++) fingers.push({th:(k % 2 ? 1 : -1)*(.25 + rnd()*.85), amp:R*(.2 + rnd()*.24), w:.16 + rnd()*.1});
    fingers.push({th:Math.PI*(rnd() < .5 ? .62 : -.62), amp:R*.16, w:.3});   /* it creeps back along the cup a little */
    function base(th){
      var c = Math.cos(th), s = Math.sin(th);
      var r = rx*ry / Math.sqrt(ry*ry*c*c + rx*rx*s*s);
      return r * (1 + .07*c) * (1 + .07*Math.sin(3*th + ph[0]) + .05*Math.sin(5*th + ph[1]) + .03*Math.sin(8*th + ph[2]) + .016*Math.sin(13*th + ph[3]));
    }
    function fing(th){
      var v = 0;
      fingers.forEach(function(F){ var d = Math.atan2(Math.sin(th - F.th), Math.cos(th - F.th)); v += F.amp*Math.exp(-(d*d)/(2*F.w*F.w)); });
      return v;
    }
    var N = 168, B = [], Fv = [];
    for(var j = 0; j < N; j++){ var th = j/N*Math.PI*2; B.push(base(th)); Fv.push(fing(th)); }
    var drops = [];
    for(var q = 0; q < 6; q++){
      var da = (rnd() - .5)*1.7, dist = R*(1.9 + rnd()*1.25);
      drops.push({x:Math.cos(da)*dist, y:Math.sin(da)*dist, r:.9 + rnd()*1.7, delay:30 + rnd()*110, dur:260 + rnd()*170});
    }
    var P = kind === 'paper'
      ? {c0:'rgba(70,38,13,.80)', c1:'rgba(96,55,22,.62)', c2:'rgba(118,71,30,.50)', edge:'rgba(58,30,9,.6)', ew:2.1, gl:.17, sheen:.06, drop:'rgba(92,52,20,.62)'}
      : {c0:'rgba(24,12,4,.90)', c1:'rgba(36,19,8,.84)', c2:'rgba(54,30,12,.74)', edge:'rgba(12,6,2,.6)', ew:1.3, gl:.32, sheen:.11, drop:'rgba(34,18,7,.84)'};
    var canBlur = 'filter' in ctx;
    function path(t){
      var g0 = ease(t/850), g1 = ease((t - 150)/900), cx = cb*g0, p = new Path2D();
      var pts = [];
      for(var j = 0; j < N; j++){
        var th = j/N*Math.PI*2, r = B[j]*(.08 + .92*g0) + Fv[j]*g1;
        pts.push([cx + Math.cos(th)*r, Math.sin(th)*r]);
      }
      var m0 = [(pts[N-1][0] + pts[0][0])/2, (pts[N-1][1] + pts[0][1])/2];
      p.moveTo(m0[0], m0[1]);
      for(var i = 0; i < N; i++){ var A = pts[i], Bn = pts[(i + 1) % N];
        p.quadraticCurveTo(A[0], A[1], (A[0] + Bn[0])/2, (A[1] + Bn[1])/2); }
      p.closePath();
      return {p:p, cx:cx, g:g0};
    }
    function draw(t){
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(H - cl, H - ct); ctx.rotate(a);
      var o = path(t), p = o.p;
      var gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R*2.7);
      gr.addColorStop(0, P.c0); gr.addColorStop(.45, P.c1); gr.addColorStop(1, P.c2);
      ctx.fillStyle = gr; ctx.fill(p);
      if(canBlur) ctx.filter = 'blur(.5px)';
      ctx.strokeStyle = P.edge; ctx.lineWidth = P.ew; ctx.stroke(p);
      ctx.save(); ctx.clip(p);
      /* the meniscus catches the lamp on the side facing it */
      if(canBlur) ctx.filter = 'blur(.7px)';
      ctx.save(); ctx.translate(-lx*2.2, -ly*2.2);
      ctx.strokeStyle = 'rgba(255,238,214,' + P.gl + ')'; ctx.lineWidth = 1.4; ctx.stroke(p); ctx.restore();
      if(canBlur) ctx.filter = 'none';
      /* and a soft reflection of it across the wet surface */
      var hx = o.cx + lx*R*.55*o.g, hy = ly*R*.5*o.g, hr = R*.95*(.3 + .7*o.g);
      var sh = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      sh.addColorStop(0, 'rgba(255,240,220,' + P.sheen + ')'); sh.addColorStop(1, 'rgba(255,240,220,0)');
      ctx.fillStyle = sh; ctx.fillRect(hx - hr, hy - hr, hr*2, hr*2);
      ctx.restore();
      if(canBlur) ctx.filter = 'none';
      /* a few drops thrown clear, which land and stay */
      drops.forEach(function(d){
        var k = ease((t - d.delay)/d.dur); if(t < d.delay) return;
        var x = d.x*k, y = d.y*k, ang = Math.atan2(d.y, d.x), st = 1 + 1.5*(1 - k);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        ctx.beginPath(); ctx.ellipse(0, 0, d.r*st, d.r*(.75 + .25*k), 0, 0, Math.PI*2);
        ctx.fillStyle = P.drop; ctx.fill(); ctx.restore();
      });
    }
    return {el:cv, x:H - cl, y:H - ct, draw:draw, end:1150};
  }

  /* ---------- over it goes ---------- */
  function knock(mug, dir, gr){
    if(spilt || !mug || !mug.offsetParent) return;
    spilt = true;
    ss(KEY, '0');
    mug.classList.remove('grabbing', 'carried', 'sloshing');
    document.body.classList.remove('dragging');
    if(!gr) mug.classList.add('v18-inert');
    setTimeout(function(){ mug.classList.add('v18-inert'); }, 1600);   /* even if the hand's release never reaches it */

    var w = mug.offsetWidth, h = mug.offsetHeight;
    var R = w*.445, rimX = w*.469, rimY = h*.417;
    var dx = Math.cos(dir), dy = Math.sin(dir), side = Math.random() < .5 ? 1 : -1;
    var off = R*.4, cupX = rimX + dx*off, cupY = rimY + dy*off;

    /* the cup on its side, drawn in the mug so it stays with it */
    var wrap = document.createElement('span'); wrap.className = 'v18-cup'; wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = cupSVG(R, dir, side);
    var svg = wrap.firstChild, S = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);
    /* cut to the page, as the spill is */
    var mr = mug.getBoundingClientRect(), de = document.documentElement;
    var bx = mr.left + cupX - S/2, by = mr.top + cupY - S/2;
    var cl = Math.max(0, Math.ceil(-scrollX - bx)), cr = Math.max(0, Math.ceil(bx + S - (de.clientWidth - scrollX)));
    var ct = Math.max(0, Math.ceil(-scrollY - by));
    var cb = Math.max(0, Math.ceil(by + S - (Math.max(document.body.scrollHeight, de.scrollHeight) - scrollY)));
    var vw = Math.max(1, S - cl - cr), vh = Math.max(1, S - ct - cb);
    svg.setAttribute('viewBox', cl + ' ' + ct + ' ' + vw + ' ' + vh);
    wrap.style.width = vw + 'px'; wrap.style.height = vh + 'px';
    wrap.style.left = (cupX - S/2 + cl) + 'px'; wrap.style.top = (cupY - S/2 + ct) + 'px';
    wrap.style.transformOrigin = (S/2 - cl) + 'px ' + (S/2 - ct) + 'px';
    wrap.style.opacity = '0';
    mug.appendChild(wrap);
    mug.classList.add('empty');                        /* the steam stops */

    /* the coffee, on the layer under the cup */
    var mx = mr.left + cupX + dx*(R*1.12 + R*.06), my = mr.top + cupY + dy*(R*1.12 + R*.06);
    var kind = surface(mx + dx*R, my + dy*R, mug);
    var sp = spillCanvas(R, dir, kind, mx, my);
    if(sp){
      var cv = sp.el, z = getComputedStyle(mug).zIndex;
      cv.style.left = '0px'; cv.style.top = '0px';
      if(z && z !== 'auto') cv.style.zIndex = z;
      mug.parentNode.insertBefore(cv, mug);
      var r0 = cv.getBoundingClientRect();
      cv.style.left = Math.round(mx - sp.x - r0.left) + 'px';
      cv.style.top = Math.round(my - sp.y - r0.top) + 'px';
    }

    var spin = mug.querySelector('.mugspin') || mug.firstElementChild;
    if(low()){
      wrap.style.opacity = '1'; mug.classList.add('v18-spilt');
      if(sp) sp.draw(sp.end);
      clunk(0); splash(.05);
      return;
    }
    /* the photograph lurches the way it's going and is gone; the drawn cup lands, rocks once, settles */
    var ang = side*(4 + Math.random()*3);
    if(spin && spin.animate){
      spin.animate([{opacity:1, transform:'translate(0,0) scale(1)'},
                    {opacity:0, transform:'translate(' + (dx*R*.3).toFixed(1) + 'px,' + (dy*R*.3).toFixed(1) + 'px) scale(.96)'}],
                   {duration:220, easing:'cubic-bezier(.5,0,.75,0)', fill:'forwards'});
    }
    if(wrap.animate){
      wrap.animate([
        {opacity:0, transform:'translate(' + (-dx*R*.32).toFixed(1) + 'px,' + (-dy*R*.32).toFixed(1) + 'px) rotate(' + (-ang) + 'deg) scale(.95)'},
        {opacity:1, offset:.42, transform:'translate(' + (dx*R*.04).toFixed(1) + 'px,' + (dy*R*.04).toFixed(1) + 'px) rotate(' + (ang*.3).toFixed(2) + 'deg) scale(1)'},
        {opacity:1, offset:.7, transform:'translate(0,0) rotate(' + (-ang*.1).toFixed(2) + 'deg) scale(1)'},
        {opacity:1, transform:'translate(0,0) rotate(0deg) scale(1)'}
      ], {duration:480, delay:90, easing:'cubic-bezier(.22,1,.36,1)', fill:'forwards'});
    } else wrap.style.opacity = '1';
    setTimeout(function(){ wrap.style.opacity = '1'; mug.classList.add('v18-spilt'); }, 260);
    clunk(.17); splash(.26);
    if(sp){
      var t0 = 0;
      setTimeout(function(){
        (function f(t){ if(!t0) t0 = t; var e = t - t0; sp.draw(e); if(e < sp.end) requestAnimationFrame(f); })(performance.now());
      }, 200);
    }
  }
})();

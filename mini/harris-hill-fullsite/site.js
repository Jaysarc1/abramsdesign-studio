/* Pages behind the ride: the header settles as you scroll, and each section takes its own unhurried moment. */
(function(){
  var root=document.documentElement,rm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fx=!rm&&'IntersectionObserver' in window;
  var hd=document.querySelector('.hd'),$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  /* the sticky story: the beat nearest the middle of the screen owns the photograph */
  var stories=$$('.sty').map(function(s){return {beats:$$('.beat',s),figs:$$('.pin figure',s),idx:$$('.idx li',s),cur:0}});
  function setStory(s,i){
    s.figs.forEach(function(f,j){f.classList.toggle('was',j===s.cur&&j!==i);f.classList.toggle('on',j===i);if(j!==i&&j!==s.cur)f.classList.remove('was')});
    s.idx.forEach(function(l,j){l.classList.toggle('on',j===i)});s.cur=i}

  /* a line read word by word */
  var says=$$('.say').map(function(el){
    if(fx)(function wrap(n){[].slice.call(n.children).forEach(wrap);[].slice.call(n.childNodes).forEach(function(t){
      if(t.nodeType!==3||!t.textContent.trim())return;var fr=document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;if(/^\s+$/.test(w)){fr.appendChild(document.createTextNode(w));return}
        var s=document.createElement('span');s.className='w';s.textContent=w;fr.appendChild(s)});n.replaceChild(fr,t)})})(el);
    return {el:el,w:$$('.w',el)}});
  var tls=$$('.tline'),pxs=$$('[data-px]'),bls=$$('.bleed img');
  pxs.forEach(function(e){e._k=parseFloat(e.getAttribute('data-px'))||0});

  var ticking=false;
  function upd(){ticking=false;var vh=innerHeight;
    if(hd)hd.classList.toggle('down',scrollY>24);
    stories.forEach(function(s){var best=s.cur,bd=1e9;s.beats.forEach(function(b,i){var r=b.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vh*.5);if(d<bd){bd=d;best=i}});if(best!==s.cur)setStory(s,best)});
    if(!fx)return;
    says.forEach(function(s){var r=s.el.getBoundingClientRect(),p=(vh*.9-r.top)/(r.height+vh*.45);p=Math.max(0,Math.min(1,p));
      var k=p*(s.w.length+3);s.w.forEach(function(w,i){var o=Math.max(0,Math.min(1,k-i));w.style.opacity=(.14+.86*o).toFixed(3)})});
    tls.forEach(function(t){var r=t.getBoundingClientRect(),p=(vh*.72-r.top)/r.height;t.style.setProperty('--p',Math.max(0,Math.min(1,p)).toFixed(4))});
    pxs.forEach(function(e){var r=e.getBoundingClientRect();if(r.bottom<-300||r.top>vh+300)return;e.style.translate='0 '+(-(r.top+r.height/2-vh/2)*e._k).toFixed(1)+'px'});
    bls.forEach(function(i){var b=i.parentNode.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;var y=-(b.top+b.height/2-vh/2)*.1,m=b.height*.065;i.style.translate='0 '+Math.max(-m,Math.min(m,y)).toFixed(1)+'px'})}
  function req(){if(!ticking){ticking=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',req,{passive:true});addEventListener('resize',req);upd();

  /* highlights count up once, as they arrive */
  function count(e){var n=+e.getAttribute('data-n'),t0=0;function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/1800);e.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}requestAnimationFrame(f)}

  /* horses: All, For sale, For lease */
  var tabs=document.querySelectorAll('[data-f]');
  [].forEach.call(tabs,function(t){t.addEventListener('click',function(){var f=t.getAttribute('data-f');
    [].forEach.call(tabs,function(x){x.setAttribute('aria-pressed',x===t?'true':'false')});
    [].forEach.call(document.querySelectorAll('.hc'),function(c){var on=f==='all'||c.getAttribute('data-s')===f;c.classList.toggle('off',!on)})})});

  var els=$$('.rv,.rule,.bleed,.fr,[data-n]');
  if(!fx){root.classList.remove('js');els.forEach(function(e){e.classList.add('in')});return}
  $$('[data-n]').forEach(function(e){e.textContent='0'});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target;t.classList.add('in');if(t.hasAttribute('data-n'))count(t);io.unobserve(t)}})},{rootMargin:'0px 0px -12% 0px',threshold:.01});
  /* the page head comes in on load, in order; everything below waits for the scroll */
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    els.forEach(function(e){if(e.closest('.ph'))e.classList.add('in');else io.observe(e)})})});
})();

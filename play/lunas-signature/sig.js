/* Luna's Café, Signature: shared nav, footer, data, order hand-off, bag and reveals */
(function(){
var D=document,W=window;
var RM=W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- data ---------- */
var MENU=[
 {id:'crescent',name:'Crescent Latte',line:'Brown butter, sea salt',price:6.25,cat:'Coffee',img:'latte',long:'Our house latte. Double ristretto, milk steamed to silk, a whisper of brown butter and flaky salt.'},
 {id:'cappuccino',name:'Cappuccino',line:'Equal parts, dry foam',price:5.00,cat:'Coffee',img:'cappuccino',long:'Espresso, milk and foam in equal thirds. Dry, light and properly Italian.'},
 {id:'flatwhite',name:'Flat White',line:'Ristretto, silk milk',price:5.25,cat:'Coffee',img:'flatwhite',long:'Two short ristretto shots under a thin layer of microfoam. Strong and smooth.'},
 {id:'espresso',name:'Espresso',line:'House blend, double',price:3.50,cat:'Coffee',img:'espresso',long:'Eclipse blend pulled as a double. Dark chocolate, cedar and a long finish.'},
 {id:'moonlight',name:'Moonlight Cold Brew',line:'Vanilla bean cold foam',price:5.75,cat:'Cold',img:'coldbrew',long:'Steeped twenty hours, poured over clear ice and crowned with vanilla bean cold foam.'},
 {id:'matcha',name:'Ceremonial Matcha',line:'Oat milk, honey',price:6.00,cat:'Cold',img:'matcha',long:'Stone-ground Uji matcha whisked by hand with oat milk and a ribbon of local honey.'},
 {id:'croissant',name:'Butter Croissant',line:'Laminated in house',price:4.25,cat:'Bakery',img:'croissant',long:'Three days from dough to oven. Eighty-one layers of cultured butter.'},
 {id:'painchoc',name:'Pain au Chocolat',line:'Dark chocolate batons',price:4.75,cat:'Bakery',img:'painchoc',long:'Our croissant dough wrapped around two batons of seventy percent chocolate.'},
 {id:'cookie',name:'Midnight Cookie',line:'Dark chocolate, flaky salt',price:3.75,cat:'Bakery',img:'cookie',long:'Brown butter dough, chopped dark chocolate, baked soft and finished with salt.'},
 {id:'toast',name:'Avocado Toast',line:'Sourdough, chili crisp',price:12.00,cat:'Kitchen',img:'toast',long:'Toasted country sourdough, smashed avocado, lemon, herbs and house chili crisp.'}
];
var SHOP=[
 {id:'moonrise',name:'Moonrise',line:'Ethiopia Guji. Bergamot, peach, jasmine.',tag:'Light roast',price:22,img:'bag-moonrise',fb:'beans'},
 {id:'firstlight',name:'First Light',line:'Colombia Huila. Caramel, red apple, cocoa.',tag:'Medium roast',price:21,img:'bag-firstlight',fb:'beans'},
 {id:'eclipse',name:'Eclipse',line:'Brazil and Sumatra. Dark chocolate, cedar.',tag:'Dark roast',price:20,img:'bag-eclipse',fb:'beans'},
 {id:'mug',name:'The Luna Mug',line:'Stoneware, midnight glaze, ten ounces.',tag:'Home',price:28,img:'mug',fb:'cappuccino'},
 {id:'tote',name:'Moonlight Tote',line:'Heavy canvas, gold crescent.',tag:'Carry',price:24,img:'tote',fb:'interior'},
 {id:'giftbox',name:'Night Owl Box',line:'Two bags, the mug, a tin of cookies.',tag:'Gift',price:72,img:'giftbox',fb:'beans'}
];
var HOURS=[['Mon to Thu','6:30 AM to 9 PM'],['Friday','6:30 AM to 10 PM'],['Sat and Sun','7 AM to 10 PM']];
var PAGES=[['signature-menu.html','Menu','menu'],['signature-story.html','Story','story'],['signature-catering.html','Catering','catering'],['signature-shop.html','Shop','shop'],['signature-offers.html','Offers','offers'],['signature-visit.html','Visit','visit']];
function money(n){return '$'+n.toFixed(2)}
W.Luna={MENU:MENU,SHOP:SHOP,HOURS:HOURS,money:money};

/* ---------- icons ---------- */
var SPRITE='<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'+
 '<mask id="lunaCres" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><circle cx="41" cy="24" r="17" fill="#000"/></mask>'+
 '<mask id="lunaBean" maskUnits="userSpaceOnUse" x="-12" y="-14" width="24" height="28"><ellipse rx="7.2" ry="10.5" fill="#fff"/><path d="M0-9.2C-3-6-3-3 0 0S3 6 0 9.2" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round"/></mask></defs>'+
 '<symbol id="mk" viewBox="0 0 64 64"><circle cx="31" cy="33" r="22" fill="currentColor" mask="url(#lunaCres)"/><g transform="translate(41 25) rotate(38)"><ellipse rx="7.2" ry="10.5" fill="currentColor" mask="url(#lunaBean)"/></g></symbol>'+
 '<symbol id="arr" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>'+
 '<symbol id="x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>'+
 '<symbol id="star" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" fill="currentColor"/></symbol>'+
 '<symbol id="pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>'+
 '<symbol id="bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>'+
 '<symbol id="plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>'+
 '<symbol id="minus" viewBox="0 0 24 24"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>'+
 '<symbol id="clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>'+
 '</svg>';
function ic(id){return '<svg aria-hidden="true"><use href="#'+id+'"/></svg>'}
W.Luna.ic=ic;

var page=D.body.getAttribute('data-page')||'';
var brand='<a class="brand" href="signature.html" aria-label="Luna\'s Café home">'+ic('mk')+'<span><b>LUNA\'S</b><small>CAFÉ</small></span></a>';

/* ---------- nav ---------- */
var navHost=D.querySelector('[data-nav]');
if(navHost){
  var links=PAGES.map(function(p){return '<a href="'+p[0]+'"'+(p[2]===page?' aria-current="page"':'')+'>'+p[1]+'</a>'}).join('');
  var bagBtn=page==='shop'?'<button class="bagbtn btn ghost" data-bag-open type="button" aria-label="Bag">'+ic('bag')+'<b data-bag-n hidden>0</b></button>':'';
  navHost.outerHTML='<nav class="nav" id="nav"><div class="wrap">'+brand+'<div class="links">'+links+'</div>'+bagBtn+
    '<button class="btn" data-order type="button">Order ahead</button>'+
    '<button class="burger" type="button" aria-label="Menu"><i></i><i></i></button></div></nav>'+
    '<div class="sheet">'+PAGES.map(function(p,i){return '<a class="big" style="transition-delay:'+(.05*i+.1)+'s" href="'+p[0]+'">'+p[1]+'</a>'}).join('')+
    '<button class="btn" data-order type="button">Order ahead</button></div>';
}
D.body.insertAdjacentHTML('afterbegin',SPRITE);
var nav=D.getElementById('nav');
var burger=D.querySelector('.burger');
if(burger)burger.addEventListener('click',function(){D.documentElement.classList.toggle('menu-open')});
D.addEventListener('click',function(e){if(e.target.closest('.sheet a, .sheet .btn'))D.documentElement.classList.remove('menu-open')});
function onScroll(){if(nav)nav.classList.toggle('solid',scrollY>40||D.body.hasAttribute('data-solid'))}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- footer ---------- */
var footHost=D.querySelector('[data-foot]');
if(footHost){
  footHost.outerHTML='<footer class="foot"><div class="wrap">'+
   '<div class="rv" style="display:flex;justify-content:space-between;align-items:flex-end;gap:32px;flex-wrap:wrap"><p class="big">Brewed by<br><em>moonlight.</em></p><button class="btn" data-order type="button">Order ahead '+ic('arr')+'</button></div>'+
   '<div class="cols">'+
    '<div><h4>Find us</h4><p>Clematis Street<br>West Palm Beach, Florida</p><p style="margin-top:10px"><a href="signature-visit.html" style="color:var(--sgold)">Directions</a></p></div>'+
    '<div><h4>Hours</h4><div class="hours">'+HOURS.map(function(h){return '<p>'+h[0]+'</p><p class="num">'+h[1]+'</p>'}).join('')+'</div></div>'+
    '<div><h4>Explore</h4><ul>'+PAGES.map(function(p){return '<li><a href="'+p[0]+'">'+p[1]+'</a></li>'}).join('')+'</ul></div>'+
    '<div><h4>Moon Club</h4><p>Every tenth cup is on us, plus first word on new roasts.</p><form class="join" data-join><input type="email" required placeholder="Email address" aria-label="Email address"><button type="submit">Join</button></form></div>'+
   '</div>'+
   '<div class="fine"><span>&copy; 2026 Luna\'s Café</span><span>Concept by Abrams Design Studio</span></div>'+
  '</div></footer>';
}
D.addEventListener('submit',function(e){
  var f=e.target;
  if(f.hasAttribute('data-join')){e.preventDefault();var b=f.querySelector('button'),i=f.querySelector('input');b.textContent='Welcome';i.value='';i.placeholder='You\'re on the list';i.disabled=true;b.disabled=true;return}
  if(f.hasAttribute('data-form')){e.preventDefault();var s=D.getElementById(f.getAttribute('data-form'));f.style.display='none';if(s){s.classList.add('on');s.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})}}
});

/* ---------- image fallbacks ---------- */
function fb(img){
  img.addEventListener('error',function(){
    var f=img.getAttribute('data-fb');
    if(f&&img.getAttribute('src').indexOf(f)<0){img.src=f.indexOf('/')>=0||f.indexOf('.')>=0?f:'img/'+f+'.webp';return}
    img.style.visibility='hidden';if(img.parentNode)img.parentNode.classList.add('ph-fb');
  });
}
[].forEach.call(D.querySelectorAll('img'),fb);
W.Luna.fb=fb;


/* ---------- printed labels on the plain bean bags ---------- */
function labels(root){
  [].forEach.call((root||D).querySelectorAll('img[data-label]:not([data-l])'),function(img){
    img.setAttribute('data-l','1');var p=img.getAttribute('data-label').split('|'),ink=p[2]==='ink';
    var col=ink?'#2a2016':'#E8B84A',col2=ink?'#2a2016':'#F3ECDF';
    var sc=D.createElement('div');sc.className='sc';img.parentNode.insertBefore(sc,img);sc.appendChild(img);
    sc.insertAdjacentHTML('beforeend','<svg class="lbl'+(ink?' ink':'')+'" viewBox="0 0 100 132" aria-hidden="true">'+
      '<use href="#mk" x="39" y="4" width="22" height="22" style="color:'+col+'"/>'+
      '<text x="50" y="42" text-anchor="middle" fill="'+col2+'" font-family="Syne,sans-serif" font-weight="800" font-size="10.5" letter-spacing=".5">LUNA\'S</text>'+
      '<line x1="42" x2="58" y1="51" y2="51" stroke="'+col+'" stroke-width=".7"/>'+
      '<text x="50" y="72" text-anchor="middle" fill="'+col2+'" font-family="Bodoni Moda,serif" font-style="italic" font-size="15">'+p[0]+'</text>'+
      '<text x="50" y="88" text-anchor="middle" fill="'+col+'" font-family="Manrope,sans-serif" font-weight="700" font-size="5.2" letter-spacing="1.6">'+p[1].toUpperCase()+'</text>'+
      '<text x="50" y="122" text-anchor="middle" fill="'+col2+'" opacity=".75" font-family="Manrope,sans-serif" font-weight="600" font-size="4.4" letter-spacing="1.3">12 OZ  ·  WHOLE BEAN</text></svg>');
  });
}
labels();W.Luna.labels=labels;

/* ---------- reveals ---------- */
var io='IntersectionObserver' in W?new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08}):null;
function watch(root){[].forEach.call((root||D).querySelectorAll('.rv:not(.in)'),function(el){io?io.observe(el):el.classList.add('in')})}
W.Luna.watch=watch;watch();
var hero=D.querySelector('.hero');
if(hero)requestAnimationFrame(function(){requestAnimationFrame(function(){hero.classList.add('in')})});

/* ---------- order hand-off: Signature links into the ordering Luna's already runs ---------- */
var css=D.createElement('style');
css.textContent=
'.ho{position:absolute;inset:0;display:flex;flex-direction:column;overflow:auto;-webkit-overflow-scrolling:touch}'+
'.ho .top{position:relative;height:250px;flex:none;overflow:hidden}'+
'.ho .top img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}'+
'.ho .top::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,15,28,.2),rgba(13,15,28,0) 40%,var(--night))}'+
'.ho .top .t{position:absolute;left:30px;bottom:6px;z-index:1}'+
'.ho .top svg.m{width:30px;height:30px;color:var(--gold);display:block;margin-bottom:14px}'+
'.ho .in{padding:20px 30px 30px;display:flex;flex-direction:column;gap:26px;flex:1}'+
'.ho .live{display:flex;gap:22px;font:600 13px/1 var(--sans);color:rgba(243,236,223,.8)}'+
'.ho .live span{display:flex;align-items:center;gap:9px}'+
'.ho .dot{width:7px;height:7px;border-radius:50%;background:#7fd19b;box-shadow:0 0 0 0 rgba(127,209,155,.5);animation:pulse 2.4s infinite}'+
'@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(127,209,155,.5)}70%{box-shadow:0 0 0 9px rgba(127,209,155,0)}100%{box-shadow:0 0 0 0 rgba(127,209,155,0)}}'+
'.ho .live svg{width:15px;height:15px;color:var(--sgold)}'+
'.ho h5{margin:0 0 4px;font:700 10.5px/1 var(--sans);letter-spacing:.26em;text-transform:uppercase;color:var(--sgold)}'+
'.ho .it{display:grid;grid-template-columns:58px 1fr auto;gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}'+
'.ho .it img{width:58px;height:58px;border-radius:50%;object-fit:cover}'+
'.ho .it b{display:block;font:400 19px/1.2 var(--serif)}'+
'.ho .it small{display:block;margin-top:4px;font-size:12.5px;color:var(--muted)}'+
'.ho .it .p{font:600 14px/1 var(--sans);font-variant-numeric:tabular-nums}'+
'.ho .it.out{opacity:.5}.ho .it.out .p{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}'+
'.ho .go{display:flex;flex-direction:column;gap:10px;margin-top:auto}'+
'.ho .go .btn{width:100%;height:56px;position:relative;overflow:hidden}'+
'.ho .go .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
'.ho .go .row .btn{height:50px}'+
'.ho .btn .bar{position:absolute;left:0;bottom:0;height:2px;width:0;background:currentColor;opacity:.5}'+
'.ho .btn.wait .bar{width:100%;transition:width 1.3s var(--ease)}'+
'.sq{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:5px;border:1.6px solid currentColor}'+
'.sq i{width:7px;height:7px;border-radius:1.5px;background:currentColor}';
D.head.appendChild(css);

var op=D.createElement('div');op.className='op';op.setAttribute('aria-hidden','true');
function nowOpen(){
  var d=new Date(),day=d.getDay(),h=d.getHours()+d.getMinutes()/60;
  var open=day===0||day===6?7:6.5,close=day===5||day===6||day===0?22:21;
  if(h>=open&&h<close)return 'Open until '+(close-12)+' PM';
  var nd=h>=close?(day+1)%7:day;return 'Opens '+(nd===0||nd===6?'7':'6:30')+' AM';
}
function itemRow(id,out){var m=MENU.filter(function(x){return x.id===id})[0];
  return '<div class="it'+(out?' out':'')+'"><img src="img/'+m.img+'.webp" alt=""><div><b>'+m.name+'</b><small>'+m.line+'</small></div><span class="p">'+(out?'Sold out':money(m.price))+'</span></div>'}
op.innerHTML='<div class="scrim" data-close></div><div class="box" role="dialog" aria-label="Order ahead"><button class="x" data-close aria-label="Close">'+ic('x')+'</button>'+
 '<div class="ho"><div class="top"><img src="img/latteart.webp" alt=""><div class="t">'+ic('mk').replace('<svg','<svg class="m"')+'<h3 class="h-m">Order <em>ahead.</em></h3></div></div>'+
 '<div class="in"><div class="live"><span><i class="dot"></i>Bar wait <b class="num" data-wait>6 min</b></span><span>'+ic('clock')+'<span data-hours></span></span></div>'+
 '<div><h5>Tonight\'s favorites</h5>'+itemRow('crescent')+itemRow('moonlight')+itemRow('croissant')+itemRow('painchoc',true)+'</div>'+
 '<div class="go"><a class="btn" href="#" data-hand="Square"><span class="sq"><i></i></span>Order on Square<span class="bar"></span></a>'+
 '<div class="row"><a class="btn ghost" href="#" data-hand="DoorDash">DoorDash<span class="bar"></span></a><a class="btn ghost" href="#" data-hand="Uber Eats">Uber Eats<span class="bar"></span></a></div></div>'+
 '</div></div></div>';
D.body.appendChild(op);
[].forEach.call(op.querySelectorAll('img'),fb);
var lastFocus=null;
function openOrder(){lastFocus=D.activeElement;var hr=nowOpen();op.querySelector('[data-hours]').textContent=hr;
  var wt=op.querySelector('[data-wait]');wt.parentNode.style.display=/^Open until/.test(hr)?'':'none';
  wt.textContent=(4+Math.floor(Math.random()*5))+' min';
  op.classList.add('on');op.setAttribute('aria-hidden','false');D.documentElement.classList.remove('menu-open');
  setTimeout(function(){var x=op.querySelector('.x');x&&x.focus({preventScroll:true})},500)}
function closeOrder(){op.classList.remove('on');op.setAttribute('aria-hidden','true');if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
W.Luna.order=openOrder;W.Luna.closeOrder=closeOrder;
D.addEventListener('click',function(e){
  if(e.target.closest('[data-order]')){e.preventDefault();openOrder();return}
  if(e.target.closest('[data-close]')&&e.target.closest('.op')){e.preventDefault();closeOrder();return}
  var h=e.target.closest('[data-hand]');
  if(h){e.preventDefault();if(h.classList.contains('wait'))return;var t=h.childNodes,lab=null;
    for(var i=0;i<t.length;i++)if(t[i].nodeType===3&&t[i].textContent.trim()){lab=t[i];break}
    var was=lab?lab.textContent:'';h.classList.add('wait');if(lab)lab.textContent='Opening '+h.getAttribute('data-hand');
    setTimeout(function(){h.classList.remove('wait');if(lab)lab.textContent=was},1700)}
});
addEventListener('keydown',function(e){if(e.key==='Escape'){if(op.classList.contains('on'))closeOrder();D.documentElement.classList.remove('menu-open');W.Luna.closeBag&&W.Luna.closeBag()}});
})();

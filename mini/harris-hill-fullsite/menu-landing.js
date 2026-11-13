/* The menu sheet: built once, shared by the ride and every page. */
(function(){
  var here=(location.pathname.split('/').pop()||'index.html').replace(/^$/,'index.html');
  var L=[['index.html','The ride','Home'],['programs.html','Programs','Lessons and training'],['horses.html','Horses','For sale and lease'],
         ['boarding.html','Boarding','The farm'],['shows.html','Shows','Calendar and results'],['inquire.html','Inquire','Book a lesson or a viewing']];
  var m=document.createElement('nav');m.className='mn';m.id='mn';m.setAttribute('aria-label','Site');
  m.innerHTML='<div class="wrap mn-in"><ol>'+L.map(function(l,k){var cur=here===l[0]||(l[0]==='horses.html'&&/^horse-/.test(here));
    return '<li style="--k:'+k+'"><a href="https://abramsdesign.studio/harris-hillfullsite/'+l[0]+'"'+(cur?' aria-current="page"':'')+'><b>'+l[1]+'</b><span>'+l[2]+'</span></a></li>'}).join('')+
    '</ol><div class="mn-ft"><span>Harris Hill Farm, Palm Beach Point, Wellington, Florida</span><a href="https://www.instagram.com/harris_hill_farm/" target="_blank" rel="noopener">@harris_hill_farm</a></div></div>';
  document.body.appendChild(m);
  var b=document.querySelector('.mn-btn'),root=document.documentElement;if(!b)return;
  b.setAttribute('aria-controls','mn');b.setAttribute('aria-expanded','false');m.setAttribute('inert','');
  function set(o){root.classList.toggle('mn-open',o);b.setAttribute('aria-expanded',o?'true':'false');if(o)m.removeAttribute('inert');else m.setAttribute('inert','');
    var t=b.querySelector('b');if(t)t.textContent=o?'Close':'Menu'}
  b.addEventListener('click',function(){set(!root.classList.contains('mn-open'))});
  addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  m.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.getAttribute('href')===here)set(false)});
})();
